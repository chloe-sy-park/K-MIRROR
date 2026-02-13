import { render, screen } from '@testing-library/react';
import ProductDetailView from './ProductDetailView';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'nonexistent-product' }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('@/services/productService', () => ({
  fetchProductById: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/services/colorService', () => ({
  renderColorOnSkin: vi.fn().mockReturnValue('#FF0000'),
}));

describe('ProductDetailView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders loading state when product is not yet loaded', () => {
    render(<ProductDetailView />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render product details when product is null', () => {
    render(<ProductDetailView />);
    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
  });
});
