import { saveAnalysis, fetchAnalysis, extractProductIds } from './analysisService';
import type { AnalysisResult, StyleVersions } from '@/types';
import type { MatchedProduct } from '@/services/geminiService';

const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: (...args: unknown[]) => {
        mockInsert(...args);
        return {
          select: (...sArgs: unknown[]) => {
            mockSelect(...sArgs);
            return { single: () => mockSingle() };
          },
        };
      },
      select: (...args: unknown[]) => {
        mockSelect(...args);
        return {
          eq: (...eqArgs: unknown[]) => {
            mockEq(...eqArgs);
            return { single: () => mockSingle() };
          },
        };
      },
    }),
    auth: { getUser: () => mockGetUser() },
  },
  isSupabaseConfigured: true,
}));

const MOCK_STYLE_VERSIONS: StyleVersions = {
  daily: {
    intensity: 'light',
    base: 'Light BB cream',
    eyes: 'Soft brown shadow',
    lips: 'Tinted lip balm',
    keyProducts: ['BB Cream'],
    metricsShift: { VW: -5, CT: 0, MF: 2, LS: 3, HI: 1 },
  },
  office: {
    intensity: 'medium',
    base: 'Cushion foundation',
    eyes: 'Neutral matte palette',
    lips: 'Velvet tint',
    keyProducts: ['Cushion'],
    metricsShift: { VW: 0, CT: 3, MF: 0, LS: 5, HI: 3 },
  },
  glam: {
    intensity: 'full',
    base: 'Full coverage foundation',
    eyes: 'Shimmer shadow',
    lips: 'Bold red lip',
    keyProducts: ['Foundation'],
    metricsShift: { VW: 10, CT: 5, MF: -3, LS: 8, HI: 5 },
  },
};

const MOCK_RESULT: AnalysisResult = {
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
  sherlock: { proportions: { upper: '1', middle: '1', lower: '1' }, eyeAngle: '5°', boneStructure: 'Test', facialVibe: 'Test' },
  kMatch: { celebName: 'Test', adaptationLogic: { base: '', lip: '', point: '' }, styleExplanation: '', aiStylePoints: [] },
  recommendations: { ingredients: [], products: [], videos: [], sensitiveSafe: true },
};

describe('analysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  describe('saveAnalysis', () => {
    it('returns analysis ID on success', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'analysis-123' }, error: null });

      const id = await saveAnalysis(MOCK_RESULT, ['prod-1', 'prod-2']);

      expect(id).toBe('analysis-123');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          melanin_index: 3,
          undertone: 'Warm',
          skin_type: 'combination',
          recommended_product_ids: ['prod-1', 'prod-2'],
        }),
      );
    });

    it('returns null on DB error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const id = await saveAnalysis(MOCK_RESULT, []);

      expect(id).toBeNull();
    });

    it('includes style_versions in insert payload when present', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'analysis-456' }, error: null });

      const resultWithVersions: AnalysisResult = {
        ...MOCK_RESULT,
        styleVersions: MOCK_STYLE_VERSIONS,
      };

      await saveAnalysis(resultWithVersions, []);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          style_versions: MOCK_STYLE_VERSIONS,
        }),
      );
    });

    it('includes style_versions as null when not present', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'analysis-789' }, error: null });

      await saveAnalysis(MOCK_RESULT, []);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          style_versions: null,
        }),
      );
    });
  });

  describe('fetchAnalysis', () => {
    it('returns styleVersions when present in DB row', async () => {
      mockSingle.mockResolvedValue({
        data: {
          tone_analysis: MOCK_RESULT.tone,
          sherlock_analysis: MOCK_RESULT.sherlock,
          k_match: MOCK_RESULT.kMatch,
          five_metrics: null,
          style_versions: MOCK_STYLE_VERSIONS,
          recommendations: MOCK_RESULT.recommendations,
          celeb_id: null,
          recommended_product_ids: [],
        },
        error: null,
      });

      const result = await fetchAnalysis('analysis-123');

      expect(result).not.toBeNull();
      expect(result!.styleVersions).toEqual(MOCK_STYLE_VERSIONS);
    });

    it('returns undefined styleVersions when not in DB row', async () => {
      mockSingle.mockResolvedValue({
        data: {
          tone_analysis: MOCK_RESULT.tone,
          sherlock_analysis: MOCK_RESULT.sherlock,
          k_match: MOCK_RESULT.kMatch,
          five_metrics: null,
          style_versions: null,
          recommendations: MOCK_RESULT.recommendations,
          celeb_id: null,
          recommended_product_ids: [],
        },
        error: null,
      });

      const result = await fetchAnalysis('analysis-456');

      expect(result).not.toBeNull();
      expect(result!.styleVersions).toBeUndefined();
    });

    it('returns null on DB error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const result = await fetchAnalysis('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('extractProductIds', () => {
    it('extracts IDs from matched products', () => {
      const products = [
        { id: 'a' },
        { id: 'b' },
        { id: '' },
      ] as MatchedProduct[];

      const ids = extractProductIds(products);

      expect(ids).toEqual(['a', 'b']);
    });
  });
});
