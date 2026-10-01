import { Link } from 'react-router';
import { brandPath, formatPrice, priceRange, variantCount } from '../../data/catalog.js';
import { BRAND_BADGES } from '../../data/promos.js';
import './BrandCard.css';

export default function BrandCard({ brand }) {
  const { min } = priceRange(brand);
  const count = variantCount(brand);
  return (
    <Link to={brandPath(brand)} className="brand-card card card--hover">
      {BRAND_BADGES[brand.slug] ? <span className="brand-card__badge">{BRAND_BADGES[brand.slug]}</span> : null}
      <div className="brand-card__media">
        <img src={brand.cardImage} alt={brand.title} loading="lazy" decoding="async" width="600" height="400" />
      </div>
      <div className="brand-card__body">
        <h3>{brand.name}</h3>
        <p>
          {count} {count === 1 ? 'option' : 'options'} · from <strong>{formatPrice(min)}</strong>
        </p>
      </div>
    </Link>
  );
}
