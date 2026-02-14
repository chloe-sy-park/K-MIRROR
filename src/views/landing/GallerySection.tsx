import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

const galleryCards = [
  {
    labelKey: 'landing.gallery.eastAsian',
    gradient: 'from-[#FF4D8D] via-[#FF6B9D] to-[#FFB3D1]',
  },
  {
    labelKey: 'landing.gallery.southAsian',
    gradient: 'from-[#FF8E53] via-[#FFB347] to-[#FFD166]',
  },
  {
    labelKey: 'landing.gallery.african',
    gradient: 'from-[#6C5CE7] via-[#A29BFE] to-[#DFE6E9]',
  },
  {
    labelKey: 'landing.gallery.european',
    gradient: 'from-[#00B894] via-[#55EFC4] to-[#81ECEC]',
  },
  {
    labelKey: 'landing.gallery.latinAmerican',
    gradient: 'from-[#E17055] via-[#FAB1A0] to-[#FFEAA7]',
  },
] as const;

const galleryStats = [
  { value: '10,000+', labelKey: 'landing.gallery.statTransformations' },
  { value: '120+', labelKey: 'landing.gallery.statCountries' },
  { value: '98%', labelKey: 'landing.gallery.statSatisfaction' },
] as const;

const GallerySection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  return (
    <section className="landing-section py-24 px-6 lg:px-12">
      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Header */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-12"
        >
          <m.h2
            variants={fadeInUpVariants}
            className="text-4xl md:text-5xl font-black heading-font tracking-tighter uppercase"
          >
            {t('landing.gallery.title')}
          </m.h2>
          <m.p
            variants={fadeInUpVariants}
            className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto"
          >
            {t('landing.gallery.subtitle')}
          </m.p>
        </m.div>

        {/* Horizontal scroll gallery */}
        <m.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="flex gap-6 w-max">
            {galleryCards.map(({ labelKey, gradient }) => (
              <div
                key={labelKey}
                className="min-w-[280px] h-[400px] rounded-[2rem] overflow-hidden relative flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Gradient placeholder background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
                />

                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
                    {t(labelKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </m.div>

        {/* Stats row */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-3 gap-8 mt-16 border-t border-gray-100 pt-12"
        >
          {galleryStats.map(({ value, labelKey }) => (
            <m.div
              key={labelKey}
              variants={fadeInUpVariants}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-black heading-font text-[#FF4D8D]">
                {value}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                {t(labelKey)}
              </p>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default GallerySection;
