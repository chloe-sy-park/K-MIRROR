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
# .env.local을 열어서 GEMINI_API_KEY에 실제 키 입력

# 4. 개발 서버 실행
npm run dev
# → http://localhost:3000 에서 앱 확인
```

---

## 4. 환경변수 매핑 (중요)

`.env.local`에는 **단 하나의 변수**만 필요하다:

```
GEMINI_API_KEY=your_actual_key
```

### 매핑 흐름

```
.env.local
  └── GEMINI_API_KEY = "sk-..."
        │
        ▼  vite.config.ts (line 6): loadEnv(mode, '.', '')
        │
        ├── process.env.API_KEY        ← geminiService.ts가 사용 (line 12)
        └── process.env.GEMINI_API_KEY  ← 호환용 alias (동일 값)
```

**왜 이름이 다른가?**

- `.env.local`에는 `GEMINI_API_KEY`로 저장
- `vite.config.ts` (lines 14-15)에서 `loadEnv()`로 읽은 뒤 `define`으로 두 이름에 모두 매핑
- `geminiService.ts` (line 12)는 `process.env.API_KEY`를 읽음
- 이 `process.env.*`는 Node.js 런타임 환경변수가 아님 — Vite의 **빌드 타임 치환**

---

## 5. Available Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (port 3000, host 0.0.0.0) |
| `npm run build` | 프로덕션 빌드 → `/dist` |
| `npm run preview` | 빌드된 결과물 로컬 프리뷰 |

---

## 6. 이중 모듈 시스템 (CDN + npm)

K-MIRROR는 의존성을 **두 곳에서** 로드한다:

### A. CDN Importmap (index.html lines 63-74)

```json
{
  "react": "https://esm.sh/react@^19.2.4",
  "@google/genai": "https://esm.sh/@google/genai@^1.40.0",
  "lucide-react": "https://esm.sh/lucide-react@^0.563.0",
  "framer-motion": "https://esm.sh/framer-motion@^12.34.0"
}
```

- 브라우저가 직접 `esm.sh`에서 모듈을 가져옴
- **Google AI Studio 배포 시** 이 방식이 사용됨

### B. npm packages (package.json)

```json
"react": "^19.0.0",
"@google/genai": "^1.3.0",
"lucide-react": "^0.462.0",
"framer-motion": "^12.0.0"
```

- `npm install`로 설치, Vite 번들러가 사용
- `npm run dev` / `npm run build` 시 이 패키지가 사용됨

### 주의

- Importmap의 caret 버전(`^19.2.4`)은 "최신 마이너"를 의미 — 예기치 않은 breaking 가능
- `esm.sh`가 다운되면 AI Studio 배포판이 작동 중단
- 로컬 개발 시에는 npm 패키지 사용 → CDN과 버전 차이 가능성 있음

---

## 7. Demo Mode

API 키 없이도 UI를 확인할 수 있다:

1. `npm run dev`로 앱 실행
2. Onboarding 완료 (아무 값이나 선택)
3. IDLE(스캔) 페이지에서 **비커 아이콘** (분홍색, 우측 상단) 클릭
4. 2초 후 `DEMO_RESULT` 상수가 로드됨

### 코드 흐름

```
[비커 클릭]
  → handleDemoMode() (App.tsx:876)
  → setStep(ANALYZING)
  → setTimeout(2000ms)
  → setResult(DEMO_RESULT)  ← App.tsx:457의 하드코딩 데이터
  → setStep(RESULT)
```

- API 호출 없음 — API 키 없어도 동작
- UI 개발, 스타일 작업 시 API 쿼터를 아낄 수 있음
- DEMO_RESULT는 Melanin L5 (Deep Cool-Ebony) + Wonyoung(IVE) 스타일 매칭 시나리오

---

## 8. 프로젝트 파일 맵

```
K-MIRROR/
├── App.tsx                    # 모놀리식 앱 (1107줄)
│                              #   ├── Animation Variants (lines 17-52)
│                              #   ├── Helper Components (lines 54-115)
│                              #   │   ├── Toggle
│                              #   │   └── LuxuryFileUpload
│                              #   ├── SherlockProportionVisualizer (lines 119-173)
│                              #   ├── MethodologyView (lines 178-327)
│                              #   ├── OnboardingView (lines 329-411)
│                              #   ├── ExpertMatchingView (lines 413-453)
│                              #   ├── Mock Data (lines 455-515)
│                              #   │   ├── DEMO_RESULT
│                              #   │   └── TRANSFORMATION_SAMPLES (미사용)
│                              #   ├── GlobalCheckoutView (lines 519-631)
│                              #   ├── AnalysisResultView (lines 633-851)
│                              #   └── App (main) (lines 854-1107)
│                              #       ├── State hooks (lines 855-861)
│                              #       ├── Handlers (lines 863-896)
│                              #       ├── Nav (lines 904-974)
│                              #       ├── Main views (lines 976-1092)
│                              #       └── Footer (lines 1095-1102)
│
├── types.ts                   # 모든 TypeScript 인터페이스 + AppStep enum
├── index.tsx                  # React 진입점 (ReactDOM.createRoot)
│
├── services/
│   └── geminiService.ts       # Gemini API 연동 (149줄)
│
├── index.html                 # HTML 셸, CDN imports, Tailwind, 폰트, CSS 변수
├── vite.config.ts             # Vite 설정, 환경변수 매핑
├── metadata.json              # Google AI Studio 앱 메타데이터
├── tsconfig.json              # TypeScript 설정
├── package.json               # npm 의존성
│
├── .env.local.example         # 환경변수 템플릿
├── .env.local                 # 실제 키 (git-ignored)
│
└── docs/                      # 프로젝트 문서
    ├── 01-design-system.md
    ├── 02-product-vision.md
    ├── 03-ai-inclusivity-framework.md
    ├── 04-data-model-spec.md
    ├── 05-architecture-decisions.md
    ├── 06-developer-guide.md       ← 이 문서
    ├── 07-app-state-flow.md
    ├── 08-gemini-integration.md
    └── 09-component-patterns.md
```

---

## 9. Known Gotchas

### URL 기반 라우팅 없음

- `AppStep` enum으로 화면 전환 (URL 변경 없음)
- 브라우저 새로고침 → 항상 ONBOARDING으로 돌아감
- URL 공유, 뒤로가기, 북마크 불가

### Tailwind CDN 모드

- Tailwind 설정 파일 없음 (CDN이 모든 클래스를 생성)
- 커스텀 클래스는 `index.html`의 `<style>` 블록에 정의:
  `.heading-font`, `.luxury-card`, `.btn-luxury`, `.accent-gradient`, `.scanning`
- CSS 변수: `--brand-pink`, `--brand-dark`, `--brand-gray`

### 이미지 메모리

- 업로드 이미지가 base64 문자열로 React state에 보관
- 대용량 이미지 → 브라우저 메모리 부담
- 세션 종료/새로고침 시 모든 이미지 소멸

### 에러 처리 부재

- API 호출 실패 → `console.error(err)` + IDLE로 복귀 (App.tsx:870-872)
- 사용자에게 에러 메시지 표시 없음
- 네트워크 오류, API 할당량 초과, 잘못된 키 구분 없음

### mimeType 고정

- `LuxuryFileUpload`는 `accept="image/*"`로 모든 이미지 포맷 허용
- 하지만 Gemini API 전송 시 항상 `mimeType: 'image/jpeg'` 고정 (geminiService.ts:43-44)
- PNG, WebP를 올려도 JPEG으로 전송 — 대부분 동작하지만 기술적으로는 부정확

### Font Awesome 미사용

- `index.html` (line 9)에서 Font Awesome 6.4.0을 로드
- 실제 앱에서는 `lucide-react`만 사용
- ~50KB의 불필요한 CSS 로드

### TypeScript Strict 모드 비활성

- `tsconfig.json`에 `strict: true` 없음
- `SherlockProportionVisualizer`의 `proportions` prop이 `any` 타입
