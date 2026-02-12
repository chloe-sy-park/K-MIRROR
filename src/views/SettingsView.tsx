import { useNavigate } from 'react-router-dom';
import * as m from 'framer-motion/m';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import Toggle from '@/components/ui/Toggle';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
];

const SettingsView = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { isSensitive, toggleSensitive, resetData } = useSettingsStore();

  const handleResetData = () => {
    resetData();
    navigate('/onboarding');
  };

  return (
    <m.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto space-y-16 py-12 px-6">
      <div className="text-center">
        <h2 className="text-4xl font-black heading-font tracking-tighter uppercase italic uppercase">System <span className="text-[#FF4D8D] not-italic">Settings</span></h2>
      </div>
      <div className="p-12 bg-white border border-gray-100 rounded-[3.5rem] shadow-xl space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest uppercase">Inclusion Guard™</p>
            <p className="text-[10px] text-gray-400 mt-1 text-balance">Ethical melanin rebalancing protocol</p>
          </div>
          <Toggle checked={isSensitive} onChange={toggleSensitive} label="Inclusion Guard" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest uppercase">Neural Safety Filter</p>
            <p className="text-[10px] text-gray-400 mt-1 text-balance">Ingredient safety scan active</p>
          </div>
          <Toggle checked={isSensitive} onChange={toggleSensitive} label="Neural Safety Filter" />
        </div>
      </div>
      <div className="p-12 bg-white border border-gray-100 rounded-[3.5rem] shadow-xl space-y-6">
        <p className="text-xs font-black uppercase tracking-widest">Language</p>
        <div className="flex gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                i18n.language === lang.code
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleResetData} className="w-full py-6 text-[10px] font-black uppercase tracking-widest text-gray-200 hover:text-red-500 transition-colors">Reset Neural Stylist Data</button>
    </m.div>
  );
};

export default SettingsView;
