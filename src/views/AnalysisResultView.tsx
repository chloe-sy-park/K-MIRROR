import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import {
  RotateCcw, Cpu, Palette, Droplets, Eye, Activity,
  Check, Sparkles, Plus, Play, Lightbulb,
  Bookmark, X, Target, Youtube, Wand2,
} from 'lucide-react';
import { containerVariants, itemVariants } from '@/constants/animations';
import { useScanStore } from '@/store/scanStore';
import { useMuseStore } from '@/store/museStore';
import { useCartStore } from '@/store/cartStore';
import { renderColorOnSkin } from '@/services/colorService';
import { matchRecommendedProducts } from '@/services/productService';
import { PRODUCT_CATALOG } from '@/data/productCatalog';
import { getYouTubeVideoUrl, formatViewCount } from '@/services/youtubeService';
import SherlockProportionVisualizer from '@/components/sherlock/ProportionVisualizer';

let nextReportId = 0;
const generateReportId = () => ++nextReportId;

const AnalysisResultView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { result, userImage, celebImage, youtubeVideos, reset } = useScanStore();
  const { boards, saveMuse, fetchBoards } = useMuseStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();
  const [isSaved, setIsSaved] = useState(false);

  const { addItem } = useCartStore();

  const [reportId] = useState(generateReportId);

  // Find best-matching board based on autoTags (must be before early return)
  const autoTags = result?.autoTags;
  const suggestedBoard = useMemo(() => {
    if (!autoTags?.length || !boards.length) return null;
    const tags = autoTags.map((t) => t.toLowerCase());
    let bestBoard = null;
    let bestScore = 0;
    for (const board of boards) {
      const nameWords = board.name.toLowerCase().split(/\s+/);
      const score = nameWords.filter((w) => tags.some((t) => t.includes(w) || w.includes(t))).length;
      if (score > bestScore) {
        bestScore = score;
        bestBoard = board;
      }
    }
    return bestBoard;
  }, [autoTags, boards]);

  if (!result) return null;

  const matchedProducts = matchRecommendedProducts(result.recommendations.products, PRODUCT_CATALOG);
  const hasRealVideos = youtubeVideos.length > 0;
  const focusPoints = result.youtubeSearch?.focusPoints || [];
  const channelSuggestions = result.youtubeSearch?.channelSuggestions || [];

  const handleAddToCart = (idx: number) => {
    const catalogProduct = matchedProducts[idx];
    if (catalogProduct) {
      addItem(catalogProduct);
    }
  };

  const handleReset = () => {
    reset();
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleOpenSave = async () => {
    await fetchBoards();
    setShowSaveModal(true);
  };

  const handleSaveMuse = async () => {
    await saveMuse({
      userImage: userImage || '',
      celebImage: celebImage || '',
      celebName: result.kMatch.celebName,
      date: new Date().toLocaleDateString(),
      vibe: result.sherlock.facialVibe,
      boardId: selectedBoardId,
      aiStylePoints: result.kMatch.aiStylePoints,
      tags: result.autoTags || [],
      notes: '',
      extraImages: [],
    });
    setIsSaved(true);
    setShowSaveModal(false);
  };

  return (
    <m.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-32 pb-20 px-6"
    >
      <m.section variants={itemVariants} className="border-b border-black pb-20">
        <div className="flex justify-between items-start mb-12">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black tracking-[0.5em] text-[#FF4D8D] uppercase italic">{t('result.diagnosticReport')} — ID:{reportId}</p>
            <div className="flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              <Cpu size={10} /> Neural Stylist v5.0-inclusive
            </div>
          </div>
          <div className="flex items-center gap-4">
            <m.button
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenSave}
              disabled={isSaved}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                isSaved ? 'text-[#FF4D8D]' : 'text-gray-400 hover:text-[#FF4D8D]'
              }`}
            >
              <Bookmark size={12} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? t('result.saved') : t('result.save')}
            </m.button>
            <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              <RotateCcw size={12} /> {t('result.newScan')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end">
          <h2 className="text-[60px] lg:text-[100px] heading-font leading-[0.85] tracking-[-0.05em] uppercase text-balance">
            {t('result.neuralIdentity')}
          </h2>
          <div className="space-y-6 max-w-sm w-full">
            <div className="flex justify-between border-b border-gray-100 pb-4 items-center">
              <span className="text-[10px] font-black uppercase text-gray-300">{t('result.toneMapping')}</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: result.tone.skinHexCode }} />
                <span className="text-xs font-bold uppercase">{result.tone.undertone} / L{result.tone.melaninIndex}</span>
                <span className="text-[8px] text-gray-400 font-mono">{result.tone.skinHexCode}</span>
              </div>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">{t('result.osteoStructure')}</span>
              <span className="text-xs font-bold uppercase">{result.sherlock.boneStructure}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-300">{t('result.aestheticVibe')}</span>
              <span className="text-xs font-bold uppercase">{result.sherlock.facialVibe}</span>
            </div>
          </div>
        </div>
      </m.section>

      <m.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">
        <div className="lg:col-span-5 space-y-12">
          <m.div
            whileHover={{ scale: 1.02 }}
            className="p-10 md:p-12 border border-gray-100 rounded-[3.5rem] bg-white shadow-2xl relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-12 border-b border-gray-50 pb-10">
              <div className="space-y-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-300">{t('result.forensicMapping')}</h3>
                <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-widest">Sherlock Profile v4.2</p>
              </div>
              <SherlockProportionVisualizer proportions={result.sherlock.proportions} />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium italic text-balance">
              "{result.tone.description}"
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {result.tone.skinConcerns.map(c => (
                <span key={c} className="text-[9px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase">{c}</span>
              ))}
            </div>
          </m.div>
        </div>
        <div className="lg:col-span-7 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: t('result.neuralBase'), val: result.kMatch.adaptationLogic.base, icon: <Palette size={22}/> },
              { label: t('result.lipStrategy'), val: result.kMatch.adaptationLogic.lip, icon: <Droplets size={22}/> },
              { label: t('result.vectorFocus'), val: result.kMatch.adaptationLogic.point, icon: <Eye size={22}/> }
            ].map((item, idx) => (
              <m.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-10 border border-gray-100 rounded-[3rem] bg-[#FDFDFE] flex flex-col gap-8 transition-all hover:bg-white hover:shadow-xl"
              >
                <div className="text-[#FF4D8D]">{item.icon}</div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.4em] mb-3 uppercase">{item.label}</p>
                  <p className="text-xs font-black leading-snug tracking-tight text-gray-900 uppercase text-balance">{item.val}</p>
                </div>
              </m.div>
            ))}
          </div>
          <m.div
            whileHover={{ scale: 1.01 }}
            className="p-14 bg-black text-white rounded-[4rem] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D8D]/10 blur-[100px]"></div>
            <div className="flex items-center gap-3 mb-8">
              <Activity size={16} className="text-[#FF4D8D]" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.7em] text-[#FF4D8D]">{t('result.adaptationNotes')}</h4>
            </div>
            <p className="text-xl lg:text-3xl font-medium leading-[1.3] italic tracking-tight text-gray-100 text-balance">
              "{result.kMatch.styleExplanation}"
            </p>
            <div className="mt-12 flex flex-wrap gap-3">
              {result.kMatch.aiStylePoints.map(p => (
                <div key={p} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <Check size={10} className="text-[#FF4D8D]" />
                  <span className="text-[8px] font-black uppercase tracking-widest uppercase">{p}</span>
                </div>
              ))}
            </div>
          </m.div>
        </div>
      </m.section>

      <m.section variants={itemVariants}>
        <div className="flex justify-between items-end mb-16">
          <h3 className="text-[40px] heading-font italic uppercase">{t('result.recommendedObjects')}</h3>
          <button onClick={handleCheckout} className="text-[10px] font-black border-b border-black pb-1 cursor-pointer uppercase tracking-widest hover:text-[#FF4D8D] hover:border-[#FF4D8D] transition-all">{t('result.shopCollection')}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-black/5 border border-black/5 overflow-hidden rounded-[2.5rem]">
          {result.recommendations.products.map((product, idx) => (
            <m.div
              key={idx}
              whileHover={{ backgroundColor: "#F9F9F9" }}
              className="bg-white p-10 group transition-all flex flex-col h-full"
            >
              <div className="aspect-square mb-10 overflow-hidden bg-gray-50 flex items-center justify-center p-8 rounded-2xl relative">
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-[8px] font-black z-10 shadow-lg uppercase">
                  {product.matchScore}% MATCH
                </div>
                <Sparkles size={24} className="text-gray-100 absolute" />
                <div className="w-full h-full bg-gray-100/50 mix-blend-multiply rounded-lg group-hover:scale-110 transition-transform duration-700" />
              </div>
              {result.tone.skinHexCode && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t('result.swatchPreview')}</span>
                  {(['tint', 'matte', 'cushion'] as const).map((type) => (
                    <div
                      key={type}
                      className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: renderColorOnSkin(result.tone.skinHexCode, '#FF4D8D', type) }}
                      title={type}
                    />
                  ))}
                </div>
              )}
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[9px] font-black text-[#FF4D8D] uppercase">{product.brand}</p>
                  <span className="text-[7px] font-black bg-gray-50 px-2 py-0.5 rounded-full text-gray-400 border border-gray-100 uppercase">{product.safetyRating}</span>
                </div>
                <h4 className="text-lg heading-font italic mb-4 uppercase leading-none">{product.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium mb-6 line-clamp-2 text-balance">{product.desc}</p>
                <div className="flex justify-between items-end mt-auto pt-6 border-t border-gray-50">
                  <p className="text-sm font-black">{product.price}</p>
                  <m.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAddToCart(idx)}
                    className="p-3 bg-black text-white rounded-full hover:bg-[#FF4D8D] transition-colors"
                    title="Add to cart"
                  >
                    <Plus size={16} />
                  </m.button>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </m.section>

      <m.section variants={itemVariants}>
        <div className="text-center mb-16 space-y-4">
          <h3 className="text-[40px] heading-font italic uppercase">{t('result.curatedTutorials')}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
            {t('result.curatedTutorialsDesc')}
          </p>
        </div>

        {/* Focus Points — what to watch for */}
        {focusPoints.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 p-8 bg-gradient-to-r from-[#FF4D8D]/5 to-purple-50 border border-[#FF4D8D]/10 rounded-[2.5rem]"
          >
            <div className="flex items-center gap-3 mb-5">
              <Target size={16} className="text-[#FF4D8D]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D8D]">
                {t('result.focusPoints')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {focusPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#FF4D8D]/10 text-[#FF4D8D] flex items-center justify-center flex-shrink-0 text-[9px] font-black mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </m.div>
        )}

        {/* Real YouTube Videos (if available) */}
        {hasRealVideos ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {youtubeVideos.map((video) => (
              <m.div
                key={video.videoId}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex flex-col gap-6"
              >
                <a
                  href={getYouTubeVideoUrl(video.videoId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group cursor-pointer overflow-hidden rounded-[3rem] h-[350px] shadow-xl block"
                >
                  {/* Real thumbnail */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <m.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 rounded-full bg-red-600/90 backdrop-blur-md flex items-center justify-center border border-red-400/30 shadow-lg"
                    >
                      <Play fill="white" className="text-white translate-x-0.5" size={24} />
                    </m.div>
                  </div>
                  {video.duration && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-black/70 text-white rounded-lg text-[9px] font-black">
                      {video.duration}
                    </div>
                  )}
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">
                      {video.channelTitle} {video.viewCount ? `• ${formatViewCount(video.viewCount)} ${t('common.views')}` : ''}
                    </p>
                    <h4 className="text-lg font-bold leading-tight line-clamp-2">{video.title}</h4>
                  </div>
                </a>
              </m.div>
            ))}
          </div>
        ) : (
          /* Fallback: AI-generated video recommendations with YouTube search links */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {result.recommendations.videos && result.recommendations.videos.map((video, idx) => (
              <m.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex flex-col gap-6"
              >
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${video.title} ${video.creator} K-beauty tutorial`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group cursor-pointer overflow-hidden rounded-[3rem] h-[350px] shadow-xl block"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                    <div className="text-[120px] font-black heading-font text-white/5 uppercase select-none">{idx + 1}</div>
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/20">
                    <m.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 rounded-full bg-red-600/80 backdrop-blur-md flex items-center justify-center border border-red-400/30"
                    >
                      <Play fill="white" className="text-white translate-x-0.5" size={24} />
                    </m.div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-4">{t('result.searchOnYoutube')}</span>
                  </div>
                  <div className="absolute top-8 left-8">
                    <div className="px-4 py-2 bg-[#FF4D8D] text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">
                      {video.matchPercentage}% {t('result.aiMatch')}
                    </div>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{video.creator} • {video.views} {t('common.views')}</p>
                    <h4 className="text-xl heading-font italic leading-tight uppercase max-w-sm text-balance">{video.title}</h4>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black uppercase">{video.tag}</span>
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black uppercase">{video.skillLevel}</span>
                    </div>
                  </div>
                </a>
                {video.aiCoaching && (
                  <m.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-pink-50 border border-pink-100 p-8 rounded-[2.5rem] flex gap-6 items-start"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-[#FF4D8D] shadow-sm">
                      <Lightbulb size={20} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FF4D8D]">{t('result.aiCoachingProtocol')}</p>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium italic text-balance">"{video.aiCoaching}"</p>
                    </div>
                  </m.div>
                )}
              </m.div>
            ))}
          </div>
        )}

        {/* Recommended Channels */}
        {channelSuggestions.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center space-y-4"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">{t('result.recommendedChannels')}</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {channelSuggestions.map((channel) => (
                <a
                  key={channel}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(channel)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl hover:border-red-200 hover:bg-red-50 transition-all group"
                >
                  <Youtube size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-red-600 transition-colors">{channel}</span>
                </a>
              ))}
            </div>
          </m.div>
        )}
      </m.section>
      {/* Save to Muse Board Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowSaveModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl heading-font uppercase tracking-tight">
                  {t('result.saveToMuseBoard')}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3">
                  {result.kMatch.celebName} — {result.sherlock.facialVibe}
                </p>
              </div>

              {/* AI Auto Tags */}
              {result.autoTags && result.autoTags.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Wand2 size={12} className="text-[#FF4D8D]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t('result.aiAutoTags')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.autoTags.map((tag) => (
                      <span key={tag} className="text-[9px] font-bold text-[#FF4D8D] bg-[#FF4D8D]/10 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggested Board */}
              {suggestedBoard && (
                <div className="mb-4 p-4 bg-[#FF4D8D]/5 border border-[#FF4D8D]/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 size={12} className="text-[#FF4D8D]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4D8D]">{t('result.aiSuggests')}</span>
                  </div>
                  <button
                    onClick={() => setSelectedBoardId(suggestedBoard.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      selectedBoardId === suggestedBoard.id
                        ? 'bg-[#FF4D8D] text-white'
                        : 'bg-white hover:bg-[#FF4D8D]/10'
                    }`}
                  >
                    <span className="text-lg">{suggestedBoard.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{suggestedBoard.name}</span>
                  </button>
                </div>
              )}

              <div className="space-y-3 mb-8 max-h-60 overflow-y-auto">
                <button
                  onClick={() => setSelectedBoardId(undefined)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${
                    !selectedBoardId ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('muse.noBoard')}</span>
                </button>
                {boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setSelectedBoardId(board.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${
                      selectedBoardId === board.id ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{board.icon}</span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{board.name}</span>
                      <span className={`ml-2 text-[8px] ${selectedBoardId === board.id ? 'text-gray-400' : 'text-gray-300'}`}>
                        {board.count} {t('common.muses')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSaveMuse}
                className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all"
              >
                {t('muse.saveMuse')}
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

export default AnalysisResultView;
