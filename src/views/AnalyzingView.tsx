import { useState, useEffect } from 'react';
import * as m from 'framer-motion/m';
import { Circle, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useScanStore } from '@/store/scanStore';

/** Facial landmark positions for the SVG face overlay (reused from SherlockSection). */
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

const measurements = [
  { x1: 72, y1: 68, x2: 128, y2: 68 },
  { x1: 72, y1: 68, x2: 100, y2: 92 },
  { x1: 128, y1: 68, x2: 100, y2: 92 },
  { x1: 100, y1: 92, x2: 100, y2: 115 },
  { x1: 80, y1: 55, x2: 120, y2: 55 },
  { x1: 60, y1: 85, x2: 140, y2: 85 },
];

type StepStatus = 'pending' | 'active' | 'done';

const STEP_INTERVAL_MS = 3000;

const AnalyzingView = () => {
  const { t } = useTranslation();
  const userImage = useScanStore((s) => s.userImage);
  const selectedCelebName = useScanStore((s) => s.selectedCelebName);

  // Track which steps are completed (index-based). Steps fill in sequentially.
  const [completedUpTo, setCompletedUpTo] = useState(-1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < 5; i++) {
      const timer = setTimeout(() => {
        setCompletedUpTo(i);
      }, STEP_INTERVAL_MS * (i + 1));
      timers.push(timer);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  const getStepStatus = (index: number): StepStatus => {
    if (index < completedUpTo) return 'done';
    if (index === completedUpTo) return 'done';
    if (index === completedUpTo + 1) return 'active';
    return 'pending';
  };

  const steps = [
    t('analyzing.step1'),
    t('analyzing.step2'),
    t('analyzing.step3'),
    t('analyzing.step4', { celebName: selectedCelebName ?? 'Celeb' }),
    t('analyzing.step5'),
  ];

  return (
    <m.div
      key="analyzing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0A0A1A] flex flex-col items-center justify-center gap-12 px-4 py-16"
    >
      {/* Scanning portrait with face overlay */}
      <m.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-64 h-80 sm:w-72 sm:h-[22rem] md:w-80 md:h-[26rem] rounded-[3rem] overflow-hidden shadow-2xl shadow-[#FF4D8D]/10 border border-white/10"
      >
        {/* User selfie (grayscale + dimmed) */}
        {userImage && (
          <m.img
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12 }}
            src={`data:image/jpeg;base64,${userImage}`}
            className="w-full h-full object-cover grayscale opacity-40"
            alt="Scanning User"
          />
        )}

        {/* Pink gradient tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FF4D8D]/15 via-transparent to-[#FF4D8D]/5" />

        {/* SVG face silhouette with animated landmark dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 200 180"
            className="w-[70%] h-[70%]"
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
              strokeWidth="1"
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
              strokeWidth="0.5"
              opacity="0.15"
              strokeDasharray="4 3"
            />

            {/* Measurement lines */}
            {measurements.map((line, i) => (
              <m.line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#FF4D8D"
                strokeWidth="0.5"
                strokeDasharray="3 2"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Landmark dots with staggered pulse */}
            {landmarks.map((pt, i) => (
              <m.circle
                key={pt.label}
                cx={pt.cx}
                cy={pt.cy}
                r="2.5"
                fill="#FF4D8D"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.8, 0.4, 0.8],
                  scale: [0, 1.2, 0.8, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Center crosshair */}
            <m.line
              x1="95"
              y1="90"
              x2="105"
              y2="90"
              stroke="#FF4D8D"
              strokeWidth="0.8"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <m.line
              x1="100"
              y1="85"
              x2="100"
              y2="95"
              stroke="#FF4D8D"
              strokeWidth="0.8"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </div>

        {/* Animated scanline */}
        <m.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent"
          animate={{ top: ['5%', '95%', '5%'] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Corner brackets for scanning effect */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#FF4D8D]/50 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#FF4D8D]/50 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#FF4D8D]/50 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#FF4D8D]/50 rounded-br-lg" />
      </m.div>

      {/* 5-step progress checklist */}
      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-sm space-y-3"
      >
        {steps.map((label, idx) => {
          const status = getStepStatus(idx);

          return (
            <m.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.5 + idx * 0.12,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500 ${
                status === 'done'
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : status === 'active'
                    ? 'bg-[#FF4D8D]/10 border border-[#FF4D8D]/20'
                    : 'bg-white/5 border border-white/5'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {status === 'done' ? (
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle size={18} className="text-emerald-400" />
                  </m.div>
                ) : status === 'active' ? (
                  <m.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 size={18} className="text-[#FF4D8D]" />
                  </m.div>
                ) : (
                  <Circle size={18} className="text-gray-600" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-bold uppercase tracking-wider transition-colors duration-500 ${
                  status === 'done'
                    ? 'text-emerald-300'
                    : status === 'active'
                      ? 'text-[#FF4D8D]'
                      : 'text-gray-600'
                }`}
              >
                {label}
              </span>
            </m.div>
          );
        })}
      </m.div>

      {/* Pulsing "Decoding DNA..." text */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <m.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter heading-font italic text-white"
        >
          {t('analyzing.decodingDna')}
        </m.h2>
      </m.div>
    </m.div>
  );
};

export default AnalyzingView;
