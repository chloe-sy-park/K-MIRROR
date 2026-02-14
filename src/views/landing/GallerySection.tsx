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
    image:
      'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?w=400&h=500&fit=crop&crop=face&auto=format&q=80',
    accent: '#FF4D8D',
  },
  {
    labelKey: 'landing.gallery.southAsian',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face&auto=format&q=80',
    accent: '#FF8E53',
  },
  {
    labelKey: 'landing.gallery.african',
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face&auto=format&q=80',
    accent: '#6C5CE7',
  },
  {
    labelKey: 'landing.gallery.european',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face&auto=format&q=80',
    accent: '#00B894',
  },
  {
    labelKey: 'landing.gallery.latinAmerican',
    image:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face&auto=format&q=80',
    accent: '#E17055',
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
            {galleryCards.map(({ labelKey, image, accent }) => (
              <div
                key={labelKey}
                className="group min-w-[280px] h-[400px] rounded-[2rem] overflow-hidden relative flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <img
                  src={image}
                  alt={t(labelKey)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${accent}30, transparent 60%)`,
                  }}
                />
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
