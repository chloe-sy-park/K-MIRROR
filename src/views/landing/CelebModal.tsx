import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface CelebData {
  name: string;
  image: string;
  matchPercent: number;
}

interface CelebModalProps {
  isOpen: boolean;
  onClose: () => void;
  celeb: CelebData | null;
}

const CelebModal = ({ isOpen, onClose, celeb }: CelebModalProps) => {
  const { t } = useTranslation();
  const { dialogRef, handleKeyDown } = useFocusTrap({
    isOpen,
    onEscape: onClose,
  });

  return (
    <AnimatePresence>
      {isOpen && celeb && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
          onKeyDown={handleKeyDown}
        >
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={celeb.name}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label={t('a11y.closeDialog')}
              className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>

            {/* Celeb image */}
            <div className="w-full aspect-square rounded-[2rem] overflow-hidden mb-8 bg-[#F5F5F7]">
              <img
                src={celeb.image}
                alt={celeb.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Celeb info */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black heading-font uppercase tracking-tight">
                {celeb.name}
              </h3>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  {t('landing.celebs.matchLabel')}
                </span>
                <span className="text-lg font-black text-[#FF4D8D]">
                  {celeb.matchPercent}%
                </span>
              </div>
            </div>

            {/* CTA button */}
            <Link
              to="/scan"
              onClick={onClose}
              className="block w-full py-5 bg-black text-white text-center rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all"
            >
              {t('landing.nav.tryNow')}
            </Link>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default CelebModal;
