# K-MIRROR Architecture Decision Records

> 기술 선택의 근거와 향후 방향을 기록하는 문서.
> 개발자 온보딩, 기술 전환 시 참조한다.

---

## ADR-001: Frontend Framework — React + Vite

### 결정

React 19 + Vite 6 + TypeScript

### 근거

- Google AI Studio 배포 환경과 호환
- esm.sh CDN import 방식으로 빌드 없이 프로토타이핑 가능
- Framer Motion 등 React 생태계 활용

### 현재 상태

- CDN import (`esm.sh`) 기반 — 빌드 프로세스 없이 동작
- Vite config이 있으나, 실제로는 `index.html`의 importmap이 우선 사용됨

### 향후 고려

- 프로덕션 전환 시 CDN → npm 패키지 번들링으로 전환 필요
- Next.js / Remix 마이그레이션 여부 (SSR, SEO 필요 시)

---

## ADR-002: AI Model — Google Gemini 3 Pro Preview

### 결정

`gemini-3-pro-preview` 모델 사용 (`@google/genai` SDK)

### 근거

- 멀티모달 (이미지 + 텍스트) 분석 지원
- Structured JSON output (responseSchema) 지원
- Google AI Studio 배포 환경과 자연스러운 연동

### 현재 상태

- 단일 API 호출로 전체 분석 수행 (tone + sherlock + kMatch + recommendations)
- API Key를 환경변수로 관리 (`process.env.API_KEY`)

### 한계

- 이미지 **생성** 불가 — 분석만 가능
- 가상 피팅(Virtual Fitting)을 위해 별도 이미지 생성 모델 필요

### 향후 고려

| 용도 | 후보 모델 | 비고 |
|------|----------|------|
| 얼굴 분석 (현재) | Gemini 3 Pro | 유지 |
| 가상 피팅 이미지 생성 | Gemini Imagen 4 | Google 생태계 통일 |
| 정체성 보존 피팅 | InstantID (ComfyUI) | 얼굴 특징 보존 최강 |
| 발색 렌더링 | 자체 Canvas/WebGL 모듈 | AI 불필요, 수학적 블렌딩 |
| 랜드마크 감지 | MediaPipe Face Mesh | 브라우저 내 실시간 |

---

## ADR-003: Styling — Tailwind CSS (CDN)

### 결정

Tailwind CSS v4 (CDN script 태그)

### 근거

- 빌드 없이 즉시 사용 가능
- 유틸리티 기반으로 디자인 시스템의 일관성 유지 용이
- 임의값 (`text-[10px]`, `rounded-[3rem]`) 으로 커스텀 디자인 표현

### 현재 상태

- `index.html`에서 `cdn.tailwindcss.com` 로드
- CSS 변수 (`--brand-pink` 등)와 Tailwind 클래스 혼용
- 커스텀 클래스: `.heading-font`, `.luxury-card`, `.btn-luxury`, `.accent-gradient`, `.scanning`

### 문제점

- CDN 방식은 프로덕션에서 성능 저하 (전체 CSS 로드)
- Tailwind config 파일 없음 — 커스텀 토큰이 코드에만 존재
- 디자인 토큰이 `index.html`의 `<style>`과 인라인 클래스에 분산

### 향후 고려

- `tailwind.config.ts`에 디자인 토큰 등록 (01-design-system.md 기반)
- CDN → PostCSS 빌드 파이프라인 전환
- 컴포넌트 라이브러리화 (Storybook 고려)

---

## ADR-004: Animation — Framer Motion

### 결정

Framer Motion 12

### 근거

- React 친화적 선언형 애니메이션
- `AnimatePresence`로 페이지 전환 처리
- Spring physics로 자연스러운 인터랙션

### 현재 상태

- 3개의 전역 Variant 정의 (`containerVariants`, `itemVariants`, `pulseVariants`)
- 모든 뷰 전환에 `AnimatePresence mode="wait"` 적용
- hover/tap 인터랙션에 `whileHover`, `whileTap` 사용

### 향후 고려

- 가상 피팅 비포/애프터 전환 애니메이션
- 이미지 생성 로딩 시 Skeleton + Progressive reveal
- Shared layout animation (셀럽 선택 → 결과 전환)

---

## ADR-005: App Architecture — 단일 컴포넌트 (현재) → 분리 (예정)

### 현재 상태

```
App.tsx (1107줄)
├── Toggle (helper)
├── LuxuryFileUpload (helper)
├── SherlockProportionVisualizer
├── MethodologyView
├── OnboardingView
├── ExpertMatchingView
├── GlobalCheckoutView
├── AnalysisResultView
├── App (main) ← 모든 상태, 모든 라우팅 로직
└── DEMO_RESULT, TRANSFORMATION_SAMPLES (mock data)
```

### 문제점

1. **단일 파일에 모든 것** — 1107줄, 유지보수 한계
2. **상태 관리 부재** — `useState` 8개가 App 최상위에 집중
3. **라우팅 없음** — `AppStep` enum으로 수동 전환, URL 변경 없음
4. **Mock 데이터가 컴포넌트 안에** — 분리 필요
5. **재사용 불가** — 컴포넌트가 App 내부에 결합

### 목표 구조

```
src/
├── components/
│   ├── ui/                      # 공통 UI 컴포넌트
│   │   ├── Toggle.tsx
│   │   ├── LuxuryCard.tsx
│   │   ├── FilterChip.tsx
│   │   ├── CategoryLabel.tsx
│   │   ├── MatchBadge.tsx
│   │   └── LuxuryFileUpload.tsx
│   ├── sherlock/                # Sherlock 분석 관련
│   │   ├── ProportionVisualizer.tsx
│   │   └── MethodologyView.tsx
│   ├── analysis/                # 분석 결과 관련
│   │   └── AnalysisResultView.tsx
│   ├── onboarding/
│   │   └── OnboardingView.tsx
│   ├── experts/
│   │   └── ExpertMatchingView.tsx
│   ├── checkout/
│   │   └── GlobalCheckoutView.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── pages/                       # 라우팅 페이지
│   ├── ScanPage.tsx
│   ├── ResultPage.tsx
│   ├── MuseBoardPage.tsx
│   ├── SettingsPage.tsx
│   └── CheckoutPage.tsx
├── services/
│   ├── geminiService.ts         # AI 분석
│   ├── colorService.ts          # 발색 렌더링 (예정)
│   └── landmarkService.ts       # Face Mesh (예정)
├── store/                       # 상태 관리 (예정)
│   ├── useAppStore.ts           # Zustand 또는 Context
│   └── useUserStore.ts
├── data/
│   ├── celebCatalog.ts          # K-셀럽 데이터
│   └── mockResults.ts           # 데모 데이터
├── constants/
│   ├── animations.ts            # Framer Motion variants
│   └── design-tokens.ts         # 디자인 토큰
├── types/
│   └── index.ts                 # 모든 타입 정의
├── i18n/                        # 다국어 (예정)
│   ├── en.json
│   └── ko.json
├── App.tsx                      # 라우터 + 레이아웃만
└── index.tsx
```

### 상태 관리 후보

| 옵션 | 장점 | 단점 |
|------|------|------|
| **Zustand** (추천) | 가볍고, 보일러플레이트 최소, React 외부에서도 접근 가능 | 대규모 앱에서 구조화 필요 |
| React Context | 추가 의존성 없음 | 리렌더링 이슈, 중첩 복잡 |
| Jotai | 원자적 상태, 간결 | 러닝커브 |

### 라우팅 후보

| 옵션 | 장점 | 단점 |
|------|------|------|
| **React Router v7** (추천) | 표준, URL 기반, 뒤로가기 지원 | 번들 크기 약간 증가 |
| TanStack Router | 타입 안전 라우팅 | 새로움, 생태계 작음 |
| 유지 (enum) | 변경 없음 | URL 없음, 공유/북마크 불가 |

---

## ADR-006: 배포 환경

### 현재

- Google AI Studio에 배포 (iframe 기반)
- `metadata.json`에 앱 메타데이터 + 카메라 권한 정의

### 한계

- AI Studio 내에서만 접근 가능
- 커스텀 도메인 불가
- 백엔드 서버 불가 (서버리스도 불가)

### 향후 전환 고려

| 옵션 | 용도 | 비고 |
|------|------|------|
| **Vercel** | 프론트엔드 + API Routes | Next.js 전환 시 자연스러움 |
| **Firebase** | Auth + Firestore + Hosting | Google 생태계 유지 |
| **Supabase** | Auth + DB + Storage | 오픈소스, 비용 효율 |
| **Railway / Render** | 백엔드 API 서버 | 스타일리스트 마켓 등 복잡한 로직 |

### Phase별 배포 전략

```
Phase 1: Google AI Studio (현재) — 프로토타이핑
Phase 2: Vercel + Firebase Auth — 사용자 계정, 이미지 저장
Phase 3: + Stripe + 물류 API — 결제, 배송
Phase 4: + Video SDK + 예약 시스템 — 스타일리스트 마켓
```

---

## ADR-007: 이미지 처리 전략

### 현재

- FileReader API로 브라우저에서 base64 변환
- base64 문자열을 그대로 Gemini API에 전송
- 이미지 저장/캐싱 없음 (세션 종료 시 소멸)

### 문제점

- base64가 메모리에 상주 → 대용량 이미지 시 성능 저하
- 사용자 이미지가 서버에 저장되지 않아 Muse Board 구현 불가
- 가상 피팅 결과 이미지 저장 불가

### 향후 고려

```
[1] 이미지 업로드 → Cloud Storage (Firebase/S3)에 저장
[2] 리사이즈/최적화 후 AI API에 전송
[3] 결과 이미지도 Cloud Storage에 저장
[4] Muse Board에서 URL로 참조
[5] 사용자 동의 기반 데이터 보관 정책 필요 (GDPR 등)
```

### 개인정보 고려사항

- 얼굴 이미지는 민감 개인정보 — 명시적 동의 필수
- 보관 기간 정책 필요 (예: 30일 후 자동 삭제)
- GDPR, CCPA 대응 준비
- 얼굴 데이터를 모델 학습에 사용하지 않음을 명시

---

## 요약: 현재 기술 부채

| 항목 | 심각도 | 설명 |
|------|--------|------|
| 모놀리식 App.tsx | 높음 | 유지보수/확장 한계 |
| 상태 관리 부재 | 높음 | 복잡해질수록 prop drilling 심화 |
| 라우팅 없음 | 중간 | URL 공유, 뒤로가기 불가 |
| CDN 의존 | 중간 | 프로덕션 성능, 오프라인 불가 |
| 이미지 저장 없음 | 높음 | Muse Board, 가상피팅 결과 보관 불가 |
| 에러 처리 미흡 | 중간 | API 실패 시 사용자 피드백 없음 |
| 테스트 전무 | 높음 | 회귀 버그 방지 불가 |
| 국제화 없음 | 중간 | 글로벌 타겟인데 영어 고정 |
