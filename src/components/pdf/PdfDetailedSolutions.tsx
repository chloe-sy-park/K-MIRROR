import type { StyleVersions } from '@/types';

interface PdfDetailedSolutionsProps {
  styleVersions: StyleVersions;
}

const PANEL_STYLE = {
  background: '#1A1A2E',
  borderRadius: 12,
  padding: 16,
};

const SECTION_LABEL_STYLE = {
  fontFamily: 'monospace',
  fontSize: 10,
  color: '#FF2D9B',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  margin: '0 0 8px 0',
  fontWeight: 700,
};

const BODY_TEXT_STYLE = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  lineHeight: 1.7,
  margin: 0,
};

const VERSION_HEADER_STYLE = {
  fontFamily: 'monospace',
  fontSize: 16,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  margin: '0 0 12px 0',
};

/** Renders a single style version's Base/Eyes/Lips solutions */
function VersionSection({
  label,
  color,
  base,
  eyes,
  lips,
}: {
  label: string;
  color: string;
  base: string;
  eyes: string;
  lips: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ ...VERSION_HEADER_STYLE, color }}>{label}</h3>

      <div style={PANEL_STYLE}>
        <p style={SECTION_LABEL_STYLE}>Base</p>
        <p style={BODY_TEXT_STYLE}>{base}</p>
      </div>

      <div style={PANEL_STYLE}>
        <p style={SECTION_LABEL_STYLE}>Eyes</p>
        <p style={BODY_TEXT_STYLE}>{eyes}</p>
      </div>

      <div style={PANEL_STYLE}>
        <p style={SECTION_LABEL_STYLE}>Lips</p>
        <p style={BODY_TEXT_STYLE}>{lips}</p>
      </div>
    </div>
  );
}

/**
 * PDF Page 8 -- Detailed Solutions for Daily + Office styles.
 * Glam references the full solution pages (9-10).
 *
 * Does NOT include PdfPageShell (pdfService wraps it).
 */
const PdfDetailedSolutions = ({ styleVersions }: PdfDetailedSolutionsProps) => {
  const { daily, office } = styleVersions;

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
          Detailed Solutions
        </h2>
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
          }}
        >
          Daily &amp; Office Step-by-Step
        </p>
      </div>

      {/* Daily section */}
      <VersionSection
        label="Daily"
        color="#00D4FF"
        base={daily.base}
        eyes={daily.eyes}
        lips={daily.lips}
      />

      {/* Office section */}
      <VersionSection
        label="Office"
        color="#FFD700"
        base={office.base}
        eyes={office.eyes}
        lips={office.lips}
      />

      {/* Glam reference note */}
      <div
        style={{
          ...PANEL_STYLE,
          border: '1px solid rgba(255,68,68,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 700,
            color: '#FF4444',
            textTransform: 'uppercase',
          }}
        >
          Glam
        </span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          See pages 9-10 for full Glam solution
        </span>
      </div>
    </div>
  );
};

export default PdfDetailedSolutions;
