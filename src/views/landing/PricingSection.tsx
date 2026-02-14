import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

/* ── Pricing tiers config ── */
const tiers = [
  {
    nameKey: 'landing.pricing.free',
    priceKey: 'landing.pricing.freePrice',
    periodKey: null,
    features: [
      'landing.pricing.freeFeature1',
      'landing.pricing.freeFeature2',
      'landing.pricing.freeFeature3',
    ],
    ctaKey: 'landing.pricing.freeCta',
    highlighted: false,
    badgeKey: null,
  },
  {
    nameKey: 'landing.pricing.pro',
    priceKey: 'landing.pricing.proPrice',
    periodKey: 'landing.pricing.proPeriod',
    features: [
      'landing.pricing.proFeature1',
      'landing.pricing.proFeature2',
      'landing.pricing.proFeature3',
      'landing.pricing.proFeature4',
    ],
    ctaKey: 'landing.pricing.proCta',
    highlighted: true,
    badgeKey: 'landing.pricing.proPopular',
  },
  {
    nameKey: 'landing.pricing.premium',
    priceKey: 'landing.pricing.premiumPrice',
    periodKey: 'landing.pricing.premiumPeriod',
    features: [
      'landing.pricing.premiumFeature1',
      'landing.pricing.premiumFeature2',
      'landing.pricing.premiumFeature3',
      'landing.pricing.premiumFeature4',
    ],
    ctaKey: 'landing.pricing.premiumCta',
    highlighted: false,
    badgeKey: null,
  },
] as const;

/* ── Component ── */
const PricingSection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  return (
    <section id="pricing" className="landing-section py-24 px-6 lg:px-12">
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
            {t('landing.pricing.title')}
          </m.h2>
          <m.p
            variants={fadeInUpVariants}
            className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto"
          >
            {t('landing.pricing.subtitle')}
          </m.p>
        </m.div>

        {/* Pricing cards */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
        >
          {tiers.map((tier) => (
            <m.div
              key={tier.nameKey}
              variants={fadeInUpVariants}
              className={
                tier.highlighted
                  ? 'bg-white border-2 border-[#FF4D8D] rounded-[2rem] p-8 scale-105 shadow-xl relative'
                  : 'bg-white border border-gray-200 rounded-[2rem] p-8 relative'
              }
            >
              {/* Popular badge */}
              {tier.badgeKey && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FF4D8D] text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full">
                    {t(tier.badgeKey)}
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">
                {t(tier.nameKey)}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black heading-font">
                  {t(tier.priceKey)}
                </span>
                {tier.periodKey && (
                  <span className="text-gray-400 text-sm">
                    {t(tier.periodKey)}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((featureKey) => (
                  <li key={featureKey} className="flex items-center gap-3">
                    <Check
                      size={18}
                      className={
                        tier.highlighted
                          ? 'text-[#FF4D8D] flex-shrink-0'
                          : 'text-gray-400 flex-shrink-0'
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {t(featureKey)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link
                to="/scan"
                className={
                  tier.highlighted
                    ? 'block w-full text-center py-3 rounded-full font-black text-sm uppercase tracking-wider bg-[#FF4D8D] text-white hover:bg-[#e6437d] transition-colors'
                    : 'block w-full text-center py-3 rounded-full font-black text-sm uppercase tracking-wider bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                }
              >
                {t(tier.ctaKey)}
              </Link>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default PricingSection;
