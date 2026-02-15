interface PdfSkeletalProps {
  proportions: { upper: string; middle: string; lower: string };
  eyeAngle: string;
  boneStructure: string;
}

const PANEL_STYLE = {
  background: '#1A1A2E',
  borderRadius: 12,
  padding: 20,
} as const;

const LABEL_STYLE = {
  fontFamily: 'monospace',
  fontSize: 10,
  color: '#FF2D9B',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  margin: '0 0 8px 0',
};

const VALUE_STYLE = {
  fontSize: 14,
  color: '#F0F0F0',
  lineHeight: 1.6,
  margin: 0,
};

/** PDF 2페이지 — 골격 분석 블루프린트 */
const PdfSkeletal = ({ proportions, eyeAngle, boneStructure }: PdfSkeletalProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    {/* Section title */}
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
        Skeletal Blueprint
      </h2>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        Facial Proportion Mapping
      </p>
    </div>

    {/* Proportions grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {(['upper', 'middle', 'lower'] as const).map((zone) => (
        <div key={zone} style={PANEL_STYLE}>
          <p style={LABEL_STYLE}>{zone} third</p>
          <p style={VALUE_STYLE}>{proportions[zone]}</p>
        </div>
      ))}
    </div>

    {/* Eye angle */}
    <div style={PANEL_STYLE}>
      <p style={LABEL_STYLE}>Eye Angle (Canthal Tilt)</p>
      <p style={VALUE_STYLE}>{eyeAngle}</p>
    </div>

    {/* Bone structure */}
    <div style={PANEL_STYLE}>
      <p style={LABEL_STYLE}>Bone Structure</p>
      <p style={VALUE_STYLE}>{boneStructure}</p>
    </div>
  </div>
);

export default PdfSkeletal;
