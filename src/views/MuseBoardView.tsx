import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

const MuseBoardView = () => {
  return (
    <motion.div key="muse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[4rem] bg-gray-50/20 mx-6">
      <LayoutGrid size={64} className="mx-auto text-gray-200 mb-10" />
      <p className="text-gray-400 font-black uppercase tracking-[0.6em] uppercase">Neural Muse Board Coming Soon</p>
    </motion.div>
  );
};

export default MuseBoardView;
