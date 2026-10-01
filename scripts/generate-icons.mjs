// Builds the app / home-screen icons in public/icons from public/images/logo.webp.
// Run again after changing the logo: node scripts/generate-icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logo = path.join(root, 'public/images/logo.webp');
const outDir = path.join(root, 'public/icons');
fs.mkdirSync(outDir, { recursive: true });

// Navy tile with a soft blue glow, matching the site theme
const background = (size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs><radialGradient id="g" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="#0e4aa8" stop-opacity="0.85"/>
      <stop offset="0.55" stop-color="#0b1a3a"/>
      <stop offset="1" stop-color="#0b1120"/>
    </radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`);

async function icon(file, size, logoWidthRatio) {
  const logoBuf = await sharp(logo).resize({ width: Math.round(size * logoWidthRatio) }).png().toBuffer();
  await sharp(background(size))
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, file));
  console.log('wrote', path.relative(root, path.join(outDir, file)));
}

await icon('icon-192.png', 192, 0.86);
await icon('icon-512.png', 512, 0.86);
await icon('maskable-512.png', 512, 0.66); // stays inside the safe zone when cropped to a circle
await icon('apple-touch-icon.png', 180, 0.84);
await icon('favicon-32.png', 32, 0.94);
