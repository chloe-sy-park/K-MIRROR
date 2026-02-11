import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppStep, AnalysisResult, UserPreferences } from '@/types';
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

const App = () => {
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [celebImage, setCelebImage] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({ environment: 'Office', skill: 'Beginner', mood: 'Natural' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!userImage || !celebImage) return;
    try {
      setStep(AppStep.ANALYZING);
      const res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs);
      setResult(res);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setStep(AppStep.IDLE);
    }
  };

  const handleDemoMode = () => {
    setStep(AppStep.ANALYZING);
    setTimeout(() => {
      setResult(DEMO_RESULT);
      setStep(AppStep.RESULT);
    }, 2000);
  };

  const handleOnboardingComplete = (p: UserPreferences) => {
    setPrefs(p);
    setStep(AppStep.IDLE);
  };

  const handleReset = () => {
    setResult(null);
    setStep(AppStep.IDLE);
  };

  const handleCheckout = () => {
    setStep(AppStep.CHECKOUT);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-[#0F0F0F] relative selection:bg-[#FF4D8D] selection:text-white">
      <AnimatePresence>
        {step === AppStep.ONBOARDING && <OnboardingView onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <Navbar
        step={step}
        isMenuOpen={isMenuOpen}
        onSetStep={setStep}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <main className="flex-1 pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen">
        <AnimatePresence mode="wait">
          {step === AppStep.IDLE && (
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
          )}

          {step === AppStep.ANALYZING && (
            <AnalyzingView userImage={userImage} />
          )}

          {step === AppStep.RESULT && result && (
            <AnalysisResultView result={result} onReset={handleReset} onCheckout={handleCheckout} />
          )}

          {step === AppStep.CHECKOUT && (
            <GlobalCheckoutView result={result} />
          )}

          {step === AppStep.STYLIST && (
            <ExpertMatchingView />
          )}

          {step === AppStep.METHODOLOGY && (
            <MethodologyView onBookSession={() => setStep(AppStep.STYLIST)} />
          )}

          {step === AppStep.SETTINGS && (
            <SettingsView
              isSensitive={isSensitive}
              onToggleSensitive={() => setIsSensitive(!isSensitive)}
              onResetData={() => setStep(AppStep.ONBOARDING)}
            />
          )}

          {step === AppStep.MUSEBOARD && (
            <MuseBoardView />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default App;
