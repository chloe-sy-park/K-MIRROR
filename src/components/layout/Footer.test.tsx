import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the footer element', () => {
    const { container } = renderFooter();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('shows translated tagline text', () => {
    renderFooter();
    expect(screen.getByText('footer.tagline')).toBeInTheDocument();
  });

  it('renders navigation icon buttons with aria-labels', () => {
    renderFooter();
    expect(screen.getByLabelText('a11y.aboutKmirror')).toBeInTheDocument();
    expect(screen.getByLabelText('a11y.browseShop')).toBeInTheDocument();
    expect(screen.getByLabelText('a11y.museBoard')).toBeInTheDocument();
  });
});
