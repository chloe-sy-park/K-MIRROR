import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, LayoutGrid, MessageCircle, Settings, Menu, X,
  User, Scan
} from 'lucide-react';
import { AppStep } from '@/types';

interface NavbarProps {
  step: AppStep;
  isMenuOpen: boolean;
  onSetStep: (step: AppStep) => void;
  onToggleMenu: () => void;
}

const Navbar = ({ step, isMenuOpen, onSetStep, onToggleMenu }: NavbarProps) => {
  const navItems = [
    { id: AppStep.IDLE, label: 'Scan' },
    { id: AppStep.MUSEBOARD, label: 'Muse Board' },
    { id: AppStep.STYLIST, label: 'Match' },
    { id: AppStep.METHODOLOGY, label: 'Sherlock' },
    { id: AppStep.SETTINGS, label: 'Settings' }
  ];

  const mobileNavItems = [
    { id: AppStep.IDLE, label: 'Scan Laboratory', icon: <Camera size={20}/> },
    { id: AppStep.MUSEBOARD, label: 'Muse Board', icon: <LayoutGrid size={20}/> },
    { id: AppStep.STYLIST, label: 'Expert Match', icon: <MessageCircle size={20}/> },
    { id: AppStep.METHODOLOGY, label: 'Sherlock Methodology', icon: <Scan size={20}/> },
    { id: AppStep.SETTINGS, label: 'Settings', icon: <Settings size={20}/> }
  ];

  return (
    <nav className="fixed top-0 w-full z-[150] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-12 py-5 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onSetStep(AppStep.IDLE)}
        >
          <h1 className="text-2xl font-black heading-font tracking-tighter italic uppercase text-balance">
            K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
          </h1>
        </motion.div>

        <div className="hidden lg:flex items-center gap-12">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onSetStep(item.id)}
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-[#FF4D8D]
                ${(step === item.id || (item.id === AppStep.IDLE && (step === AppStep.ANALYZING || step === AppStep.RESULT || step === AppStep.CHECKOUT))) ? 'text-black border-b-2 border-[#FF4D8D] pb-1' : 'text-gray-400'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2" onClick={onToggleMenu}>
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
              {mobileNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSetStep(item.id); onToggleMenu(); }}
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
  );
};

export default Navbar;
