import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalysisResultView from './AnalysisResultView';
import { useScanStore } from '@/store/scanStore';
import { useCartStore } from '@/store/cartStore';
import { DEMO_RESULT } from '@/data/demoResult';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

vi.mock('@/components/sherlock/ProportionVisualizer', () => ({
  default: () => {
    const { createElement } = require('react');
    return createElement('div', { 'data-testid': 'proportion-visualizer' });
  },
}));

function renderWithResult() {
  useScanStore.setState({
    phase: 'result',
    result: DEMO_RESULT,
    userImage: 'data:image/png;base64,user',
    celebImage: 'data:image/png;base64,celeb',
    error: null,
  });
  return render(
    <MemoryRouter>
      <AnalysisResultView />
    </MemoryRouter>
  );
}

describe('AnalysisResultView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useCartStore.setState({ items: [] });
  });

  it('returns null when there is no result', () => {
    useScanStore.setState({ result: null });
    const { container } = render(
      <MemoryRouter><AnalysisResultView /></MemoryRouter>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the diagnostic report header', () => {
    renderWithResult();
    expect(screen.getByText(/Diagnostic Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Neural Stylist/i)).toBeInTheDocument();
  });

  it('displays tone information', () => {
    renderWithResult();
    expect(screen.getByText(/Tone Mapping/i)).toBeInTheDocument();
    expect(screen.getByText(/Cool \/ L5/i)).toBeInTheDocument();
  });

  it('shows bone structure and facial vibe', () => {
    renderWithResult();
    expect(screen.getByText(DEMO_RESULT.sherlock.boneStructure)).toBeInTheDocument();
    expect(screen.getByText(DEMO_RESULT.sherlock.facialVibe)).toBeInTheDocument();
  });

  it('displays recommended products', () => {
    renderWithResult();
    expect(screen.getByText(/Recommended Objects/i)).toBeInTheDocument();
    DEMO_RESULT.recommendations.products.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    });
  });

  it('shows video tutorials', () => {
    renderWithResult();
    expect(screen.getByText(/Curated Education/i)).toBeInTheDocument();
    DEMO_RESULT.recommendations.videos?.forEach((v) => {
      expect(screen.getByText(v.title)).toBeInTheDocument();
    });
  });

  it('adds product to cart when + button is clicked', () => {
    renderWithResult();
    const addButtons = screen.getAllByTitle('Add to cart');
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);
    const cartState = useCartStore.getState();
    expect(cartState).toBeDefined();
  });

  it('navigates to checkout when "Shop the collection" is clicked', () => {
    renderWithResult();
    const shopBtn = screen.getByText(/Shop the collection/i);
    fireEvent.click(shopBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  it('resets scan when "New Scan" is clicked', () => {
    renderWithResult();
    const newScanBtn = screen.getByText(/New Scan/i);
    fireEvent.click(newScanBtn);
    expect(useScanStore.getState().phase).toBe('idle');
    expect(useScanStore.getState().result).toBeNull();
  });

  it('shows AI style points', () => {
    renderWithResult();
    DEMO_RESULT.kMatch.aiStylePoints.forEach((point) => {
      expect(screen.getByText(point)).toBeInTheDocument();
    });
  });
});
