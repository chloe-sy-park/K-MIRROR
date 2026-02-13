import { analyzeKBeauty, AnalysisError } from './geminiService';
import { DEMO_RESULT } from '@/data/demoResult';
import type { UserPreferences } from '@/types';

const defaultPrefs: UserPreferences = {
  environment: 'Office',
  skill: 'Beginner',
  mood: 'Natural',
};

// Helper: mock successful Edge Function response
function okResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  };
}

// Helper: mock error Edge Function response
function errorResponse(status: number, error: string) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ error }),
  };
}

describe('geminiService', () => {
  let timeOffset = 0;
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset();
    globalThis.fetch = mockFetch;
    // Advance system time by 61s per test to reset the rate limiter window
    timeOffset += 61_000;
    vi.setSystemTime(new Date(Date.now() + timeOffset));
    // Set Supabase env vars
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  describe('analyzeKBeauty', () => {
    it('throws API error when Supabase not configured', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      await expect(
        analyzeKBeauty('img1', 'img2', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'API' });
    });

    it('returns validated result on success', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      const result = await analyzeKBeauty('img1', 'img2', false, defaultPrefs);
      expect(result.tone.melaninIndex).toBe(5);
      expect(result.kMatch.celebName).toBe('Wonyoung (IVE)');
    });

    it('throws VALIDATION when response does not match Zod schema', async () => {
      mockFetch.mockResolvedValue(okResponse({ tone: { melaninIndex: 999 } }));
      await expect(
        analyzeKBeauty('img1', 'img2', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'VALIDATION' });
    });

    it('throws NETWORK error on fetch failures', async () => {
      vi.useRealTimers();
      mockFetch.mockRejectedValue(new Error('fetch failed'));
      await expect(
        analyzeKBeauty('img1', 'img2', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'NETWORK' });
    }, 10_000);

    it('throws ABORTED when signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(
        analyzeKBeauty('img1', 'img2', false, defaultPrefs, undefined, controller.signal),
      ).rejects.toMatchObject({ code: 'ABORTED' });
    });

    it('sends correct request body with selectedCelebName', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      await analyzeKBeauty('img1', 'img2', false, defaultPrefs, 'Jisoo');
      expect(mockFetch).toHaveBeenCalledOnce();
      const callArgs = mockFetch.mock.calls[0]!;
      const body = JSON.parse(callArgs[1].body);
      expect(body.selectedCelebName).toBe('Jisoo');
    });

    it('sends isSensitive in request body', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      await analyzeKBeauty('img1', 'img2', true, defaultPrefs);
      const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
      expect(body.isSensitive).toBe(true);
    });

    it('throws RATE_LIMITED when limit exceeded', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      // First two calls should succeed (rate limit = 2/min)
      await analyzeKBeauty('img1', 'img2', false, defaultPrefs);
      await analyzeKBeauty('img1', 'img2', false, defaultPrefs);
      // Third call should be rate-limited
      await expect(
        analyzeKBeauty('img1', 'img2', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    });

    it('sends correct headers', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      await analyzeKBeauty('img1', 'img2', false, defaultPrefs);
      const [url, options] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://test.supabase.co/functions/v1/analyze-kbeauty');
      expect(options.headers['Authorization']).toBe('Bearer test-anon-key');
      expect(options.headers['apikey']).toBe('test-anon-key');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('handles Edge Function error responses', async () => {
      mockFetch.mockResolvedValue(errorResponse(500, 'Gemini API key not configured'));
      await expect(
        analyzeKBeauty('img1', 'img2', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'API', message: 'Gemini API key not configured' });
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
