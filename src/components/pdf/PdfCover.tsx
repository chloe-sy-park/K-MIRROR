import type { ReactNode } from 'react';

interface PdfCoverProps {
  celebName: string;
  matchRate: number;
  caseNumber: string;
  userImage: string | null;
  radarElement?: ReactNode;
}

/** PDF 커버 페이지 — 타이틀, 사용자 사진, 셀럽 매칭, 레이더 차트 */
const PdfCover = ({ celebName, matchRate, caseNumber, userImage, radarElement }: PdfCoverProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 20,
    }}
  >
    {/* Title */}
    <h1
      style={{
        fontFamily: 'monospace',
        fontSize: 28,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.3em',
        color: '#FF2D9B',
        textAlign: 'center',
        margin: 0,
      }}
    >
      The Sherlock Archive
    </h1>

    {/* Subtitle */}
    <p
      style={{
        fontFamily: 'monospace',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        margin: 0,
        textAlign: 'center',
      }}
    >
      Premium Beauty Intelligence Report
    </p>

    {/* Divider */}
    <div
      style={{
        width: '50%',
        height: 1,
        background: '#FF2D9B',
        margin: '8px 0',
      }}
    />

    {/* User photo */}
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        border: '2px solid #FF2D9B',
        overflow: 'hidden',
        background: '#1A1A2E',
        flexShrink: 0,
      }}
    >
      {userImage ? (
        <img
          src={userImage}
          alt="User"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(100%)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          No Image
        </div>
      )}
    </div>

    {/* Celeb match text */}
    <p
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 16,
        color: '#FFD700',
        textTransform: 'uppercase',
        margin: 0,
        fontWeight: 600,
      }}
    >
      &times; {celebName}
    </p>

    {/* Match rate badge */}
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 20px',
        borderRadius: 20,
        background: 'rgba(255,45,155,0.2)',
        border: '1px solid rgba(255,45,155,0.4)',
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#FF2D9B', fontWeight: 700 }}>
        {matchRate}% MATCH
      </span>
    </div>

    {/* Radar chart area */}
    <div
      style={{
        width: 180,
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {radarElement ?? (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          Radar Chart
        </div>
      )}
    </div>

    {/* Case number */}
    <p
      style={{
        fontFamily: 'monospace',
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        margin: '12px 0 0 0',
      }}
    >
      Case #{caseNumber}
    </p>
  </div>
);

export default PdfCover;
