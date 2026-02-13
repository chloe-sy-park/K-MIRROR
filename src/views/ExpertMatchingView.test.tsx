import { render, screen } from '@testing-library/react';
import ExpertMatchingView from './ExpertMatchingView';
import { EXPERTS } from '@/data/experts';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('ExpertMatchingView', () => {
  it('renders the section header', () => {
    render(<ExpertMatchingView />);
    expect(screen.getByText('Direct Access')).toBeInTheDocument();
    expect(screen.getByText(/Human/)).toBeInTheDocument();
  });

  it('renders all expert names', () => {
    render(<ExpertMatchingView />);
    for (const expert of EXPERTS) {
      expect(screen.getByText(expert.name)).toBeInTheDocument();
    }
  });

  it('renders expert roles', () => {
    render(<ExpertMatchingView />);
    for (const expert of EXPERTS) {
      expect(screen.getByText(expert.role)).toBeInTheDocument();
    }
  });

  it('renders expert bios', () => {
    render(<ExpertMatchingView />);
    for (const expert of EXPERTS) {
      expect(screen.getByText(`\u201C${expert.bio}\u201D`)).toBeInTheDocument();
    }
  });

  it('renders Book Session links for each expert', () => {
    render(<ExpertMatchingView />);
    const bookButtons = screen.getAllByText(/Book Session/);
    expect(bookButtons).toHaveLength(EXPERTS.length);
  });

  it('renders specialty filter buttons including All', () => {
    render(<ExpertMatchingView />);
    expect(screen.getByText('All')).toBeInTheDocument();
    const specialties = [...new Set(EXPERTS.map((e) => e.specialty))];
    for (const specialty of specialties) {
      // Each specialty appears as both a filter button and a tag on the card,
      // so we verify at least one element with that text exists
      expect(screen.getAllByText(specialty).length).toBeGreaterThanOrEqual(1);
    }
  });
});
