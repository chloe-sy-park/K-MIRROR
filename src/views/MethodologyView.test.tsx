import { render, screen, fireEvent } from '@testing-library/react';
import MethodologyView from './MethodologyView';

function renderMethodology(onBookSession = vi.fn()) {
  return { ...render(<MethodologyView onBookSession={onBookSession} />), onBookSession };
}

describe('MethodologyView', () => {
  it('renders the methodology heading', () => {
    renderMethodology();
    expect(screen.getByText('methodology.forensicBeauty')).toBeInTheDocument();
    expect(screen.getByText('methodology.techPhilosophy')).toBeInTheDocument();
  });

  it('shows the methodology quote and description', () => {
    renderMethodology();
    expect(screen.getByText(/methodology\.quote/)).toBeInTheDocument();
    expect(screen.getByText('methodology.description')).toBeInTheDocument();
  });

  it('renders all three pillar sections', () => {
    renderMethodology();
    expect(screen.getByText('methodology.pillar1Title')).toBeInTheDocument();
    expect(screen.getByText('methodology.pillar2Title')).toBeInTheDocument();
    expect(screen.getByText('methodology.pillar3Title')).toBeInTheDocument();

    expect(screen.getByText('methodology.pillar1Subtitle')).toBeInTheDocument();
    expect(screen.getByText('methodology.pillar2Subtitle')).toBeInTheDocument();
    expect(screen.getByText('methodology.pillar3Subtitle')).toBeInTheDocument();
  });

  it('shows version stats (adaptive metrics, scan precision, inclusive score)', () => {
    renderMethodology();
    expect(screen.getByText('184')).toBeInTheDocument();
    expect(screen.getByText('0.4mm')).toBeInTheDocument();
    expect(screen.getByText('99.2%')).toBeInTheDocument();

    expect(screen.getByText('methodology.adaptiveMetrics')).toBeInTheDocument();
    expect(screen.getByText('methodology.scanPrecision')).toBeInTheDocument();
    expect(screen.getByText('methodology.inclusiveScore')).toBeInTheDocument();
  });

  it('calls onBookSession when the book session button is clicked', () => {
    const { onBookSession } = renderMethodology();
    fireEvent.click(screen.getByText('methodology.bookMasterSession'));
    expect(onBookSession).toHaveBeenCalled();
  });

  it('renders the CTA section with identity quote', () => {
    renderMethodology();
    expect(screen.getByText('methodology.universalBridge')).toBeInTheDocument();
    expect(screen.getByText(/methodology\.identityQuote/)).toBeInTheDocument();
    expect(screen.getByText('methodology.masterDirector')).toBeInTheDocument();
  });
});
