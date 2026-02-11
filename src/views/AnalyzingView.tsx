import { motion } from 'framer-motion';

interface AnalyzingViewProps {
  userImage: string | null;
}

const AnalyzingView = ({ userImage }: AnalyzingViewProps) => {
  return (
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
  );
};

export default AnalyzingView;
