/**
 * Client-side image processing — resize + compress before upload.
 * Uses Canvas API to limit max dimension to 1024px and compress to JPEG 0.85.
 */

export interface ProcessedImage {
  base64: string;    // header-free pure base64
  mimeType: string;  // 'image/jpeg' | 'image/png' | 'image/webp'
  width: number;
  height: number;
}

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.85;
const OUTPUT_MIME = 'image/jpeg';

/**
 * Load a File as an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Process an image file: resize to max 1024px on longest side + compress.
 * Always outputs JPEG for consistency and smaller payload.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const img = await loadImage(file);

  let { width, height } = img;

  // Scale down if either dimension exceeds MAX_DIMENSION
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL(OUTPUT_MIME, JPEG_QUALITY);
  const base64 = dataUrl.split(',')[1] ?? '';

  return {
    base64,
    mimeType: OUTPUT_MIME,
    width,
    height,
  };
}
