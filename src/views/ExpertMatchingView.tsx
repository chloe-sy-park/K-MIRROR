import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Globe, MessageCircle, ExternalLink } from 'lucide-react';
import { containerVariants, itemVariants } from '@/constants/animations';
import { EXPERTS, type Expert } from '@/data/experts';

type SpecialtyFilter = 'All' | Expert['specialty'];

const ExpertMatchingView = () => {
  const [filter, setFilter] = useState<SpecialtyFilter>('All');
  const specialties: SpecialtyFilter[] = ['All', ...new Set(EXPERTS.map((e) => e.specialty))];

  const filtered = filter === 'All' ? EXPERTS : EXPERTS.filter((e) => e.specialty === filter);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-20 py-12 max-w-6xl mx-auto">
      <motion.header variants={itemVariants} className="text-center space-y-6">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] uppercase">Direct Access</p>
        <h2 className="text-5xl lg:text-7xl heading-font uppercase">Human <span className="italic">Artistry.</span></h2>
        <p className="text-gray-400 max-w-lg mx-auto text-sm font-medium">
          Elevate your AI-generated protocol with a live session from Seoul's most exclusive aesthetic directors.
        </p>
      </motion.header>

      {/* Specialty Filter */}
      <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === s ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filtered.map((expert) => (
          <motion.div
            key={expert.id}
            variants={itemVariants}
            className="group bg-white border border-gray-100 rounded-[3rem] p-10 hover:shadow-2xl transition-all"
          >
            <div className="flex gap-8">
              {/* Photo */}
              <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-gray-50 group-hover:border-[#FF4D8D] transition-all flex-shrink-0 relative">
                <img
                  src={expert.imageUrl}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt={expert.name}
                />
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-xl heading-font uppercase">{expert.name}</h3>
                  <p className="text-[9px] font-black text-[#FF4D8D] uppercase tracking-widest">{expert.role}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="text-[#FF4D8D]" fill={i < Math.floor(expert.rating) ? 'currentColor' : 'none'} />
                  ))}
                  <span className="text-[10px] font-bold text-gray-400 ml-1">{expert.rating}</span>
                  <span className="text-[8px] text-gray-300 ml-1">({expert.reviewCount} reviews)</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-[8px] font-black uppercase tracking-wider text-gray-500 border border-gray-100">
                    {expert.specialty}
                  </span>
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-[8px] font-black uppercase tracking-wider text-gray-500 border border-gray-100">
                    {expert.melaninExpertise}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-gray-500 leading-relaxed mt-6 font-medium italic">
              &ldquo;{expert.bio}&rdquo;
            </p>

            {/* Details */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                <Globe size={12} />
                <span>{expert.languages.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                <MessageCircle size={12} />
                <span>{expert.priceRange}</span>
              </div>
            </div>

            {/* CTA */}
            <a
              href={expert.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-4 bg-gray-50 text-black rounded-2xl font-black text-[9px] tracking-widest uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
            >
              Book Session <ExternalLink size={12} />
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ExpertMatchingView;
