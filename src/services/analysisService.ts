import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AnalysisResult } from '@/types';
import type { MatchedProduct } from '@/services/geminiService';

/**
 * Save analysis result to the analyses table and return the row ID.
 * Returns null when Supabase is not configured or on error (non-blocking).
 */
export async function saveAnalysis(
  result: AnalysisResult,
  matchedProductIds: string[],
  celebId?: string | null,
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;

  const { tone } = result;

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      melanin_index: tone.melaninIndex,
      undertone: tone.undertone,
      skin_type: tone.skinType ?? null,
      sensitivity_level: tone.sensitivityLevel ?? null,
      moisture_level: tone.moistureLevel ?? null,
      sebum_level: tone.sebumLevel ?? null,
      pore_size: tone.poreSize ?? null,
      skin_thickness: tone.skinThickness ?? null,
      skin_concerns: tone.skinConcerns,
      tone_analysis: tone,
      sherlock_analysis: result.sherlock,
      k_match: result.kMatch,
      recommended_product_ids: matchedProductIds,
      five_metrics: result.fiveMetrics ?? null,
      style_versions: result.styleVersions ?? null,
      celeb_id: celebId ?? null,
      recommendations: result.recommendations ?? null,
    })
    .select('id')
    .single();

  if (error) {
    if (import.meta.env.DEV) console.error('Failed to save analysis:', error.message);
    return null;
  }

  return data?.id ?? null;
}

/**
 * Fetch a full analysis result by ID for premium report generation.
 * Returns null when Supabase is not configured, or on error / missing row.
 */
export async function fetchAnalysis(id: string): Promise<AnalysisResult | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('analyses')
    .select('tone_analysis, sherlock_analysis, k_match, five_metrics, style_versions, recommendations, celeb_id, recommended_product_ids')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    tone: data.tone_analysis,
    sherlock: data.sherlock_analysis,
    kMatch: data.k_match,
    recommendations: data.recommendations ?? { ingredients: [], products: [], videos: [], sensitiveSafe: false },
    fiveMetrics: data.five_metrics ?? undefined,
    styleVersions: data.style_versions ?? undefined,
  };
}

/**
 * Extract product IDs from matched products for storage.
 */
export function extractProductIds(products: MatchedProduct[]): string[] {
  return products.map((p) => p.id).filter(Boolean);
}
