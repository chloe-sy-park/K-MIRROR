import { useState } from 'react';
import HeroSection from './landing/HeroSection';
import SherlockSection from './landing/SherlockSection';
import GallerySection from './landing/GallerySection';
import ValuePropSection from './landing/ValuePropSection';
import HowItWorksSection from './landing/HowItWorksSection';
import CelebritySection from './landing/CelebritySection';
import ReviewsSection from './landing/ReviewsSection';
import TransparencySection from './landing/TransparencySection';
import PricingSection from './landing/PricingSection';
import FAQSection from './landing/FAQSection';
import CTASection from './landing/CTASection';
import FloatingCTA from './landing/FloatingCTA';
import CelebModal from './landing/CelebModal';

interface CelebModalState {
  isOpen: boolean;
  celeb: { name: string; image: string; matchPercent: number } | null;
}

const LandingView = () => {
  const [celebModal, setCelebModal] = useState<CelebModalState>({
    isOpen: false,
    celeb: null,
  });

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pt-20">
      <HeroSection />
      <SherlockSection />
      <GallerySection />
      <ValuePropSection />
      <HowItWorksSection />
      <CelebritySection
        onCelebClick={(celeb) => setCelebModal({ isOpen: true, celeb })}
      />
      <ReviewsSection />
      <TransparencySection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FloatingCTA />
      <CelebModal
        isOpen={celebModal.isOpen}
        celeb={celebModal.celeb}
        onClose={() => setCelebModal({ isOpen: false, celeb: null })}
      />
    </div>
  );
};

export default LandingView;
