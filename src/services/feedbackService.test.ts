import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
    auth: { getUser: vi.fn(() => ({ data: { user: null } })) },
  },
  isSupabaseConfigured: true,
}));

import { submitAnalysisFeedback, submitProductFeedback } from './feedbackService';

describe('feedbackService', () => {
  it('submitAnalysisFeedback returns true on success', async () => {
    expect(await submitAnalysisFeedback('a-123', true)).toBe(true);
  });

  it('submitProductFeedback returns true on success', async () => {
    expect(await submitProductFeedback('a-123', 'p-456', true)).toBe(true);
  });
});
