import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface BiometricConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const BiometricConsentModal = ({ isOpen, onAccept, onDecline }: BiometricConsentModalProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Save the element that opened the modal so we can restore focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Auto-focus the first focusable element when modal opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const first = dialogRef.current.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }
  }, [isOpen]);

  // Focus trap: cycle Tab within the dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDecline();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last!.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first!.focus();
      }
    },
    [onDecline],
  );

  const titleId = 'biometric-consent-title';

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onDecline}
          onKeyDown={handleKeyDown}
        >
          <m.div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
          >
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShieldCheck size={28} className="text-black" />
                </div>
              </div>
              <h2
                id={titleId}
                className="text-3xl heading-font uppercase tracking-tight"
              >
                {t('consent.biometricTitle')}
              </h2>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed text-center mb-10">
              {t('consent.biometricBody')}
            </p>

            <div className="space-y-3">
              <button
                onClick={onAccept}
                className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all"
              >
                {t('consent.biometricAccept')}
              </button>
              <button
                onClick={onDecline}
                className="w-full py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-all"
              >
                {t('consent.biometricDecline')}
              </button>
            </div>

            <p className="text-center mt-6">
              <Link
                to="/privacy"
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                {t('consent.biometricLearnMore')}
              </Link>
            </p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default BiometricConsentModal;
