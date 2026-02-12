# K-MIRROR Architecture Decision Records

> 기술 선택의 근거와 현재 상태를 기록하는 문서.
> 개발자 온보딩, 기술 전환 시 참조한다.

---

## ADR-001: Frontend Framework — React + Vite

### 결정

React 19 + Vite 6 + TypeScript 5.8

### 근거

- 성숙한 생태계, 풍부한 라이브러리 (Framer Motion, Zustand 등)
- Vite의 빠른 HMR, 최적화된 프로덕션 빌드
- TypeScript로 타입 안전성 확보

### 현재 상태 ✅

- Vite 빌드 파이프라인으로 프로덕션 번들 생성
- `@vitejs/plugin-react`로 Fast Refresh
- `vite-plugin-pwa`로 PWA + Service Worker 지원
- Vercel에 자동 배포

---

## ADR-002: AI Model — Google Gemini 3 Pro Preview

### 결정

`gemini-3-pro-preview` 모델 사용 (`@google/genai` SDK)

### 근거

- 멀티모달 (이미지 + 텍스트) 분석 지원
- Structured JSON output (responseSchema) 지원
- 무료 티어로 프로토타이핑 가능

### 현재 상태 ✅

- 프롬프트 v5.1: 멜라닌 포용적 분석, 셀럽 컨텍스트, temperature 0.4
- Zod v4 스키마로 AI 응답 런타임 검증
- `AnalysisError` 클래스로 에러 분류 (EMPTY_RESPONSE, VALIDATION, API, NETWORK)
- `selectedCelebName` 파라미터로 셀럽 갤러리 연동

### 한계

- 이미지 **생성** 불가 — 분석만 가능
- 가상 피팅(Virtual Fitting)을 위해 별도 이미지 생성 모델 필요

### 향후 고려

| 용도 | 후보 모델 | 비고 |
|------|----------|------|
| 얼굴 분석 (현재) | Gemini 3 Pro | 유지 |
| 가상 피팅 이미지 생성 | Gemini Imagen 4 | Google 생태계 통일 |
| 정체성 보존 피팅 | InstantID (ComfyUI) | 얼굴 특징 보존 최강 |
| 발색 렌더링 | colorService.ts | ✅ 구현 완료 (Multiply/Screen 블렌드) |
| 랜드마크 감지 | MediaPipe Face Mesh | 브라우저 내 실시간 |

---

## ADR-003: Styling — Tailwind CSS v4 (Build Pipeline)

### 결정

Tailwind CSS v4 + `@tailwindcss/vite` 플러그인

### 근거

- 빌드 파이프라인으로 프로덕션에서 사용 클래스만 포함
- v4의 새 엔진으로 빌드 속도 대폭 개선
- CSS 변수 기반 디자인 토큰 자연스럽게 지원

### 현재 상태 ✅

- CDN 방식에서 빌드 파이프라인으로 완전 전환
- `src/index.css`에서 `@import "tailwindcss"` + 커스텀 클래스 정의
- `.heading-font`, `.luxury-card`, `.btn-luxury`, `.accent-gradient`, `.scanning` 커스텀 클래스
- 프로덕션 CSS: ~50KB (gzip ~9KB)

### 이전 상태 (해소됨)

- ~~CDN 방식은 프로덕션에서 성능 저하~~ → 빌드 파이프라인 전환 완료
- ~~Tailwind config 파일 없음~~ → v4에서는 CSS 기반 설정

---

## ADR-004: State Management — Zustand v5

### 결정

Zustand v5 + `persist` 미들웨어

### 근거

- 보일러플레이트 최소, 직관적 API
- React 외부에서도 `getState()`로 접근 가능 (테스트에 유리)
- `persist` 미들웨어로 localStorage 영속화 간단

### 현재 상태 ✅

| 스토어 | 역할 | persist |
|--------|------|---------|
| `scanStore` | 스캔 phase, 이미지, AI 결과, 에러 | No |
| `settingsStore` | 온보딩, 선호도, 민감피부, 언어 | Yes (`kmirror_settings`) |
| `cartStore` | 장바구니 CRUD, 주문 | No |
| `authStore` | 인증 상태 | No |
| `museStore` | Muse Board | No |

### 이전 상태 (해소됨)

- ~~useState 7개가 App 최상위에 집중~~ → Zustand 5개 스토어로 분리
- ~~페이지 새로고침 시 온보딩 초기화~~ → `persist` 미들웨어로 해결

---

## ADR-005: Routing — React Router v7

### 결정

React Router v7 (`react-router-dom`)

### 근거

- 표준 URL 기반 라우팅 (뒤로가기, 북마크, 공유 가능)
- AnimatePresence와 `location` 키로 페이지 전환 애니메이션
- 타입 안전한 `useNavigate`, `useLocation`

### 현재 상태 ✅

12개 라우트 정의 (`App.tsx`):
`/`, `/onboarding`, `/celebs`, `/match`, `/methodology`, `/settings`, `/muse`, `/shop`, `/shop/:id`, `/checkout`, `/orders`, `*`

### 이전 상태 (해소됨)

- ~~AppStep enum으로 수동 전환~~ → URL 기반 라우팅
- ~~URL 변경 없음~~ → 모든 뷰가 고유 URL

---

## ADR-006: Animation — Framer Motion 12

### 결정

Framer Motion 12

### 근거

- React 친화적 선언형 애니메이션
- `AnimatePresence`로 페이지 전환 처리
- Spring physics로 자연스러운 인터랙션

### 현재 상태 ✅

- `containerVariants` + `itemVariants`로 staggered 페이지 진입
- `AnimatePresence mode="wait"`로 라우트 전환
- 모든 뷰에서 일관된 애니메이션 패턴 적용

---

## ADR-007: Testing — Vitest + Testing Library

### 결정

Vitest v4 + @testing-library/react + @testing-library/jest-dom

### 근거

- Vite 네이티브 테스트 러너 (설정 최소화)
- jsdom 환경에서 React 컴포넌트 렌더링
- Testing Library의 "사용자 관점" 테스트 철학

### 현재 상태 ✅

- 65개 테스트 (유닛 41 + 통합 24)
- 글로벌 모킹: framer-motion, react-i18next, @google/genai, @supabase/supabase-js
- `@/` path alias 설정으로 소스 코드와 동일한 import

---

## ADR-008: Validation — Zod v4

### 결정

Zod v4로 AI 응답 런타임 검증

### 근거

- TypeScript 타입과 런타임 검증을 동일 스키마에서 관리
- AI 응답은 예측 불가능 — 빌드 타임 타입만으로 불충분
- 의미 있는 에러 메시지 (`ZodError`)

### 현재 상태 ✅

- `src/schemas/analysisResult.ts`에 전체 스키마 정의
- `geminiService.ts`에서 `JSON.parse` 후 스키마 검증
- 검증 실패 시 `AnalysisError('VALIDATION')` throw

### 이전 상태 (해소됨)

- ~~`as AnalysisResult` 타입 단언~~ → Zod 런타임 검증

---

## ADR-009: 배포 — Vercel

### 결정

Vercel에 배포 (main 브랜치 자동 배포)

### 근거

- Vite SPA에 최적화된 배포 플랫폼
- GitHub 연동으로 push → 자동 배포
- 글로벌 CDN, HTTPS 자동

### 현재 상태 ✅

- `vercel.json`에서 SPA 리라이트 설정
- PWA Service Worker + manifest 자동 배포
- 환경변수는 Vercel Dashboard에서 관리

### 이전 상태 (해소됨)

- ~~Google AI Studio에만 배포~~ → Vercel 프로덕션 배포

---

## ADR-010: Color Rendering — 자체 블렌딩 엔진

### 결정

`colorService.ts`에서 Photoshop 스타일 블렌딩 구현

### 근거

- AI 호출 불필요 — 수학적 연산으로 충분
- 멜라닌 지수별 불투명도 보정으로 피부톤 인식 정확도 향상
- Tint/Cushion/Matte 3종 렌더링으로 실제 발색 시뮬레이션

### 현재 상태 ✅

- Multiply 블렌드 (어두운 피부에 자연스러운 발색)
- Screen 블렌드 (밝은 피부에 반투명 효과)
- `melaninAdjustedOpacity()`: L1-L6별 불투명도 자동 보정 (+5%/레벨)
- `renderSwatchSet()`: Tint(15%), Cushion(30%), Matte(50%) 3종 생성

---

## 아키텍처 개요 (현재)

```
                   ┌──────────────┐
                   │   Vercel     │  ← 자동 배포
                   │  (CDN/SSL)   │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │   Vite Build │  ← React, Tailwind, PWA
                   │  + PWA SW    │
                   └──────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   ┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
   │ React Router│ │  Zustand   │ │  Services   │
   │ (12 routes) │ │ (5 stores) │ │             │
   └──────┬──────┘ └─────┬──────┘ ├─ gemini     │
          │               │        ├─ color      │
   ┌──────▼──────┐        │        ├─ product    │
   │   Views     │◄───────┘        └─ muse       │
   │ (12 pages)  │                       │
   └─────────────┘                       │
                                  ┌──────▼──────┐
                                  │ External    │
                                  ├─ Gemini API │
                                  └─ Supabase   │
                                    (optional)  │
                                  └─────────────┘
```

---

## 남은 기술 부채

| 항목 | 심각도 | 설명 |
|------|--------|------|
| 번들 크기 | 중간 | 833KB JS — code splitting 미적용 |
| TypeScript strict | 낮음 | `strict: true` 미활성화 |
| 이미지 저장 없음 | 중간 | Muse Board, 가상피팅 결과 보관 불가 |
| 접근성 | 중간 | aria 속성, 키보드 내비게이션 미비 |
| i18n 커버리지 | 낮음 | 일부 문자열 하드코딩 |
