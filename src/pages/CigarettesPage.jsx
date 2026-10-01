import { useState } from 'react';
import { Link } from 'react-router';
import ProductView from '../components/product/ProductView.jsx';
import Seo from '../components/Seo.jsx';
import Icon from '../components/ui/Icon.jsx';
import PageHero from '../components/ui/PageHero.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { getBrand } from '../data/catalog.js';
import { breadcrumbSchema, faqSchema, productSchema } from '../data/schema.js';
import './CigarettesPage.css';

const FAVORITES = [
  { name: 'Marlboro Gold', note: 'Classic smooth profile', model: 'marlboro', popular: true },
  { name: 'Newport Menthol', note: 'Fresh menthol edge', model: 'newport', popular: true },
  { name: 'Camel Crush', note: 'Balanced everyday blend', model: 'camel-crush', popular: true },
  { name: 'Pall Mall Red', note: 'Bold traditional taste', model: 'pall-mall' },
  { name: 'Natural American Spirit', note: 'Rich full tobacco note', model: 'natural-american-spirit' },
  { name: 'Newport Gold', note: 'Light menthol character', model: 'newport' },
];

const QUALITY = [
  { icon: '✓', title: '100% Authentic', body: 'All products sourced directly from authorized distributors.' },
  { icon: '↻', title: 'Fresh Stock', body: 'Popular brands and variants restocked regularly.' },
  { icon: '★', title: 'Fair Prices', body: 'Some of the lowest cigarette prices in the area.' },
  { icon: '☎', title: 'Call Ahead', body: 'Ask us to hold your brand before you drive over.' },
];

const FAQS = [
  {
    q: 'What cigarette brands do you carry?',
    a: 'We stock all major brands including Marlboro, Newport, Camel, Pall Mall, Natural American Spirit, Maverick, Crowns, Seneca, Djarum and more. Use the brand picker above to see every variant and price.',
  },
  {
    q: 'Can I order cigarettes online?',
    a: 'No. Tobacco is sold in-store only to adults 21+ with a valid ID. You can call us to check availability or have us hold a carton.',
  },
  {
    q: 'Are your products authentic?',
    a: 'Yes — 100%. Everything is purchased directly from authorized distributors.',
  },
  {
    q: 'Are the prices on this page current?',
    a: 'We update prices regularly, but they can change with taxes and supplier costs. Call the store for today’s exact price.',
  },
];

const crumbs = [
  { name: 'Home', to: '/' },
  { name: 'Cigarettes', to: '/cigarettes' },
];

export default function CigarettesPage() {
  const brand = getBrand('cigarettes');
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <Seo
        title="Cigarettes – Marlboro, Newport, Pall Mall & More"
        description="Cigarette prices and brands at Amazon Bazar in Uncasville, CT: Marlboro, Newport, Camel, Pall Mall, Natural American Spirit, Maverick, Crowns, Djarum and more."
        path="/cigarettes"
        image="/images/brands/cigarettes.webp"
        jsonLd={[productSchema(brand), breadcrumbSchema(crumbs), faqSchema(FAQS)]}
      />
      <PageHero
        title="Premium Cigarettes"
        tagline="Top Brands • Smooth Taste • Premium Quality"
        image="/images/brands/cigarettes.webp"
        crumbs={crumbs}
      />

      <div id="picker" className="cig-picker">
        <ProductView brand={brand} headingLevel="h2" />
      </div>

      <section className="section section--line container" aria-labelledby="fav-heading">
        <SectionHeader kicker="Customer Favorites" title="Signature" highlight="Picks" id="fav-heading" />
        <ul className="favorites" role="list">
          {FAVORITES.map((f, i) => (
            <Reveal as="li" key={f.name} delay={(i % 3) * 70}>
              <Link to={`/cigarettes?model=${f.model}#picker`} className="favorite card card--hover">
                {f.popular ? (
                  <span className="favorite__badge">
                    <span className="pulse-dot" /> Popular this week
                  </span>
                ) : null}
                <strong>{f.name}</strong>
                <span>{f.note}</span>
                <span className="favorite__link">
                  See prices <Icon name="chevronRight" size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="section section--line container" aria-labelledby="quality-heading">
        <SectionHeader kicker="Why Buy Here" title="Why Choose" highlight="Amazon Bazar?" id="quality-heading">
          Authentic · Verified · Trusted by thousands of local customers
        </SectionHeader>
        <div className="quality">
          {QUALITY.map((q, i) => (
            <Reveal key={q.title} className="quality__card card card--hover" delay={i * 60}>
              <span className="quality__icon" aria-hidden="true">
                {q.icon}
              </span>
              <h3>{q.title}</h3>
              <p>{q.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--line container" aria-labelledby="faq-heading">
        <SectionHeader kicker="FAQ" title="Frequently Asked" highlight="Questions" id="faq-heading" />
        <div className="faq">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className={`faq__item${open ? ' is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    {f.q}
                    <span className="faq__toggle" aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq__answer" id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
