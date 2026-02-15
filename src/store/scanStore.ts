import { create } from 'zustand';
import { AnalysisResult, UserPreferences, YouTubeVideo } from '@/types';
import { analyzeKBeauty, analyzeSkin, matchProducts, AnalysisError } from '@/services/geminiService';
import { captureError } from '@/lib/sentry';
import type { MatchedProduct } from '@/services/geminiService';
import { searchYouTubeVideos, isYouTubeConfigured } from '@/services/youtubeService';
import { saveAnalysis, extractProductIds } from '@/services/analysisService';
import { DEMO_RESULT } from '@/data/demoResult';
import { hashInputs, getCachedResult, setCachedResult } from '@/services/cacheService';
import type { CelebProfile } from '@/data/celebGallery';

export type ScanPhase = 'idle' | 'analyzing' | 'result';

interface ScanState {
  phase: ScanPhase;
  userImage: string | null;
  userImageMimeType: string;
  celebImage: string | null;
  celebImageMimeType: string;
  selectedCelebName: string | null;
  targetBoardId: string | null;
  result: AnalysisResult | null;
  analysisId: string | null;
  matchedProducts: MatchedProduct[];
  youtubeVideos: YouTubeVideo[];
  error: string | null;

  setUserImage: (base64: string, mimeType?: string) => void;
  setCelebImage: (base64: string, mimeType?: string) => void;
  setTargetBoard: (boardId: string | null) => void;
  setCelebFromGallery: (celeb: CelebProfile) => Promise<void>;
  analyze: (isSensitive: boolean, prefs: UserPreferences) => Promise<void>;
  demoMode: () => void;
  reset: () => void;
  clearError: () => void;
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

let demoTimer: ReturnType<typeof setTimeout> | null = null;
let analyzeController: AbortController | null = null;

export const useScanStore = create<ScanState>((set, get) => ({
  phase: 'idle',
  userImage: null,
  userImageMimeType: 'image/jpeg',
  celebImage: null,
  celebImageMimeType: 'image/jpeg',
  selectedCelebName: null,
  targetBoardId: null,
  result: null,
  analysisId: null,
  matchedProducts: [],
  youtubeVideos: [],
  error: null,

  setUserImage: (base64, mimeType) => set({ userImage: base64, userImageMimeType: mimeType ?? 'image/jpeg' }),
  setCelebImage: (base64, mimeType) => set({ celebImage: base64, celebImageMimeType: mimeType ?? 'image/jpeg', selectedCelebName: null }),
  setTargetBoard: (boardId) => set({ targetBoardId: boardId }),

  setCelebFromGallery: async (celeb) => {
    set({ selectedCelebName: celeb.name });
    if (!celeb.imageUrl) return;
    try {
      const base64 = await fetchImageAsBase64(celeb.imageUrl);
      set({ celebImage: base64 });
    } catch {
      // CORS or network error — user can still upload manually
      if (import.meta.env.DEV) console.warn(`Could not fetch celeb image for ${celeb.name}`);
    }
  },

  analyze: async (isSensitive, prefs) => {
    const { userImage, userImageMimeType, celebImage, celebImageMimeType, selectedCelebName } = get();
    if (!userImage || !celebImage) return;

    // Check cache for identical inputs
    const cacheKey = hashInputs(userImage, celebImage);
    const cached = getCachedResult<AnalysisResult>(cacheKey);
    if (cached) {
      set({ result: cached, phase: 'result', error: null });
      return;
    }

    // Abort any previous in-flight analysis
    analyzeController?.abort();
    const controller = new AbortController();
    analyzeController = controller;

    try {
      set({ phase: 'analyzing', error: null });

      let res: AnalysisResult;
      let products: MatchedProduct[] = [];

      try {
        // New 2-step pipeline: analyze-skin -> match-products + YouTube in parallel
        res = await analyzeSkin(userImage, celebImage, isSensitive, prefs, selectedCelebName ?? undefined, controller.signal, userImageMimeType, celebImageMimeType);

        if (!controller.signal.aborted) {
          // Phase 2: products + YouTube in parallel
          const [matchedProds, videos] = await Promise.all([
            matchProducts(res.tone, controller.signal),
            (isYouTubeConfigured && res.youtubeSearch?.queries?.length)
              ? searchYouTubeVideos(res.youtubeSearch.queries).catch(() => [] as YouTubeVideo[])
              : Promise.resolve([] as YouTubeVideo[]),
          ]);
          products = matchedProds;
          if (!controller.signal.aborted && videos.length > 0) {
            set({ youtubeVideos: videos });
          }
        }
      } catch (skinErr) {
        // Fallback to legacy analyze-kbeauty endpoint
        if (controller.signal.aborted) throw skinErr;
        if (skinErr instanceof AnalysisError && skinErr.code === 'ABORTED') throw skinErr;
        if (import.meta.env.DEV) console.warn('analyze-skin failed, falling back to analyze-kbeauty:', skinErr);

        res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs, selectedCelebName ?? undefined, controller.signal, userImageMimeType, celebImageMimeType);

        // Legacy YouTube (non-blocking)
        if (isYouTubeConfigured && res.youtubeSearch?.queries?.length) {
          searchYouTubeVideos(res.youtubeSearch.queries).then((videos) => {
            if (!controller.signal.aborted) set({ youtubeVideos: videos });
          }).catch(() => {});
        }
      }

      if (!controller.signal.aborted) {
        set({ result: res, matchedProducts: products, phase: 'result' });

        // Cache the result for identical future inputs
        setCachedResult(cacheKey, res);

        // Save to DB (non-blocking) — analysisId persisted for premium report flow
        const celebId = get().selectedCelebName?.toLowerCase().replace(/\s+/g, '-') ?? null;
        saveAnalysis(res, extractProductIds(products), celebId).then((id) => {
          if (id && !controller.signal.aborted) {
            set({ analysisId: id });
            try { sessionStorage.setItem('k-mirror-analysis-id', id); } catch {}
          }
        }).catch(() => {});
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof Error) captureError(err, { phase: 'analyze' });
      const message = err instanceof AnalysisError
        ? err.message
        : 'An unexpected error occurred. Please try again.';
      set({ phase: 'idle', error: message });
    }
  },

  demoMode: () => {
    // Clear any previous demo timer to prevent race conditions
    if (demoTimer) clearTimeout(demoTimer);
    set({ phase: 'analyzing', error: null });
    demoTimer = setTimeout(() => {
      demoTimer = null;
      set({ result: DEMO_RESULT, phase: 'result' });
    }, 2000);
  },

  reset: () => {
    // Cancel pending demo timer and in-flight analysis
    if (demoTimer) { clearTimeout(demoTimer); demoTimer = null; }
    analyzeController?.abort();
    analyzeController = null;
    set({ result: null, analysisId: null, youtubeVideos: [], matchedProducts: [], phase: 'idle', error: null, selectedCelebName: null, targetBoardId: null, userImageMimeType: 'image/jpeg', celebImageMimeType: 'image/jpeg' });
  },
  clearError: () => set({ error: null }),
}));
