# K-MIRROR Component & View Patterns

> 컴포넌트 인벤토리, 새 뷰 추가 절차, 애니메이션/스타일링 컨벤션 정의.
> UI 작업 전에 반드시 참조. 디자인 토큰은 [01-design-system.md](./01-design-system.md) 참조.
> 관련 문서: [07-app-state-flow.md](./07-app-state-flow.md)

---

## 1. 현재 컴포넌트 인벤토리

컴포넌트가 `components/`, `views/` 디렉토리로 분리되어 있다.
뷰는 `App.tsx`에서 `React.lazy()`로 동적 로딩된다.

### 1-1. UI Components (`components/ui/`)

| 컴포넌트 | 파일 | Props | 용도 | 접근성 |
|----------|------|-------|------|--------|
| `Toggle` | `Toggle.tsx` | `checked`, `onChange`, `label?` | on/off 스위치 | `role="switch"`, `aria-checked`, 키보드 Enter/Space |
| `LuxuryFileUpload` | `LuxuryFileUpload.tsx` | `label`, `secondaryLabel`, `preview`, `onImageSelect(base64, mimeType)` | 이미지 업로드 + 리사이즈 | `aria-label`, `sr-only` input |
| `BiometricConsentModal` | `BiometricConsentModal.tsx` | `isOpen`, `onAccept`, `onDecline` | 생체정보 동의 모달 | `role="dialog"`, `aria-modal`, `useFocusTrap` |
| `CookieConsentBanner` | `CookieConsentBanner.tsx` | — | 쿠키 동의 배너 | — |
| `ErrorToast` | `ErrorToast.tsx` | `message`, `onDismiss` | 에러 알림 토스트 | — |
| `AuthModal` | `AuthModal.tsx` | — (전역 스토어 사용) | 인증 모달 | `role="dialog"`, `aria-modal`, `useFocusTrap` (포커스 트랩 + 복원) |

### 1-2. Layout Components (`components/layout/`)

| 컴포넌트 | 파일 | 용도 | 접근성 |
|----------|------|------|--------|
| `Navbar` | `Navbar.tsx` | 반응형 네비게이션 | `aria-current="page"`, `aria-expanded`, `aria-label` |
| `Footer` | `Footer.tsx` | 푸터 네비게이션 | 아이콘 버튼 `aria-label` |

### 1-3. View Components (`views/`) — React.lazy

| 컴포넌트 | 라우트 | 접근성 특징 |
|----------|--------|------------|
| `ScanView` | `/` | 이미지 업로드, 셀럽 선택, Neural Scan |
| `AnalysisResultView` | `/` (phase=result) | AI 분석 결과 |
| `CelebGalleryView` | `/celebs` | `role="radiogroup"`, `role="radio"`, 키보드 Enter |
| `ExpertMatchingView` | `/match` | 전문가 매칭 |
| `OnboardingView` | `/onboarding` | `role="radiogroup"`, `role="radio"`, `aria-checked` |
| `MethodologyView` | `/methodology` | Sherlock 방법론 |
| `MuseBoardView` | `/muse` | Muse Board + 빈 상태 CTA |
| `SettingsView` | `/settings` | Toggle `label` prop |
| `ShopView` | `/shop` | 제품 목록 |
| `ProductDetailView` | `/shop/:id` | 제품 상세 |
| `GlobalCheckoutView` | `/checkout` | 폼 바인딩 + 유효성 + `htmlFor` |
| `OrdersView` | `/orders` | 주문 내역 |
| `NotFoundView` | `*` | 404 |

### 1-4. Data Constants (`data/`)

| 상수 | 파일 | 용도 |
|------|------|------|
| `DEMO_RESULT` | `demoResult.ts` | Demo mode용 `AnalysisResult` |
| `CELEB_GALLERY` | `celebGallery.ts` | K-셀럽 12명 프로필 |
| `EXPERTS` | `experts.ts` | 전문가 4명 프로필 |
| `PRODUCT_CATALOG` | `productCatalog.ts` | 제품 카탈로그 |

---

## 2. 새 뷰 추가 4단계

새로운 전체 페이지 뷰를 추가하는 절차:

### Step 1: 뷰 파일 생성

```tsx
// src/views/CommunityView.tsx
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/constants/animations';

const CommunityView = () => {
  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-20 pb-20"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-[50px] lg:text-[80px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
          COMMUNITY <span className="italic text-[#FF4D8D]">HUB</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
          Connect with the Community
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {/* 콘텐츠 */}
      </motion.div>
    </motion.div>
  );
};

export default CommunityView;
```

### Step 2: App.tsx에 lazy import + Route 추가

```tsx
// App.tsx
const CommunityView = lazy(() => import('@/views/CommunityView'));

// Routes 내부에 추가
<Route path="/community" element={<CommunityView />} />
```

### Step 3: 네비게이션에 추가

```tsx
// Navbar.tsx — NavLink 배열에 추가
{ to: '/community', label: 'Community', icon: <MessageCircle size={20} /> }
```

### Step 4: 상태 연결 (필요 시)

- Zustand 스토어에서 `useXxxStore()` 훅으로 상태 접근
- `useNavigate()`로 라우트 이동
- Props 최소화 — 스토어 직접 접근 권장

---

## 3. 애니메이션 컨벤션

### 3-1. 페이지 진입 애니메이션

모든 뷰의 루트 요소에 적용:

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={containerVariants}  // staggerChildren: 0.1, delayChildren: 0.1
>
  <motion.div variants={itemVariants}>  // y: 30→0, opacity: 0→1, duration: 1
    {/* 각 섹션 */}
  </motion.div>
</motion.div>
```

결과: 자식 요소들이 0.1초 간격으로 아래에서 위로 페이드인.

### 3-2. 전역 Variants (`constants/animations.ts`)

| Variant | 설정 | 용도 |
|---------|------|------|
| `containerVariants` | `staggerChildren: 0.1`, `delayChildren: 0.1` | 페이지/섹션 컨테이너 |
| `itemVariants` | `y: 30→0`, `opacity: 0→1`, `duration: 1`, `ease: [0.16, 1, 0.3, 1]` | 개별 섹션/카드 |
| `pulseVariants` | `scale: 1→1.05`, `opacity: 0.8→1`, `duration: 2`, `repeat: Infinity` | 대기 상태 아이콘 |

### 3-3. Hover 인터랙션

| 대상 | 코드 | 설명 |
|------|------|------|
| 카드 | `whileHover={{ y: -5 }}` | 살짝 떠오름 |
| 카드 (대안) | `whileHover={{ scale: 1.02 }}` | 약간 확대 |
| CTA 버튼 | `whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}` | 확대 + 클릭 축소 |
| 로고 | `whileHover={{ scale: 1.05 }}` | 확대 |
| 파일 업로드 | `whileHover={{ y: -5 }}` + spring | 떠오름 + 탄성 |

### 3-4. Spring 설정

| 용도 | 설정 | 코드 위치 |
|------|------|----------|
| Toggle 전환 | `stiffness: 500, damping: 30` | `Toggle.tsx` |
| Card hover | `stiffness: 400, damping: 17` | 각 뷰 |

### 3-5. 페이지 전환

```tsx
// App.tsx
<AnimatePresence mode="wait">
  <ErrorBoundary inline>
    <Suspense fallback={<LazyFallback />}>
      <Routes location={location} key={location.pathname}>
        {/* React.lazy 뷰 라우트 */}
      </Routes>
    </Suspense>
  </ErrorBoundary>
</AnimatePresence>
```

- `mode="wait"`: 이전 뷰가 완전히 사라진 후 다음 뷰 등장
- `Suspense`: lazy 로딩 중 `LazyFallback` 스피너 표시
- exit 애니메이션: 보통 `{ opacity: 0 }` (명시하지 않으면 기본값)

### 3-6. CSS 애니메이션 (비-Framer)

| 이름 | 정의 | 용도 |
|------|------|------|
| `@keyframes scan` | `top: 0%→100%`, opacity fade | ANALYZING 화면의 스캔 라인 |
| `.scanning::after` | 위 keyframe 적용 | 분석 중 이미지 위 핑크 스캔 라인 |
| `animate-pulse` | Tailwind 기본 | "Decoding DNA..." 텍스트 |

---

## 4. 스타일링 컨벤션

### 4-1. Tailwind vs 커스텀 CSS

| 사용처 | 방식 | 이유 |
|--------|------|------|
| 대부분의 스타일링 | Tailwind 유틸리티 클래스 | 기본 |
| 폰트 패밀리 | `.heading-font` (index.html `<style>`) | Tailwind에 폰트 토큰 미등록 |
| 카드 hover 효과 | `.luxury-card` (index.html `<style>`) | cubic-bezier 전환 |
| 버튼 기본 스타일 | `.btn-luxury` (index.html `<style>`) | translateY hover |
| 그라데이션 | `.accent-gradient` (index.html `<style>`) | 재사용 편의 |
| 스캔 라인 | `.scanning` (index.html `<style>`) | keyframe 애니메이션 |

**규칙:** Tailwind로 표현 가능하면 Tailwind 사용. keyframe 애니메이션, font-family 같이 Tailwind로 불가한 것만 커스텀 CSS.

### 4-2. 색상 사용 패턴

```
브랜드 액센트:  text-[#FF4D8D]  /  bg-[#FF4D8D]
메인 텍스트:    text-[#0F0F0F]  (body 기본)
서브 라벨:     text-gray-400
마이크로 라벨: text-gray-300
플레이스홀더:  text-gray-200
배경 (밝음):   bg-white > bg-gray-50 > bg-[#F9F9F9]
배경 (어둠):   bg-black
```

### 4-3. 타이포그래피 패턴 (코드 예시)

**카테고리 라벨 (핑크)**
```html
<p className="text-[10px] font-black tracking-[0.5em] text-[#FF4D8D] uppercase italic mb-6">
```

**섹션 제목**
```html
<h2 className="text-5xl font-black heading-font uppercase tracking-tighter italic">
```

**서브 라벨**
```html
<p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
```

**마이크로 라벨**
```html
<p className="text-[9px] font-black uppercase tracking-widest text-gray-300">
```

**나노 라벨 (뱃지)**
```html
<span className="text-[8px] font-black uppercase">
```

### 4-4. Border Radius 패턴

```
풀섹션 블록:  rounded-[4rem] ~ rounded-[6rem]
주요 카드:    rounded-[3rem] ~ rounded-[3.5rem]
업로드 영역:  rounded-[2.5rem]
서브 요소:    rounded-2xl ~ rounded-3xl
버튼/뱃지:   rounded-full
절대 금지:    rounded-none (직각 모서리)
```

### 4-5. 간격 패턴

```
대 섹션 간격:  space-y-32 ~ gap-40
중 섹션 간격:  space-y-16 ~ space-y-20
소 섹션 간격:  space-y-10 ~ space-y-12
요소 간격:    space-y-6 ~ gap-8
타이트 간격:  space-y-2 ~ gap-4
```

---

## 5. 컴포넌트 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| View 컴포넌트 | `[Name]View` | `OnboardingView`, `AnalysisResultView` |
| Helper 컴포넌트 | 서술적 명사 | `Toggle`, `LuxuryFileUpload` |
| 함수명 | PascalCase (컴포넌트) | `SherlockProportionVisualizer` |
| 이벤트 핸들러 | `handle[Action]` | `handleAnalyze`, `handleDemoMode` |
| 콜백 props | `on[Action]` | `onComplete`, `onReset`, `onCheckout` |
| 상수 | UPPER_SNAKE_CASE | `DEMO_RESULT`, `TRANSFORMATION_SAMPLES` |
| 형식 | Arrow function | `const App = () => { ... }` |

### 추가 규칙

- class 컴포넌트 없음 — 모두 function 컴포넌트
- `forwardRef`, HOC 없음
- Props 타입은 인라인 정의 (공유 타입은 `types.ts`)
- `React.FC` 사용은 선택적 (일부 뷰만 `React.FC<Props>` 사용)

---

## 6. 섹션 헤더 패턴

대부분의 뷰는 동일한 헤더 구조를 따른다:

```tsx
{/* 1. 카테고리 라벨 */}
<p className="text-[10px] font-black tracking-[0.5em] text-[#FF4D8D] uppercase italic mb-6">
  Technical Philosophy
</p>

{/* 2. 메인 제목 */}
<h2 className="text-5xl lg:text-7xl font-black heading-font uppercase tracking-tighter italic leading-none">
  Sherlock<span className="text-gray-300">.</span>
</h2>

{/* 3. 서브타이틀 (선택) */}
<p className="text-gray-400 italic uppercase tracking-wider text-sm mt-4">
  "Beyond face shape. Beyond categories."
</p>
```

이 3단 구조(핑크 라벨 → 대형 제목 → 이탤릭 서브)를 모든 새 뷰에서 유지해야 한다.

---

## 7. 카드 패턴

### 표준 카드

```tsx
<motion.div
  variants={itemVariants}
  whileHover={{ y: -5 }}
  className="bg-white border border-gray-100 rounded-[3rem] p-10 hover:shadow-2xl transition-all"
>
  {/* 내부 라벨 */}
  <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-4">Category</p>
  {/* 내용 */}
</motion.div>
```

### 다크 카드 (강조)

```tsx
<div className="bg-black text-white rounded-[3rem] p-10 relative overflow-hidden">
  {/* 앰비언트 라이트 */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D8D]/10 blur-[100px] rounded-full" />
  {/* 내용 */}
</div>
```

### 카드 내부 구분선

```tsx
<div className="border-b border-gray-100 pb-4 mb-4">
  {/* 상단 영역 */}
</div>
```

---

## 8. 접근성 (a11y) 패턴

### 8-1. 토글/스위치

```tsx
<button
  role="switch"
  aria-checked={checked}
  aria-label={label}
  onClick={onChange}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange()}
  className="... focus-visible:ring-2 focus-visible:ring-[#FF4D8D] outline-none"
>
```

### 8-2. 필터 그룹 (라디오)

```tsx
<div role="radiogroup" aria-label="장르 필터">
  <button role="radio" aria-checked={selected === 'K-Drama'}>K-Drama</button>
  <button role="radio" aria-checked={selected === 'K-Pop'}>K-Pop</button>
</div>
```

### 8-3. 모달/다이얼로그 (useFocusTrap 훅)

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

const Modal = ({ isOpen, onClose }) => {
  const { dialogRef, handleKeyDown } = useFocusTrap({ isOpen, onEscape: onClose });

  return (
    <div onKeyDown={handleKeyDown}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Dialog">
        {/* 첫 번째 focusable 요소에 자동 포커스 */}
        <button aria-label="Close dialog" onClick={onClose}>×</button>
        {/* Tab 키로 순환, Escape로 닫기, 닫힐 때 트리거 요소로 포커스 복원 */}
      </div>
    </div>
  );
};
```

`useFocusTrap` 훅 기능:
- **자동 포커스**: 모달 열릴 때 첫 번째 focusable 요소에 포커스
- **포커스 트랩**: Tab/Shift+Tab으로 모달 내부 순환 (빠져나가지 않음)
- **포커스 복원**: 모달 닫힐 때 열기 전 포커스 위치로 복원
- **Escape 키**: `onEscape` 콜백 실행

적용된 컴포넌트: `AuthModal`, `BiometricConsentModal`

### 8-4. 인터랙티브 카드

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`Select ${celeb.name}`}
  onClick={handleClick}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
  className="... focus-visible:ring-2 focus-visible:ring-[#FF4D8D] outline-none"
>
```

### 8-5. 네비게이션

```tsx
<NavLink to="/shop" className={({ isActive }) => isActive ? 'active' : ''}>
  {({ isActive }) => <span aria-current={isActive ? 'page' : undefined}>Shop</span>}
</NavLink>
```

### 8-6. 포커스 스타일

```
❌ 금지: focus:outline-none (포커스 인디케이터 제거)
✅ 권장: focus-visible:ring-2 focus-visible:ring-[#FF4D8D] focus-visible:ring-offset-2 outline-none
```

- `focus-visible`: 키보드 사용자에게만 포커스 링 표시 (마우스 클릭 시 미표시)
- 브랜드 핑크(`#FF4D8D`) 포커스 링으로 일관성 유지
