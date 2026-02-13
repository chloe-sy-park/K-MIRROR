import { saveAnalysis, extractProductIds } from './analysisService';
import type { AnalysisResult } from '@/types';
import type { MatchedProduct } from '@/services/geminiService';

const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: (...args: unknown[]) => {
        mockInsert(...args);
        return { select: (...sArgs: unknown[]) => { mockSelect(...sArgs); return { single: () => mockSingle() }; } };
      },
    }),
    auth: { getUser: () => mockGetUser() },
  },
  isSupabaseConfigured: true,
}));

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
