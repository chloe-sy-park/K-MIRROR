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
      {/* 감성 훅 — 즉각적 관심 유도 */}
      <HeroSection />
      {/* 소셜 프루프 — 셀럽 매칭으로 신뢰 구축 */}
      <CelebritySection
        onCelebClick={(celeb) => setCelebModal({ isOpen: true, celeb })}
      />
      {/* 시각적 증거 — 실제 변환 사례 */}
      <GallerySection />
      {/* 커뮤니티 — 사용자 리뷰로 신뢰 강화 */}
      <ReviewsSection />
      {/* 가치 제안 — 핵심 차별점 */}
      <ValuePropSection />
      {/* 사용 방법 — 실행 단계 안내 */}
      <HowItWorksSection />
      {/* 기술 신뢰 — AI 분석의 과학적 근거 */}
      <SherlockSection />
      {/* 투명성 — 성분 분석 */}
      <TransparencySection />
      {/* 가격 — 전환 유도 */}
      <PricingSection />
      {/* FAQ — 이탈 방지 */}
      <FAQSection />
      {/* 최종 CTA — 행동 촉구 */}
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
