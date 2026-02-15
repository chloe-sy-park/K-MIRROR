import { render, screen } from '@testing-library/react';
import AnalyzingView from './AnalyzingView';
import { useScanStore } from '@/store/scanStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('AnalyzingView', () => {
  beforeEach(() => {
    useScanStore.setState({ userImage: null, selectedCelebName: null });
  });

  it('renders the "Decoding DNA..." heading (i18n key)', () => {
    render(<AnalyzingView />);
    expect(screen.getByText('analyzing.decodingDna')).toBeInTheDocument();
  });

  it('shows 5-step progress checklist (i18n keys)', () => {
    render(<AnalyzingView />);
    expect(screen.getByText('analyzing.step1')).toBeInTheDocument();
    expect(screen.getByText('analyzing.step2')).toBeInTheDocument();
    expect(screen.getByText('analyzing.step3')).toBeInTheDocument();
    expect(screen.getByText('analyzing.step5')).toBeInTheDocument();
  });

  it('renders the user image when provided', () => {
    useScanStore.setState({ userImage: 'dGVzdGltYWdl' });
    render(<AnalyzingView />);
    const img = screen.getByAltText('Scanning User');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,dGVzdGltYWdl');
  });

  it('does not render an image when userImage is null', () => {
    render(<AnalyzingView />);
    expect(screen.queryByAltText('Scanning User')).not.toBeInTheDocument();
  });
});
