import Breadcrumbs from './Breadcrumbs.jsx';
import './PageHero.css';

export default function PageHero({ title, highlight, tagline, image, crumbs, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero__frame">
          {image ? <img className="page-hero__img" src={image} alt="" fetchPriority="high" /> : null}
          <div className="page-hero__content">
            {crumbs ? <Breadcrumbs items={crumbs} /> : null}
            <h1>
              <span className="gradient-text">{title}</span>
              {highlight ? <> {highlight}</> : null}
            </h1>
            {tagline ? <p className="page-hero__tagline">{tagline}</p> : null}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
