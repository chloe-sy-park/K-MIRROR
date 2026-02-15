import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Legend } from 'recharts';

interface MetricRow {
  label: string;
  current: number;
  target: number;
}

interface MetricBarChartProps {
  metrics: MetricRow[];
  size?: { width: number; height: number };
}

const DEFAULT_SIZE = { width: 400, height: 250 };

/**
 * 수평 바 차트 - 현재값 vs 목표값을 지표별로 비교 표시한다.
 *
 * Current: 핑크(#FF2D9B), Target: 시안(#00D4FF)
 */
const MetricBarChart = ({ metrics, size = DEFAULT_SIZE }: MetricBarChartProps) => {
  return (
    <div style={{ width: size.width, height: size.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metrics} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#ffffff80', fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'monospace' }}
            width={40}
          />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#ffffff80' }} />
          <Bar dataKey="current" name="Current" barSize={8} radius={[0, 4, 4, 0]}>
            {metrics.map((_, i) => (
              <Cell key={`current-${i}`} fill="#FF2D9B" />
            ))}
          </Bar>
          <Bar dataKey="target" name="Target" barSize={8} radius={[0, 4, 4, 0]}>
            {metrics.map((_, i) => (
              <Cell key={`target-${i}`} fill="#00D4FF" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricBarChart;
