import { render, screen } from '@testing-library/react';
import CheckoutSuccessView from './CheckoutSuccessView';
import { useCartStore } from '@/store/cartStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('@/services/orderService', () => ({
  getOrderBySessionId: vi.fn().mockResolvedValue(null),
}));

describe('CheckoutSuccessView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useCartStore.getState().clearCart();
  });

  it('renders the order placed confirmation text', () => {
    render(<CheckoutSuccessView />);
    expect(screen.getByText('checkout.orderPlaced')).toBeInTheDocument();
    expect(screen.getByText('checkout.orderPlacedDesc')).toBeInTheDocument();
  });

  it('renders the new scan and view orders buttons', () => {
    render(<CheckoutSuccessView />);
    expect(screen.getByText('common.newScan')).toBeInTheDocument();
    expect(screen.getByText('checkout.viewOrders')).toBeInTheDocument();
  });

  it('navigates to home when new scan button is clicked', () => {
    render(<CheckoutSuccessView />);
    screen.getByText('common.newScan').click();
    expect(mockNavigate).toHaveBeenCalledWith('/scan');
  });

  it('navigates to orders when view orders button is clicked', () => {
    render(<CheckoutSuccessView />);
    screen.getByText('checkout.viewOrders').click();
    expect(mockNavigate).toHaveBeenCalledWith('/orders');
  });
});
