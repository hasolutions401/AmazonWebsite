import { useState } from 'react';
import Gallery from '../components/Gallery.jsx';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/ui/PageHero.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { CIGAR_GALLERY, CIGAR_LINEUP } from '../data/galleries.js';
import { breadcrumbSchema } from '../data/schema.js';
import { SITE } from '../data/site.js';
import './CigarsPage.css';

const TYPES = ['All', ...new Set(CIGAR_LINEUP.map((b) => b.type))];
const PREVIEW_COUNT = 15;
const crumbs = [
  { name: 'Home', to: '/' },
  { name: 'Cigars', to: '/cigars' },
];

export default function CigarsPage() {
  const [type, setType] = useState('All');
  const [expanded, setExpanded] = useState(false);
  const matching = type === 'All' ? CIGAR_LINEUP : CIGAR_LINEUP.filter((b) => b.type === type);
  const collapsible = matching.length > PREVIEW_COUNT;
  const shown = collapsible && !expanded ? matching.slice(0, PREVIEW_COUNT) : matching;

  return (
    <>
      <Seo
        title="Premium Cigars – Arturo Fuente, Padron, Rocky Patel & More"
        description={`Shop ${CIGAR_LINEUP.length}+ premium cigar brands in-store at Amazon Bazar, Uncasville CT — Arturo Fuente, Montecristo, Padron, Oliva, Rocky Patel, ACID and more.`}
        path="/cigars"
        image="/images/heroes/cigars.webp"
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        title="Premium Cigars"
        tagline="Top Brands • Premium Quality • Fine Selection"
        image="/images/heroes/cigars.webp"
        crumbs={crumbs}
      />

      <section className="section container" aria-labelledby="lineup-heading">
        <SectionHeader kicker="Curated Cigar Picks" title="Discover Our" highlight="Signature Brands" id="lineup-heading">
          From heritage classics to customer favorites, explore the finest cigar selections available in-store.
        </SectionHeader>

        <div className="lineup card">
          <div className="lineup__filters" role="group" aria-label="Filter by cigar type">
            {TYPES.map((t) => (
              <button key={t} type="button" className="lineup__filter" aria-pressed={type === t} onClick={() => setType(t)}>
                {t}
                <span>{t === 'All' ? CIGAR_LINEUP.length : CIGAR_LINEUP.filter((b) => b.type === t).length}</span>
              </button>
            ))}
          </div>
          <ul className="lineup__list" role="list" aria-live="polite">
            {shown.map((b) => (
              <li key={b.name} className="lineup__item">
                <span>{b.name}</span>
                <span className={`lineup__tag lineup__tag--${b.type.toLowerCase().replace(/\s+/g, '-')}`}>{b.type}</span>
              </li>
            ))}
          </ul>
          {collapsible ? (
            <div className="lineup__toggle">
              <button type="button" className="btn btn--outline btn--pill" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Show fewer brands' : `View all ${matching.length} brands`}
              </button>
            </div>
          ) : null}
          <p className="lineup__note">
            Looking for a specific stick? Call us at <a href={SITE.phoneHref}>{SITE.phone}</a> — our humidor changes
            weekly.
          </p>
        </div>
      </section>

      <section className="section section--line container" aria-labelledby="cigar-gallery-heading">
        <SectionHeader kicker="Gallery" title="In-Store" highlight="Showcase" id="cigar-gallery-heading">
          Real photos of our cigar stock and humidor displays.
        </SectionHeader>
        <Gallery images={CIGAR_GALLERY} label="Cigar showcase photos" />
      </section>
    </>
  );
}
