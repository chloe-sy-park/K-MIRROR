import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/scanStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorToast from '@/components/ui/ErrorToast';
import AuthModal from '@/components/ui/AuthModal';

// Lazy-loaded views for code splitting
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

const LazyFallback = () => (
  <div className="flex items-center justify-center py-32">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF4D8D] rounded-full animate-spin" />
  </div>
);

const ScanRoute = () => {
  const { phase, result } = useScanStore();

  if (phase === 'analyzing') return <AnalyzingView />;
  if (phase === 'result' && result) return <AnalysisResultView />;
  return <ScanView />;
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-[#0F0F0F] relative selection:bg-[#FF4D8D] selection:text-white">
      <AnimatePresence>
        {!isOnboarded && location.pathname === '/onboarding' && (
          <OnboardingView />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen">
        <ErrorBoundary inline>
          <Suspense fallback={<LazyFallback />}>
          <Routes location={location}>
            <Route path="/" element={<ScanRoute />} />
            <Route path="/onboarding" element={
              isOnboarded ? <Navigate to="/" replace /> : <OnboardingView />
            } />
            <Route path="/checkout" element={<GlobalCheckoutView />} />
            <Route path="/match" element={<ExpertMatchingView />} />
            <Route path="/methodology" element={<MethodologyView onBookSession={() => navigate('/match')} />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/muse" element={<MuseBoardView />} />
            <Route path="/shop" element={<ShopView />} />
            <Route path="/shop/:id" element={<ProductDetailView />} />
            <Route path="/orders" element={<OrdersView />} />
            <Route path="/celebs" element={<CelebGalleryView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <ErrorToast message={error} onDismiss={clearError} />
      <AuthModal />
    </div>
  );
};

export default App;
