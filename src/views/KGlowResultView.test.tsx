import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import KGlowResultView from './KGlowResultView';
import { useScanStore } from '@/store/scanStore';
import type { AnalysisResult, StyleVersions } from '@/types';

// Mock child components that are not relevant to tab logic
vi.mock('@/components/kglow/KGlowCard', () => ({
  default: vi.fn(() => <div data-testid="kglow-card" />),
}));
vi.mock('@/components/kglow/SharePanel', () => ({
  default: vi.fn(() => <div data-testid="share-panel" />),
}));
vi.mock('@/components/charts/RadarMetricsChart', () => ({
  default: vi.fn(() => <div data-testid="radar-chart" />),
}));

const MOCK_STYLE_VERSIONS: StyleVersions = {
  daily: {
    intensity: 'light',
    base: 'Light BB cream with SPF',
    eyes: 'Soft brown shadow, no liner',
    lips: 'Tinted lip balm in MLBB shade',
    keyProducts: ['BB Cream', 'Lip Balm'],
    metricsShift: { VW: -5, CT: 0, MF: 2, LS: 3, HI: 1 },
  },
  office: {
    intensity: 'medium',
    base: 'Cushion foundation, light concealer',
    eyes: 'Neutral matte palette, thin liner',
    lips: 'Velvet tint in rose',
    keyProducts: ['Cushion', 'Matte Palette'],
    metricsShift: { VW: 0, CT: 3, MF: 0, LS: 5, HI: 3 },
  },
  glam: {
    intensity: 'full',
    base: 'Full coverage foundation, contour',
    eyes: 'Shimmer shadow, winged liner, lashes',
    lips: 'Bold red lip with liner',
    keyProducts: ['Foundation', 'Red Lipstick'],
    metricsShift: { VW: 10, CT: 5, MF: -3, LS: 8, HI: 5 },
  },
};

const MOCK_RESULT_BASE: AnalysisResult = {
  tone: {
    melaninIndex: 3,
    undertone: 'Warm',
    skinHexCode: '#C4A882',
    skinConcerns: ['dryness'],
    description: 'Test',
    skinType: 'combination',
    sensitivityLevel: 2,
    moistureLevel: 'medium',
    sebumLevel: 'medium',
    poreSize: 'medium',
    skinThickness: 'medium',
  },
  sherlock: {
    proportions: { upper: '1', middle: '1', lower: '1' },
    eyeAngle: '5°',
    boneStructure: 'Test',
    facialVibe: 'Test',
  },
  kMatch: {
    celebName: 'TestCeleb',
    adaptationLogic: { base: '', lip: '', point: '' },
    styleExplanation: 'Test explanation',
    aiStylePoints: [],
  },
  recommendations: {
    ingredients: [],
    products: [],
    videos: [],
    sensitiveSafe: true,
  },
};

function renderView() {
  return render(
    <MemoryRouter>
      <KGlowResultView />
    </MemoryRouter>,
  );
}

describe('KGlowResultView', () => {
  beforeEach(() => {
    useScanStore.setState({
      phase: 'result',
      userImage: 'data:image/png;base64,abc',
      celebImage: 'data:image/png;base64,def',
      selectedCelebName: 'TestCeleb',
      result: null,
      analysisId: 'analysis-123',
      error: null,
    });
  });

  it('renders nothing when result is null', () => {
    const { container } = renderView();
    expect(container.innerHTML).toBe('');
  });

  describe('style version tabs', () => {
    it('hides tab area when styleVersions is absent', () => {
      useScanStore.setState({
        result: { ...MOCK_RESULT_BASE },
      });
      renderView();

      // Tab buttons should not exist
      expect(screen.queryByText('styleVersions.daily')).not.toBeInTheDocument();
      expect(screen.queryByText('styleVersions.office')).not.toBeInTheDocument();
      expect(screen.queryByText('styleVersions.glam')).not.toBeInTheDocument();
    });

    it('shows 3 tab buttons when styleVersions is present', () => {
      useScanStore.setState({
        result: { ...MOCK_RESULT_BASE, styleVersions: MOCK_STYLE_VERSIONS },
      });
      renderView();

      expect(screen.getByText('styleVersions.daily')).toBeInTheDocument();
      expect(screen.getByText('styleVersions.office')).toBeInTheDocument();
      expect(screen.getByText('styleVersions.glam')).toBeInTheDocument();
    });

    it('shows glam version content by default', () => {
      useScanStore.setState({
        result: { ...MOCK_RESULT_BASE, styleVersions: MOCK_STYLE_VERSIONS },
      });
      renderView();

      // Glam is the default active version
      expect(screen.getByText(MOCK_STYLE_VERSIONS.glam.base)).toBeInTheDocument();
      expect(screen.getByText(MOCK_STYLE_VERSIONS.glam.eyes)).toBeInTheDocument();
      expect(screen.getByText(MOCK_STYLE_VERSIONS.glam.lips)).toBeInTheDocument();
    });

    it('shows daily version content when daily tab is clicked', () => {
      useScanStore.setState({
        result: { ...MOCK_RESULT_BASE, styleVersions: MOCK_STYLE_VERSIONS },
      });
      renderView();

      fireEvent.click(screen.getByText('styleVersions.daily'));

      expect(screen.getByText(MOCK_STYLE_VERSIONS.daily.base)).toBeInTheDocument();
      expect(screen.getByText(MOCK_STYLE_VERSIONS.daily.eyes)).toBeInTheDocument();
      expect(screen.getByText(MOCK_STYLE_VERSIONS.daily.lips)).toBeInTheDocument();
    });

    it('shows office version content when office tab is clicked', () => {
      useScanStore.setState({
        result: { ...MOCK_RESULT_BASE, styleVersions: MOCK_STYLE_VERSIONS },
      });
      renderView();

      fireEvent.click(screen.getByText('styleVersions.office'));

      expect(screen.getByText(MOCK_STYLE_VERSIONS.office.base)).toBeInTheDocument();
      expect(screen.getByText(MOCK_STYLE_VERSIONS.office.eyes)).toBeInTheDocument();
      expect(screen.getByText(MOCK_STYLE_VERSIONS.office.lips)).toBeInTheDocument();
    });
  });
});
