# K-MIRROR Application State & Data Flow

> 라우팅, 상태 관리, 데이터 흐름을 정의하는 문서.
> 새 화면 추가나 상태 변경 전에 반드시 이 문서를 참조한다.
> 관련 문서: [02-product-vision.md](./02-product-vision.md), [09-component-patterns.md](./09-component-patterns.md)

---

## 1. 라우팅 (React Router v7)

### 1-1. 전체 라우트 목록

`App.tsx`에서 `React.lazy()`로 동적 로딩:

| 경로 | 뷰 | 설명 |
|------|-----|------|
| `/` | `ScanView` / `AnalysisResultView` | 스캔 + 분석 결과 (phase에 따라 전환) |
| `/onboarding` | `OnboardingView` | 첫 진입 — 환경/스킬/무드 선택 |
| `/celebs` | `CelebGalleryView` | K-셀럽 갤러리 + 필터 |
| `/match` | `ExpertMatchingView` | 전문가 매칭 |
| `/methodology` | `MethodologyView` | Sherlock 방법론 |
| `/settings` | `SettingsView` | 설정 (토글, 리셋) |
| `/muse` | `MuseBoardView` | Muse Board |
| `/shop` | `ShopView` | 제품 목록 |
| `/shop/:id` | `ProductDetailView` | 제품 상세 |
| `/checkout` | `GlobalCheckoutView` | 결제 |
| `/orders` | `OrdersView` | 주문 내역 |
| `*` | → `/` | 404 리다이렉트 |

### 1-2. 라우트 전환 다이어그램

```
                    ┌──────────────────────────────────────────┐
                    │           Navbar (어디서든)                │
                    │   /muse  /match  /methodology  /settings │
                    │     │      │         │            │      │
                    │     ▼      ▼         ▼            ▼      │
                    └────[Muse] [Match] [Sherlock] [Settings]───┘
                                  ▲                     │
                                  │ Book Session        │ Reset Data
                    ┌─────────────┘                     ▼
                    │
  /onboarding    /              /              /checkout
  ┌──────────┐ ┌──────┐   ┌────────┐   ┌──────────┐
  │ONBOARDING│→│ SCAN │──▶│ RESULT │──▶│ CHECKOUT │
  └──────────┘ └──────┘   └────────┘   └──────────┘
       ▲          ▲ ▲                       │
       │          │ │  scanStore.reset()     │ placeOrder
       └──────────┘ └──────────────────────▶│──▶ /orders
      Reset Data                            │
                                            │
                    /celebs                  │
                    ┌──────────────┐         │
                    │ CELEB GALLERY│──select─┘→ / (with state)
                    └──────────────┘
```

### 1-3. 주요 전환 트리거

| From | To | 트리거 | 코드 위치 |
|------|----|--------|----------|
| `/onboarding` | `/` | `settingsStore.completeOnboarding()` | `OnboardingView.tsx` |
| `/` (scan) | `/` (result) | `scanStore.analyze()` 성공 | `ScanView.tsx` |
| `/` (analyzing) | `/` (scan) | API 실패 → `scanStore.error` | `ScanView.tsx` |
| `/` (result) | `/checkout` | `navigate('/checkout')` | `AnalysisResultView.tsx` |
| `/celebs` | `/` | `navigate('/', { state: { selectedCeleb } })` | `CelebGalleryView.tsx` |
| `/settings` | `/onboarding` | `settingsStore.resetAll()` | `SettingsView.tsx` |
| `/checkout` | `/orders` | `cartStore.placeOrder()` 후 이동 | `GlobalCheckoutView.tsx` |
| 어디서든 | `/` | 로고 클릭 | `Navbar.tsx` |
| 어디서든 | 각 뷰 | Nav 링크 클릭 | `Navbar.tsx` |

---

## 2. Zustand 스토어

모든 전역 상태는 Zustand v5 스토어로 관리된다:

### 2-1. scanStore

스캔/분석 상태 관리.

| 상태 | 타입 | 설명 |
|------|------|------|
| `phase` | `'idle' \| 'analyzing' \| 'result'` | 현재 스캔 단계 |
| `userImage` | `string \| null` | 사용자 이미지 (base64) |
| `celebImage` | `string \| null` | 셀럽 이미지 (base64) |
| `result` | `AnalysisResult \| null` | AI 분석 결과 |
| `error` | `string \| null` | 에러 메시지 |
| `selectedCelebName` | `string \| null` | 갤러리에서 선택한 셀럽 이름 |

| 액션 | 설명 |
|------|------|
| `analyze()` | Gemini API 호출 (AbortController 포함) |
| `demoMode()` | 2초 지연 후 DEMO_RESULT 로드 |
| `reset()` | 모든 스캔 상태 초기화 + 타이머 클리어 |
| `setUserImage()` | 사용자 이미지 설정 |
| `setCelebImage()` | 셀럽 이미지 설정 |

### 2-2. settingsStore (persist)

설정 상태 — localStorage에 영속화 (`kmirror_settings`).

| 상태 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `isOnboarded` | `boolean` | `false` | 온보딩 완료 여부 |
| `isSensitive` | `boolean` | `false` | 민감 피부 필터 |
| `prefs` | `UserPreferences` | `{Office, Beginner, Natural}` | 온보딩 선호도 |
| `language` | `'en' \| 'ko'` | `'en'` | 언어 설정 |

| 액션 | 설명 |
|------|------|
| `completeOnboarding(prefs)` | 온보딩 완료 + 선호도 저장 |
| `toggleSensitive()` | 민감 피부 필터 토글 |
| `setLanguage(lang)` | 언어 변경 |
| `resetAll()` | 모든 설정 초기화 (온보딩 재시작) |

### 2-3. cartStore

장바구니 + 주문 관리.

| 상태 | 타입 | 설명 |
|------|------|------|
| `items` | `CartItem[]` | 장바구니 아이템 |
| `orders` | `Order[]` | 주문 내역 |

| 액션 | 설명 |
|------|------|
| `addItem(product)` | 장바구니에 추가 (이미 있으면 수량+1) |
| `removeItem(id)` | 장바구니에서 제거 |
| `updateQuantity(id, qty)` | 수량 변경 |
| `placeOrder(shippingMethod)` | 주문 생성 + 장바구니 비우기 |
| `subtotal()` | 소계 계산 |
| `total(shippingMethod)` | 배송비 포함 합계 |

### 2-4. museStore

Muse Board 관리.

| 상태 | 타입 | 설명 |
|------|------|------|
| `boards` | `Board[]` | 보드 목록 |
| `muses` | `Muse[]` | 저장된 뮤즈 목록 |
| `activeBoardId` | `string \| null` | 활성 보드 ID |
| `loading` | `boolean` | 로딩 상태 |

### 2-5. authStore

인증 상태 관리.

| 상태 | 타입 | 설명 |
|------|------|------|
| `user` | `User \| null` | 현재 사용자 |
| `isAuthenticated` | `boolean` | 인증 여부 |

---

## 3. 데이터 흐름: 분석 파이프라인

### 3-1. 입력 조립

```
settingsStore.prefs (온보딩에서 설정)
  + scanStore.userImage  (base64, LuxuryFileUpload에서 업로드)
  + scanStore.celebImage (base64, LuxuryFileUpload에서 업로드 또는 갤러리에서 선택)
  + settingsStore.isSensitive (boolean, Toggle에서 설정)
      │
      ▼
  analyzeKBeauty(userImage, celebImage, isSensitive, prefs, selectedCelebName?, signal?)
      │  (services/geminiService.ts — retry + timeout + rate limit)
      ▼
  AnalysisResult (Zod 검증 통과)
```

### 3-2. API 호출 흐름

```typescript
// scanStore.ts — analyze()
const controller = new AbortController();
set({ phase: 'analyzing', error: null });

try {
  const result = await analyzeKBeauty(
    userImage, celebImage, isSensitive, prefs,
    selectedCelebName, controller.signal
  );
  set({ result, phase: 'result' });
} catch (err) {
  if (err instanceof AnalysisError) {
    set({ error: err.message, errorCode: err.code, phase: 'idle' });
  }
}
```

복원력 레이어:
1. **레이트 리미터** 체크 (분당 2회)
2. **타임아웃** 30초 AbortController
3. **API 호출** → Gemini 3 Pro
4. **재시도** NETWORK/TIMEOUT 시 최대 2회 (1s → 3s 백오프)
5. **Zod 검증** → AnalysisResult 반환

### 3-3. 결과 소비

```
scanStore.result
  ├── AnalysisResultView (/ — phase=result)
  │   ├── result.tone        → Forensic Mapping 카드
  │   ├── result.sherlock     → ProportionVisualizer
  │   ├── result.kMatch       → Adaptation 카드 + 스타일 설명
  │   ├── result.recommendations.products → 제품 그리드 + 장바구니
  │   └── result.recommendations.videos   → Curated Education 섹션
  │
  └── GlobalCheckoutView (/checkout)
      └── cartStore.items → 주문 요약 + 가격 계산
```

### 3-4. Demo Mode 데이터 흐름

```
[비커 아이콘 클릭]
  → scanStore.demoMode()
  → set({ phase: 'analyzing' })
  → setTimeout(2000ms)
  → set({ result: DEMO_RESULT, phase: 'result' })
```

- **API 호출 없음** — Gemini API 키 없어도 동작
- `scanStore.reset()` 호출 시 타이머 자동 클리어 (race condition 방지)
- DEMO_RESULT: Melanin L5 (Deep Cool-Ebony) + Wonyoung(IVE) 매칭

---

## 4. View-to-Store 매핑

각 뷰가 어떤 스토어에 접근하는지:

| 뷰 | 읽는 스토어 | 쓰는 액션 |
|----|-----------|----------|
| `OnboardingView` | `settingsStore` | `completeOnboarding(prefs)` |
| `ScanView` | `scanStore`, `settingsStore` | `analyze()`, `demoMode()`, `setUserImage()`, `setCelebImage()` |
| `AnalysisResultView` | `scanStore`, `cartStore` | `reset()`, `addItem()` |
| `CelebGalleryView` | — | `navigate('/', { state })` |
| `GlobalCheckoutView` | `cartStore` | `placeOrder()`, `updateQuantity()`, `removeItem()` |
| `OrdersView` | `cartStore` | — |
| `MuseBoardView` | `museStore` | `fetchBoards()`, `createBoard()`, `deleteBoard()`, `deleteMuse()` |
| `SettingsView` | `settingsStore` | `toggleSensitive()`, `setLanguage()`, `resetAll()` |
| `ExpertMatchingView` | — | — |
| `MethodologyView` | — | `navigate('/match')` |
| `ShopView` | `cartStore` | `addItem()` |
| `ProductDetailView` | `cartStore` | `addItem()` |

---

## 5. 네비게이션 구현

### Navbar (`components/layout/Navbar.tsx`)

React Router `NavLink`를 사용하여 URL 기반 네비게이션:

```
[Scan] [Muse Board] [Match] [Sherlock] [Shop] [Settings]
```

- 활성 상태: NavLink의 `isActive` prop + `aria-current="page"`
- 비활성: `text-gray-400`
- 카트 아이콘: 아이템 수 동적 표시 + `aria-label`

### 데스크탑 (lg: 이상)

- 6개 NavLink가 고정 네비게이션 바에 표시
- 카트 아이콘 + 아이템 수 뱃지

### 모바일 (lg 미만)

- 햄버거 아이콘 (`aria-expanded` + `aria-label`)
- 클릭 시 풀스크린 오버레이 (AnimatePresence)
- 각 항목에 Lucide 아이콘 포함

---

## 6. 이미지 핸들링 디테일

### 업로드 → Store

```typescript
// LuxuryFileUpload.tsx
const reader = new FileReader();
reader.readAsDataURL(file);
reader.onloadend = () => {
  const base64String = (reader.result as string).split(',')[1];
  onImageSelect(base64String);  // → scanStore.setUserImage() 또는 setCelebImage()
};
```

**왜 prefix를 제거하는가?** Gemini API의 `inlineData`는 raw base64만 받고 `mimeType`을 별도 필드로 전달하기 때문.

### Store → 화면 표시

```jsx
<img src={`data:image/jpeg;base64,${preview}`} />
```

### Store → API 전송

```typescript
// geminiService.ts
{ inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } }
{ inlineData: { mimeType: 'image/jpeg', data: celebImageBase64 } }
```

### 주의사항

| 이슈 | 설명 |
|------|------|
| mimeType 고정 | PNG, WebP를 올려도 `image/jpeg`로 전송. Gemini가 자동 감지하므로 대부분 동작 |
| 메모리 보관 | base64 문자열이 Zustand state에 상주. 대용량 이미지 → 브라우저 메모리 부담 |
| 영속성 없음 | 새로고침 시 스캔 이미지 소멸 (persist 안 함) |
| 크기 제한 없음 | 업로드 이미지 리사이즈/압축 없음. Gemini API 입력 제한에 의존 |
