// ─── Store promotions ─────────────────────────────────────────────────────
// Edit this file to change what the home page highlights. Products are picked
// by brand slug + model name + flavor name (exactly as shown on the site).

/** Shown on the home page until `ends` (inclusive). Set to null to hide. */
export const DEAL_OF_THE_WEEK = {
  kicker: 'DEAL OF THE WEEK',
  title: 'Buy 2 Vapes,',
  highlight: 'Get 1 FREE',
  body: 'Mix and match select disposable lines. Ask in-store for current eligible products.',
  ends: '2026-10-11', // YYYY-MM-DD
  cta: { label: 'Shop Disposables', to: '/disposable-vapes' },
};

/** Used when the deal of the week has expired (or is null). */
export const EVERGREEN_DEAL = {
  kicker: 'IN-STORE SPECIAL',
  title: 'Best Prices',
  highlight: 'in Montville',
  body: 'Fresh deals on disposables, glass, cigars and accessories every week. Stop by or call to ask what’s on special.',
  cta: { label: 'Call for Today’s Deals', href: 'tel:+18608482345' },
};

/** Home page "New Arrivals" row — newest first. */
export const NEW_ARRIVALS = [
  { brand: 'geek-bar', model: 'Geek Bar Pulse X', flavor: 'Sour Straws' },
  { brand: 'raz', model: 'Raz RYL', flavor: 'Peach Baddie' },
  { brand: 'viho', model: 'Viho TRX 50k', flavor: 'Blue Razz Ice' },
  { brand: 'oxbar', model: 'OXBAR 35K', flavor: 'Peach Ringz' },
  { brand: 'foger', model: 'Foger Switch Pro Kit', flavor: 'Gummy Bear' },
  { brand: 'off-stamp', model: 'Off Stamp', flavor: 'Juicy Peach' },
  { brand: 'space-man', model: 'Spaceman Smart Screen 20K', flavor: 'Dark Grapefruit' },
  { brand: 'tyson', model: 'Tyson Legend 30K Hits', flavor: 'Frozen Mango' },
];

/** Small labels on brand cards, e.g. { raz: 'New', 'geek-bar': 'Best Seller' }. */
export const BRAND_BADGES = {
  'geek-bar': 'Best Seller',
  raz: 'Hot',
  viho: 'New',
  zyn: 'Best Seller',
};
