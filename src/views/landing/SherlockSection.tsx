import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Brain, Eye, Scan } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

const techCards = [
  {
    icon: Brain,
    titleKey: 'landing.sherlock.neuralTitle',
    descKey: 'landing.sherlock.neuralDesc',
  },
  {
    icon: Eye,
    titleKey: 'landing.sherlock.biometricTitle',
    descKey: 'landing.sherlock.biometricDesc',
  },
  {
    icon: Scan,
    titleKey: 'landing.sherlock.spectralTitle',
    descKey: 'landing.sherlock.spectralDesc',
  },
] as const;

const stats = [
  { value: '97.3%', labelKey: 'landing.sherlock.statAccuracy' },
  { value: '50K+', labelKey: 'landing.sherlock.statScans' },
  { value: '200+', labelKey: 'landing.sherlock.statCelebs' },
  { value: '1000+', labelKey: 'landing.sherlock.statProducts' },
] as const;

/** Facial landmark positions for SVG visualization */
const landmarks = [
  { cx: 72, cy: 68, label: 'L-eye' },
  { cx: 128, cy: 68, label: 'R-eye' },
  { cx: 100, cy: 92, label: 'Nose' },
  { cx: 100, cy: 115, label: 'Mouth' },
  { cx: 60, cy: 85, label: 'L-cheek' },
  { cx: 140, cy: 85, label: 'R-cheek' },
  { cx: 80, cy: 55, label: 'L-brow' },
  { cx: 120, cy: 55, label: 'R-brow' },
  { cx: 100, cy: 42, label: 'Forehead' },
  { cx: 100, cy: 135, label: 'Chin' },
];

/** Measurement lines between landmarks */
const measurements = [
  { x1: 72, y1: 68, x2: 128, y2: 68 },
  { x1: 72, y1: 68, x2: 100, y2: 92 },
  { x1: 128, y1: 68, x2: 100, y2: 92 },
  { x1: 100, y1: 92, x2: 100, y2: 115 },
  { x1: 80, y1: 55, x2: 120, y2: 55 },
  { x1: 60, y1: 85, x2: 140, y2: 85 },
];

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

        {/* 2-col: Face visualization + Tech cards */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
        >
          {/* Left: Face analysis SVG */}
          <m.div
            variants={fadeInUpVariants}
            className="flex items-center justify-center"
          >
            <div className="relative w-72 h-72 lg:w-80 lg:h-80">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full bg-[#FF4D8D]/5" />

              <svg
                viewBox="0 0 200 180"
                className="w-full h-full"
                aria-hidden="true"
              >
                {/* Face outline */}
                <ellipse
                  cx="100"
                  cy="90"
                  rx="55"
                  ry="70"
                  fill="none"
                  stroke="#FF4D8D"
                  strokeWidth="1.2"
                  opacity="0.3"
                />

                {/* Inner structure ellipse */}
                <ellipse
                  cx="100"
                  cy="85"
                  rx="35"
                  ry="30"
                  fill="none"
                  stroke="#FF4D8D"
                  strokeWidth="0.6"
                  opacity="0.15"
                  strokeDasharray="4 3"
                />

                {/* Measurement lines */}
                {measurements.map((line, i) => (
                  <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#FF4D8D"
                    strokeWidth="0.6"
                    strokeDasharray="3 2"
                    opacity="0.3"
                  />
                ))}

                {/* Landmark points */}
                {landmarks.map((pt) => (
                  <circle
                    key={pt.label}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="3"
                    fill="#FF4D8D"
                    opacity="0.5"
                  />
                ))}

                {/* Center crosshair */}
                <line
                  x1="95"
                  y1="90"
                  x2="105"
                  y2="90"
                  stroke="#FF4D8D"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
                <line
                  x1="100"
                  y1="85"
                  x2="100"
                  y2="95"
                  stroke="#FF4D8D"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
              </svg>

              {/* Animated scan line */}
              <m.div
                className="absolute left-4 right-4 h-px bg-[#FF4D8D]/40"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>
          </m.div>

          {/* Right: Stacked tech cards */}
          <div className="space-y-4">
            {techCards.map(({ icon: Icon, titleKey, descKey }) => (
              <m.div
                key={titleKey}
                variants={fadeInUpVariants}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex gap-5 items-start hover:border-[#FF4D8D]/40 hover:bg-white transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF4D8D]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-[#FF4D8D]" />
                </div>
                <div>
                  <h3 className="text-lg font-black heading-font uppercase tracking-tight mb-2 text-[#0F0F0F]">
                    {t(titleKey)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
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
