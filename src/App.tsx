import { useEffect } from 'react';
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

import OnboardingView from '@/views/OnboardingView';
import ScanView from '@/views/ScanView';
import AnalyzingView from '@/views/AnalyzingView';
import AnalysisResultView from '@/views/AnalysisResultView';
import GlobalCheckoutView from '@/views/GlobalCheckoutView';
import ExpertMatchingView from '@/views/ExpertMatchingView';
import MethodologyView from '@/views/MethodologyView';
import SettingsView from '@/views/SettingsView';
import MuseBoardView from '@/views/MuseBoardView';
import ShopView from '@/views/ShopView';
import ProductDetailView from '@/views/ProductDetailView';
import OrdersView from '@/views/OrdersView';
import CelebGalleryView from '@/views/CelebGalleryView';

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
        </ErrorBoundary>
      </main>

      <Footer />
      <ErrorToast message={error} onDismiss={clearError} />
      <AuthModal />
    </div>
  );
};

export default App;
