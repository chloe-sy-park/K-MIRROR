import type { ReactNode } from 'react';

interface PdfPageShellProps {
  children: ReactNode;
  pageNumber: number;
  totalPages: number;
  caseNumber?: string;
}

/** A4 페이지 셸 — 모든 PDF 페이지의 공통 래퍼 (794×1123px) */
const PdfPageShell = ({ children, pageNumber, totalPages, caseNumber }: PdfPageShellProps) => (
  <div
    style={{
      width: 794,
      height: 1123,
      background: '#0A0A1A',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#F0F0F0',
    }}
  >
    {/* Header */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#FF2D9B',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        Sherlock Archive
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
        {pageNumber} of {totalPages}
      </span>
    </div>

    {/* Content area — full height minus header (~52px) and footer (~40px) */}
    <div style={{ padding: '30px 40px', height: 1123 - 92, overflow: 'hidden' }}>{children}</div>

    {/* Footer */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 40px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>k-mirror.ai</span>
      {caseNumber && (
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
          Case #{caseNumber}
        </span>
      )}
    </div>
  </div>
);

export default PdfPageShell;
