import { create } from 'zustand';
import { AnalysisResult } from '@/types';
import { analyzeKBeauty } from '@/services/geminiService';
import { DEMO_RESULT } from '@/data/demoResult';

export type ScanPhase = 'idle' | 'analyzing' | 'result';

interface ScanState {
  phase: ScanPhase;
  userImage: string | null;
  celebImage: string | null;
  result: AnalysisResult | null;

  setUserImage: (base64: string) => void;
  setCelebImage: (base64: string) => void;
  analyze: (isSensitive: boolean, prefs: { environment: string; skill: string; mood: string }) => Promise<void>;
  demoMode: () => void;
  reset: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  phase: 'idle',
  userImage: null,
  celebImage: null,
  result: null,

  setUserImage: (base64) => set({ userImage: base64 }),
  setCelebImage: (base64) => set({ celebImage: base64 }),

  analyze: async (isSensitive, prefs) => {
    const { userImage, celebImage } = get();
    if (!userImage || !celebImage) return;
    try {
      set({ phase: 'analyzing' });
      const res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs);
      set({ result: res, phase: 'result' });
    } catch (err) {
      console.error(err);
      set({ phase: 'idle' });
    }
  },

  demoMode: () => {
    set({ phase: 'analyzing' });
    setTimeout(() => {
      set({ result: DEMO_RESULT, phase: 'result' });
    }, 2000);
  },

  reset: () => set({ result: null, phase: 'idle' }),
}));
