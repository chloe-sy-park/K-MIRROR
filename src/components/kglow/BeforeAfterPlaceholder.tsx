import * as m from 'framer-motion/m';

interface BeforeAfterPlaceholderProps {
  userImage: string | null;
  celebName: string;
  className?: string;
}

/**
 * BeforeAfterPlaceholder — Split before/after image area for the K-GLOW card.
 *
 * This is a placeholder component. It will be replaced by a Canvas overlay
 * engine in a future phase. Keep the prop interface stable.
 */
const BeforeAfterPlaceholder = ({
  userImage,
  celebName,
  className = '',
}: BeforeAfterPlaceholderProps) => {
  return (
    <div
      className={`relative w-full aspect-video overflow-hidden rounded-lg border border-[#1A1A2E] ${className}`}
    >
      {/* ── Left: BEFORE ─────────────────────────────── */}
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
        {userImage ? (
          <img
            src={userImage}
            alt="Before"
            className="h-full w-full object-cover grayscale"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1A1A2E] to-[#0A0A1A]" />
        )}

        {/* Dim overlay */}
        <div className="absolute inset-0 bg-[#0A0A1A]/30" />

        {/* Badge */}
        <m.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#8B8BA3] bg-[#0A0A1A]/70 rounded"
        >
          BEFORE
        </m.span>
      </div>

      {/* ── Right: AFTER ─────────────────────────────── */}
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
        {userImage ? (
          <img
            src={userImage}
            alt={`After — ${celebName} vibe`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-bl from-[#1A1A2E] to-[#0A0A1A]" />
        )}

        {/* Neon pink / cyber blue tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D9B]/20 to-[#00D4FF]/10 mix-blend-screen" />

        {/* Scan-line SVG overlay — simplified face outline */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer face contour */}
          <m.ellipse
            cx="100"
            cy="105"
            rx="55"
            ry="70"
            stroke="#00D4FF"
            strokeWidth="0.6"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Left eye */}
          <m.ellipse
            cx="80"
            cy="90"
            rx="12"
            ry="5"
            stroke="#FF2D9B"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.4, delay: 0.6 }}
          />

          {/* Right eye */}
          <m.ellipse
            cx="120"
            cy="90"
            rx="12"
            ry="5"
            stroke="#FF2D9B"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.4, delay: 0.8 }}
          />

          {/* Nose line */}
          <m.line
            x1="100"
            y1="95"
            x2="100"
            y2="115"
            stroke="#00D4FF"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 1, delay: 1.0 }}
          />

          {/* Lip arc */}
          <m.path
            d="M88 125 Q100 133 112 125"
            stroke="#FF2D9B"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.2, delay: 1.2 }}
          />

          {/* Horizontal scan line */}
          <m.line
            x1="30"
            y1="100"
            x2="170"
            y2="100"
            stroke="#00D4FF"
            strokeWidth="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0], y1: [60, 140, 60], y2: [60, 140, 60] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner brackets — top-left */}
          <path d="M30 40 L30 30 L40 30" stroke="#00D4FF" strokeWidth="0.5" opacity="0.4" />
          {/* Corner brackets — top-right */}
          <path d="M160 30 L170 30 L170 40" stroke="#00D4FF" strokeWidth="0.5" opacity="0.4" />
          {/* Corner brackets — bottom-left */}
          <path d="M30 160 L30 170 L40 170" stroke="#00D4FF" strokeWidth="0.5" opacity="0.4" />
          {/* Corner brackets — bottom-right */}
          <path d="M160 170 L170 170 L170 160" stroke="#00D4FF" strokeWidth="0.5" opacity="0.4" />
        </svg>

        {/* Badge */}
        <m.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#00D4FF] bg-[#0A0A1A]/70 rounded"
        >
          AFTER
        </m.span>
      </div>

      {/* Center divider */}
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#FF2D9B]/50 to-transparent" />
    </div>
  );
};

export default BeforeAfterPlaceholder;
