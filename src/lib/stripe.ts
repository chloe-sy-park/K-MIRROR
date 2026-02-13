import { loadStripe, type Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

export const isStripeConfigured = Boolean(stripePublishableKey);

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise ?? Promise.resolve(null);
}
