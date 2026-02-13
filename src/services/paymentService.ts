import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isStripeConfigured, getStripe } from '@/lib/stripe';
import type { CartItem } from '@/types';

export const isPaymentEnabled = isStripeConfigured && isSupabaseConfigured;

interface CheckoutParams {
  items: CartItem[];
  shippingMethod: 'dhl' | 'ems';
  shippingName: string;
  shippingCountry: string;
  shippingAddress: string;
}

/**
 * Creates a Stripe Checkout Session via Supabase Edge Function.
 * Returns the Stripe session URL for redirect, or null if not configured.
 */
export async function createCheckoutSession(params: CheckoutParams): Promise<string | null> {
  if (!isPaymentEnabled) return null;

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: params,
  });

  if (error) throw new Error(error.message || 'Failed to create checkout session');
  if (!data?.url) throw new Error('No checkout URL returned');

  return data.url;
}

/**
 * Redirects to Stripe Checkout. Call after createCheckoutSession
 * if you want to use Stripe.js redirect instead of window.location.
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe not loaded');
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw new Error(error.message);
}
