
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppStep, AnalysisResult, SavedMuse, MuseBoard, UserPreferences } from './types';
import { analyzeKBeauty } from './services/geminiService';

// --- Shared Components ---

const NavIcon: React.FC<{ 
  icon: string; 
  active: boolean; 
  onClick: () => void; 
  label: string;
  isMobile?: boolean;
}> = ({ icon, active, onClick, label, isMobile }) => (
  <button 
    onClick={onClick}
    className={`flex ${isMobile ? 'flex-col flex-1 py-3' : 'flex-col mb-10'} items-center gap-1 group transition-all ${active ? 'text-[#FF4D8D]' : 'text-gray-300 hover:text-black'}`}
  >
    <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-pink-50' : 'group-hover:bg-gray-50'}`}>
      <i className={`fa-light ${icon} ${isMobile ? 'text-base' : 'text-lg'}`}></i>
    </div>
    <span className={`${isMobile ? 'text-[8px]' : 'text-[9px]'} font-black uppercase tracking-widest`}>{label}</span>
  </button>
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-10 md:w-12 h-5 md:h-6 rounded-full transition-all relative ${checked ? 'bg-[#FF4D8D]' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${checked ? 'left-5 md:left-7' : 'left-0.5 md:left-1'}`} />
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
    <div className="flex flex-col gap-3 md:gap-4">
      <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400">
        {label}
      </label>
      <div className="relative group aspect-[3/4] bg-gray-50 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all">
        {preview ? (
          <img src={`data:image/jpeg;base64,${preview}`} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-6 md:p-8 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 md:mb-6 group-hover:bg-black group-hover:text-white transition-all">
              <i className="fa-light fa-plus text-gray-300"></i>
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">{secondaryLabel || 'Upload'}</p>
          </div>
        )}
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

// --- View Components ---

const OnboardingView: React.FC<{ onComplete: (prefs: UserPreferences) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({
    environment: 'Office',
    skill: 'Beginner',
    mood: 'Natural'
  });

  const nextStep = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (step === 2) {
         if (subStep < 3) {
            setSubStep(subStep + 1);
         } else {
            setStep(step + 1);
         }
      } else if (step < 3) {
        setStep(step + 1);
      } else {
        onComplete(prefs);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -50 }}
            className="text-center max-w-xs md:max-w-md mx-auto"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-pink-50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 md:mb-10 text-[#FF4D8D] shadow-xl shadow-pink-100">
              <i className="fa-light fa-camera text-2xl md:text-3xl"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-black heading-font tracking-tighter uppercase mb-4 md:mb-6">Scan Your<br/>Beauty DNA</h2>
            <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed mb-10 md:mb-12">
              정확한 분석을 위해 보정되지 않은 정면 사진이 필요합니다.<br/>
              당신의 고유한 톤과 골격을 AI가 실시간으로 학습합니다.
            </p>
            <button onClick={nextStep} className="w-full py-5 md:py-6 bg-black text-white rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-[#FF4D8D] transition-all shadow-2xl">
              {loading ? "Initializing..." : "Get Started"}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key={`step2-sub${subStep}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="max-w-xl w-full text-left"
          >
            <div className="mb-10">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 w-16 rounded-full transition-all duration-500 ${i <= subStep ? 'bg-[#FF4D8D]' : 'bg-gray-100'}`} />
                ))}
              </div>
              <h2 className="text-4xl font-black font-['Outfit'] tracking-tighter uppercase mb-2">Deep Profiling</h2>
              <p className="text-gray-400 text-sm font-medium">더 정교한 분석을 위해 당신의 환경을 알려주세요.</p>
            </div>

            {subStep === 1 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Main Environment</p>
                {[
                  { id: 'Office', label: 'Air-conditioned Office', icon: '🏢' },
                  { id: 'Outdoor', label: 'Active Outdoors', icon: '☀️' },
                  { id: 'Night-out', label: 'Night-out / Party', icon: '✨' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setPrefs({...prefs, environment: opt.id as any}); nextStep(); }}
                    className="w-full p-6 md:p-8 border-2 border-gray-100 rounded-[2rem] text-left font-black uppercase text-xs tracking-widest hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    <i className="fa-light fa-arrow-right opacity-0 group-hover:opacity-100 transition-all text-pink-500"></i>
                  </button>
                ))}
              </div>
            )}

            {subStep === 2 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Your Skill Level</p>
                {[
                  { id: 'Beginner', label: 'Beginner (Basic items)', icon: '🌱' },
                  { id: 'Intermediate', label: 'Intermediate (Multi-step)', icon: '🌿' },
                  { id: 'Pro', label: 'Professional (Artistry)', icon: '🎭' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setPrefs({...prefs, skill: opt.id as any}); nextStep(); }}
                    className="w-full p-6 md:p-8 border-2 border-gray-100 rounded-[2rem] text-left font-black uppercase text-xs tracking-widest hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    <i className="fa-light fa-arrow-right opacity-0 group-hover:opacity-100 transition-all text-pink-500"></i>
                  </button>
                ))}
              </div>
            )}

            {subStep === 3 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Desired Mood</p>
                {[
                  { id: 'Natural', label: 'Natural Glow', icon: '💧' },
                  { id: 'Elegant', label: 'Elegant & Classic', icon: '💎' },
                  { id: 'Powerful', label: 'Powerful K-Idol', icon: '⚡' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setPrefs({...prefs, mood: opt.id as any}); nextStep(); }}
                    className="w-full p-6 md:p-8 border-2 border-gray-100 rounded-[2rem] text-left font-black uppercase text-xs tracking-widest hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    <i className="fa-light fa-arrow-right opacity-0 group-hover:opacity-100 transition-all text-pink-500"></i>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-xs md:max-w-md mx-auto"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 md:mb-10 text-blue-500 shadow-xl shadow-blue-50">
              <i className="fa-light fa-shield-check text-2xl md:text-3xl"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-black heading-font tracking-tighter uppercase mb-6">Secure Settings</h2>
            <div className="space-y-4 mb-12 text-left">
              <div className="p-6 bg-gray-50 rounded-[2rem] flex justify-between items-center border border-gray-100">
                <span className="text-xs font-black uppercase tracking-tight">Inclusion Guard™</span>
                <div className="w-10 h-6 bg-[#FF4D8D] rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"/></div>
              </div>
            </div>
            <button onClick={nextStep} className="w-full py-6 bg-[#FF4D8D] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl">
              {loading ? "Starting..." : "Enter K-Mirror AI"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [celebImage, setCelebImage] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({ environment: 'Office', skill: 'Beginner', mood: 'Natural' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedMuses, setSavedMuses] = useState<SavedMuse[]>([]);

  useEffect(() => {
    const m = localStorage.getItem('k_mirror_muses_v4');
    if (m) setSavedMuses(JSON.parse(m));
  }, []);

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

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col md:flex-row font-['Plus_Jakarta_Sans'] text-[#0F0F0F] relative">
      <AnimatePresence>
        {step === AppStep.ONBOARDING && <OnboardingView onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* Navigation (Desktop) */}
      <nav className="hidden md:flex w-24 bg-white border-r border-gray-100 flex-col items-center py-10 sticky top-0 h-screen z-[150]">
        <div className="mb-12 cursor-pointer" onClick={() => setStep(AppStep.IDLE)}>
          <h1 className="text-3xl font-black font-['Outfit'] text-[#FF4D8D]">K</h1>
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <NavIcon icon="fa-camera" active={step === AppStep.IDLE || step === AppStep.ANALYZING || step === AppStep.RESULT} onClick={() => setStep(AppStep.IDLE)} label="Scan" />
          <NavIcon icon="fa-grid-2" active={step === AppStep.MUSEBOARD} onClick={() => setStep(AppStep.MUSEBOARD)} label="Muse" />
          <NavIcon icon="fa-comment-dots" active={step === AppStep.STYLIST} onClick={() => setStep(AppStep.STYLIST)} label="Match" />
          <NavIcon icon="fa-cog" active={step === AppStep.SETTINGS} onClick={() => setStep(AppStep.SETTINGS)} label="Set" />
        </div>
      </nav>

      {/* Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-4 py-1 z-[150] shadow-lg">
        <NavIcon icon="fa-camera" isMobile active={step === AppStep.IDLE || step === AppStep.ANALYZING || step === AppStep.RESULT} onClick={() => setStep(AppStep.IDLE)} label="Scan" />
        <NavIcon icon="fa-grid-2" isMobile active={step === AppStep.MUSEBOARD} onClick={() => setStep(AppStep.MUSEBOARD)} label="Muse" />
        <NavIcon icon="fa-comment-dots" isMobile active={step === AppStep.STYLIST} onClick={() => setStep(AppStep.STYLIST)} label="Match" />
        <NavIcon icon="fa-cog" isMobile active={step === AppStep.SETTINGS} onClick={() => setStep(AppStep.SETTINGS)} label="Set" />
      </nav>

      {/* Main Container */}
      <main className="flex-1 relative pb-24 md:pb-0 min-h-screen">
        <header className="px-6 md:px-12 py-6 md:py-8 flex justify-between items-center bg-white/60 backdrop-blur-xl sticky top-0 z-[140] border-b border-gray-50/50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Stylist Engine Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase text-gray-900 tracking-tighter leading-none mb-1">Sarah Jenkins</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{prefs.mood} Mode</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-16 max-w-7xl mx-auto">
          {step === AppStep.IDLE && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 animate-fadeIn">
              <div className="lg:col-span-5 space-y-10 md:space-y-14 py-4 md:py-10">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-8xl font-black heading-font leading-[0.85] tracking-tighter uppercase">Mirror<br/>Inner<br/><span className="text-[#FF4D8D]">Idol.</span></h2>
                  <p className="text-sm md:text-lg text-gray-500 font-medium leading-relaxed max-w-md">당신의 고유한 아름다움을 정교한 AI로 재발견하세요.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 md:p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm"><i className="fa-light fa-shield-check"></i></div>
                      <div>
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest">Sensitivity Guard</h3>
                        <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Ingredient Safety Scan</p>
                      </div>
                    </div>
                    <Toggle checked={isSensitive} onChange={() => setIsSensitive(!isSensitive)} />
                  </div>
                  
                  <button 
                    onClick={handleAnalyze} disabled={!userImage || !celebImage}
                    className="w-full py-6 md:py-8 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl hover:bg-[#FF4D8D] transition-all disabled:opacity-20 active:scale-95"
                  >
                    Start Neural Scan
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-10">
                <LuxuryFileUpload label="Base Portrait" preview={userImage} onImageSelect={setUserImage} secondaryLabel="Bare-Face / 정면" />
                <LuxuryFileUpload label="Style Muse" preview={celebImage} onImageSelect={setCelebImage} secondaryLabel="Reference Image" />
              </div>
            </div>
          )}

          {step === AppStep.ANALYZING && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-10">
              <div className="relative w-64 md:w-80 aspect-[3/4] bg-gray-50 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden scanning shadow-2xl border border-gray-100">
                {userImage && <img src={`data:image/jpeg;base64,${userImage}`} className="w-full h-full object-cover opacity-60 grayscale transition-all duration-1000" />}
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter heading-font animate-pulse">Analyzing...</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Decoding facial architecture & tone DNA</p>
              </div>
            </div>
          )}

          {step === AppStep.RESULT && result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 md:space-y-24">
              <div className="border-b-4 md:border-b-8 border-black pb-8 md:pb-12 relative">
                 <span className="text-[8px] md:text-[10px] font-black text-pink-500 bg-pink-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-pink-100 mb-6 inline-block">Analysis Ready</span>
                 <h2 className="text-5xl md:text-8xl font-black heading-font tracking-tighter uppercase leading-[0.85]">{result.kMatch.celebName}<br/><span className="font-light italic text-gray-300 lowercase">style translation</span></h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
                <aside className="lg:col-span-4 space-y-8">
                  <div className="p-8 md:p-10 border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-lg space-y-10">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 border-b border-gray-50 pb-6">Tone profile</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Melanin Level</span><span className="text-2xl font-black heading-font">{result.tone.melaninIndex}</span></div>
                      <div className="flex gap-1.5 h-3 md:h-4">{[1,2,3,4,5,6].map(i => <div key={i} className={`flex-1 rounded-full ${result.tone.melaninIndex === i ? 'bg-black' : 'bg-gray-100 opacity-40'}`}></div>)}</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{result.tone.description}</p>
                    </div>
                  </div>
                </aside>

                <div className="lg:col-span-8 space-y-20">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[{l:'Base Pivot',v:result.kMatch.adaptationLogic.base,i:'fa-sparkles'},{l:'Lip Focus',v:result.kMatch.adaptationLogic.lip,i:'fa-palette'},{l:'Point Focus',v:result.kMatch.adaptationLogic.point,i:'fa-eye'}].map((item, idx) => (
                        <div key={idx} className="p-8 border border-gray-100 rounded-[2.5rem] bg-gray-50/20 flex flex-col gap-6 hover:bg-white hover:shadow-xl transition-all">
                           <i className={`fa-light ${item.i} text-xl text-pink-500`}></i>
                           <div>
                             <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">{item.l}</p>
                             <p className="text-sm font-black leading-snug">{item.v}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   <div className="p-10 bg-black text-white rounded-[3rem] shadow-2xl">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#FF4D8D] mb-6">Stylist's Note</h4>
                      <p className="text-lg font-medium leading-relaxed italic">"{result.kMatch.styleExplanation}"</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other views */}
          {step === AppStep.MUSEBOARD && (
            <div className="animate-fadeIn py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/20">
              <i className="fa-light fa-images text-6xl text-gray-200 mb-6"></i>
              <p className="text-gray-400 font-black uppercase tracking-widest">Muse board is coming soon</p>
            </div>
          )}
          
          {step === AppStep.STYLIST && (
            <div className="animate-fadeIn py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/20">
              <i className="fa-light fa-comment-dots text-6xl text-gray-200 mb-6"></i>
              <p className="text-gray-400 font-black uppercase tracking-widest">Expert match is coming soon</p>
            </div>
          )}
          
          {step === AppStep.SETTINGS && (
            <div className="max-w-xl mx-auto space-y-12">
              <h2 className="text-4xl font-black heading-font tracking-tighter uppercase text-center">Settings</h2>
              <div className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Inclusion Guard™</p>
                    <p className="text-[10px] text-gray-400 mt-1">Adaptive ethnic tone rebalancing</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Sensitivity Guard</p>
                    <p className="text-[10px] text-gray-400 mt-1">EWG ingredient safety filtering</p>
                  </div>
                  <Toggle checked={isSensitive} onChange={() => setIsSensitive(!isSensitive)} />
                </div>
              </div>
              <button onClick={() => setStep(AppStep.ONBOARDING)} className="w-full py-5 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors">Reset Stylist Data</button>
            </div>
          )}
        </div>
      </main>
      
      {/* Global Toast Notification */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-black text-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex items-center gap-4 z-[100] border border-white/10 backdrop-blur-xl bg-black/90 max-w-[calc(100vw-2rem)] md:max-w-xs"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 bg-[#FF4D8D] rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-sparkles text-xs md:text-sm"></i>
            </div>
            <p className="text-[10px] md:text-[11px] font-bold leading-relaxed tracking-tight">
              당신의 <span className="text-[#FF4D8D]">골격 구조</span>에 맞는 새로운 룩이 추천되었습니다.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
