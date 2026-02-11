import { motion } from 'framer-motion';
import { Sparkles, Beaker } from 'lucide-react';
import { containerVariants, itemVariants } from '@/constants/animations';
import LuxuryFileUpload from '@/components/ui/LuxuryFileUpload';
import Toggle from '@/components/ui/Toggle';

interface ScanViewProps {
  userImage: string | null;
  celebImage: string | null;
  isSensitive: boolean;
  onUserImageSelect: (base64: string) => void;
  onCelebImageSelect: (base64: string) => void;
  onToggleSensitive: () => void;
  onAnalyze: () => void;
  onDemoMode: () => void;
}

const ScanView = ({
  userImage, celebImage, isSensitive,
  onUserImageSelect, onCelebImageSelect,
  onToggleSensitive, onAnalyze, onDemoMode
}: ScanViewProps) => {
  return (
    <motion.div
      key="idle" initial="hidden" animate="visible" variants={containerVariants}
      className="flex flex-col lg:flex-row items-center gap-16 lg:py-12"
    >
      <motion.div variants={itemVariants} className="flex-1 text-center lg:text-left space-y-10">
        <div className="relative inline-block">
          <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em] mb-6 uppercase">Biometric Style Lab</p>
          <button onClick={onDemoMode} className="absolute -top-12 -right-12 group">
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
          <LuxuryFileUpload label="Base Portrait" preview={userImage} onImageSelect={onUserImageSelect} secondaryLabel="Bare-Face / No Makeup" />
          <LuxuryFileUpload label="Style Muse" preview={celebImage} onImageSelect={onCelebImageSelect} secondaryLabel="Pinterest Inspiration" />
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
            <Toggle checked={isSensitive} onChange={onToggleSensitive} />
          </motion.div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAnalyze}
            disabled={!userImage || !celebImage}
            className="px-14 py-7 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-[#FF4D8D] transition-all duration-500 disabled:opacity-20 shadow-2xl flex items-center gap-4 uppercase"
          >
            Neural Scan {userImage && celebImage && <Sparkles size={16} />}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScanView;
