import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConsentStore } from '@/store/consentStore';

const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const { cookieConsent, acceptCookies, declineCookies } = useConsentStore();

  return (
    <AnimatePresence>
      {cookieConsent === null && (
        <m.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-[200] p-4"
        >
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie size={18} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {t('consent.cookieMessage')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={acceptCookies}
                    className="px-5 py-2.5 bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#FF4D8D] transition-all"
                  >
                    {t('consent.cookieAccept')}
                  </button>
                  <button
                    onClick={declineCookies}
                    className="px-5 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    {t('consent.cookieDecline')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
