# Stripe Payment Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Stripe Checkout via Supabase Edge Functions so users can pay for K-Beauty products with real card processing, webhook-driven order status updates, and Supabase order persistence.

**Architecture:** Frontend redirects to Stripe-hosted checkout page via a Supabase Edge Function that creates a Checkout Session. A webhook Edge Function listens for payment completion and updates order status. LocalStorage fallback preserved for demo mode.

**Tech Stack:** @stripe/stripe-js (frontend), Stripe Deno SDK (Edge Functions), Supabase Edge Functions, Supabase DB with RLS

**Design doc:** `docs/plans/2026-02-13-stripe-integration-design.md`

---

## Task 1: Install @stripe/stripe-js + update env template

**Files:**
- Modify: `.env.local.example`

**Step 1: Install package**

```bash
npm install @stripe/stripe-js --legacy-peer-deps
```

**Step 2: Update env template**

Add to `.env.local.example`:
```bash
# ─── Stripe (Payment Processing) ─────────────────────
# Get your keys from https://dashboard.stripe.com/apikeys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Step 3: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore: install @stripe/stripe-js and add env template"
```

---

## Task 2: Update Order type + add Stripe config helper

**Files:**
- Modify: `src/types/index.ts` (Order interface, lines 109-118)
- Create: `src/lib/stripe.ts`

**Step 1: Add stripe fields to Order type**

In `src/types/index.ts`, replace the `Order` interface:
```typescript
export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: 'dhl' | 'ems';
  shippingName?: string;
  shippingCountry?: string;
  shippingAddress?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  stripeSessionId?: string;
  createdAt: string;
}
```

**Step 2: Create Stripe config helper**

Create `src/lib/stripe.ts`:
```typescript
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
```

**Step 3: Commit**

```bash
git add src/types/index.ts src/lib/stripe.ts
git commit -m "feat: add stripe fields to Order type and stripe config helper"
```

---

## Task 3: Create orderService.ts

**Files:**
- Create: `src/services/orderService.ts`

Follow the exact pattern from `src/services/museService.ts` — localStorage fallback when `!isSupabaseConfigured`.

**Step 1: Create the service**

```typescript
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Order, CartItem } from '@/types';

const LS_ORDERS_KEY = 'kmirror_orders';

// ── localStorage helpers ────────────────────────────
function lsGetOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(LS_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function lsSetOrders(orders: Order[]) {
  localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));
}

// ── Fetch Orders ────────────────────────────────────
export async function fetchOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) {
    return lsGetOrders();
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((r) => ({
    id: r.id,
    items: r.items as CartItem[],
    subtotal: r.subtotal,
    shipping: r.shipping,
    total: r.total,
    shippingMethod: r.shipping_method,
    shippingName: r.shipping_name ?? undefined,
    shippingCountry: r.shipping_country ?? undefined,
    shippingAddress: r.shipping_address ?? undefined,
    status: r.status,
    stripeSessionId: r.stripe_session_id ?? undefined,
    createdAt: r.created_at,
  }));
}

// ── Create Local Order (fallback / demo mode) ────────
export function createLocalOrder(params: {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: 'dhl' | 'ems';
  shippingName: string;
  shippingCountry: string;
  shippingAddress: string;
}): Order {
  const order: Order = {
    id: crypto.randomUUID(),
    ...params,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const orders = lsGetOrders();
  orders.unshift(order);
  lsSetOrders(orders);
  return order;
}

// ── Get Order by Stripe Session ID ───────────────────
export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  if (!isSupabaseConfigured) {
    return lsGetOrders().find((o) => o.stripeSessionId === sessionId) ?? null;
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    items: data.items as CartItem[],
    subtotal: data.subtotal,
    shipping: data.shipping,
    total: data.total,
    shippingMethod: data.shipping_method,
    shippingName: data.shipping_name ?? undefined,
    shippingCountry: data.shipping_country ?? undefined,
    shippingAddress: data.shipping_address ?? undefined,
    status: data.status,
    stripeSessionId: data.stripe_session_id ?? undefined,
    createdAt: data.created_at,
  };
}
```

**Step 2: Commit**

```bash
git add src/services/orderService.ts
git commit -m "feat: add orderService with Supabase/localStorage dual path"
```

---

## Task 4: Create paymentService.ts

**Files:**
- Create: `src/services/paymentService.ts`

**Step 1: Create the service**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/services/paymentService.ts
git commit -m "feat: add paymentService for Stripe Checkout Session creation"
```

---

## Task 5: Create Supabase Edge Functions

**Files:**
- Create: `supabase/functions/create-checkout-session/index.ts`
- Create: `supabase/functions/stripe-webhook/index.ts`

**Step 1: Create the checkout session Edge Function**

```typescript
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
```

**Step 2: Create the webhook Edge Function**

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${(err as Error).message}` }), { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent: session.payment_intent,
      })
      .eq('stripe_session_id', session.id);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Step 3: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add Supabase Edge Functions for Stripe checkout + webhook"
```

---

## Task 6: Refactor cartStore — remove orders, keep cart only

**Files:**
- Modify: `src/store/cartStore.ts`
- Modify: `src/store/cartStore.test.ts`

**Step 1: Remove orders from cartStore**

Replace the entire `cartStore.ts` with:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';

const SHIPPING_RATES = { dhl: 1800, ems: 1200 } as const;

interface CartState {
  items: CartItem[];
  shippingMethod: 'dhl' | 'ems';

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setShippingMethod: (method: 'dhl' | 'ems') => void;
  clearCart: () => void;

  subtotal: () => number;
  shippingCost: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingMethod: 'dhl',

      addItem: (product) => {
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { product, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      setShippingMethod: (method) => set({ shippingMethod: method }),

      clearCart: () => set({ items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      shippingCost: () => SHIPPING_RATES[get().shippingMethod],
      total: () => get().subtotal() + get().shippingCost(),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'kmirror_cart',
      partialize: (s) => ({ items: s.items, shippingMethod: s.shippingMethod }),
    }
  )
);
```

**Step 2: Update cartStore test — remove placeOrder test**

In `src/store/cartStore.test.ts`:
- Remove the test `'places an order and clears cart'`
- Update `beforeEach` to: `useCartStore.setState({ items: [], shippingMethod: 'dhl' });` (no orders)

**Step 3: Run tests**

```bash
npx vitest run src/store/cartStore.test.ts
```
Expected: All remaining tests pass.

**Step 4: Commit**

```bash
git add src/store/cartStore.ts src/store/cartStore.test.ts
git commit -m "refactor: remove orders from cartStore, keep cart-only logic"
```

---

## Task 7: Modify GlobalCheckoutView — Stripe redirect + fallback

**Files:**
- Modify: `src/views/GlobalCheckoutView.tsx`

**Step 1: Update the checkout view**

Key changes:
1. Import `isPaymentEnabled` and `createCheckoutSession` from paymentService
2. Import `createLocalOrder` from orderService
3. Add `isProcessing` state for loading indicator
4. Replace `handlePlaceOrder`:
   - If Stripe enabled → call createCheckoutSession → redirect to session URL
   - If Stripe not enabled → createLocalOrder → show confirmation (existing behavior)
5. Add `clearCart` import from cartStore

Replace the `handlePlaceOrder` function and related imports:

```typescript
// Add these imports:
import { isPaymentEnabled, createCheckoutSession } from '@/services/paymentService';
import { createLocalOrder } from '@/services/orderService';

// Add state:
const [isProcessing, setIsProcessing] = useState(false);

// Replace handlePlaceOrder:
const handlePlaceOrder = async () => {
  if (items.length === 0 || !isFormValid) return;

  if (isPaymentEnabled) {
    setIsProcessing(true);
    try {
      const url = await createCheckoutSession({
        items,
        shippingMethod,
        shippingName: fullName,
        shippingCountry: country,
        shippingAddress: address,
      });
      if (url) {
        window.location.href = url;
        return;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      return;
    }
  }

  // Fallback: local order
  createLocalOrder({
    items,
    subtotal: subtotal(),
    shipping: shippingCost(),
    total: total(),
    shippingMethod,
    shippingName: fullName,
    shippingCountry: country,
    shippingAddress: address,
  });
  clearCart();
  setOrderPlaced(true);
};
```

Update the button to show loading state:

```tsx
<button
  onClick={handlePlaceOrder}
  disabled={!isFormValid || isProcessing}
  className={`w-full py-6 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all mb-4 shadow-xl ${
    isFormValid && !isProcessing
      ? 'bg-black text-white hover:bg-[#FF4D8D]'
      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
  }`}
>
  {isProcessing ? t('checkout.processing') : t('checkout.completePayment')}
</button>
```

Also add `clearCart` to the cartStore destructure at the top.

**Step 2: Commit**

```bash
git add src/views/GlobalCheckoutView.tsx
git commit -m "feat: integrate Stripe Checkout redirect in GlobalCheckoutView"
```

---

## Task 8: Create CheckoutSuccessView

**Files:**
- Create: `src/views/CheckoutSuccessView.tsx`

**Step 1: Create the success view**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as m from 'framer-motion/m';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getOrderBySessionId } from '@/services/orderService';
import type { Order } from '@/types';

const CheckoutSuccessView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    clearCart();

    if (sessionId) {
      getOrderBySessionId(sessionId)
        .then((o) => setOrder(o))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF4D8D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-32 text-center space-y-8"
    >
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
        <Check size={32} className="text-green-500" />
      </div>
      <h2 className="text-4xl heading-font italic uppercase">{t('checkout.orderPlaced')}</h2>
      <p className="text-gray-400 text-sm">{t('checkout.orderPlacedDesc')}</p>

      {order && (
        <div className="bg-gray-50 rounded-[2.5rem] p-8 text-left space-y-4 mx-auto max-w-sm">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Order</span>
            <span>#{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between text-sm font-black">
            <span>{t('checkout.total')}</span>
            <span>${(order.total / 100).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-300">
            <Package size={12} />
            <span>{order.shippingMethod.toUpperCase()} — {order.items.length} {t('checkout.items')}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all"
        >
          {t('common.newScan')}
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="px-8 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <ShoppingBag size={14} /> {t('checkout.viewOrders')}
        </button>
      </div>
    </m.div>
  );
};

export default CheckoutSuccessView;
```

**Step 2: Commit**

```bash
git add src/views/CheckoutSuccessView.tsx
git commit -m "feat: add CheckoutSuccessView for post-payment confirmation"
```

---

## Task 9: Update App.tsx routing

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add lazy import and route**

Add import:
```typescript
const CheckoutSuccessView = lazy(() => import('@/views/CheckoutSuccessView'));
```

Add route (after the `/checkout` route, before `/match`):
```tsx
<Route path="/checkout/success" element={<CheckoutSuccessView />} />
```

Add to ROUTE_TITLES:
```typescript
'/checkout/success': 'Order Confirmed',
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add /checkout/success route"
```

---

## Task 10: Update OrdersView to use orderService

**Files:**
- Modify: `src/views/OrdersView.tsx`

**Step 1: Replace cartStore orders with orderService**

Key changes:
1. Import `fetchOrders` from orderService instead of cartStore
2. Add loading/orders state with useEffect
3. Handle both Supabase and localStorage orders

Replace the beginning of the component:

```tsx
import { useEffect, useState } from 'react';
// ... existing imports minus useCartStore for orders
import { fetchOrders } from '@/services/orderService';
import type { Order } from '@/types';

const OrdersView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF4D8D] rounded-full animate-spin" />
      </div>
    );
  }

  // ... rest remains the same
```

**Step 2: Commit**

```bash
git add src/views/OrdersView.tsx
git commit -m "feat: update OrdersView to use orderService"
```

---

## Task 11: Add i18n strings for checkout processing

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/ko.json`

**Step 1: Add new strings**

In `en.json` checkout section, add:
```json
"processing": "Processing...",
"redirectingToStripe": "Redirecting to Stripe..."
```

In `ko.json` checkout section, add:
```json
"processing": "처리 중...",
"redirectingToStripe": "Stripe로 이동 중..."
```

**Step 2: Commit**

```bash
git add src/i18n/en.json src/i18n/ko.json
git commit -m "feat: add i18n strings for checkout processing states"
```

---

## Task 12: Write tests for new services

**Files:**
- Create: `src/services/orderService.test.ts`
- Create: `src/services/paymentService.test.ts`

**Step 1: Write orderService tests**

Test the localStorage fallback path (same pattern as museService.test.ts):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalOrder, fetchOrders, getOrderBySessionId } from './orderService';
import type { CartItem } from '@/types';
import { PRODUCT_CATALOG } from '@/data/productCatalog';

const product = PRODUCT_CATALOG[0]!;
const makeItems = (): CartItem[] => [{ product, quantity: 2 }];

describe('orderService (localStorage)', () => {
  beforeEach(() => localStorage.clear());

  it('fetchOrders returns empty array initially', async () => {
    expect(await fetchOrders()).toEqual([]);
  });

  it('createLocalOrder creates and persists an order', async () => {
    const order = createLocalOrder({
      items: makeItems(),
      subtotal: 9000,
      shipping: 1800,
      total: 10800,
      shippingMethod: 'dhl',
      shippingName: 'Test User',
      shippingCountry: 'US',
      shippingAddress: '123 Test St',
    });

    expect(order.id).toBeTruthy();
    expect(order.status).toBe('pending');
    expect(order.total).toBe(10800);

    const orders = await fetchOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0]!.id).toBe(order.id);
  });

  it('getOrderBySessionId returns null for non-existent session', async () => {
    expect(await getOrderBySessionId('nonexistent')).toBeNull();
  });
});
```

**Step 2: Write paymentService tests**

```typescript
import { describe, it, expect } from 'vitest';
import { isPaymentEnabled } from './paymentService';

describe('paymentService', () => {
  it('isPaymentEnabled is false when Stripe key is not set', () => {
    expect(isPaymentEnabled).toBe(false);
  });
});
```

**Step 3: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

**Step 4: Commit**

```bash
git add src/services/orderService.test.ts src/services/paymentService.test.ts
git commit -m "test: add orderService and paymentService tests"
```

---

## Task 13: Update existing OrdersView test

**Files:**
- Modify: `src/views/OrdersView.test.tsx`

**Step 1: Update test to mock orderService**

The OrdersView now uses `fetchOrders()` instead of `useCartStore.orders`. Update the test to mock the orderService:

```typescript
vi.mock('@/services/orderService', () => ({
  fetchOrders: vi.fn(),
}));
```

Update the setup code from `useCartStore.setState({ orders: [...] })` to mock the resolved value of `fetchOrders`.

**Step 2: Run tests**

```bash
npx vitest run src/views/OrdersView.test.tsx
```

**Step 3: Commit**

```bash
git add src/views/OrdersView.test.tsx
git commit -m "test: update OrdersView test to mock orderService"
```

---

## Task 14: Final verification

**Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: All tests pass.

**Step 2: Lint**

```bash
npm run lint
```
Expected: No errors.

**Step 3: Build**

```bash
npm run build
```
Expected: Build succeeds.

**Step 4: Final commit if any fixes needed**

---

## Supabase Setup Notes (Manual Steps)

These are not code tasks — they require Supabase Dashboard access:

1. **Create `orders` table** via SQL Editor (schema in design doc)
2. **Deploy Edge Functions**: `supabase functions deploy create-checkout-session` and `supabase functions deploy stripe-webhook`
3. **Set Edge Function secrets**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. **Configure Stripe webhook** at dashboard.stripe.com → Developers → Webhooks → point to Edge Function URL
5. **Add `VITE_STRIPE_PUBLISHABLE_KEY`** to `.env.local`
