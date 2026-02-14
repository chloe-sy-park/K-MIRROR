import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Heart, Target, Shield } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

const cards = [
  {
    icon: Heart,
    titleKey: 'landing.valueProps.card1Title',
    descKey: 'landing.valueProps.card1Desc',
    accent: 'from-[#FF4D8D]/10 to-[#FFB5D6]/10',
  },
  {
    icon: Target,
    titleKey: 'landing.valueProps.card2Title',
    descKey: 'landing.valueProps.card2Desc',
    accent: 'from-[#6C5CE7]/10 to-[#A29BFE]/10',
  },
  {
    icon: Shield,
    titleKey: 'landing.valueProps.card3Title',
    descKey: 'landing.valueProps.card3Desc',
    accent: 'from-[#00B894]/10 to-[#55EFC4]/10',
  },
] as const;

const ValuePropSection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  return (
    <section className="landing-section py-24 px-6 lg:px-12">
      <m.div
        ref={ref}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="max-w-6xl mx-auto space-y-16 lg:space-y-24"
      >
        {cards.map(({ icon: Icon, titleKey, descKey, accent }, i) => {
          const isReversed = i % 2 === 1;

          return (
            <m.div
              key={titleKey}
              variants={fadeInUpVariants}
              className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-center`}
            >
              {/* Illustration area */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className={`w-48 h-48 lg:w-64 lg:h-64 rounded-[3rem] bg-gradient-to-br ${accent} flex items-center justify-center`}
                >
                  <Icon
                    size={64}
                    className="text-[#FF4D8D]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Text area */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-black heading-font uppercase tracking-tight mb-4 text-[#0F0F0F]">
                  {t(titleKey)}
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {t(descKey)}
                </p>
              </div>
            </m.div>
          );
        })}
      </m.div>
    </section>
  );
};

export default ValuePropSection;
