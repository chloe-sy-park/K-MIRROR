/**
 * Color Rendering Service — Multiplication Blending
 *
 * Simulates how a product color appears on a given skin tone.
 * Based on the Photoshop Multiply blend mode:
 *   result = (skinColor * productColor) / 255
 *
 * Opacity is applied to simulate different product types:
 *   - Tint/Gloss: 30-50% (skin texture shows through)
 *   - Matte Lip:  80-95% (nearly full coverage)
 *   - Cushion:    40-70% (semi-translucent coverage)
 */

export type ProductOpacity = 'tint' | 'matte' | 'cushion';

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const OPACITY_MAP: Record<ProductOpacity, number> = {
  tint: 0.40,
  matte: 0.87,
  cushion: 0.55,
};

/**
 * Blend a product color onto a skin color using Multiply blending + opacity.
 *
 * @param skinHex - User's skin hex (e.g. "#8B6547")
 * @param productHex - Product color hex (e.g. "#FF4D8D")
 * @param type - Product type for opacity ("tint" | "matte" | "cushion")
 * @returns Rendered hex color as it would appear on the skin
 */
export function renderColorOnSkin(
  skinHex: string,
  productHex: string,
  type: ProductOpacity = 'matte'
): string {
  const skin = hexToRgb(skinHex);
  const product = hexToRgb(productHex);
  const opacity = OPACITY_MAP[type];

  // Multiply blend
  const multiply: RGB = {
    r: (skin.r * product.r) / 255,
    g: (skin.g * product.g) / 255,
    b: (skin.b * product.b) / 255,
  };

  // Interpolate between skin (base) and multiply result by opacity
  const blended: RGB = {
    r: skin.r + (multiply.r - skin.r) * opacity,
    g: skin.g + (multiply.g - skin.g) * opacity,
    b: skin.b + (multiply.b - skin.b) * opacity,
  };

  return rgbToHex(blended);
}

/**
 * Generate a full swatch set for a product on skin.
 * Returns { tint, matte, cushion } hex values.
 */
export function renderSwatchSet(
  skinHex: string,
  productHex: string
): Record<ProductOpacity, string> {
  return {
    tint: renderColorOnSkin(skinHex, productHex, 'tint'),
    matte: renderColorOnSkin(skinHex, productHex, 'matte'),
    cushion: renderColorOnSkin(skinHex, productHex, 'cushion'),
  };
}
