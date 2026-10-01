import { Link, useParams } from 'react-router';
import BrandCard from '../components/product/BrandCard.jsx';
import ProductView from '../components/product/ProductView.jsx';
import Seo from '../components/Seo.jsx';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import {
  brandPath,
  brandsInCategory,
  formatPrice,
  getBrand,
  getCategory,
  priceRange,
  variantCount,
} from '../data/catalog.js';
import { breadcrumbSchema, productSchema } from '../data/schema.js';
import { NICOTINE_WARNING } from '../data/site.js';
import NotFoundPage from './NotFoundPage.jsx';
import './ProductPage.css';

export default function ProductPage() {
  const { category: catSlug, brand: brandSlug } = useParams();
  const brand = getBrand(brandSlug);
  const category = getCategory(catSlug);
  if (!brand || !category || brand.category !== catSlug) return <NotFoundPage />;

  const crumbs = [
    { name: 'Home', to: '/' },
    { name: category.name, to: `/${category.slug}` },
    { name: brand.name, to: brandPath(brand) },
  ];
  const related = brandsInCategory(category.slug).filter((b) => b.slug !== brand.slug).slice(0, 4);
  const { min } = priceRange(brand);
  const lineup = brand.models.length > 1 ? `${brand.models.map((m) => m.name).join(', ')} — ` : '';
  const description = `${brand.title} at Amazon Bazar in Uncasville, CT. ${lineup}${variantCount(brand)} ${
    (brand.variantLabel || 'flavor').toLowerCase()
  }s in store from ${formatPrice(min)}. Call to check availability.`;

  return (
    <>
      <Seo
        title={`${brand.title} – ${brand.variantLabel === 'Flavor' ? 'Flavors' : 'Options'} & Prices`}
        description={description}
        path={brandPath(brand)}
        image={brand.image || brand.cardImage}
        type="product"
        jsonLd={[productSchema(brand), breadcrumbSchema(crumbs)]}
      />

      <div className="container product-crumbs">
        <Breadcrumbs items={crumbs} />
      </div>

      <ProductView key={brand.slug} brand={brand} />

      {category.nicotine ? (
        <div className="container">
          <p className="nicotine-box" role="note">
            {NICOTINE_WARNING}
          </p>
        </div>
      ) : null}

      {brand.overview?.points?.length ? (
        <section className="section container">
          <Reveal className="overview card">
            <h2>{brand.overview.title || 'Product Overview'}</h2>
            <ul role="list">
              {brand.overview.points.map((p) => (
                <li key={p}>
                  <Icon name="check" size={16} /> {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}

      {related.length ? (
        <section className="container related" aria-labelledby="related-heading">
          <div className="related__head">
            <h2 id="related-heading">More {category.name}</h2>
            <Link to={`/${category.slug}`} className="related__all">
              View all <Icon name="chevronRight" size={14} />
            </Link>
          </div>
          <div className="brand-grid">
            {related.map((b) => (
              <BrandCard key={b.slug} brand={b} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
