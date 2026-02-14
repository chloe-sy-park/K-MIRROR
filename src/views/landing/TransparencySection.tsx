import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUpVariants,
  staggerContainerVariants,
} from '@/constants/animations';

/* ── Radar chart data ── */
const radarData = [
  { labelKey: 'landing.transparency.radarHydration', value: 0.85 },
  { labelKey: 'landing.transparency.radarBrightening', value: 0.78 },
  { labelKey: 'landing.transparency.radarAntiAging', value: 0.92 },
  { labelKey: 'landing.transparency.radarSoothing', value: 0.88 },
  { labelKey: 'landing.transparency.radarProtection', value: 0.95 },
];

const AXES = 5;
const CENTER = 150;
const RADIUS = 110;

/** Convert polar to cartesian for a pentagon layout (top-start, clockwise). */
const polarToXY = (index: number, scale: number) => {
  // Start from top (-90 deg) and go clockwise
  const angle = (Math.PI * 2 * index) / AXES - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * RADIUS * scale,
    y: CENTER + Math.sin(angle) * RADIUS * scale,
  };
};

/** Build a polygon points string from an array of scales (0-1 per axis). */
const buildPolygonPoints = (scales: number[]) =>
  scales.map((s, i) => {
    const { x, y } = polarToXY(i, s);
    return `${x},${y}`;
  }).join(' ');

/* ── Grid rings (20%, 40%, 60%, 80%, 100%) ── */
const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0];

/* ── Component ── */
const TransparencySection = () => {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollAnimation();

  const dataPoints = buildPolygonPoints(radarData.map((d) => d.value));

  return (
    <section className="landing-section py-24 px-6 lg:px-12 bg-[#F5F5F7]">
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
            {t('landing.transparency.title')}
          </m.h2>
          <m.p
            variants={fadeInUpVariants}
            className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto"
          >
            {t('landing.transparency.subtitle')}
          </m.p>
        </m.div>

        {/* Two-column layout */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left — Radar chart */}
          <m.div
            variants={fadeInUpVariants}
            className="flex items-center justify-center"
          >
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[380px]"
              role="img"
              aria-label={t('landing.transparency.ingredientAnalysis')}
            >
              {/* Grid rings */}
              {gridRings.map((scale) => (
                <polygon
                  key={scale}
                  points={buildPolygonPoints(
                    Array.from({ length: AXES }, () => scale),
                  )}
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="0.5"
                />
              ))}

              {/* Axis lines */}
              {Array.from({ length: AXES }).map((_, i) => {
                const { x, y } = polarToXY(i, 1);
                return (
                  <line
                    key={i}
                    x1={CENTER}
                    y1={CENTER}
                    x2={x}
                    y2={y}
                    stroke="#D1D5DB"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Data polygon */}
              <polygon
                points={dataPoints}
                fill="#FF4D8D"
                fillOpacity="0.2"
                stroke="#FF4D8D"
                strokeWidth="2"
              />

              {/* Data points (dots) */}
              {radarData.map((d, i) => {
                const { x, y } = polarToXY(i, d.value);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#FF4D8D"
                  />
                );
              })}

              {/* Axis labels */}
              {radarData.map((d, i) => {
                const { x, y } = polarToXY(i, 1.22);
                return (
                  <text
                    key={d.labelKey}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-gray-600 text-[11px] font-semibold"
                  >
                    {t(d.labelKey)}
                  </text>
                );
              })}
            </svg>
          </m.div>

          {/* Right — Safety score + info */}
          <m.div variants={fadeInUpVariants} className="space-y-8">
            {/* Safety score card */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">
                {t('landing.transparency.safetyScore')}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black heading-font text-[#FF4D8D]">
                  94
                </span>
                <span className="text-2xl font-black heading-font text-gray-300">
                  /100
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-6 w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <m.div
                  className="h-full rounded-full bg-[#FF4D8D]"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '94%' } : { width: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />
              </div>
            </div>

            {/* Ingredient analysis label */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">
                {t('landing.transparency.ingredientAnalysis')}
              </p>
              <ul className="space-y-3">
                {radarData.map((d) => (
                  <li
                    key={d.labelKey}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 font-medium">
                      {t(d.labelKey)}
                    </span>
                    <span className="text-sm font-black heading-font text-[#FF4D8D]">
                      {Math.round(d.value * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
};

export default TransparencySection;
