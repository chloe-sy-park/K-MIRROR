# Contributing to K-MIRROR

K-MIRROR에 기여해주셔서 감사합니다. 이 문서는 코드 작성, 리뷰, PR 제출까지의 가이드입니다.

---

## Getting Started

1. 환경 세팅: [docs/06-developer-guide.md](docs/06-developer-guide.md)
2. 상태 흐름 이해: [docs/07-app-state-flow.md](docs/07-app-state-flow.md)
3. Demo Mode로 UI 확인 (API 키 없이 가능)

---

## Git Workflow

### 브랜치 네이밍

```
feature/short-description   # 새 기능
fix/short-description        # 버그 수정
docs/short-description       # 문서 변경
refactor/short-description   # 리팩토링
```

### 커밋 메시지

Imperative mood (명령형) 사용:

```
feat: Add K-celeb gallery catalog
fix: Handle null response from Gemini API
docs: Update data model spec with skinHexCode field
refactor: Extract Toggle component to separate file
```

### 기본 규칙

- Base 브랜치: `main`
- 커밋은 작고 집중적으로 (하나의 변경 = 하나의 커밋)
- Force push 금지 (`main` 브랜치)

---

## Code Standards

### TypeScript

- `types.ts`의 인터페이스를 사용한다. 병렬 타입 정의 금지.
- `any` 최소화 (현재 `SherlockProportionVisualizer`에 하나 존재 — 기술 부채)
- 함수 파라미터와 리턴 타입에 명시적 타입 부여

### React

- Function 컴포넌트만 (arrow function)
- 전역 상태: Zustand 스토어 (`store/` 디렉토리)
- `useState`는 컴포넌트 로컬 상태에만 사용
- `useEffect`는 꼭 필요한 경우에만
- 새 뷰는 `views/` 디렉토리에 파일 생성 → `App.tsx`에서 `React.lazy()`로 등록
- Props 인터페이스를 인라인 또는 `types/index.ts`에 정의

### 스타일링

- [01-design-system.md](docs/01-design-system.md)의 디자인 토큰 준수
- Tailwind 유틸리티 클래스 우선 사용
- 인라인 스타일 금지
- Border radius: 절대 `rounded-none` 사용 금지
- 색상: `#FF4D8D` (브랜드 핑크) 외의 컬러 아이덴티티 추가 금지
- 라벨/버튼: 항상 `uppercase`

### 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `OnboardingView` |
| 변수/함수 | camelCase | `handleAnalyze` |
| 상수 | UPPER_SNAKE_CASE | `DEMO_RESULT` |
| 파일 | PascalCase.tsx (컴포넌트), camelCase.ts (서비스) | `geminiService.ts` |
| View 컴포넌트 | `[Name]View` 접미사 | `CommunityView` |
| 이벤트 핸들러 | `handle[Action]` | `handleReset` |
| 콜백 Props | `on[Action]` | `onComplete` |

---

## 문서 업데이트 규칙

코드 변경 시 관련 문서를 함께 업데이트해야 한다:

| 변경 내용 | 업데이트 대상 문서 |
|----------|-----------------|
| 새 라우트/뷰 추가 | `07-app-state-flow.md` |
| 새 뷰/컴포넌트 추가 | `09-component-patterns.md` |
| Gemini 프롬프트 수정 | `08-gemini-integration.md` |
| responseSchema 변경 | `08-gemini-integration.md` |
| 타입 추가/수정 | `04-data-model-spec.md` |
| 디자인 토큰 변경 | `01-design-system.md` |
| AI 윤리 가드레일 변경 | `03-ai-inclusivity-framework.md` |
| 새 의존성 추가 | `06-developer-guide.md` |

---

## Pull Request 프로세스

### 제출 전 체크리스트

- [ ] `npm run dev`로 로컬 동작 확인
- [ ] `npm run test:run` 모든 테스트 통과
- [ ] `npm run build` 성공 (TypeScript 에러 없음)
- [ ] Demo Mode로 UI 확인 (API 없이)
- [ ] AI 로직 변경 시 — 실제 API로 테스트
- [ ] 새 인터랙티브 요소에 ARIA 속성 + 키보드 지원 추가
- [ ] 관련 문서 업데이트 완료
- [ ] UI 변경 시 스크린샷 포함

### PR 설명 작성

```markdown
## Summary
- 무엇을 왜 변경했는지 (1-3줄)

## Changes
- 변경 파일 목록과 핵심 내용

## Test plan
- 어떻게 테스트했는지

## Screenshots
- (UI 변경 시)
```

---

## 접근성 가이드라인

새 컴포넌트 작성 시 반드시 준수:

- 인터랙티브 요소에 적절한 ARIA role 부여 (`role="switch"`, `role="dialog"` 등)
- 키보드 탐색 지원 (Enter/Space, Escape)
- `focus:outline-none` 사용 금지 → `focus-visible:ring-2 focus-visible:ring-[#FF4D8D]` 사용
- 폼 요소에 `htmlFor` + `aria-label` 또는 `aria-labelledby`
- 장식용 아이콘에 `aria-hidden="true"`
- 상세 패턴: [09-component-patterns.md](docs/09-component-patterns.md) §8 참조

---

## 기여 환영 영역

현재 기술 부채 목록은 [05-architecture-decisions.md](docs/05-architecture-decisions.md) 하단 참조.

### 해소 완료 ~~(더 이상 기여 불필요)~~

- ~~App.tsx 모놀리식 → 컴포넌트 분리~~ ✅ Sprint 1
- ~~에러 처리 UI 추가~~ ✅ Sprint 1 (ErrorBoundary + ErrorToast)
- ~~Zod 스키마 검증~~ ✅ Sprint 1
- ~~다국어 (i18n) 기반 구축~~ ✅ Sprint 1
- ~~Font Awesome CDN 제거~~ ✅ (Lucide Icons 전환)
- ~~접근성 기본 적용~~ ✅ Sprint 2
- ~~코드 스플리팅~~ ✅ Sprint 2
- ~~Gemini 복원력~~ ✅ Sprint 2

### 현재 기여가 필요한 영역

- 이미지 업로드 시 리사이즈/압축
- mimeType 자동 감지
- ESLint 설정 + 규칙 강제
- TypeScript strict 모드 전환
- Framer Motion 트리 셰이킹 (LazyMotion)
- 추가 테스트 커버리지 (geminiService, scanStore)
- Skip to content 링크 + 페이지 전환 시 document.title 업데이트
- 결과 캐싱 (동일 입력 → 로컬 캐시)
