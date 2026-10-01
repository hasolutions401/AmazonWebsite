import { Link } from 'react-router';
import { CATEGORIES } from '../../data/catalog.js';
import { NICOTINE_WARNING, SITE } from '../../data/site.js';
import InstallApp from '../InstallApp.jsx';
import Icon from '../ui/Icon.jsx';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            AMAZON <span>BAZAR</span>
          </Link>
          <p>
            Premium smoke shop in Uncasville, CT. Your trusted destination for quality tobacco, vape and hookah
            products.
          </p>
          <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer" className="footer__rating">
            <span className="footer__stars" aria-hidden="true">
              ★★★★★
            </span>
            {SITE.rating.value} on Google · {SITE.rating.count} reviews
          </a>
          <InstallApp />
        </div>

        <div>
          <h2 className="footer__title">Shop</h2>
          <ul role="list" className="footer__links">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="footer__title">Visit Us</h2>
          <ul role="list" className="footer__contact">
            <li>
              <Icon name="pin" size={16} />
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
                {SITE.address.street}
                <br />
                {SITE.address.city}, {SITE.address.region} {SITE.address.zip}
              </a>
            </li>
            <li>
              <Icon name="phone" size={16} />
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </li>
            <li>
              <Icon name="clock" size={16} />
              <span>{SITE.hours.label}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__legal">
        <p className="footer__warning">{NICOTINE_WARNING}</p>
        <p>
          You must be 21 or older to purchase tobacco and nicotine products. Valid ID required. Prices and availability
          may change; please call to confirm.
        </p>
      </div>

      <div className="footer__bottom">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
