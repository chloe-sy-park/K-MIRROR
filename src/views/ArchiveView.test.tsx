import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ArchiveView from './ArchiveView';
import { fetchReportBySessionId } from '@/services/reportService';
import type { PremiumReport } from '@/services/reportService';

vi.mock('@/services/reportService', () => ({
  fetchReportBySessionId: vi.fn(),
  updateReportStatus: vi.fn().mockResolvedValue(undefined),
  sendReportEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/services/analysisService', () => ({
  fetchAnalysis: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/services/pdfService', () => ({
  generateSherlockArchive: vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
  uploadPdf: vi.fn().mockResolvedValue('https://storage.example.com/report.pdf'),
}));

const mockFetchReport = fetchReportBySessionId as ReturnType<typeof vi.fn>;

const MOCK_REPORT_PAID: PremiumReport = {
  id: 'rpt-1',
  analysis_id: 'ana-12345678',
  user_id: 'usr-1',
  stripe_session_id: 'cs_test_123',
  status: 'paid',
  pdf_url: null,
  email: 'test@example.com',
  email_sent: false,
  created_at: '2026-02-15T00:00:00Z',
  expires_at: '2026-02-22T00:00:00Z',
};

const MOCK_REPORT_READY: PremiumReport = {
  ...MOCK_REPORT_PAID,
  status: 'ready',
  pdf_url: 'https://storage.example.com/report.pdf',
};

function renderWithSession(sessionId?: string) {
  const path = sessionId ? `/archive?session_id=${sessionId}` : '/archive';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ArchiveView />
    </MemoryRouter>,
  );
}

describe('ArchiveView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('shows fallback when no session_id param', () => {
    renderWithSession();
    expect(screen.getByText('premiumCheckout.noAnalysis')).toBeInTheDocument();
    expect(screen.getByText('archive.backHome')).toBeInTheDocument();
  });

  it('shows generating UI when report is found with status paid', async () => {
    mockFetchReport.mockResolvedValue(MOCK_REPORT_PAID);
    renderWithSession('test-session');

    await waitFor(() => {
      expect(screen.getByText('archive.generating')).toBeInTheDocument();
    });
  });

  it('shows ready/download UI when report status is ready with pdf_url', async () => {
    mockFetchReport.mockResolvedValue(MOCK_REPORT_READY);
    renderWithSession('test-session');

    await waitFor(() => {
      expect(screen.getByText('archive.ready')).toBeInTheDocument();
    });
    expect(screen.getByText('archive.download')).toBeInTheDocument();
  });

  it('shows error UI when report fetch returns null', async () => {
    mockFetchReport.mockResolvedValue(null);
    renderWithSession('test-session');

    await waitFor(() => {
      expect(screen.getByText('archive.error')).toBeInTheDocument();
    });
  });

  it('retry button is present in error state', async () => {
    mockFetchReport.mockResolvedValue(null);
    renderWithSession('test-session');

    await waitFor(() => {
      expect(screen.getByText('archive.retry')).toBeInTheDocument();
    });
  });
});
