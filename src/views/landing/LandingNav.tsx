import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/scan', key: 'landing.nav.scan' },
  { href: '/celebs', key: 'landing.nav.celebs' },
  { href: '/shop', key: 'landing.nav.shop' },
  { href: '#pricing', key: 'landing.nav.pricing' },
] as const;

const LandingNav = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <nav
      className={`fixed top-0 w-full z-[150] px-6 lg:px-12 py-5 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <m.div whileHover={{ scale: 1.05 }}>
          <a href="#top" className="flex items-center gap-2">
            <h1 className="text-2xl font-black heading-font tracking-tighter italic uppercase text-balance">
              K-MIRROR <span className="text-[#FF4D8D] not-italic">AI</span>
            </h1>
          </a>
        </m.div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#FF4D8D] transition-colors"
            >
              {t(link.key)}
            </a>
          ))}
          <Link
            to="/scan"
            className="px-6 py-3 bg-[#FF4D8D] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#e8447f] transition-colors"
          >
            {t('landing.nav.tryNow')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-8 shadow-2xl"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-[#FF4D8D] transition-colors"
                >
                  {t(link.key)}
                </a>
              ))}
              <Link
                to="/scan"
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 bg-[#FF4D8D] text-white text-center text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-[#e8447f] transition-colors"
              >
                {t('landing.nav.tryNow')}
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNav;
