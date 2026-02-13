import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GlobalCheckoutView from './GlobalCheckoutView';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

vi.mock('@/services/paymentService', () => ({
  isPaymentEnabled: false,
  createCheckoutSession: vi.fn(),
}));

vi.mock('@/services/orderService', () => ({
  createLocalOrder: vi.fn(),
}));

const testProduct: Product = {
  id: 'test-1',
  name: 'Test Cushion',
  brand: 'TestBrand',
  price: 2500,
  priceDisplay: '$25.00',
  desc: 'A test product',
  matchScore: 95,
  ingredients: ['Niacinamide'],
  safetyRating: 'EWG Green',
  category: 'base',
  melaninRange: [1, 6],
};

function addTestItem(qty = 1) {
  for (let i = 0; i < qty; i++) {
    useCartStore.getState().addItem(testProduct);
  }
}

function renderCheckout() {
  return render(
    <MemoryRouter>
      <GlobalCheckoutView />
    </MemoryRouter>,
  );
}

describe('GlobalCheckoutView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Reset cart using clearCart + reset shippingMethod via setState
    useCartStore.getState().clearCart();
    useCartStore.setState({ shippingMethod: 'dhl' });
  });

  describe('empty cart', () => {
    it('shows empty cart message', () => {
      renderCheckout();
      expect(screen.getByText('checkout.cartEmpty')).toBeInTheDocument();
    });

    it('has Start Scan button that navigates to /', () => {
      renderCheckout();
      fireEvent.click(screen.getByText('checkout.startScan'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('has Browse Shop button that navigates to /shop', () => {
      renderCheckout();
      fireEvent.click(screen.getByText('checkout.browseShop'));
      expect(mockNavigate).toHaveBeenCalledWith('/shop');
    });
  });

  describe('with items', () => {
    beforeEach(() => {
      addTestItem(2);
    });

    it('displays cart items', () => {
      renderCheckout();
      expect(screen.getAllByText('Test Cushion').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('TestBrand').length).toBeGreaterThanOrEqual(1);
    });

    it('shows quantity', () => {
      renderCheckout();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('disables payment button when form is invalid', () => {
      renderCheckout();
      const payButton = screen.getByText('checkout.completePayment');
      expect(payButton).toBeDisabled();
    });

    it('shows validation message when form is incomplete', () => {
      renderCheckout();
      expect(screen.getByText('validation.fillFormToContinue')).toBeInTheDocument();
    });

    it('enables payment button when form is valid', () => {
      renderCheckout();
      fireEvent.change(screen.getByPlaceholderText(/Sarah Jenkins/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText(/123 Beauty Lane/i), { target: { value: '456 Test Street, City' } });

      const payButton = screen.getByText('checkout.completePayment');
      expect(payButton).not.toBeDisabled();
    });

    it('places order and shows confirmation', async () => {
      renderCheckout();
      fireEvent.change(screen.getByPlaceholderText(/Sarah Jenkins/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText(/123 Beauty Lane/i), { target: { value: '456 Test Street, City' } });
      fireEvent.click(screen.getByText('checkout.completePayment'));

      await waitFor(() => {
        expect(screen.getByText('checkout.orderPlaced')).toBeInTheDocument();
      });
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('form requires minimum name length of 2', () => {
      renderCheckout();
      fireEvent.change(screen.getByPlaceholderText(/Sarah Jenkins/i), { target: { value: 'A' } });
      fireEvent.change(screen.getByPlaceholderText(/123 Beauty Lane/i), { target: { value: '456 Test Street, City' } });

      expect(screen.getByText('checkout.completePayment')).toBeDisabled();
    });

    it('form requires minimum address length of 5', () => {
      renderCheckout();
      fireEvent.change(screen.getByPlaceholderText(/Sarah Jenkins/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText(/123 Beauty Lane/i), { target: { value: '123' } });

      expect(screen.getByText('checkout.completePayment')).toBeDisabled();
    });
  });

  describe('order confirmation', () => {
    it('navigates to home after order with New Scan', async () => {
      addTestItem(1);
      renderCheckout();

      fireEvent.change(screen.getByPlaceholderText(/Sarah Jenkins/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText(/123 Beauty Lane/i), { target: { value: '456 Test Street, City' } });
      fireEvent.click(screen.getByText('checkout.completePayment'));

      await waitFor(() => {
        expect(screen.getByText('checkout.orderPlaced')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('common.newScan'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to orders after order', async () => {
      addTestItem(1);
      renderCheckout();

      fireEvent.change(screen.getByPlaceholderText(/Sarah Jenkins/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText(/123 Beauty Lane/i), { target: { value: '456 Test Street, City' } });
      fireEvent.click(screen.getByText('checkout.completePayment'));

      await waitFor(() => {
        expect(screen.getByText('checkout.orderPlaced')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('checkout.viewOrders'));
      expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
  });
});
