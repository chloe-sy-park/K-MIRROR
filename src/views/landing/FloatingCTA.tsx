import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';

const SCROLL_THRESHOLD = 600;

const FloatingCTA = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop: pill button fixed bottom-right */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block fixed bottom-8 right-8 z-[140]"
          >
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF4D8D] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg hover:bg-[#e8447f] hover:shadow-xl transition-all"
            >
              {t('landing.floatingCta.tryFree')}
            </Link>
          </m.div>

          {/* Mobile: full-width bar fixed at bottom */}
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[140] p-4 bg-white/95 backdrop-blur-xl border-t border-gray-100"
          >
            <Link
              to="/scan"
              className="block w-full py-4 bg-[#FF4D8D] text-white text-center text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-[#e8447f] transition-colors"
            >
              {t('landing.floatingCta.startNow')}
            </Link>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;
