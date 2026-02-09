import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, LayoutGrid, MessageCircle, Settings, Menu, X,
  User, Sparkles, ShoppingBag, Heart, Globe,
} from 'lucide-react';
import { AppStep, AnalysisResult, UserPreferences } from './types';
import { analyzeKBeauty } from './services/geminiService';
import OnboardingView from './components/OnboardingView';
import AnalysisView from './components/AnalysisView';
import ExpertView from './components/ExpertView';
import CheckoutView from './components/CheckoutView';

/* ── Shared UI Components ───────────────────────────────── */

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className="w-12 h-6 rounded-full transition-all relative cursor-pointer"
    style={{ backgroundColor: checked ? '#FF4D8D' : '#e5e7eb' }}
  >
    <div
      className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm"
      style={{ left: checked ? '1.75rem' : '0.25rem' }}
    />
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
          <img
            src={`data:image/jpeg;base64,${preview}`}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
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
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

/* ── Sherlock Scanning Animation (SVG overlay) ──────────── */

const SherlockScanOverlay: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full z-20 pointer-events-none"
    viewBox="0 0 300 400"
    fill="none"
  >
    {/* Horizontal scan lines */}
    <line x1="30" y1="120" x2="270" y2="120" stroke="#FF4D8D" strokeWidth="0.5" className="sherlock-line" style={{ animationDelay: '0.2s' }} />
    <line x1="30" y1="200" x2="270" y2="200" stroke="#FF4D8D" strokeWidth="0.5" className="sherlock-line" style={{ animationDelay: '0.6s' }} />
    <line x1="30" y1="280" x2="270" y2="280" stroke="#FF4D8D" strokeWidth="0.5" className="sherlock-line" style={{ animationDelay: '1.0s' }} />

    {/* Eye angle lines */}
    <line x1="90" y1="155" x2="210" y2="145" stroke="#FF4D8D" strokeWidth="0.8" className="sherlock-line" style={{ animationDelay: '1.2s' }} />

    {/* Face contour guides */}
    <line x1="150" y1="60" x2="150" y2="350" stroke="white" strokeWidth="0.3" opacity="0.4" className="sherlock-line" style={{ animationDelay: '0.4s' }} />

    {/* Data labels */}
    <text x="275" y="123" fill="#FF4D8D" fontSize="7" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '0.5s' }}>UPPER</text>
    <text x="275" y="203" fill="#FF4D8D" fontSize="7" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '0.9s' }}>MID</text>
    <text x="275" y="283" fill="#FF4D8D" fontSize="7" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '1.3s' }}>LOWER</text>
    <text x="215" y="140" fill="white" fontSize="6" fontFamily="monospace" className="sherlock-line" style={{ animationDelay: '1.5s' }}>EYE +12°</text>
  </svg>
);

/* ── Main App Component ─────────────────────────────────── */

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [celebImage, setCelebImage] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({
    environment: 'Office',
    skill: 'Beginner',
    mood: 'Natural',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ── Handlers ──── */

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

  /* ── Navigation helpers ──── */

  const isActiveNav = (id: AppStep) =>
    step === id ||
    (id === AppStep.IDLE &&
      (step === AppStep.ANALYZING || step === AppStep.RESULT || step === AppStep.CHECKOUT));

  const navItems = [
    { id: AppStep.IDLE, label: 'Scan' },
    { id: AppStep.MUSEBOARD, label: 'Muse Board' },
    { id: AppStep.STYLIST, label: 'Match' },
    { id: AppStep.SETTINGS, label: 'Settings' },
  ];

  const mobileNavItems = [
    { id: AppStep.IDLE, label: 'Scan Laboratory', icon: <Camera size={20} /> },
    { id: AppStep.MUSEBOARD, label: 'Muse Board', icon: <LayoutGrid size={20} /> },
    { id: AppStep.STYLIST, label: 'Expert Match', icon: <MessageCircle size={20} /> },
    { id: AppStep.SETTINGS, label: 'Settings', icon: <Settings size={20} /> },
  ];

  /* ── Render ──── */

  return (
    <div className="min-h-screen bg-white flex flex-col text-[#0F0F0F] relative">
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {step === AppStep.ONBOARDING && (
          <OnboardingView onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-[150] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-12 py-5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setStep(AppStep.IDLE)}
          >
            <h1 className="text-2xl font-black heading-font tracking-tight italic uppercase">
              K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setStep(item.id)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-[#FF4D8D] cursor-pointer ${
                  isActiveNav(item.id)
                    ? 'text-black border-b-2 border-[#FF4D8D] pb-1'
                    : 'text-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all">
              <User size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-10">
                {mobileNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setStep(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-6 text-sm font-black uppercase tracking-widest cursor-pointer ${
                      isActiveNav(item.id) ? 'text-[#FF4D8D]' : 'text-gray-400'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Main Content ──────────────────────────────── */}
      <main className="flex-1 pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen">
        <AnimatePresence mode="wait">
          {/* IDLE: Upload & Scan */}
          {step === AppStep.IDLE && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row items-center gap-16 lg:py-12"
            >
              <div className="flex-1 text-center lg:text-left space-y-10">
                <div>
                  <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em] mb-6">
                    Biometric Style Lab
                  </p>
                  <h2 className="text-6xl lg:text-8xl font-black heading-font leading-[0.9] tracking-tight uppercase mb-10">
                    Reflect Your
                    <br />
                    <span className="text-gray-300">Inner Idol.</span>
                  </h2>
                  <p className="text-base lg:text-lg text-gray-500 mb-12 max-w-md leading-relaxed mx-auto lg:mx-0 font-medium italic uppercase tracking-tight">
                    Your ethnic features and bone structure decoded by AI.
                    <br />
                    For your authentic, unfiltered beauty.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 md:gap-10 mb-12">
                  <LuxuryFileUpload
                    label="Base Portrait"
                    preview={userImage}
                    onImageSelect={setUserImage}
                    secondaryLabel="Bare-Face / No Makeup"
                  />
                  <LuxuryFileUpload
                    label="Style Muse"
                    preview={celebImage}
                    onImageSelect={setCelebImage}
                    secondaryLabel="Pinterest Inspiration"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start items-center">
                  <div className="flex items-center gap-6 bg-gray-50/50 px-8 py-5 rounded-[2.5rem] border border-gray-100 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">
                        Sensitivity
                      </span>
                      <span className="text-[10px] font-bold text-gray-900 uppercase">
                        Ingredient Filter
                      </span>
                    </div>
                    <Toggle
                      checked={isSensitive}
                      onChange={() => setIsSensitive(!isSensitive)}
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={!userImage || !celebImage}
                    className="px-14 py-7 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-[#FF4D8D] transition-all duration-500 disabled:opacity-20 shadow-2xl active:scale-95 flex items-center gap-4 cursor-pointer gm-hover"
                  >
                    Neural Scan {userImage && celebImage && <Sparkles size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYZING: Sherlock Scan Animation */}
          {step === AppStep.ANALYZING && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[60vh] flex flex-col items-center justify-center gap-16"
            >
              <div className="relative w-80 md:w-[26rem] aspect-[3/4] bg-gray-50 rounded-[4rem] overflow-hidden scanning shadow-2xl border border-gray-100">
                {userImage && (
                  <img
                    src={`data:image/jpeg;base64,${userImage}`}
                    className="w-full h-full object-cover opacity-50 grayscale transition-all duration-1000"
                    alt="Scanning"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent" />
                {/* Sherlock vector overlay */}
                <SherlockScanOverlay />
              </div>
              <div className="text-center space-y-6">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight heading-font animate-pulse italic">
                  Decoding DNA...
                </h2>
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
                    Synchronizing Melanin Guard&trade;
                  </p>
                  <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em]">
                    Mapping Sherlock Facial Proportions
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT: Analysis View */}
          {step === AppStep.RESULT && result && (
            <AnalysisView result={result} onReset={handleReset} onCheckout={handleCheckout} />
          )}

          {/* CHECKOUT */}
          {step === AppStep.CHECKOUT && <CheckoutView result={result} />}

          {/* STYLIST: Expert Matching */}
          {step === AppStep.STYLIST && <ExpertView />}

          {/* SETTINGS */}
          {step === AppStep.SETTINGS && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-xl mx-auto space-y-16 py-12"
            >
              <div className="text-center">
                <h2 className="text-4xl font-black heading-font tracking-tight uppercase italic">
                  System <span className="text-[#FF4D8D] not-italic">Settings</span>
                </h2>
              </div>
              <div className="p-12 bg-white border border-gray-100 rounded-[3.5rem] shadow-xl space-y-12">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">
                      Inclusion Guard&trade;
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Ethical melanin rebalancing protocol
                    </p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">
                      Neural Safety Filter
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Ingredient safety scan active
                    </p>
                  </div>
                  <Toggle
                    checked={isSensitive}
                    onChange={() => setIsSensitive(!isSensitive)}
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(AppStep.ONBOARDING)}
                className="w-full py-6 text-[10px] font-black uppercase tracking-widest text-gray-200 hover:text-red-500 transition-colors cursor-pointer"
              >
                Reset Neural Stylist Data
              </button>
            </motion.div>
          )}

          {/* MUSEBOARD: Placeholder */}
          {step === AppStep.MUSEBOARD && (
            <motion.div
              key="muse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[4rem] bg-gray-50/20"
            >
              <LayoutGrid size={64} className="mx-auto text-gray-200 mb-10" />
              <p className="text-gray-400 font-black uppercase tracking-[0.6em]">
                Neural Muse Board Coming Soon
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="py-20 border-t border-gray-50 text-center bg-white">
        <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.7em] mb-6">
          K-MIRROR Neural Beauty Intelligence
        </p>
        <div className="flex justify-center gap-10">
          <Globe
            size={18}
            className="text-gray-300 hover:text-black transition-colors cursor-pointer"
          />
          <ShoppingBag
            size={18}
            className="text-gray-300 hover:text-black transition-colors cursor-pointer"
          />
          <Heart
            size={18}
            className="text-gray-300 hover:text-[#FF4D8D] transition-colors cursor-pointer"
          />
        </div>
      </footer>
    </div>
  );
}
