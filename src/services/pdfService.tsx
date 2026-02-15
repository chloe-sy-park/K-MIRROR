import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { AnalysisResult, FiveMetrics, StyleVersions } from '@/types';
import type { MatchedProduct } from '@/services/geminiService';
import type { NormalizedMetrics } from '@/components/charts/normalizeMetrics';
import { normalizeMetrics } from '@/components/charts/normalizeMetrics';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import RadarMetricsChart from '@/components/charts/RadarMetricsChart';
import PdfPageShell from '@/components/pdf/PdfPageShell';
import PdfCover from '@/components/pdf/PdfCover';
import PdfSkeletal from '@/components/pdf/PdfSkeletal';
import PdfMetricsOverview from '@/components/pdf/PdfMetricsOverview';
import PdfMetricsDeep from '@/components/pdf/PdfMetricsDeep';
import PdfTranslation from '@/components/pdf/PdfTranslation';
import PdfStyleVariations from '@/components/pdf/PdfStyleVariations';
import PdfDetailedSolutions from '@/components/pdf/PdfDetailedSolutions';
import PdfSolution from '@/components/pdf/PdfSolution';
import PdfProducts from '@/components/pdf/PdfProducts';
import PdfFinalReveal from '@/components/pdf/PdfFinalReveal';

/* ─── 상수 ─────────────────────────────────────────────────────── */

/** A4 페이지 크기 (px) */
const PAGE_W = 794;
const PAGE_H = 1123;

/** 총 페이지 수 */
const TOTAL_PAGES = 12;

/** 이미지/차트 렌더링 안정화 대기 시간 (ms) */
const RENDER_SETTLE_MS = 100;

/* ─── 타입 ─────────────────────────────────────────────────────── */

interface GapRow {
  metric: string;
  user: number;
  celeb: number;
  gap: number;
}

interface MetricDeepDive {
  name: string;
  score: number;
  interpretation: string;
  solution: string;
}

/* ─── 기본 메트릭 (FiveMetrics 누락 시) ────────────────────────── */

const DEFAULT_FIVE_METRICS: FiveMetrics = {
  visualWeight: {
    score: 50,
    eyeWeight: 50,
    lipWeight: 50,
    noseWeight: 50,
    interpretation: 'Average visual weight distribution across facial features.',
  },
  canthalTilt: {
    angleDegrees: 2.5,
    classification: 'Neutral',
    symmetry: 'Symmetric',
  },
  midfaceRatio: {
    ratioPercent: 35,
    philtrumRelative: 'Average',
    youthScore: 50,
  },
  luminosity: {
    current: 50,
    potential: 100,
    textureGrade: 'B',
  },
  harmonyIndex: {
    overall: 85,
    symmetryScore: 80,
    optimalBalance: 'Balanced',
  },
};

/* ─── 기본 StyleVersions (누락 시 fallback) ──────────────────── */

const DEFAULT_STYLE_VERSIONS: StyleVersions = {
  daily: {
    intensity: 'light',
    base: 'Lightweight tinted moisturizer with SPF for a natural, skin-like finish.',
    eyes: 'Soft brown pencil liner on upper lash line with one coat of lengthening mascara.',
    lips: 'Tinted lip balm in a rosy nude shade for effortless color.',
    keyProducts: ['Tinted Moisturizer', 'Brown Pencil Liner', 'Tinted Lip Balm'],
    metricsShift: { VW: 2, CT: 1, MF: 0, LS: 3, HI: 1 },
  },
  office: {
    intensity: 'medium',
    base: 'Medium-coverage foundation with setting powder on the T-zone for a polished matte finish.',
    eyes: 'Neutral matte eyeshadow palette with defined crease and subtle winged liner.',
    lips: 'MLBB lipstick with lip liner for a refined, long-lasting look.',
    keyProducts: ['Foundation', 'Matte Eyeshadow Palette', 'MLBB Lipstick', 'Setting Powder'],
    metricsShift: { VW: 5, CT: 3, MF: 2, LS: 5, HI: 3 },
  },
  glam: {
    intensity: 'full',
    base: 'Full-coverage luminous foundation layered with cream contour and highlight for sculpted radiance.',
    eyes: 'Smoky shimmer eye with dramatic winged liner and volumizing false lashes.',
    lips: 'Bold lip color with defined lip liner and gloss for maximum impact.',
    keyProducts: ['Luminous Foundation', 'Cream Contour Kit', 'Shimmer Palette', 'False Lashes', 'Bold Lip'],
    metricsShift: { VW: 10, CT: 6, MF: 4, LS: 8, HI: 5 },
  },
};

/* ─── 헬퍼 함수 ──────────────────────────────────────────────── */

/**
 * 사용자 메트릭과 셀럽 메트릭의 갭 요약 테이블을 생성한다.
 */
function buildGapSummary(
  user: NormalizedMetrics,
  celeb: NormalizedMetrics,
): GapRow[] {
  const labels: Array<{ key: keyof NormalizedMetrics; label: string }> = [
    { key: 'VW', label: 'Visual Weight' },
    { key: 'CT', label: 'Canthal Tilt' },
    { key: 'MF', label: 'Mid-face Ratio' },
    { key: 'LS', label: 'Luminosity' },
    { key: 'HI', label: 'Harmony Index' },
  ];

  return labels.map(({ key, label }) => ({
    metric: label,
    user: Math.round(user[key]),
    celeb: Math.round(celeb[key]),
    gap: Math.round(user[key] - celeb[key]),
  }));
}

/**
 * FiveMetrics에서 딥다이브 카드 데이터를 생성한다.
 * 각 축마다 해석(interpretation)과 솔루션(solution) 텍스트를 포함한다.
 */
function buildMetricsDeepDive(fm?: FiveMetrics): MetricDeepDive[] {
  const m = fm ?? DEFAULT_FIVE_METRICS;

  return [
    {
      name: 'Visual Weight',
      score: m.visualWeight.score,
      interpretation: m.visualWeight.interpretation,
      solution:
        m.visualWeight.score < 40
          ? 'Enhance visual weight with volumizing techniques on eyes and lips to create stronger feature presence.'
          : m.visualWeight.score > 70
            ? 'Balance visual weight with soft, diffused makeup to avoid overpowering delicate features.'
            : 'Maintain current balance with neutral tones that complement your natural feature weight.',
    },
    {
      name: 'Canthal Tilt',
      score: Math.round(((m.canthalTilt.angleDegrees + 10) / 25) * 100),
      interpretation: `${m.canthalTilt.classification} tilt (${m.canthalTilt.angleDegrees}°) with ${m.canthalTilt.symmetry.toLowerCase()} symmetry.`,
      solution:
        m.canthalTilt.angleDegrees < 0
          ? 'Use upward-angled eyeliner and lifted shadow placement to create the illusion of positive canthal tilt.'
          : m.canthalTilt.angleDegrees > 8
            ? 'Soften the sharp tilt with rounded lower lash emphasis and horizontal shadow blending.'
            : 'Your neutral tilt is versatile — experiment with both cat-eye and puppy-eye liner styles.',
    },
    {
      name: 'Mid-face Ratio',
      score: m.midfaceRatio.youthScore,
      interpretation: `Ratio at ${m.midfaceRatio.ratioPercent}% with ${m.midfaceRatio.philtrumRelative.toLowerCase()} philtrum proportion.`,
      solution:
        m.midfaceRatio.ratioPercent > 40
          ? 'Shorten perceived mid-face by overdrawn upper lip and lower blush placement.'
          : m.midfaceRatio.ratioPercent < 30
            ? 'Elongate mid-face perception with bronzer placed higher on the cheekbones and natural lip shape.'
            : 'Balanced mid-face — focus on enhancing overall harmony with evenly placed highlights.',
    },
    {
      name: 'Luminosity',
      score:
        m.luminosity.potential > 0
          ? Math.round((m.luminosity.current / m.luminosity.potential) * 100)
          : 50,
      interpretation: `Current luminosity at ${m.luminosity.current}% of ${m.luminosity.potential}% potential. Texture grade: ${m.luminosity.textureGrade}.`,
      solution:
        m.luminosity.current < m.luminosity.potential * 0.6
          ? 'Boost luminosity with hydrating primers, liquid highlighters, and dewy finish foundations.'
          : 'Maintain glow with setting sprays and targeted highlight on high points of the face.',
    },
    {
      name: 'Harmony Index',
      score: m.harmonyIndex.overall,
      interpretation: `Overall harmony at ${m.harmonyIndex.overall}% with ${m.harmonyIndex.symmetryScore}% symmetry. ${m.harmonyIndex.optimalBalance}.`,
      solution:
        m.harmonyIndex.overall < 70
          ? 'Improve perceived harmony through strategic contouring and highlight placement to balance proportions.'
          : 'High harmony — enhance with monochromatic makeup looks that unify your naturally balanced features.',
    },
  ];
}

/* ─── 오프스크린 렌더링 유틸리티 ─────────────────────────────── */

/**
 * React 엘리먼트를 오프스크린 DOM에 렌더링하고 html2canvas로 캡처한다.
 * 캡처 후 DOM 정리를 보장한다.
 */
async function renderAndCapture(element: React.ReactElement): Promise<HTMLCanvasElement> {
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(element);
    });

    // 이미지/차트 안정화 대기
    await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));

    const canvas = await html2canvas(
      container.firstElementChild as HTMLElement,
      {
        backgroundColor: '#0A0A1A',
        scale: 2,
        useCORS: true,
        logging: false,
      },
    );

    return canvas;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

/**
 * Fragment를 반환하는 멀티페이지 컴포넌트(PdfMetricsDeep, PdfSolution)의
 * 각 자식 PdfPageShell을 개별적으로 캡처한다.
 */
async function renderAndCaptureMultiPage(
  element: React.ReactElement,
): Promise<HTMLCanvasElement[]> {
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(element);
    });

    await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));

    // Fragment의 자식 요소들 (각각 794x1123 PdfPageShell)
    const children = Array.from(container.children) as HTMLElement[];
    const canvases: HTMLCanvasElement[] = [];

    for (const child of children) {
      const canvas = await html2canvas(child, {
        backgroundColor: '#0A0A1A',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvases.push(canvas);
    }

    return canvases;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

/* ─── 메인 PDF 생성 ──────────────────────────────────────────── */

/**
 * Sherlock Archive PDF를 생성한다.
 *
 * 12페이지 A4 문서를 React 컴포넌트로 렌더링하고
 * html2canvas로 캡처한 후 jsPDF로 조립하여 Blob으로 반환한다.
 *
 * @param analysis - Gemini 분석 결과
 * @param celebName - 매칭된 셀럽 이름
 * @param userImage - 사용자 이미지 (base64 또는 URL)
 * @param matchedProducts - 매칭된 제품 목록
 * @param analysisId - 분석 고유 ID (케이스 번호 및 URL 생성에 사용)
 * @returns PDF Blob
 */
export async function generateSherlockArchive(
  analysis: AnalysisResult,
  celebName: string,
  userImage: string | null,
  matchedProducts: MatchedProduct[],
  analysisId: string = crypto.randomUUID(),
): Promise<Blob> {
  const fiveMetrics = analysis.fiveMetrics ?? DEFAULT_FIVE_METRICS;
  const normalizedUser = normalizeMetrics(fiveMetrics);

  // 셀럽 메트릭은 하모니 인덱스 기반으로 살짝 보정한 이상적인 값 사용
  const normalizedCeleb: NormalizedMetrics = {
    VW: Math.min(100, normalizedUser.VW + 5),
    CT: Math.min(100, normalizedUser.CT + 3),
    MF: Math.min(100, normalizedUser.MF + 4),
    LS: Math.min(100, normalizedUser.LS + 6),
    HI: Math.min(100, normalizedUser.HI + 2),
  };

  const caseNumber = analysisId.slice(0, 8);
  const matchRate = analysis.fiveMetrics?.harmonyIndex.overall ?? 85;

  const styleVersions = analysis.styleVersions ?? DEFAULT_STYLE_VERSIONS;

  const gapSummary = buildGapSummary(normalizedUser, normalizedCeleb);
  const metricsDeepDive = buildMetricsDeepDive(analysis.fiveMetrics);

  const canvases: HTMLCanvasElement[] = [];

  if (import.meta.env.DEV) {
    console.log('[pdfService] PDF 생성 시작 — 총 %d 페이지', TOTAL_PAGES);
  }

  /* ── Page 1: Cover ────────────────────────────────────────── */
  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={1} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfCover
          celebName={celebName}
          matchRate={matchRate}
          caseNumber={caseNumber}
          userImage={userImage}
          radarElement={
            <RadarMetricsChart userMetrics={normalizedUser} size={180} />
          }
        />
      </PdfPageShell>,
    ),
  );

  /* ── Page 2: Skeletal ─────────────────────────────────────── */
  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={2} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfSkeletal
          proportions={analysis.sherlock.proportions}
          eyeAngle={analysis.sherlock.eyeAngle}
          boneStructure={analysis.sherlock.boneStructure}
        />
      </PdfPageShell>,
    ),
  );

  /* ── Page 3: Metrics Overview ─────────────────────────────── */
  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={3} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfMetricsOverview
          radarElement={
            <RadarMetricsChart
              userMetrics={normalizedUser}
              celebMetrics={normalizedCeleb}
              size={280}
            />
          }
          gapSummary={gapSummary}
        />
      </PdfPageShell>,
    ),
  );

  /* ── Pages 4-5: Metrics Deep Dive (자체 PdfPageShell) ──── */
  const metricsDeepCanvases = await renderAndCaptureMultiPage(
    <PdfMetricsDeep
      metrics={metricsDeepDive}
      pageOffset={4}
      totalPages={TOTAL_PAGES}
      caseNumber={caseNumber}
    />,
  );
  canvases.push(...metricsDeepCanvases);

  /* ── Page 6: Translation ──────────────────────────────────── */
  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={6} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfTranslation
          facialVibe={analysis.sherlock.facialVibe}
          adaptationLogic={analysis.kMatch.adaptationLogic}
        />
      </PdfPageShell>,
    ),
  );

  /* ── Page 7: Style Variations (NEW) ──────────────────────── */
  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={7} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfStyleVariations
          styleVersions={styleVersions}
          userMetrics={normalizedUser}
        />
      </PdfPageShell>,
    ),
  );

  /* ── Page 8: Detailed Solutions (NEW) ──────────────────── */
  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={8} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfDetailedSolutions styleVersions={styleVersions} />
      </PdfPageShell>,
    ),
  );

  /* ── Pages 9-10: Solution (자체 PdfPageShell) ─────────── */
  const solutionCanvases = await renderAndCaptureMultiPage(
    <PdfSolution
      adaptationLogic={analysis.kMatch.adaptationLogic}
      recommendations={{
        ingredients: analysis.recommendations.ingredients,
        products: matchedProducts.map((p) => ({
          name: p.name_en,
          brand: p.brand,
          matchScore: p.matchScore,
        })),
      }}
      pageOffset={9}
      totalPages={TOTAL_PAGES}
      caseNumber={caseNumber}
    />,
  );
  canvases.push(...solutionCanvases);

  /* ── Page 11: Products ────────────────────────────────────── */
  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={11} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfProducts
          products={matchedProducts.map((p) => ({
            name: p.name_en,
            brand: p.brand,
            matchScore: p.matchScore,
            price: `$${p.price_usd.toFixed(2)}`,
          }))}
        />
      </PdfPageShell>,
    ),
  );

  /* ── Page 12: Final Reveal ────────────────────────────────── */
  const reportUrl =
    (typeof window !== 'undefined' ? window.location.origin : 'https://k-mirror.ai') +
    '/archive?id=' +
    analysisId;

  canvases.push(
    await renderAndCapture(
      <PdfPageShell pageNumber={12} totalPages={TOTAL_PAGES} caseNumber={caseNumber}>
        <PdfFinalReveal
          userImage={userImage}
          celebName={celebName}
          matchRate={matchRate}
          reportUrl={reportUrl}
        />
      </PdfPageShell>,
    ),
  );

  /* ── jsPDF 조립 ───────────────────────────────────────────── */
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [PAGE_W, PAGE_H],
  });

  for (let i = 0; i < canvases.length; i++) {
    const imgData = canvases[i]!.toDataURL('image/jpeg', 0.92);
    if (i > 0) pdf.addPage([PAGE_W, PAGE_H]);
    pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_W, PAGE_H);
  }

  if (import.meta.env.DEV) {
    console.log('[pdfService] PDF 생성 완료 — %d 페이지 조립됨', canvases.length);
  }

  return pdf.output('blob');
}

/* ─── Supabase Storage 업로드 ────────────────────────────────── */

/**
 * 생성된 PDF Blob을 Supabase Storage 'reports' 버킷에 업로드한다.
 *
 * @param blob - PDF Blob
 * @param analysisId - 분석 고유 ID (파일명에 사용)
 * @returns 업로드된 PDF의 공개 URL
 * @throws Supabase 미설정 또는 업로드 실패 시 에러
 */
export async function uploadPdf(
  blob: Blob,
  analysisId: string,
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured — cannot upload PDF.');
  }

  const fileName = `reports/${analysisId}.pdf`;

  const { error } = await supabase.storage
    .from('reports')
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('reports').getPublicUrl(fileName);
  return data.publicUrl;
}
