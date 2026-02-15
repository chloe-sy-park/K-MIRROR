# Phase 4: 런칭 & 그로스 — Design Document

**작성일**: 2026-02-15

**목표**: 성능 최적화 + GA4 애널리틱스 + 런칭 준비

---

## 범위

| 항목 | 상태 |
|------|------|
| 성능 최적화 (Lighthouse 90+) | 이미지 lazy loading + Recharts dynamic import + SW 캐싱 |
| GA4 애널리틱스 | 7개 커스텀 이벤트 + 페이지뷰 자동 추적 |
| 런칭 준비 | SEO/OG 메타 + JSON-LD + PWA 정리 |

---

## 1. 성능 최적화

### 이미지 최적화
- 셀럽 갤러리, 제품 이미지 등 `<img>` 태그에 `loading="lazy"` 추가
- Supabase Storage 이미지는 서버사이드 변환 불가 → lazy loading만 집중

### 코드 스플리팅
- `normalizeMetrics` 청크 (487KB): Recharts 포함 — dynamic import로 분리
- `ArchiveView` 청크 (429KB): jsPDF + html2canvas — 이미 lazy-loaded, OK
- Recharts 사용 컴포넌트를 `React.lazy()`로 감싸기

### Service Worker 캐싱
- `vite-plugin-pwa` 설정 확인 및 정적 에셋 캐싱 전략 최적화
- API 응답은 캐싱하지 않음 (network-first)
- 오프라인 fallback 페이지 추가

---

## 2. GA4 애널리틱스

### 설치
- `index.html`에 `gtag.js` 스크립트 추가
- 측정 ID: `VITE_GA4_ID` 환경변수
- 환경변수 미설정 시 GA4 비활성화 (개발 안전)

### 유틸리티
- `src/lib/analytics.ts`: `trackEvent(name, params)` + `initGA4()` + `trackPageView()`
- GA4 미설정 시 no-op (DEV에서 console.debug 출력)

### 커스텀 이벤트 (7개)

| 이벤트 | 트리거 | 파라미터 |
|--------|--------|----------|
| `celeb_selected` | ChooseVibeView 셀럽 선택 | `celeb_name` |
| `selfie_uploaded` | ScanView 이미지 업로드 | `has_celeb` |
| `analysis_completed` | scanStore 분석 완료 | `celeb_name`, `locale` |
| `card_shared` | SharePanel 공유 클릭 | `platform`, `celeb_name` |
| `premium_clicked` | KGlowResultView Unlock 클릭 | `analysis_id` |
| `payment_completed` | ArchiveView 결제 확인 | `amount`, `currency` |
| `affiliate_clicked` | ShopView/ProductDetail Buy Now | `product_name`, `source` |

### 페이지뷰 자동 추적
- `usePageTracking()` 훅 — `useLocation()` 변경 감지 → `page_view` 이벤트
- `App.tsx`에 훅 추가

---

## 3. 런칭 준비

### SEO/OG 메타
- `index.html` `<meta>` 태그 강화: `og:title`, `og:description`, `og:image`, `twitter:card`
- 정적 프리뷰 이미지 1장 (public/og-image.png)

### Structured Data
- `index.html`에 `SoftwareApplication` JSON-LD schema 추가

### PWA 정리
- `manifest.json` 검증: 앱 이름, 아이콘, 테마 색상, 카테고리
- 오프라인 fallback 페이지 (`offline.html`)

---

## 접근법

**순서**: 성능 최적화 → GA4 애널리틱스 → 런칭 준비

1. 이미지 lazy loading + Recharts dynamic import + SW 캐싱
2. GA4 유틸리티 + 7개 이벤트 삽입 + 페이지뷰 훅
3. SEO/OG + JSON-LD + PWA manifest 정리

---

## 의존성

```
성능 최적화 (독립)
    │
    v
GA4 애널리틱스 (독립, 성능 후 선호)
    │
    v
런칭 준비 (독립)
```

세 영역 모두 기술적으로는 독립적이지만 순차 실행 권장.
