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
