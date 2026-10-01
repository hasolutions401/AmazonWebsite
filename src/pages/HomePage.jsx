import { Link } from 'react-router';
import { DealHighlight, NewArrivals } from '../components/Promotions.jsx';
import Seo from '../components/Seo.jsx';
import VisitSection from '../components/VisitSection.jsx';
import Icon from '../components/ui/Icon.jsx';
import Marquee from '../components/ui/Marquee.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { CATEGORIES } from '../data/catalog.js';
import { DEALS, FEATURED_BRANDS, REVIEWS, RIBBON, STATS, VISIT_REASONS, WHY_US } from '../data/home.js';
import { storeSchema } from '../data/schema.js';
import { SITE } from '../data/site.js';
import './HomePage.css';

const initials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

export default function HomePage() {
  return (
    <>
      <Seo
        description="Amazon Bazar in Uncasville, CT — disposable vapes, pod systems, nicotine pouches, premium cigars, cigarettes, hookahs and smoke shop accessories at the best prices."
        path="/"
        jsonLd={storeSchema()}
      />

      {/* HERO */}
      <section className="home-hero container" aria-labelledby="home-title">
        <div className="home-hero__frame">
          <img
            src="/images/heroes/home.webp"
            alt=""
            className="home-hero__img"
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <div className="home-hero__content">
            <span className="kicker">Uncasville’s Premier Smoke Shop</span>
            <h1 id="home-title" className="home-hero__title">
              Amazon Bazar
            </h1>
            <p className="home-hero__tagline">Premium Collection · Luxury Experience · Authentic Products</p>
            <p className="home-hero__lead">
              The largest selection of disposable vapes, pod systems, nicotine pouches and premium cigars in
              Uncasville, CT.
            </p>
            <div className="home-hero__actions">
              <a href="#products" className="btn btn--primary">
                Shop Products
              </a>
              <a href="#visit" className="btn btn--outline">
                <Icon name="pin" /> Visit Us
              </a>
            </div>
            <ul className="home-hero__facts" role="list">
              <li>
                <span className="star">★</span> {SITE.rating.value} Google rating
              </li>
              <li>
                <Icon name="clock" size={14} /> {SITE.hours.label}
              </li>
              <li>
                <Icon name="check" size={14} /> 100% authentic products
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="home-ribbon">
        <Marquee items={RIBBON} label="Store highlights" speed={28} />
      </div>

      {/* CATEGORIES */}
      <section className="section container" id="products" aria-labelledby="cats-heading">
        <SectionHeader kicker="Browse Collection" title="Browse Our" highlight="Categories" id="cats-heading">
          Find exactly what you’re looking for
        </SectionHeader>
        <div className="cat-grid">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 80}>
              <Link to={`/${c.slug}`} className="cat-card">
                <img src={c.image} alt="" loading="lazy" decoding="async" width="1024" height="1536" />
                <div className="cat-card__body">
                  <h3>{c.name}</h3>
                  <p>{c.blurb}</p>
                  <span className="chip">
                    Shop now <Icon name="chevronRight" size={12} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <NewArrivals />

      {/* ABOUT */}
      <section className="section section--line about" aria-labelledby="about-heading">
        <div className="container about__grid">
          <Reveal className="about__panel">
            <p className="about__brand">AMAZON BAZAR</p>
            <p className="about__sub">PREMIUM SMOKE SHOP</p>
            <ul className="about__stats" role="list">
              {STATS.map((s) => (
                <li key={s.label} className="about__stat">
                  <span className={`about__stat-icon${s.star ? ' is-star' : ''}`} aria-hidden="true">
                    {s.icon}
                  </span>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
            <span className="about__love">
              Locally Loved <span aria-hidden="true">❤</span>
            </span>
          </Reveal>

          <Reveal className="about__copy" delay={120}>
            <span className="kicker">Our Story</span>
            <h2 id="about-heading">
              About <span className="gradient-text">Amazon Bazar</span>
            </h2>
            <p>
              Amazon Bazar is a locally loved smoke shop known for affordable prices, huge product variety, and amazing
              customer service.
            </p>
            <p>
              We are proud to be Montville’s trusted destination for premium smoke shop products. Our mission is simple:
              best products at the best prices with knowledgeable, friendly support.
            </p>
            <h3>Customers visit us for:</h3>
            <ul className="about__list" role="list">
              {VISIT_REASONS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div className="about__actions">
              <a href="#visit" className="btn btn--primary">
                Visit Us Today
              </a>
              <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                See All Reviews <Icon name="external" size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section section--line reviews" aria-labelledby="reviews-heading">
        <div className="container">
          <SectionHeader kicker="Customer Reviews" title="What Our Customers" highlight="Are Saying" id="reviews-heading" />
          <div className="reviews__pill" aria-label={`Rated ${SITE.rating.value} out of 5 from ${SITE.rating.count} reviews`}>
            <span className="star" aria-hidden="true">
              ★★★★★
            </span>
            <strong>{SITE.rating.value}</strong>
            <span>/ {SITE.rating.count} reviews</span>
          </div>
        </div>
        <div className="reviews__scroller">
          <ul className="reviews__grid container" role="list">
            {REVIEWS.map((r, i) => (
              <li key={r.author} className="review card">
                <div className="review__top">
                  <span className="star" aria-label="5 stars">
                    ★★★★★
                  </span>
                  <span className="review__when">{r.when}</span>
                </div>
                <h3>“{r.title}”</h3>
                <p>{r.body}</p>
                <div className="review__footer">
                  <span className={`review__avatar review__avatar--${i % 6}`} aria-hidden="true">
                    {initials(r.author)}
                  </span>
                  <span className="review__author">
                    {r.author}
                    <small>Verified Customer</small>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="reviews__cta">
          <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            Read More Reviews on Google <Icon name="external" size={16} />
          </a>
        </div>
      </section>

      {/* DEALS */}
      <section className="section section--line deals" aria-labelledby="deals-heading">
        <div className="container">
          <SectionHeader kicker="Hot Deals" title="Unbeatable" highlight="Deals and Discounts" id="deals-heading">
            We believe premium products should be affordable. That is why we keep fresh in-store deals running all week.
          </SectionHeader>
          <div className="deals__grid">
            {DEALS.map((d, i) => (
              <Reveal key={d.title} className="deal card card--hover" delay={i * 80}>
                <span className="chip">{d.label}</span>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </Reveal>
            ))}
          </div>
          <DealHighlight />
        </div>
      </section>

      {/* BRANDS */}
      <section className="section section--line" aria-labelledby="brands-heading">
        <div className="container">
          <SectionHeader kicker="Trusted Names" title="Featured" highlight="Brands" id="brands-heading" />
          <ul className="brand-chips" role="list">
            {FEATURED_BRANDS.map((b) => (
              <li key={b.name}>
                {b.to ? (
                  <Link to={b.to} className="brand-chip">
                    {b.name}
                  </Link>
                ) : (
                  <span className="brand-chip">{b.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WHY US */}
      <section className="section section--line" aria-labelledby="why-heading">
        <div className="container">
          <SectionHeader kicker="Why Us" title="Why Choose" highlight="Amazon Bazar" id="why-heading" />
          <div className="why__grid">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} className="why" delay={(i % 2) * 100}>
                <span className="why__icon" aria-hidden="true">
                  {w.icon}
                </span>
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <VisitSection />
    </>
  );
}
