import { describe, it, expect } from 'vitest';
import {
  scoreMelanin,
  scoreUndertone,
  scoreSkinType,
  scoreConcerns,
  scoreIngredients,
  scoreSafety,
  scoreProduct,
  diversify,
  type DBProduct,
} from './scoringService';
import type { SkinProfile } from '@/types';

// -- 테스트용 헬퍼 --

function makeProduct(overrides: Partial<DBProduct> = {}): DBProduct {
  return {
    melanin_min: 2,
    melanin_max: 4,
    undertones: ['Warm'],
    skin_types: ['oily'],
    concerns: ['acne'],
    ingredients: ['niacinamide', 'tea tree'],
    safety_rating: 'EWG Green',
    category: 'skincare',
    ...overrides,
  };
}

function makeProfile(overrides: Partial<SkinProfile> = {}): SkinProfile {
  return {
    melaninIndex: 3,
    undertone: 'Warm',
    skinHexCode: '#C68642',
    skinConcerns: ['acne'],
    description: 'Test profile',
    skinType: 'oily',
    sensitivityLevel: 3,
    ...overrides,
  };
}

// -- scoreMelanin --

describe('scoreMelanin', () => {
  it('center match: melanin이 범위 정중앙이면 25점', () => {
    const product = makeProduct({ melanin_min: 2, melanin_max: 4 });
    expect(scoreMelanin(product, 3)).toBe(25);
  });

  it('in-range: 범위 안이지만 중앙이 아니면 18점', () => {
    const product = makeProduct({ melanin_min: 2, melanin_max: 4 });
    expect(scoreMelanin(product, 2)).toBe(18);
  });

  it('boundary: 범위에서 ±1 벗어나면 10점', () => {
    const product = makeProduct({ melanin_min: 2, melanin_max: 4 });
    expect(scoreMelanin(product, 5)).toBe(10);
    expect(scoreMelanin(product, 1)).toBe(10);
  });

  it('far: 범위에서 멀리 벗어나면 0점', () => {
    const product = makeProduct({ melanin_min: 2, melanin_max: 4 });
    expect(scoreMelanin(product, 6)).toBe(0);
  });
});

// -- scoreUndertone --

describe('scoreUndertone', () => {
  it('exact match: 정확히 일치하면 15점', () => {
    const product = makeProduct({ undertones: ['Warm', 'Cool'] });
    expect(scoreUndertone(product, 'Warm')).toBe(15);
  });

  it('Neutral fallback: 제품 undertones에 Neutral이 포함되면 7점', () => {
    const product = makeProduct({ undertones: ['Neutral'] });
    expect(scoreUndertone(product, 'Warm')).toBe(7);
  });

  it('no match: 일치하지 않으면 0점', () => {
    const product = makeProduct({ undertones: ['Cool'] });
    expect(scoreUndertone(product, 'Warm')).toBe(0);
  });
});

// -- scoreSkinType --

describe('scoreSkinType', () => {
  it('exact match: 정확히 일치하면 15점', () => {
    const product = makeProduct({ skin_types: ['oily', 'combination'] });
    expect(scoreSkinType(product, 'oily')).toBe(15);
  });

  it('normal fallback: 제품이 normal을 지원하면 7점', () => {
    const product = makeProduct({ skin_types: ['normal', 'dry'] });
    expect(scoreSkinType(product, 'oily')).toBe(7);
  });

  it('no match: 일치하지 않으면 0점', () => {
    const product = makeProduct({ skin_types: ['dry'] });
    expect(scoreSkinType(product, 'oily')).toBe(0);
  });

  it('unknown skin type: skinType이 undefined이면 7점', () => {
    const product = makeProduct({ skin_types: ['oily'] });
    expect(scoreSkinType(product, undefined)).toBe(7);
  });

  it('제품에 skin_types가 없으면 7점', () => {
    const product = makeProduct({ skin_types: undefined });
    expect(scoreSkinType(product, 'oily')).toBe(7);
  });
});

// -- scoreConcerns --

describe('scoreConcerns', () => {
  it('per-match: 하나 일치하면 5점', () => {
    const product = makeProduct({ concerns: ['acne', 'dryness'] });
    expect(scoreConcerns(product, ['acne'])).toBe(5);
  });

  it('cap at 10: 3개 이상 일치해도 최대 10점', () => {
    const product = makeProduct({ concerns: ['acne', 'dryness', 'aging'] });
    expect(scoreConcerns(product, ['acne', 'dryness', 'aging'])).toBe(10);
  });

  it('no overlap: 겹치는 게 없으면 0점', () => {
    const product = makeProduct({ concerns: ['acne'] });
    expect(scoreConcerns(product, ['dryness'])).toBe(0);
  });

  it('빈 concerns 배열이면 0점', () => {
    const product = makeProduct({ concerns: [] });
    expect(scoreConcerns(product, ['acne'])).toBe(0);
  });
});

// -- scoreIngredients --

describe('scoreIngredients', () => {
  it('beneficial: 관심사에 유익한 성분이 있으면 양수 점수', () => {
    const product = makeProduct({ ingredients: ['niacinamide', 'tea tree'] });
    const score = scoreIngredients(product, ['acne']);
    expect(score).toBeGreaterThan(0);
  });

  it('irritant: 자극 성분이 있으면 감점', () => {
    const product = makeProduct({ ingredients: ['fragrance', 'alcohol'] });
    const score = scoreIngredients(product, ['acne']);
    expect(score).toBeLessThan(0);
  });

  it('빈 ingredients이면 0점', () => {
    const product = makeProduct({ ingredients: [] });
    expect(scoreIngredients(product, ['acne'])).toBe(0);
  });

  it('beneficial 최대 12점 캡', () => {
    // 다양한 유익 성분으로 최대치 테스트
    const product = makeProduct({
      ingredients: ['salicylic acid', 'tea tree', 'niacinamide', 'centella asiatica', 'zinc'],
    });
    const score = scoreIngredients(product, ['acne']);
    expect(score).toBeLessThanOrEqual(12);
  });

  it('ingredients가 undefined이면 0점', () => {
    const product = makeProduct({ ingredients: undefined });
    expect(scoreIngredients(product, ['acne'])).toBe(0);
  });
});

// -- scoreSafety --

describe('scoreSafety', () => {
  it('EWG Green + 높은 민감도(>=4)가 낮은 민감도보다 높은 점수', () => {
    const product = makeProduct({ safety_rating: 'EWG Green' });
    const highSens = scoreSafety(product, 5);
    const lowSens = scoreSafety(product, 1);
    expect(highSens).toBeGreaterThan(lowSens);
  });

  it('EWG Red이면 음수 점수', () => {
    const product = makeProduct({ safety_rating: 'EWG Red' });
    const score = scoreSafety(product, 3);
    expect(score).toBeLessThan(0);
  });

  it('Vegan이면 EWG Green보다 약간 낮은 기본 점수', () => {
    const greenProduct = makeProduct({ safety_rating: 'EWG Green' });
    const veganProduct = makeProduct({ safety_rating: 'Vegan' });
    const greenScore = scoreSafety(greenProduct, 3);
    const veganScore = scoreSafety(veganProduct, 3);
    expect(greenScore).toBeGreaterThanOrEqual(veganScore);
  });

  it('EWG Yellow이면 낮은 양수 점수', () => {
    const product = makeProduct({ safety_rating: 'EWG Yellow' });
    const score = scoreSafety(product, 3);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(15);
  });
});

// -- scoreProduct --

describe('scoreProduct', () => {
  it('모든 점수를 합산한 숫자를 반환', () => {
    const product = makeProduct();
    const profile = makeProfile();
    const score = scoreProduct(product, profile);
    expect(typeof score).toBe('number');
  });

  it('점수가 0 이상', () => {
    const product = makeProduct();
    const profile = makeProfile();
    const score = scoreProduct(product, profile);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('이론적 최대값(~120) 이하', () => {
    // 완벽하게 매칭되는 제품 + 높은 민감도
    const product = makeProduct({
      melanin_min: 3,
      melanin_max: 3,
      undertones: ['Warm'],
      skin_types: ['oily'],
      concerns: ['acne', 'dryness'],
      ingredients: ['niacinamide', 'salicylic acid', 'tea tree'],
      safety_rating: 'EWG Green',
    });
    const profile = makeProfile({
      melaninIndex: 3,
      undertone: 'Warm',
      skinType: 'oily',
      skinConcerns: ['acne', 'dryness'],
      sensitivityLevel: 5,
    });
    const score = scoreProduct(product, profile);
    expect(score).toBeLessThanOrEqual(120);
  });
});

// -- diversify --

describe('diversify', () => {
  it('카테고리당 최대 개수를 제한', () => {
    const products: DBProduct[] = [
      makeProduct({ category: 'skincare', id: '1' }),
      makeProduct({ category: 'skincare', id: '2' }),
      makeProduct({ category: 'skincare', id: '3' }),
      makeProduct({ category: 'lip', id: '4' }),
    ];
    // 점수가 높은 순으로 정렬된 scored 배열 시뮬레이션
    const scored = products.map((p, i) => ({ ...p, _score: 100 - i * 10 }));
    const result = diversify(scored, 2, 6);
    const skincareCount = result.filter((p) => p.category === 'skincare').length;
    expect(skincareCount).toBeLessThanOrEqual(2);
  });

  it('총 개수 제한을 준수', () => {
    const products = Array.from({ length: 20 }, (_, i) =>
      makeProduct({ category: i % 2 === 0 ? 'skincare' : 'lip', id: String(i) }),
    );
    const scored = products.map((p, i) => ({ ...p, _score: 100 - i }));
    const result = diversify(scored, 2, 6);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('기본값 사용: maxPerCategory=2, total=6', () => {
    const products = Array.from({ length: 10 }, (_, i) =>
      makeProduct({ category: 'skincare', id: String(i) }),
    );
    const scored = products.map((p, i) => ({ ...p, _score: 100 - i }));
    const result = diversify(scored);
    expect(result.length).toBeLessThanOrEqual(6);
    expect(result.length).toBeLessThanOrEqual(2); // 카테고리가 하나뿐이므로 최대 2개
  });

  it('빈 배열이면 빈 배열 반환', () => {
    const result = diversify([]);
    expect(result).toEqual([]);
  });
});
