// supabase/functions/create-premium-checkout/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const ALLOWED_ORIGINS = ['https://k-mirror.vercel.app', 'http://localhost:3000'];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

    // Authenticate user from auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { analysisId } = await req.json();
    if (!analysisId) {
      return new Response(JSON.stringify({ error: 'analysisId is required' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const requestOrigin = req.headers.get('origin') ?? '';
    const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];

    // Create Stripe checkout session for digital product
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'THE SHERLOCK ARCHIVE — Premium Beauty Report',
              description: '10-page PDF: Facial metrics, radar charts, gap-bridge solutions, product curation',
            },
            unit_amount: 2499, // $24.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/archive?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium-checkout`,
      metadata: {
        type: 'sherlock_archive',
        analysis_id: analysisId,
      },
    });

    // Insert pending premium_report row via service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    await supabaseAdmin.from('premium_reports').insert({
      analysis_id: analysisId,
      user_id: user?.id || null,
      stripe_session_id: session.id,
      status: 'pending',
      email: user?.email || null,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
