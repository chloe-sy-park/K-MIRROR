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
# .env.local에 Gemini API 키 입력
npm run dev
```

앱이 `http://localhost:3000`에서 실행됩니다.

### Demo Mode

API 키 없이 UI를 확인하려면:
1. Onboarding 완료
2. 스캔 페이지에서 분홍색 **비커 아이콘** 클릭
3. 2초 후 샘플 분석 결과가 표시됩니다

---

## Tech Stack

| 기술 | 용도 |
|------|------|
| React 19 + TypeScript | UI 프레임워크 |
| Vite 6 | 빌드 도구 |
| Google Gemini 3 Pro | 얼굴 분석 + 스타일 매칭 AI |
| Tailwind CSS | 스타일링 |
| Framer Motion 12 | 애니메이션 |
| Lucide React | 아이콘 |

---

## Project Structure

```
K-MIRROR/
├── App.tsx                 # 메인 앱 (모든 뷰, 상태, 컴포넌트)
├── types.ts                # TypeScript 인터페이스 + AppStep enum
├── index.tsx               # React 진입점
├── services/
│   └── geminiService.ts    # Gemini API 연동
├── index.html              # HTML 셸, CDN imports, CSS 변수
├── vite.config.ts           # Vite 설정, 환경변수 매핑
├── .env.local.example      # 환경변수 템플릿
└── docs/                   # 프로젝트 문서
```

---

## Environment Variables

`.env.local`에 하나의 변수만 필요합니다:

```
GEMINI_API_KEY=your_key_here
```

Vite가 이 값을 `process.env.API_KEY`와 `process.env.GEMINI_API_KEY` 두 이름으로 빌드 타임에 주입합니다. 자세한 매핑은 [06-developer-guide.md](docs/06-developer-guide.md#4-환경변수-매핑-중요) 참조.

---

## Documentation

### Strategic Docs (전략)

| 문서 | 내용 |
|------|------|
| [01-design-system.md](docs/01-design-system.md) | 색상, 타이포, 간격, 컴포넌트, 애니메이션, 디자인 원칙 |
| [02-product-vision.md](docs/02-product-vision.md) | 제품 비전, 타겟 유저, 코어 플로우, 로드맵 |
| [03-ai-inclusivity-framework.md](docs/03-ai-inclusivity-framework.md) | 멜라닌 지수, AI 윤리, 프롬프트 가이드, 발색 렌더링 |
| [04-data-model-spec.md](docs/04-data-model-spec.md) | 데이터 모델, 타입 정의, 확장 계획 |
| [05-architecture-decisions.md](docs/05-architecture-decisions.md) | 기술 선택 근거 (ADR), 목표 구조, 기술 부채 |

### Tactical Docs (실무)

| 문서 | 내용 |
|------|------|
| [06-developer-guide.md](docs/06-developer-guide.md) | 로컬 셋업, 환경변수, 스크립트, Demo Mode, Known Gotchas |
| [07-app-state-flow.md](docs/07-app-state-flow.md) | AppStep 상태 머신, 데이터 흐름, 네비게이션, 이미지 핸들링 |
| [08-gemini-integration.md](docs/08-gemini-integration.md) | API 프롬프트, 응답 스키마, 에러 핸들링, 필드 추가 체크리스트 |
| [09-component-patterns.md](docs/09-component-patterns.md) | 컴포넌트 인벤토리, 새 뷰 추가 절차, 애니메이션/스타일 컨벤션 |

---

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) 참조.

---

## AI Studio

View app in AI Studio: https://ai.studio/apps/drive/1WvreuwNIAR_n-SmZiPK2qZ9hLJHFve63
