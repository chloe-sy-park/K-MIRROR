// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

    // Get user from auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();

    const { items, shippingMethod, shippingName, shippingCountry, shippingAddress } = await req.json();

    const shippingRates: Record<string, number> = { dhl: 1800, ems: 1200 };
    const shippingCost = shippingRates[shippingMethod] || 1800;

    // Build Stripe line items from cart
    const lineItems = items.map((item: { product: { name: string; brand: string; price: number }; quantity: number }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.product.brand} — ${item.product.name}`,
        },
        unit_amount: item.product.price,
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `Shipping (${shippingMethod.toUpperCase()})` },
        unit_amount: shippingCost,
      },
      quantity: 1,
    });

    const origin = req.headers.get('origin') || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    // Save pending order to DB (use service role for insert)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const subtotal = items.reduce(
      (sum: number, i: { product: { price: number }; quantity: number }) =>
        sum + i.product.price * i.quantity,
      0
    );

    await supabaseAdmin.from('orders').insert({
      user_id: user?.id || null,
      stripe_session_id: session.id,
      items,
      subtotal,
      shipping: shippingCost,
      total: subtotal + shippingCost,
      shipping_method: shippingMethod,
      shipping_name: shippingName,
      shipping_country: shippingCountry,
      shipping_address: shippingAddress,
      status: 'pending',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
