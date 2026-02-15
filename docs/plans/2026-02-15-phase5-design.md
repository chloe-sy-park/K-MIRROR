# Phase 5: 바이럴 강화 — Design Document

**방향:** 공유 K-GLOW 갤러리 + 딥링크 랜딩 + 소셜 피드 + 공유 통계
**접근법:** 갤러리 퍼스트 — 바이럴 루프(공유→발견→가입)를 먼저 완성

---

## 1. 공유 K-GLOW 갤러리 + 딥링크 랜딩

### DB: `shared_cards` 테이블

```sql
shared_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id),
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
)
```

### 공유 플로우

1. K-GLOW Card 결과 → SharePanel "공개 공유" 버튼 클릭
2. 카드 이미지 Supabase Storage 업로드 + OG 이미지(1200x630) 생성
3. `shared_cards` 레코드 생성 → 6자리 slug 반환
4. 공유 URL: `k-mirror.ai/s/{slug}`

### 딥링크 랜딩 페이지 (`/s/:slug`)

- 동적 OG 메타: Supabase Edge Function이 크롤러에게 OG 태그 반환
- 페이지: 카드 이미지 + 셀럽 이름 + 매칭률 + 좋아요/댓글 + "나도 해보기" CTA
- 조회수 자동 증가

### 갤러리 페이지 (`/gallery`)

- 공개 shared_cards 그리드 (2열, 최신순/인기순)
- 셀럽별 필터
- Infinite scroll + lazy loading
- 각 카드: 이미지 + 셀럽 + 매칭률 + 좋아요 수

### OG 동적 생성 전략

SPA에서 동적 OG 해결:
- Supabase Edge Function (`serve-og-card`) → slug로 shared_card 조회 → HTML 응답 (OG 메타 + JS redirect to SPA)
- Vercel rewrites 또는 Netlify redirects로 `/s/:slug`를 Edge Function 프록시

---

## 2. 소셜 피드 + 인터랙션

### 좋아요

- `card_likes (user_id, shared_card_id)` — UNIQUE constraint
- 인증 필수 (비인증 → AuthModal)
- `shared_cards.likes_count` 캐싱 (DB trigger)
- 하트 애니메이션 (Framer Motion)

### 댓글

- `card_comments (id, shared_card_id, user_id, content, created_at)`
- 인증 필수, 텍스트만, 500자 제한, 1분 쿨다운
- 최신순, 페이지네이션
- 딥링크 페이지에 최근 5개 표시

### 딥링크 랜딩 통합

- 카드 이미지 + 정보
- 좋아요 버튼 + 수
- 댓글 섹션
- "나도 해보기" CTA (가장 눈에 띄게)
- 조회수

---

## 3. 공유 통계 + GA4 확장

### 내 공유 통계 (`/my-shares`)

- 내 공유 카드 목록
- 카드별: 조회수, 좋아요 수, 댓글 수
- 총 합산 통계
- 인증 필수

### GA4 이벤트 (3개 추가)

- `card_published` — 카드 공개 공유 시
- `deeplink_visited` — 딥링크 방문 시
- `gallery_cta_clicked` — "나도 해보기" 클릭 시

### 라우트 추가

- `/gallery` — 공개 갤러리
- `/s/:slug` — 딥링크 랜딩
- `/my-shares` — 내 공유 통계

### i18n 키

- `gallery.*`, `deeplink.*`, `social.*`, `myShares.*`

---

## 기술 결정 요약

| 결정 | 선택 | 이유 |
|------|------|------|
| OG 동적 태그 | Supabase Edge Function | SPA 크롤러 한계 해결, 기존 인프라 활용 |
| 이미지 저장 | Supabase Storage | 이미 사용 중, RLS 적용 가능 |
| slug 생성 | nanoid(6) | 짧고 URL-safe |
| 좋아요 카운트 | DB trigger | 실시간 정확도 + 쿼리 성능 |
| 댓글 | 텍스트만 | YAGNI — 이모지 리액션 등은 나중에 |
| Infinite scroll | Intersection Observer | 네이티브 API, 추가 의존성 없음 |
