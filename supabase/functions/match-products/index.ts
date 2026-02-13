// supabase/functions/match-products/index.ts
//
// 피부 프로필 기반 제품 매칭 Edge Function
//
// SkinProfile을 받아 products 테이블에서 전체 활성 제품을 조회하고,
// scoringService.ts와 동일한 알고리즘으로 점수를 매긴 뒤
// 카테고리 다양화(최대 2개/카테고리, 총 6개)하여 반환한다.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// -- CORS --

const ALLOWED_ORIGINS = [
  'https://k-mirror.vercel.app',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function jsonResponse(body: Record<string, unknown>, status: number, req: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

// -- 타입 --

interface SkinProfile {
  melaninIndex: number;
  undertone: string;
  skinType?: string;
  sensitivityLevel?: number;
  skinConcerns: string[];
}

interface DBProduct {
  id: string;
  brand: string;
  name_en: string;
  name_ko: string;
  category: string;
  subcategory: string | null;
  melanin_min: number;
  melanin_max: number;
  undertones: string[];
  skin_types: string[];
  concerns: string[];
  ingredients: string[];
  shade_hex: string | null;
  price_usd: number;
  image_url: string | null;
  affiliate_url: string | null;
  safety_rating: string | null;
}

// -- 관심사별 유익 성분 맵 --

const BENEFICIAL_INGREDIENTS: Record<string, string[]> = {
  dryness: ['hyaluronic acid', 'ceramide', 'squalane', 'glycerin', 'shea butter', 'snail secretion filtrate'],
  aging: ['retinol', 'peptide', 'niacinamide', 'vitamin c', 'collagen', 'ginseng'],
  acne: ['salicylic acid', 'tea tree', 'niacinamide', 'centella asiatica', 'zinc'],
  hyperpigmentation: ['vitamin c', 'arbutin', 'niacinamide', 'licorice extract', 'ascorbic acid'],
  dullness: ['vitamin c', 'niacinamide', 'aha', 'rice extract', 'ascorbic acid'],
  redness: ['centella asiatica', 'green tea', 'aloe vera', 'beta-glucan', 'panthenol'],
  uneven_tone: ['niacinamide', 'vitamin c', 'arbutin', 'aha'],
  sun_damage: ['vitamin c', 'niacinamide', 'green tea', 'vitamin e'],
};

const IRRITANTS = ['fragrance', 'alcohol', 'denatured alcohol', 'parfum', 'synthetic dye'];

// -- 점수 상수 --

const MELANIN_CENTER = 25;
const MELANIN_IN_RANGE = 18;
const MELANIN_BOUNDARY = 10;

const UNDERTONE_EXACT = 15;
const UNDERTONE_NEUTRAL = 7;

const SKIN_TYPE_EXACT = 15;
const SKIN_TYPE_FALLBACK = 7;

const CONCERN_PER_MATCH = 5;
const CONCERN_MAX = 10;

const INGREDIENT_BENEFICIAL = 5;
const INGREDIENT_BENEFICIAL_MAX = 12;
const INGREDIENT_IRRITANT = -4;

const SAFETY_SCORES: Record<string, number> = {
  'EWG Green': 15,
  Vegan: 13,
  'EWG Yellow': 5,
  'EWG Red': -5,
};

// -- 스코어링 함수 (scoringService.ts와 동일) --

function scoreMelanin(product: DBProduct, melaninIndex: number): number {
  const { melanin_min, melanin_max } = product;
  const center = (melanin_min + melanin_max) / 2;

  if (melaninIndex === center) return MELANIN_CENTER;
  if (melaninIndex >= melanin_min && melaninIndex <= melanin_max) return MELANIN_IN_RANGE;
  if (melaninIndex >= melanin_min - 1 && melaninIndex <= melanin_max + 1) return MELANIN_BOUNDARY;
  return 0;
}

function scoreUndertone(product: DBProduct, undertone: string): number {
  const tones = product.undertones ?? [];
  if (tones.includes(undertone)) return UNDERTONE_EXACT;
  if (tones.includes('Neutral')) return UNDERTONE_NEUTRAL;
  return 0;
}

function scoreSkinType(product: DBProduct, skinType?: string): number {
  const types = product.skin_types;

  if (!types?.length || skinType == null) return SKIN_TYPE_FALLBACK;

  if (types.includes(skinType)) return SKIN_TYPE_EXACT;
  if (types.includes('normal')) return SKIN_TYPE_FALLBACK;
  return 0;
}

function scoreConcerns(product: DBProduct, concerns: string[]): number {
  const productConcerns = product.concerns ?? [];
  const matches = concerns.filter((c) => productConcerns.includes(c)).length;
  return Math.min(matches * CONCERN_PER_MATCH, CONCERN_MAX);
}

function scoreIngredients(product: DBProduct, concerns: string[]): number {
  const ingredients = product.ingredients ?? [];
  if (ingredients.length === 0) return 0;

  const lowerIngredients = ingredients.map((i) => i.toLowerCase());

  // 유익 성분 집계
  const beneficialSet = new Set<string>();
  for (const concern of concerns) {
    const beneficial = BENEFICIAL_INGREDIENTS[concern];
    if (!beneficial) continue;
    for (const ingredient of beneficial) {
      if (lowerIngredients.some((pi) => pi.includes(ingredient))) {
        beneficialSet.add(ingredient);
      }
    }
  }
  const beneficialScore = Math.min(beneficialSet.size * INGREDIENT_BENEFICIAL, INGREDIENT_BENEFICIAL_MAX);

  // 자극 성분 집계
  const irritantCount = IRRITANTS.filter((irritant) =>
    lowerIngredients.some((pi) => pi.includes(irritant)),
  ).length;
  const irritantScore = irritantCount * INGREDIENT_IRRITANT;

  return beneficialScore + irritantScore;
}

function scoreSafety(product: DBProduct, sensitivityLevel?: number): number {
  const rating = product.safety_rating ?? '';
  const baseScore = SAFETY_SCORES[rating] ?? 0;

  const level = sensitivityLevel ?? 2;
  let multiplier: number;
  if (level >= 4) {
    multiplier = 1.5;
  } else if (level >= 3) {
    multiplier = 1.0;
  } else {
    multiplier = 0.7;
  }

  return baseScore * multiplier;
}

function scoreProduct(product: DBProduct, skinProfile: SkinProfile): number {
  const melanin = scoreMelanin(product, skinProfile.melaninIndex);
  const undertone = scoreUndertone(product, skinProfile.undertone);
  const skinType = scoreSkinType(product, skinProfile.skinType);
  const concerns = scoreConcerns(product, skinProfile.skinConcerns);
  const ingredients = scoreIngredients(product, skinProfile.skinConcerns);
  const safety = scoreSafety(product, skinProfile.sensitivityLevel);

  return Math.max(0, melanin + undertone + skinType + concerns + ingredients + safety);
}

// -- 카테고리 다양화 --

interface ScoredProduct extends DBProduct {
  matchScore: number;
}

function diversify(scored: ScoredProduct[], maxPerCategory = 2, total = 6): ScoredProduct[] {
  const sorted = [...scored].sort((a, b) => b.matchScore - a.matchScore);
  const categoryCounts: Record<string, number> = {};
  const result: ScoredProduct[] = [];

  for (const product of sorted) {
    if (result.length >= total) break;

    const count = categoryCounts[product.category] ?? 0;
    if (count >= maxPerCategory) continue;

    categoryCounts[product.category] = count + 1;
    result.push(product);
  }

  return result;
}

// -- 메인 핸들러 --

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  // 환경변수 확인
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({ error: 'Supabase 환경변수가 설정되지 않았습니다' }, 500, req);
  }

  // 요청 파싱
  let skinProfile: SkinProfile;
  try {
    const body = await req.json();
    skinProfile = body.skinProfile;
  } catch {
    return jsonResponse({ error: '잘못된 JSON 요청입니다' }, 400, req);
  }

  // 필수 필드 검증
  if (skinProfile?.melaninIndex == null || !skinProfile?.undertone) {
    return jsonResponse({ error: 'skinProfile에 melaninIndex와 undertone이 필요합니다' }, 400, req);
  }

  // 기본값 보정
  if (!Array.isArray(skinProfile.skinConcerns)) {
    skinProfile.skinConcerns = [];
  }

  // Supabase 클라이언트 생성 및 제품 조회
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: products, error: dbError } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (dbError) {
    return jsonResponse({ error: `데이터베이스 조회 실패: ${dbError.message}` }, 500, req);
  }

  if (!products || products.length === 0) {
    return jsonResponse({ recommendations: [] }, 200, req);
  }

  // 스코어링
  const scored: ScoredProduct[] = (products as DBProduct[]).map((product) => ({
    ...product,
    matchScore: scoreProduct(product, skinProfile),
  }));

  // 다양화
  const recommendations = diversify(scored);

  return jsonResponse({ recommendations }, 200, req);
});
