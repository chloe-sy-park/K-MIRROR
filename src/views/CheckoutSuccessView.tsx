import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getOrderBySessionId } from '@/services/orderService';
import type { Order } from '@/types';

const CheckoutSuccessView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);
  const [order, setOrder] = useState<Order | null>(null);
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    clearCart();

    if (sessionId) {
      getOrderBySessionId(sessionId)
        .then((o) => setOrder(o))
        .finally(() => setLoading(false));
    }
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF4D8D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-32 text-center space-y-8"
    >
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
        <Check size={32} className="text-green-500" />
      </div>
      <h2 className="text-4xl heading-font italic uppercase">{t('checkout.orderPlaced')}</h2>
      <p className="text-gray-400 text-sm">{t('checkout.orderPlacedDesc')}</p>

      {order && (
        <div className="bg-gray-50 rounded-[2.5rem] p-8 text-left space-y-4 mx-auto max-w-sm">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Order</span>
            <span>#{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between text-sm font-black">
            <span>{t('checkout.total')}</span>
            <span>${(order.total / 100).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-300">
            <Package size={12} />
            <span>{order.shippingMethod.toUpperCase()} — {order.items.length} {t('checkout.items')}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all"
        >
          {t('common.newScan')}
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="px-8 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <ShoppingBag size={14} /> {t('checkout.viewOrders')}
        </button>
      </div>
    </m.div>
  );
};

export default CheckoutSuccessView;
