import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { NormalizedMetrics } from './normalizeMetrics';

interface RadarMetricsChartProps {
  userMetrics: NormalizedMetrics;
  celebMetrics?: NormalizedMetrics;
  size?: number;
}

const METRIC_KEYS = ['VW', 'CT', 'MF', 'LS', 'HI'] as const;

/**
 * 5축 레이더 차트 - 사용자 지표 vs 셀럽 지표 오버레이.
 *
 * 축: VW (Visual Weight), CT (Canthal Tilt), MF (Mid-face Ratio),
 *     LS (Luminosity), HI (Harmony Index)
 */
const RadarMetricsChart = ({ userMetrics, celebMetrics, size = 300 }: RadarMetricsChartProps) => {
  const data = METRIC_KEYS.map((key) => ({
    metric: key,
    user: userMetrics[key],
    celeb: celebMetrics?.[key],
  }));

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'monospace' }}
          />
          <Radar name="You" dataKey="user" stroke="#FF2D9B" fill="#FF2D9B" fillOpacity={0.3} strokeWidth={2} />
          {celebMetrics && (
            <Radar
              name="Celeb"
              dataKey="celeb"
              stroke="#FFD700"
              fill="#FFD700"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarMetricsChart;
