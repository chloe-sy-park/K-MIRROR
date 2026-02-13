import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScanView from './ScanView';
import { useScanStore } from '@/store/scanStore';

function renderWithRouter(state?: Record<string, unknown>) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/', state }]}>
      <ScanView />
    </MemoryRouter>
  );
}

describe('ScanView', () => {
  beforeEach(() => {
    useScanStore.setState({
      phase: 'idle',
      userImage: null,
      celebImage: null,
      selectedCelebName: null,
      result: null,
      error: null,
    });
  });

  it('renders the scan heading and demo button', () => {
    renderWithRouter();
    expect(screen.getByText('scan.title')).toBeInTheDocument();
    expect(screen.getByText('scan.previewDemo')).toBeInTheDocument();
  });

  it('shows Neural Scan button disabled when no images are set', () => {
    renderWithRouter();
    const btn = screen.getByRole('button', { name: /scan\.neuralScan/i });
    expect(btn).toBeDisabled();
  });

  it('enables Neural Scan button when both images are set', () => {
    useScanStore.setState({
      userImage: 'data:image/png;base64,abc',
      celebImage: 'data:image/png;base64,def',
    });
    renderWithRouter();
    const btn = screen.getByRole('button', { name: /scan\.neuralScan/i });
    expect(btn).not.toBeDisabled();
  });

  it('shows celeb name badge when selectedCelebName is set', () => {
    useScanStore.setState({
      celebImage: 'data:image/png;base64,def',
      selectedCelebName: 'Wonyoung',
    });
    renderWithRouter();
    expect(screen.getByText('Wonyoung')).toBeInTheDocument();
  });

  it('clears celeb selection when X button is clicked', () => {
    useScanStore.setState({
      celebImage: 'data:image/png;base64,def',
      selectedCelebName: 'Jennie',
    });
    renderWithRouter();
    expect(screen.getByText('Jennie')).toBeInTheDocument();

    // Find the X button inside the pink badge
    const badge = screen.getByText('Jennie').closest('div');
    const xButton = badge?.querySelector('button');
    if (xButton) fireEvent.click(xButton);

    expect(useScanStore.getState().selectedCelebName).toBeNull();
  });

  it('calls demoMode when demo button is clicked', () => {
    const demoSpy = vi.fn();
    useScanStore.setState({ demoMode: demoSpy } as never);
    renderWithRouter();

    const demoButton = screen.getByText('scan.previewDemo').closest('button');
    if (demoButton) fireEvent.click(demoButton);
    expect(demoSpy).toHaveBeenCalled();
  });
});
