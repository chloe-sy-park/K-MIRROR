import { render } from '@testing-library/react';
import RadarMetricsChart from './RadarMetricsChart';
import type { NormalizedMetrics } from './normalizeMetrics';

// Recharts components don't render full SVG in jsdom — we verify the component
// mounts without error and the container div is present with correct styles.

const USER_METRICS: NormalizedMetrics = { VW: 60, CT: 55, MF: 70, LS: 45, HI: 80 };
const CELEB_METRICS: NormalizedMetrics = { VW: 65, CT: 58, MF: 74, LS: 51, HI: 82 };

describe('RadarMetricsChart', () => {
  it('renders without crashing with user metrics only', () => {
    const { container } = render(<RadarMetricsChart userMetrics={USER_METRICS} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with both user and celeb metrics', () => {
    const { container } = render(
      <RadarMetricsChart userMetrics={USER_METRICS} celebMetrics={CELEB_METRICS} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('applies custom size prop', () => {
    const { container } = render(
      <RadarMetricsChart userMetrics={USER_METRICS} size={400} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('400px');
    expect(wrapper.style.height).toBe('400px');
  });

  it('container div has correct default dimensions', () => {
    const { container } = render(<RadarMetricsChart userMetrics={USER_METRICS} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('300px');
    expect(wrapper.style.height).toBe('300px');
  });
});
