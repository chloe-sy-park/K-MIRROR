import { describe, it, expect } from 'vitest';
import { analysisResultSchema } from './analysisResult';
import { DEMO_RESULT } from '@/data/demoResult';

describe('analysisResultSchema', () => {
  it('validates DEMO_RESULT successfully', () => {
    const result = analysisResultSchema.safeParse(DEMO_RESULT);
    expect(result.success).toBe(true);
  });

  it('fails when tone is missing', () => {
    const { tone: _, ...rest } = DEMO_RESULT;
    const result = analysisResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('fails when sherlock is missing', () => {
    const { sherlock: _, ...rest } = DEMO_RESULT;
    const result = analysisResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('fails when kMatch is missing', () => {
    const { kMatch: _, ...rest } = DEMO_RESULT;
    const result = analysisResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('fails when recommendations is missing', () => {
    const { recommendations: _, ...rest } = DEMO_RESULT;
    const result = analysisResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('validates melanin index as a number', () => {
    const modified = {
      ...DEMO_RESULT,
      tone: { ...DEMO_RESULT.tone, melaninIndex: 'not-a-number' },
    };
    const result = analysisResultSchema.safeParse(modified);
    expect(result.success).toBe(false);
  });

  it('validates products array structure', () => {
    const modified = {
      ...DEMO_RESULT,
      recommendations: {
        ...DEMO_RESULT.recommendations,
        products: [{ name: 'Test' }], // missing required fields
      },
    };
    const result = analysisResultSchema.safeParse(modified);
    expect(result.success).toBe(false);
  });
});
