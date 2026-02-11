import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';
import Toggle from '@/components/ui/Toggle';

const SettingsView = () => {
  const navigate = useNavigate();
  const { isSensitive, toggleSensitive, resetData } = useSettingsStore();

  const handleResetData = () => {
    resetData();
    navigate('/onboarding');
  };

  return (
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
          <Toggle checked={isSensitive} onChange={toggleSensitive} />
        </div>
      </div>
      <button onClick={handleResetData} className="w-full py-6 text-[10px] font-black uppercase tracking-widest text-gray-200 hover:text-red-500 transition-colors uppercase uppercase">Reset Neural Stylist Data</button>
    </motion.div>
  );
};

export default SettingsView;
