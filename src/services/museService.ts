import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { MuseBoard, SavedMuse } from '@/types';

/*
  Expected Supabase tables (create via Dashboard → SQL Editor):

  create table muse_boards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    icon text not null default '🎨',
    ai_summary text not null default '',
    created_at timestamptz default now()
  );

  create table saved_muses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    board_id uuid references muse_boards(id) on delete set null,
    user_image text not null,
    celeb_image text not null default '',
    celeb_name text not null,
    vibe text not null default '',
    ai_style_points jsonb not null default '[]',
    created_at timestamptz default now()
  );

  -- RLS policies
  alter table muse_boards enable row level security;
  alter table saved_muses enable row level security;

  create policy "Users manage own boards" on muse_boards
    for all using (auth.uid() = user_id);
  create policy "Users manage own muses" on saved_muses
    for all using (auth.uid() = user_id);
*/

const LS_BOARDS_KEY = 'kmirror_boards';
const LS_MUSES_KEY = 'kmirror_muses';

// ── localStorage helpers ────────────────────────────────

function lsGet<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function lsSet<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Boards ──────────────────────────────────────────────

export async function fetchBoards(): Promise<MuseBoard[]> {
  if (!isSupabaseConfigured) {
    const boards = lsGet<MuseBoard>(LS_BOARDS_KEY);
    const muses = lsGet<SavedMuse>(LS_MUSES_KEY);
    return boards.map((b) => ({
      ...b,
      count: muses.filter((m) => m.boardId === b.id).length,
    }));
  }

  const { data: boards, error } = await supabase
    .from('muse_boards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const { data: counts } = await supabase
    .from('saved_muses')
    .select('board_id');

  const countMap = new Map<string, number>();
  counts?.forEach((r: { board_id: string | null }) => {
    if (r.board_id) countMap.set(r.board_id, (countMap.get(r.board_id) || 0) + 1);
  });

  return (boards || []).map((b) => ({
    id: b.id,
    name: b.name,
    icon: b.icon,
    count: countMap.get(b.id) || 0,
    aiSummary: b.ai_summary || '',
  }));
}

export async function createBoard(name: string, icon: string): Promise<MuseBoard> {
  if (!isSupabaseConfigured) {
    const board: MuseBoard = { id: crypto.randomUUID(), name, icon, count: 0, aiSummary: '' };
    const boards = lsGet<MuseBoard>(LS_BOARDS_KEY);
    boards.unshift(board);
    lsSet(LS_BOARDS_KEY, boards);
    return board;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('muse_boards')
    .insert({ name, icon, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id, name: data.name, icon: data.icon, count: 0, aiSummary: data.ai_summary || '' };
}

export async function deleteBoard(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    lsSet(LS_BOARDS_KEY, lsGet<MuseBoard>(LS_BOARDS_KEY).filter((b) => b.id !== id));
    const muses = lsGet<SavedMuse>(LS_MUSES_KEY).map((m) =>
      m.boardId === id ? { ...m, boardId: undefined } : m
    );
    lsSet(LS_MUSES_KEY, muses);
    return;
  }

  const { error } = await supabase.from('muse_boards').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Muses ───────────────────────────────────────────────

export async function fetchMuses(boardId?: string): Promise<SavedMuse[]> {
  if (!isSupabaseConfigured) {
    const muses = lsGet<SavedMuse>(LS_MUSES_KEY);
    return boardId ? muses.filter((m) => m.boardId === boardId) : muses;
  }

  let query = supabase.from('saved_muses').select('*').order('created_at', { ascending: false });
  if (boardId) query = query.eq('board_id', boardId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((r) => ({
    id: r.id,
    userImage: r.user_image,
    celebImage: r.celeb_image,
    celebName: r.celeb_name,
    date: new Date(r.created_at).toLocaleDateString(),
    vibe: r.vibe,
    boardId: r.board_id ?? undefined,
    aiStylePoints: r.ai_style_points || [],
  }));
}

export async function saveMuse(muse: Omit<SavedMuse, 'id'>): Promise<SavedMuse> {
  if (!isSupabaseConfigured) {
    const saved: SavedMuse = { ...muse, id: crypto.randomUUID() };
    const muses = lsGet<SavedMuse>(LS_MUSES_KEY);
    muses.unshift(saved);
    lsSet(LS_MUSES_KEY, muses);
    return saved;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_muses')
    .insert({
      user_id: user.id,
      board_id: muse.boardId || null,
      user_image: muse.userImage,
      celeb_image: muse.celebImage,
      celeb_name: muse.celebName,
      vibe: muse.vibe,
      ai_style_points: muse.aiStylePoints,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id,
    userImage: data.user_image,
    celebImage: data.celeb_image,
    celebName: data.celeb_name,
    date: new Date(data.created_at).toLocaleDateString(),
    vibe: data.vibe,
    boardId: data.board_id ?? undefined,
    aiStylePoints: data.ai_style_points || [],
  };
}

export async function deleteMuse(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    lsSet(LS_MUSES_KEY, lsGet<SavedMuse>(LS_MUSES_KEY).filter((m) => m.id !== id));
    return;
  }

  const { error } = await supabase.from('saved_muses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
