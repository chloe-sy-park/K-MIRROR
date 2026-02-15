import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/* ─── 타입 ─────────────────────────────────────────────────────── */

export interface PremiumReport {
  id: string;
  analysis_id: string;
  user_id: string | null;
  stripe_session_id: string | null;
  status: 'pending' | 'paid' | 'generating' | 'ready' | 'failed';
  pdf_url: string | null;
  email: string | null;
  email_sent: boolean;
  created_at: string;
  expires_at: string;
}

/* ─── 조회 ─────────────────────────────────────────────────────── */

/**
 * Stripe 세션 ID로 프리미엄 리포트를 조회한다.
 * Supabase 미설정이거나 행이 없으면 null을 반환한다.
 */
export async function fetchReportBySessionId(
  sessionId: string,
): Promise<PremiumReport | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('premium_reports')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .limit(1)
    .single();

  if (error || !data) {
    if (import.meta.env.DEV) {
      console.warn('[reportService] fetchReportBySessionId failed:', error?.message);
    }
    return null;
  }

  return data as PremiumReport;
}

/**
 * 분석 ID로 프리미엄 리포트를 조회한다.
 * Supabase 미설정이거나 행이 없으면 null을 반환한다.
 */
export async function fetchReportByAnalysisId(
  analysisId: string,
): Promise<PremiumReport | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('premium_reports')
    .select('*')
    .eq('analysis_id', analysisId)
    .limit(1)
    .single();

  if (error || !data) {
    if (import.meta.env.DEV) {
      console.warn('[reportService] fetchReportByAnalysisId failed:', error?.message);
    }
    return null;
  }

  return data as PremiumReport;
}

/* ─── 상태 업데이트 ────────────────────────────────────────────── */

/**
 * 프리미엄 리포트 상태를 업데이트한다.
 * pdfUrl이 주어지면 pdf_url 컬럼도 함께 갱신한다.
 */
export async function updateReportStatus(
  id: string,
  status: PremiumReport['status'],
  pdfUrl?: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const payload: Record<string, unknown> = { status };
  if (pdfUrl !== undefined) {
    payload.pdf_url = pdfUrl;
  }

  const { error } = await supabase
    .from('premium_reports')
    .update(payload)
    .eq('id', id);

  if (error) {
    if (import.meta.env.DEV) {
      console.error('[reportService] updateReportStatus failed:', error.message);
    }
    throw error;
  }
}

/* ─── 이메일 전송 ──────────────────────────────────────────────── */

/**
 * Supabase Edge Function을 통해 리포트 이메일을 전송한다.
 * 성공 시 true, 실패 시 false를 반환한다 (non-blocking).
 */
export async function sendReportEmail(params: {
  email: string;
  analysisId: string;
  pdfUrl: string;
  celebName?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase.functions.invoke('send-report-email', {
      body: params,
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[reportService] sendReportEmail failed:', error.message);
      }
      return false;
    }

    return true;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[reportService] sendReportEmail exception:', err);
    }
    return false;
  }
}
