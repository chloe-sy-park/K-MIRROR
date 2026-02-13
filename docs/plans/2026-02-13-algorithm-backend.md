# Algorithm Backend — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Separate product recommendations from Gemini AI analysis, building a Supabase DB-backed scoring engine with expanded skin profiling and user feedback collection.

**Architecture:** Two-phase analysis pipeline. Phase 1: Gemini analyzes skin only (expanded SkinProfile with skinType, sensitivity, moisture, etc.). Phase 2: Edge Function queries Supabase `products` table and runs a weighted scoring algorithm. Feedback UI collects user ratings for future algorithm tuning.

**Tech Stack:** Supabase (PostgreSQL + Edge Functions/Deno), Gemini REST API, Zod validation, Zustand stores, React + framer-motion

**Design Doc:** `docs/plans/2026-02-13-algorithm-backend-design.md`

---

## Task 1: Database Migration — Products, Analyses, Feedback Tables

Create the Supabase SQL migration with all three tables, indexes, RLS policies, and seed data from the current hardcoded product catalog.

**Files:**
- Create: `supabase/migrations/20260213000000_algorithm_backend.sql`

**Context:**
- Current products are hardcoded in `src/data/productCatalog.ts` (12 products)
- Existing `src/services/productService.ts` already has `fetchProducts()` that queries Supabase with fallback to local catalog
- Supabase config exists at `supabase/config.toml`

**Step 1:** Create the migration SQL file with all three tables, indexes, and seed data.

```sql
-- ═══════════════════════════════════════════════════
-- Algorithm Backend: Products + Analyses + Feedback
-- ═══════════════════════════════════════════════════

-- ── Products Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  melanin_min INT NOT NULL CHECK (melanin_min BETWEEN 1 AND 6),
  melanin_max INT NOT NULL CHECK (melanin_max BETWEEN 1 AND 6),
  undertones TEXT[] NOT NULL DEFAULT '{}',
  skin_types TEXT[] DEFAULT '{}',
  concerns TEXT[] DEFAULT '{}',
  ingredients TEXT[] DEFAULT '{}',
  shade_hex TEXT,
  price_usd DECIMAL(10,2),
  image_url TEXT,
  affiliate_url TEXT,
  safety_rating TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Analyses Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  melanin_index INT NOT NULL CHECK (melanin_index BETWEEN 1 AND 6),
  undertone TEXT NOT NULL,
  skin_type TEXT,
  sensitivity_level INT CHECK (sensitivity_level BETWEEN 1 AND 5),
  moisture_level TEXT,
  sebum_level TEXT,
  pore_size TEXT,
  skin_thickness TEXT,
  skin_concerns TEXT[] DEFAULT '{}',
  tone_analysis JSONB,
  sherlock_analysis JSONB,
  k_match JSONB,
  recommended_product_ids UUID[] DEFAULT '{}',
  gemini_model TEXT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Feedback Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis_helpful BOOLEAN,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_relevant BOOLEAN,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────
CREATE INDEX idx_products_melanin ON public.products (melanin_min, melanin_max) WHERE is_active;
CREATE INDEX idx_products_category ON public.products (category) WHERE is_active;
CREATE INDEX idx_products_undertones ON public.products USING GIN (undertones) WHERE is_active;
CREATE INDEX idx_analyses_user ON public.analyses (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_feedback_analysis ON public.feedback (analysis_id);

-- ── RLS Policies ───────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Products: public read, no public write
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT USING (true);

-- Analyses: users can read their own, anon can insert
CREATE POLICY "Anyone can insert analyses"
  ON public.analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own analyses"
  ON public.analyses FOR SELECT USING (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Feedback: anyone can insert, users can read their own
CREATE POLICY "Anyone can insert feedback"
  ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own feedback"
  ON public.feedback FOR SELECT USING (
    user_id IS NULL OR user_id = auth.uid()
  );

-- ── Seed Data (migrated from src/data/productCatalog.ts) ──
INSERT INTO public.products (brand, name_en, name_ko, category, subcategory, melanin_min, melanin_max, undertones, skin_types, concerns, ingredients, price_usd, safety_rating) VALUES
  ('HERA', 'Black Cushion SPF34', '블랙 쿠션 SPF34', 'base', 'cushion', 3, 6, ARRAY['Warm','Cool','Neutral'], ARRAY['oily','combination'], ARRAY['dullness','uneven_tone'], ARRAY['Niacinamide','Titanium Dioxide','Centella Asiatica'], 45.00, 'EWG Green'),
  ('MISSHA', 'Perfect Cover BB Cream', '퍼펙트 커버 BB크림', 'base', 'bb_cream', 1, 3, ARRAY['Warm','Neutral'], ARRAY['dry','normal'], ARRAY['dryness','dullness'], ARRAY['Hyaluronic Acid','Ceramide NP','Rosemary Extract'], 12.00, 'EWG Green'),
  ('Sulwhasoo', 'Perfecting Cushion EX', '퍼펙팅 쿠션 EX', 'base', 'cushion', 1, 4, ARRAY['Warm','Neutral'], ARRAY['dry','combination'], ARRAY['aging','dullness'], ARRAY['Korean Ginseng','Plum Blossom Extract','Jaumdan Complex'], 56.00, 'EWG Green'),
  ('ROM&ND', 'Glasting Water Tint', '글래스팅 워터 틴트', 'lip', 'tint', 1, 6, ARRAY['Warm','Cool','Neutral'], ARRAY['dry','normal','oily','combination'], ARRAY[]::TEXT[], ARRAY['Shea Butter','Jojoba Oil','Vitamin E'], 14.00, 'Vegan'),
  ('Peripera', 'Ink Mood Matte Stick', '잉크 무드 매트 스틱', 'lip', 'lipstick', 1, 5, ARRAY['Warm','Cool'], ARRAY['normal','combination'], ARRAY[]::TEXT[], ARRAY['Macadamia Oil','Beeswax','Vitamin C'], 11.00, 'EWG Green'),
  ('3CE', 'Velvet Lip Tint', '벨벳 립 틴트', 'lip', 'tint', 2, 6, ARRAY['Cool','Neutral'], ARRAY['normal','oily'], ARRAY[]::TEXT[], ARRAY['Argan Oil','Candelilla Wax','Rose Hip Extract'], 18.00, 'Vegan'),
  ('CLIO', 'Kill Brown Auto-Gel Liner', '킬 브라운 오토 젤 라이너', 'eye', 'liner', 1, 4, ARRAY['Warm','Neutral'], ARRAY['normal','oily','combination'], ARRAY[]::TEXT[], ARRAY['Carnauba Wax','Silica','Tocopherol'], 15.00, 'EWG Green'),
  ('ETUDE', 'Play Color Eyes Palette', '플레이 컬러 아이즈 팔레트', 'eye', 'palette', 1, 6, ARRAY['Warm','Cool','Neutral'], ARRAY['normal','dry','oily','combination'], ARRAY[]::TEXT[], ARRAY['Mica','Dimethicone','Talc'], 22.00, 'EWG Green'),
  ('COSRX', 'Advanced Snail 96 Mucin Essence', '어드밴스드 스네일 96 뮤신 에센스', 'skincare', 'essence', 1, 6, ARRAY['Warm','Cool','Neutral'], ARRAY['dry','normal','combination'], ARRAY['dryness','aging','hyperpigmentation'], ARRAY['Snail Secretion Filtrate','Betaine','Sodium Hyaluronate'], 21.00, 'EWG Green'),
  ('Beauty of Joseon', 'Relief Sun: Rice + Probiotics SPF50+', '맑은쌀 선크림 SPF50+', 'skincare', 'sunscreen', 1, 6, ARRAY['Warm','Cool','Neutral'], ARRAY['dry','normal','oily','combination'], ARRAY['dullness','sun_damage'], ARRAY['Oryza Sativa Bran Extract','Lactobacillus','Niacinamide'], 16.00, 'EWG Green'),
  ('Innisfree', 'Green Tea Seed Serum', '그린티 씨드 세럼', 'skincare', 'serum', 1, 6, ARRAY['Warm','Cool','Neutral'], ARRAY['dry','combination'], ARRAY['dryness','dullness'], ARRAY['Camellia Sinensis Seed Oil','Betaine','Trehalose'], 27.00, 'EWG Green'),
  ('Dear, Klairs', 'Freshly Juiced Vitamin Drop', '프레쉴리 쥬스드 비타민 드롭', 'skincare', 'serum', 1, 6, ARRAY['Warm','Cool','Neutral'], ARRAY['normal','combination','oily'], ARRAY['hyperpigmentation','dullness','acne'], ARRAY['Ascorbic Acid','Centella Asiatica','Portulaca Extract'], 23.00, 'Vegan');
```

**Step 2:** Verify the SQL is syntactically valid by reviewing it. Ensure:
- All CHECK constraints are correct (melanin 1-6, sensitivity 1-5)
- All foreign key references use correct table names
- GIN index is on the array column
- RLS policies cover the required access patterns

**Step 3:** Commit.

```bash
git add supabase/migrations/20260213000000_algorithm_backend.sql
git commit -m "feat: add algorithm backend database migration

Products, analyses, and feedback tables with indexes, RLS policies,
and seed data migrated from hardcoded productCatalog.ts."
```

---

## Task 2: TypeScript Types + Zod Schema — SkinProfile

Extend the `AnalysisResult` type with expanded skin profile fields. Add `SkinProfile` interface. Update Zod schema for validation.

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/schemas/analysisResult.ts`

**Context:**
- Current `AnalysisResult.tone` has: `melaninIndex`, `undertone`, `skinHexCode`, `skinConcerns`, `description`
- We're adding: `skinType`, `sensitivityLevel`, `moistureLevel`, `sebumLevel`, `poreSize`, `skinThickness`
- These fields are added to the existing `tone` object (not a separate object) to minimize breaking changes
- The new fields are optional (Zod `.optional().default(...)`) so old responses still validate

**Step 1:** Write the test for the updated Zod schema.

Test file: `src/schemas/analysisResult.test.ts`

Add tests that verify:
1. A response with all new skinProfile fields validates successfully
2. A response without the new fields still validates (backwards compatible)
3. Invalid values for new fields (e.g., sensitivityLevel: 7) are rejected

```typescript
// Add to existing test file:

it('validates extended skin profile fields', () => {
  const extended = {
    ...validResult,
    tone: {
      ...validResult.tone,
      skinType: 'combination',
      sensitivityLevel: 3,
      moistureLevel: 'low',
      sebumLevel: 'medium',
      poreSize: 'medium',
      skinThickness: 'thin',
    },
  };
  const result = analysisResultSchema.safeParse(extended);
  expect(result.success).toBe(true);
});

it('accepts responses without new skin profile fields (backwards compatible)', () => {
  // validResult does NOT have the new fields
  const result = analysisResultSchema.safeParse(validResult);
  expect(result.success).toBe(true);
});

it('rejects invalid sensitivity level', () => {
  const invalid = {
    ...validResult,
    tone: { ...validResult.tone, sensitivityLevel: 7 },
  };
  const result = analysisResultSchema.safeParse(invalid);
  expect(result.success).toBe(false);
});
```

**Step 2:** Run tests to verify they fail.

```bash
npm run test:run -- src/schemas/analysisResult.test.ts
```

Expected: New tests fail (fields not in schema yet).

**Step 3:** Update `src/types/index.ts`.

Add `SkinProfile` interface and extend `AnalysisResult.tone`:

```typescript
// Add after UserPreferences interface (line 61):

export interface SkinProfile {
  melaninIndex: number;
  undertone: 'Warm' | 'Cool' | 'Neutral';
  skinHexCode: string;
  skinConcerns: string[];
  description: string;
  skinType?: 'dry' | 'oily' | 'combination' | 'normal';
  sensitivityLevel?: number;
  moistureLevel?: 'low' | 'medium' | 'high';
  sebumLevel?: 'low' | 'medium' | 'high';
  poreSize?: 'small' | 'medium' | 'large';
  skinThickness?: 'thin' | 'medium' | 'thick';
}
```

Update `AnalysisResult.tone` type to use `SkinProfile`:

```typescript
export interface AnalysisResult {
  tone: SkinProfile;
  // ... rest unchanged
}
```

**Step 4:** Update `src/schemas/analysisResult.ts`.

Add optional fields to the `tone` Zod object:

```typescript
tone: z.object({
  melaninIndex: z.number().min(1).max(6),
  undertone: z.enum(['Warm', 'Cool', 'Neutral']),
  skinHexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#C8A98B'),
  skinConcerns: z.array(z.string()),
  description: z.string(),
  // Extended skin profile fields (optional for backward compat)
  skinType: z.enum(['dry', 'oily', 'combination', 'normal']).optional(),
  sensitivityLevel: z.number().min(1).max(5).optional(),
  moistureLevel: z.enum(['low', 'medium', 'high']).optional(),
  sebumLevel: z.enum(['low', 'medium', 'high']).optional(),
  poreSize: z.enum(['small', 'medium', 'large']).optional(),
  skinThickness: z.enum(['thin', 'medium', 'thick']).optional(),
}),
```

**Step 5:** Run tests to verify they pass.

```bash
npm run test:run -- src/schemas/analysisResult.test.ts
```

Expected: All tests pass.

**Step 6:** Run full typecheck to ensure no breakage.

```bash
npm run typecheck
```

Expected: 0 errors.

**Step 7:** Commit.

```bash
git add src/types/index.ts src/schemas/analysisResult.ts src/schemas/analysisResult.test.ts
git commit -m "feat: add SkinProfile type with extended skin analysis fields

Adds skinType, sensitivityLevel, moistureLevel, sebumLevel, poreSize,
skinThickness to AnalysisResult.tone. All new fields are optional for
backward compatibility with existing Gemini responses."
```

---

## Task 3: Product Scoring Engine

Create a standalone scoring service with the weighted algorithm from the design doc. This is the core matching logic that runs in both the Edge Function and can be tested locally.

**Files:**
- Create: `src/services/scoringService.ts`
- Create: `src/services/scoringService.test.ts`

**Context:**
- Scoring formula from design doc: melanin (25), undertone (15), skinType (15), concerns (10), ingredients (15), safety×sensitivity (15), feedback (5 future)
- Products have: `melanin_min`, `melanin_max`, `undertones[]`, `skin_types[]`, `concerns[]`, `ingredients[]`, `safety_rating`
- SkinProfile has: `melaninIndex`, `undertone`, `skinType`, `sensitivityLevel`, `concerns` (from `skinConcerns`)

**Step 1:** Write tests for the scoring engine.

```typescript
// src/services/scoringService.test.ts
import { describe, it, expect } from 'vitest';
import {
  scoreProduct,
  scoreMelanin,
  scoreUndertone,
  scoreSkinType,
  scoreConcerns,
  scoreIngredients,
  scoreSafety,
  diversify,
} from './scoringService';
import type { SkinProfile } from '@/types';

const baseSkinProfile: SkinProfile = {
  melaninIndex: 3,
  undertone: 'Cool',
  skinHexCode: '#C8A98B',
  skinConcerns: ['dryness', 'dullness'],
  description: 'test',
  skinType: 'combination',
  sensitivityLevel: 3,
  moistureLevel: 'low',
  sebumLevel: 'medium',
  poreSize: 'medium',
  skinThickness: 'medium',
};

const baseProduct = {
  melanin_min: 2,
  melanin_max: 4,
  undertones: ['Cool', 'Neutral'],
  skin_types: ['combination', 'oily'],
  concerns: ['dryness', 'acne'],
  ingredients: ['Hyaluronic Acid', 'Niacinamide'],
  safety_rating: 'EWG Green',
  category: 'skincare',
};

describe('scoreMelanin', () => {
  it('gives max points for center match', () => {
    // product range 2-4, center is 3, profile melanin is 3
    expect(scoreMelanin(baseProduct, 3)).toBe(25);
  });

  it('gives range points when within range but not center', () => {
    expect(scoreMelanin(baseProduct, 2)).toBe(18);
  });

  it('gives boundary points when 1 step outside', () => {
    expect(scoreMelanin(baseProduct, 5)).toBe(10);
  });

  it('gives 0 points when far outside range', () => {
    expect(scoreMelanin({ ...baseProduct, melanin_min: 5, melanin_max: 6 }, 1)).toBe(0);
  });
});

describe('scoreUndertone', () => {
  it('gives max for exact match', () => {
    expect(scoreUndertone(baseProduct, 'Cool')).toBe(15);
  });

  it('gives partial for Neutral product', () => {
    expect(scoreUndertone({ ...baseProduct, undertones: ['Neutral'] }, 'Cool')).toBe(7);
  });

  it('gives 0 for no match', () => {
    expect(scoreUndertone({ ...baseProduct, undertones: ['Warm'] }, 'Cool')).toBe(0);
  });
});

describe('scoreSkinType', () => {
  it('gives max for exact match', () => {
    expect(scoreSkinType(baseProduct, 'combination')).toBe(15);
  });

  it('gives partial for normal product', () => {
    expect(scoreSkinType({ ...baseProduct, skin_types: ['normal'] }, 'oily')).toBe(7);
  });

  it('gives 0 for no match', () => {
    expect(scoreSkinType({ ...baseProduct, skin_types: ['dry'] }, 'oily')).toBe(0);
  });
});

describe('scoreConcerns', () => {
  it('gives points per matched concern', () => {
    expect(scoreConcerns(baseProduct, ['dryness', 'acne'])).toBe(10);
  });

  it('caps at 10', () => {
    expect(scoreConcerns(
      { ...baseProduct, concerns: ['a', 'b', 'c', 'd'] },
      ['a', 'b', 'c']
    )).toBe(10);
  });

  it('gives 0 for no overlap', () => {
    expect(scoreConcerns(baseProduct, ['aging'])).toBe(0);
  });
});

describe('scoreIngredients', () => {
  it('gives points for beneficial ingredients', () => {
    // Hyaluronic Acid is beneficial for dryness
    const score = scoreIngredients(baseProduct, ['dryness']);
    expect(score).toBeGreaterThan(0);
  });

  it('deducts for irritants', () => {
    const withIrritant = {
      ...baseProduct,
      ingredients: ['Fragrance', 'Alcohol'],
    };
    const score = scoreIngredients(withIrritant, ['dryness']);
    expect(score).toBeLessThan(0);
  });
});

describe('scoreSafety', () => {
  it('gives max for EWG Green + high sensitivity', () => {
    const score = scoreSafety({ safety_rating: 'EWG Green' }, 4);
    expect(score).toBeGreaterThan(15); // multiplier > 1
  });

  it('deducts for EWG Red', () => {
    const score = scoreSafety({ safety_rating: 'EWG Red' }, 3);
    expect(score).toBeLessThan(0);
  });

  it('applies lower multiplier for low sensitivity', () => {
    const highSens = scoreSafety({ safety_rating: 'EWG Green' }, 5);
    const lowSens = scoreSafety({ safety_rating: 'EWG Green' }, 1);
    expect(highSens).toBeGreaterThan(lowSens);
  });
});

describe('scoreProduct', () => {
  it('returns a number between 0 and ~100', () => {
    const score = scoreProduct(baseProduct, baseSkinProfile);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(120); // theoretical max with sensitivity multiplier
  });
});

describe('diversify', () => {
  it('caps products per category', () => {
    const scored = [
      { product: { ...baseProduct, id: '1', category: 'skincare' }, score: 90 },
      { product: { ...baseProduct, id: '2', category: 'skincare' }, score: 85 },
      { product: { ...baseProduct, id: '3', category: 'skincare' }, score: 80 },
      { product: { ...baseProduct, id: '4', category: 'lip' }, score: 75 },
    ];
    const result = diversify(scored, 2, 6);
    const skincareCount = result.filter(p => p.category === 'skincare').length;
    expect(skincareCount).toBeLessThanOrEqual(2);
  });

  it('returns at most `total` products', () => {
    const scored = Array.from({ length: 20 }, (_, i) => ({
      product: { ...baseProduct, id: String(i), category: i % 2 === 0 ? 'skincare' : 'lip' },
      score: 100 - i,
    }));
    const result = diversify(scored, 2, 6);
    expect(result.length).toBeLessThanOrEqual(6);
  });
});
```

**Step 2:** Run tests to verify they fail.

```bash
npm run test:run -- src/services/scoringService.test.ts
```

Expected: FAIL — module not found.

**Step 3:** Implement the scoring engine.

```typescript
// src/services/scoringService.ts
import type { SkinProfile } from '@/types';

/** Product shape from Supabase (snake_case) */
export interface DBProduct {
  id?: string;
  melanin_min: number;
  melanin_max: number;
  undertones: string[];
  skin_types?: string[];
  concerns?: string[];
  ingredients?: string[];
  safety_rating?: string;
  category: string;
  [key: string]: unknown;
}

// ── Beneficial ingredients per concern ──────────────
const BENEFICIAL_MAP: Record<string, string[]> = {
  dryness: ['hyaluronic acid', 'ceramide', 'squalane', 'glycerin', 'shea butter', 'snail secretion filtrate'],
  aging: ['retinol', 'peptide', 'niacinamide', 'vitamin c', 'collagen', 'ginseng'],
  acne: ['salicylic acid', 'tea tree', 'niacinamide', 'centella asiatica', 'zinc'],
  hyperpigmentation: ['vitamin c', 'arbutin', 'niacinamide', 'licorice extract', 'ascorbic acid'],
  dullness: ['vitamin c', 'niacinamide', 'aha', 'rice extract', 'ascorbic acid'],
  redness: ['centella asiatica', 'green tea', 'aloe vera', 'beta-glucan', 'panthenol'],
  uneven_tone: ['niacinamide', 'vitamin c', 'arbutin', 'aha'],
  sun_damage: ['vitamin c', 'niacinamide', 'green tea', 'vitamin e'],
};

const IRRITANTS = ['fragrance', 'alcohol', 'denatured alcohol', 'parfum', 'synthetic dye'];

// ── Scoring Functions ───────────────────────────────

export function scoreMelanin(product: Pick<DBProduct, 'melanin_min' | 'melanin_max'>, melaninIndex: number): number {
  const mid = (product.melanin_min + product.melanin_max) / 2;
  const distance = Math.abs(melaninIndex - mid);

  if (distance === 0 || (distance <= 0.5)) return 25;
  if (melaninIndex >= product.melanin_min && melaninIndex <= product.melanin_max) return 18;
  if (distance <= 1.5) return 10;
  return 0;
}

export function scoreUndertone(product: Pick<DBProduct, 'undertones'>, undertone: string): number {
  if (product.undertones.includes(undertone)) return 15;
  if (product.undertones.includes('Neutral')) return 7;
  return 0;
}

export function scoreSkinType(product: Pick<DBProduct, 'skin_types'>, skinType?: string): number {
  if (!skinType || !product.skin_types?.length) return 7; // neutral score when unknown
  if (product.skin_types.includes(skinType)) return 15;
  if (product.skin_types.includes('normal')) return 7;
  return 0;
}

export function scoreConcerns(product: Pick<DBProduct, 'concerns'>, concerns: string[]): number {
  if (!product.concerns?.length || !concerns.length) return 0;
  const matched = concerns.filter(c =>
    product.concerns!.some(pc => pc.toLowerCase() === c.toLowerCase())
  );
  return Math.min(matched.length * 5, 10);
}

export function scoreIngredients(product: Pick<DBProduct, 'ingredients'>, concerns: string[]): number {
  if (!product.ingredients?.length) return 0;
  const lowerIngredients = product.ingredients.map(i => i.toLowerCase());

  // Count beneficial
  let beneficial = 0;
  for (const concern of concerns) {
    const goodOnes = BENEFICIAL_MAP[concern.toLowerCase()] ?? [];
    for (const good of goodOnes) {
      if (lowerIngredients.some(i => i.includes(good))) {
        beneficial++;
      }
    }
  }

  // Count irritants
  const irritantCount = IRRITANTS.filter(irr =>
    lowerIngredients.some(i => i.includes(irr))
  ).length;

  return Math.min(beneficial * 5, 12) - (irritantCount * 4);
}

export function scoreSafety(product: Pick<DBProduct, 'safety_rating'>, sensitivityLevel: number = 3): number {
  const base = product.safety_rating === 'EWG Green' ? 15
    : product.safety_rating === 'Vegan' ? 13
    : product.safety_rating === 'EWG Yellow' ? 5
    : product.safety_rating === 'EWG Red' ? -5
    : 0;

  const multiplier = sensitivityLevel >= 4 ? 1.5
    : sensitivityLevel >= 3 ? 1.0
    : 0.7;

  return Math.round(base * multiplier);
}

export function scoreProduct(product: DBProduct, profile: SkinProfile): number {
  let score = 0;

  score += scoreMelanin(product, profile.melaninIndex);
  score += scoreUndertone(product, profile.undertone);
  score += scoreSkinType(product, profile.skinType);
  score += scoreConcerns(product, profile.skinConcerns);
  score += scoreIngredients(product, profile.skinConcerns);
  score += scoreSafety(product, profile.sensitivityLevel);

  return Math.max(score, 0);
}

// ── Diversification ─────────────────────────────────

export interface ScoredProduct {
  product: DBProduct;
  score: number;
}

export function diversify(
  scored: ScoredProduct[],
  maxPerCategory: number = 2,
  total: number = 6
): DBProduct[] {
  const result: DBProduct[] = [];
  const categoryCount: Record<string, number> = {};

  for (const { product } of scored) {
    const count = categoryCount[product.category] ?? 0;
    if (count >= maxPerCategory) continue;
    result.push(product);
    categoryCount[product.category] = count + 1;
    if (result.length >= total) break;
  }

  return result;
}
```

**Step 4:** Run tests.

```bash
npm run test:run -- src/services/scoringService.test.ts
```

Expected: All tests pass.

**Step 5:** Run typecheck.

```bash
npm run typecheck
```

**Step 6:** Commit.

```bash
git add src/services/scoringService.ts src/services/scoringService.test.ts
git commit -m "feat: add product scoring engine with weighted algorithm

Melanin (25), undertone (15), skin type (15), concerns (10),
ingredients (15), safety×sensitivity (15) scoring with category
diversification. Includes beneficial/irritant ingredient maps."
```

---

## Task 4: analyze-skin Edge Function

Create a new Edge Function that focuses Gemini on skin analysis only (no product recommendations). Returns expanded SkinProfile.

**Files:**
- Create: `supabase/functions/analyze-skin/index.ts`

**Context:**
- Current `analyze-kbeauty/index.ts` has Gemini call with full response schema including products, videos, etc.
- New function keeps: tone (expanded with skinProfile), sherlock, kMatch, autoTags, youtubeSearch
- New function removes: recommendations.products, recommendations.videos (product matching is now server-side)
- New function adds: skinProfile fields to the tone response schema
- CORS, timeout, API key patterns identical to existing function

**Step 1:** Create the Edge Function.

```typescript
// supabase/functions/analyze-skin/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ALLOWED_ORIGINS = [
  'https://k-mirror.vercel.app',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function stripBase64Prefix(b64: string): string {
  const idx = b64.indexOf(',');
  if (idx !== -1 && b64.slice(0, idx).includes('base64')) {
    return b64.slice(idx + 1);
  }
  return b64;
}

function buildResponseSchema() {
  return {
    type: 'OBJECT',
    properties: {
      tone: {
        type: 'OBJECT',
        properties: {
          melaninIndex: { type: 'NUMBER' },
          undertone: { type: 'STRING', description: 'Warm, Cool, or Neutral' },
          skinHexCode: { type: 'STRING', description: 'Average skin color as #RRGGBB hex' },
          skinConcerns: { type: 'ARRAY', items: { type: 'STRING' } },
          description: { type: 'STRING' },
          skinType: { type: 'STRING', description: 'dry, oily, combination, or normal' },
          sensitivityLevel: { type: 'NUMBER', description: '1 (low) to 5 (high)' },
          moistureLevel: { type: 'STRING', description: 'low, medium, or high' },
          sebumLevel: { type: 'STRING', description: 'low, medium, or high' },
          poreSize: { type: 'STRING', description: 'small, medium, or large' },
          skinThickness: { type: 'STRING', description: 'thin, medium, or thick' },
        },
        required: [
          'melaninIndex', 'undertone', 'skinHexCode', 'skinConcerns', 'description',
          'skinType', 'sensitivityLevel', 'moistureLevel', 'sebumLevel', 'poreSize', 'skinThickness',
        ],
      },
      sherlock: {
        type: 'OBJECT',
        properties: {
          proportions: {
            type: 'OBJECT',
            properties: {
              upper: { type: 'STRING' },
              middle: { type: 'STRING' },
              lower: { type: 'STRING' },
            },
            required: ['upper', 'middle', 'lower'],
          },
          eyeAngle: { type: 'STRING' },
          boneStructure: { type: 'STRING' },
          facialVibe: { type: 'STRING' },
        },
        required: ['proportions', 'eyeAngle', 'boneStructure', 'facialVibe'],
      },
      kMatch: {
        type: 'OBJECT',
        properties: {
          celebName: { type: 'STRING' },
          adaptationLogic: {
            type: 'OBJECT',
            properties: {
              base: { type: 'STRING' },
              lip: { type: 'STRING' },
              point: { type: 'STRING' },
            },
            required: ['base', 'lip', 'point'],
          },
          styleExplanation: { type: 'STRING' },
          aiStylePoints: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['celebName', 'adaptationLogic', 'styleExplanation', 'aiStylePoints'],
      },
      recommendations: {
        type: 'OBJECT',
        properties: {
          ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
          sensitiveSafe: { type: 'BOOLEAN' },
        },
        required: ['ingredients', 'sensitiveSafe'],
      },
      autoTags: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      youtubeSearch: {
        type: 'OBJECT',
        properties: {
          queries: { type: 'ARRAY', items: { type: 'STRING' } },
          focusPoints: { type: 'ARRAY', items: { type: 'STRING' } },
          channelSuggestions: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['queries', 'focusPoints', 'channelSuggestions'],
      },
    },
    required: ['tone', 'sherlock', 'kMatch', 'recommendations', 'autoTags', 'youtubeSearch'],
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      userImageBase64,
      celebImageBase64,
      isSensitive,
      prefs,
      selectedCelebName,
    } = body as {
      userImageBase64: string;
      celebImageBase64: string;
      isSensitive: boolean;
      prefs: { environment: string; skill: string; mood: string };
      selectedCelebName?: string;
    };

    const celebContext = selectedCelebName
      ? `The user has selected "${selectedCelebName}" as their style muse.`
      : 'The user uploaded a K-Celeb inspiration photo.';

    const systemInstruction = `
    You are a Global K-Beauty Stylist and Face Analysis Expert (Neural Stylist v6.0).
    Analyze the two images provided:
    1. The user's bare face.
    2. ${celebContext}

    User Profile & Preferences:
    - Environment: ${prefs.environment} (Tailor makeup longevity and finish)
    - Skill Level: ${prefs.skill} (Suggest techniques appropriate for this skill)
    - Desired Mood: ${prefs.mood} (Influence the overall aesthetic direction)
    - Sensitive Skin: ${isSensitive ? 'Yes' : 'No'}

    ═══ INCLUSIVITY DIRECTIVES (MANDATORY) ═══
    1. NEVER suggest lightening or whitening the user's skin tone.
       Use "luminosity" or "radiance" instead of "brightening."
    2. NEVER compare ethnic features as superior or inferior.
    3. Adapt the K-celeb style TO the user's features, not the other way around.
    4. For deep skin tones (L4-L6), increase chromatic saturation of
       product colors by 30-50% to achieve equivalent visual impact.
    5. Preserve the user's natural features.
    6. Never use terms: "fix", "correct", "improve" for ethnic features.
       Use: "enhance", "accentuate", "harmonize".

    ═══ MELANIN-AWARE COLOR ADAPTATION ═══
    - L1-L2: Standard K-beauty shades apply directly.
    - L3: Shift warm tones +10% saturation.
    - L4: Replace pastel shades with medium-chroma equivalents.
    - L5: Deep-chroma variants. Use gold-infused primers.
    - L6: Maximum chromatic density. Berry > Coral. Black-Cherry > Rose.

    ═══ STRUCTURE-AWARE PLACEMENT ═══
    - Prominent zygomatic arches: Highlighter on highest point.
    - Deep orbital sockets: Reduce crease color depth.
    - Flat nasal bridges: Enhance brow bone instead.
    - Full lips: Embrace fullness. Adapt K-gradient to full lip shape.

    ═══ EXTENDED SKIN PROFILE ANALYSIS ═══
    Analyze the following skin characteristics carefully:
    - skinType: Determine if skin is dry, oily, combination, or normal based on visible shine zones, texture, and pore appearance.
    - sensitivityLevel (1-5): Assess based on visible redness, thin capillaries, reactivity indicators.
    - moistureLevel (low/medium/high): Evaluate from skin plumpness, fine lines, surface texture.
    - sebumLevel (low/medium/high): Assess from T-zone shine, pore congestion, visible oil.
    - poreSize (small/medium/large): Evaluate visible pore diameter on cheeks and nose.
    - skinThickness (thin/medium/thick): Assess from visibility of blood vessels, texture resilience, bounce.

    ═══ ANALYSIS TASKS ═══
    1. Extended Tone Analysis: All standard fields PLUS skinType, sensitivityLevel, moistureLevel, sebumLevel, poreSize, skinThickness.
    2. Sherlock Face Analysis: Proportions, Eye Angle, Bone Structure, Facial Vibe.
    3. Style Transfer Logic: Reinterpret K-celeb style for user's features.
    4. Ingredient Recommendations: 3-5 beneficial ingredients for the user's skin profile. Include sensitiveSafe flag.
    5. Auto Tags: 3-5 descriptive tags for categorization.
    6. YouTube Search Hints: Korean search queries, focus points, channel suggestions.

    NOTE: Do NOT recommend specific products. Product matching is handled separately.

    Output MUST be in valid JSON format only.
  `;

    const userImage = stripBase64Prefix(userImageBase64);
    const celebImage = stripBase64Prefix(celebImageBase64);

    const geminiRequestBody = {
      contents: [
        {
          parts: [
            { text: systemInstruction },
            { text: "Analyze these two images. Image 1 is the user's bare face. Image 2 is the K-Celeb style muse." },
            { inlineData: { mimeType: 'image/jpeg', data: userImage } },
            { inlineData: { mimeType: 'image/jpeg', data: celebImage } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: buildResponseSchema(),
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    let geminiRes: Response;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiRequestBody),
          signal: controller.signal,
        },
      );
    } catch (fetchErr) {
      if ((fetchErr as Error).name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Gemini API request timed out (45s)' }), {
          status: 504,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        });
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error (${geminiRes.status})`, details: errBody }),
        { status: geminiRes.status, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
      );
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return new Response(JSON.stringify({ error: 'Gemini returned an empty response' }), {
        status: 502,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const result = JSON.parse(text);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
```

**Step 2:** Verify by reviewing: CORS handling, timeout, error responses are consistent with existing Edge Function.

**Step 3:** Commit.

```bash
git add supabase/functions/analyze-skin/index.ts
git commit -m "feat: add analyze-skin Edge Function with expanded skin profile

Focused Gemini prompt for skin analysis only (no product recommendations).
Returns extended SkinProfile with skinType, sensitivityLevel, moistureLevel,
sebumLevel, poreSize, skinThickness. Products now matched server-side."
```

---

## Task 5: match-products Edge Function

Create the Edge Function that receives a SkinProfile, queries Supabase products, runs the scoring engine, and returns ranked recommendations.

**Files:**
- Create: `supabase/functions/match-products/index.ts`

**Context:**
- This function receives `skinProfile` from the client (output of analyze-skin)
- Queries Supabase `products` table filtered by melanin range
- Runs scoring algorithm from design (same logic as `scoringService.ts`)
- Returns diversified product list
- Must include its own copy of scoring logic (Edge Functions run in Deno, can't import from `src/`)

**Step 1:** Create the Edge Function.

```typescript
// supabase/functions/match-products/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://k-mirror.vercel.app',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// ── Scoring Logic (mirrored from src/services/scoringService.ts) ──

interface SkinProfile {
  melaninIndex: number;
  undertone: string;
  skinType?: string;
  sensitivityLevel?: number;
  skinConcerns: string[];
}

interface DBProduct {
  id: string;
  brand: string;
  name_en: string;
  name_ko: string;
  category: string;
  subcategory: string | null;
  melanin_min: number;
  melanin_max: number;
  undertones: string[];
  skin_types: string[];
  concerns: string[];
  ingredients: string[];
  shade_hex: string | null;
  price_usd: number;
  image_url: string | null;
  affiliate_url: string | null;
  safety_rating: string | null;
}

const BENEFICIAL_MAP: Record<string, string[]> = {
  dryness: ['hyaluronic acid', 'ceramide', 'squalane', 'glycerin', 'shea butter', 'snail secretion filtrate'],
  aging: ['retinol', 'peptide', 'niacinamide', 'vitamin c', 'collagen', 'ginseng'],
  acne: ['salicylic acid', 'tea tree', 'niacinamide', 'centella asiatica', 'zinc'],
  hyperpigmentation: ['vitamin c', 'arbutin', 'niacinamide', 'licorice extract', 'ascorbic acid'],
  dullness: ['vitamin c', 'niacinamide', 'aha', 'rice extract', 'ascorbic acid'],
  redness: ['centella asiatica', 'green tea', 'aloe vera', 'beta-glucan', 'panthenol'],
  uneven_tone: ['niacinamide', 'vitamin c', 'arbutin', 'aha'],
  sun_damage: ['vitamin c', 'niacinamide', 'green tea', 'vitamin e'],
};

const IRRITANTS = ['fragrance', 'alcohol', 'denatured alcohol', 'parfum', 'synthetic dye'];

function scoreProduct(product: DBProduct, profile: SkinProfile): number {
  let score = 0;

  // Melanin (25)
  const mid = (product.melanin_min + product.melanin_max) / 2;
  const dist = Math.abs(profile.melaninIndex - mid);
  if (dist <= 0.5) score += 25;
  else if (profile.melaninIndex >= product.melanin_min && profile.melaninIndex <= product.melanin_max) score += 18;
  else if (dist <= 1.5) score += 10;

  // Undertone (15)
  if (product.undertones?.includes(profile.undertone)) score += 15;
  else if (product.undertones?.includes('Neutral')) score += 7;

  // Skin type (15)
  if (profile.skinType && product.skin_types?.includes(profile.skinType)) score += 15;
  else if (product.skin_types?.includes('normal')) score += 7;
  else if (!profile.skinType) score += 7;

  // Concerns (10)
  if (product.concerns?.length && profile.skinConcerns?.length) {
    const matched = profile.skinConcerns.filter(c =>
      product.concerns.some(pc => pc.toLowerCase() === c.toLowerCase())
    ).length;
    score += Math.min(matched * 5, 10);
  }

  // Ingredients (15)
  if (product.ingredients?.length) {
    const lower = product.ingredients.map(i => i.toLowerCase());
    let beneficial = 0;
    for (const concern of (profile.skinConcerns ?? [])) {
      const goodOnes = BENEFICIAL_MAP[concern.toLowerCase()] ?? [];
      for (const good of goodOnes) {
        if (lower.some(i => i.includes(good))) beneficial++;
      }
    }
    const irritantCount = IRRITANTS.filter(irr => lower.some(i => i.includes(irr))).length;
    score += Math.min(beneficial * 5, 12) - (irritantCount * 4);
  }

  // Safety × sensitivity (15)
  const sens = profile.sensitivityLevel ?? 3;
  const safetyBase = product.safety_rating === 'EWG Green' ? 15
    : product.safety_rating === 'Vegan' ? 13
    : product.safety_rating === 'EWG Yellow' ? 5
    : product.safety_rating === 'EWG Red' ? -5 : 0;
  const multiplier = sens >= 4 ? 1.5 : sens >= 3 ? 1.0 : 0.7;
  score += Math.round(safetyBase * multiplier);

  return Math.max(score, 0);
}

function diversify(scored: { product: DBProduct; score: number }[], maxPerCat = 2, total = 6): DBProduct[] {
  const result: DBProduct[] = [];
  const catCount: Record<string, number> = {};
  for (const { product } of scored) {
    const c = catCount[product.category] ?? 0;
    if (c >= maxPerCat) continue;
    result.push(product);
    catCount[product.category] = c + 1;
    if (result.length >= total) break;
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { skinProfile } = await req.json() as { skinProfile: SkinProfile };

    if (!skinProfile?.melaninIndex || !skinProfile?.undertone) {
      return new Response(JSON.stringify({ error: 'skinProfile with melaninIndex and undertone is required' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Query all active products (small catalog, full scan is fine)
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Score and rank
    const scored = (products as DBProduct[])
      .map(product => ({ product, score: scoreProduct(product, skinProfile) }))
      .sort((a, b) => b.score - a.score);

    // Diversify
    const recommendations = diversify(scored);

    // Return with scores
    const result = recommendations.map(product => {
      const match = scored.find(s => s.product.id === product.id);
      return {
        ...product,
        matchScore: match?.score ?? 0,
      };
    });

    return new Response(JSON.stringify({ recommendations: result }), {
      status: 200,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
```

**Step 2:** Verify: CORS patterns match, error handling is consistent.

**Step 3:** Commit.

```bash
git add supabase/functions/match-products/index.ts
git commit -m "feat: add match-products Edge Function with scoring engine

Queries Supabase products table, runs weighted scoring algorithm
(melanin, undertone, skin type, concerns, ingredients, safety),
returns diversified recommendations capped at 2 per category."
```

---

## Task 6: Client Analysis Service Refactor

Update `geminiService.ts` to support both old (analyze-kbeauty) and new (analyze-skin + match-products) API flows. Update `scanStore.ts` for the 2-step pipeline.

**Files:**
- Modify: `src/services/geminiService.ts`
- Modify: `src/store/scanStore.ts`
- Modify: `src/services/geminiService.test.ts`
- Modify: `src/store/scanStore.test.ts`

**Context:**
- Current `analyzeKBeauty()` calls single `analyze-kbeauty` Edge Function
- New flow: call `analyze-skin` → get skinProfile → call `match-products` (parallel with YouTube)
- Must be backwards compatible: if new endpoints fail, fall back to old endpoint
- `scanStore.analyze()` orchestrates the flow

**Step 1:** Add `analyzeSkin()` and `matchProducts()` functions to `geminiService.ts`.

Add after existing `analyzeKBeauty` function:

```typescript
/**
 * Phase 1: Analyze skin only (expanded skin profile, no product recommendations).
 * Falls back to analyzeKBeauty if the new endpoint is not available.
 */
export const analyzeSkin = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean,
  prefs: UserPreferences,
  selectedCelebName?: string,
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new AnalysisError('Supabase is not configured.', 'API');
  }

  if (!rateLimiter.check()) {
    throw new AnalysisError('Too many requests. Please wait a moment.', 'RATE_LIMITED');
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
  const onAbort = () => timeoutController.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/analyze-skin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userImageBase64, celebImageBase64, isSensitive, prefs, selectedCelebName }),
      signal: timeoutController.signal,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
      throw new AnalysisError(errBody.error || `Server error: ${res.status}`, 'API');
    }

    const response = await res.json();
    const validated = analysisResultSchema.safeParse(response);

    if (!validated.success) {
      console.error('Zod validation errors:', validated.error.issues);
      throw new AnalysisError('AI response format error.', 'VALIDATION');
    }

    return validated.data;
  } catch (err) {
    if (signal?.aborted) throw new AnalysisError('Analysis was cancelled.', 'ABORTED');
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new AnalysisError('Analysis timed out.', 'TIMEOUT');
    }
    if (err instanceof AnalysisError) throw err;
    throw new AnalysisError(
      err instanceof Error ? err.message : 'Failed to analyze skin.',
      'API'
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
};

/** Matched product from the match-products Edge Function */
export interface MatchedProduct {
  id: string;
  brand: string;
  name_en: string;
  name_ko: string;
  category: string;
  subcategory: string | null;
  melanin_min: number;
  melanin_max: number;
  undertones: string[];
  skin_types: string[];
  concerns: string[];
  ingredients: string[];
  shade_hex: string | null;
  price_usd: number;
  image_url: string | null;
  affiliate_url: string | null;
  safety_rating: string | null;
  matchScore: number;
}

/**
 * Phase 2: Match products based on skin profile.
 */
export const matchProducts = async (
  skinProfile: AnalysisResult['tone'],
  signal?: AbortSignal
): Promise<MatchedProduct[]> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 10_000);
  const onAbort = () => timeoutController.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/match-products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skinProfile }),
      signal: timeoutController.signal,
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.recommendations ?? [];
  } catch {
    return []; // Product matching is best-effort
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
};
```

**Step 2:** Update `scanStore.ts` to use the new 2-step flow with fallback.

Replace the `analyze` method body:

```typescript
analyze: async (isSensitive, prefs) => {
  const { userImage, celebImage, selectedCelebName } = get();
  if (!userImage || !celebImage) return;

  analyzeController?.abort();
  const controller = new AbortController();
  analyzeController = controller;

  try {
    set({ phase: 'analyzing', error: null });

    let res: AnalysisResult;
    let matchedProducts: MatchedProduct[] = [];

    try {
      // New 2-step pipeline
      res = await analyzeSkin(userImage, celebImage, isSensitive, prefs, selectedCelebName ?? undefined, controller.signal);

      // Phase 2: match products + YouTube in parallel
      const [products, videos] = await Promise.all([
        matchProducts(res.tone, controller.signal),
        (isYouTubeConfigured && res.youtubeSearch?.queries?.length)
          ? searchYouTubeVideos(res.youtubeSearch.queries).catch(() => [] as YouTubeVideo[])
          : Promise.resolve([] as YouTubeVideo[]),
      ]);

      matchedProducts = products;
      if (!controller.signal.aborted && videos.length > 0) {
        set({ youtubeVideos: videos });
      }
    } catch (skinErr) {
      // Fallback to legacy endpoint
      if (controller.signal.aborted) throw skinErr;
      console.warn('analyze-skin failed, falling back to analyze-kbeauty:', skinErr);
      res = await analyzeKBeauty(userImage, celebImage, isSensitive, prefs, selectedCelebName ?? undefined, controller.signal);

      // YouTube (non-blocking, same as before)
      if (isYouTubeConfigured && res.youtubeSearch?.queries?.length) {
        searchYouTubeVideos(res.youtubeSearch.queries).then((videos) => {
          if (!controller.signal.aborted) set({ youtubeVideos: videos });
        }).catch(() => {});
      }
    }

    if (!controller.signal.aborted) {
      set({
        result: res,
        matchedProducts,
        phase: 'result',
      });
    }
  } catch (err) {
    if (controller.signal.aborted) return;
    console.error(err);
    const message = err instanceof AnalysisError
      ? err.message
      : 'An unexpected error occurred. Please try again.';
    set({ phase: 'idle', error: message });
  }
},
```

Also add `matchedProducts` to ScanState interface and initial state:

```typescript
interface ScanState {
  // ... existing fields
  matchedProducts: MatchedProduct[];
  // ... existing methods
}

// In create():
matchedProducts: [],

// In reset():
set({ result: null, youtubeVideos: [], matchedProducts: [], phase: 'idle', error: null, selectedCelebName: null });
```

**Step 3:** Update imports in scanStore.ts:

```typescript
import { analyzeKBeauty, analyzeSkin, matchProducts, AnalysisError } from '@/services/geminiService';
import type { MatchedProduct } from '@/services/geminiService';
```

**Step 4:** Update tests for scanStore and geminiService to handle the new flow.

**Step 5:** Run tests.

```bash
npm run test:run
```

**Step 6:** Run typecheck.

```bash
npm run typecheck
```

**Step 7:** Commit.

```bash
git add src/services/geminiService.ts src/store/scanStore.ts src/services/geminiService.test.ts src/store/scanStore.test.ts
git commit -m "feat: implement 2-step analysis pipeline with fallback

analyzeSkin() → matchProducts() + YouTube in parallel.
Falls back to legacy analyzeKBeauty if new endpoints unavailable.
Adds matchedProducts to scanStore state."
```

---

## Task 7: Update AnalysisResultView for DB Products

Update the result view to display DB-matched products alongside the existing AI-recommended products. Add product price formatting from DB.

**Files:**
- Modify: `src/views/AnalysisResultView.tsx`
- Modify: `src/types/index.ts` (if `MatchedProduct` display type needed)

**Context:**
- Current view uses `matchRecommendedProducts(result.recommendations.products, PRODUCT_CATALOG)` to match AI names to catalog
- New flow: `matchedProducts` from scanStore are already scored and matched from DB
- If `matchedProducts` is empty (fallback to old flow), continue using existing `matchRecommendedProducts`
- DB products have: `name_en`, `name_ko`, `price_usd`, `matchScore`, `shade_hex`, `safety_rating`

**Step 1:** Update AnalysisResultView to use `matchedProducts` when available.

In the component, add:

```typescript
const { result, userImage, celebImage, youtubeVideos, matchedProducts, reset } = useScanStore();
```

Replace the products rendering section to use a unified display array:

```typescript
// Build display products: prefer DB-matched, fall back to AI-recommended
const displayProducts = useMemo(() => {
  if (matchedProducts.length > 0) {
    return matchedProducts.map(p => ({
      name: i18n.language === 'ko' ? p.name_ko : p.name_en,
      brand: p.brand,
      price: `$${p.price_usd.toFixed(2)}`,
      desc: '', // DB products don't have AI-generated descriptions
      matchScore: p.matchScore,
      safetyRating: p.safety_rating ?? '',
      ingredients: p.ingredients ?? [],
      shadeHex: p.shade_hex,
      category: p.category,
      productId: p.id,
    }));
  }
  // Fallback to AI-recommended products
  return result.recommendations.products.map(p => ({
    name: p.name,
    brand: p.brand,
    price: p.price,
    desc: p.desc,
    matchScore: p.matchScore,
    safetyRating: p.safetyRating,
    ingredients: p.ingredients,
    shadeHex: null as string | null,
    category: null as string | null,
    productId: null as string | null,
  }));
}, [matchedProducts, result, i18n.language]);
```

Update the product cards to use `displayProducts` instead of `result.recommendations.products`.

**Step 2:** Update the handleAddToCart to work with DB products.

```typescript
const handleAddToCart = (idx: number) => {
  const dp = displayProducts[idx];
  if (!dp) return;

  if (dp.productId && matchedProducts.length > 0) {
    const dbProduct = matchedProducts.find(p => p.id === dp.productId);
    if (dbProduct) {
      addItem({
        id: dbProduct.id,
        name: dp.name,
        brand: dbProduct.brand,
        price: Math.round(dbProduct.price_usd * 100),
        priceDisplay: dp.price,
        desc: dp.desc,
        matchScore: dp.matchScore,
        ingredients: dp.ingredients,
        safetyRating: dp.safetyRating,
        category: dbProduct.category as Product['category'],
        melaninRange: [dbProduct.melanin_min, dbProduct.melanin_max],
      });
      return;
    }
  }
  // Fallback: legacy catalog matching
  const catalogProduct = matchRecommendedProducts(result!.recommendations.products, PRODUCT_CATALOG)[idx];
  if (catalogProduct) addItem(catalogProduct);
};
```

**Step 3:** Run tests and typecheck.

```bash
npm run test:run && npm run typecheck
```

**Step 4:** Commit.

```bash
git add src/views/AnalysisResultView.tsx
git commit -m "feat: display DB-matched products in analysis results

Uses matchedProducts from scanStore when available (new pipeline),
falls back to AI-recommended + catalog matching (legacy pipeline).
Supports bilingual product names (en/ko)."
```

---

## Task 8: Feedback Service + UI

Create the feedback service and add rating UI to the analysis result view.

**Files:**
- Create: `src/services/feedbackService.ts`
- Create: `src/services/feedbackService.test.ts`
- Modify: `src/views/AnalysisResultView.tsx` (add feedback buttons)
- Modify: `src/i18n/en.json` (add feedback strings)
- Modify: `src/i18n/ko.json` (add feedback strings)

**Context:**
- Feedback is inserted into `public.feedback` table via Supabase client
- Analysis result needs an `analysisId` to reference — we'll generate this client-side (UUID) and insert into analyses table
- Simple UI: thumbs up/down for analysis, thumbs up/down per product

**Step 1:** Write the feedback service tests.

```typescript
// src/services/feedbackService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ data: null, error: null })),
    })),
    auth: { getUser: vi.fn(() => ({ data: { user: null } })) },
  },
  isSupabaseConfigured: true,
}));

import { submitAnalysisFeedback, submitProductFeedback } from './feedbackService';

describe('feedbackService', () => {
  it('submitAnalysisFeedback calls supabase insert', async () => {
    const result = await submitAnalysisFeedback('analysis-123', true);
    expect(result).toBe(true);
  });

  it('submitProductFeedback calls supabase insert', async () => {
    const result = await submitProductFeedback('analysis-123', 'product-456', true);
    expect(result).toBe(true);
  });
});
```

**Step 2:** Implement the feedback service.

```typescript
// src/services/feedbackService.ts
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function submitAnalysisFeedback(
  analysisId: string,
  helpful: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const userId = await getCurrentUserId();
  const { error } = await supabase.from('feedback').insert({
    analysis_id: analysisId,
    user_id: userId,
    analysis_helpful: helpful,
  });

  if (error) {
    console.error('Failed to submit analysis feedback:', error.message);
    return false;
  }
  return true;
}

export async function submitProductFeedback(
  analysisId: string,
  productId: string,
  relevant: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const userId = await getCurrentUserId();
  const { error } = await supabase.from('feedback').insert({
    analysis_id: analysisId,
    user_id: userId,
    product_id: productId,
    product_relevant: relevant,
  });

  if (error) {
    console.error('Failed to submit product feedback:', error.message);
    return false;
  }
  return true;
}
```

**Step 3:** Add i18n strings.

In `src/i18n/en.json`, add under `"result"`:

```json
"feedbackQuestion": "Was this analysis helpful?",
"feedbackProductQuestion": "Right for your skin?",
"feedbackThanks": "Thanks for your feedback!",
"feedbackYes": "Yes",
"feedbackNo": "No"
```

In `src/i18n/ko.json`, add under `"result"`:

```json
"feedbackQuestion": "이 분석이 도움이 됐나요?",
"feedbackProductQuestion": "내 피부에 맞을까요?",
"feedbackThanks": "피드백 감사합니다!",
"feedbackYes": "네",
"feedbackNo": "아니오"
```

**Step 4:** Add feedback UI to AnalysisResultView.

Add a feedback section after the analysis header section. Add per-product feedback buttons to product cards. Use `ThumbsUp` / `ThumbsDown` icons from lucide-react.

Simple state management:

```typescript
const [analysisFeedback, setAnalysisFeedback] = useState<boolean | null>(null);
const [productFeedbacks, setProductFeedbacks] = useState<Record<string, boolean>>({});

const handleAnalysisFeedback = async (helpful: boolean) => {
  setAnalysisFeedback(helpful);
  // analysisId would come from the analysis response in future;
  // for now we use a placeholder
  await submitAnalysisFeedback('placeholder', helpful);
};

const handleProductFeedback = async (productId: string, relevant: boolean) => {
  setProductFeedbacks(prev => ({ ...prev, [productId]: relevant }));
  await submitProductFeedback('placeholder', productId, relevant);
};
```

UI for analysis feedback (after the "Neural Identity" section):

```tsx
{analysisFeedback === null ? (
  <div className="flex items-center gap-4 mt-8">
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {t('result.feedbackQuestion')}
    </span>
    <button onClick={() => handleAnalysisFeedback(true)} className="p-2 hover:bg-green-50 rounded-full transition-colors">
      <ThumbsUp size={14} className="text-gray-400 hover:text-green-500" />
    </button>
    <button onClick={() => handleAnalysisFeedback(false)} className="p-2 hover:bg-red-50 rounded-full transition-colors">
      <ThumbsDown size={14} className="text-gray-400 hover:text-red-400" />
    </button>
  </div>
) : (
  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mt-8">
    {t('result.feedbackThanks')}
  </p>
)}
```

**Step 5:** Run tests.

```bash
npm run test:run
```

**Step 6:** Run lint + typecheck.

```bash
npm run lint && npm run typecheck
```

**Step 7:** Commit.

```bash
git add src/services/feedbackService.ts src/services/feedbackService.test.ts src/views/AnalysisResultView.tsx src/i18n/en.json src/i18n/ko.json
git commit -m "feat: add feedback system with analysis + product ratings

Supabase-backed feedback collection with thumbs up/down for analysis
helpfulness and per-product skin relevance. Bilingual UI (EN/KO)."
```

---

## Task 9: Update Demo Result + productService

Update `demoResult.ts` with the extended skin profile fields. Update `productService.ts` to support the new DB schema columns.

**Files:**
- Modify: `src/data/demoResult.ts`
- Modify: `src/services/productService.ts`

**Context:**
- `DEMO_RESULT` must include new optional skin profile fields so demo mode showcases the expanded analysis
- `productService.ts` `fetchProducts()` maps Supabase rows to `Product` type — update to handle new columns

**Step 1:** Update `demoResult.ts` tone object.

Add the new skin profile fields to `DEMO_RESULT.tone`:

```typescript
tone: {
  melaninIndex: 5,
  undertone: 'Cool',
  skinHexCode: '#6B4226',
  skinConcerns: ['Hyper-pigmentation', 'Inner Dryness', 'Structural Shadowing'],
  description: "Your complexion exhibits a rich, cool-ebony depth...",
  // Extended skin profile
  skinType: 'combination',
  sensitivityLevel: 2,
  moistureLevel: 'low',
  sebumLevel: 'medium',
  poreSize: 'medium',
  skinThickness: 'medium',
},
```

**Step 2:** Update `productService.ts` row mapping to include new DB columns.

Update `fetchProducts()` return mapping to handle `name_en`, `name_ko`, `undertones`, `skin_types`, `concerns`, `price_usd`:

```typescript
return data.map((r) => ({
  id: r.id,
  name: r.name_en ?? r.name ?? '',
  brand: r.brand,
  price: r.price_usd ? Math.round(r.price_usd * 100) : (r.price ?? 0),
  priceDisplay: r.price_usd ? `$${Number(r.price_usd).toFixed(2)}` : `$${((r.price ?? 0) / 100).toFixed(2)}`,
  desc: r.desc ?? '',
  matchScore: r.match_score ?? 0,
  ingredients: r.ingredients ?? [],
  safetyRating: r.safety_rating ?? '',
  category: r.category,
  imageUrl: r.image_url ?? undefined,
  melaninRange: [r.melanin_min ?? 1, r.melanin_max ?? 6] as [number, number],
}));
```

**Step 3:** Run tests.

```bash
npm run test:run
```

**Step 4:** Commit.

```bash
git add src/data/demoResult.ts src/services/productService.ts
git commit -m "feat: update demo result with skin profile + productService for new DB schema

Demo result includes skinType, sensitivityLevel, moistureLevel, etc.
productService handles both old and new DB column names."
```

---

## Task 10: Verification + Cleanup

Run all checks, fix any remaining issues, ensure everything builds cleanly.

**Files:**
- May need minor fixes across any file

**Step 1:** Run typecheck.

```bash
npm run typecheck
```

Expected: 0 errors.

**Step 2:** Run lint.

```bash
npm run lint
```

Expected: 0 errors/warnings.

**Step 3:** Run tests.

```bash
npm run test:run
```

Expected: All tests pass (including new tests from this plan).

**Step 4:** Run build.

```bash
npm run build
```

Expected: Successful build.

**Step 5:** Verify file inventory. Ensure these files exist:

```
supabase/migrations/20260213000000_algorithm_backend.sql
supabase/functions/analyze-skin/index.ts
supabase/functions/match-products/index.ts
src/services/scoringService.ts
src/services/scoringService.test.ts
src/services/feedbackService.ts
src/services/feedbackService.test.ts
```

**Step 6:** Final commit if any fixes were needed.

```bash
git add -A
git commit -m "chore: algorithm backend verification and cleanup"
```

---

## Post-Implementation: Manual Deploy Steps (not automated)

After all tasks are complete and merged, the following manual steps are needed:

1. **Apply DB migration:** `supabase db push` or run the SQL in Supabase Dashboard
2. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy analyze-skin
   supabase functions deploy match-products
   ```
3. **Set secrets:** `supabase secrets set GEMINI_API_KEY=<key>`
4. **Verify:** Call `/api/health` endpoint to check Supabase connectivity
