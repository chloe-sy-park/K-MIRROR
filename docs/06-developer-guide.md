# K-MIRROR Developer Guide

> 새 개발자가 프로젝트를 클론하고 실행하기까지의 모든 것.
> 관련 문서: [05-architecture-decisions.md](./05-architecture-decisions.md)

---

## 1. Prerequisites

| 도구 | 버전 | 비고 |
|------|------|------|
| **Node.js** | 18+ | ES2022 target (tsconfig) |
| **npm** | 9+ | Node.js에 포함 |
| **Code Editor** | 아무거나 | VS Code 추천 (Tailwind IntelliSense, ES7 React snippets) |
| **Gemini API Key** | - | 아래 §2에서 발급 |

---

## 2. Gemini API Key 발급

1. [Google AI Studio](https://aistudio.google.com/apikey) 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 키 복사

> 현재 사용 모델: `gemini-3-pro-preview` (멀티모달 — 이미지 + 텍스트 분석)
> 무료 티어: 분당 2 요청, 일일 50 요청 (Google 문서 참조)

---

## 3. 로컬 셋업

```bash
# 1. 클론
git clone https://github.com/chloe-sy-park/K-MIRROR.git
cd K-MIRROR

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local을 열어서 VITE_GEMINI_API_KEY에 실제 키 입력

# 4. 개발 서버 실행
npm run dev
# → http://localhost:5173 에서 앱 확인
```

---

## 4. 환경변수

`.env.local`에 필요한 변수:

```
VITE_GEMINI_API_KEY=your_actual_key

# Optional - Supabase 연동 시
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Vite 환경변수 규칙

- `VITE_` 접두사가 있는 변수만 클라이언트에서 접근 가능
- `import.meta.env.VITE_GEMINI_API_KEY`로 접근
- 빌드 타임에 치환됨 (Node.js 런타임 변수 아님)

---

## 5. Available Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 (HMR) |
| `npm run build` | 프로덕션 빌드 → `/dist` |
| `npm run preview` | 빌드 결과물 로컬 프리뷰 |
| `npm test` | Vitest watch 모드 (파일 변경 시 자동 재실행) |
| `npm run test:run` | Vitest 1회 실행 (CI/CD용) |
| `npm run format` | Prettier 코드 포매팅 |

---

## 6. 프로젝트 구조

```
K-MIRROR/
├── src/
│   ├── App.tsx                    # React Router 라우팅 + 레이아웃 (React.lazy 코드 스플리팅)
│   ├── main.tsx                   # React 진입점 (BrowserRouter, i18n, ErrorBoundary)
│   ├── index.css                  # Tailwind v4 import + 커스텀 CSS
│   │
│   ├── views/                     # 페이지 뷰 (URL 라우트 매핑)
│   │   ├── ScanView.tsx           # / — 이미지 업로드 + 분석
│   │   ├── AnalysisResultView.tsx # / (phase=result) — AI 분석 결과
│   │   ├── CelebGalleryView.tsx   # /celebs — K-셀럽 갤러리
│   │   ├── ExpertMatchingView.tsx # /match — 전문가 매칭
│   │   ├── OnboardingView.tsx     # /onboarding — 첫 진입
│   │   ├── MethodologyView.tsx    # /methodology — Sherlock 방법론
│   │   ├── MuseBoardView.tsx      # /muse — Muse Board
│   │   ├── SettingsView.tsx       # /settings — 설정
│   │   ├── ShopView.tsx           # /shop — 제품 목록
│   │   ├── ProductDetailView.tsx  # /shop/:id — 제품 상세
│   │   ├── OrdersView.tsx         # /orders — 주문 내역
│   │   └── GlobalCheckoutView.tsx # /checkout — 결제
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # 반응형 네비게이션 바
│   │   │   └── Footer.tsx
│   │   ├── ui/
│   │   │   ├── Toggle.tsx         # spring 애니메이션 토글
│   │   │   ├── LuxuryFileUpload.tsx # 이미지 업로드 + 미리보기
│   │   │   ├── ErrorToast.tsx     # 에러 알림
│   │   │   └── AuthModal.tsx      # 인증 모달
│   │   ├── sherlock/
│   │   │   └── ProportionVisualizer.tsx # 얼굴 비율 시각화
│   │   └── ErrorBoundary.tsx      # React Error Boundary (inline/full-page)
│   │
│   ├── store/                     # Zustand 전역 상태
│   │   ├── scanStore.ts           # 스캔 phase, 이미지, 분석 결과
│   │   ├── settingsStore.ts       # 온보딩 완료, 민감 피부, 선호도 (localStorage persist)
│   │   ├── cartStore.ts           # 장바구니 CRUD + 주문
│   │   ├── museStore.ts           # Muse Board 데이터
│   │   └── authStore.ts           # 인증 상태
│   │
│   ├── hooks/
│   │   └── useFocusTrap.ts        # 모달 포커스 트랩 + 자동 포커스 + 복원
│   │
│   ├── services/
│   │   ├── geminiService.ts       # Gemini AI 분석 (2-step: analyzeSkin + matchProducts)
│   │   ├── imageService.ts        # 이미지 리사이즈 (1024px) + JPEG 압축 (0.85)
│   │   ├── cacheService.ts        # 분석 결과 캐싱 (sessionStorage LRU, 5개, 30분 TTL)
│   │   ├── colorService.ts        # 멜라닌 기반 Multiply/Screen 블렌딩
│   │   ├── productService.ts      # AI 추천 → 카탈로그 매칭
│   │   └── museService.ts         # Muse Board CRUD (Supabase)
│   │
│   ├── data/
│   │   ├── celebGallery.ts        # K-셀럽 12명 (이름, 그룹, 장르, 무드, 시그니처)
│   │   ├── experts.ts             # 전문가 4명 (역할, 전문 분야, 가격, 평점)
│   │   ├── demoResult.ts          # Demo 모드용 AnalysisResult 상수
│   │   └── productCatalog.ts      # 제품 카탈로그 (HERA, ROM&ND, CLIO 등)
│   │
│   ├── schemas/
│   │   └── analysisResult.ts      # Zod v4 스키마 — AI 응답 런타임 검증
│   │
│   ├── types/
│   │   └── index.ts               # AnalysisResult, UserPreferences 등 TS 인터페이스
│   │
│   ├── i18n/
│   │   ├── index.ts               # i18next 설정
│   │   ├── en.json                # 영어
│   │   └── ko.json                # 한국어
│   │
│   └── test/
│       └── setup.ts               # Vitest 글로벌 설정 (framer-motion, genai, supabase 모킹)
│
├── vite.config.ts                 # Vite 설정 (React, Tailwind, PWA 플러그인)
├── vitest.config.ts               # Vitest 설정 (jsdom, @/ alias, testing-library)
├── tsconfig.json                  # TypeScript 설정 (strict 모드 아님, vitest/globals 포함)
├── vercel.json                    # Vercel SPA 리라이트 + 보안 헤더
├── .prettierrc                    # Prettier 설정
├── .github/workflows/ci.yml      # GitHub Actions CI (test + build)
├── package.json
└── docs/                          # 프로젝트 문서 (9개)
```

---

## 7. 상태 관리 (Zustand)

모든 전역 상태는 Zustand 스토어로 관리된다:

| 스토어 | 주요 상태 | persist |
|--------|----------|---------|
| `scanStore` | `phase`, `userImage`(+mimeType), `celebImage`(+mimeType), `result`, `matchedProducts`, `youtubeVideos`, `targetBoardId`, `error`, `selectedCelebName` | No |
| `settingsStore` | `isOnboarded`, `isSensitive`, `prefs`, `language` | Yes (`kmirror_settings`) |
| `cartStore` | `items[]`, `orders[]` | No |
| `authStore` | `user`, `isAuthenticated` | No |
| `museStore` | `boards[]`, `selectedBoard` | No |

### settingsStore의 persist

```typescript
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'kmirror_settings' }  // localStorage 키
  )
);
```

이로써 페이지 새로고침 시에도 온보딩 완료 상태, 민감 피부 설정 등이 유지된다.

---

## 8. 라우팅 (React Router v7)

`App.tsx`에서 모든 라우트 정의:

| 경로 | 뷰 | 비고 |
|------|-----|------|
| `/` | `ScanView` → `AnalysisResultView` | phase에 따라 전환 |
| `/onboarding` | `OnboardingView` | 온보딩 완료 시 `/`로 리다이렉트 |
| `/celebs` | `CelebGalleryView` | 셀럽 선택 → state로 `/`에 전달 |
| `/match` | `ExpertMatchingView` | 전문가 매칭 |
| `/methodology` | `MethodologyView` | Sherlock 방법론 |
| `/settings` | `SettingsView` | 설정 |
| `/muse` | `MuseBoardView` | Muse Board |
| `/shop` | `ShopView` | 제품 목록 |
| `/shop/:id` | `ProductDetailView` | 제품 상세 |
| `/checkout` | `GlobalCheckoutView` | 결제 |
| `/orders` | `OrdersView` | 주문 내역 |
| `*` | → `/` | 404 리다이렉트 |

### AnimatePresence 페이지 전환

```tsx
<AnimatePresence mode="wait">
  <ErrorBoundary inline>
    <Routes location={location} key={location.pathname}>
      {/* ... */}
    </Routes>
  </ErrorBoundary>
</AnimatePresence>
```

---

## 9. Demo Mode

API 키 없이도 UI를 확인할 수 있다:

1. `npm run dev`로 앱 실행
2. Onboarding 완료 (아무 값이나 선택)
3. 스캔 페이지에서 **비커 아이콘** (분홍색) 클릭
4. 2초 후 `DEMO_RESULT` 상수가 로드됨

### 코드 흐름

```
[비커 클릭]
  → scanStore.demoMode()
  → set({ phase: 'analyzing' })
  → setTimeout(2000ms)
  → set({ result: DEMO_RESULT, phase: 'result' })
```

- API 호출 없음 — API 키 없어도 동작
- `reset()` 호출 시 타이머가 자동으로 클리어됨 (race condition 방지)
- DEMO_RESULT는 Melanin L5 (Deep Cool-Ebony) + Wonyoung(IVE) 스타일 매칭 시나리오

---

## 10. 테스트

### 실행

```bash
npm test          # watch 모드
npm run test:run  # 1회 실행
```

### 구조

- **설정**: `vitest.config.ts` — jsdom 환경, `@/` alias, CSS 비활성화
- **글로벌 모킹**: `src/test/setup.ts` — framer-motion, react-i18next, @google/genai, @supabase/supabase-js
- **유닛 테스트**: `src/services/*.test.ts`, `src/store/*.test.ts`, `src/schemas/*.test.ts`
- **통합 테스트**: `src/views/*.test.tsx` — React Testing Library로 컴포넌트 렌더링 + 인터랙션 검증

### 현재 테스트 커버리지

**47개 파일 / 390개 테스트**

주요 테스트 파일:

| 파일 | 테스트 수 | 테스트 대상 |
|------|----------|------------|
| `scoringService.test.ts` | 32 | 스코어링 알고리즘 |
| `museStore.test.ts` | 30 | 보드 CRUD, 뮤즈 CRUD, 로딩 상태 |
| `geminiService.test.ts` | 24 | analyzeSkin, analyzeKBeauty, matchProducts, retry, timeout |
| `scanStore.test.ts` | 20 | analyze 파이프라인, 캐시, mimeType, 데모 모드 |
| `colorService.test.ts` | 19 | hexToRgb, rgbToHex, 블렌딩 |
| `ShopView.test.tsx` | 14 | 제품 목록, 필터, 카트 |
| `OrdersView.test.tsx` | 16 | 주문 내역, 상태 표시 |
| `GlobalCheckoutView.test.tsx` | 13 | 결제 폼, 유효성 검사 |
| `OnboardingView.test.tsx` | 12 | 온보딩 단계, 환경/스킬/무드 선택 |
| `cacheService.test.ts` | 11 | hashInputs, LRU 퇴거, TTL 만료 |
| `AnalysisResultView.test.tsx` | 10 | 톤 정보, 제품, 비디오, 카트, 보드 사전 선택 |

---

## 11. 배포

### Vercel

- `main` 브랜치 push → 자동 배포
- `vercel.json`에서 SPA 리라이트 + 보안 헤더 설정
- 보안 헤더: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- 환경변수는 Vercel Dashboard에서 설정

### CI/CD (GitHub Actions)

- `.github/workflows/ci.yml`
- `main` 브랜치 push + PR 시 자동 실행
- 단계: checkout → setup-node(v20) → npm ci → test:run → build
- PR 병합 전 테스트/빌드 통과 필수

### PWA

- `vite-plugin-pwa`로 Service Worker + manifest 자동 생성
- 빌드 시 41개 에셋 프리캐시 (코드 스플리팅으로 증가)
- 오프라인 폴백은 미구현

### SEO

- `index.html`에 Open Graph + Twitter Card 메타 태그
- `<link rel="canonical">` 설정

---

## 12. Known Gotchas

### 번들 크기

- 메인 JS 번들 ~317KB (gzip ~99KB) — `React.lazy()` + `manualChunks` vendor 분리
- Vendor 청크: react(48KB), motion(78KB), supabase(173KB), i18n(50KB), stripe(1.5KB), sentry(0.04KB)
- 뷰별 청크 자동 생성 (Vite 빌드)
- Framer Motion 트리 셰이킹(`LazyMotion`)은 미적용

### Supabase 비활성 경고

- `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 미설정 시 콘솔 경고 출력
- Auth, Muse Board 등 Supabase 기능은 비활성화되지만 앱은 정상 동작

### 이미지 메모리

- 업로드 이미지가 base64 문자열로 Zustand state에 보관
- 대용량 이미지 → 브라우저 메모리 부담
- 세션 종료/새로고침 시 스캔 관련 이미지 소멸 (persist 안함)

### 이미지 처리

- `imageService.ts`가 업로드 이미지를 Canvas API로 리사이즈 (최대 1024px) + JPEG 압축 (quality 0.85)
- mimeType이 파이프라인 전체에 전파: LuxuryFileUpload → scanStore → geminiService → Edge Function → Gemini API
- 항상 JPEG로 출력하므로 일관된 payload 크기

### TypeScript Strict 모드

- `tsconfig.json`에 `strict: true` 없음
- 점진적 전환 고려 중

---

## 이전 기술 부채 해소 현황

### Sprint 1

| 항목 | 이전 상태 | 현재 상태 |
|------|----------|----------|
| 모놀리식 App.tsx (1107줄) | 모든 뷰가 한 파일 | 뷰/컴포넌트/스토어/서비스 분리 완료 |
| 상태 관리 부재 | useState 7개 | Zustand 5개 스토어 (persist 포함) |
| 라우팅 없음 | AppStep enum | React Router v7 (URL 기반) |
| CDN Tailwind | `cdn.tailwindcss.com` | `@tailwindcss/vite` 빌드 파이프라인 |
| 에러 처리 미흡 | `console.error`만 | AnalysisError 클래스 + ErrorBoundary + ErrorToast |
| 테스트 전무 | 0개 | 65개 (유닛 + 통합) |
| 런타임 검증 없음 | `as AnalysisResult` 타입 단언 | Zod v4 스키마 검증 |
| 국제화 없음 | 영어 고정 | i18next (한/영) |

### Sprint 2

| 항목 | 이전 상태 | 현재 상태 |
|------|----------|----------|
| Checkout 폼 미연결 | input value/onChange 없음 | useState 바인딩 + 유효성 검사 |
| Inclusion Guard 하드코딩 | `onChange={() => {}}` | settingsStore 연동 |
| Gemini 복원력 없음 | retry/timeout 없음 | 재시도 2회 + 30초 타임아웃 + 레이트 리미팅 |
| 코드 스플리팅 없음 | 833KB 단일 번들 | React.lazy → 733KB + 뷰 청크 |
| 접근성 전무 | ARIA 0개 | Toggle, Modal, Navbar, Gallery 등 ARIA + 키보드 적용 |
| 보안 헤더 없음 | 미설정 | Vercel 보안 헤더 5개 |
| CI/CD 없음 | 수동 검증 | GitHub Actions (test + build) |
| i18n 누락 | 에러/검증 메시지 미번역 | errors, validation, a11y 섹션 완성 |
| SEO 미설정 | OG 태그 없음 | Open Graph + Twitter Card |
| Footer 아이콘 | onClick 없음 | 네비게이션 연결 + aria-label |

### Sprint 3

| 항목 | 이전 상태 | 현재 상태 |
|------|----------|----------|
| 이미지 최적화 | 리사이즈/압축 없음, mimeType 고정 | Canvas API 리사이즈 (1024px) + JPEG 압축 + mimeType 전파 |
| 번들 크기 | 733KB (React.lazy만) | 317KB + vendor 6청크 (`manualChunks`) |
| 보드 자동 저장 | MuseBoard→스캔 시 보드 미연결 | `targetBoardId` in scanStore → 보드 사전 선택 |
| 모달 포커스 트랩 | AuthModal/BiometricConsentModal에 인라인 중복 | `useFocusTrap` 훅 (포커스 트랩 + 자동 포커스 + 복원) |
| 결과 캐싱 | 동일 입력 매번 재분석 | sessionStorage LRU 캐시 (5개, 30분 TTL) |
| 테스트 커버리지 | 65개 테스트 | 390개 테스트 (47개 파일) |
