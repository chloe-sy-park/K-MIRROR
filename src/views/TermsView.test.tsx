import { render, screen } from '@testing-library/react';
import TermsView from './TermsView';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('TermsView', () => {
  it('renders the terms of service heading', () => {
    render(<TermsView />);
    expect(screen.getByText('legal.termsOfService')).toBeInTheDocument();
  });

  it('renders the last updated text', () => {
    render(<TermsView />);
    expect(screen.getByText('legal.lastUpdated')).toBeInTheDocument();
  });

  it('renders English section titles', () => {
    render(<TermsView />);
    expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument();
    expect(screen.getByText('2. Service Description')).toBeInTheDocument();
    expect(screen.getByText('7. AI Disclaimer')).toBeInTheDocument();
    expect(screen.getByText('12. Contact')).toBeInTheDocument();
  });

  it('renders the contact email', () => {
    render(<TermsView />);
    expect(screen.getByText('Email: legal@k-mirror.app')).toBeInTheDocument();
  });
});
