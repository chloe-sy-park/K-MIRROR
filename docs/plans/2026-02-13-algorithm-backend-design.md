# Algorithm Backend — Design Document

> **Date:** 2026-02-13
> **Status:** Approved
> **Approach:** A+B Hybrid (Smart DB now, pgvector-ready)

## Goal

Gemini AI 피부 분석에서 제품 추천을 분리하여, Supabase DB 기반의 확장 가능한 매칭 엔진을 구축한다.

## Decisions

| 영역 | 결정 |
|------|------|
| 아키텍처 | A+B 하이브리드 — Supabase 속성 기반 매칭 + pgvector 확장 가능 설계 |
| 제품 관리 | Supabase 마스터 DB + 외부 API 확장 가능 스키마 |
| 피드백 | 간단 평가 (좋아요/싫어요 + 만족도), 데이터 수집 우선 |
| 콘텐츠 | 셀럽/YouTube 현행 유지, 제품 추천·분석에 집중 |
| 피부 프로필 | 인종 대신 피부 속성으로 간접 반영 (skinType, sensitivity, moisture 등) |

---

## 1. Database Schema

### products

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  melanin_min INT NOT NULL CHECK (melanin_min BETWEEN 1 AND 6),
  melanin_max INT NOT NULL CHECK (melanin_max BETWEEN 1 AND 6),
  undertones TEXT[] NOT NULL,
  skin_types TEXT[],
  concerns TEXT[],
  ingredients TEXT[],
  shade_hex TEXT,
  price_usd DECIMAL(10,2),
  image_url TEXT,
  affiliate_url TEXT,
  safety_rating TEXT,
  -- embedding VECTOR(1536),  -- pgvector 확장용
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### analyses

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  melanin_index INT NOT NULL,
  undertone TEXT NOT NULL,
  skin_type TEXT,
  sensitivity_level INT,
  moisture_level TEXT,
  sebum_level TEXT,
  pore_size TEXT,
  skin_thickness TEXT,
  skin_concerns TEXT[],
  tone_analysis JSONB,
  sherlock_analysis JSONB,
  recommended_product_ids UUID[],
  gemini_model TEXT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### feedback

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  analysis_rating INT CHECK (analysis_rating BETWEEN 1 AND 5),
  analysis_helpful BOOLEAN,
  product_id UUID REFERENCES products(id),
  product_relevant BOOLEAN,
  product_purchased BOOLEAN,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_products_melanin ON products (melanin_min, melanin_max) WHERE is_active;
CREATE INDEX idx_products_category ON products (category) WHERE is_active;
CREATE INDEX idx_products_undertones ON products USING GIN (undertones) WHERE is_active;
CREATE INDEX idx_analyses_user ON analyses (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_feedback_analysis ON feedback (analysis_id);
```

---

## 2. Skin Profile (Gemini 분석 확장)

기존 `tone` 객체를 `skinProfile`로 확장:

```typescript
interface SkinProfile {
  melaninIndex: number;        // 1-6
  undertone: 'Warm' | 'Cool' | 'Neutral';
  skinType: 'dry' | 'oily' | 'combination' | 'normal';
  sensitivityLevel: number;    // 1-5
  moistureLevel: 'low' | 'medium' | 'high';
  sebumLevel: 'low' | 'medium' | 'high';
  poreSize: 'small' | 'medium' | 'large';
  skinThickness: 'thin' | 'medium' | 'thick';
  concerns: string[];
}
```

피부 두께, 수분/유분 분리, 민감도 수치화로 인종적 특성을 간접 반영.

---

## 3. Product Scoring Engine

### Scoring Formula (max ~100)

| Factor | Weight | Logic |
|--------|--------|-------|
| Melanin match | 25 | center=25, range=18, boundary=10 |
| Undertone | 15 | exact=15, Neutral=7 |
| Skin type | 15 | exact=15, normal=7 |
| Concerns | 10 | 5pts per match, max 10 |
| Ingredients | 15 | beneficial +5 each (max 12), irritant -4 each |
| Safety × sensitivity | 15 | EWG Green=15, Yellow=5, Red=-5; multiplied by sensitivity (×0.7~1.5) |
| Feedback bonus | 5 | Future: avg rating > 4 → 5pts |

### Diversification

Category-capped selection: max 2 per category, total 6 products.

---

## 4. Backend Architecture

### Edge Function Split

```
analyze-kbeauty (기존, 유지)  ← fallback
analyze-skin (신규)           ← Gemini 피부분석만
match-products (신규)         ← Supabase 쿼리 + 스코어링
```

### Client Flow

```
Photo → analyze-skin → skinProfile
                          ├─→ match-products → Product[]  ┐
                          └─→ YouTube service → Video[]    ├─→ Result
                                                           ┘
```

`match-products`와 YouTube를 `Promise.all`로 병렬 호출.

---

## 5. Feedback System

### UI

- 분석 전체: "도움이 됐나요?" → 👍 / 👎
- 제품별: "내 피부에 맞을 것 같나요?" → 👍 / 👎
- 데이터 수집 우선, ML 활용은 향후

### Service

```typescript
// src/services/feedbackService.ts
submitFeedback({ analysisId, analysisHelpful?, productFeedback? })
  → INSERT INTO feedback
```

---

## 6. Analysis Persistence

분석 결과를 `analyses` 테이블에 저장하여 피드백이 실제 분석 ID를 참조할 수 있도록 한다.

```
analyze → result 표시 → saveAnalysis() (non-blocking)
                              ↓
                        analysisId → feedback에서 참조
```

- `src/services/analysisService.ts`: `saveAnalysis()` + `extractProductIds()`
- `scanStore.analysisId`: 결과 표시 후 비동기로 저장, 피드백 시 사용
- `analysisId` 없이도 피드백 UI는 작동 (로컬 상태만 반영, DB 저장은 스킵)

---

## 7. Migration Plan

1. Supabase migration: products, analyses, feedback 테이블 생성
2. Seed data: 기존 hardcoded 12개 제품 INSERT
3. 새 skinProfile 속성 추가 to Zod schema + types
4. analyze-skin Edge Function 생성 + 배포
5. match-products Edge Function 생성 + 배포
6. Client scanStore 업데이트 (새 API 호출 흐름)
7. Feedback UI + service 구현
8. Analysis persistence (analysisService → analyses 테이블)
9. 기존 analyze-kbeauty 유지 (fallback)

---

## 8. Post-Implementation Fixes

구현 후 발견한 버그/누락 4건 수정 (2026-02-13):

| 항목 | 설명 |
|------|------|
| matchProducts 응답 파싱 | Edge Function이 `{ recommendations: [...] }` 반환 → 클라이언트에서 `.recommendations` 추출 |
| is_active 필터 | match-products에서 `.eq('is_active', true)` 누락 → 추가 |
| 분석 결과 DB 저장 | `analysisService.ts` 생성 → analyses 테이블에 INSERT, analysisId 반환 |
| 피드백 analysisId | 'placeholder' → 실제 analysisId 사용 (없으면 피드백 DB 저장 스킵) |
