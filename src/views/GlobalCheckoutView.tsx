import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import {
  Globe, Truck, ShieldCheck, Sparkles, Minus, Plus, Trash2,
  ShoppingBag, Check, ArrowLeft,
} from 'lucide-react';
import { containerVariants, itemVariants } from '@/constants/animations';
import { useCartStore } from '@/store/cartStore';
import { isPaymentEnabled, createCheckoutSession } from '@/services/paymentService';
import { createLocalOrder } from '@/services/orderService';

const GlobalCheckoutView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    items, shippingMethod, setShippingMethod,
    removeItem, updateQuantity, clearCart,
    subtotal, shippingCost, total, itemCount,
  } = useCartStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('');

  const isFormValid = fullName.trim().length >= 2 && address.trim().length >= 5;

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !isFormValid) return;

    if (isPaymentEnabled) {
      setIsProcessing(true);
      try {
        const url = await createCheckoutSession({
          items,
          shippingMethod,
          shippingName: fullName,
          shippingCountry: country,
          shippingAddress: address,
        });
        if (url) {
          window.location.href = url;
          return;
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Checkout error:', err);
        setIsProcessing(false);
        return;
      }
    }

    // Fallback: local order
    createLocalOrder({
      items,
      subtotal: subtotal(),
      shipping: shippingCost(),
      total: total(),
      shippingMethod,
      shippingName: fullName,
      shippingCountry: country,
      shippingAddress: address,
    });
    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-32 text-center space-y-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <Check size={32} className="text-green-500" />
        </div>
        <h2 className="text-4xl heading-font italic uppercase">{t('checkout.orderPlaced')}</h2>
        <p className="text-gray-400 text-sm">{t('checkout.orderPlacedDesc')}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/')} className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all">
            {t('common.newScan')}
          </button>
          <button onClick={() => navigate('/orders')} className="px-8 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
            {t('checkout.viewOrders')}
          </button>
        </div>
      </m.div>
    );
  }

  if (items.length === 0) {
    return (
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center space-y-8">
        <ShoppingBag size={64} className="mx-auto text-gray-200" />
        <h2 className="text-3xl heading-font italic uppercase text-gray-300">{t('checkout.cartEmpty')}</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">{t('checkout.cartEmptyDesc')}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/')} className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all">
            {t('checkout.startScan')}
          </button>
          <button onClick={() => navigate('/shop')} className="px-8 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
            {t('checkout.browseShop')}
          </button>
        </div>
      </m.div>
    );
  }

  return (
    <m.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto py-10 lg:py-20">
      <m.div variants={itemVariants} className="mb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8">
          <ArrowLeft size={14} /> {t('checkout.continueShopping')}
        </button>
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-3 uppercase italic">Checkout — {itemCount()} {t('checkout.items')}</p>
        <h2 className="text-[32px] sm:text-[50px] lg:text-[70px] heading-font leading-[0.9] tracking-[-0.04em] uppercase">
          {t('checkout.title')}
        </h2>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
        <m.div variants={itemVariants} className="lg:col-span-7 space-y-12">
          {/* Cart Items */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <ShoppingBag size={14} /> {t('checkout.yourCollection')}
            </h3>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center flex-wrap sm:flex-nowrap gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-3xl border border-gray-100 group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Sparkles size={18} className="text-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[9px] font-black text-[#FF4D8D] uppercase">{product.brand}</p>
                    <span className="text-[7px] font-black bg-gray-50 px-2 py-0.5 rounded-full text-gray-400 border border-gray-100 uppercase">{product.safetyRating}</span>
                  </div>
                  <p className="text-sm font-black uppercase truncate">{product.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-black w-6 text-center">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-sm font-black w-20 text-right">${((product.price * quantity) / 100).toFixed(2)}</span>
                <button onClick={() => removeItem(product.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </section>

          {/* Shipping */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <Globe size={14} /> {t('checkout.shippingDestination')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="space-y-2">
                <label htmlFor="checkout-name" className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('checkout.fullName')}</label>
                <input id="checkout-name" type="text" placeholder="Sarah Jenkins" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:ring-1 ring-black transition-all" />
              </div>
              <div className="space-y-2">
                <label htmlFor="checkout-country" className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('checkout.country')}</label>
                <select id="checkout-country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:ring-1 ring-black">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>France</option>
                  <option>South Korea</option>
                  <option>Japan</option>
                  <option>Germany</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="checkout-address" className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('checkout.address')}</label>
                <input id="checkout-address" type="text" placeholder="123 Beauty Lane, Manhattan, NY" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:ring-1 ring-black" />
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <Truck size={14} /> {t('checkout.logistics')}
            </h3>
            <div className="space-y-4">
              <label className={`flex justify-between items-center p-6 rounded-3xl border-2 cursor-pointer transition-all ${shippingMethod === 'dhl' ? 'border-black bg-white' : 'border-gray-50 bg-[#F9F9F9]'}`}>
                <input type="radio" name="shipping" className="hidden" checked={shippingMethod === 'dhl'} onChange={() => setShippingMethod('dhl')} />
                <div className="flex items-center gap-4">
                  <div className="font-bold text-sm text-yellow-500">DHL Express</div>
                  <span className="text-[10px] text-gray-400 font-medium">{t('checkout.businessDays3_5')}</span>
                </div>
                <span className="font-black text-sm">$18.00</span>
              </label>
              <label className={`flex justify-between items-center p-6 rounded-3xl border-2 cursor-pointer transition-all ${shippingMethod === 'ems' ? 'border-black bg-white' : 'border-gray-50 bg-[#F9F9F9]'}`}>
                <input type="radio" name="shipping" className="hidden" checked={shippingMethod === 'ems'} onChange={() => setShippingMethod('ems')} />
                <div className="flex items-center gap-4">
                  <div className="font-bold text-sm text-blue-500">EMS Global</div>
                  <span className="text-[10px] text-gray-400 font-medium">{t('checkout.businessDays7_14')}</span>
                </div>
                <span className="font-black text-sm">$12.00</span>
              </label>
            </div>
          </section>
        </m.div>

        {/* Order Summary */}
        <m.div variants={itemVariants} className="lg:col-span-5">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 lg:sticky lg:top-32 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-gray-300 text-center">{t('checkout.orderSummary')}</h4>

            <div className="space-y-4 mb-10">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase">{product.name}</p>
                    <p className="text-[9px] text-gray-400">{product.brand} x {quantity}</p>
                  </div>
                  <span className="text-sm font-bold">${((product.price * quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50 mb-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>{t('checkout.subtotal')}</span>
                <span>${(subtotal() / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>{t('checkout.shipping')} ({shippingMethod.toUpperCase()})</span>
                <span>${(shippingCost() / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-black uppercase">{t('checkout.total')}</span>
                <span className="text-2xl heading-font italic">${(total() / 100).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!isFormValid || isProcessing}
              className={`w-full py-6 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all mb-4 shadow-xl ${
                isFormValid && !isProcessing
                  ? 'bg-black text-white hover:bg-[#FF4D8D]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? t('checkout.processing') : t('checkout.completePayment')}
            </button>
            {!isFormValid && (
              <p className="text-[9px] text-center text-gray-400 mb-2">{t('validation.fillFormToContinue')}</p>
            )}
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-green-500" /> {t('checkout.secureCheckout')}
            </div>
          </div>
        </m.div>
      </div>
    </m.div>
  );
};

export default GlobalCheckoutView;
