import { useScanStore } from './scanStore';
import { DEMO_RESULT } from '@/data/demoResult';

// Mock geminiService
const mockAnalyzeKBeauty = vi.fn();
vi.mock('@/services/geminiService', () => ({
  analyzeKBeauty: (...args: unknown[]) => mockAnalyzeKBeauty(...args),
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
      error: null,
    });
    mockAnalyzeKBeauty.mockReset();
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
      expect(mockAnalyzeKBeauty).not.toHaveBeenCalled();
      expect(useScanStore.getState().phase).toBe('idle');
    });

    it('sets result on successful analysis', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb' });
      mockAnalyzeKBeauty.mockResolvedValue(DEMO_RESULT);

      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });

      expect(useScanStore.getState().phase).toBe('result');
      expect(useScanStore.getState().result).toEqual(DEMO_RESULT);
    });

    it('sets error on failed analysis', async () => {
      useScanStore.setState({ userImage: 'user', celebImage: 'celeb' });
      const { AnalysisError } = await import('@/services/geminiService');
      mockAnalyzeKBeauty.mockRejectedValue(new AnalysisError('timeout', 'TIMEOUT'));

      await useScanStore.getState().analyze(false, { environment: 'Office', skill: 'Beginner', mood: 'Natural' });

      expect(useScanStore.getState().phase).toBe('idle');
      expect(useScanStore.getState().error).toBe('timeout');
    });

    it('passes selectedCelebName to analyzeKBeauty', async () => {
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
  });
});
