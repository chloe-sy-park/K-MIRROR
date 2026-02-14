import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingView from './LandingView';

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/' }]}>
      <LandingView />
    </MemoryRouter>,
  );
}

describe('LandingView', () => {
  it('renders the landing nav with brand name', () => {
    renderLanding();
    expect(screen.getByText('landing.nav.tryNow')).toBeInTheDocument();
  });

  it('renders hero section with CTA', () => {
    renderLanding();
    expect(screen.getByText('landing.hero.title')).toBeInTheDocument();
    expect(screen.getByText('landing.hero.cta')).toBeInTheDocument();
  });

  it('renders sherlock section', () => {
    renderLanding();
    expect(screen.getByText('landing.sherlock.title')).toBeInTheDocument();
  });

  it('renders gallery section', () => {
    renderLanding();
    expect(screen.getByText('landing.gallery.title')).toBeInTheDocument();
  });

  it('renders value props section', () => {
    renderLanding();
    expect(screen.getByText('landing.valueProps.card1Title')).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    renderLanding();
    expect(screen.getByText('landing.howItWorks.title')).toBeInTheDocument();
  });

  it('renders celebrity section', () => {
    renderLanding();
    expect(screen.getByText('landing.celebs.title')).toBeInTheDocument();
  });

  it('renders reviews section', () => {
    renderLanding();
    expect(screen.getByText('landing.reviews.title')).toBeInTheDocument();
  });

  it('renders transparency section', () => {
    renderLanding();
    expect(screen.getByText('landing.transparency.title')).toBeInTheDocument();
  });

  it('renders pricing section', () => {
    renderLanding();
    expect(screen.getByText('landing.pricing.title')).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    renderLanding();
    expect(screen.getByText('landing.faq.title')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderLanding();
    expect(screen.getByText('landing.cta.title')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderLanding();
    expect(screen.getByText('landing.footer.copyright')).toBeInTheDocument();
  });

  it('has CTA links pointing to /scan', () => {
    renderLanding();
    const ctaLinks = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('href') === '/scan',
    );
    expect(ctaLinks.length).toBeGreaterThan(0);
  });
});
