# Phase 3: 완성도 & 확장 — Design Document

**작성일**: 2026-02-13

**목표**: 제품 구매 연결 + Gemini 다국어 + 데일리/오피스/글램 3버전

---

## 범위

| 항목 | 상태 |
|------|------|
| Affiliate 링크 연동 | UI만 선행 (URL은 추후 입력) |
| YouTube 튜토리얼 연동 | ✅ 이미 구현됨 — 제외 |
| Gemini 다국어 응답 | locale 파라미터 추가 |
| 데일리/오피스/글램 3버전 | K-GLOW Card 탭 + PDF 2페이지 추가 |

---

## 1. Gemini 프롬프트 확장

### 입력 추가

```
locale: "en" | "ko"  ← 프론트엔드 i18n 언어
```

모든 AI 텍스트(adaptationLogic, solutions, styleVersions 등)가 locale에 맞는 언어로 생성.

### 출력 추가

기존 출력에 `styleVersions` 객체 병합:

```json
{
  "styleVersions": {
    "daily": {
      "intensity": "light",
      "base": "...",
      "eyes": "...",
      "lips": "...",
      "keyProducts": ["tinted moisturizer", "lip balm"],
      "metricsShift": { "VW": -10, "CT": 0, "MF": 0, "LS": +5, "HI": +3 }
    },
    "office": {
      "intensity": "medium",
      "base": "...",
      "eyes": "...",
      "lips": "...",
      "keyProducts": ["BB cream", "natural lip"],
      "metricsShift": { "VW": 0, "CT": +2, "MF": 0, "LS": +8, "HI": +5 }
    },
    "glam": {
      "intensity": "full",
      "base": "...",
      "eyes": "...",
      "lips": "...",
      "keyProducts": ["full coverage foundation", "bold lip"],
      "metricsShift": { "VW": +15, "CT": +5, "MF": -3, "LS": +12, "HI": +8 }
    }
  }
}
```

### 하위 호환

- `styleVersions`는 optional — 없으면 프론트엔드에서 탭 숨김
- 기존 분석 결과에 영향 없음

---

## 2. 타입/스키마 변경

### TypeScript

```typescript
interface StyleVersion {
  intensity: 'light' | 'medium' | 'full';
  base: string;
  eyes: string;
  lips: string;
  keyProducts: string[];
  metricsShift: { VW: number; CT: number; MF: number; LS: number; HI: number };
}

// AnalysisResult 확장:
styleVersions?: {
  daily: StyleVersion;
  office: StyleVersion;
  glam: StyleVersion;
}
```

### Zod 스키마

`analysisResult.ts`에 optional styleVersions 스키마 추가.

### DB

`analyses` 테이블에 `style_versions JSONB` 컬럼 추가 (migration).
`saveAnalysis`/`fetchAnalysis`에서 read/write.

---

## 3. K-GLOW Card 3버전 탭

`KGlowResultView.tsx` 수정:

- `[Daily] [Office] [Glam]` pill 탭 (Glam이 기본 선택)
- styleVersions가 없으면 탭 영역 숨김
- 각 탭 선택 시:
  - 해당 버전의 base/eyes/lips 솔루션 텍스트
  - keyProducts 리스트
  - 미니 레이더 차트: 현재 metrics + metricsShift 오버레이
- 모바일: 가로 스크롤 pill 버튼

---

## 4. PDF 3버전 페이지

기존 10페이지 → 12페이지:

| 페이지 | 내용 | 변경 |
|--------|------|------|
| 1-6 | 기존 (Cover ~ Translation) | 그대로 |
| **7 (신규)** | Style Variations 개요 | 3칸 레이아웃 + 미니 레이더 |
| **8 (신규)** | Detailed Solutions by Scene | Daily/Office 상세, Glam은 참조 |
| 9-10 | Solution (기존 7-8) | 페이지 번호만 이동 |
| 11 | Products (기존 9) | 페이지 번호만 이동 |
| 12 | Final Reveal (기존 10) | 페이지 번호만 이동 |

### 신규 PDF 컴포넌트

- `PdfStyleVariations.tsx` — 페이지 7
- `PdfDetailedSolutions.tsx` — 페이지 8

### pdfService.tsx 수정

- `TOTAL_PAGES = 12`
- 신규 페이지 렌더링 + 캡처 로직 추가
- 기존 페이지 번호 조정

---

## 5. Affiliate 구매 링크 UI

### 조건부 표시

`affiliate_url`이 있을 때만 구매 버튼/링크 표시.

### Shop + ProductDetail

- `Product` 타입에 `affiliate_url?: string` 추가
- `ShopView.tsx`: 제품 카드에 조건부 "Buy Now" 버튼 (새 탭)
- `ProductDetailView.tsx`: 조건부 "Buy Now" 버튼

### PDF Products 페이지

- `PdfProducts.tsx`: 제품에 affiliate_url이 있으면 QR 코드 추가

### AnalysisResultView

- 추천 제품 섹션에 조건부 "Buy" 링크

---

## 접근법

**순서**: Gemini 프롬프트 확장 → 3버전 UI → Affiliate UI

1. Gemini 프롬프트를 한 번에 확장 (locale + styleVersions)
2. 타입/스키마/DB 변경
3. K-GLOW Card 탭 UI
4. PDF 2페이지 추가
5. Affiliate UI (Shop + ProductDetail + PDF + AnalysisResult)

---

## 의존성

```
Gemini 프롬프트 확장 + DB migration
        │
        v
타입/스키마 변경
        │
        ├─── K-GLOW Card 3버전 탭
        │         │
        │         v
        │    PDF 3버전 페이지 추가
        │
        └─── Affiliate UI (독립)
```
