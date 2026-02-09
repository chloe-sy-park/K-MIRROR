import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Bookmark, Sparkles, Plus, ArrowUpRight, X,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { MUSE_BOARD_ITEMS, MUSE_STYLE_NOTES } from '../services/mockData';

const MuseBoardView: React.FC<{
  result: AnalysisResult | null;
  onNavigateToScan: () => void;
}> = ({ result, onNavigateToScan }) => {
  const [savedItems, setSavedItems] = useState<number[]>([1, 2, 4]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const toggleSave = (id: number) =>
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-20 pb-20"
    >
      {/* Header */}
      <section className="border-b border-black pb-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div>
            <p className="text-[10px] font-black tracking-[0.6em] text-primary mb-6 uppercase">
              Neural Muse Board
            </p>
            <h2 className="text-[50px] lg:text-[90px] heading-font leading-[0.85] tracking-tight uppercase">
              Your Style <br />
              <span className="italic">Archive.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-auto">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
              {savedItems.length} Saved
            </span>
            <button className="flex items-center gap-2 px-6 py-3 border border-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer">
              <Plus size={12} /> Add Inspiration
            </button>
          </div>
        </div>
      </section>

      {/* Color Palette Strip (from analysis) */}
      {result?.palette && (
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300 mb-8">
            Your Adapted Palette
          </h3>
          <div className="flex gap-3 flex-wrap">
            {[
              { color: result.palette.base, label: 'Base' },
              { color: result.palette.cheek, label: 'Cheek' },
              { color: result.palette.lip, label: 'Lip' },
              { color: result.palette.eye, label: 'Eye' },
            ].map((swatch) => (
              <div key={swatch.label} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-gray-100 shadow-sm"
                  style={{ backgroundColor: swatch.color }}
                />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                  {swatch.label}
                </span>
                <span className="text-[7px] font-mono text-gray-300 uppercase">
                  {swatch.color}
                </span>
              </div>
            ))}
            {result.tone && (
              <div className="flex flex-col justify-center ml-6 pl-6 border-l border-gray-100">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">
                  Melanin L{result.tone.melaninIndex}
                </span>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                  {result.tone.undertone} Undertone
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Inspiration Grid (Pinterest-style masonry) */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300">
            Inspiration Board
          </h3>
          <div className="flex gap-3">
            {['All', 'Skin', 'Look', 'Mood', 'Technique'].map((tag) => (
              <button
                key={tag}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-gray-100 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="columns-2 lg:columns-3 gap-4 space-y-4">
          {MUSE_BOARD_ITEMS.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl gm-hover"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={item.img}
                alt={item.label}
                className={`w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                  item.span === 'tall' ? 'h-[500px]' : 'h-[300px]'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Hover overlay content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                  {item.tag}
                </span>
                <h4 className="text-lg heading-font italic text-white uppercase mt-1">
                  {item.label}
                </h4>
              </div>

              {/* Save button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(item.id);
                }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  savedItems.includes(item.id)
                    ? 'bg-primary text-white'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Heart
                  size={16}
                  fill={savedItems.includes(item.id) ? 'white' : 'none'}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* AI Style Notes */}
      <section className="bg-black text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px]" />
        <div className="relative z-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.7em] text-primary mb-10">
            AI Style Notes — Personalized
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MUSE_STYLE_NOTES.map((note, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-6 border border-white/10 rounded-2xl"
              >
                <span className="text-primary text-lg heading-font italic">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-gray-300 font-medium leading-relaxed">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Saved Products Shelf */}
      {result?.recommendations?.products && (
        <section>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300">
              Product Archive
            </h3>
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
              {result.recommendations.products.length} Items
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {result.recommendations.products.map((product, idx) => (
              <div
                key={idx}
                className="group p-6 md:p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="aspect-square mb-6 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-gray-200 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[9px] font-black text-primary uppercase mb-1">
                  {product.brand}
                </p>
                <h4 className="text-xs font-black uppercase leading-snug mb-3">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">{product.price}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-black text-gray-300 uppercase">
                      {product.matchScore}%
                    </span>
                    <Bookmark size={12} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State (no analysis yet) */}
      {!result && (
        <section className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
          <Sparkles size={48} className="mx-auto text-gray-200 mb-8" />
          <h3 className="text-2xl heading-font italic uppercase mb-4">
            Your Archive Awaits
          </h3>
          <p className="text-sm text-gray-400 font-medium mb-8 max-w-md mx-auto">
            Complete a Neural Scan to populate your personalized muse board
            with adapted colors, products, and style notes.
          </p>
          <button
            onClick={onNavigateToScan}
            className="px-10 py-5 bg-black text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-primary transition-all cursor-pointer gm-hover"
          >
            Start Neural Scan
          </button>
        </section>
      )}
    </motion.div>
  );
};

export default MuseBoardView;
