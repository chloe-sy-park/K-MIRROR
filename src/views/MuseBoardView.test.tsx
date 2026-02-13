import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MuseBoardView from './MuseBoardView';
import { useMuseStore } from '@/store/museStore';
import type { SavedMuse } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

const analysisMuse: SavedMuse = {
  id: 'm1', type: 'analysis', image: 'data:image/jpeg;base64,abc',
  userImage: 'data:image/jpeg;base64,abc', celebImage: 'data:image/jpeg;base64,def',
  celebName: 'Jennie', date: '2025-01-01', vibe: 'Cool Girl',
  boardId: undefined, aiStylePoints: ['Minimal', 'Fresh'], tags: ['k-beauty'], notes: '', extraImages: [],
};

const imageMuse: SavedMuse = {
  id: 'm2', type: 'image', image: 'data:image/jpeg;base64,xyz',
  title: 'Summer Inspo', date: '2025-01-02',
  tags: [], notes: '', extraImages: [],
};

const urlMuse: SavedMuse = {
  id: 'm3', type: 'url', image: 'https://example.com/photo.jpg',
  title: 'Pinterest Find', sourceUrl: 'https://example.com/photo.jpg', date: '2025-01-03',
  tags: [], notes: '', extraImages: [],
};

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

  it('shows add inspiration and start scan buttons in empty state', () => {
    render(<MuseBoardView />);
    expect(screen.getByText('muse.addInspiration')).toBeInTheDocument();
    expect(screen.getByText('common.startScan')).toBeInTheDocument();
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

  it('renders muse cards with masonry layout (columns)', () => {
    useMuseStore.setState({ muses: [analysisMuse, imageMuse] });
    const { container } = render(<MuseBoardView />);
    // Masonry layout uses CSS columns, cards use break-inside-avoid
    const cards = container.querySelectorAll('.break-inside-avoid');
    // Add Muse card + 2 muse cards = 3
    expect(cards.length).toBe(3);
  });

  it('renders analysis muse with celebName', () => {
    useMuseStore.setState({ muses: [analysisMuse] });
    render(<MuseBoardView />);
    expect(screen.getByText('Jennie')).toBeInTheDocument();
  });

  it('renders image muse with title', () => {
    useMuseStore.setState({ muses: [imageMuse] });
    render(<MuseBoardView />);
    expect(screen.getByText('Summer Inspo')).toBeInTheDocument();
  });

  it('shows type badge for non-analysis muses', () => {
    useMuseStore.setState({ muses: [urlMuse] });
    render(<MuseBoardView />);
    expect(screen.getByText('muse.urlType')).toBeInTheDocument();
  });

  it('shows Add Inspiration card when muses exist', () => {
    useMuseStore.setState({ muses: [analysisMuse] });
    render(<MuseBoardView />);
    expect(screen.getByText('muse.addInspiration')).toBeInTheDocument();
  });

  it('opens Add Muse modal with tabs when clicking add card', async () => {
    useMuseStore.setState({ muses: [analysisMuse] });
    render(<MuseBoardView />);

    const addCard = screen.getByText('muse.addInspiration');
    await userEvent.click(addCard);

    expect(screen.getByText('muse.uploadPhoto')).toBeInTheDocument();
    expect(screen.getByText('muse.pasteUrl')).toBeInTheDocument();
    expect(screen.getByText('muse.newAiScan')).toBeInTheDocument();
  });
});
