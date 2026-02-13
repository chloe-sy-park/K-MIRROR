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
