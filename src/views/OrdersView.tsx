import { motion } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { containerVariants, itemVariants } from '@/constants/animations';
import { useCartStore } from '@/store/cartStore';

const STATUS_CONFIG = {
  pending: { icon: <Clock size={14} />, label: 'Pending', color: 'text-yellow-500 bg-yellow-50' },
  paid: { icon: <CheckCircle size={14} />, label: 'Paid', color: 'text-green-500 bg-green-50' },
  shipped: { icon: <Truck size={14} />, label: 'Shipped', color: 'text-blue-500 bg-blue-50' },
  delivered: { icon: <CheckCircle size={14} />, label: 'Delivered', color: 'text-gray-500 bg-gray-50' },
};

const OrdersView = () => {
  const navigate = useNavigate();
  const orders = useCartStore((s) => s.orders);

  if (orders.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center space-y-8">
        <Package size={64} className="mx-auto text-gray-200" />
        <h2 className="text-3xl heading-font italic uppercase text-gray-300">No Orders Yet</h2>
        <p className="text-gray-400 text-sm">Start shopping to see your order history here.</p>
        <button onClick={() => navigate('/shop')} className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all">
          <ShoppingBag size={14} className="inline mr-2" /> Browse Shop
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl mx-auto space-y-16 pb-20">
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-[50px] lg:text-[70px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
          ORDER <span className="italic text-[#FF4D8D]">HISTORY</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status];
          return (
            <div key={order.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-[10px] text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold">{item.product.name}</span>
                      <span className="text-gray-400 text-xs ml-2">{item.product.brand} x {item.quantity}</span>
                    </div>
                    <span className="font-bold">${((item.product.price * item.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {order.shippingMethod.toUpperCase()} Shipping
                </span>
                <span className="text-lg font-black">${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default OrdersView;
