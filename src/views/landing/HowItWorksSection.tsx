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
      <div ref={ref} className="max-w-5xl mx-auto">
        {/* Header */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-20"
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

        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Desktop: horizontal timeline */}
          <div className="hidden lg:block relative">
            {/* Connection line */}
            <div className="absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gray-200">
              <m.div
                className="h-full bg-[#FF4D8D]"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
              />
            </div>

            <div className="grid grid-cols-3 gap-8">
              {steps.map(({ icon: Icon, number, titleKey, descKey }) => (
                <m.div
                  key={titleKey}
                  variants={fadeInUpVariants}
                  className="flex flex-col items-center text-center"
                >
                  {/* Circle node */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-white border-2 border-[#FF4D8D] flex items-center justify-center mb-8 shadow-md">
                    <Icon size={24} className="text-[#FF4D8D]" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4D8D] mb-3">
                    {number}
                  </span>
                  <h3 className="text-xl font-black heading-font uppercase tracking-tight mb-3">
                    {t(titleKey)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                    {t(descKey)}
                  </p>
                </m.div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="lg:hidden relative pl-12">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200">
              <m.div
                className="w-full bg-[#FF4D8D]"
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                style={{ transformOrigin: 'top' }}
              />
            </div>

            {steps.map(({ icon: Icon, number, titleKey, descKey }) => (
              <m.div
                key={titleKey}
                variants={fadeInUpVariants}
                className="relative mb-12 last:mb-0"
              >
                {/* Circle node */}
                <div className="absolute -left-12 top-0 z-10 w-8 h-8 rounded-full bg-white border-2 border-[#FF4D8D] flex items-center justify-center shadow-sm">
                  <span className="text-[#FF4D8D] text-[10px] font-black">
                    {number}
                  </span>
                </div>

                {/* Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF4D8D]/10 flex items-center justify-center">
                      <Icon size={20} className="text-[#FF4D8D]" />
                    </div>
                    <h3 className="text-lg font-black heading-font uppercase tracking-tight">
                      {t(titleKey)}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
