import PdfPageShell from './PdfPageShell';

interface MetricDeepDive {
  name: string;
  score: number;
  interpretation: string;
  solution: string;
}

interface PdfMetricsDeepProps {
  metrics: MetricDeepDive[];
  pageOffset: number;
  totalPages: number;
  caseNumber: string;
}

/** 개별 메트릭 카드 */
const MetricCard = ({ name, score, interpretation, solution }: MetricDeepDive) => (
  <div
    style={{
      background: '#1A1A2E',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
    }}
  >
    {/* Metric name */}
    <p
      style={{
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#FF2D9B',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        margin: '0 0 10px 0',
        fontWeight: 700,
      }}
    >
      {name}
    </p>

    {/* Score bar */}
    <div
      style={{
        width: '100%',
        height: 6,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        marginBottom: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.min(Math.max(score, 0), 100)}%`,
          height: '100%',
          borderRadius: 3,
          background: 'linear-gradient(90deg, #FF2D9B, #FF6FB5)',
        }}
      />
    </div>

    {/* Interpretation */}
    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
      {interpretation}
    </p>

    {/* Solution */}
    <p
      style={{
        fontSize: 12,
        color: '#00D4FF',
        fontStyle: 'italic',
        lineHeight: 1.5,
        margin: 0,
      }}
    >
      {solution}
    </p>
  </div>
);

/**
 * PDF 4-5페이지 — 메트릭 딥다이브 (3개 + 2개 분할)
 * Fragment로 두 개의 PdfPageShell을 반환한다.
 */
const PdfMetricsDeep = ({ metrics, pageOffset, totalPages, caseNumber }: PdfMetricsDeepProps) => {
  const page1Metrics = metrics.slice(0, 3);
  const page2Metrics = metrics.slice(3, 5);

  return (
    <>
      {/* Page 1: first 3 metrics */}
      <PdfPageShell pageNumber={pageOffset} totalPages={totalPages} caseNumber={caseNumber}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#F0F0F0',
                margin: '0 0 4px 0',
              }}
            >
              Metrics Deep Dive
            </h2>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Detailed Analysis &amp; Solutions
            </p>
          </div>
          {page1Metrics.map((m) => (
            <MetricCard key={m.name} {...m} />
          ))}
        </div>
      </PdfPageShell>

      {/* Page 2: remaining metrics */}
      <PdfPageShell pageNumber={pageOffset + 1} totalPages={totalPages} caseNumber={caseNumber}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#F0F0F0',
                margin: '0 0 4px 0',
              }}
            >
              Metrics Deep Dive
            </h2>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Continued
            </p>
          </div>
          {page2Metrics.map((m) => (
            <MetricCard key={m.name} {...m} />
          ))}
        </div>
      </PdfPageShell>
    </>
  );
};

export default PdfMetricsDeep;
