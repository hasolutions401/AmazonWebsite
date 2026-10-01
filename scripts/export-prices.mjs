// Writes every product on the site to tools/pricing/prices.xlsx.
// Edit prices / "In Stock" in Excel, then run `npm run sync-prices`.
import fs from 'node:fs';
import path from 'node:path';
import writeXlsxFile from 'write-excel-file/node';
import { PRICING_DIR, loadBrands } from './lib/brands.mjs';

const out = path.resolve(process.argv[2] ?? path.join(PRICING_DIR, 'prices.xlsx'));
const CATEGORY = {
  'disposable-vapes': 'Disposable Vapes',
  'pod-systems': 'Pod Systems',
  'nicotine-pouches': 'Nicotine Pouches',
  cigarettes: 'Cigarettes',
};

const bold = (value) => ({ value, fontWeight: 'bold', backgroundColor: '#DCEBFF' });
const rows = [['Category', 'Brand', 'Brand Slug', 'Model', 'Item', 'Price', 'In Stock'].map(bold)];

for (const { data: brand } of loadBrands()) {
  for (const model of brand.models) {
    for (const v of model.variants) {
      rows.push([
        { value: CATEGORY[brand.category] ?? brand.category },
        { value: brand.name },
        { value: brand.slug },
        { value: model.name },
        { value: v.name },
        { value: v.price, type: Number, format: '0.00' },
        { value: v.inStock ? 'Yes' : 'No' },
      ]);
    }
  }
}

fs.mkdirSync(path.dirname(out), { recursive: true });
await writeXlsxFile(rows, {
  columns: [{ width: 18 }, { width: 20 }, { width: 22 }, { width: 30 }, { width: 34 }, { width: 10 }, { width: 10 }],
  stickyRowsCount: 1,
}).toFile(out);
console.log(`Wrote ${rows.length - 1} products to ${path.relative(process.cwd(), out)}`);
console.log('Change "Price" or "In Stock" (Yes/No), save, then run: npm run sync-prices');
