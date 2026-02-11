import { motion } from 'framer-motion';
import {
  RotateCcw, Cpu, Palette, Droplets, Eye, Activity,
  Check, Sparkles, Plus, Play, ExternalLink, Lightbulb
} from 'lucide-react';
import { AnalysisResult } from '@/types';
import { containerVariants, itemVariants } from '@/constants/animations';
import SherlockProportionVisualizer from '@/components/sherlock/ProportionVisualizer';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  onReset: () => void;
  onCheckout: () => void;
}

const AnalysisResultView = ({ result, onReset, onCheckout }: AnalysisResultViewProps) => {
  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-32 pb-20 px-6"
    >
      <motion.section variants={itemVariants} className="border-b border-black pb-20">
        <div className="flex justify-between items-start mb-12">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black tracking-[0.5em] text-[#FF4D8D] uppercase italic">Diagnostic Report — ID:{Math.floor(Math.random() * 10000)}</p>
            <div className="flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              <Cpu size={10} /> Neural Stylist v4.2.1-stable
            </div>
          </div>
          <button onClick={onReset} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors uppercase">
            <RotateCcw size={12} /> New Scan
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end">
          <h2 className="text-[60px] lg:text-[100px] heading-font leading-[0.85] tracking-[-0.05em] uppercase text-balance">
            NEURAL <br/><span className="italic">IDENTITY.</span>
          </h2>
          <div className="space-y-6 max-w-sm w-full">
            <div className="flex justify-between border-b border-gray-100 pb-4 items-center">
              <span className="text-[10px] font-black uppercase text-gray-300">Tone Mapping</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${result.tone.undertone === 'Warm' ? 'bg-[#D4A373]' : result.tone.undertone === 'Cool' ? 'bg-[#4A3B31]' : 'bg-[#C6A48E]'}`} />
                <span className="text-xs font-bold uppercase">{result.tone.undertone} / L{result.tone.melaninIndex}</span>
              </div>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">Osteo-Structure</span>
              <span className="text-xs font-bold uppercase">{result.sherlock.boneStructure}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">Aesthetic Vibe</span>
              <span className="text-xs font-bold uppercase">{result.sherlock.facialVibe}</span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">
        <div className="lg:col-span-5 space-y-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-10 md:p-12 border border-gray-100 rounded-[3.5rem] bg-white shadow-2xl relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-12 border-b border-gray-50 pb-10">
              <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300 uppercase">Forensic Mapping</h3>
                <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-widest">Sherlock Profile v4.2</p>
              </div>
              <SherlockProportionVisualizer proportions={result.sherlock.proportions} />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium italic text-balance">
              "{result.tone.description}"
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {result.tone.skinConcerns.map(c => (
                <span key={c} className="text-[9px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase">{c}</span>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="lg:col-span-7 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Neural Base', val: result.kMatch.adaptationLogic.base, icon: <Palette size={22}/> },
              { label: 'Lip Strategy', val: result.kMatch.adaptationLogic.lip, icon: <Droplets size={22}/> },
              { label: 'Vector Focus', val: result.kMatch.adaptationLogic.point, icon: <Eye size={22}/> }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-10 border border-gray-100 rounded-[3rem] bg-[#FDFDFE] flex flex-col gap-8 transition-all hover:bg-white hover:shadow-xl"
              >
                <div className="text-[#FF4D8D]">{item.icon}</div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.4em] mb-3 uppercase">{item.label}</p>
                  <p className="text-xs font-black leading-snug tracking-tight text-gray-900 uppercase text-balance">{item.val}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-14 bg-black text-white rounded-[4rem] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D8D]/10 blur-[100px]"></div>
            <div className="flex items-center gap-3 mb-8">
              <Activity size={16} className="text-[#FF4D8D]" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.7em] text-[#FF4D8D] uppercase">Laboratory Adaptation Notes</h4>
            </div>
            <p className="text-xl lg:text-3xl font-medium leading-[1.3] italic tracking-tight text-gray-100 text-balance">
              "{result.kMatch.styleExplanation}"
            </p>
            <div className="mt-12 flex flex-wrap gap-3">
              {result.kMatch.aiStylePoints.map(p => (
                <div key={p} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <Check size={10} className="text-[#FF4D8D]" />
                  <span className="text-[8px] font-black uppercase tracking-widest uppercase">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <div className="flex justify-between items-end mb-16">
          <h3 className="text-[40px] heading-font italic uppercase">Recommended Objects</h3>
          <button onClick={onCheckout} className="text-[10px] font-black border-b border-black pb-1 cursor-pointer uppercase tracking-widest hover:text-[#FF4D8D] hover:border-[#FF4D8D] transition-all uppercase">Shop the collection</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-black/5 border border-black/5 overflow-hidden rounded-[2.5rem]">
          {result.recommendations.products.map((product, idx) => (
            <motion.div
              key={idx}
              whileHover={{ backgroundColor: "#F9F9F9" }}
              className="bg-white p-10 group transition-all flex flex-col h-full"
            >
              <div className="aspect-square mb-10 overflow-hidden bg-gray-50 flex items-center justify-center p-8 rounded-2xl relative">
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-[8px] font-black z-10 shadow-lg uppercase">
                  {product.matchScore}% MATCH
                </div>
                <Sparkles size={24} className="text-gray-100 absolute" />
                <div className="w-full h-full bg-gray-100/50 mix-blend-multiply rounded-lg group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[9px] font-black text-[#FF4D8D] uppercase">{product.brand}</p>
                  <span className="text-[7px] font-black bg-gray-50 px-2 py-0.5 rounded-full text-gray-400 border border-gray-100 uppercase">{product.safetyRating}</span>
                </div>
                <h4 className="text-lg heading-font italic mb-4 uppercase leading-none">{product.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium mb-6 line-clamp-2 text-balance">{product.desc}</p>
                <div className="flex justify-between items-end mt-auto pt-6 border-t border-gray-50">
                  <p className="text-sm font-black">{product.price}</p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onCheckout}
                    className="p-3 bg-black text-white rounded-full hover:bg-[#FF4D8D] transition-colors"
                  >
                    <Plus size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h3 className="text-[40px] heading-font italic mb-16 text-center uppercase">Curated Education</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {result.recommendations.videos && result.recommendations.videos.map((video, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="relative group cursor-pointer overflow-hidden rounded-[3rem] h-[450px] shadow-xl">
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <img src={`https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800`} className="w-full h-full object-cover opacity-60" alt={video.title} />
                </div>
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/20">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
                  >
                    <Play fill="white" className="text-white translate-x-1" size={28} />
                  </motion.div>
                </div>
                <div className="absolute top-10 left-10">
                  <div className="px-4 py-2 bg-[#FF4D8D] text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg uppercase">
                    {video.matchPercentage}% AI MATCH
                  </div>
                </div>
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end text-white">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-2 uppercase">{video.creator} • {video.views} views</p>
                      <h4 className="text-2xl heading-font italic leading-tight uppercase max-w-sm text-balance">{video.title}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black uppercase uppercase">{video.tag}</span>
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black uppercase uppercase">{video.skillLevel}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                    <ExternalLink size={18} />
                  </div>
                </div>
              </div>
              {video.aiCoaching && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-pink-50 border border-pink-100 p-8 rounded-[2.5rem] flex gap-6 items-start"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-[#FF4D8D] shadow-sm">
                    <Lightbulb size={20} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FF4D8D] uppercase">AI Coaching Protocol</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium italic text-balance">"{video.aiCoaching}"</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default AnalysisResultView;
