import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PremiumCheckoutView from './PremiumCheckoutView';
import { useScanStore } from '@/store/scanStore';
import { createPremiumCheckout } from '@/services/paymentService';

vi.mock('@/services/paymentService', () => ({
  createPremiumCheckout: vi.fn(),
}));

const mockCreatePremiumCheckout = createPremiumCheckout as ReturnType<typeof vi.fn>;

function renderView() {
  return render(
    <MemoryRouter>
      <PremiumCheckoutView />
    </MemoryRouter>,
  );
}

describe('PremiumCheckoutView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useScanStore.setState({
      analysisId: null,
      selectedCelebName: null,
    });
    sessionStorage.clear();
  });

  it('shows noAnalysis state when no analysisId', () => {
    renderView();
    expect(screen.getByText('premiumCheckout.noAnalysis')).toBeInTheDocument();
    expect(screen.getByText('premiumCheckout.backToCard')).toBeInTheDocument();
  });

  it('shows checkout UI when analysisId exists from store', () => {
    useScanStore.setState({ analysisId: 'test-analysis-123' });
    renderView();
    expect(screen.getByText('premiumCheckout.title')).toBeInTheDocument();
    expect(screen.getByText('premiumCheckout.price')).toBeInTheDocument();
    expect(screen.getByText('premiumCheckout.payNow')).toBeInTheDocument();
  });

  it('shows celeb name when selectedCelebName is set', () => {
    useScanStore.setState({
      analysisId: 'test-analysis-123',
      selectedCelebName: 'Jennie',
    });
    renderView();
    expect(screen.getByText(/Jennie/)).toBeInTheDocument();
  });

  it('pay button triggers checkout flow', async () => {
    useScanStore.setState({ analysisId: 'test-analysis-123' });
    mockCreatePremiumCheckout.mockResolvedValue('https://checkout.stripe.com/pay');
    renderView();

    const payBtn = screen.getByText('premiumCheckout.payNow');
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(mockCreatePremiumCheckout).toHaveBeenCalledWith('test-analysis-123');
    });
  });

  it('shows error message on payment failure', async () => {
    useScanStore.setState({ analysisId: 'test-analysis-123' });
    mockCreatePremiumCheckout.mockRejectedValue(new Error('Payment failed'));
    renderView();

    const payBtn = screen.getByText('premiumCheckout.payNow');
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
    });
  });
});
