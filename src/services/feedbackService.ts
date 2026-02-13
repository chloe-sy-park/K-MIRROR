import { supabase, isSupabaseConfigured } from '@/lib/supabase';

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function submitAnalysisFeedback(
  analysisId: string,
  helpful: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('feedback').insert({
    analysis_id: analysisId,
    user_id: userId,
    analysis_helpful: helpful,
  });
  if (error) {
    if (import.meta.env.DEV) console.error('Failed to submit analysis feedback:', error.message);
    return false;
  }
  return true;
}

export async function submitProductFeedback(
  analysisId: string,
  productId: string,
  relevant: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('feedback').insert({
    analysis_id: analysisId,
    user_id: userId,
    product_id: productId,
    product_relevant: relevant,
  });
  if (error) {
    if (import.meta.env.DEV) console.error('Failed to submit product feedback:', error.message);
    return false;
  }
  return true;
}
