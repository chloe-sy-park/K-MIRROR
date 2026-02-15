import {
  fetchReportBySessionId,
  fetchReportByAnalysisId,
  updateReportStatus,
  sendReportEmail,
} from './reportService';
import type { PremiumReport } from './reportService';

/* ── Mock Supabase ───────────────────────────────────────────────── */

const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateResult = vi.fn();
const mockInvoke = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: (..._args: unknown[]) => ({
        eq: (..._eqArgs: unknown[]) => ({
          limit: (..._lArgs: unknown[]) => ({
            single: () => mockSingle(),
          }),
        }),
      }),
      update: (...args: unknown[]) => {
        mockUpdate(...args);
        return {
          eq: () => mockUpdateResult(),
        };
      },
    })),
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
  isSupabaseConfigured: true,
}));

/* ── Mock data ───────────────────────────────────────────────────── */

const MOCK_REPORT: PremiumReport = {
  id: 'rpt-1',
  analysis_id: 'ana-1',
  user_id: 'usr-1',
  stripe_session_id: 'cs_test_123',
  status: 'paid',
  pdf_url: null,
  email: 'test@example.com',
  email_sent: false,
  created_at: '2026-02-15T00:00:00Z',
  expires_at: '2026-02-22T00:00:00Z',
};

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchReportBySessionId', () => {
    it('returns report on success', async () => {
      mockSingle.mockResolvedValue({ data: MOCK_REPORT, error: null });

      const report = await fetchReportBySessionId('cs_test_123');

      expect(report).toEqual(MOCK_REPORT);
    });

    it('returns null on error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const report = await fetchReportBySessionId('invalid');

      expect(report).toBeNull();
    });
  });

  describe('fetchReportByAnalysisId', () => {
    it('returns report on success', async () => {
      mockSingle.mockResolvedValue({ data: MOCK_REPORT, error: null });

      const report = await fetchReportByAnalysisId('ana-1');

      expect(report).toEqual(MOCK_REPORT);
    });
  });

  describe('updateReportStatus', () => {
    it('calls update with correct payload', async () => {
      mockUpdateResult.mockReturnValue({ error: null });

      await updateReportStatus('rpt-1', 'generating');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'generating' }),
      );
    });

    it('includes pdf_url when provided', async () => {
      mockUpdateResult.mockReturnValue({ error: null });

      await updateReportStatus('rpt-1', 'ready', 'https://example.com/report.pdf');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ready',
          pdf_url: 'https://example.com/report.pdf',
        }),
      );
    });

    it('throws on error', async () => {
      mockUpdateResult.mockReturnValue({ error: { message: 'DB error' } });

      await expect(updateReportStatus('rpt-1', 'failed')).rejects.toEqual(
        expect.objectContaining({ message: 'DB error' }),
      );
    });
  });

  describe('sendReportEmail', () => {
    it('returns true on success', async () => {
      mockInvoke.mockResolvedValue({ error: null });

      const result = await sendReportEmail({
        email: 'test@example.com',
        analysisId: 'ana-1',
        pdfUrl: 'https://example.com/report.pdf',
        celebName: 'TestCeleb',
      });

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith('send-report-email', {
        body: expect.objectContaining({
          email: 'test@example.com',
          analysisId: 'ana-1',
        }),
      });
    });

    it('returns false on error', async () => {
      mockInvoke.mockResolvedValue({ error: { message: 'Email failed' } });

      const result = await sendReportEmail({
        email: 'test@example.com',
        analysisId: 'ana-1',
        pdfUrl: 'https://example.com/report.pdf',
      });

      expect(result).toBe(false);
    });
  });
});
