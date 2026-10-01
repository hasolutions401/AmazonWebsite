import { Link } from 'react-router';
import Seo from '../components/Seo.jsx';
import { CATEGORIES } from '../data/catalog.js';

export default function NotFoundPage() {
  return (
    <section className="section container" style={{ textAlign: 'center' }}>
      <Seo title="Page Not Found" description="This page could not be found." path="/404" noindex />
      <span className="kicker">Error 404</span>
      <h1 style={{ fontSize: 'clamp(2rem, 1.4rem + 3vw, 3.4rem)', marginTop: 12 }}>
        Page <span className="gradient-text">not found</span>
      </h1>
      <p style={{ color: 'var(--muted)', margin: '14px auto 30px', maxWidth: 520 }}>
        The page you’re looking for moved or doesn’t exist. Try one of our categories instead.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/${c.slug}`} className="chip">
            {c.name}
          </Link>
        ))}
      </div>
      <Link to="/" className="btn btn--primary" style={{ marginTop: 32 }}>
        Back to Home
      </Link>
    </section>
  );
}
