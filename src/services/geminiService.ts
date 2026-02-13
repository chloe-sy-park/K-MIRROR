import { AnalysisResult, UserPreferences } from "@/types";
import { analysisResultSchema } from "@/schemas/analysisResult";

export type AnalysisErrorCode = 'EMPTY_RESPONSE' | 'VALIDATION' | 'API' | 'NETWORK' | 'TIMEOUT' | 'RATE_LIMITED' | 'ABORTED';

export class AnalysisError extends Error {
  constructor(message: string, public readonly code: AnalysisErrorCode) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// Simple rate limiter: max `limit` calls per `windowMs`
const rateLimiter = {
  timestamps: [] as number[],
  limit: 2,
  windowMs: 60_000,
  check() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.limit) return false;
    this.timestamps.push(now);
    return true;
  },
};

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000];

function isRetryable(err: unknown): boolean {
  if (err instanceof AnalysisError) {
    return err.code === 'NETWORK' || err.code === 'TIMEOUT';
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes('fetch') || msg.includes('network') || msg.includes('429') || msg.includes('500') || msg.includes('503');
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const analyzeKBeauty = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean,
  prefs: UserPreferences,
  selectedCelebName?: string,
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new AnalysisError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local', 'API');
  }

  if (!rateLimiter.check()) {
    throw new AnalysisError('Too many requests. Please wait a moment before scanning again.', 'RATE_LIMITED');
  }

  const makeRequest = async () => {
    if (signal?.aborted) throw new AnalysisError('Analysis was cancelled.', 'ABORTED');

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
    const onAbort = () => timeoutController.abort();
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/analyze-kbeauty`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userImageBase64,
          celebImageBase64,
          isSensitive,
          prefs,
          selectedCelebName,
        }),
        signal: timeoutController.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
        throw new AnalysisError(errBody.error || `Server error: ${res.status}`, 'API');
      }

      return await res.json();
    } catch (err) {
      if (signal?.aborted) throw new AnalysisError('Analysis was cancelled.', 'ABORTED');
      if (timeoutController.signal.aborted && !signal?.aborted) {
        throw new AnalysisError('Analysis timed out. Please try again.', 'TIMEOUT');
      }
      if (err instanceof AnalysisError) throw err;
      if (err instanceof Error && err.message.includes('fetch')) {
        throw new AnalysisError('Network error. Please check your connection.', 'NETWORK');
      }
      throw new AnalysisError(
        err instanceof Error ? err.message : 'Failed to communicate with AI service.',
        'API'
      );
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
    }
  };

  // Retry loop
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await makeRequest();

      const validated = analysisResultSchema.safeParse(response);

      if (!validated.success) {
        console.error('Zod validation errors:', validated.error.issues);
        throw new AnalysisError(
          'AI response did not match expected format. Please try again.',
          'VALIDATION'
        );
      }

      return validated.data;
    } catch (err) {
      lastError = err;
      if (err instanceof AnalysisError && err.code === 'ABORTED') throw err;
      if (attempt < MAX_RETRIES && isRetryable(err)) {
        await sleep(RETRY_DELAYS[attempt]!);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};
