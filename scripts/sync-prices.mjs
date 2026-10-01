// Updates prices (and optionally stock) in src/data/brands/*.json from a spreadsheet.
//
//   npm run sync-prices                      -> uses tools/pricing/prices.xlsx
//   npm run sync-prices -- path/to/file.xlsx
//   npm run sync-prices -- --dry             -> show what would change, write nothing
//
// Understands the sheet made by `npm run export-prices` (Brand Slug / Model / Item / Price / In Stock)
// and the old format (Category / Brand / ItemName / Price / SourcePage).
import fs from 'node:fs';
import path from 'node:path';
import readXlsxFile from 'read-excel-file/node';
import { LEGACY_PAGES, PRICING_DIR, loadBrands, norm, saveBrand } from './lib/brands.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const verbose = args.includes('--verbose');
const file = path.resolve(args.find((a) => !a.startsWith('--')) ?? path.join(PRICING_DIR, 'prices.xlsx'));
if (!fs.existsSync(file)) {
  console.error(`Spreadsheet not found: ${file}\nRun "npm run export-prices" to create one.`);
  process.exit(1);
}

const [{ data: sheet }] = await readXlsxFile(file);
const header = sheet[0].map((h) => norm(h));
const col = (...names) => header.findIndex((h) => names.includes(h));
const C = {
  category: col('category'),
  brand: col('brand', 'brandname'),
  slug: col('brandslug', 'slug'),
  model: col('model'),
  item: col('item', 'itemname', 'flavor', 'variant'),
  price: col('price'),
  stock: col('instock', 'stock'),
  page: col('sourcepage'),
};
if (C.item < 0 || C.price < 0) {
  console.error('The first row must contain at least an "Item" and a "Price" column.');
  process.exit(1);
}

const brands = loadBrands();
const bySlug = Object.fromEntries(brands.map((b) => [b.data.slug, b]));

function findBrand(row) {
  const cell = (i) => (i >= 0 ? row[i] : null);
  if (cell(C.slug) && bySlug[cell(C.slug)]) return bySlug[cell(C.slug)];
  const page = String(cell(C.page) ?? '').trim().toLowerCase();
  if (LEGACY_PAGES[page]) return bySlug[LEGACY_PAGES[page]];
  if (norm(cell(C.category)).startsWith('cig')) return bySlug.cigarettes;
  // Fuzzy: the brand whose name/title/model names best match the Brand cell
  const text = norm(cell(C.brand));
  let best = null;
  let bestLen = 0;
  for (const b of brands) {
    for (const name of [b.data.name, b.data.title, ...b.data.models.map((m) => m.name)]) {
      const n = norm(name);
      if (n.length > bestLen && (text.includes(n) || n.includes(text))) {
        best = b;
        bestLen = n.length;
      }
    }
  }
  return best;
}

/** Length of the longest common substring — "airisbeast4kpuffs" vs "airisbeast4000" -> 11 */
function overlap(a, b) {
  let best = 0;
  const prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let diag = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? diag + 1 : 0;
      if (prev[j] > best) best = prev[j];
      diag = tmp;
    }
  }
  return best;
}

function findVariant(brand, row) {
  const item = norm(row[C.item]);
  const hint = norm([C.model >= 0 ? row[C.model] : '', C.brand >= 0 ? row[C.brand] : ''].join(' '));
  let models = brand.data.models;
  if (C.model >= 0 && row[C.model]) {
    const exact = models.filter((m) => norm(m.name) === norm(row[C.model]));
    if (exact.length) models = exact;
  }
  const candidates = [];
  for (const model of models) {
    const prefix = norm(model.name);
    for (const variant of model.variants) {
      const v = norm(variant.name);
      // "ZYN Cool Mint" should match "Cool Mint" and vice versa
      if (v === item || v === norm(brand.data.name) + item || item === norm(brand.data.name) + v) {
        candidates.push({ model, variant, score: overlap(hint, prefix) });
      }
    }
  }
  if (candidates.length <= 1) return candidates[0] ?? null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].score > candidates[1].score ? candidates[0] : 'ambiguous';
}

const parseStock = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'boolean') return v;
  return !/^(no|n|false|0|out|out of stock|sold out)$/i.test(String(v).trim());
};

const changes = [];
const problems = [];
const touched = new Set();
const seen = new Set();

for (const [i, row] of sheet.slice(1).entries()) {
  const line = i + 2;
  if (!row[C.item] && !row[C.price]) continue;
  const label = [C.brand >= 0 ? row[C.brand] : row[C.slug], row[C.item]].filter(Boolean).join(' / ');
  const price = Number(String(row[C.price]).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(price) || price <= 0) {
    problems.push(`row ${line}: "${label}" has no valid price (${row[C.price]})`);
    continue;
  }
  const brand = findBrand(row);
  if (!brand) {
    problems.push(`row ${line}: no brand found for "${label}"`);
    continue;
  }
  const hit = findVariant(brand, row);
  if (hit === 'ambiguous') {
    problems.push(`row ${line}: "${label}" matches several models in ${brand.data.slug} — add a Model column`);
    continue;
  }
  if (!hit) {
    problems.push(`row ${line}: "${label}" not found in ${brand.data.slug}.json`);
    continue;
  }
  const { model, variant } = hit;
  if (seen.has(variant)) {
    problems.push(`row ${line}: "${label}" is a duplicate — ${model.name} › ${variant.name} was already set by an earlier row`);
    continue;
  }
  seen.add(variant);
  const rounded = Math.round(price * 100) / 100;
  if (variant.price !== rounded) {
    changes.push(`${brand.data.slug} › ${model.name} › ${variant.name}: $${variant.price.toFixed(2)} → $${rounded.toFixed(2)}`);
    variant.price = rounded;
    touched.add(brand);
  }
  const stock = C.stock >= 0 ? parseStock(row[C.stock]) : undefined;
  if (stock !== undefined && stock !== variant.inStock) {
    changes.push(`${brand.data.slug} › ${model.name} › ${variant.name}: ${stock ? 'back in stock' : 'OUT OF STOCK'}`);
    variant.inStock = stock;
    touched.add(brand);
  }
}

const notInSheet = brands.flatMap((b) =>
  b.data.models.flatMap((m) => m.variants.filter((v) => !seen.has(v)).map((v) => `${b.data.slug} › ${m.name} › ${v.name}`)),
);

console.log(`\nSpreadsheet: ${path.relative(process.cwd(), file)} (${sheet.length - 1} rows)\n`);
console.log(changes.length ? `${changes.length} change(s):\n  ${changes.join('\n  ')}` : 'No price changes.');
if (problems.length) console.log(`\n${problems.length} row(s) skipped:\n  ${problems.join('\n  ')}`);
console.log(`\n${notInSheet.length} product(s) on the site are not in the sheet (prices unchanged).`);
if (verbose && notInSheet.length) console.log('  ' + notInSheet.join('\n  '));

if (dry) {
  console.log('\nDry run — nothing was written.');
} else if (touched.size) {
  touched.forEach(saveBrand);
  console.log(`\nUpdated ${touched.size} brand file(s). Rebuild the site to publish.`);
}
