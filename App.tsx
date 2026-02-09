
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, LayoutGrid, MessageCircle, Settings, Menu, X, 
  ArrowRight, ShieldCheck, User, Sparkles, ShoppingBag, 
  ChevronRight, Heart, Globe, Plus, Zap, Droplets, Palette, Eye, 
  ArrowUpRight, Check, Play, ExternalLink, RotateCcw, Truck, Info
} from 'lucide-react';
import { AppStep, AnalysisResult, UserPreferences } from './types';
import { analyzeKBeauty } from './services/geminiService';

// --- Shared Utility Components ---

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-[#FF4D8D]' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${checked ? 'left-7' : 'left-1'}`} />
  </button>
);

const LuxuryFileUpload: React.FC<{
  label: string;
  onImageSelect: (base64: string) => void;
  preview: string | null;
  secondaryLabel?: string;
}> = ({ label, onImageSelect, preview, secondaryLabel }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect((reader.result as string).split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
        {label}
      </label>
      <div className="relative group aspect-[3/4] bg-[#F9F9FB] border border-gray-100 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500">
        {preview ? (
          <img src={`data:image/jpeg;base64,${preview}`} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all duration-300">
              <Camera size={24} className="text-gray-300 group-hover:text-white" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] leading-relaxed">
              {secondaryLabel || 'Upload Photo'}
            </p>
          </div>
        )}
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

// --- View Components ---

const GlobalCheckoutView: React.FC<{ result: AnalysisResult | null }> = ({ result }) => {
  const [shippingMethod, setShippingMethod] = useState('dhl');
  const subtotal = result?.recommendations.products.reduce((acc, p) => acc + parseFloat(p.price.replace('$', '')), 0) || 45;
  const shippingCost = shippingMethod === 'dhl' ? 18 : 12;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto py-20 animate-in fade-in duration-1000">
      <header className="mb-20 border-b border-black pb-12">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-6 uppercase">Step 04 — Acquisition</p>
        <h2 className="text-[50px] lg:text-[80px] heading-font leading-[0.9] tracking-[-0.04em] uppercase">
          SECURE YOUR <br/><span className="italic underline decoration-1 underline-offset-8">ARCHIVE.</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-7 space-y-16">
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-10 flex items-center gap-3">
              <Globe size={14} /> 01. Shipping Destination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Full Name</label>
                <input type="text" placeholder="Sarah Jenkins" className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:ring-1 ring-black transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Country</label>
                <select className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:ring-1 ring-black">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>France</option>
                  <option>South Korea</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Address</label>
                <input type="text" placeholder="123 Beauty Lane, Manhattan, NY" className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:ring-1 ring-black" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-10 flex items-center gap-3">
              <Truck size={14} /> 02. Logistics
            </h3>
            <div className="space-y-4">
              <label className={`flex justify-between items-center p-6 rounded-3xl border-2 cursor-pointer transition-all ${shippingMethod === 'dhl' ? 'border-black bg-white' : 'border-gray-50 bg-[#F9F9F9]'}`}>
                <input type="radio" name="shipping" className="hidden" onClick={() => setShippingMethod('dhl')} />
                <div className="flex items-center gap-4">
                  <div className="font-bold text-sm text-yellow-500">DHL Express</div>
                  <span className="text-[10px] text-gray-400 font-medium">3-5 Business Days</span>
                </div>
                <span className="font-black text-sm">$18.00</span>
              </label>
              <label className={`flex justify-between items-center p-6 rounded-3xl border-2 cursor-pointer transition-all ${shippingMethod === 'ems' ? 'border-black bg-white' : 'border-gray-50 bg-[#F9F9F9]'}`}>
                <input type="radio" name="shipping" className="hidden" onClick={() => setShippingMethod('ems')} />
                <div className="flex items-center gap-4">
                  <div className="font-bold text-sm text-blue-500">EMS Global</div>
                  <span className="text-[10px] text-gray-400 font-medium">7-14 Business Days</span>
                </div>
                <span className="font-black text-sm">$12.00</span>
              </label>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 sticky top-32 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-gray-300 text-center">Order Summary</h4>
            <div className="space-y-6 mb-10">
              {result?.recommendations.products.slice(0, 2).map((p, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                      <Sparkles size={14} className="text-gray-200" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">{p.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">{p.brand}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{p.price}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50 mb-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Shipping ({shippingMethod.toUpperCase()})</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-black uppercase">Total</span>
                <span className="text-2xl heading-font italic uppercase">${(subtotal + shippingCost).toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-[#FF4D8D] transition-all mb-6 shadow-xl">
              Complete Payment
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-green-500" /> Secure Checkout by Stripe
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AnalysisResultView: React.FC<{ result: AnalysisResult; onReset: () => void; onCheckout: () => void }> = ({ result, onReset, onCheckout }) => {
  return (
    <div className="animate-in fade-in duration-1000 space-y-32 pb-20">
      <section className="border-b border-black pb-20">
        <div className="flex justify-between items-start mb-12">
          <p className="text-[10px] font-black tracking-[0.5em] text-[#FF4D8D] uppercase">Analysis Report — {Math.floor(Math.random() * 1000)}</p>
          <button onClick={onReset} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            <RotateCcw size={12} /> New Scan
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end">
          <h2 className="text-[60px] lg:text-[100px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
            DEFINED <br/><span className="italic">IDENTITY.</span>
          </h2>
          <div className="space-y-6 max-w-sm w-full">
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">Tone</span>
              <span className="text-xs font-bold uppercase">{result.tone.undertone} / Melanin L{result.tone.melaninIndex}</span>
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

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">
        <div className="lg:col-span-4 space-y-12">
           <div className="p-10 md:p-12 border border-gray-100 rounded-[3.5rem] bg-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300 border-b border-gray-50 pb-10 mb-8">Match logic</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
                "{result.tone.description}"
              </p>
              <div className="mt-10 flex flex-wrap gap-2">
                {result.tone.skinConcerns.map(c => (
                  <span key={c} className="text-[9px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
           </div>
        </div>
        <div className="lg:col-span-8 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Skin Strategy', val: result.kMatch.adaptationLogic.base, icon: <Palette size={22}/> },
                { label: 'Lip Focus', val: result.kMatch.adaptationLogic.lip, icon: <Droplets size={22}/> },
                { label: 'Neural Pivot', val: result.kMatch.adaptationLogic.point, icon: <Eye size={22}/> }
              ].map((item, idx) => (
                <div key={idx} className="p-10 border border-gray-100 rounded-[3rem] bg-[#FDFDFE] flex flex-col gap-8 transition-all hover:bg-white hover:shadow-xl">
                   <div className="text-[#FF4D8D]">{item.icon}</div>
                   <div>
                     <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.4em] mb-3">{item.label}</p>
                     <p className="text-xs font-black leading-snug tracking-tight text-gray-900 uppercase">{item.val}</p>
                   </div>
                </div>
              ))}
           </div>
           <div className="p-14 bg-black text-white rounded-[4rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D8D]/10 blur-[100px]"></div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.7em] text-[#FF4D8D] mb-8">AI laboratory notes</h4>
              <p className="text-xl lg:text-3xl font-medium leading-[1.3] italic tracking-tight text-gray-100">
                "{result.kMatch.styleExplanation}"
              </p>
           </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-16">
          <h3 className="text-[40px] heading-font italic uppercase">Recommended Objects</h3>
          <button onClick={onCheckout} className="text-[10px] font-black border-b border-black pb-1 cursor-pointer uppercase tracking-widest hover:text-[#FF4D8D] hover:border-[#FF4D8D] transition-all">Shop the look</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-black/5 border border-black/5 overflow-hidden rounded-[2.5rem]">
          {result.recommendations.products.map((product, idx) => (
            <div key={idx} className="bg-white p-10 group transition-all hover:bg-[#F9F9F9] flex flex-col h-full">
              <div className="aspect-square mb-10 overflow-hidden bg-gray-50 flex items-center justify-center p-8 rounded-2xl relative">
                <Sparkles size={24} className="text-gray-100 absolute" />
                <div className="w-full h-full bg-gray-100/50 mix-blend-multiply rounded-lg" />
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-[9px] font-black text-[#FF4D8D] uppercase mb-1">{product.brand}</p>
                <h4 className="text-lg heading-font italic mb-4 uppercase leading-none">{product.name}</h4>
                <div className="flex justify-between items-end mt-auto pt-6">
                   <p className="text-sm font-black">{product.price}</p>
                   <button onClick={onCheckout} className="p-3 bg-black text-white rounded-full hover:bg-[#FF4D8D] transition-colors">
                      <Plus size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[40px] heading-font italic mb-16 text-center uppercase">Visual Study</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {result.recommendations.videos && result.recommendations.videos.map((video, idx) => (
            <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-[3rem] h-[450px]">
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
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-3">{video.creator}</p>
                  <h4 className="text-2xl heading-font italic leading-tight uppercase max-w-sm">{video.title}</h4>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                  <ExternalLink size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ExpertMatchingView = () => {
  const masters = [
    {
      id: "M01",
      name: "Jiwon Kim",
      specialty: "Editorial Skin-Prep",
      desc: "Vogue Korea & Gentle Monster campaign director.",
      img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80"
    },
    {
      id: "M02",
      name: "Sangho Park",
      specialty: "Structural Contouring",
      desc: "Master of skeletal highlighting and shadow play.",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80"
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#F9F9F9] -mx-6 lg:-mx-12 -mt-10 px-6 lg:px-12">
      <section className="py-24 border-b border-black/5">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-6 uppercase">Selected Artists</p>
        <h2 className="text-[60px] lg:text-[100px] heading-font leading-[0.85] tracking-[-0.04em] mb-12 uppercase">
          MEET YOUR <br/>
          <span className="italic">DIRECTOR.</span>
        </h2>
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <p className="max-w-md text-sm text-gray-400 leading-relaxed font-medium">
            We don't just match you with a stylist. We connect you with a director who redefines your identity through the Seoul lens.
          </p>
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xs font-black border-b border-black pb-1">VIEW ALL CURATORS</span>
            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
          </div>
        </div>
      </section>

      <section className="py-20 grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-black/5">
        {masters.map((master) => (
          <div key={master.id} className="group relative bg-[#F9F9F9] p-8 lg:p-16 flex flex-col justify-between h-[700px] transition-colors hover:bg-white overflow-hidden">
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-[10px] font-black text-gray-300 block mb-2">{master.id}</span>
                <h3 className="text-4xl heading-font italic tracking-tighter uppercase">{master.name}</h3>
                <p className="text-[11px] font-black uppercase tracking-widest mt-2">{master.specialty}</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img 
                src={master.img} 
                className="w-[60%] h-[50%] object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out shadow-2xl" 
                alt={master.name} 
              />
            </div>

            <div className="z-10 flex justify-between items-end">
              <p className="max-w-[180px] text-[11px] text-gray-400 font-bold leading-relaxed uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {master.desc}
              </p>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <Globe size={10} className="text-[#FF4D8D]" />
                  <span className="text-[9px] font-black tracking-widest text-pink-500">LIVE TRANSLATION</span>
                </div>
                <button className="text-2xl heading-font hover:italic transition-all uppercase">Book Session — $29</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="py-32 text-center">
        <h4 className="text-[11px] font-black tracking-[0.5em] text-gray-300 mb-8 uppercase">Intelligence meets Artistry</h4>
        <div className="inline-block relative">
            <p className="text-4xl lg:text-5xl heading-font italic tracking-tighter leading-tight max-w-2xl mx-auto uppercase">
              "Your skeletal structure is the canvas, <br/>
              Seoul is the palette."
            </p>
            <div className="absolute -top-6 -right-12 w-24 h-24 bg-pink-100/50 rounded-full blur-3xl" />
        </div>
      </section>
    </motion.div>
  );
};

const AestheticSelection = ({ onComplete }: { onComplete: () => void }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const styles = [
    { id: 'clean', name: 'Clean Glow', desc: 'Dewy skin, minimalist touch', img: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80' },
    { id: 'bold', name: 'Seoul Bold', desc: 'High-contrast, sharp lines', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80' },
    { id: 'mute', name: 'Soft Mute', desc: 'Tone-on-tone, hazy mood', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80' },
    { id: 'glam', name: 'Idol Glam', desc: 'Glitter points, stage ready', img: 'https://images.unsplash.com/photo-1503236123135-0835612d7d32?q=80' },
  ];

  const toggleStyle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
      <div className="w-full mb-12">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-4 uppercase">Step 02 — Identity</p>
        <h2 className="text-[40px] lg:text-[64px] heading-font leading-[0.9] tracking-tighter mb-4 uppercase">
          CURATE YOUR <br/><span className="italic underline decoration-1 underline-offset-8">AESTHETIC.</span>
        </h2>
        <p className="text-sm text-gray-400 font-medium max-w-sm">
          Select at least two moods that define your desired K-Beauty direction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {styles.map((style) => (
          <div 
            key={style.id}
            onClick={() => toggleStyle(style.id)}
            className="group relative h-[400px] bg-[#F9F9F9] cursor-pointer overflow-hidden rounded-[2rem] transition-all duration-700"
          >
            <div className="absolute inset-0 p-2 transition-all duration-700 group-hover:p-0">
              <img 
                src={style.img} 
                className={`w-full h-full object-cover grayscale transition-all duration-[1.5s] 
                  ${selected.includes(style.id) ? 'grayscale-0 scale-105' : 'group-hover:grayscale-0'}`} 
              />
              <div className={`absolute inset-0 bg-black/20 transition-opacity ${selected.includes(style.id) ? 'opacity-0' : 'opacity-60'}`} />
            </div>

            <div className="absolute bottom-8 left-6 z-10">
              <h3 className="text-xl heading-font italic text-white mb-1 uppercase">{style.name}</h3>
              <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">{style.desc}</p>
            </div>

            {selected.includes(style.id) && (
              <div className="absolute top-6 right-6 z-20 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center animate-in zoom-in">
                <Check size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      {selected.length >= 2 && (
        <motion.button 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onClick={onComplete}
          className="mt-12 px-12 py-6 bg-black text-white rounded-full font-black text-xs tracking-[0.3em] flex items-center gap-4 hover:bg-[#FF4D8D] transition-all shadow-2xl"
        >
          CONFIRM ARCHIVE <ArrowRight size={16} />
        </motion.button>
      )}
    </div>
  );
};

const OnboardingView: React.FC<{ onComplete: (prefs: UserPreferences) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    environment: 'Office',
    skill: 'Beginner',
    mood: 'Natural'
  });

  const nextStep = () => {
    if (step === 2) {
      if (subStep < 3) setSubStep(subStep + 1);
      else setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      onComplete(prefs);
    } else if (step < 2) {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-8 overflow-hidden font-['Plus_Jakarta_Sans']">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -50 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-[#FF4D8D] shadow-xl shadow-pink-100">
              <Camera size={36} />
            </div>
            <h2 className="text-4xl font-black heading-font tracking-tighter uppercase mb-6 leading-none">Scan Your<br/>Beauty DNA</h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-12">
              정확한 분석을 위해 보정되지 않은 정면 사진이 필요합니다.<br/>
              당신의 고유한 톤과 골격을 AI가 실시간으로 학습합니다.
            </p>
            <button onClick={nextStep} className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all shadow-2xl">
              Get Started
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key={`step2-sub${subStep}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="max-w-xl w-full text-left"
          >
            <div className="mb-12">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 w-16 rounded-full transition-all duration-500 ${i <= subStep ? 'bg-[#FF4D8D]' : 'bg-gray-100'}`} />
                ))}
              </div>
              <h2 className="text-4xl font-black heading-font tracking-tighter uppercase mb-2">Deep Profiling</h2>
              <p className="text-gray-400 text-sm font-medium">더 정교한 분석을 위해 당신의 라이프스타일을 알려주세요.</p>
            </div>

            {subStep === 1 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Environment</p>
                {[
                  { id: 'Office', label: 'Dry Office', icon: <Globe size={20} /> },
                  { id: 'Outdoor', label: 'Humid Outdoor', icon: <Zap size={20} /> },
                  { id: 'Night-out', label: 'Studio Lights', icon: <Sparkles size={20} /> }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setPrefs({...prefs, environment: opt.id as any}); nextStep(); }}
                    className="w-full p-6 md:p-8 border border-gray-100 rounded-[2.5rem] text-left font-bold hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 group-hover:text-[#FF4D8D]">{opt.icon}</div>
                      <span className="text-sm uppercase tracking-widest">{opt.label}</span>
                    </div>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-[#FF4D8D]" />
                  </button>
                ))}
              </div>
            )}

            {subStep === 2 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Skill Level</p>
                {[
                  { id: 'Beginner', label: 'Beginner (Simple Tools)', icon: '🌱' },
                  { id: 'Intermediate', label: 'Intermediate (Brushes)', icon: '🌿' },
                  { id: 'Pro', label: 'Professional (Artistry)', icon: '🎭' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setPrefs({...prefs, skill: opt.id as any}); nextStep(); }}
                    className="w-full p-6 md:p-8 border border-gray-100 rounded-[2.5rem] text-left font-bold hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm uppercase tracking-widest">{opt.label}</span>
                    </div>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-[#FF4D8D]" />
                  </button>
                ))}
              </div>
            )}

            {subStep === 3 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Desired Mood</p>
                {[
                  { id: 'Natural', label: 'Natural & Soft', icon: <Droplets size={20} /> },
                  { id: 'Elegant', label: 'Elegant & Classic', icon: <Heart size={20} /> },
                  { id: 'Powerful', label: 'Powerful K-Idol', icon: <Zap size={20} /> }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setPrefs({...prefs, mood: opt.id as any}); nextStep(); }}
                    className="w-full p-6 md:p-8 border border-gray-100 rounded-[2.5rem] text-left font-bold hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 group-hover:text-[#FF4D8D]">{opt.icon}</div>
                      <span className="text-sm uppercase tracking-widest">{opt.label}</span>
                    </div>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-[#FF4D8D]" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            <AestheticSelection onComplete={nextStep} />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-blue-500 shadow-xl shadow-blue-50">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-4xl font-black heading-font tracking-tighter uppercase mb-6">Secure Settings</h2>
            <div className="space-y-4 mb-12 text-left">
              <div className="p-8 bg-gray-50 rounded-[2.5rem] flex justify-between items-center border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest mb-1">Inclusion Guard™</span>
                  <span className="text-[10px] text-gray-400 font-medium">Auto-adaptive ethnic tone rebalancing</span>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            </div>
            <button onClick={nextStep} className="w-full py-7 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-[#FF4D8D] transition-all">
              Enter Laboratory
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [celebImage, setCelebImage] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({ environment: 'Office', skill: 'Beginner', mood: 'Natural' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!userImage || !celebImage) return;
    try {
      setStep(AppStep.ANALYZING);
      const res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs);
      setResult(res);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setStep(AppStep.IDLE);
    }
  };

  const handleOnboardingComplete = (p: UserPreferences) => {
    setPrefs(p);
    setStep(AppStep.IDLE);
  };

  const handleReset = () => {
    setResult(null);
    setStep(AppStep.IDLE);
  };

  const handleCheckout = () => {
    setStep(AppStep.CHECKOUT);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-[#0F0F0F] relative selection:bg-[#FF4D8D] selection:text-white">
      <AnimatePresence>
        {step === AppStep.ONBOARDING && <OnboardingView onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <nav className="fixed top-0 w-full z-[150] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-12 py-5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(AppStep.IDLE)}>
            <h1 className="text-2xl font-black heading-font tracking-tighter italic uppercase">
              K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {[
              { id: AppStep.IDLE, label: 'Scan' },
              { id: AppStep.MUSEBOARD, label: 'Muse Board' },
              { id: AppStep.STYLIST, label: 'Match' },
              { id: AppStep.SETTINGS, label: 'Settings' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setStep(item.id)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-[#FF4D8D]
                  ${(step === item.id || (item.id === AppStep.IDLE && (step === AppStep.ANALYZING || step === AppStep.RESULT || step === AppStep.CHECKOUT))) ? 'text-black border-b-2 border-[#FF4D8D] pb-1' : 'text-gray-400'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all">
               <User size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-10">
                {[
                  { id: AppStep.IDLE, label: 'Scan Laboratory', icon: <Camera size={20}/> },
                  { id: AppStep.MUSEBOARD, label: 'Muse Board', icon: <LayoutGrid size={20}/> },
                  { id: AppStep.STYLIST, label: 'Expert Match', icon: <MessageCircle size={20}/> },
                  { id: AppStep.SETTINGS, label: 'Settings', icon: <Settings size={20}/> }
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => { setStep(item.id); setIsMenuOpen(false); }}
                    className={`flex items-center gap-6 text-sm font-black uppercase tracking-widest ${step === item.id ? 'text-[#FF4D8D]' : 'text-gray-400'}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen">
        <AnimatePresence mode="wait">
          {step === AppStep.IDLE && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col lg:flex-row items-center gap-16 lg:py-12">
              <div className="flex-1 text-center lg:text-left space-y-10">
                <div>
                  <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em] mb-6">Biometric Style Lab</p>
                  <h2 className="text-6xl lg:text-8xl font-black heading-font leading-[0.9] tracking-tighter uppercase mb-10">Reflect Your<br/><span className="text-gray-300">Inner Idol.</span></h2>
                  <p className="text-base lg:text-lg text-gray-500 mb-12 max-w-md leading-relaxed mx-auto lg:mx-0 font-medium italic uppercase tracking-tighter">당신의 인종적 특성과 골격을 AI가 학습합니다.<br/>보정 없는 본연의 아름다움을 위해.</p>
                </div>
                <div className="grid grid-cols-2 gap-6 md:gap-10 mb-12">
                  <LuxuryFileUpload label="Base Portrait" preview={userImage} onImageSelect={setUserImage} secondaryLabel="Bare-Face / No Makeup" />
                  <LuxuryFileUpload label="Style Muse" preview={celebImage} onImageSelect={setCelebImage} secondaryLabel="Pinterest Inspiration" />
                </div>
                <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start items-center">
                   <div className="flex items-center gap-6 bg-gray-50/50 px-8 py-5 rounded-[2.5rem] border border-gray-100 backdrop-blur-sm">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Sensitivity</span>
                        <span className="text-[10px] font-bold text-gray-900 uppercase">Ingredient Filter</span>
                     </div>
                     <Toggle checked={isSensitive} onChange={() => setIsSensitive(!isSensitive)} />
                   </div>
                   <button onClick={handleAnalyze} disabled={!userImage || !celebImage} className="px-14 py-7 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-[#FF4D8D] transition-all duration-500 disabled:opacity-20 shadow-2xl active:scale-95 flex items-center gap-4">
                    Neural Scan {userImage && celebImage && <Sparkles size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === AppStep.ANALYZING && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center gap-16">
              <div className="relative w-80 md:w-[26rem] aspect-[3/4] bg-gray-50 rounded-[4rem] overflow-hidden scanning shadow-2xl border border-gray-100">
                {userImage && <img src={`data:image/jpeg;base64,${userImage}`} className="w-full h-full object-cover opacity-50 grayscale transition-all duration-1000" />}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent"></div>
              </div>
              <div className="text-center space-y-6">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter heading-font animate-pulse italic">Decoding DNA...</h2>
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Synchronizing Melanin Guard™</p>
                  <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em]">Mapping Sherlock Facial Proportions</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === AppStep.RESULT && result && (
            <AnalysisResultView result={result} onReset={handleReset} onCheckout={handleCheckout} />
          )}

          {step === AppStep.CHECKOUT && (
            <GlobalCheckoutView result={result} />
          )}

          {step === AppStep.STYLIST && (
             <ExpertMatchingView />
          )}

          {step === AppStep.SETTINGS && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto space-y-16 py-12">
               <div className="text-center">
                 <h2 className="text-4xl font-black heading-font tracking-tighter uppercase italic">System <span className="text-[#FF4D8D] not-italic">Settings</span></h2>
               </div>
               <div className="p-12 bg-white border border-gray-100 rounded-[3.5rem] shadow-xl space-y-12">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-black uppercase tracking-widest">Inclusion Guard™</p>
                     <p className="text-[10px] text-gray-400 mt-1">Ethical melanin rebalancing protocol</p>
                   </div>
                   <Toggle checked={true} onChange={() => {}} />
                 </div>
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-black uppercase tracking-widest">Neural Safety Filter</p>
                     <p className="text-[10px] text-gray-400 mt-1">Ingredient safety scan active</p>
                   </div>
                   <Toggle checked={isSensitive} onChange={() => setIsSensitive(!isSensitive)} />
                 </div>
               </div>
               <button onClick={() => setStep(AppStep.ONBOARDING)} className="w-full py-6 text-[10px] font-black uppercase tracking-widest text-gray-200 hover:text-red-500 transition-colors">Reset Neural Stylist Data</button>
            </motion.div>
          )}

          {step === AppStep.MUSEBOARD && (
             <motion.div key="muse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[4rem] bg-gray-50/20">
               <LayoutGrid size={64} className="mx-auto text-gray-200 mb-10" />
               <p className="text-gray-400 font-black uppercase tracking-[0.6em]">Neural Muse Board Coming Soon</p>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 border-t border-gray-50 text-center bg-white">
        <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.7em] mb-6">K-MIRROR Neural Beauty Intelligence</p>
        <div className="flex justify-center gap-10">
           <Globe size={18} className="text-gray-300 hover:text-black transition-colors cursor-pointer" />
           <ShoppingBag size={18} className="text-gray-300 hover:text-black transition-colors cursor-pointer" />
           <Heart size={18} className="text-gray-300 hover:text-[#FF4D8D] transition-colors cursor-pointer" />
        </div>
      </footer>
    </div>
  );
}
