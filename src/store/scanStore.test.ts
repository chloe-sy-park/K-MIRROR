import { useScanStore } from './scanStore';
import { DEMO_RESULT } from '@/data/demoResult';

// Mock geminiService
const mockAnalyzeKBeauty = vi.fn();
const mockAnalyzeSkin = vi.fn();
const mockMatchProducts = vi.fn();
vi.mock('@/services/geminiService', () => ({
  analyzeKBeauty: (...args: unknown[]) => mockAnalyzeKBeauty(...args),
  analyzeSkin: (...args: unknown[]) => mockAnalyzeSkin(...args),
  matchProducts: (...args: unknown[]) => mockMatchProducts(...args),
  AnalysisError: class extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = 'AnalysisError';
    }
  },
}));

describe('scanStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useScanStore.setState({
      phase: 'idle',
      userImage: null,
      celebImage: null,
      selectedCelebName: null,
      result: null,
      matchedProducts: [],
      error: null,
    });
    mockAnalyzeKBeauty.mockReset();
    mockAnalyzeSkin.mockReset();
    mockMatchProducts.mockReset();
    // By default, analyzeSkin fails so tests go through the fallback path
    // (preserves existing test behavior that relies on analyzeKBeauty)
    mockAnalyzeSkin.mockRejectedValue(new Error('analyze-skin not deployed'));
    mockMatchProducts.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('has correct initial state', () => {
    const state = useScanStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.userImage).toBeNull();
    expect(state.celebImage).toBeNull();
    expect(state.result).toBeNull();
    expect(state.error).toBeNull();
  });

  describe('setUserImage', () => {
    it('sets user image', () => {
      useScanStore.getState().setUserImage('base64data');
      expect(useScanStore.getState().userImage).toBe('base64data');
    });
  });

  describe('setCelebImage', () => {
    it('sets celeb image and clears selectedCelebName', () => {
      useScanStore.setState({ selectedCelebName: 'Jisoo' });
      useScanStore.getState().setCelebImage('celebdata');
      expect(useScanStore.getState().celebImage).toBe('celebdata');
      expect(useScanStore.getState().selectedCelebName).toBeNull();
    });
  });

  describe('demoMode', () => {
    it('sets phase to analyzing then result after timeout', () => {
      useScanStore.getState().demoMode();
      expect(useScanStore.getState().phase).toBe('analyzing');
      expect(useScanStore.getState().result).toBeNull();

      vi.advanceTimersByTime(2000);

      expect(useScanStore.getState().phase).toBe('result');
      expect(useScanStore.getState().result).toEqual(DEMO_RESULT);
    });

    it('clears error when entering demo mode', () => {
      useScanStore.setState({ error: 'some error' });
      useScanStore.getState().demoMode();
      expect(useScanStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all scan state', () => {
      useScanStore.setState({
        phase: 'result',
        result: DEMO_RESULT,
        error: 'err',
        selectedCelebName: 'Jisoo',
      });
      useScanStore.getState().reset();
      const state = useScanStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.result).toBeNull();
      expect(state.error).toBeNull();
      expect(state.selectedCelebName).toBeNull();
    });

    it('cancels demo timer on reset', () => {
      useScanStore.getState().demoMode();
      expect(useScanStore.getState().phase).toBe('analyzing');

      useScanStore.getState().reset();
      vi.advanceTimersByTime(3000);

      expect(useScanStore.getState().phase).toBe('idle');
      expect(useScanStore.getState().result).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears error', () => {
      useScanStore.setState({ error: 'test error' });
      useScanStore.getState().clearError();
      expect(useScanStore.getState().error).toBeNull();
    });
  });

  describe('analyze', () => {
    it('does nothing if images are missing', async () => {
      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });
      expect(mockAnalyzeSkin).not.toHaveBeenCalled();
      expect(mockAnalyzeKBeauty).not.toHaveBeenCalled();
      expect(useScanStore.getState().phase).toBe('idle');
    });

    it('sets result on successful analysis (fallback path)', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb' });
      mockAnalyzeKBeauty.mockResolvedValue(DEMO_RESULT);

      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });

      expect(useScanStore.getState().phase).toBe('result');
      expect(useScanStore.getState().result).toEqual(DEMO_RESULT);
    });

    it('sets error on failed analysis (both paths fail)', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb' });
      const { AnalysisError } = await import('@/services/geminiService');
      mockAnalyzeKBeauty.mockRejectedValue(new AnalysisError('timeout', 'TIMEOUT'));

      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });

      expect(useScanStore.getState().phase).toBe('idle');
      expect(useScanStore.getState().error).toBe('timeout');
    });

    it('passes selectedCelebName to analyzeKBeauty in fallback path', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb', selectedCelebName: 'Jisoo' });
      mockAnalyzeKBeauty.mockResolvedValue(DEMO_RESULT);

      await useScanStore.getState().analyze(true, { environment: 'Studio', skill: 'Pro', mood: 'Powerful' });

      expect(mockAnalyzeKBeauty).toHaveBeenCalledWith(
        'user', 'celeb', true,
        { environment: 'Studio', skill: 'Pro', mood: 'Powerful' },
        'Jisoo',
        expect.any(Object), // AbortSignal
      );
    });

    it('uses 2-step pipeline when analyzeSkin succeeds', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb' });
      mockAnalyzeSkin.mockResolvedValue(DEMO_RESULT);
      const mockProducts = [{ id: '1', brand: 'HERA', matchScore: 98 }];
      mockMatchProducts.mockResolvedValue(mockProducts);

      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });

      expect(mockAnalyzeSkin).toHaveBeenCalled();
      expect(mockMatchProducts).toHaveBeenCalledWith(DEMO_RESULT.tone, expect.any(Object));
      expect(mockAnalyzeKBeauty).not.toHaveBeenCalled();
      expect(useScanStore.getState().phase).toBe('result');
      expect(useScanStore.getState().result).toEqual(DEMO_RESULT);
      expect(useScanStore.getState().matchedProducts).toEqual(mockProducts);
    });

    it('falls back to analyzeKBeauty when analyzeSkin fails', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb' });
      mockAnalyzeSkin.mockRejectedValue(new Error('endpoint not found'));
      mockAnalyzeKBeauty.mockResolvedValue(DEMO_RESULT);

      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });

      expect(mockAnalyzeSkin).toHaveBeenCalled();
      expect(mockAnalyzeKBeauty).toHaveBeenCalled();
      expect(useScanStore.getState().phase).toBe('result');
      expect(useScanStore.getState().result).toEqual(DEMO_RESULT);
      expect(useScanStore.getState().matchedProducts).toEqual([]);
    });

    it('matchedProducts defaults to empty array in fallback path', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb' });
      mockAnalyzeKBeauty.mockResolvedValue(DEMO_RESULT);

      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });

      expect(useScanStore.getState().matchedProducts).toEqual([]);
    });
  });
});
