import { Link } from 'react-router';
import { findProduct, formatPrice } from '../data/catalog.js';
import { DEAL_OF_THE_WEEK, EVERGREEN_DEAL, NEW_ARRIVALS } from '../data/promos.js';
import useToday from '../hooks/useToday.js';
import { usePickup } from './pickup/PickupContext.jsx';
import Icon from './ui/Icon.jsx';
import Reveal from './ui/Reveal.jsx';
import SectionHeader from './ui/SectionHeader.jsx';
import './Promotions.css';

const ARRIVALS = NEW_ARRIVALS.map((p) => {
  const found = findProduct(p.brand, p.model, p.flavor);
  if (!found && import.meta.env.DEV) console.warn('[promos] product not found:', p);
  return found;
}).filter(Boolean);

export function NewArrivals() {
  const pickup = usePickup();
  if (!ARRIVALS.length) return null;
  return (
    <section className="section section--line arrivals" aria-labelledby="arrivals-heading">
      <div className="container">
        <SectionHeader kicker="Just Landed" title="New" highlight="Arrivals" id="arrivals-heading">
          The latest flavors on our shelves this week.
        </SectionHeader>
      </div>
      <div className="arrivals__scroller">
        <ul className="arrivals__row container" role="list">
          {ARRIVALS.map(({ brand, model, variant, image, to }) => (
            <li key={to} className="arrival card card--hover">
              <Link to={to} className="arrival__link">
                <span className="arrival__badge">NEW</span>
                <span className="arrival__media">
                  <img src={image} alt={`${model.name} ${variant.name}`} loading="lazy" decoding="async" width="300" height="300" />
                </span>
                <span className="arrival__brand">{model.name}</span>
                <strong className="arrival__name">{variant.name}</strong>
                <span className="arrival__price">{formatPrice(variant.price)}</span>
              </Link>
              <button
                type="button"
                className="arrival__add"
                onClick={() => pickup.add(brand.slug, model.name, variant.name)}
                aria-label={`Add ${model.name} ${variant.name} to pickup list`}
                disabled={!variant.inStock}
              >
                <Icon name="plus" size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const formatDate = (ymd) =>
  new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export function DealHighlight() {
  const today = useToday();
  const live = DEAL_OF_THE_WEEK && (!DEAL_OF_THE_WEEK.ends || today <= DEAL_OF_THE_WEEK.ends);
  const deal = live ? DEAL_OF_THE_WEEK : EVERGREEN_DEAL;
  return (
    <Reveal className="deal-highlight">
      <span className="kicker">{deal.kicker}</span>
      <h3>
        {deal.title} <span className="gradient-text">{deal.highlight}</span>
      </h3>
      <p>{deal.body}</p>
      {live && deal.ends ? (
        <p className="deal-highlight__ends">
          <Icon name="clock" size={14} /> Ends {formatDate(deal.ends)}
        </p>
      ) : null}
      {deal.cta?.to ? (
        <Link to={deal.cta.to} className="btn btn--primary">
          {deal.cta.label}
        </Link>
      ) : deal.cta?.href ? (
        <a href={deal.cta.href} className="btn btn--primary">
          {deal.cta.label}
        </a>
      ) : null}
    </Reveal>
  );
}
