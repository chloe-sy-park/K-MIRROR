import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { fadeInUpVariants, staggerContainerVariants } from '@/constants/animations';

const CTASection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  return (
    <section className="landing-section relative overflow-hidden bg-[#0F0F0F] text-white py-32 px-6 lg:px-12">
      {/* Decorative gradient circles */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#FF4D8D]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#FF4D8D]/5 blur-[100px] pointer-events-none" />

      <div ref={ref} className="relative max-w-4xl mx-auto text-center">
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <m.h2
            variants={fadeInUpVariants}
            className="text-4xl md:text-6xl font-black heading-font tracking-tighter uppercase leading-tight"
          >
            {t('landing.cta.title')}
          </m.h2>

          <m.p
            variants={fadeInUpVariants}
            className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto"
          >
            {t('landing.cta.subtitle')}
          </m.p>

          <m.div variants={fadeInUpVariants} className="mt-10">
            <Link
              to="/scan"
              className="inline-block px-10 py-4 rounded-full font-black text-sm uppercase tracking-wider bg-[#FF4D8D] text-white hover:bg-[#e6437d] transition-colors shadow-lg shadow-[#FF4D8D]/25"
            >
              {t('landing.cta.button')}
            </Link>
          </m.div>
        </m.div>
      </div>
    </section>
  );
};

export default CTASection;
