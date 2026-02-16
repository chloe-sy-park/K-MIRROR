import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function generateSlug(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

export interface SharedCard {
  id: string;
  slug: string;
  celeb_name: string;
  match_rate: number;
  card_image_url: string;
  og_image_url: string | null;
  is_public: boolean;
  likes_count: number;
  views_count: number;
  created_at: string;
  user_id: string | null;
  analysis_id: string | null;
}

export interface CardComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export async function publishCard(params: {
  analysisId: string | null;
  celebName: string;
  matchRate: number;
  cardImageUrl: string;
  ogImageUrl?: string;
}): Promise<{ slug: string } | null> {
  if (!isSupabaseConfigured) return null;
  const { data: userData } = await supabase.auth.getUser();
  const slug = generateSlug();

  const { error } = await supabase.from('shared_cards').insert({
    analysis_id: params.analysisId,
    user_id: userData.user?.id ?? null,
    slug,
    celeb_name: params.celebName,
    match_rate: params.matchRate,
    card_image_url: params.cardImageUrl,
    og_image_url: params.ogImageUrl ?? null,
  });

  if (error) {
    if (import.meta.env.DEV) console.error('Failed to publish card:', error.message);
    return null;
  }
  return { slug };
}

export async function fetchSharedCard(slug: string): Promise<SharedCard | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('shared_cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();
  if (error) return null;
  return data;
}

export async function incrementViews(cardId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.rpc('increment_views', { card_id: cardId });
}

export async function fetchGalleryCards(params: {
  limit?: number;
  offset?: number;
  celebFilter?: string;
  sort?: 'recent' | 'popular';
}): Promise<SharedCard[]> {
  if (!isSupabaseConfigured) return [];
  const { limit = 20, offset = 0, celebFilter, sort = 'recent' } = params;

  let query = supabase
    .from('shared_cards')
    .select('*')
    .eq('is_public', true);

  if (celebFilter) query = query.eq('celeb_name', celebFilter);
  if (sort === 'popular') query = query.order('likes_count', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) return [];
  return data ?? [];
}

export async function toggleLike(cardId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data: existing } = await supabase
    .from('card_likes')
    .select('id')
    .eq('shared_card_id', cardId)
    .eq('user_id', userData.user.id)
    .single();

  if (existing) {
    await supabase.from('card_likes').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('card_likes').insert({
      shared_card_id: cardId,
      user_id: userData.user.id,
    });
    return true;
  }
}

export async function hasUserLiked(cardId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data } = await supabase
    .from('card_likes')
    .select('id')
    .eq('shared_card_id', cardId)
    .eq('user_id', userData.user.id)
    .single();
  return !!data;
}

export async function addComment(cardId: string, content: string): Promise<CardComment | null> {
  if (!isSupabaseConfigured) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from('card_comments')
    .insert({
      shared_card_id: cardId,
      user_id: userData.user.id,
      content: content.trim().slice(0, 500),
    })
    .select('id, content, created_at, user_id')
    .single();

  if (error) return null;
  return data;
}

export async function fetchComments(cardId: string, limit = 20, offset = 0): Promise<CardComment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('card_comments')
    .select('id, content, created_at, user_id')
    .eq('shared_card_id', cardId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return [];
  return data ?? [];
}

export async function fetchMyShares(): Promise<SharedCard[]> {
  if (!isSupabaseConfigured) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('shared_cards')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}
