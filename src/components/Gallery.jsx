import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './ui/Icon.jsx';
import './Gallery.css';

const BATCH = 9;

/** Photo grid with "view more" paging and a keyboard/swipe friendly lightbox. */
export default function Gallery({ images, label }) {
  const [count, setCount] = useState(BATCH);
  const [active, setActive] = useState(null);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  const touchX = useRef(null);

  const open = (i, e) => {
    lastFocus.current = e.currentTarget;
    setActive(i);
  };
  const close = useCallback(() => setActive(null), []);
  const step = useCallback((d) => setActive((i) => (i + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (active === null) return undefined;
    document.body.classList.add('is-locked');
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        e.preventDefault(); // keep focus inside the viewer
        closeRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const returnTo = lastFocus.current;
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
      returnTo?.focus();
    };
  }, [active === null, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = active !== null ? images[active] : null;

  return (
    <>
      <ul className="gallery" role="list" aria-label={label}>
        {images.slice(0, count).map((img, i) => (
          <li key={img.src}>
            <button type="button" className="gallery__item" onClick={(e) => open(i, e)} aria-label={`Enlarge: ${img.alt}`}>
              <img src={img.src} alt={img.alt} loading={i < 6 ? 'eager' : 'lazy'} decoding="async" width="600" height="400" />
            </button>
          </li>
        ))}
      </ul>

      {count < images.length ? (
        <div className="gallery__more">
          <button type="button" className="btn btn--primary btn--pill" onClick={() => setCount((c) => c + BATCH)}>
            View More ({images.length - count} more photos)
          </button>
        </div>
      ) : null}

      {current ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${active + 1} of ${images.length}`}
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <img key={current.src} src={current.src} alt={current.alt} className="lightbox__img" />
          <p className="lightbox__count">
            {active + 1} / {images.length}
          </p>
          <button type="button" className="lightbox__btn lightbox__close" onClick={close} ref={closeRef} aria-label="Close">
            <Icon name="close" size={24} />
          </button>
          <button type="button" className="lightbox__btn lightbox__prev" onClick={() => step(-1)} aria-label="Previous photo">
            <Icon name="arrowLeft" size={22} />
          </button>
          <button type="button" className="lightbox__btn lightbox__next" onClick={() => step(1)} aria-label="Next photo">
            <Icon name="chevronRight" size={24} />
          </button>
        </div>
      ) : null}
    </>
  );
}
