import { uploadPdf, generateSherlockArchive } from './pdfService';
import type { AnalysisResult } from '@/types';

/* ── Mock jsPDF ──────────────────────────────────────────────────── */

const mockAddPage = vi.fn();
const mockAddImage = vi.fn();
const mockOutput = vi.fn().mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' }));

vi.mock('jspdf', () => {
  const MockJsPDF = function (this: Record<string, unknown>) {
    this.addPage = mockAddPage;
    this.addImage = mockAddImage;
    this.output = mockOutput;
  };
  return { jsPDF: MockJsPDF };
});

/* ── Mock html2canvas ────────────────────────────────────────────── */

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,abc'),
  }),
}));

/* ── Mock React DOM ──────────────────────────────────────────────── */

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn().mockReturnValue({
    render: vi.fn(),
    unmount: vi.fn(),
  }),
}));

vi.mock('react-dom', () => ({
  flushSync: vi.fn((fn: () => void) => fn()),
}));

/* ── Mock PDF components ─────────────────────────────────────────── */

vi.mock('@/components/pdf/PdfPageShell', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfCover', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfSkeletal', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfMetricsOverview', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfMetricsDeep', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfTranslation', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfSolution', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfProducts', () => ({ default: () => null }));
vi.mock('@/components/pdf/PdfFinalReveal', () => ({ default: () => null }));
vi.mock('@/components/charts/RadarMetricsChart', () => ({ default: () => null }));
vi.mock('@/components/charts/normalizeMetrics', () => ({
  normalizeMetrics: vi.fn().mockReturnValue({ VW: 50, CT: 60, MF: 55, LS: 45, HI: 85 }),
}));

/* ── Mock Supabase ───────────────────────────────────────────────── */

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockGetPublicUrl(...args),
      }),
    },
  },
  isSupabaseConfigured: true,
}));

/* ── Mock analysis data ──────────────────────────────────────────── */

const MOCK_ANALYSIS: AnalysisResult = {
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
    eyeAngle: '5\u00b0',
    boneStructure: 'Test',
    facialVibe: 'Test',
  },
  kMatch: {
    celebName: 'Test',
    adaptationLogic: { base: '', lip: '', point: '' },
    styleExplanation: '',
    aiStylePoints: [],
  },
  recommendations: {
    ingredients: [],
    products: [],
    videos: [],
    sensitiveSafe: true,
  },
};

describe('pdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadPdf', () => {
    it('returns public URL on success', async () => {
      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.example.com/reports/test-id.pdf' },
      });

      const url = await uploadPdf(new Blob(['test']), 'test-id');

      expect(url).toBe('https://storage.example.com/reports/test-id.pdf');
      expect(mockUpload).toHaveBeenCalledWith(
        'reports/test-id.pdf',
        expect.any(Blob),
        { contentType: 'application/pdf', upsert: true },
      );
    });

    it('throws on upload error', async () => {
      mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

      await expect(uploadPdf(new Blob(['test']), 'test-id')).rejects.toEqual(
        expect.objectContaining({ message: 'Upload failed' }),
      );
    });
  });

  describe('generateSherlockArchive', () => {
    it('is exported as a function', () => {
      expect(typeof generateSherlockArchive).toBe('function');
    });

    it('calls jsPDF and returns a Blob', async () => {
      const blob = await generateSherlockArchive(
        MOCK_ANALYSIS,
        'TestCeleb',
        null,
        [],
        'analysis-123',
      );

      expect(blob).toBeInstanceOf(Blob);
      expect(mockOutput).toHaveBeenCalledWith('blob');
    });
  });
});
