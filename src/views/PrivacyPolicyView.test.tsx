import { render, screen } from '@testing-library/react';
import PrivacyPolicyView from './PrivacyPolicyView';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('PrivacyPolicyView', () => {
  it('renders the privacy policy heading', () => {
    render(<PrivacyPolicyView />);
    expect(screen.getByText('legal.privacyPolicy')).toBeInTheDocument();
  });

  it('renders the last updated text', () => {
    render(<PrivacyPolicyView />);
    expect(screen.getByText('legal.lastUpdated')).toBeInTheDocument();
  });

  it('renders English section titles', () => {
    render(<PrivacyPolicyView />);
    expect(screen.getByText('1. Information We Collect')).toBeInTheDocument();
    expect(screen.getByText('2. How We Use Your Data')).toBeInTheDocument();
    expect(screen.getByText('3. Biometric Data')).toBeInTheDocument();
    expect(screen.getByText('10. Contact')).toBeInTheDocument();
  });

  it('renders the contact email', () => {
    render(<PrivacyPolicyView />);
    expect(screen.getByText('Email: privacy@k-mirror.app')).toBeInTheDocument();
  });
});
