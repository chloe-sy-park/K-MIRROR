interface PdfTranslationProps {
  facialVibe: string;
  adaptationLogic: { base: string; lip: string; point: string };
}

const TABLE_HEADER_STYLE = {
  fontFamily: 'monospace',
  fontSize: 10,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  padding: '10px 16px',
  textAlign: 'left' as const,
};

const TABLE_CELL_STYLE = {
  fontSize: 13,
  color: '#F0F0F0',
  padding: '14px 16px',
  lineHeight: 1.6,
  borderTop: '1px solid rgba(255,255,255,0.05)',
  verticalAlign: 'top' as const,
};

const ROW_LABEL_STYLE = {
  fontFamily: 'monospace',
  fontSize: 10,
  color: '#FF2D9B',
  textTransform: 'uppercase' as const,
  padding: '14px 16px',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  verticalAlign: 'top' as const,
  width: 70,
};

const WESTERN_DEFAULTS = {
  base: 'Full-coverage matte foundation with heavy contouring to define bone structure.',
  lip: 'Neutral nudes or bold statement reds with defined lip liner.',
  point: 'Dramatic smoky eye with dark shadow blending and heavy mascara.',
};

/** PDF 6페이지 — K-Translation: 미적 바이브 + 서양 vs K-뷰티 비교 */
const PdfTranslation = ({ facialVibe, adaptationLogic }: PdfTranslationProps) => (
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
        K-Translation
      </h2>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        Your Personalized Style Adaptation
      </p>
    </div>

    {/* Aesthetic vibe */}
    <div
      style={{
        background: '#1A1A2E',
        borderRadius: 12,
        padding: 24,
      }}
    >
      <p
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 8px 0',
        }}
      >
        Your Aesthetic Vibe
      </p>
      <p style={{ fontSize: 24, color: '#FFD700', fontWeight: 700, margin: 0 }}>{facialVibe}</p>
    </div>

    {/* Comparison table */}
    <div style={{ background: '#1A1A2E', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...TABLE_HEADER_STYLE, width: 70 }}>&nbsp;</th>
            <th style={TABLE_HEADER_STYLE}>Western Approach</th>
            <th style={TABLE_HEADER_STYLE}>K-Beauty Approach</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={ROW_LABEL_STYLE}>Base</td>
            <td style={{ ...TABLE_CELL_STYLE, color: 'rgba(255,255,255,0.6)' }}>{WESTERN_DEFAULTS.base}</td>
            <td style={TABLE_CELL_STYLE}>{adaptationLogic.base}</td>
          </tr>
          <tr>
            <td style={ROW_LABEL_STYLE}>Lip</td>
            <td style={{ ...TABLE_CELL_STYLE, color: 'rgba(255,255,255,0.6)' }}>{WESTERN_DEFAULTS.lip}</td>
            <td style={TABLE_CELL_STYLE}>{adaptationLogic.lip}</td>
          </tr>
          <tr>
            <td style={ROW_LABEL_STYLE}>Point</td>
            <td style={{ ...TABLE_CELL_STYLE, color: 'rgba(255,255,255,0.6)' }}>{WESTERN_DEFAULTS.point}</td>
            <td style={TABLE_CELL_STYLE}>{adaptationLogic.point}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default PdfTranslation;
