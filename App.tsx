
import React, { useState, useEffect } from 'react';
import { AppStep, AnalysisResult, Product, VideoRecommendation, SavedMuse } from './types';
import { analyzeKBeauty } from './services/geminiService';

// --- Shared Luxury UI Components ---

const StageBadge: React.FC<{ number: string; title: string }> = ({ number, title }) => (
  <div className="flex items-center gap-4 mb-10 group">
    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black tracking-widest group-hover:bg-pink-500 transition-colors">
      {number}
    </div>
    <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900">{title}</h3>
    <div className="flex-1 h-[1px] bg-gray-100"></div>
  </div>
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
      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
        {label}
      </label>
      <div className="relative group aspect-[3/4] bg-gray-50 border border-gray-100 luxury-card rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all">
        {preview ? (
          <img src={`data:image/jpeg;base64,${preview}`} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all">
              <i className="fa-light fa-plus text-gray-300"></i>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{secondaryLabel || 'Upload Image'}</p>
          </div>
        )}
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

// --- View: Muse Board ---

const MyMuseBoard: React.FC<{ onBack: () => void; savedMuses: SavedMuse[] }> = ({ onBack, savedMuses }) => {
  const myBoards = [
    { id: 'b1', name: 'Office Glow', count: 12, aiSummary: 'Clean & Professional' },
    { id: 'b2', name: 'K-Pop Stage', count: 8, aiSummary: 'Glitter & Bold' },
    { id: 'b3', name: 'Daily Natural', count: 24, aiSummary: 'Minimalist Tone' },
  ];

  return (
    <div className="animate-fadeIn min-h-screen">
      <div className="flex justify-between items-end mb-16">
        <div>
          <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4em] mb-3">Identity Archive</p>
          <h2 className="text-6xl font-black heading-font tracking-tighter uppercase">My Muse <span className="font-light italic text-gray-300 lowercase">Board</span></h2>
        </div>
        <button onClick={onBack} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-pink-500 transition-all shadow-xl">
          New Analysis
        </button>
      </div>

      {/* 1. Board Selection Section */}
      <div className="mb-16">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6">Collections</h3>
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
          <button className="flex-shrink-0 w-64 h-36 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center hover:border-black transition-all group bg-gray-50/30">
            <i className="fa-light fa-plus text-gray-300 group-hover:text-black mb-2 text-xl"></i>
            <span className="text-[10px] font-black text-gray-400 group-hover:text-black uppercase tracking-widest">Create Board</span>
          </button>
          
          {myBoards.map(board => (
            <div key={board.id} className="flex-shrink-0 w-72 h-36 bg-white border border-gray-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all cursor-pointer group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-3xl rounded-full"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="font-black text-lg uppercase tracking-tight">{board.name}</h4>
                <span className="text-[9px] font-black text-pink-500 bg-pink-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-pink-100">{board.count} Pins</span>
              </div>
              <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em] mb-1">AI INSIGHT</p>
              <p className="text-sm font-medium text-gray-500 truncate">{board.aiSummary}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10 flex items-center gap-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Personal Feed</h3>
        <div className="flex-1 h-[1px] bg-gray-100"></div>
      </div>

      {savedMuses.length === 0 ? (
        <div className="py-40 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
          <i className="fa-light fa-images text-6xl text-gray-200 mb-6"></i>
          <p className="text-gray-400 font-black uppercase tracking-widest">No saved profiles yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {savedMuses.map((muse) => (
            <div key={muse.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 flex flex-col">
              <div className="flex h-72 overflow-hidden border-b border-gray-50 relative">
                <img src={`data:image/jpeg;base64,${muse.userImage}`} className="w-1/2 h-full object-cover" />
                <img src={`data:image/jpeg;base64,${muse.celebImage}`} className="w-1/2 h-full object-cover" />
                
                {/* 2. Enhanced Hover Overlay with AI Style Points */}
                <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-between backdrop-blur-sm">
                  <div className="animate-fadeIn">
                    <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-2">AI Style Points</p>
                    <ul className="space-y-3">
                      <li className="text-[11px] text-white/90 font-bold flex items-center gap-3">
                        <i className="fa-solid fa-circle-check text-pink-500 text-[10px]"></i> Glass-skin adaptation
                      </li>
                      <li className="text-[11px] text-white/90 font-bold flex items-center gap-3">
                        <i className="fa-solid fa-circle-check text-pink-500 text-[10px]"></i> Blurry lip technique
                      </li>
                      <li className="text-[11px] text-white/90 font-bold flex items-center gap-3">
                        <i className="fa-solid fa-circle-check text-pink-500 text-[10px]"></i> Heritage-preserved tones
                      </li>
                    </ul>
                  </div>
                  <button className="w-full py-4 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all shadow-xl">
                    View Full Report
                  </button>
                </div>
              </div>
              <div className="p-7 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-black uppercase tracking-tight">{muse.celebName}</h4>
                  <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full">{muse.vibe}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{muse.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- View: App Root ---

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.IDLE);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [celebImage, setCelebImage] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMuses, setSavedMuses] = useState<SavedMuse[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('k_mirror_muses');
    if (stored) setSavedMuses(JSON.parse(stored));
  }, []);

  const handleAnalyze = async () => {
    if (!userImage || !celebImage) return;
    try {
      setStep(AppStep.ANALYZING);
      setError(null);
      const res = await analyzeKBeauty(userImage, celebImage, isSensitive);
      setResult(res);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try a different portrait.");
      setStep(AppStep.IDLE);
    }
  };

  const saveMuse = () => {
    if (!result || !userImage || !celebImage) return;
    const newMuse: SavedMuse = {
      id: Date.now().toString(),
      userImage,
      celebImage,
      celebName: result.kMatch.celebName,
      date: new Date().toLocaleDateString(),
      vibe: result.sherlock.facialVibe,
    };
    const updated = [newMuse, ...savedMuses];
    setSavedMuses(updated);
    localStorage.setItem('k_mirror_muses', JSON.stringify(updated));
    alert("Saved to your Muse Board!");
  };

  const reset = () => {
    setStep(AppStep.IDLE);
    setUserImage(null);
    setCelebImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="px-10 py-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-10 sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <div onClick={reset} className="cursor-pointer group">
          <h1 className="text-4xl font-black tracking-tighter heading-font uppercase group-hover:text-pink-500 transition-colors">
            K-Mirror <span className="font-light italic text-gray-400 lowercase">studio</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-2">Personalized Beauty Laboratory</p>
        </div>
        <div className="flex items-center gap-10">
          <div className="hidden lg:flex gap-12 text-[11px] font-black uppercase tracking-widest text-gray-400">
            <button onClick={() => setStep(AppStep.IDLE)} className={`hover:text-black transition-colors ${step === AppStep.IDLE ? 'text-black' : ''}`}>Studio</button>
            <button onClick={() => setStep(AppStep.MUSEBOARD)} className={`hover:text-black transition-colors ${step === AppStep.MUSEBOARD ? 'text-black' : ''}`}>My Board</button>
            <a href="#" className="hover:text-black transition-colors">Philosophy</a>
          </div>
          <button onClick={reset} className="px-8 py-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all">
            Reset
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10 py-20">
        
        {step === AppStep.IDLE && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 animate-fadeIn">
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <h2 className="text-7xl font-black heading-font leading-[0.85] tracking-tighter uppercase">
                  Inclusive<br/>K-Beauty<br/>Neural Glow.
                </h2>
                <p className="text-base text-gray-500 font-medium leading-relaxed max-sm">
                  Our neural laboratory adapts Seoul’s high-performance aesthetics specifically for your unique bone structure and heritage.
                </p>
              </div>

              <div className="p-10 bg-gray-50 rounded-[3rem] space-y-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-1.5">Sensitivity Guard</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Exclude irritants for your skin</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} />
                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-black transition-all"></div>
                    <div className="absolute left-[5px] top-[5px] w-4.5 h-4.5 bg-white rounded-full transition-transform peer-checked:translate-x-7"></div>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={!userImage || !celebImage}
                className="w-full py-8 bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] rounded-[2.5rem] shadow-2xl hover:bg-pink-500 hover:scale-[1.02] active:scale-95 disabled:opacity-20 transition-all"
              >
                Initiate Biometric Scan
              </button>
              {error && <p className="text-center text-[11px] font-black text-red-500 uppercase">{error}</p>}
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-10">
              <LuxuryFileUpload label="Base Profile" preview={userImage} onImageSelect={setUserImage} secondaryLabel="Bare Face / Natural Light" />
              <LuxuryFileUpload label="K-Muse Muse" preview={celebImage} onImageSelect={setCelebImage} secondaryLabel="Style Inspiration" />
            </div>
          </div>
        )}

        {step === AppStep.ANALYZING && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-12">
            <div className="relative w-80 aspect-[3/4] bg-gray-50 rounded-[3rem] overflow-hidden scanning shadow-2xl ring-1 ring-gray-100">
              {userImage && <img src={`data:image/jpeg;base64,${userImage}`} className="w-full h-full object-cover opacity-60 grayscale" />}
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter heading-font">Mapping Heritage...</h2>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.6em]">Neural Stylist Engine v4.2 PRO</p>
            </div>
          </div>
        )}

        {step === AppStep.MUSEBOARD && (
          <MyMuseBoard savedMuses={savedMuses} onBack={() => setStep(AppStep.IDLE)} />
        )}

        {step === AppStep.RESULT && result && (
          <div className="animate-fadeIn max-w-6xl mx-auto">
            {/* Report Header */}
            <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10 border-b-8 border-black pb-12">
              <div className="space-y-6">
                <span className="text-[10px] font-black text-pink-500 bg-pink-50 px-5 py-2 rounded-full uppercase tracking-widest border border-pink-100">Neural Report: {result.kMatch.celebName}</span>
                <h2 className="text-7xl font-black heading-font tracking-tighter uppercase leading-[0.85]">
                  {result.kMatch.celebName}<br/>
                  <span className="font-light italic text-gray-300 lowercase">adapted for your heritage</span>
                </h2>
              </div>
              <div className="flex flex-col items-end gap-6">
                 <button onClick={saveMuse} className="px-10 py-4 border-2 border-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl">
                    Save to Muse Board
                 </button>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Analysis Verdict</p>
                    <p className="text-2xl font-black heading-font uppercase text-pink-500">{result.sherlock.facialVibe}</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
              {/* STAGE 1 & 2: Biometrics */}
              <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-40 h-fit">
                <div className="p-10 border border-gray-100 rounded-[3rem] bg-white shadow-lg space-y-12">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-50 pb-6">01 Visual Analysis</h3>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Fitzpatrick Level</span>
                      <span className="text-2xl font-black heading-font">Type {result.tone.melaninIndex}</span>
                    </div>
                    <div className="flex gap-2 h-4">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-1000 ${result.tone.melaninIndex === i ? 'bg-black shadow-xl ring-2 ring-black scale-y-125' : 'bg-gray-100 opacity-40'}`}></div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase">
                      <span className="text-gray-400 tracking-widest">Undertone</span>
                      <span className="px-4 py-1.5 bg-gray-50 rounded-full">{result.tone.undertone}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-black uppercase">
                      <span className="text-gray-400 tracking-widest">Proportions</span>
                      <span className="italic">{result.sherlock.proportions.middle} Focus</span>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-black text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-400 mb-6">02 Identity Integrity</h3>
                  <p className="text-sm font-medium leading-relaxed italic opacity-80">
                    "Our K-Style engine strictly maintains your Type {result.tone.melaninIndex} depth. We ensure no 'tone-up' logic is applied, preserving the rich integrity of your ethnic profile."
                  </p>
                </div>
              </aside>

              {/* STAGE 3, 4, 5: Stylist Insights */}
              <div className="lg:col-span-8 space-y-32">
                
                {/* 03 K-Style Translation */}
                <section>
                  <StageBadge number="03" title="Style Translation" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                      { l: 'Pigment Shift', v: result.kMatch.adaptationLogic.lip, i: 'fa-palette' },
                      { l: 'Base Finish', v: result.kMatch.adaptationLogic.base, i: 'fa-sparkles' },
                      { l: 'Detail Focal', v: result.kMatch.adaptationLogic.point, i: 'fa-eye' },
                    ].map((it, idx) => (
                      <div key={idx} className="p-8 border border-gray-100 rounded-[2.5rem] bg-gray-50/30 flex flex-col gap-6 shadow-sm">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-pink-500">
                          <i className={`fa-light ${it.i} text-lg`}></i>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{it.l}</p>
                          <p className="text-sm font-black leading-snug">{it.v}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-14 bg-gray-50 rounded-[4rem] border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-pink-100/30 blur-3xl rounded-full transition-all group-hover:scale-150"></div>
                    <p className="text-3xl font-light italic leading-snug text-gray-800 relative z-10">
                      "{result.kMatch.styleExplanation}"
                    </p>
                  </div>
                </section>

                {/* 04 Ingredient Check */}
                <section>
                  <StageBadge number="04" title="Ingredient Check" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {result.recommendations.products.map((p, i) => (
                      <div key={i} className="group p-8 border border-gray-100 rounded-[3rem] bg-white hover:border-black transition-all shadow-sm hover:shadow-2xl">
                        <div className="flex justify-between items-start mb-8">
                           <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-pink-500 transition-colors">
                             <i className="fa-light fa-bottle-droplet text-3xl"></i>
                           </div>
                           <div className="text-right">
                             <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{p.safetyRating}</span>
                             <p className="text-xl font-black mt-4 tracking-tighter">{p.price}</p>
                           </div>
                        </div>
                        <h4 className="text-base font-black uppercase tracking-tight mb-1">{p.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">{p.brand}</p>
                        <p className="text-xs text-gray-500 leading-relaxed italic mb-8 opacity-80">{p.desc}</p>
                        <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-50">
                           {p.ingredients.map((ing, k) => (
                             <span key={k} className="px-3 py-1.5 bg-gray-50 text-[9px] font-black uppercase tracking-widest rounded-full">{ing}</span>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 05 Tutorial Masterclass */}
                <section>
                  <StageBadge number="05" title="Tutorial Adaptation" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {result.recommendations.videos.map((v, i) => (
                      <div key={i} className="space-y-8 group">
                         <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer group-hover:scale-[1.03]">
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all flex items-center justify-center">
                               <div className="w-16 h-16 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center shadow-2xl">
                                  <i className="fa-solid fa-play text-white text-lg"></i>
                               </div>
                            </div>
                            <div className="absolute top-6 left-6">
                               <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full">{v.tag}</span>
                            </div>
                         </div>
                         <div className="px-4 space-y-4">
                            <h4 className="text-xl font-black leading-tight uppercase tracking-tight group-hover:text-pink-500 transition-colors">{v.title}</h4>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{v.creator} • {v.views} views</p>
                         </div>
                         <div className="p-8 bg-gray-900 text-white rounded-[3rem] border-l-[12px] border-pink-500 shadow-2xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 blur-[60px] rounded-full"></div>
                            <div className="flex items-center gap-3 mb-4">
                               <i className="fa-solid fa-sparkles text-pink-400 text-sm"></i>
                               <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.4em]">AI Coaching Adaptation</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed italic opacity-90">
                               "{v.aiCoaching}"
                            </p>
                            <div className="mt-8 flex gap-4">
                               <span className="px-4 py-2 bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-full border border-white/5">Match {v.matchPercentage}%</span>
                               <span className="px-4 py-2 bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-full border border-white/5">Level: {v.skillLevel}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Report Footer Actions */}
                <div className="pt-24 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-12">
                  <button onClick={reset} className="px-20 py-8 bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] rounded-full shadow-2xl hover:bg-pink-500 hover:scale-105 active:scale-95 transition-all">
                    Start New Analysis
                  </button>
                  <div className="text-center sm:text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em] mb-3">Authentic Verification</p>
                    <p className="text-2xl font-black heading-font uppercase tracking-tighter">K-Mirror <span className="text-pink-500 italic">Neural v4.2</span></p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-40 py-32 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-16 px-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black heading-font uppercase tracking-tighter">K-Mirror Neural lab</h2>
            <p className="text-[11px] text-gray-400 uppercase font-black tracking-[0.5em] leading-loose max-w-2xl">
              Celebrating ethnic diversity through neural beauty intelligence. We bridge heritage with Seoul’s aesthetic performance.
            </p>
          </div>
          <div className="flex gap-20 text-gray-300">
            <a href="#" className="hover:text-black transition-all hover:scale-150"><i className="fa-brands fa-instagram text-2xl"></i></a>
            <a href="#" className="hover:text-black transition-all hover:scale-150"><i className="fa-brands fa-tiktok text-2xl"></i></a>
            <a href="#" className="hover:text-black transition-all hover:scale-150"><i className="fa-brands fa-pinterest text-2xl"></i></a>
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em]">2024 © All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
