
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Camera, LayoutGrid, MessageCircle, Settings, Menu, X, 
  ArrowRight, ShieldCheck, User, Sparkles, ShoppingBag, 
  ChevronRight, Heart, Globe, Plus, Zap, Droplets, Palette, Eye, 
  ArrowUpRight, Check, Play, ExternalLink, RotateCcw, Truck, Info, Beaker,
  Fingerprint, Ruler, Box, Scan, Layers, Target, Briefcase, Sun, Monitor,
  Activity, Command, Cpu, Star, Award, Lightbulb
} from 'lucide-react';
import { AppStep, AnalysisResult, UserPreferences, Product, VideoRecommendation } from './types';
import { analyzeKBeauty } from './services/geminiService';

// --- Animation Variants ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 1, 
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number] 
    }
  }
};

const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: { 
    scale: 1.05, 
    opacity: 1,
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      repeatType: "reverse", 
      ease: "easeInOut" 
    }
  }
};

// --- Helper Components ---

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center ${checked ? 'bg-[#FF4D8D]' : 'bg-gray-200'}`}
  >
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`w-4 h-4 bg-white rounded-full shadow-sm ${checked ? 'ml-auto' : 'ml-0'}`} 
    />
  </button>
);

const LuxuryFileUpload = ({ label, secondaryLabel, preview, onImageSelect }: { label: string; secondaryLabel: string; preview: string | null; onImageSelect: (base64: string) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      className="flex-1"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-4">{label}</p>
      <label className="group relative block aspect-[4/5] bg-[#F9F9F9] rounded-[2.5rem] border border-gray-100 overflow-hidden cursor-pointer hover:border-black transition-all">
        {preview ? (
          <motion.img 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            src={`data:image/jpeg;base64,${preview}`} 
            className="w-full h-full object-cover" 
            alt="Preview" 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <motion.div 
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-gray-300 group-hover:text-[#FF4D8D] group-hover:scale-110 transition-all"
            >
              <Camera size={24} />
            </motion.div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black transition-colors">{secondaryLabel}</p>
          </div>
        )}
        <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
      </label>
    </motion.div>
  );
};

// --- Sherlock Proportion Visualizer ---

const SherlockProportionVisualizer = ({ proportions }: { proportions: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[200px] aspect-[2/3] flex flex-col items-center justify-center bg-gray-50/50 rounded-[2rem] border border-gray-100 p-4"
    >
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 pointer-events-none opacity-10">
        {[...Array(24)].map((_, i) => <div key={i} className="border-[0.5px] border-black" />)}
      </div>

      <div className="relative w-full h-full flex flex-col">
        {/* Upper Zone */}
        <div className="flex-1 flex flex-col items-center justify-center relative border-b border-dashed border-[#FF4D8D]/30 group">
          <div className="text-[8px] font-black text-gray-300 uppercase absolute top-2 left-2">Frontal</div>
          <motion.div 
            initial={{ height: 0 }} animate={{ height: '40%' }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-[2px] bg-[#FF4D8D]/20 absolute left-1/2 -translate-x-1/2 top-0"
          />
          <span className="text-sm heading-font italic text-[#FF4D8D] font-bold">{proportions.upper}</span>
        </div>

        {/* Middle Zone */}
        <div className="flex-[1.2] flex flex-col items-center justify-center relative border-b border-dashed border-[#FF4D8D]/30">
          <div className="text-[8px] font-black text-gray-300 uppercase absolute top-2 left-2">Orbital</div>
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Target size={12} className="text-[#FF4D8D]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
          <span className="text-lg heading-font italic text-[#FF4D8D] font-black">{proportions.middle}</span>
        </div>

        {/* Lower Zone */}
        <div className="flex-[0.9] flex flex-col items-center justify-center relative">
          <div className="text-[8px] font-black text-gray-300 uppercase absolute top-2 left-2">Mandibular</div>
          <span className="text-sm heading-font italic text-[#FF4D8D] font-bold">{proportions.lower}</span>
        </div>
      </div>

      {/* Vertical Axis Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-pink-200 to-transparent -translate-x-1/2 opacity-50" />
      
      <div className="mt-4 w-full">
         <div className="h-[2px] w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: '94%' }}
              transition={{ delay: 1, duration: 1.5 }}
              className="h-full bg-[#FF4D8D]"
            />
         </div>
         <p className="text-[7px] text-center font-black uppercase text-gray-400 tracking-[0.3em] mt-2">Sherlock Ratio Sync: 94%</p>
      </div>
    </motion.div>
  );
};

// --- Sherlock Methodology View ---

const MethodologyView = ({ onBookSession }: { onBookSession: () => void }) => {
  const pillars = [
    {
      id: "01",
      title: "Facial Proportion Mapping",
      subtitle: "The 1:1.2:0.9 Golden Ratio",
      desc: "Our neural engine moves beyond archaic 'face shape' classifications. By segmenting the face into three distinct horizontal sectors—Upper, Middle, and Lower—Sherlock identifies the specific millimetric deviations from the iconic K-Idol balance. This allows for a precision-engineered approach to volume and contour placement, creating harmony where there was once disparity.",
      icon: <Ruler size={32} />,
      img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80",
      accent: "Digital Symmetry"
    },
    {
      id: "02",
      title: "Optical Vector Analysis",
      subtitle: "Eye Angle & Orbital Intensity",
      desc: "We analyze the 'Canthal Tilt'—the critical angle between the inner and outer corners of the eye. Whether your anatomy dictates a 'Doe-eye' (neutral), 'Cat-eye' (positive), or 'Puppy-eye' (negative) vector, Sherlock adapts high-fashion K-eyeliner techniques to enhance your natural gaze. We don't hide your ethnicity; we accentuate its most powerful visual vectors.",
      icon: <Eye size={32} />,
      img: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80",
      accent: "Orbital Energy"
    },
    {
      id: "03",
      title: "Osteo-Structural Mapping",
      subtitle: "Skeletal Architecture vs. Skin Tension",
      desc: "True K-Beauty elegance is built on the bone. Sherlock identifies the prominence of the zygomatic arch and the mandible to determine your 'Structural Signature.' This dictates whether a 'Soft-Focus' dewy look or a 'Sculpted-Matte' editorial finish will better serve your unique skeletal architecture, ensuring your transformation looks flawless in high-intensity lighting.",
      icon: <Box size={32} />,
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80",
      accent: "Bone Blueprint"
    }
  ];

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={containerVariants}
      className="max-w-7xl mx-auto py-20 px-6"
    >
      <motion.section variants={itemVariants} className="mb-32 border-b border-black pb-20">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-8 uppercase italic">Technical Philosophy — Sherlock v4.2</p>
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <h2 className="text-[60px] lg:text-[120px] heading-font leading-[0.8] tracking-[-0.05em] uppercase">
            FORENSIC <br/><span className="italic">BEAUTY.</span>
          </h2>
          <div className="max-w-md">
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-6 italic border-l-2 border-[#FF4D8D] pl-6">
              "We don't apply trends; we decode biology through the lens of Seoul's aesthetic elite."
            </p>
            <p className="text-sm text-gray-500 leading-relaxed font-medium uppercase tracking-tight text-balance">
              The Sherlock Methodology is K-MIRROR’s proprietary facial analysis framework. It digitizes the intuition of world-class celebrity directors into a millimetric precision engine.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 gap-40">
        {pillars.map((pillar, idx) => (
          <motion.div 
            key={pillar.id} 
            variants={itemVariants}
            className={`flex flex-col lg:flex-row items-center gap-20 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className="flex-1 space-y-12">
              <div className="flex items-center gap-6">
                <span className="text-4xl heading-font italic text-gray-200">{pillar.id}</span>
                <div className="w-16 h-[1px] bg-gray-200" />
                <div className="text-[#FF4D8D]">{pillar.icon}</div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D8D] mb-3">{pillar.accent}</p>
                <h3 className="text-4xl lg:text-5xl heading-font uppercase tracking-tighter mb-4">{pillar.title}</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">{pillar.subtitle}</p>
                <p className="text-gray-500 leading-[1.8] text-sm font-medium max-w-lg">
                  {pillar.desc}
                </p>
              </div>
              <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border-b border-black pb-2 hover:text-[#FF4D8D] hover:border-[#FF4D8D] transition-all uppercase">
                Access Laboratory Whitepaper <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="flex-1 w-full aspect-square relative group">
              <div className="absolute inset-0 bg-gray-50 rounded-[4rem] overflow-hidden shadow-2xl">
                <img 
                  src={pillar.img} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" 
                  alt={pillar.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="flex items-center gap-3">
                    <Activity size={14} className="text-[#FF4D8D]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.5em]">Real-time Scan Data</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-[#FF4D8D]/20 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-2 border-l-2 border-[#FF4D8D]/20 pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </section>

      <motion.section variants={itemVariants} className="mt-60 mb-20 py-40 bg-black text-white rounded-[6rem] text-center overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
           <Layers size={800} strokeWidth={0.5} className="absolute -top-40 -left-40 animate-pulse text-[#FF4D8D]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-[#FF4D8D] mb-12">Universal Aesthetic Bridge</p>
          <h4 className="text-4xl lg:text-7xl heading-font italic leading-[1.1] uppercase mb-16 text-balance">
            "Your identity is the <br/>
            constant. Seoul is <br/>
            the variable."
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto font-medium mb-20 text-balance">
            K-MIRROR removes the barrier of entry to the world's most sophisticated beauty standards. Our AI translates professional artistry into a personalized protocol for every face, every tone, and every identity on Earth.
          </p>

          <div className="flex flex-col items-center gap-10">
            <div className="w-[1px] h-20 bg-[#FF4D8D]/30" />
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Human Artistry Intervention</p>
              <h3 className="text-3xl heading-font uppercase">Ready for a Master Director?</h3>
            </div>
            <button 
              onClick={onBookSession}
              className="group relative flex items-center gap-6 px-14 py-8 bg-white text-black rounded-full font-black text-xs tracking-[0.4em] uppercase hover:bg-[#FF4D8D] hover:text-white transition-all duration-500"
            >
              Book Master Session <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FF4D8D] rounded-full flex items-center justify-center text-white rotate-12 shadow-xl">
                <Star size={18} fill="currentColor" />
              </div>
            </button>
            <div className="flex gap-12 mt-8">
               <div className="flex flex-col items-center">
                 <span className="text-2xl font-black heading-font">184</span>
                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Adaptive Metrics</span>
               </div>
               <div className="flex flex-col items-center">
                 <span className="text-2xl font-black heading-font">0.4mm</span>
                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Scan Precision</span>
               </div>
               <div className="flex flex-col items-center">
                 <span className="text-2xl font-black heading-font">99.2%</span>
                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Inclusive Score</span>
               </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

const OnboardingView = ({ onComplete }: { onComplete: (prefs: UserPreferences) => void }) => {
  const [prefs, setPrefs] = useState<UserPreferences>({
    environment: 'Office',
    skill: 'Beginner',
    mood: 'Natural'
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xl w-full space-y-12"
      >
        <motion.header variants={itemVariants}>
          <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-6 uppercase">Initialization</p>
          <h2 className="text-5xl heading-font uppercase">Calibrate Your <br/><span className="italic">Stylist.</span></h2>
        </motion.header>

        <div className="space-y-10">
          <motion.section variants={itemVariants}>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Target Environment</p>
            <div className="flex justify-center gap-4">
              {['Office', 'Outdoor', 'Studio'].map((env) => (
                <button 
                  key={env}
                  onClick={() => setPrefs({ ...prefs, environment: env as any })}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${prefs.environment === env ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {env}
                </button>
              ))}
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Makeup Skill Level</p>
            <div className="flex justify-center gap-4">
              {['Beginner', 'Intermediate', 'Pro'].map((lvl) => (
                <button 
                  key={lvl}
                  onClick={() => setPrefs({ ...prefs, skill: lvl as any })}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${prefs.skill === lvl ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Desired Mood</p>
            <div className="flex justify-center gap-4">
              {['Natural', 'Elegant', 'Powerful'].map((m) => (
                <button 
                  key={m}
                  onClick={() => setPrefs({ ...prefs, mood: m as any })}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${prefs.mood === m ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.button 
          variants={itemVariants}
          onClick={() => onComplete(prefs)}
          className="group flex items-center gap-4 px-12 py-6 bg-black text-white rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-[#FF4D8D] transition-all"
        >
          Initialize Engine <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const ExpertMatchingView = () => {
  const experts = [
    { name: 'Director Kim', role: 'Editorial Lead', rating: 4.9, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80' },
    { name: 'Stylist Han', role: 'Idol Visualist', rating: 5.0, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80' },
    { name: 'Master Park', role: 'Osteo-Technician', rating: 4.8, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80' }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-20 py-12">
      <motion.header variants={itemVariants} className="text-center space-y-6">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] uppercase">Direct Access</p>
        <h2 className="text-5xl lg:text-7xl heading-font uppercase">Human <span className="italic">Artistry.</span></h2>
        <p className="text-gray-400 max-w-lg mx-auto text-sm font-medium">Elevate your AI-generated protocol with a live session from Seoul's most exclusive aesthetic directors.</p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {experts.map((expert, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="group relative bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col items-center text-center hover:shadow-2xl transition-all"
          >
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden mb-8 border-4 border-gray-50 group-hover:border-[#FF4D8D] transition-all relative">
              <img src={expert.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={expert.name} />
              <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h3 className="text-xl heading-font uppercase mb-1">{expert.name}</h3>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">{expert.role}</p>
            <div className="flex items-center gap-1 text-[#FF4D8D] mb-8">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < Math.floor(expert.rating) ? "currentColor" : "none"} />)}
              <span className="text-[10px] font-bold ml-2 text-gray-400">{expert.rating}</span>
            </div>
            <button className="w-full py-4 bg-gray-50 text-black rounded-2xl font-black text-[9px] tracking-widest uppercase hover:bg-black hover:text-white transition-all">
              Book Session
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Mock Data ---

const DEMO_RESULT: AnalysisResult = {
  tone: {
    melaninIndex: 5,
    undertone: 'Cool',
    skinConcerns: ['Hyper-pigmentation', 'Inner Dryness', 'Structural Shadowing'],
    description: "Your complexion exhibits a rich, cool-ebony depth (Melanin L5) with subtle sapphire undertones. K-Beauty standards for this tone shift from 'whitening' to 'luminosity optimization,' focusing on high-chroma berry pigments and moisture-locked glass finishes."
  },
  sherlock: {
    proportions: { upper: '1', middle: '1.25', lower: '0.85' },
    eyeAngle: '12° Positive Cat-eye',
    boneStructure: 'High-Definition Angular Zygomatic',
    facialVibe: 'Seoul Bold / Avant-Garde'
  },
  kMatch: {
    celebName: 'Wonyoung (IVE)',
    adaptationLogic: {
      base: 'Replacing translucent beige with a deep-gold infused radiant primer to neutralize ashiness while maintaining K-glow.',
      lip: 'Pivot from pastel coral to a high-saturation Deep Black-Cherry glass tint. Use a blurred edge for a modern Seoul editorial look.',
      point: 'Structural K-idol lash mapping using 10mm-12mm clusters focused on the outer third to accentuate the 12° cat-eye angle.'
    },
    styleExplanation: "We have re-engineered the 'Strawberry Moon' look for a deeper palette. Instead of desaturating, we increased chromatic density by 40% to achieve the same 'pop' effect on melanin-rich skin. This is the 'Midnight Muse' variant of the look.",
    aiStylePoints: ['Melanin-Safe Luminosity', 'Chromatic Saturation Shift', 'Structural Vector Lashes']
  },
  recommendations: {
    ingredients: ['Niacinamide (5%)', 'Beta-Glucan', 'Ceramide NP', 'Black Rice Extract'],
    products: [
      { name: 'Black Cushion (Deep Shade)', brand: 'HERA', price: '$45', desc: 'High-coverage matte finish with zero ashiness.', matchScore: 98, ingredients: [], safetyRating: 'EWG Green' },
      { name: 'Glasting Water Tint (Fig)', brand: 'ROM&ND', price: '$14', desc: 'High-gloss finish with deep pigment retention.', matchScore: 96, ingredients: [], safetyRating: 'Vegan' },
      { name: 'Ultra Facial Cream', brand: 'KIEHLS (K-Exclusive)', price: '$38', desc: 'Heavy hydration for the 1:1.2:0.9 proportion prep.', matchScore: 92, ingredients: [], safetyRating: 'Safe' },
      { name: 'Super Slim Pen Liner', brand: 'CLIO', price: '$12', desc: 'Waterproof precision for vector eyeliner.', matchScore: 95, ingredients: [], safetyRating: 'Safe' }
    ],
    videos: [
      { title: 'Cool Tone Adaptation for Deep Skin', creator: 'PONY Syndrome', views: '2.1M', duration: '14:20', tag: 'Masterclass', aiCoaching: 'Focus on the 3:45 mark: use a stippling motion rather than wiping to avoid disturbing the melanin-guard primer.', matchPercentage: 99, skillLevel: 'Intermediate' },
      { title: 'Structural Eyeliner Theory', creator: 'LeoJ Makeup', views: '850K', duration: '08:15', tag: 'Technique', aiCoaching: 'Apply liner at the specific 12° angle found in your scan to harmonize with your zygomatic prominence.', matchPercentage: 94, skillLevel: 'Pro' }
    ],
    sensitiveSafe: true
  }
};

const TRANSFORMATION_SAMPLES = [
  {
    name: "Deep Tone / Idol Glam",
    user: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80",
    muse: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80",
    result: "Velvet Berry Look"
  },
  {
    name: "South Asian / Clean Girl",
    user: "https://images.unsplash.com/photo-1523824921871-d6f1a31951bc?q=80",
    muse: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80",
    result: "Honey Glass Glow"
  },
  {
    name: "East Asian / Seoul Mute",
    user: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80",
    muse: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80",
    result: "Graphic Lavender"
  }
];

// --- View Components ---

const GlobalCheckoutView: React.FC<{ result: AnalysisResult | null }> = ({ result }) => {
  const [shippingMethod, setShippingMethod] = useState('dhl');
  const subtotal = result?.recommendations.products.reduce((acc, p) => acc + parseFloat(p.price.replace('$', '')), 0) || 45;
  const shippingCost = shippingMethod === 'dhl' ? 18 : 12;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto py-20 px-6">
      <motion.header variants={itemVariants} className="mb-20 border-b border-black pb-12">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-6 uppercase italic">Step 04 — Acquisition</p>
        <h2 className="text-[50px] lg:text-[80px] heading-font leading-[0.9] tracking-[-0.04em] uppercase text-balance">
          SECURE YOUR <br/><span className="italic underline decoration-1 underline-offset-8">ARCHIVE.</span>
        </h2>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-16">
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
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-5">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 sticky top-32 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-gray-300 text-center uppercase">Order Summary</h4>
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

            <button className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-[#FF4D8D] transition-all mb-6 shadow-xl uppercase">
              Complete Payment
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest uppercase">
              <ShieldCheck size={14} className="text-green-500" /> Secure Checkout by Stripe
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const AnalysisResultView: React.FC<{ result: AnalysisResult; onReset: () => void; onCheckout: () => void }> = ({ result, onReset, onCheckout }) => {
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

const App = () => {
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

  const handleDemoMode = () => {
    setStep(AppStep.ANALYZING);
    setTimeout(() => {
      setResult(DEMO_RESULT);
      setStep(AppStep.RESULT);
    }, 2000);
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
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setStep(AppStep.IDLE)}
          >
            <h1 className="text-2xl font-black heading-font tracking-tighter italic uppercase text-balance">
              K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
            </h1>
          </motion.div>

          <div className="hidden lg:flex items-center gap-12">
            {[
              { id: AppStep.IDLE, label: 'Scan' },
              { id: AppStep.MUSEBOARD, label: 'Muse Board' },
              { id: AppStep.STYLIST, label: 'Match' },
              { id: AppStep.METHODOLOGY, label: 'Sherlock' },
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
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
               <User size={18} className="text-gray-400" />
            </motion.div>
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
                  { id: AppStep.METHODOLOGY, label: 'Sherlock Methodology', icon: <Scan size={20}/> },
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
            <motion.div 
              key="idle" initial="hidden" animate="visible" variants={containerVariants}
              className="flex flex-col lg:flex-row items-center gap-16 lg:py-12"
            >
              <motion.div variants={itemVariants} className="flex-1 text-center lg:text-left space-y-10">
                <div className="relative inline-block">
                  <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em] mb-6 uppercase">Biometric Style Lab</p>
                  <button onClick={handleDemoMode} className="absolute -top-12 -right-12 group">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }} 
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors"
                    >
                      <Beaker size={20} />
                    </motion.div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase uppercase">Preview Demo</div>
                  </button>
                  <h2 className="text-6xl lg:text-8xl font-black heading-font leading-[0.9] tracking-tighter uppercase mb-10 text-balance">Reflect Your<br/><span className="text-gray-300 text-balance">Inner Idol.</span></h2>
                  <p className="text-base lg:text-lg text-gray-500 mb-12 max-w-md leading-relaxed mx-auto lg:mx-0 font-medium italic uppercase tracking-tighter text-balance">당신의 인종적 특성과 골격을 AI가 학습합니다.<br/>보정 없는 본연의 아름다움을 위해.</p>
                </div>
                <div className="grid grid-cols-2 gap-6 md:gap-10 mb-12">
                  <LuxuryFileUpload label="Base Portrait" preview={userImage} onImageSelect={setUserImage} secondaryLabel="Bare-Face / No Makeup" />
                  <LuxuryFileUpload label="Style Muse" preview={celebImage} onImageSelect={setCelebImage} secondaryLabel="Pinterest Inspiration" />
                </div>
                <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start items-center">
                   <motion.div 
                     variants={itemVariants}
                     className="flex items-center gap-6 bg-gray-50/50 px-8 py-5 rounded-[2.5rem] border border-gray-100 backdrop-blur-sm shadow-sm"
                   >
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1 uppercase">Sensitivity</span>
                        <span className="text-[10px] font-bold text-gray-900 uppercase uppercase">Ingredient Filter</span>
                     </div>
                     <Toggle checked={isSensitive} onChange={() => setIsSensitive(!isSensitive)} />
                   </motion.div>
                   <motion.button 
                     variants={itemVariants}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleAnalyze} 
                     disabled={!userImage || !celebImage} 
                     className="px-14 py-7 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-[#FF4D8D] transition-all duration-500 disabled:opacity-20 shadow-2xl flex items-center gap-4 uppercase"
                   >
                    Neural Scan {userImage && celebImage && <Sparkles size={16} />}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === AppStep.ANALYZING && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[60vh] flex flex-col items-center justify-center gap-16">
              <div className="relative w-80 md:w-[26rem] aspect-[3/4] bg-gray-50 rounded-[4rem] overflow-hidden scanning shadow-2xl border border-gray-100">
                {userImage && <motion.img initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 10 }} src={`data:image/jpeg;base64,${userImage}`} className="w-full h-full object-cover opacity-50 grayscale" alt="Scanning User" />}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent"></div>
              </div>
              <div className="text-center space-y-6">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter heading-font animate-pulse italic uppercase">Decoding DNA...</h2>
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] uppercase">Synchronizing Melanin Guard™</p>
                  <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em] uppercase">Mapping Sherlock Facial Proportions</p>
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

          {step === AppStep.METHODOLOGY && (
             <MethodologyView onBookSession={() => setStep(AppStep.STYLIST)} />
          )}

          {step === AppStep.SETTINGS && (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto space-y-16 py-12 px-6">
               <div className="text-center">
                 <h2 className="text-4xl font-black heading-font tracking-tighter uppercase italic uppercase">System <span className="text-[#FF4D8D] not-italic">Settings</span></h2>
               </div>
               <div className="p-12 bg-white border border-gray-100 rounded-[3.5rem] shadow-xl space-y-12">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-black uppercase tracking-widest uppercase">Inclusion Guard™</p>
                     <p className="text-[10px] text-gray-400 mt-1 text-balance">Ethical melanin rebalancing protocol</p>
                   </div>
                   <Toggle checked={true} onChange={() => {}} />
                 </div>
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-black uppercase tracking-widest uppercase">Neural Safety Filter</p>
                     <p className="text-[10px] text-gray-400 mt-1 text-balance">Ingredient safety scan active</p>
                   </div>
                   <Toggle checked={isSensitive} onChange={() => setIsSensitive(!isSensitive)} />
                 </div>
               </div>
               <button onClick={() => setStep(AppStep.ONBOARDING)} className="w-full py-6 text-[10px] font-black uppercase tracking-widest text-gray-200 hover:text-red-500 transition-colors uppercase uppercase">Reset Neural Stylist Data</button>
            </motion.div>
          )}

          {step === AppStep.MUSEBOARD && (
             <motion.div key="muse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[4rem] bg-gray-50/20 mx-6">
               <LayoutGrid size={64} className="mx-auto text-gray-200 mb-10" />
               <p className="text-gray-400 font-black uppercase tracking-[0.6em] uppercase">Neural Muse Board Coming Soon</p>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 border-t border-gray-50 text-center bg-white">
        <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.7em] mb-6 uppercase">K-MIRROR Neural Beauty Intelligence</p>
        <div className="flex justify-center gap-10">
           <Globe size={18} className="text-gray-300 hover:text-black transition-colors cursor-pointer" />
           <ShoppingBag size={18} className="text-gray-300 hover:text-black transition-colors cursor-pointer" />
           <Heart size={18} className="text-gray-300 hover:text-[#FF4D8D] transition-colors cursor-pointer" />
        </div>
      </footer>
    </div>
  );
};

export default App;
