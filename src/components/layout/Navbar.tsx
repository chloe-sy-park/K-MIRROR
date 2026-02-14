import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import {
  Camera, LayoutGrid, MessageCircle, Settings, Menu, X,
  User, Scan, LogOut, ShoppingBag, Star
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const Navbar = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, openAuthModal, signOut } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount);

  const navItems = [
    { to: '/scan', label: t('nav.scan') },
    { to: '/muse', label: t('nav.museBoard') },
    { to: '/match', label: t('nav.match') },
    { to: '/methodology', label: t('nav.sherlock') },
    { to: '/celebs', label: t('nav.celebs') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/settings', label: t('nav.settings') }
  ];

  const mobileNavItems = [
    { to: '/scan', label: t('nav.scanLab'), icon: <Camera size={20}/> },
    { to: '/muse', label: t('nav.museBoard'), icon: <LayoutGrid size={20}/> },
    { to: '/match', label: t('nav.expertMatch'), icon: <MessageCircle size={20}/> },
    { to: '/methodology', label: t('nav.sherlockMethod'), icon: <Scan size={20}/> },
    { to: '/celebs', label: t('nav.celebGallery'), icon: <Star size={20}/> },
    { to: '/shop', label: t('nav.beautyShop'), icon: <ShoppingBag size={20}/> },
    { to: '/settings', label: t('nav.settings'), icon: <Settings size={20}/> }
  ];

  const isActive = (to: string) => {
    if (to === '/scan') {
      return location.pathname === '/scan' || location.pathname === '/checkout';
    }
    return location.pathname === to;
  };

  return (
    <nav className="fixed top-0 w-full z-[150] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-12 py-5 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <m.div whileHover={{ scale: 1.05 }}>
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-black heading-font tracking-tighter italic uppercase text-balance">
              K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
            </h1>
          </Link>
        </m.div>

        <div className="hidden lg:flex items-center gap-12">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-current={isActive(item.to) ? 'page' : undefined}
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
          <Link to="/checkout" aria-label={`${t('a11y.shoppingCart')}${cartCount() > 0 ? `, ${cartCount()} ${t('common.items')}` : ''}`} className="relative p-2 text-gray-400 hover:text-black transition-colors">
            <ShoppingBag size={18} />
            {cartCount() > 0 && (
              <span aria-hidden="true" className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4D8D] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {cartCount()}
              </span>
            )}
          </Link>
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen} aria-label={isMenuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <m.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-[#FF4D8D] flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-white text-xs font-black uppercase">
                  {user.email?.charAt(0) ?? 'U'}
                </span>
              </m.div>
              <button onClick={signOut} aria-label={t('a11y.signOut')} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <m.button
              whileHover={{ scale: 1.1 }}
              onClick={openAuthModal}
              aria-label={t('a11y.signIn')}
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <User size={18} className="text-gray-400" />
            </m.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <m.div
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
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
