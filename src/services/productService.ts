import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Product } from '@/types';
import { PRODUCT_CATALOG } from '@/data/productCatalog';

/**
 * Fetch all products. Uses Supabase when configured, falls back to local catalog.
 */
export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return PRODUCT_CATALOG;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('brand');

  if (error || !data?.length) return PRODUCT_CATALOG;

  return data.map((r) => ({
    id: r.id,
    name: r.name,
    brand: r.brand,
    price: r.price,
    priceDisplay: `$${(r.price / 100).toFixed(2)}`,
    desc: r.desc,
    matchScore: r.match_score ?? 0,
    ingredients: r.ingredients ?? [],
    safetyRating: r.safety_rating ?? '',
    category: r.category,
    imageUrl: r.image_url ?? undefined,
    melaninRange: [r.melanin_min ?? 1, r.melanin_max ?? 6],
  }));
}

/**
 * Get a single product by ID.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return PRODUCT_CATALOG.find((p) => p.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return PRODUCT_CATALOG.find((p) => p.id === id) ?? null;

  return {
    id: data.id,
    name: data.name,
    brand: data.brand,
    price: data.price,
    priceDisplay: `$${(data.price / 100).toFixed(2)}`,
    desc: data.desc,
    matchScore: data.match_score ?? 0,
    ingredients: data.ingredients ?? [],
    safetyRating: data.safety_rating ?? '',
    category: data.category,
    imageUrl: data.image_url ?? undefined,
    melaninRange: [data.melanin_min ?? 1, data.melanin_max ?? 6],
  };
}

/**
 * Match AI-recommended products to catalog products.
 * Returns catalog products that best match the AI recommendations by name/brand.
 */
export function matchRecommendedProducts(
  recommendations: { name: string; brand: string }[],
  catalog: Product[]
): Product[] {
  return recommendations.map((rec) => {
    // Exact name+brand match
    const exact = catalog.find(
      (p) => p.name.toLowerCase() === rec.name.toLowerCase() && p.brand.toLowerCase() === rec.brand.toLowerCase()
    );
    if (exact) return exact;

    // Partial name match within same brand
    const brandMatch = catalog.find(
      (p) => p.brand.toLowerCase() === rec.brand.toLowerCase() &&
        (p.name.toLowerCase().includes(rec.name.toLowerCase().split(' ')[0]!) ||
         rec.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]!))
    );
    if (brandMatch) return brandMatch;

    // Brand-only match (fallback)
    return catalog.find((p) => p.brand.toLowerCase() === rec.brand.toLowerCase()) ?? catalog[0]!;
  });
}
