import { useState, useMemo } from 'react';
import * as m from 'framer-motion/m';
import { Star, Sparkles, Filter, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [genre, setGenre] = useState<GenreFilter>('All');
  const [mood, setMood] = useState<MoodFilter>('All');

  const genreLabels: Record<string, string> = {
    All: t('celebs.all'),
    'K-Pop': 'K-Pop',
    'K-Drama': 'K-Drama',
    'K-Beauty': 'K-Beauty',
    'K-Film': 'K-Film',
  };

  const moodLabels: Record<string, string> = {
    All: t('celebs.all'),
    Natural: t('onboarding.natural'),
    Elegant: t('onboarding.elegant'),
    Powerful: t('onboarding.powerful'),
    Cute: 'Cute',
  };

  const filtered = useMemo(() => {
    return CELEB_GALLERY
      .filter((c) => genre === 'All' || c.genre === genre)
      .filter((c) => mood === 'All' || c.mood === mood)
      .sort((a, b) => b.popularityScore - a.popularityScore);
  }, [genre, mood]);

  const handleSelectCeleb = (celeb: CelebProfile) => {
    navigate('/scan', { state: { selectedCeleb: celeb } });
  };

  return (
    <m.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Header */}
      <m.div variants={itemVariants} className="text-center space-y-4">
        <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-[0.5em]">{t('celebs.styleMuse')}</p>
        <h2 className="text-[32px] sm:text-[50px] lg:text-[70px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
          {t('celebs.title')}
        </h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          {t('celebs.subtitle')}
        </p>
      </m.div>

      {/* Filters */}
      <m.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3 text-gray-400">
          <Filter size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">{t('celebs.filterByGenre')}</span>
        </div>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t('celebs.filterByGenre')}>
          {GENRES.map((g) => (
            <button
              key={g}
              role="radio"
              aria-checked={genre === g}
              onClick={() => setGenre(g)}
              className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                genre === g
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {genreLabels[g] ?? g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-gray-400 mt-4">
          <Sparkles size={14} aria-hidden="true" />
          <span className="text-[9px] font-black uppercase tracking-widest">{t('celebs.filterByMood')}</span>
        </div>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t('celebs.filterByMood')}>
          {MOODS.map((moodOption) => (
            <button
              key={moodOption}
              role="radio"
              aria-checked={mood === moodOption}
              onClick={() => setMood(moodOption)}
              className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                mood === moodOption
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {moodLabels[moodOption] ?? moodOption}
            </button>
          ))}
        </div>
      </m.div>

      {/* Results count */}
      <m.p variants={itemVariants} className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
        {filtered.length} {filtered.length === 1 ? t('celebs.celeb') : t('celebs.celebsCount')} {t('celebs.found')}
      </m.p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <m.div variants={itemVariants} className="py-20 text-center space-y-4">
          <Star size={48} className="mx-auto text-gray-200" />
          <p className="text-gray-400 text-sm">{t('celebs.noResults')}</p>
        </m.div>
      ) : (
        <m.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((celeb) => (
            <m.div
              key={celeb.id}
              role="button"
              tabIndex={0}
              aria-label={`${t('celebs.selectAsMuse')} — ${celeb.name}`}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF4D8D] focus-visible:ring-offset-2 outline-none"
              onClick={() => handleSelectCeleb(celeb)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectCeleb(celeb); } }}
            >
              {/* Avatar */}
              {celeb.imageUrl ? (
                <img
                  src={celeb.imageUrl}
                  alt={celeb.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mb-6 shadow-lg ring-2 ring-gray-100 group-hover:ring-[#FF4D8D] transition-all"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FF4D8D] to-purple-400 flex items-center justify-center mb-6 shadow-lg ${celeb.imageUrl ? 'hidden' : ''}`}>
                <User size={28} className="text-white" />
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4D8D] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <Sparkles size={12} /> {t('celebs.selectAsMuse')}
                  </span>
                </div>
              </div>
            </m.div>
          ))}
        </m.div>
      )}
    </m.div>
  );
};

export default CelebGalleryView;
