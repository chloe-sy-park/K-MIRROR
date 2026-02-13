-- =============================================================================
-- K-MIRROR Algorithm Backend: Database Migration
-- =============================================================================
-- Creates the foundation tables for the product scoring engine:
--   1. products   - curated K-beauty product catalog
--   2. analyses   - skin analysis results from Gemini AI
--   3. feedback   - user feedback on analyses and product recommendations
-- =============================================================================


-- =============================================================================
-- 1. PRODUCTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  brand         TEXT           NOT NULL,
  name_en       TEXT           NOT NULL,
  name_ko       TEXT           NOT NULL,
  category      TEXT           NOT NULL,
  subcategory   TEXT,
  melanin_min   INT            NOT NULL CHECK (melanin_min BETWEEN 1 AND 6),
  melanin_max   INT            NOT NULL CHECK (melanin_max BETWEEN 1 AND 6),
  undertones    TEXT[]         NOT NULL DEFAULT '{}',
  skin_types    TEXT[]         DEFAULT '{}',
  concerns      TEXT[]         DEFAULT '{}',
  ingredients   TEXT[]         DEFAULT '{}',
  shade_hex     TEXT,
  price_usd     DECIMAL(10,2),
  image_url     TEXT,
  affiliate_url TEXT,
  safety_rating TEXT,
  is_active     BOOLEAN        DEFAULT true,
  created_at    TIMESTAMPTZ    DEFAULT now(),
  updated_at    TIMESTAMPTZ    DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Curated K-beauty product catalog for the scoring engine';


-- =============================================================================
-- 2. ANALYSES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.analyses (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  melanin_index          INT         NOT NULL CHECK (melanin_index BETWEEN 1 AND 6),
  undertone              TEXT        NOT NULL,
  skin_type              TEXT,
  sensitivity_level      INT         CHECK (sensitivity_level BETWEEN 1 AND 5),
  moisture_level         TEXT,
  sebum_level            TEXT,
  pore_size              TEXT,
  skin_thickness         TEXT,
  skin_concerns          TEXT[]      DEFAULT '{}',
  tone_analysis          JSONB,
  sherlock_analysis       JSONB,
  k_match                JSONB,
  recommended_product_ids UUID[]     DEFAULT '{}',
  gemini_model           TEXT,
  processing_time_ms     INT,
  created_at             TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.analyses IS 'Skin analysis results produced by Gemini AI';


-- =============================================================================
-- 3. FEEDBACK TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id       UUID        REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis_helpful  BOOLEAN,
  product_id        UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  product_relevant  BOOLEAN,
  comment           TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.feedback IS 'User feedback on analysis quality and product relevance';


-- =============================================================================
-- 4. INDEXES
-- =============================================================================

-- Product lookup by melanin range (only active products)
CREATE INDEX idx_products_melanin ON public.products (melanin_min, melanin_max)
  WHERE is_active;

-- Product lookup by category (only active products)
CREATE INDEX idx_products_category ON public.products (category)
  WHERE is_active;

-- Product lookup by undertone array (GIN for array containment queries)
CREATE INDEX idx_products_undertones ON public.products USING GIN (undertones)
  WHERE is_active;

-- Analysis lookup by user
CREATE INDEX idx_analyses_user ON public.analyses (user_id)
  WHERE user_id IS NOT NULL;

-- Feedback lookup by analysis
CREATE INDEX idx_feedback_analysis ON public.feedback (analysis_id);


-- =============================================================================
-- 5. ROW-LEVEL SECURITY
-- =============================================================================

-- ── Products: public read, no public write ──────────────────────────────────

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (true);

-- ── Analyses: anyone can insert, users read their own (or anonymous) ────────

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_insert"
  ON public.analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "analyses_select_own"
  ON public.analyses FOR SELECT
  USING (
    user_id IS NULL
    OR user_id = auth.uid()
  );

-- ── Feedback: anyone can insert, users read their own ───────────────────────

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "feedback_select_own"
  ON public.feedback FOR SELECT
  USING (
    user_id IS NULL
    OR user_id = auth.uid()
  );


-- =============================================================================
-- 6. UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 7. SEED DATA
-- =============================================================================
-- Migrated from src/data/productCatalog.ts (12 products).
-- Prices converted from cents to dollars (e.g. 4500 -> 45.00).
-- =============================================================================

INSERT INTO public.products
  (brand, name_en, name_ko, category, subcategory, melanin_min, melanin_max, undertones, skin_types, concerns, ingredients, price_usd, safety_rating)
VALUES
  -- ── Base ──────────────────────────────────────────────────────────────────

  (
    'HERA',
    'Black Cushion SPF34',
    '헤라 블랙 쿠션 SPF34',
    'base',
    'cushion',
    3, 6,
    ARRAY['Warm', 'Cool', 'Neutral'],
    ARRAY['oily', 'combination'],
    ARRAY['dullness', 'uneven_tone'],
    ARRAY['Niacinamide', 'Titanium Dioxide', 'Centella Asiatica'],
    45.00,
    'EWG Green'
  ),

  (
    'MISSHA',
    'Perfect Cover BB Cream',
    '미샤 퍼펙트 커버 BB크림',
    'base',
    'bb_cream',
    1, 3,
    ARRAY['Warm', 'Neutral'],
    ARRAY['dry', 'normal'],
    ARRAY['dryness', 'dullness'],
    ARRAY['Hyaluronic Acid', 'Ceramide NP', 'Rosemary Extract'],
    12.00,
    'EWG Green'
  ),

  (
    'Sulwhasoo',
    'Perfecting Cushion EX',
    '설화수 퍼펙팅 쿠션 EX',
    'base',
    'cushion',
    1, 4,
    ARRAY['Warm', 'Neutral'],
    ARRAY['dry', 'combination'],
    ARRAY['aging', 'dullness'],
    ARRAY['Korean Ginseng', 'Plum Blossom Extract', 'Jaumdan Complex'],
    56.00,
    'EWG Green'
  ),

  -- ── Lip ───────────────────────────────────────────────────────────────────

  (
    'ROM&ND',
    'Glasting Water Tint',
    '롬앤 글래스팅 워터 틴트',
    'lip',
    'tint',
    1, 6,
    ARRAY['Warm', 'Cool', 'Neutral'],
    ARRAY['dry', 'normal', 'oily', 'combination', 'sensitive'],
    '{}',
    ARRAY['Shea Butter', 'Jojoba Oil', 'Vitamin E'],
    14.00,
    'Vegan'
  ),

  (
    'Peripera',
    'Ink Mood Matte Stick',
    '페리페라 잉크 무드 매트 스틱',
    'lip',
    'lipstick',
    1, 5,
    ARRAY['Warm', 'Cool'],
    ARRAY['normal', 'combination'],
    '{}',
    ARRAY['Macadamia Oil', 'Beeswax', 'Vitamin C'],
    11.00,
    'EWG Green'
  ),

  (
    '3CE',
    'Velvet Lip Tint',
    '3CE 벨벳 립 틴트',
    'lip',
    'tint',
    2, 6,
    ARRAY['Cool', 'Neutral'],
    ARRAY['normal', 'oily'],
    '{}',
    ARRAY['Argan Oil', 'Candelilla Wax', 'Rose Hip Extract'],
    18.00,
    'Vegan'
  ),

  -- ── Eye ───────────────────────────────────────────────────────────────────

  (
    'CLIO',
    'Kill Brown Auto-Gel Liner',
    '클리오 킬 브라운 오토 젤 라이너',
    'eye',
    'liner',
    1, 4,
    ARRAY['Warm', 'Neutral'],
    ARRAY['normal', 'oily', 'combination'],
    '{}',
    ARRAY['Carnauba Wax', 'Silica', 'Tocopherol'],
    15.00,
    'EWG Green'
  ),

  (
    'ETUDE',
    'Play Color Eyes Palette',
    '에뛰드 플레이 컬러 아이즈 팔레트',
    'eye',
    'palette',
    1, 6,
    ARRAY['Warm', 'Cool', 'Neutral'],
    ARRAY['dry', 'normal', 'oily', 'combination', 'sensitive'],
    '{}',
    ARRAY['Mica', 'Dimethicone', 'Talc'],
    22.00,
    'EWG Green'
  ),

  -- ── Skincare ──────────────────────────────────────────────────────────────

  (
    'COSRX',
    'Advanced Snail 96 Mucin Essence',
    '코스알엑스 어드밴스드 스네일 96 뮤신 에센스',
    'skincare',
    'essence',
    1, 6,
    ARRAY['Warm', 'Cool', 'Neutral'],
    ARRAY['dry', 'normal', 'combination'],
    ARRAY['dryness', 'aging', 'hyperpigmentation'],
    ARRAY['Snail Secretion Filtrate (96%)', 'Betaine', 'Sodium Hyaluronate'],
    21.00,
    'EWG Green'
  ),

  (
    'Beauty of Joseon',
    'Relief Sun: Rice + Probiotics SPF50+',
    '조선미녀 맑은 쌀 선크림 SPF50+',
    'skincare',
    'sunscreen',
    1, 6,
    ARRAY['Warm', 'Cool', 'Neutral'],
    ARRAY['dry', 'normal', 'oily', 'combination', 'sensitive'],
    ARRAY['dullness', 'sun_damage'],
    ARRAY['Oryza Sativa Bran Extract', 'Lactobacillus', 'Niacinamide'],
    16.00,
    'EWG Green'
  ),

  (
    'Innisfree',
    'Green Tea Seed Serum',
    '이니스프리 그린티 씨드 세럼',
    'skincare',
    'serum',
    1, 6,
    ARRAY['Warm', 'Cool', 'Neutral'],
    ARRAY['dry', 'combination'],
    ARRAY['dryness', 'dullness'],
    ARRAY['Camellia Sinensis Seed Oil', 'Betaine', 'Trehalose'],
    27.00,
    'EWG Green'
  ),

  (
    'Dear, Klairs',
    'Freshly Juiced Vitamin Drop',
    '디어클레어스 프레쉴리 쥬스드 비타민 드롭',
    'skincare',
    'serum',
    1, 6,
    ARRAY['Warm', 'Cool', 'Neutral'],
    ARRAY['normal', 'combination', 'oily'],
    ARRAY['hyperpigmentation', 'dullness', 'acne'],
    ARRAY['Ascorbic Acid (5%)', 'Centella Asiatica', 'Portulaca Extract'],
    23.00,
    'Vegan'
  );
