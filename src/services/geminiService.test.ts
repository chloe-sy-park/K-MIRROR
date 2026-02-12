import { analyzeKBeauty, AnalysisError } from './geminiService';
import type { UserPreferences } from '@/types';
import { DEMO_RESULT } from '@/data/demoResult';

// Override the @google/genai mock from setup.ts with our controllable mock
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: (...args: unknown[]) => mockGenerateContent(...args) };
  },
  Type: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', ARRAY: 'ARRAY', BOOLEAN: 'BOOLEAN' },
}));

const defaultPrefs: UserPreferences = {
  environment: 'Office',
  skill: 'Beginner',
  mood: 'Natural',
};

describe('geminiService', () => {
  let timeOffset = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    mockGenerateContent.mockReset();
    // Advance system time by 61s per test to reset the rate limiter window
    timeOffset += 61_000;
    vi.setSystemTime(new Date(Date.now() + timeOffset));
    // Set API_KEY for tests
    process.env.API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.API_KEY;
    vi.useRealTimers();
  });

  describe('analyzeKBeauty', () => {
    it('throws API error when API key is missing', async () => {
      delete process.env.API_KEY;
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'API' });
    });

    it('returns validated result on success', async () => {
      mockGenerateContent.mockResolvedValue({ text: JSON.stringify(DEMO_RESULT) });
      const result = await analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs);
      expect(result.tone.melaninIndex).toBe(5);
      expect(result.kMatch.celebName).toBe('Wonyoung (IVE)');
    });

    it('throws EMPTY_RESPONSE when AI returns empty text', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' });
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'EMPTY_RESPONSE' });
    });

    it('throws EMPTY_RESPONSE when text is null', async () => {
      mockGenerateContent.mockResolvedValue({ text: null });
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'EMPTY_RESPONSE' });
    });

    it('throws VALIDATION when AI returns invalid JSON', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'not json at all' });
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'VALIDATION' });
    });

    it('throws VALIDATION when Zod schema validation fails', async () => {
      const invalidResult = { tone: { melaninIndex: 999 } };
      mockGenerateContent.mockResolvedValue({ text: JSON.stringify(invalidResult) });
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'VALIDATION' });
    });

    it('throws NETWORK error on fetch failures', async () => {
      // Use real timers — retry delays are 1s+3s, well within the 10s timeout
      vi.useRealTimers();
      mockGenerateContent.mockRejectedValue(new Error('fetch failed'));
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'NETWORK' });
    }, 10_000);

    it('throws ABORTED when signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs, undefined, controller.signal),
      ).rejects.toMatchObject({ code: 'ABORTED' });
    });

    it('passes selectedCelebName to the prompt', async () => {
      mockGenerateContent.mockResolvedValue({ text: JSON.stringify(DEMO_RESULT) });
      await analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs, 'Jisoo');
      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0]![0];
      const textPart = callArgs.contents.parts[0].text;
      expect(textPart).toContain('Jisoo');
    });

    it('includes sensitivity info in prompt', async () => {
      mockGenerateContent.mockResolvedValue({ text: JSON.stringify(DEMO_RESULT) });
      await analyzeKBeauty('userImg', 'celebImg', true, defaultPrefs);
      const callArgs = mockGenerateContent.mock.calls[0]![0];
      const textPart = callArgs.contents.parts[0].text;
      expect(textPart).toContain('Sensitive Skin: Yes');
    });

    it('throws RATE_LIMITED when limit exceeded', async () => {
      mockGenerateContent.mockResolvedValue({ text: JSON.stringify(DEMO_RESULT) });
      // First two calls should succeed (rate limit = 2/min)
      await analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs);
      await analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs);
      // Third call should be rate-limited
      await expect(
        analyzeKBeauty('userImg', 'celebImg', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    });
  });

  describe('AnalysisError', () => {
    it('has correct name and code', () => {
      const err = new AnalysisError('test msg', 'TIMEOUT');
      expect(err.name).toBe('AnalysisError');
      expect(err.code).toBe('TIMEOUT');
      expect(err.message).toBe('test msg');
      expect(err instanceof Error).toBe(true);
    });
  });
});
