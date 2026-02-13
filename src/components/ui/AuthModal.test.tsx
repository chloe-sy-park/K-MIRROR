import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthModal from './AuthModal';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

beforeEach(() => {
  useAuthStore.setState({
    isAuthModalOpen: true,
    error: null,
    loading: false,
    user: null,
    closeAuthModal: vi.fn(),
    clearError: vi.fn(),
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    signInWithGoogle: vi.fn(),
  });
});

describe('AuthModal', () => {
  it('renders dialog when isAuthModalOpen is true', () => {
    render(<AuthModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isAuthModalOpen is false', () => {
    useAuthStore.setState({ isAuthModalOpen: false });
    render(<AuthModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows email and password inputs', () => {
    render(<AuthModal />);
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
  });

  it('calls closeAuthModal when close button is clicked', () => {
    const closeAuthModal = vi.fn();
    useAuthStore.setState({ closeAuthModal });
    render(<AuthModal />);
    const closeButton = screen.getByLabelText('a11y.closeDialog');
    fireEvent.click(closeButton);
    expect(closeAuthModal).toHaveBeenCalledTimes(1);
  });

  it('switches between signin and signup modes', () => {
    render(<AuthModal />);
    // Initially in signin mode — the switch button text is the signUp key
    const switchButton = screen.getByRole('button', { name: 'auth.signUp' });
    fireEvent.click(switchButton);
    // After switching, the dialog aria-label should reflect signup mode
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Create K-MIRROR account');
  });

  it('shows error message when error is set in store', () => {
    useAuthStore.setState({ error: 'Invalid credentials' });
    render(<AuthModal />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
