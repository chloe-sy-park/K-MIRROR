import type { FiveMetrics } from '@/types';

export interface NormalizedMetrics {
  VW: number;
  CT: number;
  MF: number;
  LS: number;
  HI: number;
}

/** 0-100 범위로 클램핑 */
function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * FiveMetrics 원본 데이터를 레이더/바 차트용 0-100 정규화 값으로 변환한다.
 *
 * - Visual Weight: score 그대로 (0-100)
 * - Canthal Tilt: -10deg..+15deg -> 0..100
 * - Mid-face Ratio: 25%-45% -> 100-0 (반전: 낮은 비율 = 젊음 = 높은 점수)
 * - Luminosity: (current / potential) * 100
 * - Harmony Index: overall 그대로 (0-100)
 */
export function normalizeMetrics(fm: FiveMetrics): NormalizedMetrics {
  const VW = clamp(fm.visualWeight.score);

  const CT = clamp(((fm.canthalTilt.angleDegrees + 10) / 25) * 100);

  const MF = clamp(((45 - fm.midfaceRatio.ratioPercent) / 20) * 100);

  const LS =
    fm.luminosity.potential > 0 ? clamp((fm.luminosity.current / fm.luminosity.potential) * 100) : 50;

  const HI = clamp(fm.harmonyIndex.overall);

  return { VW, CT, MF, LS, HI };
}

export function applyMetricsShift(
  base: NormalizedMetrics,
  shift: { VW: number; CT: number; MF: number; LS: number; HI: number },
): NormalizedMetrics {
  return {
    VW: clamp(base.VW + shift.VW),
    CT: clamp(base.CT + shift.CT),
    MF: clamp(base.MF + shift.MF),
    LS: clamp(base.LS + shift.LS),
    HI: clamp(base.HI + shift.HI),
  };
}
