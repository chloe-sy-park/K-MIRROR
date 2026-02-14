import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CelebGalleryView from './CelebGalleryView';
import { CELEB_GALLERY } from '@/data/celebGallery';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

function renderView() {
  return render(
    <MemoryRouter>
      <CelebGalleryView />
    </MemoryRouter>
  );
}

describe('CelebGalleryView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the gallery header', () => {
    renderView();
    expect(screen.getByText('celebs.title')).toBeInTheDocument();
    expect(screen.getByText('celebs.styleMuse')).toBeInTheDocument();
  });

  it('shows all celebs by default', () => {
    renderView();
    const countText = screen.getByText(`${CELEB_GALLERY.length} celebs.celebsCount celebs.found`);
    expect(countText).toBeInTheDocument();
  });

  it('shows celeb names', () => {
    renderView();
    expect(screen.getByText('Jennie')).toBeInTheDocument();
    expect(screen.getByText('Wonyoung')).toBeInTheDocument();
  });

  it('filters by genre when clicking a genre button', () => {
    renderView();
    const kDramaBtn = screen.getByRole('radio', { name: 'K-Drama' });
    fireEvent.click(kDramaBtn);

    const kDramaCelebs = CELEB_GALLERY.filter(c => c.genre === 'K-Drama');
    const countText = screen.getByText(`${kDramaCelebs.length} celebs.celebsCount celebs.found`);
    expect(countText).toBeInTheDocument();
  });

  it('filters by mood when clicking a mood button', () => {
    renderView();
    const cuteBtn = screen.getByRole('radio', { name: 'Cute' });
    fireEvent.click(cuteBtn);

    const cuteCelebs = CELEB_GALLERY.filter(c => c.mood === 'Cute');
    const countText = screen.getByText(`${cuteCelebs.length} ${cuteCelebs.length === 1 ? 'celebs.celeb' : 'celebs.celebsCount'} celebs.found`);
    expect(countText).toBeInTheDocument();
  });

  it('navigates to scan with selected celeb on card click', () => {
    renderView();
    const jennieCard = screen.getByText('Jennie').closest('[class*="cursor-pointer"]');
    if (jennieCard) fireEvent.click(jennieCard);

    expect(mockNavigate).toHaveBeenCalledWith('/scan', {
      state: { selectedCeleb: expect.objectContaining({ name: 'Jennie' }) },
    });
  });

  it('shows empty state when no celebs match filters', () => {
    renderView();
    const kFilmBtn = screen.getByRole('radio', { name: 'K-Film' });
    fireEvent.click(kFilmBtn);

    if (CELEB_GALLERY.filter(c => c.genre === 'K-Film').length === 0) {
      expect(screen.getByText('celebs.noResults')).toBeInTheDocument();
    }
  });

  it('shows signature look for each celeb', () => {
    renderView();
    expect(screen.getByText(/Strawberry Moon Glass Skin/i)).toBeInTheDocument();
  });
});
