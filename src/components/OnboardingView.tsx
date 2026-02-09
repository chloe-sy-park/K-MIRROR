import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, ArrowRight, ShieldCheck, Globe, Zap, Sparkles,
  Droplets, Heart, Check,
} from 'lucide-react';
import { UserPreferences } from '../types';

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

/* ── Aesthetic Selection (Step 3) ─────────────────────── */

const AestheticSelection: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const styles = [
    { id: 'clean', name: 'Clean Glow', desc: 'Dewy skin, minimalist touch', img: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=600' },
    { id: 'bold', name: 'Seoul Bold', desc: 'High-contrast, sharp lines', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600' },
    { id: 'mute', name: 'Soft Mute', desc: 'Tone-on-tone, hazy mood', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600' },
    { id: 'glam', name: 'Idol Glam', desc: 'Glitter points, stage ready', img: 'https://images.unsplash.com/photo-1503236123135-0835612d7d32?q=80&w=600' },
  ];

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
      <div className="w-full mb-12">
        <p className="text-[10px] font-black tracking-[0.6em] text-primary mb-4 uppercase">
          Step 02 — Identity
        </p>
        <h2 className="text-[40px] lg:text-[64px] heading-font leading-[0.9] tracking-tight mb-4 uppercase">
          Curate Your <br />
          <span className="italic underline decoration-1 underline-offset-8">Aesthetic.</span>
        </h2>
        <p className="text-sm text-gray-400 font-medium max-w-sm">
          Select at least two moods that define your desired K-Beauty direction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {styles.map((s) => (
          <div
            key={s.id}
            onClick={() => toggle(s.id)}
            className="group relative h-[400px] bg-bg cursor-pointer overflow-hidden rounded-[2rem] transition-all duration-700 gm-hover"
          >
            <div className="absolute inset-0 p-2 transition-all duration-700 group-hover:p-0">
              <img
                src={s.img}
                alt={s.name}
                className={`w-full h-full object-cover grayscale transition-all duration-[1.5s] ${
                  selected.includes(s.id) ? 'grayscale-0 scale-105' : 'group-hover:grayscale-0'
                }`}
              />
              <div
                className={`absolute inset-0 bg-black/20 transition-opacity ${
                  selected.includes(s.id) ? 'opacity-0' : 'opacity-60'
                }`}
              />
            </div>

            <div className="absolute bottom-8 left-6 z-10">
              <h3 className="text-xl heading-font italic text-white mb-1 uppercase">{s.name}</h3>
              <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">{s.desc}</p>
            </div>

            {selected.includes(s.id) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-6 right-6 z-20 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
              >
                <Check size={16} />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {selected.length >= 2 && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={onComplete}
          className="mt-12 px-12 py-6 bg-black text-white rounded-full font-black text-xs tracking-[0.3em] flex items-center gap-4 hover:bg-primary transition-all shadow-2xl cursor-pointer"
        >
          CONFIRM ARCHIVE <ArrowRight size={16} />
        </motion.button>
      )}
    </div>
  );
};

/* ── Main Onboarding View ─────────────────────────────── */

const OnboardingView: React.FC<{ onComplete: (prefs: UserPreferences) => void }> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    environment: 'Office',
    skill: 'Beginner',
    mood: 'Natural',
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
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-8 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Step 1 – Intro */}
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-pink-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-primary shadow-xl shadow-pink-100">
              <Camera size={36} />
            </div>
            <h2 className="text-4xl font-black heading-font tracking-tight uppercase mb-6 leading-none">
              Scan Your
              <br />
              Beauty DNA
            </h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-12">
              We need an unfiltered front-facing photo for precise analysis.
              <br />
              Your unique tone and bone structure will be decoded in real time.
            </p>
            <button
              onClick={nextStep}
              className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-2xl cursor-pointer gm-hover"
            >
              Get Started
            </button>
          </motion.div>
        )}

        {/* Step 2 – Deep Profiling (3 sub-steps) */}
        {step === 2 && (
          <motion.div
            key={`s2-${subStep}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-xl w-full text-left"
          >
            <div className="mb-12">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-16 rounded-full transition-all duration-500"
                    style={{ backgroundColor: i <= subStep ? '#FF4D8D' : '#f3f4f6' }}
                  />
                ))}
              </div>
              <h2 className="text-4xl font-black heading-font tracking-tight uppercase mb-2">
                Deep Profiling
              </h2>
              <p className="text-gray-400 text-sm font-medium">
                Tell us about your lifestyle for a more precise analysis.
              </p>
            </div>

            {subStep === 1 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">
                  Environment
                </p>
                {([
                  { id: 'Office' as const, label: 'Dry Office', icon: <Globe size={20} /> },
                  { id: 'Outdoor' as const, label: 'Humid Outdoor', icon: <Zap size={20} /> },
                  { id: 'Night-out' as const, label: 'Studio Lights', icon: <Sparkles size={20} /> },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPrefs({ ...prefs, environment: opt.id });
                      nextStep();
                    }}
                    className="w-full p-6 md:p-8 border border-gray-100 rounded-[2.5rem] text-left font-bold hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm cursor-pointer gm-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 group-hover:text-primary transition-colors">{opt.icon}</div>
                      <span className="text-sm uppercase tracking-widest">{opt.label}</span>
                    </div>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-primary" />
                  </button>
                ))}
              </div>
            )}

            {subStep === 2 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">
                  Skill Level
                </p>
                {([
                  { id: 'Beginner' as const, label: 'Beginner (Simple Tools)' },
                  { id: 'Intermediate' as const, label: 'Intermediate (Brushes)' },
                  { id: 'Pro' as const, label: 'Professional (Artistry)' },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPrefs({ ...prefs, skill: opt.id });
                      nextStep();
                    }}
                    className="w-full p-6 md:p-8 border border-gray-100 rounded-[2.5rem] text-left font-bold hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm cursor-pointer gm-hover"
                  >
                    <span className="text-sm uppercase tracking-widest">{opt.label}</span>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-primary" />
                  </button>
                ))}
              </div>
            )}

            {subStep === 3 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">
                  Desired Mood
                </p>
                {([
                  { id: 'Natural' as const, label: 'Natural & Soft', icon: <Droplets size={20} /> },
                  { id: 'Elegant' as const, label: 'Elegant & Classic', icon: <Heart size={20} /> },
                  { id: 'Powerful' as const, label: 'Powerful K-Idol', icon: <Zap size={20} /> },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPrefs({ ...prefs, mood: opt.id });
                      nextStep();
                    }}
                    className="w-full p-6 md:p-8 border border-gray-100 rounded-[2.5rem] text-left font-bold hover:border-black hover:bg-gray-50 transition-all flex justify-between items-center group shadow-sm cursor-pointer gm-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 group-hover:text-primary transition-colors">{opt.icon}</div>
                      <span className="text-sm uppercase tracking-widest">{opt.label}</span>
                    </div>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-primary" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3 – Aesthetic Selection */}
        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            <AestheticSelection onComplete={nextStep} />
          </motion.div>
        )}

        {/* Step 4 – Secure Settings (Inclusion Guard) */}
        {step === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-blue-500 shadow-xl shadow-blue-50">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-4xl font-black heading-font tracking-tight uppercase mb-6">
              Secure Settings
            </h2>
            <div className="space-y-4 mb-12 text-left">
              <div className="p-8 bg-gray-50 rounded-[2.5rem] flex justify-between items-center border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest mb-1">
                    Inclusion Guard&trade;
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Auto-adaptive ethnic tone rebalancing
                  </span>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            </div>
            <button
              onClick={nextStep}
              className="w-full py-7 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-primary transition-all cursor-pointer gm-hover"
            >
              Enter Laboratory
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingView;
