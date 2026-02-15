import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Sparkles, Beaker, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { containerVariants, itemVariants } from '@/constants/animations';
import { useScanStore } from '@/store/scanStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useConsentStore } from '@/store/consentStore';
import { trackEvent } from '@/lib/analytics';
import LuxuryFileUpload from '@/components/ui/LuxuryFileUpload';
import Toggle from '@/components/ui/Toggle';
import BiometricConsentModal from '@/components/ui/BiometricConsentModal';
import type { CelebProfile } from '@/data/celebGallery';

const ScanView = () => {
  const { t } = useTranslation();
  const { userImage, celebImage, selectedCelebName, setUserImage, setCelebImage, setCelebFromGallery, setTargetBoard, analyze, demoMode } = useScanStore();
  const { isSensitive, toggleSensitive, prefs } = useSettingsStore();
  const [showConsent, setShowConsent] = useState(false);
  const { biometricConsent, acceptBiometric } = useConsentStore();
  const location = useLocation();

  // Accept celeb from CelebGalleryView and fromBoard from MuseBoardView
  useEffect(() => {
    const state = location.state as { selectedCeleb?: CelebProfile; fromBoard?: string } | null;
    if (state?.selectedCeleb) {
      setCelebFromGallery(state.selectedCeleb);
    }
    if (state?.fromBoard) {
      setTargetBoard(state.fromBoard);
    }
    // Clear the state so it doesn't re-trigger on navigation
    if (state?.selectedCeleb || state?.fromBoard) {
      window.history.replaceState({}, '');
    }
  }, [location.state, setCelebFromGallery, setTargetBoard]);

  const handleAnalyze = () => {
    if (!biometricConsent) {
      setShowConsent(true);
      return;
    }
    trackEvent('selfie_uploaded', { has_celeb: !!celebImage });
    analyze(isSensitive, prefs);
  };

  const handleConsentAccept = () => {
    acceptBiometric();
    setShowConsent(false);
    trackEvent('selfie_uploaded', { has_celeb: !!celebImage });
    analyze(isSensitive, prefs);
  };

  const clearCelebSelection = () => {
    setCelebImage('');
    useScanStore.setState({ celebImage: null, selectedCelebName: null });
  };

  return (
    <>
    <m.div
      key="idle" initial="hidden" animate="visible" variants={containerVariants}
      className="flex flex-col lg:flex-row items-center gap-16 lg:py-12"
    >
      <m.div variants={itemVariants} className="flex-1 text-center lg:text-left space-y-10">
        <div className="relative inline-block">
          <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em] mb-6 uppercase">{t('scan.tagline')}</p>
          <button onClick={demoMode} className="absolute -top-12 -right-12 group">
            <m.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors"
            >
              <Beaker size={20} />
            </m.div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black text-pink-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity uppercase uppercase">{t('scan.previewDemo')}</div>
          </button>
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black heading-font leading-[0.9] tracking-tighter uppercase mb-10 text-balance">{t('scan.title')}<br/><span className="text-gray-300 text-balance">{t('scan.titleAccent')}</span></h2>
          <p className="text-base lg:text-lg text-gray-500 mb-12 max-w-md leading-relaxed mx-auto lg:mx-0 font-medium italic uppercase tracking-tighter text-balance whitespace-pre-line">{t('scan.subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:gap-10 mb-12">
          <LuxuryFileUpload label={t('scan.basePortrait')} preview={userImage} onImageSelect={setUserImage} secondaryLabel={t('scan.bareFace')} capture="user" />
          <div className="relative">
            <LuxuryFileUpload label={t('scan.styleMuse')} preview={celebImage} onImageSelect={setCelebImage} secondaryLabel={selectedCelebName ?? t('scan.pinterestInspiration')} />
            {selectedCelebName && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#FF4D8D] text-white px-3 py-1 rounded-full z-10 shadow-lg">
                <span className="text-[9px] font-black uppercase tracking-wider">{selectedCelebName}</span>
                <button onClick={clearCelebSelection} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start items-center">
          <m.div
            variants={itemVariants}
            className="flex items-center gap-6 bg-gray-50/50 px-8 py-5 rounded-[2.5rem] border border-gray-100 backdrop-blur-sm shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1 uppercase">{t('scan.sensitivity')}</span>
              <span className="text-[10px] font-bold text-gray-900 uppercase uppercase">{t('scan.ingredientFilter')}</span>
            </div>
            <Toggle checked={isSensitive} onChange={toggleSensitive} />
          </m.div>
          <m.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!userImage || !celebImage}
            className="px-14 py-7 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-[#FF4D8D] transition-all duration-500 disabled:opacity-20 shadow-2xl flex items-center gap-4 uppercase"
          >
            {t('scan.neuralScan')} {userImage && celebImage && <Sparkles size={16} />}
          </m.button>
        </div>
      </m.div>
    </m.div>
    <BiometricConsentModal
      isOpen={showConsent}
      onAccept={handleConsentAccept}
      onDecline={() => setShowConsent(false)}
    />
    </>
  );
};

export default ScanView;
