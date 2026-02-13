import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';
import { PRODUCT_CATALOG } from '@/data/productCatalog';

const product1 = PRODUCT_CATALOG[0]!;
const product2 = PRODUCT_CATALOG[1]!;

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], shippingMethod: 'dhl' });
  });

  it('adds an item', () => {
    useCartStore.getState().addItem(product1);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]!.product.id).toBe(product1.id);
    expect(items[0]!.quantity).toBe(1);
  });

  it('increments quantity on duplicate add', () => {
    useCartStore.getState().addItem(product1);
    useCartStore.getState().addItem(product1);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]!.quantity).toBe(2);
  });

  it('removes an item', () => {
    useCartStore.getState().addItem(product1);
    useCartStore.getState().removeItem(product1.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates quantity', () => {
    useCartStore.getState().addItem(product1);
    useCartStore.getState().updateQuantity(product1.id, 5);
    expect(useCartStore.getState().items[0]!.quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem(product1);
    useCartStore.getState().updateQuantity(product1.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates subtotal correctly', () => {
    useCartStore.getState().addItem(product1);
    useCartStore.getState().addItem(product2);
    const subtotal = useCartStore.getState().subtotal();
    expect(subtotal).toBe(product1.price + product2.price);
  });

  it('calculates shipping cost', () => {
    const dhl = useCartStore.getState().shippingCost();
    expect(dhl).toBe(1800);

    useCartStore.getState().setShippingMethod('ems');
    expect(useCartStore.getState().shippingCost()).toBe(1200);
  });

  it('calculates total', () => {
    useCartStore.getState().addItem(product1);
    const total = useCartStore.getState().total();
    expect(total).toBe(product1.price + 1800);
  });

  it('counts items', () => {
    useCartStore.getState().addItem(product1);
    useCartStore.getState().addItem(product1);
    useCartStore.getState().addItem(product2);
    expect(useCartStore.getState().itemCount()).toBe(3);
  });
});
