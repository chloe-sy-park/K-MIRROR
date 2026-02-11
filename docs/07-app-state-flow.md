# K-MIRROR Application State & Data Flow

> 화면 전환, 상태 관리, 데이터 흐름을 정의하는 문서.
> 새 화면 추가나 상태 변경 전에 반드시 이 문서를 참조한다.
> 관련 문서: [02-product-vision.md](./02-product-vision.md), [09-component-patterns.md](./09-component-patterns.md)

---

## 1. AppStep 상태 머신

### 1-1. 전체 상태 목록

`types.ts` (line 64)에서 정의:

| 값 | 이름 | 설명 | 구현 상태 |
|----|------|------|----------|
| 0 | `ONBOARDING` | 첫 진입 — 환경/스킬/무드 선택 | 구현 완료 |
| 1 | `IDLE` | 메인 스캔 페이지 — 이미지 업로드 | 구현 완료 |
| 2 | `ANALYZING` | 로딩/스캔 애니메이션 | 구현 완료 |
| 3 | `RESULT` | 전체 분석 결과 표시 | 구현 완료 |
| 4 | `CHECKOUT` | 제품 구매 플로우 | 구현 완료 |
| 5 | `MUSEBOARD` | Muse Board | 플레이스홀더 ("Coming Soon") |
| 6 | `SETTINGS` | 설정 토글 | 구현 완료 |
| 7 | `STYLIST` | 전문가 매칭 뷰 | 구현 완료 |
| 8 | `METHODOLOGY` | Sherlock 방법론 설명 | 구현 완료 |
| 9 | `PARTNER_DASHBOARD` | 파트너 대시보드 | enum만 존재, 뷰 없음 |

### 1-2. 상태 전환 다이어그램

```
                    ┌──────────────────────────────────────────────────┐
                    │              Nav 클릭 (어디서든)                   │
                    │   ┌─MUSEBOARD  ┌─STYLIST  ┌─METHODOLOGY          │
                    │   │            │          │            ┌─SETTINGS│
                    │   ▼            ▼          ▼            ▼         │
                    └──[Coming Soon] [Experts] [Sherlock] [Settings]───┘
                                       ▲                     │
                                       │ onBookSession       │ Reset Data
                    ┌──────────────────┘                     ▼
                    │
  ┌──────────┐   ┌──────┐   ┌───────────┐   ┌────────┐   ┌──────────┐
  │ONBOARDING│──▶│ IDLE │──▶│ ANALYZING │──▶│ RESULT │──▶│ CHECKOUT │
  └──────────┘   └──────┘   └───────────┘   └────────┘   └──────────┘
       ▲           ▲ ▲         │                │
       │           │ │  API 실패│                │ onReset
       └───────────┘ └─────────┘                └─────────▶ IDLE
      Reset Data
```

### 1-3. 전환 트리거 상세

| From | To | 트리거 | 코드 위치 |
|------|----|--------|----------|
| ONBOARDING | IDLE | `handleOnboardingComplete(prefs)` | App.tsx:884-887 |
| IDLE | ANALYZING | `handleAnalyze()` (두 이미지 있을 때) | App.tsx:863-868 |
| IDLE | ANALYZING | `handleDemoMode()` (비커 아이콘) | App.tsx:876-882 |
| ANALYZING | RESULT | API 성공 → `setResult(res)` | App.tsx:868-869 |
| ANALYZING | IDLE | API 실패 → `catch` | App.tsx:870-873 |
| RESULT | CHECKOUT | `handleCheckout()` | App.tsx:894-896 |
| RESULT | IDLE | `handleReset()` → `setResult(null)` | App.tsx:889-892 |
| SETTINGS | ONBOARDING | "Reset Neural Stylist Data" 버튼 | App.tsx:1082 |
| METHODOLOGY | STYLIST | `onBookSession()` 콜백 | App.tsx:1058 |
| 어디서든 | IDLE | 로고 클릭 | App.tsx:909 |
| 어디서든 | 각 뷰 | Nav 버튼 클릭 | App.tsx:917-933 |

---

## 2. Root State 변수 인벤토리

모든 상태는 `App` 컴포넌트 내부에서 관리된다 (App.tsx:855-861):

| 변수 | 타입 | 초기값 | 용도 |
|------|------|--------|------|
| `step` | `AppStep` | `ONBOARDING` | 현재 화면 |
| `userImage` | `string \| null` | `null` | 사용자 bare-face 이미지 (base64, prefix 없음) |
| `celebImage` | `string \| null` | `null` | K-셀럽 영감 이미지 (base64, prefix 없음) |
| `isSensitive` | `boolean` | `false` | 민감 피부 성분 필터 on/off |
| `prefs` | `UserPreferences` | `{Office, Beginner, Natural}` | 온보딩에서 설정한 선호도 |
| `result` | `AnalysisResult \| null` | `null` | Gemini API 응답 결과 |
| `isMenuOpen` | `boolean` | `false` | 모바일 메뉴 열림/닫힘 |

### 특이사항

- `useEffect`, `useRef`, `useContext`, `useReducer` 전혀 없음
- `useState` 7개가 전부
- 모든 상태가 App 컴포넌트 로컬 — 전역 상태 관리 없음
- 자식 뷰에는 props + callback으로 전달

---

## 3. 데이터 흐름: 분석 파이프라인

### 3-1. 입력 조립

```
UserPreferences (온보딩에서 설정, prefs state)
  + userImage  (base64, LuxuryFileUpload에서 업로드)
  + celebImage (base64, LuxuryFileUpload에서 업로드)
  + isSensitive (boolean, Toggle에서 설정)
      │
      ▼
  analyzeKBeauty(userImage, celebImage, isSensitive, prefs)
      │  (services/geminiService.ts)
      ▼
  AnalysisResult (parsed JSON)
```

### 3-2. API 호출 흐름

```typescript
// App.tsx:863-874
const handleAnalyze = async () => {
  if (!userImage || !celebImage) return;   // 가드: 두 이미지 모두 필요
  try {
    setStep(AppStep.ANALYZING);            // 로딩 UI 표시
    const res = await analyzeKBeauty(...); // Gemini API 호출
    setResult(res);                        // 결과 저장
    setStep(AppStep.RESULT);               // 결과 UI 표시
  } catch (err) {
    console.error(err);                    // 에러 로깅만
    setStep(AppStep.IDLE);                 // 스캔 페이지로 복귀
  }
};
```

### 3-3. 결과 소비

`AnalysisResult`는 `result` state에 저장된 후 두 뷰에서 소비:

```
result
  ├── AnalysisResultView (RESULT 화면)
  │   ├── result.tone        → Forensic Mapping 카드
  │   ├── result.sherlock     → SherlockProportionVisualizer
  │   ├── result.kMatch       → Adaptation 카드 + 스타일 설명
  │   ├── result.recommendations.products → 제품 그리드
  │   └── result.recommendations.videos   → Curated Education 섹션
  │
  └── GlobalCheckoutView (CHECKOUT 화면)
      └── result.recommendations.products → 주문 요약 + 가격 계산
```

### 3-4. Demo Mode 데이터 흐름

```
[비커 아이콘 클릭]
  → handleDemoMode() (App.tsx:876)
  → setStep(ANALYZING)              // 로딩 UI 표시
  → setTimeout(2000ms)              // 2초 딜레이 (분석 느낌)
  → setResult(DEMO_RESULT)          // App.tsx:457의 하드코딩 상수
  → setStep(RESULT)                 // 결과 표시
```

- **API 호출 없음** — Gemini API 키 없어도 동작
- DEMO_RESULT: Melanin L5 (Deep Cool-Ebony) + Wonyoung(IVE) 매칭

---

## 4. View-to-State 매핑

각 뷰가 어떤 state를 읽고 쓰는지:

| 뷰 | 읽는 상태 | 쓰는 상태 (콜백) |
|----|----------|---------------|
| `OnboardingView` | (없음) | `prefs`, `step` (via `onComplete`) |
| IDLE (인라인) | `userImage`, `celebImage`, `isSensitive` | `userImage`, `celebImage`, `isSensitive`, `step` |
| ANALYZING (인라인) | `userImage` | (없음, App이 제어) |
| `AnalysisResultView` | `result` | `step` (via `onReset`, `onCheckout`) |
| `GlobalCheckoutView` | `result` | (로컬만: `shippingMethod`) |
| `ExpertMatchingView` | (없음) | (없음) |
| `MethodologyView` | (없음) | `step` (via `onBookSession`) |
| SETTINGS (인라인) | `isSensitive` | `isSensitive`, `step` |
| MUSEBOARD (인라인) | (없음) | (없음, 플레이스홀더) |

---

## 5. 네비게이션 구현

### 데스크탑 (lg: 이상)

5개 버튼이 고정 네비게이션 바에 표시 (App.tsx:917-933):

```
[Scan] [Muse Board] [Match] [Sherlock] [Settings]
```

- 활성 상태: `text-black border-b-2 border-[#FF4D8D]`
- 비활성: `text-gray-400`
- "Scan"은 IDLE, ANALYZING, RESULT, CHECKOUT일 때 모두 활성 표시 (line 928)

### 모바일 (lg 미만)

- 햄버거 아이콘 (App.tsx:936)
- 클릭 시 풀스크린 오버레이 (AnimatePresence, lines 948-972)
- 각 항목에 Lucide 아이콘 포함
- 항목 클릭 시 `setIsMenuOpen(false)`로 메뉴 닫기

---

## 6. 이미지 핸들링 디테일

### 업로드 → State

```typescript
// LuxuryFileUpload (App.tsx:69-115)
const reader = new FileReader();
reader.readAsDataURL(file);
reader.onloadend = () => {
  // FileReader 결과: "data:image/jpeg;base64,/9j/4AAQ..."
  // split(',')[1]로 prefix 제거: "/9j/4AAQ..."
  const base64String = (reader.result as string).split(',')[1];
  onImageSelect(base64String);
};
```

**왜 prefix를 제거하는가?** Gemini API의 `inlineData`는 raw base64만 받고 `mimeType`을 별도 필드로 전달하기 때문.

### State → 화면 표시

```jsx
// 미리보기 표시 시 prefix 다시 추가
<img src={`data:image/jpeg;base64,${preview}`} />
```

### State → API 전송

```typescript
// geminiService.ts:43-44
{ inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } }
{ inlineData: { mimeType: 'image/jpeg', data: celebImageBase64 } }
```

### 주의사항

| 이슈 | 설명 |
|------|------|
| mimeType 고정 | PNG, WebP를 올려도 `image/jpeg`로 전송. Gemini가 자동 감지하므로 대부분 동작하지만 정확하지 않음 |
| 메모리 보관 | base64 문자열이 React state에 상주. 5MB 이미지 → ~6.7MB base64 → 브라우저 메모리 부담 |
| 영속성 없음 | 새로고침 시 모든 이미지 소멸. Muse Board 구현 시 서버 저장 필요 |
| 크기 제한 없음 | 업로드 이미지 리사이즈/압축 없음. Gemini API 입력 제한에 걸릴 수 있음 |
