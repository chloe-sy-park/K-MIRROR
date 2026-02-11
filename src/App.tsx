import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/scanStore';
import { useSettingsStore } from '@/store/settingsStore';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ErrorToast from '@/components/ui/ErrorToast';

import OnboardingView from '@/views/OnboardingView';
import ScanView from '@/views/ScanView';
import AnalyzingView from '@/views/AnalyzingView';
import AnalysisResultView from '@/views/AnalysisResultView';
import GlobalCheckoutView from '@/views/GlobalCheckoutView';
import ExpertMatchingView from '@/views/ExpertMatchingView';
import MethodologyView from '@/views/MethodologyView';
import SettingsView from '@/views/SettingsView';
import MuseBoardView from '@/views/MuseBoardView';

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

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-[#0F0F0F] relative selection:bg-[#FF4D8D] selection:text-white">
      <AnimatePresence>
        {!isOnboarded && location.pathname === '/onboarding' && (
          <OnboardingView />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<ScanRoute />} />
            <Route path="/onboarding" element={
              isOnboarded ? <Navigate to="/" replace /> : <OnboardingView />
            } />
            <Route path="/checkout" element={<GlobalCheckoutView />} />
            <Route path="/match" element={<ExpertMatchingView />} />
            <Route path="/methodology" element={<MethodologyView onBookSession={() => navigate('/match')} />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/muse" element={<MuseBoardView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <ErrorToast message={error} onDismiss={clearError} />
    </div>
  );
};

export default App;
