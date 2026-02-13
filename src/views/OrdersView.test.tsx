import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrdersView from './OrdersView';
import { useCartStore } from '@/store/cartStore';
import type { Order } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

const testOrder: Order = {
  id: 'order-abc12345-def6-7890',
  items: [
    {
      product: {
        id: 'test-1',
        name: 'Black Cushion SPF34',
        brand: 'HERA',
        price: 4500,
        priceDisplay: '$45.00',
        desc: 'Full-coverage matte cushion',
        matchScore: 98,
        ingredients: ['Niacinamide'],
        safetyRating: 'EWG Green',
        category: 'base',
        melaninRange: [3, 6],
      },
      quantity: 2,
    },
    {
      product: {
        id: 'test-2',
        name: 'Glasting Water Tint',
        brand: "ROM&ND",
        price: 1400,
        priceDisplay: '$14.00',
        desc: 'High-gloss K-tint',
        matchScore: 96,
        ingredients: ['Shea Butter'],
        safetyRating: 'Vegan',
        category: 'lip',
        melaninRange: [1, 6],
      },
      quantity: 1,
    },
  ],
  subtotal: 10400,
  shipping: 1800,
  total: 12200,
  shippingMethod: 'dhl',
  status: 'pending',
  createdAt: '2026-01-15T10:30:00.000Z',
};

function renderView() {
  return render(
    <MemoryRouter>
      <OrdersView />
    </MemoryRouter>
  );
}

describe('OrdersView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useCartStore.setState({ orders: [] });
  });

  describe('empty state', () => {
    it('shows empty state message when no orders exist', () => {
      renderView();
      expect(screen.getByText('orders.noOrders')).toBeInTheDocument();
      expect(screen.getByText('orders.noOrdersDesc')).toBeInTheDocument();
    });

    it('shows Browse Shop button that navigates to /shop', () => {
      renderView();
      const browseBtn = screen.getByText('orders.browseShop');
      fireEvent.click(browseBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/shop');
    });
  });

  describe('with orders', () => {
    beforeEach(() => {
      useCartStore.setState({ orders: [testOrder] });
    });

    it('renders the orders title', () => {
      renderView();
      expect(screen.getByText('orders.title')).toBeInTheDocument();
    });

    it('shows the order count for a single order', () => {
      renderView();
      expect(screen.getByText('1 orders.orderPlaced')).toBeInTheDocument();
    });

    it('shows the order count for multiple orders', () => {
      const secondOrder: Order = {
        ...testOrder,
        id: 'order-xyz98765-ghi4-3210',
        status: 'shipped',
      };
      useCartStore.setState({ orders: [testOrder, secondOrder] });
      renderView();
      expect(screen.getByText('2 orders.ordersPlaced')).toBeInTheDocument();
    });

    it('displays the truncated order ID', () => {
      renderView();
      expect(screen.getByText('Order #order-ab')).toBeInTheDocument();
    });

    it('shows order date', () => {
      renderView();
      const formatted = new Date(testOrder.createdAt).toLocaleDateString();
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    it('displays product names in the order', () => {
      renderView();
      expect(screen.getByText('Black Cushion SPF34')).toBeInTheDocument();
      expect(screen.getByText('Glasting Water Tint')).toBeInTheDocument();
    });

    it('shows product brand and quantity', () => {
      renderView();
      expect(screen.getByText('HERA x 2')).toBeInTheDocument();
      expect(screen.getByText('ROM&ND x 1')).toBeInTheDocument();
    });

    it('shows line item totals', () => {
      renderView();
      // HERA cushion: $45.00 x 2 = $90.00
      expect(screen.getByText('$90.00')).toBeInTheDocument();
      // ROM&ND tint: $14.00 x 1 = $14.00
      expect(screen.getByText('$14.00')).toBeInTheDocument();
    });

    it('shows the order total', () => {
      renderView();
      // Total: 12200 cents = $122.00
      expect(screen.getByText('$122.00')).toBeInTheDocument();
    });

    it('shows the shipping method', () => {
      renderView();
      expect(screen.getByText(/DHL/)).toBeInTheDocument();
    });

    it('shows Pending status for a pending order', () => {
      renderView();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows Shipped status for a shipped order', () => {
      useCartStore.setState({
        orders: [{ ...testOrder, status: 'shipped' }],
      });
      renderView();
      expect(screen.getByText('Shipped')).toBeInTheDocument();
    });

    it('shows Paid status for a paid order', () => {
      useCartStore.setState({
        orders: [{ ...testOrder, status: 'paid' }],
      });
      renderView();
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });

    it('shows Delivered status for a delivered order', () => {
      useCartStore.setState({
        orders: [{ ...testOrder, status: 'delivered' }],
      });
      renderView();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });
});
