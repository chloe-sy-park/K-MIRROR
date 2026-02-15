import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Lock, CheckCircle, ArrowLeft, Shield, Zap, Clock } from 'lucide-react';
import { useScanStore } from '@/store/scanStore';
import { createPremiumCheckout } from '@/services/paymentService';
import { containerVariants, itemVariants } from '@/constants/animations';

const SESSION_STORAGE_KEY = 'k-mirror-analysis-id';

function getSessionAnalysisId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistAnalysisId(id: string): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  } catch {
    // sessionStorage unavailable (e.g. private browsing quota exceeded)
  }
}

const PremiumCheckoutView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const storeAnalysisId = useScanStore((s) => s.analysisId);
  const celebName = useScanStore((s) => s.selectedCelebName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analysisId = storeAnalysisId ?? getSessionAnalysisId();

  const features = [
    t('premiumCheckout.feature1'),
    t('premiumCheckout.feature2'),
    t('premiumCheckout.feature3'),
    t('premiumCheckout.feature4'),
    t('premiumCheckout.feature5'),
    t('premiumCheckout.feature6'),
    t('premiumCheckout.feature7'),
  ];

  const handlePay = async () => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);

    try {
      persistAnalysisId(analysisId);
      const url = await createPremiumCheckout(analysisId);
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  if (!analysisId) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex flex-col items-center justify-center px-4">
        <p className="text-white/60 text-sm mb-6">{t('premiumCheckout.noAnalysis')}</p>
        <button
          onClick={() => navigate('/kglow')}
          className="text-[#FF2D9B] text-sm font-bold uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#FF4D8D] rounded-lg px-2 py-1"
        >
          {t('premiumCheckout.backToCard')}
        </button>
      </div>
    );
  }

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0A0A1A] flex flex-col items-center px-4 py-12 sm:py-20"
    >
      {/* Back navigation */}
      <m.button
        variants={itemVariants}
        onClick={() => navigate('/kglow')}
        className="self-start mb-8 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-[#FF4D8D] rounded-lg px-2 py-1"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('premiumCheckout.backToCard')}
      </m.button>

      {/* Title */}
      <m.h1
        variants={itemVariants}
        className="text-3xl sm:text-4xl lg:text-5xl heading-font text-white text-center tracking-tight mb-2"
      >
        {t('premiumCheckout.title')}
      </m.h1>
      <m.p variants={itemVariants} className="text-white/50 text-sm font-mono uppercase tracking-widest mb-10">
        {t('premiumCheckout.subtitle')}
      </m.p>

      {/* Preview card */}
      <m.div
        variants={itemVariants}
        className="w-full max-w-md bg-[#1A1A2E] rounded-3xl border border-white/10 p-8 mb-8"
      >
        {celebName && (
          <p className="text-center text-[#FFD700] font-mono text-xs uppercase tracking-widest mb-6">
            &times; {celebName}
          </p>
        )}

        <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-4">
          {t('premiumCheckout.whatsInside')}
        </h3>

        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle size={14} className="text-[#FF2D9B] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="text-white/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </m.div>

      {/* Price + trust badges */}
      <m.div variants={itemVariants} className="w-full max-w-md text-center mb-8">
        <p className="text-3xl font-black text-white mb-4">{t('premiumCheckout.price')}</p>
        <div className="flex items-center justify-center gap-4 text-white/40 text-xs font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Shield size={12} aria-hidden="true" /> {t('premiumCheckout.securePayment')}
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} aria-hidden="true" /> {t('premiumCheckout.instantDelivery')}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden="true" /> {t('premiumCheckout.validFor')}
          </span>
        </div>
      </m.div>

      {/* Pay button */}
      <m.div variants={itemVariants} className="w-full max-w-md">
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePay}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-[#FF4D8D] to-[#FF6B9D] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-[#FF4D8D]/25 hover:shadow-xl hover:shadow-[#FF4D8D]/30 transition-shadow disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#FF4D8D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A1A]"
        >
          <Lock size={16} aria-hidden="true" />
          {loading ? t('premiumCheckout.redirecting') : t('premiumCheckout.payNow')}
        </m.button>

        {error && (
          <p role="alert" className="text-red-400 text-xs text-center mt-3 font-mono">
            {error}
          </p>
        )}
      </m.div>
    </m.div>
  );
};

export default PremiumCheckoutView;
