# Stripe Payment Integration Design

## Decision Record
- **Architecture**: Supabase Edge Functions (server-side Stripe Checkout Session creation)
- **Scope**: Full flow — Stripe Checkout + Webhook + Supabase orders table
- **Date**: 2026-02-13

## Flow

```
User clicks "Complete Payment"
  → Frontend calls Supabase Edge Function `create-checkout-session`
  → Edge Function creates Stripe Checkout Session + saves pending order to Supabase
  → Frontend redirects to Stripe-hosted checkout page
  → User completes payment on Stripe
  → Stripe redirects to /checkout/success?session_id=...
  → Stripe fires webhook → Edge Function `stripe-webhook` → order.status = 'paid'
```

## Database Schema

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  items jsonb not null,
  subtotal integer not null,
  shipping integer not null,
  total integer not null,
  shipping_method text not null,
  shipping_name text,
  shipping_country text,
  shipping_address text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table orders enable row level security;
create policy "Users view own orders" on orders
  for select using (auth.uid() = user_id);
```

## Edge Functions

### `create-checkout-session`
- Input: `{ items: CartItem[], shippingMethod, shippingName, shippingCountry, shippingAddress }`
- Creates Stripe Checkout Session with line_items derived from cart
- Inserts pending order into Supabase `orders` table
- Returns `{ url: session.url }`

### `stripe-webhook`
- Listens for `checkout.session.completed`
- Verifies Stripe signature via `STRIPE_WEBHOOK_SECRET`
- Updates order status to 'paid' using `stripe_session_id`

## Frontend Changes

| File | Change |
|------|--------|
| `src/services/paymentService.ts` | **New** — `createCheckoutSession()` calls Edge Function |
| `src/services/orderService.ts` | **New** — `fetchOrders()` with Supabase/localStorage dual path |
| `src/views/GlobalCheckoutView.tsx` | Modify handlePlaceOrder → call Edge Function → redirect to Stripe |
| `src/views/CheckoutSuccessView.tsx` | **New** — success page after Stripe redirect |
| `src/views/OrdersView.tsx` | Read orders from Supabase (or localStorage fallback) |
| `src/store/cartStore.ts` | Remove orders[] state, keep cart-only logic |
| `App.tsx` | Add /checkout/success route |
| `.env.local.example` | Add `VITE_STRIPE_PUBLISHABLE_KEY` |
| `src/types/index.ts` | Add stripe fields to Order type |

## Fallback Strategy

Following the existing `museService.ts` pattern:
- **No Supabase**: localStorage orders (current behavior preserved)
- **No Stripe key**: Local-only "demo" checkout (no redirect)
- **Both configured**: Full Stripe Checkout + Supabase persistence

## Environment Variables

```bash
# Frontend (Vite)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase Edge Function secrets
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Packages
- `@stripe/stripe-js` — Frontend SDK for redirect to Checkout
- Edge Functions use Deno `stripe` import (no npm needed)
