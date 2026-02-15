import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Sparkles, ShoppingBag, Filter, ExternalLink } from 'lucide-react';
import { containerVariants, itemVariants } from '@/constants/animations';
import { useCartStore } from '@/store/cartStore';
import { fetchProducts } from '@/services/productService';
import type { Product } from '@/types';

const CATEGORIES = ['all', 'base', 'lip', 'eye', 'skincare'] as const;

const ShopView = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  const categoryLabels: Record<string, string> = {
    all: t('shop.all'),
    base: t('shop.base'),
    lip: t('shop.lip'),
    eye: t('shop.eye'),
    skincare: t('shop.skincare'),
  };

  useEffect(() => {
    fetchProducts().then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <m.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-16 pb-20">
      <m.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-[32px] sm:text-[50px] lg:text-[80px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
          {t('shop.title')}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
          {t('shop.subtitle')}
        </p>
      </m.div>

      {/* Category Filter */}
      <m.div variants={itemVariants}>
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          <Filter size={14} className="text-gray-300 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>
      </m.div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-[3rem] h-96" />
          ))}
        </div>
      ) : (
        <m.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <m.div
              key={product.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
            >
              <Link to={`/shop/${product.id}`} className="block">
                <div className="aspect-square bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-[8px] font-black z-10 shadow-lg uppercase">
                    {product.matchScore}% {t('common.match')}
                  </div>
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-[8px] font-black uppercase px-3 py-1 rounded-full border border-gray-100">
                    {product.category}
                  </div>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 group-active:scale-110 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <Sparkles size={32} className="text-gray-200 group-hover:text-[#FF4D8D] transition-colors" />
                  )}
                </div>
              </Link>

              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[9px] font-black text-[#FF4D8D] uppercase">{product.brand}</p>
                  <span className="text-[7px] font-black bg-gray-50 px-2 py-0.5 rounded-full text-gray-400 border border-gray-100 uppercase">{product.safetyRating}</span>
                </div>
                <Link to={`/shop/${product.id}`}>
                  <h3 className="text-sm font-black uppercase leading-tight mb-2 hover:text-[#FF4D8D] transition-colors">{product.name}</h3>
                </Link>
                <p className="text-[10px] text-gray-400 line-clamp-2 mb-4">{product.desc}</p>

                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded text-[6px] font-black flex items-center justify-center ${
                        level >= product.melaninRange[0] && level <= product.melaninRange[1]
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-300'
                      }`}
                    >
                      {level}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                  <span className="text-lg font-black">{product.priceDisplay}</span>
                  <div className="flex items-center gap-2">
                    {product.affiliate_url && (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-[#FF4D8D] to-[#FF6B9D] text-white rounded-full text-[8px] font-black uppercase tracking-wider hover:shadow-lg transition-all"
                      >
                        <ExternalLink size={10} />
                        {t('affiliate.buyNow')}
                      </a>
                    )}
                    <m.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => addItem(product)}
                      className="p-3 bg-black text-white rounded-full hover:bg-[#FF4D8D] transition-colors"
                    >
                      <ShoppingBag size={14} />
                    </m.button>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </m.div>
      )}
    </m.div>
  );
};

export default ShopView;
