import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Star } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

/* ── Animated counter hook ── */
const useCountUp = (target: number, isInView: boolean, duration = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      start = Math.round(eased * target);
      setValue(start);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return value;
};

/* ── Stats data ── */
const statsConfig = [
  { target: 50000, suffix: '+', labelKey: 'landing.reviews.statUsers' },
  { target: 4.9, suffix: '', labelKey: 'landing.reviews.statRating', decimal: true },
  { target: 120, suffix: '+', labelKey: 'landing.reviews.statCountries' },
] as const;

/* ── Reviews data ── */
const reviews = [
  {
    nameKey: 'landing.reviews.review1Name',
    locationKey: 'landing.reviews.review1Location',
    textKey: 'landing.reviews.review1Text',
    color: '#FF4D8D',
  },
  {
    nameKey: 'landing.reviews.review2Name',
    locationKey: 'landing.reviews.review2Location',
    textKey: 'landing.reviews.review2Text',
    color: '#6C5CE7',
  },
  {
    nameKey: 'landing.reviews.review3Name',
    locationKey: 'landing.reviews.review3Location',
    textKey: 'landing.reviews.review3Text',
    color: '#00B894',
  },
] as const;

/* ── Stat counter component ── */
const StatCounter = ({
  target,
  suffix,
  labelKey,
  decimal,
  isInView,
}: {
  target: number;
  suffix: string;
  labelKey: string;
  decimal?: boolean;
  isInView: boolean;
}) => {
  const { t } = useTranslation();
  const count = useCountUp(decimal ? target * 10 : target, isInView);
  const display = decimal
    ? (count / 10).toFixed(1)
    : count.toLocaleString();

  return (
    <m.div variants={fadeInUpVariants} className="text-center">
      <p className="text-3xl md:text-4xl font-black heading-font text-[#FF4D8D]">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
        {t(labelKey)}
      </p>
    </m.div>
  );
};

/* ── Main component ── */
const ReviewsSection = () => {
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
          className="text-center mb-16"
        >
          <m.h2
            variants={fadeInUpVariants}
            className="text-4xl md:text-5xl font-black heading-font tracking-tighter uppercase"
          >
            {t('landing.reviews.title')}
          </m.h2>
        </m.div>

        {/* Stats row */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-3 gap-8 mb-16 border-b border-gray-100 pb-12"
        >
          {statsConfig.map(({ target, suffix, labelKey, ...rest }) => (
            <StatCounter
              key={labelKey}
              target={target}
              suffix={suffix}
              labelKey={labelKey}
              decimal={'decimal' in rest ? rest.decimal : false}
              isInView={isInView}
            />
          ))}
        </m.div>

        {/* Review cards */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {reviews.map(({ nameKey, locationKey, textKey, color }) => {
            const name = t(nameKey);
            const initial = name.charAt(0).toUpperCase();

            return (
              <m.div
                key={nameKey}
                variants={fadeInUpVariants}
                className="bg-white border border-gray-100 rounded-[2rem] p-8 hover:border-[#FF4D8D]/30 transition-colors"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg"
                    style={{ backgroundColor: color }}
                  >
                    {initial}
                  </div>
                  <div>
                    <p className="font-black heading-font text-sm uppercase tracking-tight">
                      {name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {t(locationKey)}
                    </p>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(textKey)}
                </p>
              </m.div>
            );
          })}
        </m.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
