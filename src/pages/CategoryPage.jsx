import { useState } from 'react';
import { Link, useParams } from 'react-router';
import BrandCard from '../components/product/BrandCard.jsx';
import Seo from '../components/Seo.jsx';
import Icon from '../components/ui/Icon.jsx';
import Marquee from '../components/ui/Marquee.jsx';
import PageHero from '../components/ui/PageHero.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import { brandsInCategory, getCategory } from '../data/catalog.js';
import { breadcrumbSchema } from '../data/schema.js';
import { NICOTINE_WARNING } from '../data/site.js';
import NotFoundPage from './NotFoundPage.jsx';
import './CategoryPage.css';

export default function CategoryPage() {
  const { category: slug } = useParams();
  const category = getCategory(slug);
  const [query, setQuery] = useState('');
  if (!category || !category.hero) return <NotFoundPage />;

  const brands = brandsInCategory(slug);
  const q = query.trim().toLowerCase();
  const shown = q
    ? brands.filter((b) =>
        [b.name, b.title, ...b.models.flatMap((m) => [m.name, ...m.variants.map((v) => v.name)])]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    : brands;
  const crumbs = [
    { name: 'Home', to: '/' },
    { name: category.name, to: `/${slug}` },
  ];

  return (
    <>
      <Seo
        title={`${category.name} in Uncasville, CT`}
        description={category.description}
        path={`/${slug}`}
        image={category.hero}
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero title={category.name} tagline={category.tagline} image={category.hero} crumbs={crumbs} />

      {category.nicotine ? (
        <div className="cat-warning">
          <Marquee items={Array(4).fill(NICOTINE_WARNING)} variant="warning" label="Nicotine warning" speed={40} />
        </div>
      ) : null}

      <section className="section container" aria-labelledby="brands-heading">
        <div className="cat-toolbar">
          <div>
            <h2 id="brands-heading">Shop by Brand</h2>
            <p>
              {brands.length} brands in store. Tap a brand to see every flavor and price.
            </p>
          </div>
          {brands.length > 4 ? (
            <label className="cat-search">
              <span className="sr-only">Search brands or flavors</span>
              <input
                type="search"
                placeholder="Search brand or flavor…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          ) : null}
        </div>

        {shown.length ? (
          <Reveal className="brand-grid">
            {shown.map((b) => (
              <BrandCard key={b.slug} brand={b} />
            ))}
          </Reveal>
        ) : (
          <p className="cat-empty">
            No brand or flavor matches “{query}”. Call us — we may still have it in store.
          </p>
        )}

        <div className="cat-back">
          <Link to="/" className="btn btn--outline">
            <Icon name="arrowLeft" /> Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
