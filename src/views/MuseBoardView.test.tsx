import { render, screen } from '@testing-library/react';
import MuseBoardView from './MuseBoardView';
import { useMuseStore } from '@/store/museStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('MuseBoardView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useMuseStore.setState({
      boards: [],
      muses: [],
      activeBoardId: null,
      loading: false,
      error: null,
      fetchBoards: vi.fn(),
      fetchMuses: vi.fn(),
      createBoard: vi.fn(),
      updateBoard: vi.fn(),
      deleteBoard: vi.fn(),
      deleteMuse: vi.fn(),
      updateMuse: vi.fn(),
      moveMuse: vi.fn(),
      setActiveBoard: vi.fn(),
      saveMuse: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('renders the MuseBoard title and subtitle', () => {
    render(<MuseBoardView />);
    expect(screen.getByText('muse.title')).toBeInTheDocument();
    expect(screen.getByText('muse.subtitle')).toBeInTheDocument();
  });

  it('renders empty state when there are no muses', () => {
    render(<MuseBoardView />);
    expect(screen.getByText('muse.noMusesYet')).toBeInTheDocument();
    expect(screen.getByText('muse.emptyHint')).toBeInTheDocument();
  });

  it('shows start scan and browse celebs buttons in empty state', () => {
    render(<MuseBoardView />);
    expect(screen.getByText('common.startScan')).toBeInTheDocument();
    expect(screen.getByText('common.browseCelebs')).toBeInTheDocument();
  });

  it('renders the "All Muses" tab button', () => {
    render(<MuseBoardView />);
    expect(screen.getByText('muse.allMuses')).toBeInTheDocument();
  });

  it('shows empty board message when active board has no muses', () => {
    useMuseStore.setState({
      boards: [{ id: 'board-1', name: 'Test Board', icon: '🎨', count: 0, aiSummary: '' }],
      activeBoardId: 'board-1',
      muses: [],
      loading: false,
    });
    render(<MuseBoardView />);
    expect(screen.getByText('muse.emptyBoard')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading is true', () => {
    useMuseStore.setState({ loading: true, muses: [] });
    const { container } = render(<MuseBoardView />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
