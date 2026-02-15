import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { StyleVersions } from '@/types';
import type { NormalizedMetrics } from '@/components/charts/normalizeMetrics';
import { applyMetricsShift } from '@/components/charts/normalizeMetrics';

interface PdfStyleVariationsProps {
  styleVersions: StyleVersions;
  userMetrics: NormalizedMetrics;
}

const METRIC_KEYS = ['VW', 'CT', 'MF', 'LS', 'HI'] as const;

/** Version config: label, accent color for shifted radar, intensity label color */
const VERSION_CONFIG = {
  daily: { label: 'Daily', accentStroke: '#00D4FF', accentFill: '#00D4FF' },
  office: { label: 'Office', accentStroke: '#FFD700', accentFill: '#FFD700' },
  glam: { label: 'Glam', accentStroke: '#FF4444', accentFill: '#FF4444' },
} as const;

const INTENSITY_LABEL: Record<string, string> = {
  light: 'Light Touch',
  medium: 'Medium Build',
  full: 'Full Glam',
};

const COLUMN_STYLE = {
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex' as const,
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  gap: 12,
  padding: '12px 8px',
};

const CHIP_STYLE = {
  display: 'inline-block' as const,
  padding: '3px 10px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  fontFamily: 'monospace',
  fontSize: 9,
  color: 'rgba(255,255,255,0.7)',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  maxWidth: 200,
};

/** Mini radar chart with user (pink) + shifted (accent) overlay */
function MiniRadar({
  userMetrics,
  shiftedMetrics,
  accentStroke,
  accentFill,
  size = 120,
}: {
  userMetrics: NormalizedMetrics;
  shiftedMetrics: NormalizedMetrics;
  accentStroke: string;
  accentFill: string;
  size?: number;
}) {
  const data = METRIC_KEYS.map((key) => ({
    metric: key,
    user: userMetrics[key],
    shifted: shiftedMetrics[key],
  }));

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#ffffff15" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#ffffff80', fontSize: 8, fontFamily: 'monospace' }}
          />
          <Radar
            name="Current"
            dataKey="user"
            stroke="#FF2D9B"
            fill="#FF2D9B"
            fillOpacity={0.2}
            strokeWidth={1.5}
          />
          <Radar
            name="Shifted"
            dataKey="shifted"
            stroke={accentStroke}
            fill={accentFill}
            fillOpacity={0.25}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** PDF Page 7 -- Style Variations: 3-column layout with Daily/Office/Glam */
const PdfStyleVariations = ({ styleVersions, userMetrics }: PdfStyleVariationsProps) => {
  const versions = (['daily', 'office', 'glam'] as const).map((key) => {
    const version = styleVersions[key];
    const config = VERSION_CONFIG[key];
    const shifted = applyMetricsShift(userMetrics, version.metricsShift);
    return { key, version, config, shifted };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#F0F0F0',
            margin: '0 0 4px 0',
          }}
        >
          Style Variations
        </h2>
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
          }}
        >
          Daily / Office / Glam — Tailored to Your Metrics
        </p>
      </div>

      {/* 3-column layout */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          width: '100%',
        }}
      >
        {versions.map(({ key, version, config, shifted }) => (
          <div
            key={key}
            style={{
              ...COLUMN_STYLE,
              background: '#1A1A2E',
              borderRadius: 12,
              border: `1px solid ${config.accentStroke}30`,
            }}
          >
            {/* Version name */}
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 700,
                color: config.accentStroke,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {config.label}
            </span>

            {/* Intensity badge */}
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 10px',
                borderRadius: 10,
                background: `${config.accentStroke}15`,
                border: `1px solid ${config.accentStroke}30`,
              }}
            >
              {INTENSITY_LABEL[version.intensity] ?? version.intensity}
            </span>

            {/* Mini radar */}
            <MiniRadar
              userMetrics={userMetrics}
              shiftedMetrics={shifted}
              accentStroke={config.accentStroke}
              accentFill={config.accentFill}
              size={120}
            />

            {/* Key Products chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              {version.keyProducts.slice(0, 4).map((product) => (
                <span key={product} style={CHIP_STYLE}>
                  {product}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfStyleVariations;
