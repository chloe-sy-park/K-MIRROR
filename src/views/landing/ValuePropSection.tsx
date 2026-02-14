import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Heart, Target, Shield } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

const cards = [
  { icon: Heart, titleKey: 'landing.valueProps.card1Title', descKey: 'landing.valueProps.card1Desc' },
  { icon: Target, titleKey: 'landing.valueProps.card2Title', descKey: 'landing.valueProps.card2Desc' },
  { icon: Shield, titleKey: 'landing.valueProps.card3Title', descKey: 'landing.valueProps.card3Desc' },
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
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {cards.map(({ icon: Icon, titleKey, descKey }) => (
          <m.div
            key={titleKey}
            variants={fadeInUpVariants}
            className="bg-white border border-gray-100 rounded-[2rem] p-8 hover:border-[#FF4D8D] transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF4D8D]/10 flex items-center justify-center mb-6">
              <Icon size={24} className="text-[#FF4D8D]" />
            </div>
            <h3 className="text-xl font-black heading-font uppercase tracking-tight mb-3">
              {t(titleKey)}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t(descKey)}
            </p>
          </m.div>
        ))}
      </m.div>
    </section>
  );
};

export default ValuePropSection;
