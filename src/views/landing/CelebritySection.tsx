import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';
import { CELEB_GALLERY } from '@/data/celebGallery';

interface CelebrityClickPayload {
  name: string;
  image: string;
  matchPercent: number;
}

interface CelebritySectionProps {
  onCelebClick: (celeb: CelebrityClickPayload) => void;
}

const CelebritySection = ({ onCelebClick }: CelebritySectionProps) => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  // Take first 6 celebs and derive match percentages from popularityScore
  const celebs = useMemo(
    () =>
      CELEB_GALLERY.slice(0, 6).map((celeb) => ({
        ...celeb,
        matchPercent: Math.min(
          98,
          Math.max(85, Math.round(celeb.popularityScore * 0.85 + 15)),
        ),
      })),
    [],
  );

  return (
    <section className="landing-section py-24 px-6 lg:px-12">
      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Header */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <m.h2
            variants={fadeInUpVariants}
            className="text-4xl md:text-5xl font-black heading-font tracking-tighter uppercase"
          >
            {t('landing.celebs.title')}
          </m.h2>
          <m.p
            variants={fadeInUpVariants}
            className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto"
          >
            {t('landing.celebs.subtitle')}
          </m.p>
        </m.div>

        {/* Celeb grid */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {celebs.map((celeb) => (
            <m.div
              key={celeb.id}
              variants={fadeInUpVariants}
              className="rounded-[2rem] overflow-hidden cursor-pointer group relative aspect-[3/4]"
              onClick={() =>
                onCelebClick({
                  name: celeb.name,
                  image: celeb.imageUrl || '',
                  matchPercent: celeb.matchPercent,
                })
              }
            >
              {/* Celeb image */}
              <img
                src={celeb.imageUrl}
                alt={celeb.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Default overlay — name at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-black heading-font text-lg uppercase tracking-tight">
                  {celeb.name}
                </p>
              </div>

              {/* Match percentage badge */}
              <div className="absolute top-4 right-4 bg-[#FF4D8D] text-white text-xs font-black px-3 py-1.5 rounded-full">
                {celeb.matchPercent}%
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#FF4D8D]/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  {t('landing.celebs.matchLabel')}
                </p>
                <p className="text-white text-4xl font-black heading-font">
                  {celeb.matchPercent}%
                </p>
              </div>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default CelebritySection;
