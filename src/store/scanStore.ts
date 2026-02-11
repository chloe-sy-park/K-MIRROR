import { create } from 'zustand';
import { AnalysisResult } from '@/types';
import { analyzeKBeauty, AnalysisError } from '@/services/geminiService';
import { DEMO_RESULT } from '@/data/demoResult';

export type ScanPhase = 'idle' | 'analyzing' | 'result';

interface ScanState {
  phase: ScanPhase;
  userImage: string | null;
  celebImage: string | null;
  result: AnalysisResult | null;
  error: string | null;

  setUserImage: (base64: string) => void;
  setCelebImage: (base64: string) => void;
  analyze: (isSensitive: boolean, prefs: { environment: string; skill: string; mood: string }) => Promise<void>;
  demoMode: () => void;
  reset: () => void;
  clearError: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  phase: 'idle',
  userImage: null,
  celebImage: null,
  result: null,
  error: null,

  setUserImage: (base64) => set({ userImage: base64 }),
  setCelebImage: (base64) => set({ celebImage: base64 }),

  analyze: async (isSensitive, prefs) => {
    const { userImage, celebImage } = get();
    if (!userImage || !celebImage) return;
    try {
      set({ phase: 'analyzing', error: null });
      const res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs);
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

  reset: () => set({ result: null, phase: 'idle', error: null }),
  clearError: () => set({ error: null }),
}));
