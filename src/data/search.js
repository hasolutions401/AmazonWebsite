// Client-side search over every brand, model and flavor on the site.
import { BRANDS, CATEGORIES, brandPath, productLink } from './catalog.js';
import { CIGAR_LINEUP } from './galleries.js';

const normalize = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9.%]+/g, ' ')
    .trim();

function buildIndex() {
  const entries = [];
  const add = (entry) => entries.push({ ...entry, haystack: normalize([entry.title, entry.subtitle, entry.extra].join(' ')) });

  CATEGORIES.forEach((c) =>
    add({ type: 'Category', title: c.name, subtitle: c.blurb, to: `/${c.slug}`, image: c.image, rank: 0 }),
  );

  BRANDS.forEach((brand) => {
    const isPicker = brand.slug === brand.category; // cigarettes page lists brands as "models"
    if (!isPicker) {
      add({
        type: 'Brand',
        title: brand.name,
        subtitle: brand.title,
        to: brandPath(brand),
        image: brand.cardImage,
        extra: brand.models.map((m) => m.name).join(' '),
        rank: 1,
      });
    }
    brand.models.forEach((model) => {
      if (brand.models.length > 1) {
        add({
          type: isPicker ? 'Brand' : 'Model',
          title: model.name,
          subtitle: isPicker ? brand.name : `${brand.name} · ${model.variants.length} flavors`,
          to: productLink(brand, model),
          image: model.variants.find((v) => v.image)?.image || brand.cardImage,
          rank: isPicker ? 1 : 2,
        });
      }
      model.variants.forEach((v) =>
        add({
          type: brand.variantLabel || 'Flavor',
          title: v.name,
          subtitle: brand.models.length > 1 ? model.name : brand.name,
          to: productLink(brand, model, v),
          image: v.image || brand.image || brand.cardImage,
          price: v.price,
          inStock: v.inStock,
          extra: brand.name,
          rank: 3,
        }),
      );
    });
  });

  CIGAR_LINEUP.forEach((c) =>
    add({ type: 'Cigar', title: c.name, subtitle: `${c.type} cigar · in store`, to: '/cigars', extra: 'cigar cigars', rank: 2 }),
  );

  [
    ['Hookahs', 'Hookahs, shisha & accessories', 'hookah shisha'],
    ['Glass Pipes', 'Glass pipes, bongs & rigs', 'glass bong rig pipe'],
    ['Rolling Papers', 'Papers, wraps & lighters', 'papers wraps lighter grinder'],
  ].forEach(([title, subtitle, extra]) =>
    add({ type: 'Accessories', title, subtitle, to: '/accessories', image: '/images/categories/accessories.webp', extra, rank: 1 }),
  );

  return entries;
}

let index = null;

/** Every query word must appear; results that start with the query rank first. */
export function search(query, limit = 30) {
  const q = normalize(query);
  if (!q) return [];
  index ??= buildIndex();
  const words = q.split(' ');
  const results = [];
  for (const entry of index) {
    if (!words.every((w) => entry.haystack.includes(w))) continue;
    const title = normalize(entry.title);
    let score = entry.rank * 10;
    if (title === q) score -= 40;
    else if (title.startsWith(q)) score -= 25;
    else if (title.split(' ').some((t) => t.startsWith(words[0]))) score -= 12;
    if (entry.inStock === false) score += 5;
    results.push({ entry, score });
  }
  return results
    .sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((r) => r.entry);
}

export const POPULAR_SEARCHES = ['Geek Bar', 'Raz', 'ZYN', 'Blue Razz', 'Watermelon', 'Mint', 'Marlboro', 'Hookah'];
