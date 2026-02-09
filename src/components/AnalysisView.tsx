import React from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Droplets, Eye, Sparkles, Plus, Play, ExternalLink,
  RotateCcw, Camera,
} from 'lucide-react';
import { AnalysisResult } from '../types';

/* ── Sherlock Result Diagram (vector-line data visualization) */

const SherlockResultDiagram: React.FC<{
  result: AnalysisResult;
  userImage: string | null;
}> = ({ result, userImage }) => (
  <div className="relative w-full max-w-sm mx-auto">
    {/* Background: user photo or abstract silhouette */}
    <div className="aspect-[3/4] rounded-[3rem] overflow-hidden relative bg-gray-50 border border-gray-100 shadow-xl">
      {userImage ? (
        <img
          src={`data:image/jpeg;base64,${userImage}`}
          className="w-full h-full object-cover opacity-30 grayscale"
          alt="Analysis subject"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100" />
      )}

      {/* SVG overlay with result-driven values */}
      <svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox="0 0 300 400"
        fill="none"
      >
        {/* Center vertical axis */}
        <line
          x1="150" y1="40" x2="150" y2="360"
          stroke="white" strokeWidth="0.5" opacity="0.3"
          strokeDasharray="4 4"
        />

        {/* Upper third zone */}
        <line x1="40" y1="100" x2="260" y2="100" stroke="#FF4D8D" strokeWidth="0.6" className="sherlock-line" style={{ animationDelay: '0.2s' }} />
        <rect x="40" y="100" width="220" height="80" fill="#FF4D8D" opacity="0.03" className="sherlock-line" style={{ animationDelay: '0.3s' }} />

        {/* Middle third zone */}
        <line x1="40" y1="180" x2="260" y2="180" stroke="#FF4D8D" strokeWidth="0.6" className="sherlock-line" style={{ animationDelay: '0.5s' }} />
        <rect x="40" y="180" width="220" height="80" fill="#FF4D8D" opacity="0.03" className="sherlock-line" style={{ animationDelay: '0.6s' }} />

        {/* Lower third zone */}
        <line x1="40" y1="260" x2="260" y2="260" stroke="#FF4D8D" strokeWidth="0.6" className="sherlock-line" style={{ animationDelay: '0.8s' }} />
        <rect x="40" y="260" width="220" height="80" fill="#FF4D8D" opacity="0.03" className="sherlock-line" style={{ animationDelay: '0.9s' }} />

        {/* Eye angle indicator */}
        <line x1="90" y1="148" x2="210" y2="140" stroke="#FF4D8D" strokeWidth="1" className="sherlock-line" style={{ animationDelay: '1.0s' }} />
        <circle cx="90" cy="148" r="3" fill="#FF4D8D" opacity="0.8" className="sherlock-line" style={{ animationDelay: '1.1s' }} />
        <circle cx="210" cy="140" r="3" fill="#FF4D8D" opacity="0.8" className="sherlock-line" style={{ animationDelay: '1.1s' }} />

        {/* Cheekbone markers */}
        <line x1="70" y1="195" x2="110" y2="185" stroke="white" strokeWidth="0.8" opacity="0.6" className="sherlock-line" style={{ animationDelay: '1.3s' }} />
        <line x1="190" y1="185" x2="230" y2="195" stroke="white" strokeWidth="0.8" opacity="0.6" className="sherlock-line" style={{ animationDelay: '1.3s' }} />

        {/* Jaw contour hint */}
        <path
          d="M100 290 Q150 340 200 290"
          stroke="white" strokeWidth="0.6" fill="none" opacity="0.4"
          className="sherlock-line" style={{ animationDelay: '1.5s' }}
        />

        {/* Data labels — right side */}
        <text x="268" y="98" fill="#FF4D8D" fontSize="7" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '0.4s' }}>
          UPPER
        </text>
        <text x="268" y="108" fill="white" fontSize="6" fontFamily="monospace" opacity="0.7" className="sherlock-line" style={{ animationDelay: '0.4s' }}>
          {result.sherlock.proportions.upper}
        </text>

        <text x="268" y="178" fill="#FF4D8D" fontSize="7" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '0.7s' }}>
          MID
        </text>
        <text x="268" y="188" fill="white" fontSize="6" fontFamily="monospace" opacity="0.7" className="sherlock-line" style={{ animationDelay: '0.7s' }}>
          {result.sherlock.proportions.middle}
        </text>

        <text x="268" y="258" fill="#FF4D8D" fontSize="7" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '1.0s' }}>
          LOWER
        </text>
        <text x="268" y="268" fill="white" fontSize="6" fontFamily="monospace" opacity="0.7" className="sherlock-line" style={{ animationDelay: '1.0s' }}>
          {result.sherlock.proportions.lower}
        </text>

        {/* Eye angle label */}
        <text x="215" y="135" fill="white" fontSize="6" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '1.2s' }}>
          EYE {result.sherlock.eyeAngle}
        </text>

        {/* Bone structure label at bottom */}
        <text x="150" y="375" fill="#FF4D8D" fontSize="6" fontFamily="monospace" textAnchor="middle" className="sherlock-line" style={{ animationDelay: '1.6s' }}>
          {result.sherlock.boneStructure.toUpperCase()}
        </text>
      </svg>
    </div>

    {/* Floating badge */}
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
      Sherlock Mapped &middot; {result.sherlock.facialVibe}
    </div>
  </div>
);

/* ── Inclusion Guard: Dual Swatch (Standard vs Personalized) */

const DualSwatch: React.FC<{
  originalColor: string;
  label: string;
  melaninIndex: number;
}> = ({ originalColor, label, melaninIndex }) => {
  const personalizedOpacity = Math.max(0.25, 1 - melaninIndex * 0.13);
  const skinOverlay = melaninIndex * 0.05;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5 items-end">
        {/* Standard Swatch */}
        <div className="flex flex-col items-center">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-100 shadow-sm"
            style={{ backgroundColor: originalColor }}
          />
          <span className="text-[6px] font-black text-gray-300 mt-1 uppercase">Std</span>
        </div>
        <span className="text-[8px] text-gray-200 mb-3">&rarr;</span>
        {/* Personalized Swatch (Inclusion Guard) */}
        <div className="flex flex-col items-center">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#FF4D8D]/30 shadow-sm overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundColor: originalColor, opacity: personalizedOpacity }} />
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${skinOverlay}) 100%)` }}
            />
          </div>
          <span className="text-[6px] font-black text-[#FF4D8D] mt-1 uppercase">You</span>
        </div>
      </div>
      <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );
};

/* ── Sherlock Skeletal Metrics ─────────────────────────── */

const BoneMetricCard: React.FC<{
  label: string;
  value: string;
  unit?: string;
  delay?: number;
}> = ({ label, value, unit, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex flex-col gap-1 p-4 sm:p-6 bg-white border border-gray-100 rounded-xl sm:rounded-2xl"
  >
    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-300">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-base sm:text-lg heading-font italic font-bold">{value}</span>
      {unit && <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">{unit}</span>}
    </div>
  </motion.div>
);

/* ── Product Card (Glossier-style: hover reveal) ──────── */

const ProductCard: React.FC<{
  product: AnalysisResult['recommendations']['products'][0];
  melaninIndex: number;
  palette?: AnalysisResult['palette'];
  onCheckout: () => void;
  idx: number;
}> = ({ product, melaninIndex, palette, onCheckout, idx }) => {
  const lipColor = palette?.lip || '#c4544a';
  const cheekColor = palette?.cheek || '#d4917a';
  const baseColor = palette?.base || '#e8c9a0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-white p-6 sm:p-10 group transition-all hover:bg-bg flex flex-col h-full relative"
    >
      {/* Product visual area */}
      <div className="aspect-square mb-6 sm:mb-10 overflow-hidden bg-gray-50 flex items-center justify-center p-6 sm:p-8 rounded-xl sm:rounded-2xl relative">
        <Sparkles size={24} className="text-gray-100 absolute" />
        <div className="w-full h-full bg-gray-100/50 mix-blend-multiply rounded-lg" />
      </div>

      {/* Always-visible info */}
      <div className="flex flex-col flex-1">
        <p className="text-[8px] sm:text-[9px] font-black text-primary uppercase mb-1">{product.brand}</p>
        <h4 className="text-sm sm:text-lg heading-font italic mb-2 uppercase leading-none">{product.name}</h4>

        {/* Inclusion Guard: Dynamic dual swatches from palette */}
        <div className="flex gap-3 sm:gap-4 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <DualSwatch originalColor={lipColor} label="Lip" melaninIndex={melaninIndex} />
          <DualSwatch originalColor={cheekColor} label="Cheek" melaninIndex={melaninIndex} />
          <DualSwatch originalColor={baseColor} label="Base" melaninIndex={melaninIndex} />
        </div>

        {/* Glossier-style: price & add button on hover */}
        <div className="flex justify-between items-end mt-auto pt-4 sm:pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <p className="text-sm font-black">{product.price}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckout();
            }}
            className="p-2.5 sm:p-3 bg-black text-white rounded-full hover:bg-primary transition-colors cursor-pointer gm-hover"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Analysis Result View ────────────────────────── */

const AnalysisView: React.FC<{
  result: AnalysisResult;
  userImage?: string | null;
  onReset: () => void;
  onCheckout: () => void;
}> = ({ result, userImage, onReset, onCheckout }) => {
  return (
    <div className="space-y-20 sm:space-y-28 lg:space-y-32 pb-20">
      {/* ── Header ──────────────────────────────────────── */}
      <section className="border-b border-black pb-12 sm:pb-16 lg:pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-12 gap-4">
          <p className="text-[10px] font-black tracking-[0.5em] text-primary uppercase">
            Analysis Report — {String(Date.now()).slice(-4)}
          </p>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <RotateCcw size={12} /> New Scan
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end">
          <h2 className="text-[48px] sm:text-[60px] lg:text-[100px] heading-font leading-[0.85] tracking-tight uppercase">
            Defined <br />
            <span className="italic">Identity.</span>
          </h2>
          <div className="space-y-4 sm:space-y-6 max-w-sm w-full">
            <div className="flex justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-gray-300">Tone</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase">
                {result.tone.undertone} / Melanin L{result.tone.melaninIndex}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-gray-300">Structure</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase">{result.sherlock.boneStructure}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-gray-300">Vibe</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase">{result.sherlock.facialVibe}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-gray-300">K-Match</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase text-primary">{result.kMatch.celebName}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sherlock Visualization + Bone Metrics ──────── */}
      <section>
        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-gray-300 mb-8 sm:mb-10">
          Sherlock Bone-Scan &mdash; Skeletal Mapping
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Vector diagram with user photo */}
          <SherlockResultDiagram result={result} userImage={userImage ?? null} />

          {/* Metric cards + Facial Vibe */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <BoneMetricCard label="Eye Angle" value={result.sherlock.eyeAngle} delay={0} />
              <BoneMetricCard label="Upper Face" value={result.sherlock.proportions.upper} delay={0.1} />
              <BoneMetricCard label="Middle Face" value={result.sherlock.proportions.middle} delay={0.2} />
              <BoneMetricCard label="Lower Face" value={result.sherlock.proportions.lower} delay={0.3} />
            </div>
            <div className="p-6 sm:p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 block mb-2">
                Facial Architecture
              </span>
              <p className="text-sm sm:text-base heading-font italic font-bold uppercase">
                {result.sherlock.boneStructure}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-2 uppercase tracking-widest">
                {result.sherlock.facialVibe}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Adapted Palette Strip ─────────────────────── */}
      {result.palette && (
        <section>
          <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-gray-300 mb-8 sm:mb-10">
            Inclusion Guard &mdash; Adapted Palette
          </h3>
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { color: result.palette.base, label: 'Base', desc: result.kMatch.adaptationLogic.base },
              { color: result.palette.lip, label: 'Lip', desc: result.kMatch.adaptationLogic.lip },
              { color: result.palette.cheek, label: 'Cheek' },
              { color: result.palette.eye, label: 'Eye', desc: result.kMatch.adaptationLogic.point },
            ].map((swatch) => (
              <div key={swatch.label} className="flex items-start gap-4">
                <DualSwatch
                  originalColor={swatch.color}
                  label={swatch.label}
                  melaninIndex={result.tone.melaninIndex}
                />
                {swatch.desc && (
                  <p className="text-[9px] text-gray-400 font-medium max-w-[180px] leading-relaxed mt-1 hidden sm:block">
                    {swatch.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Analysis Detail Grid ────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-32">
        <div className="lg:col-span-4 space-y-8 sm:space-y-12">
          <div className="p-8 sm:p-10 md:p-12 border border-gray-100 rounded-[2.5rem] lg:rounded-[3.5rem] bg-white shadow-2xl relative overflow-hidden group">
            <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-gray-300 border-b border-gray-50 pb-8 sm:pb-10 mb-6 sm:mb-8">
              Match Logic
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-medium italic">
              &ldquo;{result.tone.description}&rdquo;
            </p>
            <div className="mt-8 sm:mt-10 flex flex-wrap gap-2">
              {result.tone.skinConcerns.map((c) => (
                <span
                  key={c}
                  className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8 sm:space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              { label: 'Skin Strategy', val: result.kMatch.adaptationLogic.base, icon: <Palette size={22} /> },
              { label: 'Lip Focus', val: result.kMatch.adaptationLogic.lip, icon: <Droplets size={22} /> },
              { label: 'Neural Pivot', val: result.kMatch.adaptationLogic.point, icon: <Eye size={22} /> },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-10 border border-gray-100 rounded-[2rem] sm:rounded-[3rem] bg-[#FDFDFE] flex flex-col gap-6 sm:gap-8 transition-all hover:bg-white hover:shadow-xl"
              >
                <div className="text-primary">{item.icon}</div>
                <div>
                  <p className="text-[8px] sm:text-[9px] font-black uppercase text-gray-300 tracking-[0.3em] sm:tracking-[0.4em] mb-2 sm:mb-3">
                    {item.label}
                  </p>
                  <p className="text-[10px] sm:text-xs font-black leading-snug tracking-tight text-gray-900 uppercase">
                    {item.val}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Laboratory Notes */}
          <div className="p-8 sm:p-14 bg-black text-white rounded-[2.5rem] sm:rounded-[4rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px]" />
            <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] sm:tracking-[0.7em] text-primary mb-6 sm:mb-8">
              AI Laboratory Notes
            </h4>
            <p className="text-lg sm:text-xl lg:text-3xl font-medium leading-[1.3] italic tracking-tight text-gray-100">
              &ldquo;{result.kMatch.styleExplanation}&rdquo;
            </p>
            {/* Style Points */}
            <div className="mt-8 sm:mt-10 flex flex-wrap gap-3">
              {result.kMatch.aiStylePoints.map((point, i) => (
                <span
                  key={i}
                  className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 sm:px-4 py-2 rounded-full text-gray-300"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommended Products (Glossier-style hover) ── */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-16 gap-4">
          <h3 className="text-[32px] sm:text-[40px] heading-font italic uppercase">Recommended Objects</h3>
          <button
            onClick={onCheckout}
            className="text-[10px] font-black border-b border-black pb-1 cursor-pointer uppercase tracking-widest hover:text-primary hover:border-primary transition-all"
          >
            Shop the Look
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] bg-black/5 border border-black/5 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          {result.recommendations.products.map((product, idx) => (
            <ProductCard
              key={idx}
              product={product}
              melaninIndex={result.tone.melaninIndex}
              palette={result.palette}
              onCheckout={onCheckout}
              idx={idx}
            />
          ))}
        </div>
      </section>

      {/* ── Video Tutorials ─────────────────────────────── */}
      {result.recommendations.videos && result.recommendations.videos.length > 0 && (
        <section>
          <h3 className="text-[32px] sm:text-[40px] heading-font italic mb-10 sm:mb-16 text-center uppercase">Visual Study</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
            {result.recommendations.videos.map((video, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer overflow-hidden rounded-[2rem] sm:rounded-[3rem] h-[300px] sm:h-[400px] lg:h-[450px] gm-hover"
              >
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <Camera size={48} className="text-white/20" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-all border border-white/20">
                    <Play fill="white" className="text-white translate-x-1" size={24} />
                  </div>
                </div>
                <div className="absolute bottom-8 sm:bottom-12 left-6 sm:left-12 right-6 sm:right-12 flex justify-between items-end text-white">
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-60 mb-2 sm:mb-3">
                      {video.creator}
                    </p>
                    <h4 className="text-lg sm:text-2xl heading-font italic leading-tight uppercase max-w-sm">
                      {video.title}
                    </h4>
                    {/* AI Coaching note */}
                    <p className="text-[9px] text-white/50 font-medium mt-2 max-w-xs hidden sm:block">
                      {video.aiCoaching}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all shrink-0 ml-4">
                    <ExternalLink size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalysisView;
