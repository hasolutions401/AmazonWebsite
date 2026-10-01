import { CATEGORIES, brandsInCategory, brandPath } from './catalog.js';

// Primary navigation, generated from the catalog so new brands appear automatically.
export const NAV = CATEGORIES.map((cat) => {
  const brands = brandsInCategory(cat.slug).filter((b) => b.slug !== cat.slug);
  return {
    label: cat.name,
    to: `/${cat.slug}`,
    items: brands.length ? brands.map((b) => ({ label: b.name, to: brandPath(b) })) : null,
  };
});
