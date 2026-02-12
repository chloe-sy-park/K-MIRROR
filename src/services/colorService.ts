/**
 * Color Rendering Service — Multiply & Screen Blending
 *
 * Simulates how a product color appears on a given skin tone.
 *
 * Multiply blend (default): result = (skin * product) / 255
 * Screen blend (highlighters): result = 255 - ((255 - skin) * (255 - product)) / 255
 *
 * Opacity is scaled by melanin index for deeper tones (L4-L6)
 * to achieve equivalent visual impact.
 */

export type ProductOpacity = 'tint' | 'matte' | 'cushion';
export type BlendMode = 'multiply' | 'screen';

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const BASE_OPACITY: Record<ProductOpacity, number> = {
  tint: 0.40,
  matte: 0.87,
  cushion: 0.55,
};

/**
 * Adjust opacity based on melanin index.
 * Deeper skin tones need higher opacity for equivalent visual impact.
 */
export function melaninAdjustedOpacity(baseOpacity: number, melaninIndex: number): number {
  const boost = Math.max(0, (melaninIndex - 2) * 0.05);
  return Math.min(1, baseOpacity + boost);
}

function multiplyBlend(skin: RGB, product: RGB): RGB {
  return {
    r: (skin.r * product.r) / 255,
    g: (skin.g * product.g) / 255,
    b: (skin.b * product.b) / 255,
  };
}

function screenBlend(skin: RGB, product: RGB): RGB {
  return {
    r: 255 - ((255 - skin.r) * (255 - product.r)) / 255,
    g: 255 - ((255 - skin.g) * (255 - product.g)) / 255,
    b: 255 - ((255 - skin.b) * (255 - product.b)) / 255,
  };
}

function interpolate(base: RGB, target: RGB, opacity: number): RGB {
  return {
    r: base.r + (target.r - base.r) * opacity,
    g: base.g + (target.g - base.g) * opacity,
    b: base.b + (target.b - base.b) * opacity,
  };
}

/**
 * Blend a product color onto a skin color.
 *
 * @param skinHex - User's skin hex (e.g. "#8B6547")
 * @param productHex - Product color hex (e.g. "#FF4D8D")
 * @param type - Product type for opacity ("tint" | "matte" | "cushion")
 * @param melaninIndex - Optional melanin level (1-6) for adaptive opacity
 * @param mode - "multiply" (default) or "screen" (for highlighters/shimmers)
 */
export function renderColorOnSkin(
  skinHex: string,
  productHex: string,
  type: ProductOpacity = 'matte',
  melaninIndex?: number,
  mode: BlendMode = 'multiply'
): string {
  const skin = hexToRgb(skinHex);
  const product = hexToRgb(productHex);

  const baseOpacity = BASE_OPACITY[type];
  const opacity = melaninIndex != null
    ? melaninAdjustedOpacity(baseOpacity, melaninIndex)
    : baseOpacity;

  const blendResult = mode === 'screen'
    ? screenBlend(skin, product)
    : multiplyBlend(skin, product);

  return rgbToHex(interpolate(skin, blendResult, opacity));
}

/**
 * Generate a full swatch set for a product on skin.
 * Returns { tint, matte, cushion } hex values.
 */
export function renderSwatchSet(
  skinHex: string,
  productHex: string,
  melaninIndex?: number
): Record<ProductOpacity, string> {
  return {
    tint: renderColorOnSkin(skinHex, productHex, 'tint', melaninIndex),
    matte: renderColorOnSkin(skinHex, productHex, 'matte', melaninIndex),
    cushion: renderColorOnSkin(skinHex, productHex, 'cushion', melaninIndex),
  };
}
