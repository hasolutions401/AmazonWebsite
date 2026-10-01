// schema.org structured data (helps Google show rich results).
import { SITE } from './site.js';
import { allVariants, brandPath, priceRange } from './catalog.js';

export const storeSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'TobaccoStore',
  '@id': `${SITE.url}/#store`,
  name: SITE.name,
  url: SITE.url,
  image: SITE.url + SITE.logo,
  logo: SITE.url + SITE.logo,
  telephone: SITE.phoneIntl,
  priceRange: '$$',
  hasMap: SITE.mapsUrl,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.zip,
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  areaServed: ['Uncasville', 'Montville', 'Norwich', 'New London'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: SITE.hours.opens,
      closes: SITE.hours.closes,
    },
  ],
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: SITE.url + item.to,
  })),
});

export function productSchema(brand) {
  const { min, max } = priceRange(brand);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: brand.title,
    brand: { '@type': 'Brand', name: brand.name },
    description: brand.description,
    image: SITE.url + (brand.image || brand.cardImage),
    url: SITE.url + brandPath(brand),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: min.toFixed(2),
      highPrice: max.toFixed(2),
      offerCount: allVariants(brand).length,
      availability: 'https://schema.org/InStoreOnly',
      seller: { '@id': `${SITE.url}/#store` },
    },
  };
}

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});
