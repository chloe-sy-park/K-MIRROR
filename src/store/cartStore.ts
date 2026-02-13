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
