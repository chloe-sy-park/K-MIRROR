import { describe, it, expect } from 'vitest';
import { matchRecommendedProducts } from './productService';
import { PRODUCT_CATALOG } from '@/data/productCatalog';

describe('matchRecommendedProducts', () => {
  it('finds exact name+brand match', () => {
    const firstProduct = PRODUCT_CATALOG[0]!;
    const result = matchRecommendedProducts(
      [{ name: firstProduct.name, brand: firstProduct.brand }],
      PRODUCT_CATALOG
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(firstProduct.id);
  });

  it('falls back to brand match when name differs', () => {
    const firstProduct = PRODUCT_CATALOG[0]!;
    const result = matchRecommendedProducts(
      [{ name: 'Nonexistent Product', brand: firstProduct.brand }],
      PRODUCT_CATALOG
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.brand).toBe(firstProduct.brand);
  });

  it('falls back to first catalog item when nothing matches', () => {
    const result = matchRecommendedProducts(
      [{ name: 'ZZZZZ', brand: 'ZZZZZ' }],
      PRODUCT_CATALOG
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(PRODUCT_CATALOG[0]!.id);
  });

  it('handles multiple recommendations', () => {
    const result = matchRecommendedProducts(
      [
        { name: 'test1', brand: 'HERA' },
        { name: 'test2', brand: 'ROM&ND' },
      ],
      PRODUCT_CATALOG
    );
    expect(result).toHaveLength(2);
  });

  it('handles empty recommendations', () => {
    const result = matchRecommendedProducts([], PRODUCT_CATALOG);
    expect(result).toHaveLength(0);
  });
});
