import * as m from 'framer-motion/m';
import {
  ArrowRight, ArrowUpRight, Ruler, Eye, Box, Star,
  Activity, Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { containerVariants, itemVariants } from '@/constants/animations';

interface MethodologyViewProps {
  onBookSession: () => void;
}

const MethodologyView = ({ onBookSession }: MethodologyViewProps) => {
  const { t } = useTranslation();

  const pillars = [
    {
      id: "01",
      title: t('methodology.pillar1Title'),
      subtitle: t('methodology.pillar1Subtitle'),
      desc: t('methodology.pillar1Desc'),
      icon: <Ruler size={32} />,
      img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80",
      accent: t('methodology.pillar1Accent'),
    },
    {
      id: "02",
      title: t('methodology.pillar2Title'),
      subtitle: t('methodology.pillar2Subtitle'),
      desc: t('methodology.pillar2Desc'),
      icon: <Eye size={32} />,
      img: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80",
      accent: t('methodology.pillar2Accent'),
    },
    {
      id: "03",
      title: t('methodology.pillar3Title'),
      subtitle: t('methodology.pillar3Subtitle'),
      desc: t('methodology.pillar3Desc'),
      icon: <Box size={32} />,
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80",
      accent: t('methodology.pillar3Accent'),
    }
  ];

  return (
    <m.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="max-w-7xl mx-auto py-20 px-6"
    >
      <m.section variants={itemVariants} className="mb-32 border-b border-black pb-20">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-8 uppercase italic">{t('methodology.techPhilosophy')}</p>
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <h2 className="text-[60px] lg:text-[120px] heading-font leading-[0.8] tracking-[-0.05em] uppercase">
            {t('methodology.forensicBeauty')}
          </h2>
          <div className="max-w-md">
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-6 italic border-l-2 border-[#FF4D8D] pl-6">
              "{t('methodology.quote')}"
            </p>
            <p className="text-sm text-gray-500 leading-relaxed font-medium uppercase tracking-tight text-balance">
              {t('methodology.description')}
            </p>
          </div>
        </div>
      </m.section>

      <section className="grid grid-cols-1 gap-40">
        {pillars.map((pillar, idx) => (
          <m.div
            key={pillar.id}
            variants={itemVariants}
            className={`flex flex-col lg:flex-row items-center gap-20 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className="flex-1 space-y-12">
              <div className="flex items-center gap-6">
                <span className="text-4xl heading-font italic text-gray-200">{pillar.id}</span>
                <div className="w-16 h-[1px] bg-gray-200" />
                <div className="text-[#FF4D8D]">{pillar.icon}</div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D8D] mb-3">{pillar.accent}</p>
                <h3 className="text-4xl lg:text-5xl heading-font uppercase tracking-tighter mb-4">{pillar.title}</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">{pillar.subtitle}</p>
                <p className="text-gray-500 leading-[1.8] text-sm font-medium max-w-lg">
                  {pillar.desc}
                </p>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('methodology-cta');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border-b border-black pb-2 hover:text-[#FF4D8D] hover:border-[#FF4D8D] transition-all uppercase"
              >
                {t('methodology.exploreMethodology')} <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="flex-1 w-full aspect-square relative group">
              <div className="absolute inset-0 bg-gray-50 rounded-[4rem] overflow-hidden shadow-2xl">
                <img
                  src={pillar.img}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]"
                  alt={pillar.title}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="flex items-center gap-3">
                    <Activity size={14} className="text-[#FF4D8D]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.5em]">{t('methodology.realTimeScan')}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-[#FF4D8D]/20 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-2 border-l-2 border-[#FF4D8D]/20 pointer-events-none" />
            </div>
          </m.div>
        ))}
      </section>

      <m.section id="methodology-cta" variants={itemVariants} className="mt-60 mb-20 py-40 bg-black text-white rounded-[6rem] text-center overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <Layers size={800} strokeWidth={0.5} className="absolute -top-40 -left-40 animate-pulse text-[#FF4D8D]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-[#FF4D8D] mb-12">{t('methodology.universalBridge')}</p>
          <h4 className="text-4xl lg:text-7xl heading-font italic leading-[1.1] uppercase mb-16 text-balance">
            "{t('methodology.identityQuote')}"
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto font-medium mb-20 text-balance">
            {t('methodology.bridgeDesc')}
          </p>

          <div className="flex flex-col items-center gap-10">
            <div className="w-[1px] h-20 bg-[#FF4D8D]/30" />
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">{t('methodology.humanIntervention')}</p>
              <h3 className="text-3xl heading-font uppercase">{t('methodology.masterDirector')}</h3>
            </div>
            <button
              onClick={onBookSession}
              className="group relative flex items-center gap-6 px-14 py-8 bg-white text-black rounded-full font-black text-xs tracking-[0.4em] uppercase hover:bg-[#FF4D8D] hover:text-white transition-all duration-500"
            >
              {t('methodology.bookMasterSession')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FF4D8D] rounded-full flex items-center justify-center text-white rotate-12 shadow-xl">
                <Star size={18} fill="currentColor" />
              </div>
            </button>
            <div className="flex gap-12 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black heading-font">184</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{t('methodology.adaptiveMetrics')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black heading-font">0.4mm</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{t('methodology.scanPrecision')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black heading-font">99.2%</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{t('methodology.inclusiveScore')}</span>
              </div>
            </div>
          </div>
        </div>
      </m.section>
    </m.div>
  );
};

export default MethodologyView;
