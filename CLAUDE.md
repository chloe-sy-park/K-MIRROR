# CLAUDE.md — K-MIRROR AI

## 소통 규칙

- 모든 대화, 커밋 메시지, 코드 주석은 **한국어**로 작성한다
- 에러 설명도 쉬운 한국어로 한다 (전문 용어는 괄호로 보충)
- 코드 내 변수명/함수명은 영어 유지 (camelCase/PascalCase 컨벤션)

## 작업 방식

- 큰 변경 전에는 항상 **계획을 먼저 설명**하고 승인을 받을 것
- 디자인/UX 관련 선택지가 있으면 **옵션을 제시**하고 사용자가 선택하게 할 것
- 잘 모르겠는 부분은 **임의로 판단하지 말고 질문**할 것
- 작업 완료 후 **변경사항을 요약**해줄 것
- 파일 수정 전에 항상 **현재 구조를 먼저 확인**할 것

## 승인 규칙

사용자는 비개발자이므로 위험도를 Claude가 판단한다.

### 그냥 진행해도 되는 것

- 오타 수정, 클래스명 변경, 텍스트 수정
- 코드 주석 추가/수정
- 파일 정리 (안 쓰는 import 삭제 등)
- CSS/스타일 미세 조정

### 반드시 먼저 물어볼 것

- 새 파일 생성 또는 파일 삭제
- 컴포넌트 구조 변경 (파일 합치기, 쪼개기)
- 패키지 설치/삭제 (`npm install` 등)
- 외부 API 연결이나 환경변수 변경
- 디자인/UX 관련 판단이 필요한 경우
- 10개 이상 파일을 동시에 수정하는 경우

### 물어볼 때 형식

- 뭘 왜 바꾸려는지 쉬운 한국어로 설명
- 위험도를 **상/중/하**로 알려줄 것
- 되돌리기 쉬운지도 알려줄 것

## 컨텍스트 관리

- 컨텍스트 사용량이 70%를 넘으면 사용자에게 알릴 것
- "새 채팅에서 이어서 하는 게 좋겠어요"라고 제안할 것
- 새 채팅으로 넘어갈 때 현재까지의 **작업 요약**을 먼저 정리할 것 (뭘 했는지 + 다음에 뭘 해야 하는지)

## Git 워크플로우

- **main 브랜치에서 바로 작업**한다 (별도 브랜치 불필요)
- 작업이 끝나면 커밋하고 main에 푸시
- 커밋 메시지는 **한국어**로, 뭘 바꿨는지 명확하게 작성
- 푸시하면 Vercel이 자동 배포하므로 별도 배포 작업 불필요
- 푸시 전에 **"깃허브에 올릴게요"**라고 알릴 것
- **에러가 있는 상태에서는 절대 푸시하지 말 것** (lint + test:run + build 통과 확인)

## 작업 현황 기록

- 진행 상황 업데이트는 `docs/` 폴더에 기록한다

---

## 프로젝트 개요

AI 얼굴 분석 → K-셀럽 스타일을 사용자 인종/골격에 맞게 변환하는 글로벌 K-Beauty 스타일리스트 SPA.
Gemini 3 Pro 멀티모달 API를 브라우저에서 직접 호출하고, Zod로 응답을 런타임 검증한다.

## 필수 커맨드

- `npm run dev` — 개발 서버 (port 3000)
- `npm run test:run` — 테스트 1회 실행 (65개, Vitest)
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm install` — 반드시 `--legacy-peer-deps` 필요 (.npmrc에 설정됨)

## CI 파이프라인

GitHub Actions: `npm ci --legacy-peer-deps` → lint → test:run → build
push/PR to main 시 자동 실행.

## 아키텍처

```
src/
├── views/           # 페이지 뷰 — [Name]View.tsx (PascalCase)
├── components/      # 재사용 컴포넌트 (layout/, ui/, sherlock/)
├── store/           # Zustand 스토어 (persist 미들웨어, camelCase)
├── services/        # 비즈니스 로직 (camelCase)
├── schemas/         # Zod 스키마 (AI 응답 검증)
├── data/            # 정적 데이터 (셀럽, 전문가, 제품)
├── types/           # TypeScript 타입 (index.ts 단일 파일)
├── i18n/            # 다국어 (en.json, ko.json)
└── test/            # 테스트 설정 (글로벌 모킹)
```

### 핵심 패턴

- 새 뷰 추가: `views/[Name]View.tsx` 생성 → `App.tsx`에서 `React.lazy()`로 등록 → Route 추가
- 타입: 모든 타입은 `types/index.ts`에 정의. 병렬 타입 파일 금지
- 상태: Zustand 스토어 = 전역 상태, `useState` = 컴포넌트 로컬 상태
- 스타일: Tailwind 유틸리티 클래스 우선. 인라인 스타일 금지
- 스캔 플로우: scanStore의 `phase` ('idle' | 'analyzing' | 'result')에 따라 ScanView/AnalyzingView/AnalysisResultView 전환
- AI 호출: geminiService → Zod 스키마 검증 → scanStore에 결과 저장
- 코드 스플리팅: 모든 뷰는 `React.lazy()` + `Suspense`

## 코드 컨벤션

### 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트/뷰 | PascalCase | `OnboardingView`, `AuthModal` |
| 변수/함수 | camelCase | `handleAnalyze` |
| 상수 | UPPER_SNAKE_CASE | `DEMO_RESULT` |
| 파일 | 컴포넌트=PascalCase.tsx, 서비스=camelCase.ts | `geminiService.ts` |
| 이벤트 핸들러 | `handle[Action]` | `handleReset` |
| 콜백 Props | `on[Action]` | `onComplete` |

### 스타일 규칙

- Prettier: singleQuote, trailingComma: all, semi: true, printWidth: 120, tabWidth: 2
- 브랜드 핑크: `#FF4D8D` — 다른 브랜드 컬러 추가 금지
- 버튼/라벨: 항상 `uppercase`
- `rounded-none` 사용 금지
- 포커스: `focus-visible:ring-2 focus-visible:ring-[#FF4D8D]` (`focus:outline-none` 금지)

### 접근성 (필수)

- 인터랙티브 요소에 ARIA role (`role="switch"`, `role="dialog"` 등)
- 키보드 지원 (Enter/Space, Escape)
- 폼 요소에 `htmlFor` + `aria-label`
- 장식용 아이콘에 `aria-hidden="true"`
- 패턴 참조: `docs/09-component-patterns.md` §8

## Gotchas

- **환경변수명**: Gemini 키는 `GEMINI_API_KEY` (VITE_ 접두사 없음, vite.config.ts의 define에서 매핑)
- **npm install**: `--legacy-peer-deps` 필수 (.npmrc에 설정됨, CI도 동일)
- **테스트 모킹**: `@google/genai`, `@supabase/supabase-js`, `framer-motion`, `react-i18next` 모두 글로벌 모킹 (`src/test/setup.ts`)
- **Tailwind v4**: `@tailwindcss/vite` 플러그인 사용 (PostCSS 아님)
- **TypeScript strict 모드**: `noUncheckedIndexedAccess: true` — 인덱스 접근 시 `undefined` 체크 필요
- **PWA**: `vite-plugin-pwa` 사용 — Service Worker 캐싱 설정 있음
- **경로 별칭**: `@/` = `src/` (vite.config.ts + tsconfig.json에 설정)
- **Demo 모드**: 스캔 페이지에서 비커 아이콘 클릭 → `demoResult.ts`의 샘플 데이터 사용

## 문서 연동 규칙

코드 변경 시 관련 문서를 함께 업데이트:

| 변경 내용 | 문서 |
|----------|------|
| 새 라우트/뷰 추가 | `docs/07-app-state-flow.md` |
| 새 컴포넌트 추가 | `docs/09-component-patterns.md` |
| Gemini 프롬프트 수정 | `docs/08-gemini-integration.md` |
| 타입 추가/수정 | `docs/04-data-model-spec.md` |
| 디자인 토큰 변경 | `docs/01-design-system.md` |
| 새 의존성 추가 | `docs/06-developer-guide.md` |

## 현재 Phase

- Phase 1 완료 (얼굴 분석, 셀럽 갤러리, 숍, 장바구니, Muse Board 기본, 접근성, 코드 스플리팅)
- Phase 2 계획 수립됨 (`PLAN.md` 참조): MuseBoard 고도화 + YouTube 하이브리드 큐레이션
