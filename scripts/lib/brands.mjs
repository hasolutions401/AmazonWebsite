// Read/write helpers for src/data/brands/*.json, shared by the pricing scripts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const BRANDS_DIR = path.join(ROOT, 'src/data/brands');
export const PRICING_DIR = path.join(ROOT, 'tools/pricing');

export function loadBrands() {
  return fs
    .readdirSync(BRANDS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: path.join(BRANDS_DIR, f), data: JSON.parse(fs.readFileSync(path.join(BRANDS_DIR, f), 'utf8')) }))
    .sort((a, b) => a.data.order - b.data.order);
}

export function saveBrand({ file, data }) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

/** "Geek Bar Pulse-X (5%)" -> "geekbarpulsex5" */
export const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');

/** Old static-site page names -> brand slugs (for the legacy spreadsheet's SourcePage column). */
export const LEGACY_PAGES = {
  'cigarettes.html': 'cigarettes',
  'gkp.html': 'geek-bar',
  'foger.html': 'foger',
  'podsalt.html': 'pod-salt',
  'tyson.html': 'tyson',
  'oxbar.html': 'oxbar',
  'upends.html': 'upends',
  'yovo.html': 'yovo',
  'raz.html': 'raz',
  'airis.html': 'airis',
  'viho.html': 'viho',
  'luckywolf.html': 'lucky-wolf',
  'spaceman.html': 'space-man',
  'finestchamp.html': 'finest-champ',
  'sugardaddy.html': 'sugar-daddy',
  'swfticon.html': 'swft-icon',
  'zeronicotine.html': 'zero-nicotine',
  'glamee.html': 'glamee',
  'offstamp.html': 'off-stamp',
  'otherdisposiblevapes.html': 'other-disposable-vapes',
  'funky.html': 'funky',
  'vuse.html': 'vuse',
  'juul.html': 'juul',
  'zyn.html': 'zyn',
  'sesh.html': 'sesh',
  'skoal.html': 'skoal',
};
