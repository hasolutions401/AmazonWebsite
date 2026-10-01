import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { formatPrice, priceRange, toKey } from '../../data/catalog.js';
import { SITE } from '../../data/site.js';
import useHydrated from '../../hooks/useHydrated.js';
import { itemKey, usePickup } from '../pickup/PickupContext.jsx';
import Icon from '../ui/Icon.jsx';
import './ProductView.css';

const EMPTY_PARAMS = new URLSearchParams();

/**
 * Model + flavor picker for a brand. The selection is kept in the URL
 * (?model=…&flavor=…) so a specific flavor can be shared as a link.
 */
export default function ProductView({ brand, headingLevel = 'h1' }) {
  const [searchParams, setParams] = useSearchParams();
  // Pre-rendered HTML has no query string; ignore it until hydration finishes.
  const hydrated = useHydrated();
  const params = hydrated ? searchParams : EMPTY_PARAMS;
  const imageRef = useRef(null);
  const variantsRef = useRef(null);
  const pickup = usePickup();
  const H = headingLevel;

  const modelIndex = Math.max(
    0,
    brand.models.findIndex((m) => toKey(m.name) === params.get('model')),
  );
  const model = brand.models[modelIndex];
  const variant = model.variants.find((v) => toKey(v.name) === params.get('flavor')) ?? null;

  const range = useMemo(() => priceRange({ ...brand, models: [model] }), [brand, model]);
  const image = variant?.image || (brand.models.length > 1 ? model.variants[0]?.image : null) || brand.image || brand.cardImage;
  const [loadedSrc, setLoadedSrc] = useState(image);

  // Preload the next image so the swap is smooth
  useEffect(() => {
    if (image === loadedSrc) return;
    const img = new Image();
    img.onload = img.onerror = () => setLoadedSrc(image);
    img.src = image;
  }, [image, loadedSrc]);

  // Hide the floating call button on phones while this page's buy bar is shown
  useEffect(() => {
    document.body.classList.add('has-buybar');
    return () => document.body.classList.remove('has-buybar');
  }, []);

  const select = (next) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: true, preventScrollReset: true });
  };

  const chooseVariant = (v) => {
    select({ model: brand.models.length > 1 ? toKey(model.name) : null, flavor: toKey(v.name) });
    if (window.matchMedia('(max-width: 860px)').matches) {
      imageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const inStock = variant ? variant.inStock : true;
  const title = brand.models.length > 1 ? model.name : brand.title;
  const variantWord = (brand.variantLabel || 'Flavor').toLowerCase();
  const inList = variant ? pickup.items.find((i) => i.key === itemKey(brand.slug, model.name, variant.name)) : null;

  const addToList = () => {
    if (!variant) {
      // Nothing chosen yet: take the shopper to the flavor buttons
      // Focus first: calling focus() after a smooth scroll would cancel it
      variantsRef.current?.querySelector('button')?.focus({ preventScroll: true });
      variantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    pickup.add(brand.slug, model.name, variant.name);
  };

  const addLabel = !variant
    ? `Choose a ${variantWord}`
    : !inStock
      ? 'Currently unavailable'
      : inList
        ? `Add another (${inList.qty} in list)`
        : 'Add to Pickup List';
  const priceLabel = variant
    ? formatPrice(variant.price)
    : range.min === range.max
      ? formatPrice(range.min)
      : `From ${formatPrice(range.min)}`;

  return (
    <section className="pv container" aria-label={`${brand.name} products`}>
      <div className="pv__media" ref={imageRef}>
        <div className="pv__frame">
          <img
            key={loadedSrc}
            src={loadedSrc}
            alt={variant ? `${title} – ${variant.name}` : title}
            className="pv__img"
            width="500"
            height="500"
            fetchPriority="high"
          />
        </div>
        {variant ? (
          <p className="pv__caption">
            <Icon name="check" size={14} /> {variant.name}
          </p>
        ) : null}
      </div>

      <div className="pv__info">
        <span className="kicker">{brand.name}</span>
        <H className="pv__title">{title}</H>

        <div className="pv__meta">
          <span className="pv__price" aria-live="polite">
            {priceLabel}
          </span>
          <span className={`pv__stock ${inStock ? 'is-in' : 'is-out'}`}>
            {inStock ? 'Available in store' : 'Currently unavailable'}
          </span>
        </div>

        {brand.description ? <p className="pv__desc">{brand.description}</p> : null}

        {brand.models.length > 1 ? (
          <fieldset className="pv__group">
            <legend>
              {brand.modelLabel || 'Model'} <span>{brand.models.length} options</span>
            </legend>
            <div className="pv__options pv__options--models">
              {brand.models.map((m, i) => (
                <button
                  key={m.name}
                  type="button"
                  className="pv__option"
                  aria-pressed={i === modelIndex}
                  onClick={() => select({ model: toKey(m.name), flavor: null })}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className="pv__group">
          <legend>
            {brand.variantLabel || 'Flavor'} <span>{model.variants.length} available</span>
          </legend>
          <div className="pv__options" ref={variantsRef}>
            {model.variants.map((v) => (
              <button
                key={v.name}
                type="button"
                className={`pv__option${v.inStock ? '' : ' is-out'}`}
                aria-pressed={variant?.name === v.name}
                onClick={() => chooseVariant(v)}
              >
                <span>{v.name}</span>
                {range.min !== range.max ? <small>{formatPrice(v.price)}</small> : null}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="pv__cta" data-track="product-page">
          <button
            type="button"
            className={`btn btn--primary pv__add${variant ? '' : ' is-idle'}`}
            onClick={addToList}
            disabled={Boolean(variant && !inStock)}
          >
            <Icon name="bag" /> {addLabel}
          </button>
          <a href={SITE.phoneHref} className="btn btn--outline">
            <Icon name="phone" /> Call Store
          </a>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            <Icon name="directions" /> Directions
          </a>
        </div>
        <p className="pv__note">
          <Icon name="info" size={14} /> Reserve online, pay in store · 21+ with valid ID · Prices may vary
        </p>
      </div>

      {/* Sticky bar on phones */}
      <div className="buybar" data-track="product-buybar">
        <div className="buybar__info">
          <strong>{priceLabel}</strong>
          <span>{variant ? variant.name : `${model.variants.length} ${variantWord}s`}</span>
        </div>
        <div className="buybar__actions">
          <a href={SITE.phoneHref} className="icon-btn buybar__call" aria-label={`Call ${SITE.name}`}>
            <Icon name="phone" size={20} />
          </a>
          <button
            type="button"
            className="btn btn--primary btn--pill"
            onClick={addToList}
            disabled={Boolean(variant && !inStock)}
          >
            <Icon name="bag" /> {variant ? (inStock ? (inList ? `Add (${inList.qty})` : 'Add to List') : 'Unavailable') : `Pick ${variantWord}`}
          </button>
        </div>
      </div>
    </section>
  );
}
