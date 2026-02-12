import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as m from 'framer-motion/m';
import { ArrowRight } from 'lucide-react';
import { UserPreferences } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { containerVariants, itemVariants } from '@/constants/animations';

const OnboardingView = () => {
  const navigate = useNavigate();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [prefs, setPrefs] = useState<UserPreferences>({
    environment: 'Office',
    skill: 'Beginner',
    mood: 'Natural'
  });

  const handleComplete = () => {
    completeOnboarding(prefs);
    navigate('/');
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center"
    >
      <m.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xl w-full space-y-12"
      >
        <m.header variants={itemVariants}>
          <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-6 uppercase">Initialization</p>
          <h2 className="text-5xl heading-font uppercase">Calibrate Your <br/><span className="italic">Stylist.</span></h2>
        </m.header>

        <div className="space-y-10">
          <m.section variants={itemVariants}>
            <p id="env-label" className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Target Environment</p>
            <div role="radiogroup" aria-labelledby="env-label" className="flex justify-center gap-4">
              {(['Office', 'Outdoor', 'Studio'] as const).map((env) => (
                <button
                  key={env}
                  role="radio"
                  aria-checked={prefs.environment === env}
                  onClick={() => setPrefs({ ...prefs, environment: env })}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${prefs.environment === env ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {env}
                </button>
              ))}
            </div>
          </m.section>

          <m.section variants={itemVariants}>
            <p id="skill-label" className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Makeup Skill Level</p>
            <div role="radiogroup" aria-labelledby="skill-label" className="flex justify-center gap-4">
              {(['Beginner', 'Intermediate', 'Pro'] as const).map((lvl) => (
                <button
                  key={lvl}
                  role="radio"
                  aria-checked={prefs.skill === lvl}
                  onClick={() => setPrefs({ ...prefs, skill: lvl })}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${prefs.skill === lvl ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </m.section>

          <m.section variants={itemVariants}>
            <p id="mood-label" className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Desired Mood</p>
            <div role="radiogroup" aria-labelledby="mood-label" className="flex justify-center gap-4">
              {(['Natural', 'Elegant', 'Powerful'] as const).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={prefs.mood === m}
                  onClick={() => setPrefs({ ...prefs, mood: m })}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${prefs.mood === m ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </m.section>
        </div>

        <m.button
          variants={itemVariants}
          onClick={handleComplete}
          className="group flex items-center gap-4 px-12 py-6 bg-black text-white rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-[#FF4D8D] transition-all"
        >
          Initialize Engine <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </m.button>
      </m.div>
    </m.div>
  );
};

export default OnboardingView;
