// Shrinks oversized images in public/images in place.
// Usage: npm run optimize-images   (safe to re-run; only rewrites when it saves >10%)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/images');
const MAX_SIDE = 1600;
const MIN_BYTES = 150 * 1024;

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

let before = 0;
let after = 0;
for (const file of walk(dir).filter((f) => /\.(webp|jpe?g|png)$/i.test(f))) {
  const size = fs.statSync(file).size;
  if (size < MIN_BYTES) continue;
  const input = fs.readFileSync(file);
  const out = await sharp(input)
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toBuffer();
  if (out.length < size * 0.9) {
    // Keep the original extension/path so nothing that links to it breaks
    fs.writeFileSync(file, out);
    before += size;
    after += out.length;
    console.log(`${path.relative(dir, file)}: ${(size / 1024) | 0}KB -> ${(out.length / 1024) | 0}KB`);
  }
}
console.log(`saved ${((before - after) / 1024 / 1024).toFixed(1)} MB`);
