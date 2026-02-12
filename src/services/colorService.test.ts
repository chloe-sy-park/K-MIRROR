import { describe, it, expect } from 'vitest';
import {
  renderColorOnSkin,
  renderSwatchSet,
  hexToRgb,
  rgbToHex,
  melaninAdjustedOpacity,
} from './colorService';

describe('hexToRgb', () => {
  it('parses standard hex', () => {
    expect(hexToRgb('#FF4D8D')).toEqual({ r: 255, g: 77, b: 141 });
  });

  it('parses without hash', () => {
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses white', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex({ r: 255, g: 77, b: 141 })).toBe('#ff4d8d');
  });

  it('converts black', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('clamps values over 255', () => {
    expect(rgbToHex({ r: 300, g: 0, b: 0 })).toBe('#ff0000');
  });

  it('clamps negative values', () => {
    expect(rgbToHex({ r: -10, g: 0, b: 0 })).toBe('#000000');
  });
});

describe('melaninAdjustedOpacity', () => {
  it('returns base opacity for L1-L2', () => {
    expect(melaninAdjustedOpacity(0.4, 1)).toBe(0.4);
    expect(melaninAdjustedOpacity(0.4, 2)).toBe(0.4);
  });

  it('boosts for L3+', () => {
    expect(melaninAdjustedOpacity(0.4, 3)).toBeCloseTo(0.45);
    expect(melaninAdjustedOpacity(0.4, 4)).toBeCloseTo(0.50);
    expect(melaninAdjustedOpacity(0.4, 6)).toBeCloseTo(0.60);
  });

  it('caps at 1.0', () => {
    expect(melaninAdjustedOpacity(0.95, 6)).toBe(1.0);
  });
});

describe('renderColorOnSkin', () => {
  it('returns a hex string', () => {
    const result = renderColorOnSkin('#C8A98B', '#FF4D8D');
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('with matte type produces darker result than tint', () => {
    const matte = hexToRgb(renderColorOnSkin('#C8A98B', '#FF4D8D', 'matte'));
    const tint = hexToRgb(renderColorOnSkin('#C8A98B', '#FF4D8D', 'tint'));
    // Multiply makes colors darker, higher opacity = more blending = darker
    expect(matte.r + matte.g + matte.b).toBeLessThan(tint.r + tint.g + tint.b);
  });

  it('with melaninIndex increases effect for deeper skin', () => {
    const noMelanin = renderColorOnSkin('#8B6547', '#FF4D8D', 'tint');
    const withMelanin = renderColorOnSkin('#8B6547', '#FF4D8D', 'tint', 5);
    expect(noMelanin).not.toBe(withMelanin);
  });

  it('screen blend produces lighter result than multiply', () => {
    const multiply = hexToRgb(renderColorOnSkin('#8B6547', '#FFCC00', 'matte', undefined, 'multiply'));
    const screen = hexToRgb(renderColorOnSkin('#8B6547', '#FFCC00', 'matte', undefined, 'screen'));
    expect(screen.r + screen.g + screen.b).toBeGreaterThan(multiply.r + multiply.g + multiply.b);
  });

  it('black skin + red product multiply produces very dark result', () => {
    const result = hexToRgb(renderColorOnSkin('#1A1A1A', '#FF0000', 'matte'));
    expect(result.r).toBeLessThan(50);
    expect(result.g).toBeLessThan(30);
  });

  it('white skin + product returns close to product color at full opacity', () => {
    const result = hexToRgb(renderColorOnSkin('#FFFFFF', '#FF4D8D', 'matte'));
    // Multiply: 255 * product / 255 = product. With 87% opacity, very close to product.
    expect(result.r).toBeGreaterThan(200);
  });
});

describe('renderSwatchSet', () => {
  it('returns all three types', () => {
    const set = renderSwatchSet('#C8A98B', '#FF4D8D');
    expect(set.tint).toMatch(/^#[0-9a-f]{6}$/);
    expect(set.matte).toMatch(/^#[0-9a-f]{6}$/);
    expect(set.cushion).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('tint < cushion < matte in blend intensity', () => {
    const set = renderSwatchSet('#C8A98B', '#FF4D8D');
    const tintSum = Object.values(hexToRgb(set.tint)).reduce((a, b) => a + b, 0);
    const cushionSum = Object.values(hexToRgb(set.cushion)).reduce((a, b) => a + b, 0);
    const matteSum = Object.values(hexToRgb(set.matte)).reduce((a, b) => a + b, 0);
    // With multiply blend, higher opacity = darker
    expect(tintSum).toBeGreaterThan(cushionSum);
    expect(cushionSum).toBeGreaterThan(matteSum);
  });

  it('accepts melaninIndex parameter', () => {
    const set = renderSwatchSet('#8B6547', '#FF4D8D', 5);
    expect(set.tint).toMatch(/^#[0-9a-f]{6}$/);
  });
});
