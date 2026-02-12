import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { containerVariants, itemVariants } from '@/constants/animations';

const ExpertMatchingView = () => {
  const experts = [
    { name: 'Director Kim', role: 'Editorial Lead', rating: 4.9, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80' },
    { name: 'Stylist Han', role: 'Idol Visualist', rating: 5.0, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80' },
    { name: 'Master Park', role: 'Osteo-Technician', rating: 4.8, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80' }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-20 py-12">
      <motion.header variants={itemVariants} className="text-center space-y-6">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] uppercase">Direct Access</p>
        <h2 className="text-5xl lg:text-7xl heading-font uppercase">Human <span className="italic">Artistry.</span></h2>
        <p className="text-gray-400 max-w-lg mx-auto text-sm font-medium">Elevate your AI-generated protocol with a live session from Seoul's most exclusive aesthetic directors.</p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {experts.map((expert, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="group relative bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col items-center text-center hover:shadow-2xl transition-all"
          >
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden mb-8 border-4 border-gray-50 group-hover:border-[#FF4D8D] transition-all relative">
              <img src={expert.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={expert.name} />
              <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h3 className="text-xl heading-font uppercase mb-1">{expert.name}</h3>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">{expert.role}</p>
            <div className="flex items-center gap-1 text-[#FF4D8D] mb-8">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < Math.floor(expert.rating) ? "currentColor" : "none"} />)}
              <span className="text-[10px] font-bold ml-2 text-gray-400">{expert.rating}</span>
            </div>
            <button className="w-full py-4 bg-gray-50 text-black rounded-2xl font-black text-[9px] tracking-widest uppercase hover:bg-black hover:text-white transition-all">
              Book Session
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ExpertMatchingView;
