import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatPrice } from '../../data/catalog.js';
import { SITE } from '../../data/site.js';
import { track } from '../../lib/analytics.js';
import Icon from '../ui/Icon.jsx';
import { usePickup } from './PickupContext.jsx';
import './PickupDrawer.css';

const TIMES = ['As soon as possible', 'Within 1 hour', 'Later today', 'Tomorrow'];
const FORM_KEY = 'ab-pickup-form';

function buildMessage(items, total, { name, time, note }) {
  const lines = items.map((i) => `• ${i.qty} × ${i.label} – ${i.variant} (${formatPrice(i.price)})`);
  return [
    `Hi ${SITE.name}! I'd like to reserve for pickup:`,
    ...lines,
    `Est. total: ${formatPrice(total)} + tax`,
    name && `Name: ${name}`,
    `Pickup: ${time}`,
    note && `Note: ${note}`,
  ]
    .filter(Boolean)
    .join('\n');
}

// "?&body=" works on both iOS and Android messaging apps
const smsHref = (body) => `sms:${SITE.textNumber}?&body=${encodeURIComponent(body)}`;

export function PickupToast() {
  const { toast, openList, dismissToast } = usePickup();
  if (!toast) return null;
  return (
    <div className="pickup-toast" role="status">
      <Icon name="check" size={18} />
      <span>{toast}</span>
      <button type="button" onClick={openList}>
        View list
      </button>
      <button type="button" className="pickup-toast__x" onClick={dismissToast} aria-label="Dismiss">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export default function PickupDrawer() {
  const { items, count, total, setQty, remove, clear, open, closeList } = usePickup();
  const [form, setForm] = useState({ name: '', time: TIMES[0], note: '' });
  const [copied, setCopied] = useState(false);
  const closeRef = useRef(null);

  // Remember the customer's name between visits (this device only)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FORM_KEY) || 'null');
      if (saved?.name) setForm((f) => ({ ...f, name: saved.name }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('is-locked');
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === 'Escape' && closeList();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closeList]);

  const update = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (field === 'name') {
      try {
        localStorage.setItem(FORM_KEY, JSON.stringify({ name: next.name }));
      } catch {
        /* ignore */
      }
    }
  };

  const message = buildMessage(items, total, form);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      track('copy_pickup_order', { items: count });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy your order:', message);
    }
  };

  return (
    <div className={`pickup${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="pickup__backdrop" onClick={closeList} />
      <aside className="pickup__panel" role="dialog" aria-modal="true" aria-labelledby="pickup-title" data-track="pickup-list">
        <header className="pickup__head">
          <h2 id="pickup-title">
            <Icon name="bag" size={20} /> Pickup List {count ? <span>({count})</span> : null}
          </h2>
          <button type="button" className="icon-btn" onClick={closeList} ref={closeRef} aria-label="Close pickup list">
            <Icon name="close" size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="pickup__empty">
            <Icon name="bag" size={40} />
            <p>Your pickup list is empty.</p>
            <p className="pickup__muted">Choose a flavor on any product page and tap “Add to Pickup List”.</p>
            <Link to="/disposable-vapes" className="btn btn--primary btn--pill" onClick={closeList}>
              Browse Disposables
            </Link>
          </div>
        ) : (
          <>
            <ul className="pickup__items" role="list">
              {items.map((i) => (
                <li key={i.key} className="pickup__item">
                  <Link to={i.to} onClick={closeList} className="pickup__thumb">
                    <img src={i.image} alt="" width="64" height="64" loading="lazy" />
                  </Link>
                  <div className="pickup__info">
                    <Link to={i.to} onClick={closeList}>
                      <strong>{i.variant}</strong>
                    </Link>
                    <small>{i.label}</small>
                    {i.inStock === false ? <small className="pickup__out">Currently unavailable</small> : null}
                    <div className="pickup__qty">
                      <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label={`Remove one ${i.variant}`}>
                        <Icon name="minus" size={14} />
                      </button>
                      <span aria-label="Quantity">{i.qty}</span>
                      <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label={`Add one ${i.variant}`}>
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="pickup__price">
                    <b>{formatPrice(i.price * i.qty)}</b>
                    <button type="button" onClick={() => remove(i.key)} aria-label={`Remove ${i.variant}`}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pickup__footer">
              <div className="pickup__total">
                <span>Estimated total</span>
                <b>{formatPrice(total)}</b>
              </div>
              <p className="pickup__muted">Plus tax. Pay in store. Valid 21+ ID required at pickup.</p>

              <div className="pickup__form">
                <label>
                  <span>Your name</span>
                  <input type="text" value={form.name} onChange={update('name')} placeholder="First name" autoComplete="given-name" maxLength={40} />
                </label>
                <label>
                  <span>Pickup time</span>
                  <select value={form.time} onChange={update('time')}>
                    {TIMES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="pickup__note">
                  <span>Note (optional)</span>
                  <input type="text" value={form.note} onChange={update('note')} placeholder="e.g. 5% strength" maxLength={120} />
                </label>
              </div>

              <div className="pickup__actions">
                {SITE.textNumber ? (
                  <a
                    href={smsHref(message)}
                    className="btn btn--primary"
                    onClick={() => track('send_pickup_order', { items: count, value: total })}
                  >
                    <Icon name="message" /> Text Order to Store
                  </a>
                ) : null}
                <div className="pickup__secondary">
                  <button type="button" className="btn btn--outline" onClick={copy}>
                    <Icon name={copied ? 'check' : 'copy'} /> {copied ? 'Copied!' : 'Copy Order'}
                  </button>
                  <a href={SITE.phoneHref} className="btn btn--outline">
                    <Icon name="phone" /> Call
                  </a>
                </div>
              </div>
              <button type="button" className="pickup__clear" onClick={clear}>
                Clear list
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
