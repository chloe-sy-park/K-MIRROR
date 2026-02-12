# K-MIRROR Component & View Patterns

> 컴포넌트 인벤토리, 새 뷰 추가 절차, 애니메이션/스타일링 컨벤션 정의.
> UI 작업 전에 반드시 참조. 디자인 토큰은 [01-design-system.md](./01-design-system.md) 참조.
> 관련 문서: [07-app-state-flow.md](./07-app-state-flow.md)

---

## 1. 현재 컴포넌트 인벤토리

모든 컴포넌트가 `App.tsx` 단일 파일에 존재한다.

### 1-1. Helper Components (재사용 가능)

| 컴포넌트 | 라인 | Props | 용도 |
|----------|------|-------|------|
| `Toggle` | 56-67 | `checked: boolean`, `onChange: () => void` | on/off 스위치 (spring 애니메이션) |
| `LuxuryFileUpload` | 69-115 | `label`, `secondaryLabel`, `preview`, `onImageSelect` | 이미지 업로드 + 미리보기 |
| `SherlockProportionVisualizer` | 119-173 | `proportions: any` | 얼굴 비율 시각화 다이어그램 |

### 1-2. View Components (전체 페이지)

| 컴포넌트 | 라인 | AppStep | Props |
|----------|------|---------|-------|
| `MethodologyView` | 178-327 | `METHODOLOGY` | `onBookSession: () => void` |
| `OnboardingView` | 329-411 | `ONBOARDING` | `onComplete: (prefs: UserPreferences) => void` |
| `ExpertMatchingView` | 413-453 | `STYLIST` | (없음) |
| `GlobalCheckoutView` | 519-631 | `CHECKOUT` | `result: AnalysisResult \| null` |
| `AnalysisResultView` | 633-851 | `RESULT` | `result`, `onReset`, `onCheckout` |

### 1-3. Inline Views (App JSX 내부에 직접 정의)

| 뷰 | 라인 | AppStep | 특징 |
|----|------|---------|------|
| IDLE (스캔 페이지) | 978-1027 | `IDLE` | 이미지 업로드, 감도 토글, Neural Scan 버튼 |
| ANALYZING (로딩) | 1029-1042 | `ANALYZING` | 스캔 애니메이션, "Decoding DNA..." |
| SETTINGS | 1061-1084 | `SETTINGS` | 토글 2개 + 리셋 버튼 |
| MUSEBOARD | 1086-1091 | `MUSEBOARD` | "Coming Soon" 플레이스홀더 |

### 1-4. Data Constants

| 상수 | 라인 | 용도 |
|------|------|------|
| `DEMO_RESULT` | 457-494 | Demo mode용 `AnalysisResult` 하드코딩 데이터 |
| `TRANSFORMATION_SAMPLES` | 496-515 | 변환 샘플 갤러리 (현재 렌더링에 미사용) |

---

## 2. 새 뷰 추가 5단계

새로운 전체 페이지 뷰를 추가하는 절차:

### Step 1: AppStep enum에 값 추가

```typescript
// types.ts
export enum AppStep {
  // ... 기존 값 ...
  COMMUNITY = 10   // ← 새 값 추가
}
```

### Step 2: 뷰 컴포넌트 생성

```tsx
// App.tsx (기존 뷰 컴포넌트 아래에 추가)
const CommunityView = () => {
  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-20 py-12 px-6"
    >
      {/* 카테고리 라벨 */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-[10px] font-black tracking-[0.5em] text-[#FF4D8D] uppercase italic mb-6">
          Community Hub
        </p>
        <h2 className="text-5xl font-black heading-font uppercase tracking-tighter italic">
          Connect<span className="text-gray-300">.</span>
        </h2>
      </motion.div>

      {/* 콘텐츠 */}
      <motion.div variants={itemVariants}>
        {/* ... */}
      </motion.div>
    </motion.div>
  );
};
```

### Step 3: AnimatePresence에 연결

```tsx
// App.tsx main > AnimatePresence 내부 (line ~1092 부근)
{step === AppStep.COMMUNITY && (
  <CommunityView />
)}
```

### Step 4: 네비게이션에 추가

```tsx
// 데스크탑 nav (line 917-922 배열에 추가)
{ id: AppStep.COMMUNITY, label: 'Community' }

// 모바일 nav (line 956-961 배열에 추가)
{ id: AppStep.COMMUNITY, label: 'Community', icon: <MessageCircle size={20}/> }
```

### Step 5: State 연결 (필요 시)

- 뷰가 App의 state를 읽어야 하면 → props로 전달
- 뷰가 App의 state를 변경해야 하면 → callback props 전달

```tsx
// 예: 결과 데이터가 필요한 뷰
<CommunityView result={result} onNavigate={() => setStep(AppStep.IDLE)} />
```

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

### 3-2. 전역 Variants (App.tsx:17-52)

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
| Toggle 전환 | `stiffness: 500, damping: 30` | App.tsx:63 |
| Card hover | `stiffness: 400, damping: 17` | App.tsx:86 |

### 3-5. 페이지 전환

```tsx
<AnimatePresence mode="wait">
  {step === AppStep.XXX && ( <XxxView /> )}
</AnimatePresence>
```

- `mode="wait"`: 이전 뷰가 완전히 사라진 후 다음 뷰 등장
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
