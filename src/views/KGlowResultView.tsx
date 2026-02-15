import { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Lock, Eye, RotateCcw } from 'lucide-react';
import { containerVariants, itemVariants } from '@/constants/animations';
import { useScanStore } from '@/store/scanStore';
import KGlowCard from '@/components/kglow/KGlowCard';
import SharePanel from '@/components/kglow/SharePanel';

const KGlowResultView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { result, userImage, selectedCelebName, analysisId, reset } =
    useScanStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const celebName =
    result?.kMatch?.celebName ?? selectedCelebName ?? 'Unknown';

  const fiveMetrics = result?.fiveMetrics ?? null;

  const matchRate = useMemo(() => {
    if (!fiveMetrics) return 75;

    const luminosityRatio =
      fiveMetrics.luminosity.potential > 0
        ? (fiveMetrics.luminosity.current / fiveMetrics.luminosity.potential) *
          100
        : 50;
    const harmonyOverall = fiveMetrics.harmonyIndex.overall;
    const visualWeightScore = fiveMetrics.visualWeight.score;

    const avg = (luminosityRatio + harmonyOverall + visualWeightScore) / 3;
    return Math.round(Math.min(100, Math.max(0, avg)));
  }, [fiveMetrics]);

  const analysisNote = result?.kMatch?.styleExplanation ?? '';

  if (!result) return null;

  const handleUnlock = () => {
    navigate('/premium-checkout');
  };

  const handleViewDetail = () => {
    navigate('/scan');
  };

  const handleTryAnother = () => {
    reset();
    navigate('/choose-vibe');
  };

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0A0A1A] flex flex-col items-center px-4 py-12 sm:py-20"
    >
      {/* Title */}
      <m.h1
        variants={itemVariants}
        className="text-2xl sm:text-4xl lg:text-5xl heading-font text-white text-center mb-10 sm:mb-16 tracking-tight"
      >
        {t('kglowResult.ready')}
      </m.h1>

      {/* K-GLOW Card */}
      <m.div variants={itemVariants} className="w-full max-w-md">
        <KGlowCard
          ref={cardRef}
          userImage={userImage}
          celebName={celebName}
          matchRate={matchRate}
          fiveMetrics={fiveMetrics}
          analysisNote={analysisNote}
          analysisId={analysisId}
        />
      </m.div>

      {/* Share Panel */}
      <m.div variants={itemVariants} className="w-full max-w-md mt-8">
        <SharePanel
          cardRef={cardRef}
          analysisId={analysisId}
          celebName={celebName}
        />
      </m.div>

      {/* CTA Buttons */}
      <m.div
        variants={itemVariants}
        className="w-full max-w-md mt-12 space-y-4"
      >
        {/* Unlock Full Sherlock Archive */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleUnlock}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-[#FF4D8D] to-[#FF6B9D] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#FF4D8D]/25 hover:shadow-xl hover:shadow-[#FF4D8D]/30 transition-shadow"
        >
          <Lock size={16} />
          {t('kglowResult.unlock')}
        </m.button>

        {/* View Detailed Analysis */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleViewDetail}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/15 transition-colors"
        >
          <Eye size={16} />
          {t('kglowResult.viewDetail')}
        </m.button>

        {/* Try Another Style */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleTryAnother}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 text-white/60 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:text-white/80 transition-colors"
        >
          <RotateCcw size={16} />
          {t('kglowResult.tryAnother')}
        </m.button>
      </m.div>
    </m.div>
  );
};

export default KGlowResultView;
