import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import type { FiveMetrics } from '@/types';
import BeforeAfterPlaceholder from './BeforeAfterPlaceholder';
import MetricBar from './MetricBar';

interface KGlowCardProps {
  userImage: string | null;
  celebName: string;
  matchRate: number;
  fiveMetrics: FiveMetrics | null | undefined;
  analysisNote: string;
  analysisId: string | null;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

/* ── Helpers ───────────────────────────────────────────── */

/** Format a number with an explicit sign prefix. */
const signed = (n: number, suffix = ''): string =>
  `${n >= 0 ? '+' : ''}${n}${suffix}`;

/** Cap a number at a given maximum. */
const cap = (n: number, max = 100): number => Math.min(n, max);

/* ── Metric row derivation ─────────────────────────────── */

interface MetricRow {
  label: string;
  current: string;
  target: string;
  delta: string;
  accent?: string;
}

const deriveMetrics = (m: FiveMetrics | null | undefined): MetricRow[] => {
  if (!m) {
    return [
      { label: 'GLOW', current: '--', target: '--', delta: '--' },
      { label: 'EYE LIFT', current: '--', target: '--', delta: '--' },
      { label: 'HARMONY', current: '--', target: '--', delta: '--' },
      { label: 'MID-FACE', current: '--', target: '--', delta: '--' },
      { label: 'VIS.WEIGHT', current: '--', target: '--', delta: '--' },
    ];
  }

  const glowCurrent = m.luminosity.current;
  const glowTarget = m.luminosity.potential;
  const glowDelta = glowTarget - glowCurrent;

  const eyeCurrent = m.canthalTilt.angleDegrees;
  const eyeTarget = 6; // ideal positive tilt
  const harmCurrent = m.harmonyIndex.overall;
  const harmTarget = cap(harmCurrent + 20);
  const harmDelta = harmTarget - harmCurrent;

  const midCurrent = m.midfaceRatio.ratioPercent;

  const vwCurrent = m.visualWeight.score;
  const vwTarget = cap(vwCurrent + 23);
  const vwDelta = vwTarget - vwCurrent;

  return [
    {
      label: 'GLOW',
      current: String(glowCurrent),
      target: String(glowTarget),
      delta: signed(glowDelta),
    },
    {
      label: 'EYE LIFT',
      current: signed(eyeCurrent, '\u00B0'),
      target: signed(eyeTarget, '\u00B0'),
      delta: 'needed',
      accent: '#00D4FF',
    },
    {
      label: 'HARMONY',
      current: String(harmCurrent),
      target: String(harmTarget),
      delta: signed(harmDelta),
    },
    {
      label: 'MID-FACE',
      current: `${midCurrent}%`,
      target: '33%',
      delta: 'target',
      accent: '#00D4FF',
    },
    {
      label: 'VIS.WEIGHT',
      current: String(vwCurrent),
      target: String(vwTarget),
      delta: signed(vwDelta),
    },
  ];
};

/* ── Component ─────────────────────────────────────────── */

const KGlowCard = forwardRef<HTMLDivElement, KGlowCardProps>(
  (
    {
      userImage,
      celebName,
      matchRate,
      fiveMetrics,
      analysisNote,
      analysisId,
      cardRef,
    },
    ref,
  ) => {
  const { t } = useTranslation();
  const reportUrl = `https://k-mirror.ai/report/${analysisId || 'demo'}`;
  const metrics = deriveMetrics(fiveMetrics);

  // Support both forwarded ref and explicit cardRef prop
  const resolvedRef = (ref as React.RefObject<HTMLDivElement | null>) ?? cardRef ?? null;

  return (
    <div
      ref={resolvedRef}
      className="relative w-full max-w-[400px] mx-auto bg-[#0A0A1A] text-[#F0F0F0] rounded-2xl overflow-hidden border border-[#1A1A2E]"
      style={{ aspectRatio: '9 / 16' }}
    >
      <div className="flex flex-col h-full p-4 gap-3">
        {/* ── Header ──────────────────────────────────── */}
        <p className="font-mono text-[8px] text-[#8B8BA3] tracking-[0.15em] uppercase">
          {t('kglow.archiveLabel', 'K-MIRROR Archive')} : Analysis #
          {analysisId || 'demo'}
        </p>

        {/* ── Before / After image area ───────────────── */}
        <BeforeAfterPlaceholder userImage={userImage} celebName={celebName} />

        {/* ── Target vibe + match rate ────────────────── */}
        <div className="space-y-1.5">
          <h2 className="font-mono text-sm font-bold uppercase tracking-[0.12em]">
            {t('kglow.targetVibe', 'TARGET VIBE')}:{' '}
            <span className="text-[#FF2D9B]">{celebName}</span>
          </h2>

          {/* Match rate row */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#8B8BA3] uppercase tracking-wide">
              {t('kglow.matchRate', 'Match Rate')}: {matchRate}%
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-1.5 rounded-full bg-[#1A1A2E] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${matchRate}%`,
                  background: 'linear-gradient(90deg, #FF2D9B, #00D4FF)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── 5 Metrics ───────────────────────────────── */}
        <div className="rounded-lg border border-[#1A1A2E] bg-[#0E0E20] px-3 py-2">
          {metrics.map((row) => (
            <MetricBar
              key={row.label}
              label={row.label}
              current={row.current}
              target={row.target}
              delta={row.delta}
              accentColor={row.accent}
            />
          ))}
        </div>

        {/* ── KENI's Note ─────────────────────────────── */}
        <div className="space-y-1">
          <p className="font-mono text-[8px] text-[#8B8BA3] uppercase tracking-[0.2em]">
            {t('kglow.note', "KENI's NOTE")}:
          </p>
          <p className="font-mono text-[10px] text-[#F0F0F0]/80 leading-relaxed italic line-clamp-3">
            &ldquo;{analysisNote}&rdquo;
          </p>
        </div>

        {/* ── Footer: QR + CTA ────────────────────────── */}
        <div className="mt-auto flex items-center gap-3 pt-2">
          {/* QR code */}
          <div className="shrink-0 rounded bg-white p-1">
            <QRCodeSVG
              value={reportUrl}
              size={48}
              bgColor="#FFFFFF"
              fgColor="#0A0A1A"
              level="L"
            />
          </div>

          {/* CTA text */}
          <div className="flex-1 space-y-0.5">
            <p className="font-mono text-[9px] font-bold text-[#FF2D9B] uppercase tracking-[0.1em]">
              {t('kglow.getReport', 'GET YOUR FULL REPORT')} {'\u2192'}
            </p>
            <p className="font-mono text-[8px] text-[#8B8BA3] uppercase tracking-[0.15em]">
              {t('kglow.sherlockArchive', 'THE SHERLOCK ARCHIVE')}
            </p>
            <p className="font-mono text-[8px] text-[#8B8BA3]">
              {t('kglow.price', '29,000\u00A0\uC6D0 / $24.99')}
            </p>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────── */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1A1A2E]">
          <span className="font-mono text-[7px] text-[#8B8BA3] tracking-[0.15em]">
            k-mirror.ai
          </span>
          <span className="font-mono text-[7px] text-[#8B8BA3] tracking-[0.1em]">
            #KGLOW #KMIRROR
          </span>
        </div>
      </div>
    </div>
  );
  },
);

KGlowCard.displayName = 'KGlowCard';

export default KGlowCard;
