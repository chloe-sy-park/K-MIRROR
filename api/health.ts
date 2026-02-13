import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, 'ok' | 'error'> = {};

  // Check Supabase
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const resp = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY || '' },
      });
      checks.supabase = resp.ok ? 'ok' : 'error';
    } else {
      checks.supabase = 'error';
    }
  } catch {
    checks.supabase = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
}
