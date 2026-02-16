-- shared_cards: 공개된 K-GLOW 카드
CREATE TABLE IF NOT EXISTS public.shared_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id),
  user_id UUID REFERENCES auth.users(id),
  slug TEXT UNIQUE NOT NULL,
  celeb_name TEXT NOT NULL,
  match_rate INTEGER NOT NULL,
  card_image_url TEXT NOT NULL,
  og_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shared_cards_slug ON public.shared_cards(slug);
CREATE INDEX idx_shared_cards_user ON public.shared_cards(user_id);
CREATE INDEX idx_shared_cards_public ON public.shared_cards(is_public, created_at DESC);

ALTER TABLE public.shared_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public cards" ON public.shared_cards
  FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own cards" ON public.shared_cards
  FOR ALL USING (auth.uid() = user_id);

-- card_likes: 좋아요
CREATE TABLE IF NOT EXISTS public.card_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_card_id UUID REFERENCES public.shared_cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shared_card_id, user_id)
);

ALTER TABLE public.card_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON public.card_likes FOR SELECT USING (true);
CREATE POLICY "Auth users can manage own likes" ON public.card_likes
  FOR ALL USING (auth.uid() = user_id);

-- card_comments: 댓글
CREATE TABLE IF NOT EXISTS public.card_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_card_id UUID REFERENCES public.shared_cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_card ON public.card_comments(shared_card_id, created_at DESC);

ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.card_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can create comments" ON public.card_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.card_comments
  FOR DELETE USING (auth.uid() = user_id);

-- likes_count 업데이트 트리거
CREATE OR REPLACE FUNCTION update_likes_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.shared_cards SET likes_count = likes_count + 1 WHERE id = NEW.shared_card_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.shared_cards SET likes_count = likes_count - 1 WHERE id = OLD.shared_card_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON public.card_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- views_count 증가 RPC (중복 방지 없이 단순 증가)
CREATE OR REPLACE FUNCTION increment_views(card_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE public.shared_cards SET views_count = views_count + 1 WHERE id = card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
