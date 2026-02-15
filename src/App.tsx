import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/scanStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorToast from '@/components/ui/ErrorToast';
import AuthModal from '@/components/ui/AuthModal';
import CookieConsentBanner from '@/components/ui/CookieConsentBanner';

// Lazy-loaded views for code splitting
const LandingView = lazy(() => import('@/views/LandingView'));
const OnboardingView = lazy(() => import('@/views/OnboardingView'));
const ScanView = lazy(() => import('@/views/ScanView'));
const AnalyzingView = lazy(() => import('@/views/AnalyzingView'));
const AnalysisResultView = lazy(() => import('@/views/AnalysisResultView'));
const GlobalCheckoutView = lazy(() => import('@/views/GlobalCheckoutView'));
const ExpertMatchingView = lazy(() => import('@/views/ExpertMatchingView'));
const MethodologyView = lazy(() => import('@/views/MethodologyView'));
const SettingsView = lazy(() => import('@/views/SettingsView'));
const MuseBoardView = lazy(() => import('@/views/MuseBoardView'));
const ShopView = lazy(() => import('@/views/ShopView'));
const ProductDetailView = lazy(() => import('@/views/ProductDetailView'));
const OrdersView = lazy(() => import('@/views/OrdersView'));
const CelebGalleryView = lazy(() => import('@/views/CelebGalleryView'));
const CheckoutSuccessView = lazy(() => import('@/views/CheckoutSuccessView'));
const ChooseVibeView = lazy(() => import('@/views/ChooseVibeView'));
const KGlowResultView = lazy(() => import('@/views/KGlowResultView'));
const PrivacyPolicyView = lazy(() => import('@/views/PrivacyPolicyView'));
const TermsView = lazy(() => import('@/views/TermsView'));

const LazyFallback = () => (
  <div className="flex items-center justify-center py-32">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF4D8D] rounded-full animate-spin" />
  </div>
);

const ScanRoute = () => {
  const { phase, result } = useScanStore();
  const nav = useNavigate();

  // Redirect to K-GLOW Card view when analysis completes
  useEffect(() => {
    if (phase === 'result' && result) {
      nav('/kglow', { replace: true });
    }
  }, [phase, result, nav]);

  if (phase === 'analyzing') return <AnalyzingView />;
  if (phase === 'result' && result) return <AnalysisResultView />;
  return <ScanView />;
};

const ROUTE_TITLES: Record<string, string> = {
  '/': 'K-MIRROR AI',
  '/scan': 'Scan',
  '/onboarding': 'Onboarding',
  '/checkout': 'Checkout',
  '/checkout/success': 'Order Confirmed',
  '/match': 'Expert Match',
  '/methodology': 'Sherlock Methodology',
  '/settings': 'Settings',
  '/muse': 'Muse Board',
  '/shop': 'K-Beauty Shop',
  '/orders': 'Orders',
  '/celebs': 'K-Celeb Gallery',
  '/choose-vibe': 'Choose Your Vibe',
  '/kglow': 'K-GLOW Card',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnboarded = useSettingsStore((s) => s.isOnboarded);
  const { error, clearError } = useScanStore();
  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Update document.title on route change
  useEffect(() => {
    const path = location.pathname;
    const pageTitle = ROUTE_TITLES[path]
      ?? (path.startsWith('/shop/') ? 'Product Details' : null);
    document.title = pageTitle
      ? `${pageTitle} | K-MIRROR AI`
      : 'K-MIRROR AI | Global K-Beauty Stylist';
  }, [location.pathname]);

  return (
    <LazyMotion features={domAnimation} strict>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#FF4D8D] focus:text-white focus:rounded-lg focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D8D]"
    >
      Skip to content
    </a>
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-[#0F0F0F] relative selection:bg-[#FF4D8D] selection:text-white">
      <AnimatePresence>
        {!isOnboarded && location.pathname === '/onboarding' && (
          <OnboardingView />
        )}
      </AnimatePresence>

      {!['/', '/choose-vibe', '/kglow'].includes(location.pathname) && <Navbar />}

      <main id="main-content" tabIndex={-1} className={
        ['/', '/choose-vibe', '/kglow'].includes(location.pathname)
          ? 'outline-none'
          : 'flex-1 pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen outline-none'
      }>
        <ErrorBoundary inline>
          <Suspense fallback={<LazyFallback />}>
          <Routes location={location}>
            <Route path="/" element={<LandingView />} />
            <Route path="/choose-vibe" element={<ChooseVibeView />} />
            <Route path="/scan" element={<ScanRoute />} />
            <Route path="/kglow" element={<KGlowResultView />} />
            <Route path="/onboarding" element={
              isOnboarded ? <Navigate to="/scan" replace /> : <OnboardingView />
            } />
            <Route path="/checkout" element={<GlobalCheckoutView />} />
            <Route path="/checkout/success" element={<CheckoutSuccessView />} />
            <Route path="/match" element={<ExpertMatchingView />} />
            <Route path="/methodology" element={<MethodologyView onBookSession={() => navigate('/match')} />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/muse" element={<MuseBoardView />} />
            <Route path="/shop" element={<ShopView />} />
            <Route path="/shop/:id" element={<ProductDetailView />} />
            <Route path="/orders" element={<OrdersView />} />
            <Route path="/celebs" element={<CelebGalleryView />} />
            <Route path="/privacy" element={<PrivacyPolicyView />} />
            <Route path="/terms" element={<TermsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {!['/', '/choose-vibe', '/kglow'].includes(location.pathname) && <Footer />}
      <ErrorToast message={error} onDismiss={clearError} />
      <AuthModal />
      <CookieConsentBanner />
    </div>
    </LazyMotion>
  );
};

export default App;
