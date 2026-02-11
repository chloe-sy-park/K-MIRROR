import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, LayoutGrid, MessageCircle, Settings, Menu, X,
  User, Scan, LogOut, ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const navItems = [
  { to: '/', label: 'Scan' },
  { to: '/muse', label: 'Muse Board' },
  { to: '/match', label: 'Match' },
  { to: '/methodology', label: 'Sherlock' },
  { to: '/shop', label: 'Shop' },
  { to: '/settings', label: 'Settings' }
];

const mobileNavItems = [
  { to: '/', label: 'Scan Laboratory', icon: <Camera size={20}/> },
  { to: '/muse', label: 'Muse Board', icon: <LayoutGrid size={20}/> },
  { to: '/match', label: 'Expert Match', icon: <MessageCircle size={20}/> },
  { to: '/methodology', label: 'Sherlock Methodology', icon: <Scan size={20}/> },
  { to: '/shop', label: 'K-Beauty Shop', icon: <ShoppingBag size={20}/> },
  { to: '/settings', label: 'Settings', icon: <Settings size={20}/> }
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, openAuthModal, signOut } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount);

  const isActive = (to: string) => {
    if (to === '/') {
      return location.pathname === '/' || location.pathname === '/checkout';
    }
    return location.pathname === to;
  };

  return (
    <nav className="fixed top-0 w-full z-[150] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-12 py-5 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-black heading-font tracking-tighter italic uppercase text-balance">
              K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
            </h1>
          </Link>
        </motion.div>

        <div className="hidden lg:flex items-center gap-12">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() =>
                `text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-[#FF4D8D] ${
                  isActive(item.to) ? 'text-black border-b-2 border-[#FF4D8D] pb-1' : 'text-gray-400'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/checkout" className="relative p-2 text-gray-400 hover:text-black transition-colors">
            <ShoppingBag size={18} />
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4D8D] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {cartCount()}
              </span>
            )}
          </Link>
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-[#FF4D8D] flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-white text-xs font-black uppercase">
                  {user.email?.charAt(0) ?? 'U'}
                </span>
              </motion.div>
              <button onClick={signOut} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={openAuthModal}
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <User size={18} className="text-gray-400" />
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-8 shadow-2xl"
          >
            <div className="flex flex-col gap-10">
              {mobileNavItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={() =>
                    `flex items-center gap-6 text-sm font-black uppercase tracking-widest ${
                      isActive(item.to) ? 'text-[#FF4D8D]' : 'text-gray-400'
                    }`
                  }
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
