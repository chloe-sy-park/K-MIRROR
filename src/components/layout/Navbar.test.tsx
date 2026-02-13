import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import type { Product } from '@/types';

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

const testProduct: Product = {
  id: 'nav-test-1',
  name: 'Test Serum',
  brand: 'TestBrand',
  price: 3000,
  priceDisplay: '$30.00',
  desc: 'A test product',
  matchScore: 90,
  ingredients: ['Hyaluronic Acid'],
  safetyRating: 'EWG Green',
  category: 'skincare',
  melaninRange: [1, 6],
};

describe('Navbar', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useAuthStore.setState({ user: null, session: null, loading: false });
  });

  it('renders the K-MIRROR AI brand text', () => {
    renderNavbar();
    expect(screen.getByText(/K-MIRROR/)).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('shows desktop navigation links', () => {
    renderNavbar();
    expect(screen.getByText('nav.scan')).toBeInTheDocument();
    expect(screen.getByText('nav.museBoard')).toBeInTheDocument();
    expect(screen.getByText('nav.match')).toBeInTheDocument();
    expect(screen.getByText('nav.sherlock')).toBeInTheDocument();
    expect(screen.getByText('nav.shop')).toBeInTheDocument();
    expect(screen.getByText('nav.settings')).toBeInTheDocument();
  });

  it('shows cart icon without badge when cart is empty', () => {
    renderNavbar();
    const cartLink = screen.getByLabelText('a11y.shoppingCart');
    expect(cartLink).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows cart item count badge when items are in the cart', () => {
    useCartStore.getState().addItem(testProduct);
    useCartStore.getState().addItem(testProduct);
    renderNavbar();

    // The badge should show the count (2)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    renderNavbar();

    // Initially mobile menu items should not be visible (AnimatePresence renders nothing)
    expect(screen.queryByText('nav.scanLab')).not.toBeInTheDocument();

    // Click menu button to open
    const menuButton = screen.getByLabelText('a11y.openMenu');
    fireEvent.click(menuButton);

    // Mobile nav items should now be visible
    expect(screen.getByText('nav.scanLab')).toBeInTheDocument();
    expect(screen.getByText('nav.expertMatch')).toBeInTheDocument();
    expect(screen.getByText('nav.sherlockMethod')).toBeInTheDocument();
  });

  it('shows sign-in button when user is not authenticated', () => {
    renderNavbar();
    expect(screen.getByLabelText('a11y.signIn')).toBeInTheDocument();
  });

  it('shows user avatar and sign-out when user is authenticated', () => {
    useAuthStore.setState({
      user: { email: 'test@example.com', id: '123' } as never,
      loading: false,
    });
    renderNavbar();

    expect(screen.getByText('t')).toBeInTheDocument(); // first char of email
    expect(screen.getByLabelText('a11y.signOut')).toBeInTheDocument();
  });
});
