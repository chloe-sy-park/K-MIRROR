import { create } from 'zustand';
import { AnalysisResult, UserPreferences } from '@/types';
import { analyzeKBeauty, AnalysisError } from '@/services/geminiService';
import { DEMO_RESULT } from '@/data/demoResult';
import type { CelebProfile } from '@/data/celebGallery';

export type ScanPhase = 'idle' | 'analyzing' | 'result';

interface ScanState {
  phase: ScanPhase;
  userImage: string | null;
  celebImage: string | null;
  selectedCelebName: string | null;
  result: AnalysisResult | null;
  error: string | null;

  setUserImage: (base64: string) => void;
  setCelebImage: (base64: string) => void;
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

export const useScanStore = create<ScanState>((set, get) => ({
  phase: 'idle',
  userImage: null,
  celebImage: null,
  selectedCelebName: null,
  result: null,
  error: null,

  setUserImage: (base64) => set({ userImage: base64 }),
  setCelebImage: (base64) => set({ celebImage: base64, selectedCelebName: null }),

  setCelebFromGallery: async (celeb) => {
    set({ selectedCelebName: celeb.name });
    if (!celeb.imageUrl) return;
    try {
      const base64 = await fetchImageAsBase64(celeb.imageUrl);
      set({ celebImage: base64 });
    } catch {
      // CORS or network error — user can still upload manually
      console.warn(`Could not fetch celeb image for ${celeb.name}. User can upload manually.`);
    }
  },

  analyze: async (isSensitive, prefs) => {
    const { userImage, celebImage, selectedCelebName } = get();
    if (!userImage || !celebImage) return;
    try {
      set({ phase: 'analyzing', error: null });
      const res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs, selectedCelebName ?? undefined);
      set({ result: res, phase: 'result' });
    } catch (err) {
      console.error(err);
      const message = err instanceof AnalysisError
        ? err.message
        : 'An unexpected error occurred. Please try again.';
      set({ phase: 'idle', error: message });
    }
  },

  demoMode: () => {
    set({ phase: 'analyzing', error: null });
    setTimeout(() => {
      set({ result: DEMO_RESULT, phase: 'result' });
    }, 2000);
  },

  reset: () => set({ result: null, phase: 'idle', error: null, selectedCelebName: null }),
  clearError: () => set({ error: null }),
}));
