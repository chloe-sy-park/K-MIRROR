-- =============================================================================
-- K-MIRROR: Premium Reports Table
-- =============================================================================
-- Tracks premium PDF report purchases via Stripe checkout.
-- Status flow: pending → paid → generating → ready (or failed)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.premium_reports (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id      UUID        NOT NULL REFERENCES public.analyses(id),
  user_id          UUID        REFERENCES auth.users(id),
  stripe_session_id TEXT       UNIQUE,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'paid', 'generating', 'ready', 'failed')),
  pdf_url          TEXT,
  email            TEXT,
  email_sent       BOOLEAN     DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  expires_at       TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

COMMENT ON TABLE public.premium_reports IS 'Premium PDF report purchases for THE SHERLOCK ARCHIVE';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_premium_reports_analysis_id ON public.premium_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_premium_reports_stripe_session ON public.premium_reports(stripe_session_id);

-- RLS
ALTER TABLE public.premium_reports ENABLE ROW LEVEL SECURITY;

-- Users can read their own reports
CREATE POLICY "premium_reports_select_own" ON public.premium_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (webhook + generation)
CREATE POLICY "premium_reports_service_all" ON public.premium_reports
  FOR ALL USING (auth.role() = 'service_role');
