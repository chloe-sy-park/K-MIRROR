import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Upload, Cpu, Sparkles } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

const steps = [
  {
    icon: Upload,
    number: '01',
    titleKey: 'landing.howItWorks.step1Title',
    descKey: 'landing.howItWorks.step1Desc',
  },
  {
    icon: Cpu,
    number: '02',
    titleKey: 'landing.howItWorks.step2Title',
    descKey: 'landing.howItWorks.step2Desc',
  },
  {
    icon: Sparkles,
    number: '03',
    titleKey: 'landing.howItWorks.step3Title',
    descKey: 'landing.howItWorks.step3Desc',
  },
] as const;

const HowItWorksSection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  return (
    <section
      id="how-it-works"
      className="landing-section py-24 px-6 lg:px-12"
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
            className="text-4xl md:text-5xl font-black heading-font tracking-tighter uppercase"
          >
            {t('landing.howItWorks.title')}
          </m.h2>
          <m.p
            variants={fadeInUpVariants}
            className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto"
          >
            {t('landing.howItWorks.subtitle')}
          </m.p>
        </m.div>

        {/* Steps grid */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="relative grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Connection lines between cards (desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 px-16 pointer-events-none">
            <div className="border-t-2 border-dashed border-gray-200 w-full" />
          </div>

          {steps.map(({ icon: Icon, number, titleKey, descKey }) => (
            <m.div
              key={titleKey}
              variants={fadeInUpVariants}
              className="relative bg-white border border-gray-100 rounded-[2rem] p-8 hover:border-[#FF4D8D]/30 transition-colors"
            >
              {/* Number badge */}
              <div className="w-8 h-8 rounded-full bg-[#FF4D8D] flex items-center justify-center mb-6">
                <span className="text-white text-xs font-black">
                  {number}
                </span>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#FF4D8D]/10 flex items-center justify-center mb-6">
                <Icon size={24} className="text-[#FF4D8D]" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-black heading-font uppercase tracking-tight mb-3">
                {t(titleKey)}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t(descKey)}
              </p>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
