import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { formatPrice } from '../data/catalog.js';
import { POPULAR_SEARCHES, search } from '../data/search.js';
import { SITE } from '../data/site.js';
import { track } from '../lib/analytics.js';
import Icon from './ui/Icon.jsx';
import './SearchDialog.css';

export default function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('is-locked');
    return () => document.body.classList.remove('is-locked');
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Log searches (debounced) so we learn what customers look for
  useEffect(() => {
    if (query.trim().length < 2) return undefined;
    const t = setTimeout(() => track('search', { search_term: query.trim(), results: results.length }), 1200);
    return () => clearTimeout(t);
  }, [query, results.length]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const go = (to) => {
    onClose();
    navigate(to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].to);
    }
  };

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Search products" onKeyDown={onKeyDown}>
      <div className="search__backdrop" onClick={onClose} />
      <div className="search__panel">
        <div className="search__bar">
          <Icon name="search" size={20} />
          <input
            ref={inputRef}
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands, flavors, cigars…"
            aria-label="Search"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-opt-${active}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="button" className="search__close" onClick={onClose} aria-label="Close search">
            <span className="search__esc">Esc</span>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="search__body" ref={listRef}>
          {!query.trim() ? (
            <div className="search__empty">
              <p className="search__label">Popular searches</p>
              <div className="search__chips">
                {POPULAR_SEARCHES.map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length ? (
            <ul id="search-results" role="listbox" aria-label="Search results" className="search__results">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.to}-${r.title}`} role="presentation">
                  <Link
                    to={r.to}
                    id={`search-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    data-index={i}
                    className="search__item"
                    onClick={onClose}
                    onMouseMove={() => setActive(i)}
                  >
                    <span className="search__thumb">
                      {r.image ? <img src={r.image} alt="" loading="lazy" width="48" height="48" /> : <Icon name="star" />}
                    </span>
                    <span className="search__text">
                      <strong>{r.title}</strong>
                      <small>{r.subtitle}</small>
                    </span>
                    <span className="search__meta">
                      {typeof r.price === 'number' ? <b>{formatPrice(r.price)}</b> : null}
                      <small>{r.inStock === false ? 'Out of stock' : r.type}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search__none">
              <p>
                No matches for “<strong>{query}</strong>”.
              </p>
              <p>We carry more than we list online — give us a call and we’ll check.</p>
              <a href={SITE.phoneHref} className="btn btn--primary btn--pill">
                <Icon name="phone" /> Call {SITE.phone}
              </a>
            </div>
          )}
        </div>
        <p className="search__hint" aria-hidden="true">
          <kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
