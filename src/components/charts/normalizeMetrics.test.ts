import { normalizeMetrics, applyMetricsShift } from './normalizeMetrics';
import type { NormalizedMetrics } from './normalizeMetrics';
import type { FiveMetrics } from '@/types';

const BASE_METRICS: NormalizedMetrics = { VW: 50, CT: 50, MF: 50, LS: 50, HI: 50 };

describe('applyMetricsShift', () => {
  it('applies positive shift correctly', () => {
    const shift = { VW: 10, CT: 5, MF: 15, LS: 20, HI: 8 };
    const result = applyMetricsShift(BASE_METRICS, shift);

    expect(result).toEqual({ VW: 60, CT: 55, MF: 65, LS: 70, HI: 58 });
  });

  it('applies negative shift correctly', () => {
    const shift = { VW: -10, CT: -5, MF: -15, LS: -20, HI: -8 };
    const result = applyMetricsShift(BASE_METRICS, shift);

    expect(result).toEqual({ VW: 40, CT: 45, MF: 35, LS: 30, HI: 42 });
  });

  it('clamps values below 0', () => {
    const shift = { VW: -60, CT: -80, MF: -100, LS: -51, HI: -999 };
    const result = applyMetricsShift(BASE_METRICS, shift);

    expect(result.VW).toBe(0);
    expect(result.CT).toBe(0);
    expect(result.MF).toBe(0);
    expect(result.LS).toBe(0);
    expect(result.HI).toBe(0);
  });

  it('clamps values above 100', () => {
    const shift = { VW: 60, CT: 80, MF: 100, LS: 51, HI: 999 };
    const result = applyMetricsShift(BASE_METRICS, shift);

    expect(result.VW).toBe(100);
    expect(result.CT).toBe(100);
    expect(result.MF).toBe(100);
    expect(result.LS).toBe(100);
    expect(result.HI).toBe(100);
  });

  it('handles zero shift (identity)', () => {
    const shift = { VW: 0, CT: 0, MF: 0, LS: 0, HI: 0 };
    const result = applyMetricsShift(BASE_METRICS, shift);

    expect(result).toEqual(BASE_METRICS);
  });
});

describe('normalizeMetrics', () => {
  const SAMPLE_FIVE: FiveMetrics = {
    visualWeight: { score: 70, eyeWeight: 30, lipWeight: 20, noseWeight: 20, interpretation: 'Test' },
    canthalTilt: { angleDegrees: 5, classification: 'Positive', symmetry: 'Good' },
    midfaceRatio: { ratioPercent: 35, philtrumRelative: 'Average', youthScore: 70 },
    luminosity: { current: 80, potential: 100, textureGrade: 'A' },
    harmonyIndex: { overall: 85, symmetryScore: 90, optimalBalance: 'Good' },
  };

  it('normalizes Visual Weight from score directly', () => {
    const result = normalizeMetrics(SAMPLE_FIVE);
    expect(result.VW).toBe(70);
  });

  it('normalizes Canthal Tilt from angleDegrees (-10..+15 -> 0..100)', () => {
    const result = normalizeMetrics(SAMPLE_FIVE);
    // (5 + 10) / 25 * 100 = 60
    expect(result.CT).toBe(60);
  });

  it('normalizes Mid-face Ratio inversely (25-45% -> 100-0)', () => {
    const result = normalizeMetrics(SAMPLE_FIVE);
    // (45 - 35) / 20 * 100 = 50
    expect(result.MF).toBe(50);
  });

  it('normalizes Luminosity as current/potential ratio', () => {
    const result = normalizeMetrics(SAMPLE_FIVE);
    // 80 / 100 * 100 = 80
    expect(result.LS).toBe(80);
  });

  it('normalizes Harmony Index from overall directly', () => {
    const result = normalizeMetrics(SAMPLE_FIVE);
    expect(result.HI).toBe(85);
  });

  it('returns 50 for Luminosity when potential is 0', () => {
    const zeroPotential: FiveMetrics = {
      ...SAMPLE_FIVE,
      luminosity: { current: 80, potential: 0, textureGrade: 'A' },
    };
    const result = normalizeMetrics(zeroPotential);
    expect(result.LS).toBe(50);
  });

  it('clamps all values to 0-100 range', () => {
    const extreme: FiveMetrics = {
      visualWeight: { score: 150, eyeWeight: 30, lipWeight: 20, noseWeight: 20, interpretation: 'Test' },
      canthalTilt: { angleDegrees: 30, classification: 'Extreme', symmetry: 'Good' },
      midfaceRatio: { ratioPercent: 10, philtrumRelative: 'Short', youthScore: 95 },
      luminosity: { current: 200, potential: 100, textureGrade: 'S' },
      harmonyIndex: { overall: 120, symmetryScore: 100, optimalBalance: 'Perfect' },
    };
    const result = normalizeMetrics(extreme);

    expect(result.VW).toBe(100);
    expect(result.CT).toBe(100);
    expect(result.MF).toBe(100);
    expect(result.LS).toBe(100);
    expect(result.HI).toBe(100);
  });
});
