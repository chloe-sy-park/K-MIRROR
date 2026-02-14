import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';

const HeroSection = () => {
  const { t } = useTranslation();
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number, rect: DOMRect) => {
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(percent);
    },
    [],
  );

  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      updatePosition(e.clientX, rect);
    },
    [dragging, updatePosition],
  );

  const handleTouchStart = () => setDragging(true);
  const handleTouchEnd = () => setDragging(false);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = e.currentTarget.getBoundingClientRect();
      updatePosition(touch.clientX, rect);
    },
    [dragging, updatePosition],
  );

  /** Pulsing data-point positions (top%, left%) */
  const dataPoints = [
    { top: '18%', left: '25%', delay: 0 },
    { top: '42%', left: '70%', delay: 0.4 },
    { top: '65%', left: '35%', delay: 0.8 },
    { top: '30%', left: '55%', delay: 1.2 },
    { top: '78%', left: '60%', delay: 1.6 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0F0F0F]">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F] via-[#0F0F0F]/90 to-[#0F0F0F]" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF4D8D]/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-32 flex flex-col lg:flex-row items-center gap-16">
        {/* ── Text column ── */}
        <div className="flex-1 text-center lg:text-left">
          <m.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-black heading-font tracking-tighter uppercase leading-[0.95] text-white"
          >
            {t('landing.hero.title')}{' '}
            <span className="text-[#FF4D8D]">
              {t('landing.hero.titleAccent')}
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-lg md:text-xl text-gray-400 max-w-lg mx-auto lg:mx-0"
          >
            {t('landing.hero.subtitle')}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              to="/scan"
              className="px-8 py-4 bg-[#FF4D8D] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#e8447f] transition-colors text-center"
            >
              {t('landing.hero.cta')}
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:border-[#FF4D8D] hover:text-[#FF4D8D] transition-colors text-center"
            >
              {t('landing.hero.ctaSecondary')}
            </a>
          </m.div>
        </div>

        {/* ── Before / After slider column ── */}
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full max-w-xl"
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden select-none cursor-col-resize"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* "Before" side — full background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" />

            {/* "After" side — clipped on top */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#FF4D8D] via-[#FF8E53] to-[#FFD166]"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            />

            {/* Scanline overlay */}
            <div className="animate-scanline absolute inset-0 w-full h-1/3 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Pulsing data points */}
            {dataPoints.map((pt, i) => (
              <m.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 2.4,
                  delay: pt.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none"
                style={{ top: pt.top, left: pt.left }}
              />
            ))}

            {/* Labels */}
            <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-[0.25em] text-white/70 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
              {t('landing.hero.beforeLabel')}
            </span>
            <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.25em] text-white/70 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
              {t('landing.hero.afterLabel')}
            </span>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
              style={{ left: `${position}%` }}
            />

            {/* Draggable handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-col-resize z-10"
              style={{ left: `${position}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              role="slider"
              aria-valuenow={Math.round(position)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Before after comparison slider"
              tabIndex={0}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-gray-600"
              >
                <path
                  d="M5 3L2 8L5 13M11 3L14 8L11 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default HeroSection;
