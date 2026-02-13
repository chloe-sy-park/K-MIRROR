import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Read the favicon SVG
const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'));

async function generateIcons() {
  // PWA 192x192
  await sharp(faviconSvg)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'pwa-192x192.png'));
  console.log('pwa-192x192.png');

  // PWA 512x512
  await sharp(faviconSvg)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'pwa-512x512.png'));
  console.log('pwa-512x512.png');

  // og:image 1200x630
  // Create a larger SVG for the og-image with branding text
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#0F0F0F"/>
    <text x="600" y="280" font-family="Arial,Helvetica,sans-serif" font-size="200" font-weight="900" fill="#FF4D8D" text-anchor="middle" font-style="italic">K</text>
    <text x="600" y="380" font-family="Arial,Helvetica,sans-serif" font-size="36" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="12">K-MIRROR AI</text>
    <text x="600" y="430" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="400" fill="#666666" text-anchor="middle" letter-spacing="6">GLOBAL K-BEAUTY STYLIST</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(join(publicDir, 'og-image.png'));
  console.log('og-image.png (1200x630)');
}

generateIcons().then(() => console.log('\nAll icons generated!')).catch(console.error);
