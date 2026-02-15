interface MetricBarProps {
  label: string;
  current: string;
  target: string;
  delta: string;
  accentColor?: string;
}

/**
 * MetricBar — A single horizontal metric row for the K-GLOW card.
 *
 * Displays: LABEL  current --> target  (delta)
 */
const MetricBar = ({
  label,
  current,
  target,
  delta,
  accentColor = '#FF2D9B',
}: MetricBarProps) => {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#1A1A2E]/60 last:border-b-0">
      {/* Label */}
      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#8B8BA3] w-[72px] shrink-0">
        {label}
      </span>

      {/* Current → Target */}
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#F0F0F0] tracking-wide">
        <span>{current}</span>
        <span className="text-[#8B8BA3] text-[9px]">{'\u2192'}</span>
        <span>{target}</span>
      </span>

      {/* Delta */}
      <span
        className="text-[10px] font-mono font-bold tracking-wide min-w-[48px] text-right"
        style={{ color: accentColor }}
      >
        {delta}
      </span>
    </div>
  );
};

export default MetricBar;
