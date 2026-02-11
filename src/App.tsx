import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AnalysisResult, UserPreferences } from '@/types';
import { analyzeKBeauty } from '@/services/geminiService';
import { DEMO_RESULT } from '@/data/demoResult';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import OnboardingView from '@/views/OnboardingView';
import ScanView from '@/views/ScanView';
import AnalyzingView from '@/views/AnalyzingView';
import AnalysisResultView from '@/views/AnalysisResultView';
import GlobalCheckoutView from '@/views/GlobalCheckoutView';
import ExpertMatchingView from '@/views/ExpertMatchingView';
import MethodologyView from '@/views/MethodologyView';
import SettingsView from '@/views/SettingsView';
import MuseBoardView from '@/views/MuseBoardView';

type ScanPhase = 'idle' | 'analyzing' | 'result';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [celebImage, setCelebImage] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({ environment: 'Office', skill: 'Beginner', mood: 'Natural' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const handleAnalyze = async () => {
    if (!userImage || !celebImage) return;
    try {
      setScanPhase('analyzing');
      const res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs);
      setResult(res);
      setScanPhase('result');
    } catch (err) {
      console.error(err);
      setScanPhase('idle');
    }
  };

  const handleDemoMode = () => {
    setScanPhase('analyzing');
    setTimeout(() => {
      setResult(DEMO_RESULT);
      setScanPhase('result');
    }, 2000);
  };

  const handleOnboardingComplete = (p: UserPreferences) => {
    setPrefs(p);
    setIsOnboarded(true);
    navigate('/');
  };

  const handleReset = () => {
    setResult(null);
    setScanPhase('idle');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleResetData = () => {
    setIsOnboarded(false);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-[#0F0F0F] relative selection:bg-[#FF4D8D] selection:text-white">
      <AnimatePresence>
        {!isOnboarded && location.pathname === '/onboarding' && (
          <OnboardingView onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              scanPhase === 'analyzing' ? (
                <AnalyzingView userImage={userImage} />
              ) : scanPhase === 'result' && result ? (
                <AnalysisResultView result={result} onReset={handleReset} onCheckout={handleCheckout} />
              ) : (
                <ScanView
                  userImage={userImage}
                  celebImage={celebImage}
                  isSensitive={isSensitive}
                  onUserImageSelect={setUserImage}
                  onCelebImageSelect={setCelebImage}
                  onToggleSensitive={() => setIsSensitive(!isSensitive)}
                  onAnalyze={handleAnalyze}
                  onDemoMode={handleDemoMode}
                />
              )
            } />
            <Route path="/onboarding" element={
              isOnboarded ? <Navigate to="/" replace /> : <OnboardingView onComplete={handleOnboardingComplete} />
            } />
            <Route path="/checkout" element={<GlobalCheckoutView result={result} />} />
            <Route path="/match" element={<ExpertMatchingView />} />
            <Route path="/methodology" element={<MethodologyView onBookSession={() => navigate('/match')} />} />
            <Route path="/settings" element={
              <SettingsView
                isSensitive={isSensitive}
                onToggleSensitive={() => setIsSensitive(!isSensitive)}
                onResetData={handleResetData}
              />
            } />
            <Route path="/muse" element={<MuseBoardView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default App;
