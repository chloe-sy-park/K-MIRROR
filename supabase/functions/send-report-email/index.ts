// supabase/functions/send-report-email/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ['https://k-mirror.vercel.app', 'http://localhost:3000'];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function jsonResponse(body: Record<string, unknown>, req: Request, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

function buildEmailHtml(celebName: string | undefined, caseId: string, pdfUrl: string): string {
  const displayName = celebName || 'Your Analysis';

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A1A; color: #F0F0F0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #FF2D9B; margin: 0;">
          THE SHERLOCK ARCHIVE
        </h1>
        <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px; font-family: monospace;">
          Premium Beauty Intelligence Report
        </p>
      </div>

      <div style="background: #1A1A2E; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin: 0 0 8px;">
          Your report for
        </p>
        <p style="font-size: 18px; font-weight: 700; color: #FFD700; margin: 0;">
          &times; ${displayName}
        </p>
        <p style="font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.4); margin-top: 12px;">
          Case #${caseId}
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${pdfUrl}" style="display: inline-block; background: linear-gradient(to right, #FF4D8D, #FF6B9D); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em;">
          Download Your Report
        </a>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
        <p style="font-size: 11px; color: rgba(255,255,255,0.3); font-family: monospace;">
          This download link expires in 7 days.
        </p>
        <p style="font-size: 10px; color: rgba(255,255,255,0.2); margin-top: 8px;">
          k-mirror.ai &mdash; Neural Beauty Intelligence
        </p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  // Graceful no-op when Resend is not configured
  if (!resendApiKey) {
    return jsonResponse({ sent: false, reason: 'RESEND_API_KEY not configured' }, req);
  }

  try {
    const { email, analysisId, pdfUrl, celebName } = await req.json();

    if (!email || !pdfUrl) {
      return jsonResponse({ error: 'email and pdfUrl are required' }, req, 400);
    }

    const caseId = analysisId?.slice(0, 8) ?? 'UNKNOWN';

    // Send email via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'K-MIRROR <noreply@k-mirror.ai>',
        to: [email],
        subject: `Your Sherlock Archive is Ready → Case #${caseId}`,
        html: buildEmailHtml(celebName, caseId, pdfUrl),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend API error:', errBody);
      return jsonResponse({ sent: false, reason: 'Resend API error' }, req);
    }

    // Update premium_reports.email_sent = true
    if (analysisId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      await supabaseAdmin.from('premium_reports').update({ email_sent: true }).eq('analysis_id', analysisId);
    }

    return jsonResponse({ sent: true }, req);
  } catch (err) {
    console.error('send-report-email error:', err);
    return jsonResponse({ sent: false, reason: (err as Error).message }, req, 500);
  }
});
