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
| `userImageMimeType` | `string` | 사용자 이미지 MIME 타입 (기본: `image/jpeg`) |
| `celebImage` | `string \| null` | 셀럽 이미지 (base64) |
| `celebImageMimeType` | `string` | 셀럽 이미지 MIME 타입 (기본: `image/jpeg`) |
| `selectedCelebName` | `string \| null` | 갤러리에서 선택한 셀럽 이름 |
| `targetBoardId` | `string \| null` | MuseBoard에서 넘어온 보드 ID (자동 저장용) |
| `result` | `AnalysisResult \| null` | AI 분석 결과 |
| `analysisId` | `string \| null` | DB 저장된 분석 ID (피드백 연결용) |
| `matchedProducts` | `MatchedProduct[]` | DB 매칭된 제품 목록 |
| `youtubeVideos` | `YouTubeVideo[]` | 검색된 YouTube 비디오 |
| `error` | `string \| null` | 에러 메시지 |

| 액션 | 설명 |
|------|------|
| `analyze()` | 2-step AI 분석 (analyzeSkin → matchProducts + YouTube) + 캐시 |
| `demoMode()` | 2초 지연 후 DEMO_RESULT 로드 |
| `reset()` | 모든 스캔 상태 초기화 + 타이머/분석 취소 |
| `setUserImage(base64, mimeType?)` | 사용자 이미지 + mimeType 설정 |
| `setCelebImage(base64, mimeType?)` | 셀럽 이미지 + mimeType 설정 |
| `setTargetBoard(boardId)` | 대상 보드 ID 설정 (MuseBoard → 스캔 플로우) |
| `setCelebFromGallery(celeb)` | 갤러리 셀럽 이미지 fetch + 설정 |

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
  + scanStore.userImage  (base64, imageService.processImage로 리사이즈/압축)
  + scanStore.userImageMimeType (mimeType, LuxuryFileUpload에서 전달)
  + scanStore.celebImage (base64, 업로드 또는 갤러리 fetch)
  + settingsStore.isSensitive (boolean, Toggle에서 설정)
      │
      ▼  캐시 체크 (hashInputs → getCachedResult)
      │
      ▼  캐시 miss 시:
  Step 1: analyzeSkin(userImage, celebImage, isSensitive, prefs, ...)
      │  (services/geminiService.ts → Supabase Edge Function → Gemini API)
      ▼
  AnalysisResult (Zod 검증 통과)
      │
      ▼  Step 2 (병렬):
  matchProducts(result.tone, signal)  +  searchYouTubeVideos(queries)
      │                                      │
      ▼                                      ▼
  MatchedProduct[]                     YouTubeVideo[]
```

### 3-2. API 호출 흐름 (2-step pipeline + 캐시)

```typescript
// scanStore.ts — analyze()
// 1. 캐시 확인
const cacheKey = hashInputs(userImage, celebImage);
const cached = getCachedResult(cacheKey);
if (cached) { set({ result: cached, phase: 'result' }); return; }

// 2. 분석 실행
const controller = new AbortController();
try {
  // Step 1: AI 분석
  const res = await analyzeSkin(userImage, celebImage, ...);

  // Step 2: 제품 매칭 + YouTube (병렬)
  const [products, videos] = await Promise.all([
    matchProducts(res.tone, signal),
    searchYouTubeVideos(res.youtubeSearch.queries),
  ]);

  set({ result: res, matchedProducts: products, phase: 'result' });
  setCachedResult(cacheKey, res);  // 캐시 저장
} catch (skinErr) {
  // Fallback: analyzeKBeauty (레거시 엔드포인트)
  const res = await analyzeKBeauty(userImage, celebImage, ...);
  set({ result: res, phase: 'result' });
}
```

복원력 레이어:
1. **결과 캐시** 확인 (sessionStorage LRU, 5개, 30분 TTL)
2. **레이트 리미터** 체크 (분당 2회)
3. **타임아웃** 30초 AbortController
4. **API 호출** → analyzeSkin (→ analyzeKBeauty fallback)
5. **Zod 검증** → AnalysisResult 반환
6. **캐시 저장** → 동일 입력 재분석 방지

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

### 업로드 → 리사이즈 → Store

```typescript
// LuxuryFileUpload.tsx
const { base64, mimeType } = await processImage(file);
//  ↑ imageService.ts: Canvas API 리사이즈 (1024px max) + JPEG 압축 (0.85)
onImageSelect(base64, mimeType);  // → scanStore.setUserImage(base64, mimeType)
```

- `processImage()`: Canvas API로 이미지를 최대 1024px로 리사이즈, JPEG quality 0.85로 압축
- 항상 JPEG 출력 → 일관된 mimeType (`image/jpeg`)
- base64는 `data:` prefix 없는 순수 base64

### Store → 화면 표시

```jsx
<img src={`data:image/jpeg;base64,${preview}`} />
```

### Store → Edge Function → Gemini API

```typescript
// geminiService.ts → Edge Function
{ userImageBase64, celebImageBase64, userMimeType, celebMimeType, ... }

// Edge Function → Gemini API
{ inlineData: { mimeType: userMimeType || 'image/jpeg', data: userImageBase64 } }
{ inlineData: { mimeType: celebMimeType || 'image/jpeg', data: celebImageBase64 } }
```

mimeType이 파이프라인 전체에 전파: `LuxuryFileUpload → scanStore → geminiService → Edge Function → Gemini API`

### 주의사항

| 이슈 | 설명 |
|------|------|
| 메모리 보관 | base64 문자열이 Zustand state에 상주. 리사이즈로 완화되었지만 여전히 주의 |
| 영속성 없음 | 새로고침 시 스캔 이미지 소멸 (persist 안 함) |
