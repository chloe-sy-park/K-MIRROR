import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { containerVariants, itemVariants } from '@/constants/animations';
import { CELEB_GALLERY, type CelebProfile } from '@/data/celebGallery';

type GenreFilter = CelebProfile['genre'] | 'All';
type MoodFilter = CelebProfile['mood'] | 'All';

const GENRES: GenreFilter[] = ['All', 'K-Pop', 'K-Drama', 'K-Beauty', 'K-Film'];
const MOODS: MoodFilter[] = ['All', 'Natural', 'Elegant', 'Powerful', 'Cute'];

const MOOD_COLORS: Record<CelebProfile['mood'], string> = {
  Natural: 'bg-green-50 text-green-600',
  Elegant: 'bg-purple-50 text-purple-600',
  Powerful: 'bg-red-50 text-red-600',
  Cute: 'bg-pink-50 text-pink-500',
};

const GENRE_COLORS: Record<CelebProfile['genre'], string> = {
  'K-Pop': 'bg-[#FF4D8D]/10 text-[#FF4D8D]',
  'K-Drama': 'bg-blue-50 text-blue-600',
  'K-Beauty': 'bg-amber-50 text-amber-600',
  'K-Film': 'bg-gray-100 text-gray-600',
};

const CelebGalleryView = () => {
  const navigate = useNavigate();
  const [genre, setGenre] = useState<GenreFilter>('All');
  const [mood, setMood] = useState<MoodFilter>('All');

  const filtered = useMemo(() => {
    return CELEB_GALLERY
      .filter((c) => genre === 'All' || c.genre === genre)
      .filter((c) => mood === 'All' || c.mood === mood)
      .sort((a, b) => b.popularityScore - a.popularityScore);
  }, [genre, mood]);

  const handleSelectCeleb = (celeb: CelebProfile) => {
    // Navigate to scan view — user can then upload celeb's image
    navigate('/', { state: { selectedCeleb: celeb } });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em]">Style Muse Gallery</p>
        <h2 className="text-[50px] lg:text-[70px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
          K-CELEB <span className="italic text-[#FF4D8D]">GALLERY</span>
        </h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Browse trending K-Beauty icons. Select your style muse to start a personalized analysis.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3 text-gray-400">
          <Filter size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Filter by Genre</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                genre === g
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-gray-400 mt-4">
          <Sparkles size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Filter by Mood</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                mood === m
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <motion.p variants={itemVariants} className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
        {filtered.length} {filtered.length === 1 ? 'celeb' : 'celebs'} found
      </motion.p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="py-20 text-center space-y-4">
          <Star size={48} className="mx-auto text-gray-200" />
          <p className="text-gray-400 text-sm">No celebs match your filters. Try a different combination.</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((celeb) => (
            <motion.div
              key={celeb.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
              onClick={() => handleSelectCeleb(celeb)}
            >
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF4D8D] to-purple-400 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white text-2xl font-black heading-font">
                  {celeb.name.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-black">{celeb.name}</h3>
                  <p className="text-xs text-gray-400 font-bold">{celeb.group}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${GENRE_COLORS[celeb.genre]}`}>
                    {celeb.genre}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${MOOD_COLORS[celeb.mood]}`}>
                    {celeb.mood}
                  </span>
                </div>

                {/* Signature Look */}
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  &ldquo;{celeb.signatureLook}&rdquo;
                </p>

                {/* Popularity */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF4D8D] to-purple-400 rounded-full transition-all"
                      style={{ width: `${celeb.popularityScore}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-gray-400">{celeb.popularityScore}</span>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4D8D] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <Sparkles size={12} /> Select as Muse
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CelebGalleryView;
