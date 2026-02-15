import { QRCodeSVG } from 'qrcode.react';

interface PdfFinalRevealProps {
  userImage: string | null;
  celebName: string;
  matchRate: number;
  reportUrl: string;
}

/** PDF 최종 페이지 — 변환 결과 + QR 코드 */
const PdfFinalReveal = ({ userImage, celebName, matchRate, reportUrl }: PdfFinalRevealProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 24,
    }}
  >
    {/* Title */}
    <h2
      style={{
        fontSize: 20,
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#F0F0F0',
        margin: 0,
        letterSpacing: '0.1em',
      }}
    >
      Your Transformation
    </h2>

    {/* Split image — grayscale left, color right */}
    <div
      style={{
        width: 200,
        height: 260,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        background: '#1A1A2E',
        flexShrink: 0,
      }}
    >
      {userImage ? (
        <>
          {/* Grayscale layer (left half) */}
          <img
            src={userImage}
            alt="User grayscale"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(100%)',
            }}
          />
          {/* Color layer (right half, clipped) */}
          <img
            src={userImage}
            alt="User color"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              clipPath: 'inset(0 0 0 50%)',
            }}
          />
          {/* Center divider line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: 1,
              height: '100%',
              background: 'rgba(255,45,155,0.6)',
            }}
          />
        </>
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

    {/* Celeb name */}
    <p
      style={{
        fontSize: 16,
        color: '#FFD700',
        textTransform: 'uppercase',
        fontWeight: 600,
        margin: 0,
      }}
    >
      &times; {celebName}
    </p>

    {/* Large match rate */}
    <p
      style={{
        fontFamily: 'monospace',
        fontSize: 48,
        fontWeight: 700,
        color: '#FF2D9B',
        margin: 0,
        lineHeight: 1,
      }}
    >
      {matchRate}%
    </p>

    {/* QR code */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          background: '#FFFFFF',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
        }}
      >
        <QRCodeSVG value={reportUrl} size={84} bgColor="#FFFFFF" fgColor="#0A0A1A" level="M" />
      </div>
      <p
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          margin: 0,
        }}
      >
        Scan to view online
      </p>
    </div>

    {/* Report URL */}
    <p
      style={{
        fontFamily: 'monospace',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        margin: 0,
        wordBreak: 'break-all',
        textAlign: 'center',
        maxWidth: 400,
      }}
    >
      {reportUrl}
    </p>
  </div>
);

export default PdfFinalReveal;
