import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { ArrowLeft, ShoppingBag, Sparkles, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { containerVariants, itemVariants } from '@/constants/animations';
import { useCartStore } from '@/store/cartStore';
import { useScanStore } from '@/store/scanStore';
import { renderColorOnSkin } from '@/services/colorService';
import { fetchProductById } from '@/services/productService';
import type { Product } from '@/types';

const ProductDetailView = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const skinHex = useScanStore((s) => s.result?.tone.skinHexCode);
  const [product, setProduct] = useState<Product | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductById(id).then(setProduct);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="py-32 text-center">
        <p className="text-gray-300 font-black uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <m.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-5xl mx-auto pb-20">
      <m.button
        variants={itemVariants}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-12"
      >
        <ArrowLeft size={14} /> Back
      </m.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Product Image Area */}
        <m.div variants={itemVariants}>
          <div className="aspect-square bg-gray-50 rounded-[3.5rem] flex items-center justify-center relative overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <Sparkles size={64} className="text-gray-200" />
            )}
            <div className="absolute top-6 right-6 bg-black text-white px-4 py-2 rounded-full text-[8px] font-black uppercase shadow-lg">
              {product.matchScore}% Match
            </div>
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-sm text-[8px] font-black uppercase px-3 py-1.5 rounded-full border border-gray-100">
              {product.category}
            </div>
          </div>

          {/* Color swatches when skin hex is available */}
          {skinHex && (product.category === 'lip' || product.category === 'base') && (
            <div className="mt-6 p-6 bg-gray-50 rounded-3xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Swatch Preview on Your Skin</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full border border-gray-200" style={{ backgroundColor: skinHex }} />
                  <span className="text-[7px] text-gray-400 mt-1 block">Skin</span>
                </div>
                {(['tint', 'matte', 'cushion'] as const).map((type) => (
                  <div key={type} className="text-center">
                    <div
                      className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: renderColorOnSkin(skinHex, '#FF4D8D', type) }}
                    />
                    <span className="text-[7px] text-gray-400 mt-1 block capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </m.div>

        {/* Product Info */}
        <m.div variants={itemVariants} className="space-y-10">
          <div>
            <p className="text-[10px] font-black text-[#FF4D8D] uppercase tracking-widest mb-2">{product.brand}</p>
            <h1 className="text-4xl lg:text-5xl heading-font italic uppercase leading-[0.9] tracking-tight mb-6">{product.name}</h1>
            <p className="text-gray-500 text-sm leading-relaxed">{product.desc}</p>
          </div>

          <div className="flex items-end gap-4">
            <span className="text-4xl font-black">{product.priceDisplay}</span>
            <div className="flex items-center gap-1 text-green-600 text-[9px] font-black uppercase tracking-widest">
              <ShieldCheck size={12} /> {product.safetyRating}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Melanin Range</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <div
                  key={level}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-black ${
                    level >= product.melaninRange[0] && level <= product.melaninRange[1]
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  L{level}
                </div>
              ))}
            </div>
          </div>

          {product.ingredients.length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Key Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <span key={ing} className="text-[9px] font-bold bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.affiliate_url && (
            <a
              href={product.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('affiliate_clicked', { product_name: product.name, source: 'product_detail' })}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-[#FF4D8D] to-[#FF6B9D] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em]"
            >
              {t('affiliate.buyNow')}
              <ExternalLink size={16} />
            </a>
          )}
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            disabled={added}
            className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-black text-white hover:bg-[#FF4D8D]'
            }`}
          >
            {added ? (
              <><Check size={16} /> Added to Cart</>
            ) : (
              <><ShoppingBag size={16} /> Add to Cart</>
            )}
          </m.button>
        </m.div>
      </div>
    </m.div>
  );
};

export default ProductDetailView;
