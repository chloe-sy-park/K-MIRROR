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
    useScanStore.setState({ userImage: null });
  });

  it('renders the "Decoding DNA..." heading', () => {
    render(<AnalyzingView />);
    expect(screen.getByText('Decoding DNA...')).toBeInTheDocument();
  });

  it('shows analysis progress indicator texts', () => {
    render(<AnalyzingView />);
    expect(screen.getByText(/Synchronizing Melanin Guard/)).toBeInTheDocument();
    expect(screen.getByText(/Mapping Sherlock Facial Proportions/)).toBeInTheDocument();
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
