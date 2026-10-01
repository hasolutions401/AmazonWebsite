import './Marquee.css';

/** Infinite scrolling ribbon. Items are duplicated so the loop is seamless. */
export default function Marquee({ items, variant = 'promo', label, speed = 30 }) {
  return (
    <section className={`marquee marquee--${variant}`} aria-label={label}>
      <ul className="sr-only">
        {[...new Set(items)].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }} aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy}>
            {items.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
