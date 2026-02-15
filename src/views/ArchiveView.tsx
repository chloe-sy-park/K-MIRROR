import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import {
  CheckCircle,
  Loader,
  Circle,
  Download,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { useScanStore } from '@/store/scanStore';
import { fetchAnalysis } from '@/services/analysisService';
import { generateSherlockArchive, uploadPdf } from '@/services/pdfService';
import {
  fetchReportBySessionId,
  updateReportStatus,
  sendReportEmail,
} from '@/services/reportService';
import type { PremiumReport } from '@/services/reportService';
import { containerVariants, itemVariants } from '@/constants/animations';

/* ─── 상수 ─────────────────────────────────────────────────────── */

const SESSION_STORAGE_KEY = 'k-mirror-analysis-id';

type GenerationStep =
  | 'loading'
  | 'data'
  | 'rendering'
  | 'assembling'
  | 'uploading'
  | 'email'
  | 'done'
  | 'error';

/* ─── sessionStorage 헬퍼 ──────────────────────────────────────── */

function getSessionAnalysisId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

/* ─── 스텝 아이콘 헬퍼 ─────────────────────────────────────────── */

function StepIcon({ state }: { state: 'done' | 'active' | 'pending' }) {
  if (state === 'done') {
    return <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />;
  }
  if (state === 'active') {
    return <Loader size={18} className="text-[#FF4D8D] animate-spin flex-shrink-0" aria-hidden="true" />;
  }
  return <Circle size={18} className="text-white/20 flex-shrink-0" aria-hidden="true" />;
}

function stepState(
  currentStep: GenerationStep,
  targetStep: GenerationStep,
  order: GenerationStep[],
): 'done' | 'active' | 'pending' {
  const ci = order.indexOf(currentStep);
  const ti = order.indexOf(targetStep);
  if (ci > ti) return 'done';
  if (ci === ti) return 'active';
  return 'pending';
}

/* ─── 메인 컴포넌트 ────────────────────────────────────────────── */

const ArchiveView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get('session_id');
  const storeAnalysisId = useScanStore((s) => s.analysisId);
  const userImage = useScanStore((s) => s.userImage);
  const selectedCelebName = useScanStore((s) => s.selectedCelebName);

  const [report, setReport] = useState<PremiumReport | null>(null);
  const [step, setStep] = useState<GenerationStep>('loading');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);

  /** 언마운트 시 상태 업데이트를 방지하기 위한 ref */
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ── 리포트 조회 ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    fetchReportBySessionId(sessionId).then((r) => {
      if (cancelled || !mountedRef.current) return;
      if (r) {
        setReport(r);
        setCaseNumber(r.analysis_id.slice(0, 8));
        if (r.status === 'ready' && r.pdf_url) {
          setPdfUrl(r.pdf_url);
          setStep('done');
        }
      } else {
        setStep('error');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  /* ── PDF 생성 플로우 ─────────────────────────────────────────── */

  const runGeneration = useCallback(
    async (rpt: PremiumReport) => {
      if (!mountedRef.current) return;

      try {
        /* Step 1: 상태를 generating으로 업데이트 */
        setStep('data');
        await updateReportStatus(rpt.id, 'generating');

        /* Step 2: 분석 데이터 로드 */
        const analysis = await fetchAnalysis(rpt.analysis_id);
        if (!analysis) throw new Error('Analysis data not found');
        if (!mountedRef.current) return;

        const celebName =
          analysis.kMatch?.celebName ?? selectedCelebName ?? 'K-Celeb';

        /* Step 3: PDF 렌더링 */
        setStep('rendering');
        const blob = await generateSherlockArchive(
          analysis,
          celebName,
          userImage,
          [], // matchedProducts — 결제 후 재접근이므로 빈 배열
          rpt.analysis_id,
        );
        if (!mountedRef.current) return;

        /* Step 4: PDF 조립 (rendering -> assembling은 UI만 분리) */
        setStep('assembling');
        // generateSherlockArchive가 이미 조립을 완료했으므로 짧은 딜레이로 시각적 피드백
        await new Promise((r) => setTimeout(r, 500));
        if (!mountedRef.current) return;

        /* Step 5: 업로드 */
        setStep('uploading');
        const url = await uploadPdf(blob, rpt.analysis_id);
        if (!mountedRef.current) return;

        /* Step 6: 상태를 ready로 업데이트 */
        await updateReportStatus(rpt.id, 'ready', url);
        if (!mountedRef.current) return;

        setPdfUrl(url);

        /* Step 7: 이메일 전송 (non-blocking) */
        setStep('email');
        if (rpt.email) {
          const sent = await sendReportEmail({
            email: rpt.email,
            analysisId: rpt.analysis_id,
            pdfUrl: url,
            celebName,
          });
          if (mountedRef.current) setEmailSent(sent);
        }

        if (mountedRef.current) setStep('done');
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[ArchiveView] Generation failed:', err);
        }

        // 실패 시 status를 failed로 업데이트 (non-blocking)
        updateReportStatus(rpt.id, 'failed').catch(() => {});

        if (mountedRef.current) setStep('error');
      }
    },
    [userImage, selectedCelebName],
  );

  /* ── 리포트 상태에 따른 생성 트리거 ──────────────────────────── */

  useEffect(() => {
    if (!report) return;

    if (report.status === 'paid') {
      runGeneration(report);
    } else if (report.status === 'generating') {
      // 페이지 새로고침 — generating 상태 표시
      setStep('rendering');
    } else if (report.status === 'ready' && report.pdf_url) {
      setPdfUrl(report.pdf_url);
      setStep('done');
      setEmailSent(report.email_sent);
    } else if (report.status === 'failed') {
      setStep('error');
    }
    // 'pending' => 기본 loading UI 유지
  }, [report, runGeneration]);

  /* ── 다운로드 핸들러 ─────────────────────────────────────────── */

  const handleDownload = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  };

  /* ── 재시도 핸들러 ───────────────────────────────────────────── */

  const handleRetry = () => {
    if (!report) return;
    setStep('loading');
    runGeneration({ ...report, status: 'paid' });
  };

  /* ── analysisId 대비 (session_id 없을 때 직접 접근) ──────────── */

  const analysisId = storeAnalysisId ?? getSessionAnalysisId();

  /* ── session_id가 없는 경우 ──────────────────────────────────── */

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex flex-col items-center justify-center px-4">
        <p className="text-white/60 text-sm mb-6">{t('premiumCheckout.noAnalysis')}</p>
        <button
          onClick={() => navigate(analysisId ? '/kglow' : '/')}
          className="text-[#FF2D9B] text-sm font-bold uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#FF4D8D] rounded-lg px-2 py-1"
        >
          {t('archive.backHome')}
        </button>
      </div>
    );
  }

  /* ── 스텝 순서 정의 ──────────────────────────────────────────── */

  const stepOrder: GenerationStep[] = [
    'loading',
    'data',
    'rendering',
    'assembling',
    'uploading',
    'email',
    'done',
  ];

  const steps = [
    { key: 'data' as GenerationStep, label: t('archive.stepDataLoaded') },
    { key: 'rendering' as GenerationStep, label: t('archive.stepRendering') },
    { key: 'assembling' as GenerationStep, label: t('archive.stepAssembling') },
    { key: 'uploading' as GenerationStep, label: t('archive.stepUploading') },
    { key: 'email' as GenerationStep, label: t('archive.stepEmail') },
  ];

  /* ── 에러 UI ─────────────────────────────────────────────────── */

  if (step === 'error') {
    return (
      <m.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-[#0A0A1A] flex flex-col items-center justify-center px-4"
      >
        <m.div variants={itemVariants} className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" aria-hidden="true" />
          </div>
          <p className="text-white/80 text-sm">{t('archive.error')}</p>
          <button
            onClick={handleRetry}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#FF4D8D] to-[#FF6B9D] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-[#FF4D8D]/25 hover:shadow-xl hover:shadow-[#FF4D8D]/30 transition-shadow focus-visible:ring-2 focus-visible:ring-[#FF4D8D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A1A]"
          >
            {t('archive.retry')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-[#FF4D8D] rounded-lg px-2 py-1"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t('archive.backHome')}
          </button>
        </m.div>
      </m.div>
    );
  }

  /* ── 완료 UI ─────────────────────────────────────────────────── */

  if (step === 'done' && pdfUrl) {
    return (
      <m.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-[#0A0A1A] flex flex-col items-center px-4 py-12 sm:py-20"
      >
        {/* 뒤로가기 */}
        <m.button
          variants={itemVariants}
          onClick={() => navigate('/')}
          className="self-start mb-8 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-[#FF4D8D] rounded-lg px-2 py-1"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('archive.backHome')}
        </m.button>

        {/* 성공 아이콘 */}
        <m.div
          variants={itemVariants}
          className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6"
        >
          <CheckCircle size={36} className="text-emerald-400" aria-hidden="true" />
        </m.div>

        {/* 타이틀 */}
        <m.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl heading-font text-white text-center tracking-tight mb-2"
        >
          {t('archive.ready')}
        </m.h1>

        {/* 케이스 넘버 */}
        {caseNumber && (
          <m.p
            variants={itemVariants}
            className="text-white/40 font-mono text-xs uppercase tracking-widest mb-10"
          >
            {t('archive.caseNumber')} #{caseNumber}
          </m.p>
        )}

        {/* 다운로드 카드 */}
        <m.div
          variants={itemVariants}
          className="w-full max-w-md bg-[#1A1A2E] rounded-3xl border border-white/10 p-8 mb-8 flex flex-col items-center gap-6"
        >
          {/* 다운로드 버튼 */}
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-[#FF4D8D] to-[#FF6B9D] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-[#FF4D8D]/25 hover:shadow-xl hover:shadow-[#FF4D8D]/30 transition-shadow focus-visible:ring-2 focus-visible:ring-[#FF4D8D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
          >
            <Download size={18} aria-hidden="true" />
            {t('archive.download')}
          </m.button>

          {/* 온라인 보기 링크 */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF2D9B] text-sm font-bold uppercase tracking-wider hover:underline focus-visible:ring-2 focus-visible:ring-[#FF4D8D] rounded-lg px-2 py-1"
          >
            {t('archive.viewOnline')}
          </a>
        </m.div>

        {/* 안내 메시지 */}
        <m.div variants={itemVariants} className="flex flex-col items-center gap-2">
          {emailSent && (
            <p className="text-emerald-400/80 text-xs font-mono uppercase tracking-wider">
              {t('archive.emailSent')}
            </p>
          )}
          <p className="text-white/30 text-xs font-mono uppercase tracking-wider">
            {t('archive.expiresIn')}
          </p>
        </m.div>
      </m.div>
    );
  }

  /* ── 생성 중 UI (pending / paid / generating) ────────────────── */

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0A0A1A] flex flex-col items-center px-4 py-12 sm:py-20"
    >
      {/* 뒤로가기 */}
      <m.button
        variants={itemVariants}
        onClick={() => navigate('/')}
        className="self-start mb-8 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-[#FF4D8D] rounded-lg px-2 py-1"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('archive.backHome')}
      </m.button>

      {/* 타이틀 */}
      <m.h1
        variants={itemVariants}
        className="text-2xl sm:text-3xl heading-font text-white text-center tracking-tight mb-2"
      >
        {t('archive.generating')}
      </m.h1>

      {caseNumber && (
        <m.p
          variants={itemVariants}
          className="text-white/40 font-mono text-xs uppercase tracking-widest mb-10"
        >
          {t('archive.caseNumber')} #{caseNumber}
        </m.p>
      )}

      {/* 스텝 프로그레스 */}
      <m.div
        variants={itemVariants}
        className="w-full max-w-md bg-[#1A1A2E] rounded-3xl border border-white/10 p-8"
      >
        <ul className="space-y-4" role="list">
          {steps.map((s, i) => {
            const state = stepState(step, s.key, stepOrder);
            return (
              <li key={s.key} className="flex items-center gap-3">
                <StepIcon state={state} />
                <span
                  className={`text-sm font-mono ${
                    state === 'done'
                      ? 'text-emerald-400'
                      : state === 'active'
                        ? 'text-white'
                        : 'text-white/30'
                  }`}
                >
                  {i + 1}. {s.label}
                  {state === 'done' && (
                    <span className="ml-2 text-emerald-400/60" aria-hidden="true">
                      &#10003;
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </m.div>
    </m.div>
  );
};

export default ArchiveView;
