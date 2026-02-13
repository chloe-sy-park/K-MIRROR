/**
 * 제품 스코어링 엔진
 *
 * 피부 프로필과 제품 속성을 매칭하여 가중 점수를 산출한다.
 * 총 ~100점 만점 (안전성 × 민감도 배수로 이론적 최대 ~120점).
 */

import type { SkinProfile } from '@/types';

// -- 타입 --

export interface DBProduct {
  id?: string;
  melanin_min: number;
  melanin_max: number;
  undertones: string[];
  skin_types?: string[];
  concerns?: string[];
  ingredients?: string[];
  safety_rating?: string;
  category: string;
  [key: string]: unknown;
}

export interface ScoredProduct extends DBProduct {
  _score: number;
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

// -- 스코어링 함수 --

/**
 * 멜라닌 지수 매칭 점수 (최대 25점)
 *
 * center(정중앙)=25, in-range=18, boundary(±1)=10, far=0
 */
export function scoreMelanin(product: DBProduct, melaninIndex: number): number {
  const { melanin_min, melanin_max } = product;
  const center = (melanin_min + melanin_max) / 2;

  if (melaninIndex === center) return MELANIN_CENTER;
  if (melaninIndex >= melanin_min && melaninIndex <= melanin_max) return MELANIN_IN_RANGE;
  if (melaninIndex >= melanin_min - 1 && melaninIndex <= melanin_max + 1) return MELANIN_BOUNDARY;
  return 0;
}

/**
 * 언더톤 매칭 점수 (최대 15점)
 *
 * exact=15, Neutral fallback=7, no match=0
 */
export function scoreUndertone(product: DBProduct, undertone: SkinProfile['undertone']): number {
  const tones = product.undertones;
  if (tones.includes(undertone)) return UNDERTONE_EXACT;
  if (tones.includes('Neutral')) return UNDERTONE_NEUTRAL;
  return 0;
}

/**
 * 피부 타입 매칭 점수 (최대 15점)
 *
 * exact=15, normal fallback=7, unknown=7, no match=0
 */
export function scoreSkinType(product: DBProduct, skinType: SkinProfile['skinType']): number {
  const types = product.skin_types;

  // 제품에 skin_types가 없거나 사용자 skinType이 미정이면 fallback
  if (!types?.length || skinType == null) return SKIN_TYPE_FALLBACK;

  if (types.includes(skinType)) return SKIN_TYPE_EXACT;
  if (types.includes('normal')) return SKIN_TYPE_FALLBACK;
  return 0;
}

/**
 * 피부 고민 매칭 점수 (최대 10점)
 *
 * 일치 1개당 5점, 최대 10점
 */
export function scoreConcerns(product: DBProduct, concerns: string[]): number {
  const productConcerns = product.concerns ?? [];
  const matches = concerns.filter((c) => productConcerns.includes(c)).length;
  return Math.min(matches * CONCERN_PER_MATCH, CONCERN_MAX);
}

/**
 * 성분 매칭 점수 (유익 최대 12점, 자극 성분당 -4점)
 *
 * 사용자 관심사에 유익한 성분이 포함되면 +5 (최대 12),
 * 자극 성분이 포함되면 -4점씩 감점.
 */
export function scoreIngredients(product: DBProduct, concerns: string[]): number {
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

/**
 * 안전성 점수 (민감도 배수 적용, 기본 최대 15점)
 *
 * EWG Green=15, Vegan=13, Yellow=5, Red=-5
 * 민감도에 따른 배수: >=4 -> x1.5, >=3 -> x1.0, 그 외 -> x0.7
 */
export function scoreSafety(product: DBProduct, sensitivityLevel?: number): number {
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

/**
 * 종합 점수 산출
 *
 * 모든 개별 점수를 합산하여 최종 점수를 반환한다.
 * 음수인 경우 0으로 바닥 처리.
 */
export function scoreProduct(product: DBProduct, skinProfile: SkinProfile): number {
  const melanin = scoreMelanin(product, skinProfile.melaninIndex);
  const undertone = scoreUndertone(product, skinProfile.undertone);
  const skinType = scoreSkinType(product, skinProfile.skinType);
  const concerns = scoreConcerns(product, skinProfile.skinConcerns);
  const ingredients = scoreIngredients(product, skinProfile.skinConcerns);
  const safety = scoreSafety(product, skinProfile.sensitivityLevel);

  return Math.max(0, melanin + undertone + skinType + concerns + ingredients + safety);
}

/**
 * 카테고리 다양화 선별
 *
 * 점수 순으로 정렬된 제품 목록에서 카테고리당 최대 maxPerCategory개,
 * 총 total개까지 선별한다.
 */
export function diversify(
  scored: ScoredProduct[],
  maxPerCategory: number = 2,
  total: number = 6,
): DBProduct[] {
  const sorted = [...scored].sort((a, b) => b._score - a._score);
  const categoryCounts: Record<string, number> = {};
  const result: DBProduct[] = [];

  for (const product of sorted) {
    if (result.length >= total) break;

    const count = categoryCounts[product.category] ?? 0;
    if (count >= maxPerCategory) continue;

    categoryCounts[product.category] = count + 1;
    result.push(product);
  }

  return result;
}
