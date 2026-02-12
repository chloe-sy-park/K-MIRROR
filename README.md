<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# K-MIRROR AI

**AI가 얼굴을 분석하고, K-셀럽의 스타일을 사용자의 인종과 골격에 맞게 변환해서 입혀주는 글로벌 K-Beauty 스타일리스트.**

Your identity is the constant. Seoul is the variable.

---

## Quick Start

### Prerequisites

- Node.js 18+
- Gemini API Key ([발급 링크](https://aistudio.google.com/apikey))

### Setup

```bash
git clone https://github.com/chloe-sy-park/K-MIRROR.git
cd K-MIRROR
npm install
cp .env.local.example .env.local
# .env.local에 VITE_GEMINI_API_KEY 입력
npm run dev
```

앱이 `http://localhost:5173`에서 실행됩니다.

### Demo Mode

API 키 없이 UI를 확인하려면:
1. Onboarding 완료
2. 스캔 페이지에서 분홍색 **비커 아이콘** 클릭
3. 2초 후 샘플 분석 결과가 표시됩니다

---

## Tech Stack

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19 | UI 프레임워크 |
| TypeScript | 5.8 | 타입 안전성 |
| Vite | 6 | 빌드 도구 + HMR |
| Tailwind CSS | 4 | 스타일링 (`@tailwindcss/vite` 빌드 파이프라인) |
| Zustand | 5 | 전역 상태 관리 (`persist` 미들웨어 포함) |
| React Router | 7 | URL 기반 라우팅 (lazy loading) |
| Google Gemini | 3 Pro | 얼굴 분석 + 스타일 매칭 AI |
| Zod | 4 | AI 응답 런타임 스키마 검증 |
| Framer Motion | 12 | 페이지 전환 + 인터랙션 애니메이션 |
| i18next | 25 | 다국어 지원 (한/영) |
| Vitest | 4 | 테스트 프레임워크 (65개 테스트) |
| vite-plugin-pwa | 1.2 | PWA + Service Worker |
| Prettier | - | 코드 포매팅 |
| GitHub Actions | - | CI 파이프라인 (테스트 + 빌드) |

---

## Project Structure

```
K-MIRROR/
├── src/
│   ├── App.tsx                    # 라우터 + 레이아웃 (React.lazy 코드 스플리팅)
│   ├── main.tsx                   # React 진입점
│   ├── index.css                  # Tailwind v4 + 커스텀 CSS
│   │
│   ├── views/                     # 페이지 뷰 컴포넌트
│   │   ├── ScanView.tsx           # 메인 스캔 (이미지 업로드)
│   │   ├── AnalysisResultView.tsx # AI 분석 결과
│   │   ├── CelebGalleryView.tsx   # K-셀럽 갤러리 + 필터
│   │   ├── ExpertMatchingView.tsx # 전문가 매칭
│   │   ├── OnboardingView.tsx     # 첫 진입 온보딩
│   │   ├── MethodologyView.tsx    # Sherlock 방법론
│   │   ├── MuseBoardView.tsx      # Muse Board
│   │   ├── SettingsView.tsx       # 설정
│   │   ├── ShopView.tsx           # 제품 숍
│   │   └── GlobalCheckoutView.tsx # 결제
│   │
│   ├── components/                # 재사용 컴포넌트
│   │   ├── layout/                # Navbar, Footer
│   │   ├── ui/                    # Toggle, FileUpload, ErrorToast, AuthModal
│   │   ├── sherlock/              # ProportionVisualizer
│   │   └── ErrorBoundary.tsx      # 에러 경계 (inline + full-page)
│   │
│   ├── store/                     # Zustand 스토어
│   │   ├── scanStore.ts           # 스캔/분석 상태
│   │   ├── settingsStore.ts       # 설정 (localStorage persist)
│   │   ├── cartStore.ts           # 장바구니
│   │   ├── museStore.ts           # Muse Board
│   │   └── authStore.ts           # 인증
│   │
│   ├── services/                  # 비즈니스 로직
│   │   ├── geminiService.ts       # Gemini AI 분석 (프롬프트 v5.1 + retry/timeout)
│   │   ├── colorService.ts        # 멜라닌 기반 발색 렌더링
│   │   ├── productService.ts      # 제품 매칭
│   │   └── museService.ts         # Muse Board 서비스
│   │
│   ├── data/                      # 정적 데이터
│   │   ├── celebGallery.ts        # K-셀럽 12명 프로필
│   │   ├── experts.ts             # 전문가 4명 프로필
│   │   ├── demoResult.ts          # Demo 분석 결과
│   │   └── productCatalog.ts      # 제품 카탈로그
│   │
│   ├── schemas/                   # Zod 스키마
│   │   └── analysisResult.ts      # AI 응답 검증 스키마
│   │
│   ├── types/                     # TypeScript 타입
│   │   └── index.ts
│   │
│   ├── i18n/                      # 다국어
│   │   ├── en.json
│   │   └── ko.json
│   │
│   └── test/                      # 테스트 설정
│       └── setup.ts               # Vitest 글로벌 모킹
│
├── vite.config.ts                 # Vite 설정
├── vitest.config.ts               # Vitest 설정
├── tsconfig.json                  # TypeScript 설정
├── vercel.json                    # Vercel SPA 리라이트 + 보안 헤더
├── .prettierrc                    # Prettier 설정
├── .github/workflows/ci.yml      # GitHub Actions CI (테스트 + 빌드)
└── docs/                          # 프로젝트 문서
```

---

## Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (Vite HMR) |
| `npm run build` | 프로덕션 빌드 → `/dist` |
| `npm run preview` | 빌드 결과물 로컬 프리뷰 |
| `npm test` | Vitest watch 모드 |
| `npm run test:run` | 테스트 1회 실행 (CI용) |
| `npm run format` | Prettier 코드 포매팅 |

---

## Testing

65개 테스트, 7개 파일:

| 카테고리 | 파일 | 테스트 수 |
|---------|------|----------|
| Unit | `colorService.test.ts` | 19 |
| Unit | `cartStore.test.ts` | 10 |
| Unit | `analysisResult.test.ts` | 7 |
| Unit | `productService.test.ts` | 5 |
| Integration | `AnalysisResultView.test.tsx` | 10 |
| Integration | `CelebGalleryView.test.tsx` | 8 |
| Integration | `ScanView.test.tsx` | 6 |

```bash
npm run test:run
```

---

## Environment Variables

`.env.local`에 필요한 변수:

```
VITE_GEMINI_API_KEY=your_key_here

# Optional (Supabase 연동 시)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Key Features

### AI 얼굴 분석
- Gemini 3 Pro 멀티모달 분석 (프롬프트 v5.1)
- 멜라닌 지수 (L1-L6) 기반 포용적 분석
- 셀럽 스타일 → 사용자 인종/골격에 맞게 적응
- 재시도 (2회, 지수 백오프) + 30초 타임아웃 + 클라이언트 레이트 리미팅

### 멜라닌 기반 발색 렌더링
- Photoshop Multiply/Screen 블렌드 모드
- 멜라닌 레벨별 불투명도 자동 조절
- Tint/Cushion/Matte 3단계 발색 시뮬레이션

### K-셀럽 갤러리
- 12명의 셀럽 프로필 (장르/무드 필터)
- 갤러리에서 선택 → 스캔 페이지로 자동 연결
- 접근성: ARIA radiogroup 패턴, 키보드 탐색

### 전문가 매칭
- 4명의 전문가 (전문 분야, 가격대, 언어, 평점)
- 외부 예약 링크 연결

### 에러 복구
- 라우트별 ErrorBoundary (Retry/Home 복구 UI)
- demoMode race condition 방지 (타이머 클리어)
- AbortController 기반 분석 취소
- Gemini 에러 분류: TIMEOUT, RATE_LIMITED, NETWORK, VALIDATION, ABORTED

### 접근성 (a11y)
- Toggle: `role="switch"` + `aria-checked` + 키보드 지원 (Enter/Space)
- AuthModal: `role="dialog"` + `aria-modal` + Escape 닫기 + 포커스 트랩
- Navbar: `aria-current="page"` + `aria-expanded` + 동적 aria-label
- CelebGallery: `role="radiogroup"` + `role="radio"` + `aria-checked`
- 폼 요소: `htmlFor`, `aria-required`, `autoComplete`
- 시각적 포커스: `focus-visible:ring-2` 전체 적용

### 코드 스플리팅
- `React.lazy()` + `Suspense`로 모든 뷰 라우트 기반 분리
- 메인 번들 833KB → 733KB (뷰별 청크 자동 생성)

### 보안
- Vercel 응답 헤더: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- SEO: Open Graph + Twitter Card 메타 태그

---

## Deployment

Vercel에 배포됨 — `main` 브랜치 push 시 자동 배포.

`vercel.json`에서 SPA 리라이트 + 보안 헤더 설정:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ]
  }]
}
```

### CI/CD

GitHub Actions (`main` 브랜치 push/PR):
- `npm ci` → `npm run test:run` → `npm run build`
- `.github/workflows/ci.yml`

---

## Documentation

### Strategic Docs (전략)

| 문서 | 내용 |
|------|------|
| [01-design-system.md](docs/01-design-system.md) | 색상, 타이포, 간격, 컴포넌트, 애니메이션, 디자인 원칙 |
| [02-product-vision.md](docs/02-product-vision.md) | 제품 비전, 타겟 유저, 코어 플로우, 로드맵 |
| [03-ai-inclusivity-framework.md](docs/03-ai-inclusivity-framework.md) | 멜라닌 지수, AI 윤리, 프롬프트 가이드, 발색 렌더링 |
| [04-data-model-spec.md](docs/04-data-model-spec.md) | 데이터 모델, 타입 정의, 확장 계획 |
| [05-architecture-decisions.md](docs/05-architecture-decisions.md) | 기술 선택 근거 (ADR), 아키텍처 현황, 코드 스플리팅, 접근성, CI/CD |

### Tactical Docs (실무)

| 문서 | 내용 |
|------|------|
| [06-developer-guide.md](docs/06-developer-guide.md) | 로컬 셋업, 환경변수, 스크립트, 프로젝트 구조, Known Gotchas |
| [07-app-state-flow.md](docs/07-app-state-flow.md) | Zustand 스토어, React Router 라우팅, 데이터 흐름 |
| [08-gemini-integration.md](docs/08-gemini-integration.md) | API 프롬프트 v5.1, Zod 스키마 검증, 에러 핸들링, 복원력 (retry/timeout/rate limit) |
| [09-component-patterns.md](docs/09-component-patterns.md) | 컴포넌트 인벤토리, 뷰 추가 절차, 애니메이션/스타일 컨벤션 |

---

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) 참조.
