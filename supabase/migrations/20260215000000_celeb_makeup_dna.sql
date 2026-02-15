-- =============================================================================
-- K-MIRROR: Celebrity Makeup DNA Table
-- =============================================================================
-- Stores analyzed makeup DNA data for each celebrity, used by the
-- "추구미" (追求美) feature to match user facial features with celeb styles.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.celeb_makeup_dna (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  celeb_id         TEXT        NOT NULL UNIQUE,
  celeb_name       TEXT        NOT NULL,
  category         TEXT        NOT NULL CHECK (category IN ('kpop', 'actress', 'global', 'influencer')),
  signature_look   TEXT,
  eye_pattern      JSONB       DEFAULT '{}',
  lip_pattern      JSONB       DEFAULT '{}',
  base_pattern     JSONB       DEFAULT '{}',
  balance_rule     JSONB       DEFAULT '{}',
  five_metrics     JSONB       DEFAULT '{}',
  adaptation_rules JSONB       DEFAULT '{}',
  source_videos    TEXT[]      DEFAULT '{}',
  source_images    TEXT[]      DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.celeb_makeup_dna IS 'Celebrity makeup DNA profiles for 추구미 matching';
COMMENT ON COLUMN public.celeb_makeup_dna.celeb_id IS 'Unique slug identifier (e.g. "jennie", "wonyoung")';
COMMENT ON COLUMN public.celeb_makeup_dna.five_metrics IS 'Visual Weight, Canthal Tilt, Mid-face Ratio, Luminosity, Harmony';
COMMENT ON COLUMN public.celeb_makeup_dna.adaptation_rules IS 'Melanin-level-specific application adjustments (L1_L2, L3_L4, L5_L6)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_celeb_makeup_dna_celeb_id ON public.celeb_makeup_dna(celeb_id);
CREATE INDEX IF NOT EXISTS idx_celeb_makeup_dna_category ON public.celeb_makeup_dna(category);

-- RLS
ALTER TABLE public.celeb_makeup_dna ENABLE ROW LEVEL SECURITY;

-- Everyone can read celeb DNA (public data)
CREATE POLICY "celeb_makeup_dna_select_all" ON public.celeb_makeup_dna
  FOR SELECT USING (true);

-- Only service role can insert/update (pipeline uploads)
CREATE POLICY "celeb_makeup_dna_insert_service" ON public.celeb_makeup_dna
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "celeb_makeup_dna_update_service" ON public.celeb_makeup_dna
  FOR UPDATE USING (auth.role() = 'service_role');

-- Add five_metrics column to analyses table for user analysis results
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS five_metrics JSONB DEFAULT '{}';
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS celeb_id TEXT;
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS gap_bridge JSONB DEFAULT '{}';

COMMENT ON COLUMN public.analyses.five_metrics IS 'User 5 Metrics from v6.0 analysis';
COMMENT ON COLUMN public.analyses.celeb_id IS 'Selected celeb for 추구미 matching';
COMMENT ON COLUMN public.analyses.gap_bridge IS 'Gap analysis between user and celeb metrics';

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER celeb_makeup_dna_updated_at
  BEFORE UPDATE ON public.celeb_makeup_dna
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
