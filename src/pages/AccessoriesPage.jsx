import Gallery from '../components/Gallery.jsx';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/ui/PageHero.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { ACCESSORY_GALLERY } from '../data/galleries.js';
import { breadcrumbSchema } from '../data/schema.js';
import './AccessoriesPage.css';

const ESSENTIALS = [
  { title: 'Hookahs', body: 'Explore our premium hookah collection in-store.', image: '/images/accessories/hookahs.webp' },
  { title: 'Glass Pipes', body: 'Artistic and decorative glass pipe designs.', image: '/images/accessories/glass-pipes.webp' },
  { title: 'Wooden Pipes', body: 'Traditional handcrafted wooden pipes available.', image: '/images/accessories/wooden-pipes.webp' },
  { title: 'Ashtrays & Extinguishers', body: 'Explore our premium ashtray collection in-store.', image: '/images/accessories/ashtrays.webp' },
  { title: 'Cigarette Cases', body: 'Premium cigarette cases for protection & style.', image: '/images/accessories/cigarette-cases.webp' },
  { title: 'Novelty Pieces', body: 'Unique novelty and character style pieces.', image: '/images/accessories/novelty.webp' },
  { title: 'Cleaning & Maintenance', body: 'Cleaning tools and maintenance accessories.', image: '/images/accessories/cleaning.webp' },
  { title: 'Herbal Supplements', body: 'Natural and organic herbal supplements.', image: '/images/accessories/herbal-supplements.webp' },
];

const crumbs = [
  { name: 'Home', to: '/' },
  { name: 'Hookahs & Accessories', to: '/accessories' },
];

export default function AccessoriesPage() {
  return (
    <>
      <Seo
        title="Hookahs, Glass Pipes & Smoke Accessories"
        description="Hookahs, shisha, glass and wooden pipes, ashtrays, cigarette cases, cleaning supplies and novelty pieces at Amazon Bazar in Uncasville, CT."
        path="/accessories"
        image="/images/heroes/accessories.webp"
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        title="Hookahs & Accessories"
        tagline="Browse all premium accessories in our collection"
        image="/images/heroes/accessories.webp"
        crumbs={crumbs}
      />

      <section className="section container" aria-labelledby="essentials-heading">
        <SectionHeader kicker="Premium Selection" title="Explore Our" highlight="Essentials" id="essentials-heading">
          Find the perfect companion for your smoking experience.
        </SectionHeader>
        <ul className="essentials" role="list">
          {ESSENTIALS.map((e, i) => (
            <Reveal as="li" key={e.title} className="essential" delay={(i % 4) * 60}>
              <img src={e.image} alt="" loading="lazy" decoding="async" width="600" height="400" />
              <div className="essential__body">
                <h3>{e.title}</h3>
                <p>{e.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="section section--line container" aria-labelledby="acc-gallery-heading">
        <SectionHeader kicker="Gallery" title="In-Store" highlight="Showcase" id="acc-gallery-heading">
          Real photos of our hookahs, glass and accessory displays.
        </SectionHeader>
        <Gallery images={ACCESSORY_GALLERY} label="Accessories showcase photos" />
      </section>
    </>
  );
}
