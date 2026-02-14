import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Brain, Eye, Scan } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

const techCards = [
  { icon: Brain, titleKey: 'landing.sherlock.neuralTitle', descKey: 'landing.sherlock.neuralDesc' },
  { icon: Eye, titleKey: 'landing.sherlock.biometricTitle', descKey: 'landing.sherlock.biometricDesc' },
  { icon: Scan, titleKey: 'landing.sherlock.spectralTitle', descKey: 'landing.sherlock.spectralDesc' },
] as const;

const stats = [
  { value: '97.3%', labelKey: 'landing.sherlock.statAccuracy' },
  { value: '50K+', labelKey: 'landing.sherlock.statScans' },
  { value: '200+', labelKey: 'landing.sherlock.statCelebs' },
  { value: '1000+', labelKey: 'landing.sherlock.statProducts' },
] as const;

const SherlockSection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  return (
    <section
      id="features"
      className="landing-section py-24 px-6 lg:px-12 bg-white"
    >
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
            className="text-4xl md:text-5xl font-black heading-font tracking-tighter uppercase text-[#0F0F0F]"
          >
            {t('landing.sherlock.title')}
          </m.h2>
          <m.p
            variants={fadeInUpVariants}
            className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto"
          >
            {t('landing.sherlock.subtitle')}
          </m.p>
        </m.div>

        {/* Technology cards */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {techCards.map(({ icon: Icon, titleKey, descKey }) => (
            <m.div
              key={titleKey}
              variants={fadeInUpVariants}
              className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 hover:border-[#FF4D8D]/40 hover:bg-white transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FF4D8D]/10 flex items-center justify-center mb-6">
                <Icon size={24} className="text-[#FF4D8D]" />
              </div>
              <h3 className="text-xl font-black heading-font uppercase tracking-tight mb-3 text-[#0F0F0F]">
                {t(titleKey)}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t(descKey)}
              </p>
            </m.div>
          ))}
        </m.div>

        {/* Stats row */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 pt-12"
        >
          {stats.map(({ value, labelKey }) => (
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

export default SherlockSection;
