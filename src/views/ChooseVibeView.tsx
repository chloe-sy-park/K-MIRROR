import { useState } from 'react';
import * as m from 'framer-motion/m';
import { ArrowLeft, Check, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CELEB_GALLERY, type CelebProfile } from '@/data/celebGallery';
import { useScanStore } from '@/store/scanStore';

const MOOD_COLORS: Record<CelebProfile['mood'], string> = {
  Natural: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Elegant: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Powerful: 'bg-red-500/20 text-red-300 border-red-500/30',
  Cute: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const ChooseVibeView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setCelebFromGallery = useScanStore((s) => s.setCelebFromGallery);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCeleb = CELEB_GALLERY.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (celeb: CelebProfile) => {
    setSelectedId(celeb.id === selectedId ? null : celeb.id);
  };

  const handleContinue = async () => {
    if (!selectedCeleb) return;
    await setCelebFromGallery(selectedCeleb);
    navigate('/scan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A2E] text-white">
      {/* Back button */}
      <div className="sticky top-0 z-20 bg-[#0A0A1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {t('shop.back')}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-40">
        {/* Header */}
        <m.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16 space-y-4"
        >
          <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em]">
            K-GLOW CARD
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black heading-font leading-[0.85] tracking-[-0.04em] uppercase">
            {t('chooseVibe.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
            {t('chooseVibe.subtitle')}
          </p>
        </m.div>

        {/* Grid */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {CELEB_GALLERY.map((celeb) => {
            const isSelected = celeb.id === selectedId;

            return (
              <m.div
                key={celeb.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${celeb.name} — ${celeb.group}`}
                onClick={() => handleSelect(celeb)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(celeb);
                  }
                }}
                className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D8D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A1A] ${
                  isSelected
                    ? 'ring-2 ring-[#FF4D8D] shadow-[0_0_30px_rgba(255,77,141,0.3)]'
                    : 'ring-1 ring-white/10 hover:ring-[#FF4D8D]/50 hover:shadow-[0_0_20px_rgba(255,77,141,0.15)]'
                }`}
              >
                {/* Image area */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] overflow-hidden">
                  {celeb.imageUrl ? (
                    <img
                      src={celeb.imageUrl}
                      alt={celeb.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        isSelected ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FF4D8D]/30 to-purple-600/30 ${
                      celeb.imageUrl ? 'hidden' : ''
                    }`}
                  >
                    <User size={48} className="text-white/40" />
                  </div>

                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0A0A1A] via-[#0A0A1A]/60 to-transparent" />

                  {/* Selected checkmark overlay */}
                  {isSelected && (
                    <m.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF4D8D] flex items-center justify-center shadow-lg"
                    >
                      <Check size={16} className="text-white" strokeWidth={3} />
                    </m.div>
                  )}

                  {/* Mood badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border backdrop-blur-sm ${MOOD_COLORS[celeb.mood]}`}
                    >
                      {celeb.mood}
                    </span>
                  </div>
                </div>

                {/* Info section */}
                <div className="relative px-4 pb-4 pt-1 -mt-8 space-y-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {celeb.name}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {celeb.group}
                    </p>
                  </div>

                  {/* Signature look tag */}
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={10} className="text-[#FF4D8D] flex-shrink-0" />
                    <p className="text-[10px] text-gray-500 italic leading-snug truncate">
                      {celeb.signatureLook}
                    </p>
                  </div>
                </div>
              </m.div>
            );
          })}
        </m.div>
      </div>

      {/* Bottom bar with Continue */}
      <m.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-0 inset-x-0 z-30 bg-[#0A0A1A]/90 backdrop-blur-xl border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {selectedCeleb ? (
              <m.div
                key={selectedCeleb.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#FF4D8D] flex-shrink-0">
                  {selectedCeleb.imageUrl ? (
                    <img
                      src={selectedCeleb.imageUrl}
                      alt={selectedCeleb.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF4D8D] to-purple-500 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white truncate">
                    {selectedCeleb.name}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">
                    {selectedCeleb.signatureLook}
                  </p>
                </div>
              </m.div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                {t('chooseVibe.selectPrompt')}
              </p>
            )}
          </div>

          <m.button
            whileHover={selectedCeleb ? { scale: 1.03 } : undefined}
            whileTap={selectedCeleb ? { scale: 0.97 } : undefined}
            onClick={handleContinue}
            disabled={!selectedCeleb}
            className="px-10 py-4 bg-[#FF4D8D] text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-[#FF3377] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#FF4D8D]/20 flex items-center gap-3 flex-shrink-0"
          >
            {t('chooseVibe.continue')}
            <Sparkles size={14} />
          </m.button>
        </div>
      </m.div>
    </div>
  );
};

export default ChooseVibeView;
