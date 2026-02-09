import React from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Droplets, Eye, Sparkles, Plus, Play, ExternalLink,
  RotateCcw, Camera,
} from 'lucide-react';
import { AnalysisResult } from '../types';

/* ── Inclusion Guard: Dual Swatch (Standard vs Personalized) */

const DualSwatch: React.FC<{
  originalColor: string;
  label: string;
  melaninIndex: number;
}> = ({ originalColor, label, melaninIndex }) => {
  // Layered rendering: simulate how the product's standard color
  // appears on the user's specific Fitzpatrick-level skin tone
  const personalizedOpacity = Math.max(0.25, 1 - melaninIndex * 0.13);
  const skinOverlay = melaninIndex * 0.05;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5 items-end">
        {/* Standard Swatch (original product color) */}
        <div className="flex flex-col items-center">
          <div
            className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
            style={{ backgroundColor: originalColor }}
          />
          <span className="text-[6px] font-black text-gray-300 mt-1 uppercase">Std</span>
        </div>
        {/* Arrow indicator */}
        <span className="text-[8px] text-gray-200 mb-3">→</span>
        {/* Personalized Swatch (Inclusion Guard adaptation) */}
        <div className="flex flex-col items-center">
          <div className="relative w-8 h-8 rounded-full border-2 border-[#FF4D8D]/30 shadow-sm overflow-hidden">
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
    className="flex flex-col gap-1 p-6 bg-white border border-gray-100 rounded-2xl"
  >
    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-lg heading-font italic font-bold">{value}</span>
      {unit && <span className="text-[10px] text-gray-400 font-bold">{unit}</span>}
    </div>
  </motion.div>
);

/* ── Product Card (Glossier-style: hover reveal) ──────── */

const ProductCard: React.FC<{
  product: AnalysisResult['recommendations']['products'][0];
  melaninIndex: number;
  onCheckout: () => void;
  idx: number;
}> = ({ product, melaninIndex, onCheckout, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
    className="bg-white p-10 group transition-all hover:bg-bg flex flex-col h-full relative"
  >
    {/* Product visual area */}
    <div className="aspect-square mb-10 overflow-hidden bg-gray-50 flex items-center justify-center p-8 rounded-2xl relative">
      <Sparkles size={24} className="text-gray-100 absolute" />
      <div className="w-full h-full bg-gray-100/50 mix-blend-multiply rounded-lg" />
    </div>

    {/* Always-visible info */}
    <div className="flex flex-col flex-1">
      <p className="text-[9px] font-black text-primary uppercase mb-1">{product.brand}</p>
      <h4 className="text-lg heading-font italic mb-2 uppercase leading-none">{product.name}</h4>

      {/* Inclusion Guard: Standard vs Personalized dual swatch */}
      <div className="flex gap-4 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <DualSwatch originalColor="#c4544a" label="Lip" melaninIndex={melaninIndex} />
        <DualSwatch originalColor="#d4917a" label="Cheek" melaninIndex={melaninIndex} />
        <DualSwatch originalColor="#e8c9a0" label="Base" melaninIndex={melaninIndex} />
      </div>

      {/* Glossier-style: price & add button appear on hover */}
      <div className="flex justify-between items-end mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <p className="text-sm font-black">{product.price}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCheckout();
          }}
          className="p-3 bg-black text-white rounded-full hover:bg-primary transition-colors cursor-pointer gm-hover"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

/* ── Main Analysis Result View ────────────────────────── */

const AnalysisView: React.FC<{
  result: AnalysisResult;
  onReset: () => void;
  onCheckout: () => void;
}> = ({ result, onReset, onCheckout }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* ── Header ──────────────────────────────────────── */}
      <section className="border-b border-black pb-20">
        <div className="flex justify-between items-start mb-12">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end">
          <h2 className="text-[60px] lg:text-[100px] heading-font leading-[0.85] tracking-tight uppercase">
            Defined <br />
            <span className="italic">Identity.</span>
          </h2>
          <div className="space-y-6 max-w-sm w-full">
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">Tone</span>
              <span className="text-xs font-bold uppercase">
                {result.tone.undertone} / Melanin L{result.tone.melaninIndex}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">Structure</span>
              <span className="text-xs font-bold uppercase">{result.sherlock.boneStructure}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">Vibe</span>
              <span className="text-xs font-bold uppercase">{result.sherlock.facialVibe}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bone Metric Section (Editorial Tech UI) ───── */}
      <section>
        <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300 mb-10">
          Bone Metric — Sherlock Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BoneMetricCard label="Eye Angle" value={result.sherlock.eyeAngle} delay={0} />
          <BoneMetricCard label="Upper Face" value={result.sherlock.proportions.upper} delay={0.1} />
          <BoneMetricCard label="Middle Face" value={result.sherlock.proportions.middle} delay={0.2} />
          <BoneMetricCard label="Lower Face" value={result.sherlock.proportions.lower} delay={0.3} />
        </div>
      </section>

      {/* ── Analysis Detail Grid ────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">
        <div className="lg:col-span-4 space-y-12">
          <div className="p-10 md:p-12 border border-gray-100 rounded-[3.5rem] bg-white shadow-2xl relative overflow-hidden group">
            <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300 border-b border-gray-50 pb-10 mb-8">
              Match Logic
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
              &ldquo;{result.tone.description}&rdquo;
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {result.tone.skinConcerns.map((c) => (
                <span
                  key={c}
                  className="text-[9px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Skin Strategy', val: result.kMatch.adaptationLogic.base, icon: <Palette size={22} /> },
              { label: 'Lip Focus', val: result.kMatch.adaptationLogic.lip, icon: <Droplets size={22} /> },
              { label: 'Neural Pivot', val: result.kMatch.adaptationLogic.point, icon: <Eye size={22} /> },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-10 border border-gray-100 rounded-[3rem] bg-[#FDFDFE] flex flex-col gap-8 transition-all hover:bg-white hover:shadow-xl"
              >
                <div className="text-primary">{item.icon}</div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.4em] mb-3">
                    {item.label}
                  </p>
                  <p className="text-xs font-black leading-snug tracking-tight text-gray-900 uppercase">
                    {item.val}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Laboratory Notes */}
          <div className="p-14 bg-black text-white rounded-[4rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px]" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.7em] text-primary mb-8">
              AI Laboratory Notes
            </h4>
            <p className="text-xl lg:text-3xl font-medium leading-[1.3] italic tracking-tight text-gray-100">
              &ldquo;{result.kMatch.styleExplanation}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── Recommended Products (Glossier-style hover) ── */}
      <section>
        <div className="flex justify-between items-end mb-16">
          <h3 className="text-[40px] heading-font italic uppercase">Recommended Objects</h3>
          <button
            onClick={onCheckout}
            className="text-[10px] font-black border-b border-black pb-1 cursor-pointer uppercase tracking-widest hover:text-primary hover:border-primary transition-all"
          >
            Shop the Look
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-black/5 border border-black/5 overflow-hidden rounded-[2.5rem]">
          {result.recommendations.products.map((product, idx) => (
            <ProductCard
              key={idx}
              product={product}
              melaninIndex={result.tone.melaninIndex}
              onCheckout={onCheckout}
              idx={idx}
            />
          ))}
        </div>
      </section>

      {/* ── Video Tutorials ─────────────────────────────── */}
      {result.recommendations.videos && result.recommendations.videos.length > 0 && (
        <section>
          <h3 className="text-[40px] heading-font italic mb-16 text-center uppercase">Visual Study</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {result.recommendations.videos.map((video, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer overflow-hidden rounded-[3rem] h-[450px] gm-hover"
              >
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <Camera size={48} className="text-white/20" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/20">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-all border border-white/20">
                    <Play fill="white" className="text-white translate-x-1" size={28} />
                  </div>
                </div>
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end text-white">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-3">
                      {video.creator}
                    </p>
                    <h4 className="text-2xl heading-font italic leading-tight uppercase max-w-sm">
                      {video.title}
                    </h4>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                    <ExternalLink size={18} />
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
