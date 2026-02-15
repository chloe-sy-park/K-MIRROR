import type { ReactNode } from 'react';

interface GapRow {
  metric: string;
  user: number;
  celeb: number;
  gap: number;
}

interface PdfMetricsOverviewProps {
  radarElement: ReactNode;
  gapSummary: GapRow[];
}

const HEADER_CELL_STYLE = {
  fontFamily: 'monospace',
  fontSize: 10,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  padding: '8px 12px',
  textAlign: 'left' as const,
};

const DATA_CELL_STYLE = {
  fontFamily: 'monospace',
  fontSize: 12,
  color: '#F0F0F0',
  padding: '10px 12px',
  borderTop: '1px solid rgba(255,255,255,0.05)',
};

/** PDF 3페이지 — 5축 메트릭 요약 + 갭 테이블 */
const PdfMetricsOverview = ({ radarElement, gapSummary }: PdfMetricsOverviewProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
        5-Axis Metrics Overview
      </h2>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        User vs Celebrity Comparison
      </p>
    </div>

    {/* Radar chart */}
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 280, height: 280 }}>{radarElement}</div>
    </div>

    {/* Gap summary table */}
    <div style={{ background: '#1A1A2E', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={HEADER_CELL_STYLE}>Metric</th>
            <th style={{ ...HEADER_CELL_STYLE, textAlign: 'center' as const }}>You</th>
            <th style={{ ...HEADER_CELL_STYLE, textAlign: 'center' as const }}>Celeb</th>
            <th style={{ ...HEADER_CELL_STYLE, textAlign: 'center' as const }}>Gap</th>
          </tr>
        </thead>
        <tbody>
          {gapSummary.map((row) => {
            const gapColor = row.gap >= 0 ? '#00D4FF' : '#FF2D9B';
            const gapPrefix = row.gap >= 0 ? '+' : '';

            return (
              <tr key={row.metric}>
                <td style={DATA_CELL_STYLE}>{row.metric}</td>
                <td style={{ ...DATA_CELL_STYLE, textAlign: 'center' }}>{row.user}</td>
                <td style={{ ...DATA_CELL_STYLE, textAlign: 'center' }}>{row.celeb}</td>
                <td style={{ ...DATA_CELL_STYLE, textAlign: 'center', color: gapColor, fontWeight: 700 }}>
                  {gapPrefix}
                  {row.gap}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default PdfMetricsOverview;
