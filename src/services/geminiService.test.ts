import { analyzeKBeauty, analyzeSkin, matchProducts, AnalysisError } from './geminiService';
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

  describe('analyzeSkin', () => {
    it('calls the analyze-skin endpoint with correct URL and headers', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      await analyzeSkin('img1', 'img2', false, defaultPrefs);
      const [url, options] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://test.supabase.co/functions/v1/analyze-skin');
      expect(options.headers['Authorization']).toBe('Bearer test-anon-key');
      expect(options.headers['apikey']).toBe('test-anon-key');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('sends correct request body', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      await analyzeSkin('img1', 'img2', true, defaultPrefs, 'Jisoo');
      const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
      expect(body.userImageBase64).toBe('img1');
      expect(body.celebImageBase64).toBe('img2');
      expect(body.isSensitive).toBe(true);
      expect(body.selectedCelebName).toBe('Jisoo');
    });

    it('returns validated result on success', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      const result = await analyzeSkin('img1', 'img2', false, defaultPrefs);
      expect(result.tone.melaninIndex).toBe(5);
      expect(result.kMatch.celebName).toBe('Wonyoung (IVE)');
    });

    it('throws VALIDATION when response does not match Zod schema', async () => {
      mockFetch.mockResolvedValue(okResponse({ tone: { melaninIndex: 999 } }));
      await expect(
        analyzeSkin('img1', 'img2', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'VALIDATION' });
    });

    it('throws ABORTED when signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(
        analyzeSkin('img1', 'img2', false, defaultPrefs, undefined, controller.signal),
      ).rejects.toMatchObject({ code: 'ABORTED' });
    });

    it('shares rate limiter with analyzeKBeauty', async () => {
      mockFetch.mockResolvedValue(okResponse(DEMO_RESULT));
      // First two calls consume the rate limit
      await analyzeSkin('img1', 'img2', false, defaultPrefs);
      await analyzeSkin('img1', 'img2', false, defaultPrefs);
      // Third call should be rate-limited
      await expect(
        analyzeSkin('img1', 'img2', false, defaultPrefs),
      ).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    });
  });

  describe('matchProducts', () => {
    const skinProfile = DEMO_RESULT.tone;

    it('calls the match-products endpoint with correct URL', async () => {
      mockFetch.mockResolvedValue(okResponse([]));
      await matchProducts(skinProfile);
      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://test.supabase.co/functions/v1/match-products');
    });

    it('sends skinProfile in request body', async () => {
      mockFetch.mockResolvedValue(okResponse([]));
      await matchProducts(skinProfile);
      const body = JSON.parse(mockFetch.mock.calls[0]![1].body);
      expect(body.skinProfile.melaninIndex).toBe(5);
      expect(body.skinProfile.undertone).toBe('Cool');
    });

    it('returns products on success', async () => {
      const mockProducts = [
        { id: '1', brand: 'HERA', name_en: 'Black Cushion', name_ko: '블랙쿠션', category: 'base', subcategory: null, melanin_min: 4, melanin_max: 6, undertones: ['Cool'], skin_types: ['combination'], concerns: [], ingredients: [], shade_hex: '#6B4226', price_usd: 45, image_url: null, affiliate_url: null, safety_rating: 'EWG Green', matchScore: 98 },
      ];
      mockFetch.mockResolvedValue(okResponse(mockProducts));
      const result = await matchProducts(skinProfile);
      expect(result).toHaveLength(1);
      expect(result[0]!.brand).toBe('HERA');
      expect(result[0]!.matchScore).toBe(98);
    });

    it('returns empty array on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));
      const result = await matchProducts(skinProfile);
      expect(result).toEqual([]);
    });

    it('returns empty array on non-ok response', async () => {
      mockFetch.mockResolvedValue(errorResponse(500, 'Internal error'));
      const result = await matchProducts(skinProfile);
      expect(result).toEqual([]);
    });

    it('returns empty array when Supabase is not configured', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      const result = await matchProducts(skinProfile);
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns empty array when response is not an array', async () => {
      mockFetch.mockResolvedValue(okResponse({ error: 'not an array' }));
      const result = await matchProducts(skinProfile);
      expect(result).toEqual([]);
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
