// Product catalog. Each brand lives in its own JSON file in ./brands —
// edit prices, flavors, images or stock there.
const modules = import.meta.glob('./brands/*.json', { eager: true, import: 'default' });

export const BRANDS = Object.values(modules).sort((a, b) => a.order - b.order);

export const CATEGORIES = [
  {
    slug: 'disposable-vapes',
    name: 'Disposable Vapes',
    short: 'Disposables',
    blurb: 'Top brands including Geek Bar, Raz, Tyson & more',
    tagline: 'Premium Collection • Top Brands • Latest Releases',
    description:
      'Browse disposable vapes from Geek Bar, Raz, Foger, Tyson, Oxbar, Airis and more — all in stock at Amazon Bazar in Uncasville, CT.',
    image: '/images/categories/disposable-vapes.webp',
    hero: '/images/heroes/disposable-vapes.webp',
    nicotine: true,
  },
  {
    slug: 'pod-systems',
    name: 'Pod Systems',
    short: 'Pod Systems',
    blurb: 'VUSE, JUUL and premium pod devices',
    tagline: 'Refillable • Advanced Technology • Smooth Performance',
    description: 'Shop VUSE and JUUL pod systems, devices and refill pods at Amazon Bazar in Uncasville, CT.',
    image: '/images/categories/pod-systems.webp',
    hero: '/images/heroes/pod-systems.webp',
    nicotine: true,
  },
  {
    slug: 'nicotine-pouches',
    name: 'Nicotine Pouches',
    short: 'Pouches',
    blurb: 'ZYN, Sesh+, Skoal — tobacco-free options',
    tagline: 'Smoke-Free • Tobacco-Free • Premium Selection',
    description: 'ZYN, Sesh+ and Skoal nicotine pouches in every popular flavor and strength at Amazon Bazar, Uncasville CT.',
    image: '/images/categories/nicotine-pouches.webp',
    hero: '/images/heroes/nicotine-pouches.webp',
    nicotine: true,
  },
  {
    slug: 'cigarettes',
    name: 'Cigarettes',
    short: 'Cigarettes',
    blurb: 'Marlboro, Newport, Pall Mall and more popular brands',
    image: '/images/categories/cigarettes.webp',
  },
  {
    slug: 'cigars',
    name: 'Cigars',
    short: 'Cigars',
    blurb: 'Premium imported and domestic cigars',
    image: '/images/categories/cigars.webp',
  },
  {
    slug: 'accessories',
    name: 'Hookahs & Accessories',
    short: 'Hookahs',
    blurb: 'Hookahs, glass, papers, lighters and essentials',
    image: '/images/categories/accessories.webp',
  },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);

export const getBrand = (slug) => BRANDS.find((b) => b.slug === slug);

export const brandsInCategory = (category) => BRANDS.filter((b) => b.category === category);

/** Path to a brand's page. Cigarettes is a single picker page of its own. */
export const brandPath = (brand) =>
  brand.category === brand.slug ? `/${brand.slug}` : `/${brand.category}/${brand.slug}`;

export const allVariants = (brand) => brand.models.flatMap((m) => m.variants);

/** URL-safe key used in ?model=…&flavor=… links. */
export const toKey = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Link straight to a selected model/flavor on a brand page. */
export function productLink(brand, model, variant) {
  const params = new URLSearchParams();
  if (model && brand.models.length > 1) params.set('model', toKey(model.name));
  if (variant) params.set('flavor', toKey(variant.name));
  const qs = params.toString();
  return brandPath(brand) + (qs ? `?${qs}` : '');
}

/** Find a product by brand slug + model name + flavor name (names are matched loosely). */
export function findProduct(slug, modelName, flavorName) {
  const brand = getBrand(slug);
  if (!brand) return null;
  const model = modelName ? brand.models.find((m) => toKey(m.name) === toKey(modelName)) : brand.models[0];
  if (!model) return null;
  const variant = flavorName ? model.variants.find((v) => toKey(v.name) === toKey(flavorName)) : null;
  if (flavorName && !variant) return null;
  return { brand, model, variant, image: variant?.image || brand.image || brand.cardImage, to: productLink(brand, model, variant) };
}

export function priceRange(brand) {
  const prices = allVariants(brand).map((v) => v.price).filter((p) => typeof p === 'number');
  if (!prices.length) return { min: brand.price, max: brand.price };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export const formatPrice = (n) => `$${Number(n).toFixed(2)}`;

export const variantCount = (brand) => allVariants(brand).length;
