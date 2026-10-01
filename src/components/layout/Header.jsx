import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { NAV } from '../../data/nav.js';
import { SITE, fullAddress } from '../../data/site.js';
import useHydrated from '../../hooks/useHydrated.js';
import { usePickup } from '../pickup/PickupContext.jsx';
import SearchDialog from '../SearchDialog.jsx';
import Icon from '../ui/Icon.jsx';
import './Header.css';

function DesktopNav() {
  const { pathname } = useLocation();
  const [openIndex, setOpenIndex] = useState(null);

  // Close any open dropdown after navigating
  useEffect(() => setOpenIndex(null), [pathname]);

  return (
    <nav className="desk-nav" aria-label="Primary">
      <ul className="desk-nav__list" role="list">
        {NAV.map((group, i) => {
          const active = pathname === group.to || pathname.startsWith(group.to + '/');
          if (!group.items) {
            return (
              <li key={group.to}>
                <NavLink to={group.to} className="desk-nav__link">
                  {group.label}
                </NavLink>
              </li>
            );
          }
          const isOpen = openIndex === i;
          const wide = group.items.length > 6;
          return (
            <li
              key={group.to}
              className={`desk-nav__item${isOpen ? ' is-open' : ''}`}
              onMouseEnter={() => setOpenIndex(i)}
              onMouseLeave={() => setOpenIndex(null)}
              onKeyDown={(e) => e.key === 'Escape' && setOpenIndex(null)}
            >
              <NavLink to={group.to} className={`desk-nav__link${active ? ' active' : ''}`}>
                {group.label}
              </NavLink>
              <button
                type="button"
                className="desk-nav__toggle"
                aria-expanded={isOpen}
                aria-label={`Show ${group.label} brands`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <Icon name="chevronDown" size={14} />
              </button>
              <div className={`desk-menu${wide ? ' desk-menu--wide' : ''}`}>
                <Link to={group.to} className="desk-menu__all">
                  All {group.label} <Icon name="chevronRight" size={14} />
                </Link>
                <ul role="list" className="desk-menu__grid">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <NavLink to={item.to} className="desk-menu__link">
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileDrawer({ open, onClose, returnFocusRef }) {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(null);
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    // Expand the group for the current page
    const current = NAV.findIndex((g) => g.items && (pathname === g.to || pathname.startsWith(g.to + '/')));
    setExpanded(current >= 0 ? current : null);
    document.body.classList.add('is-locked');
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll('a[href], button:not([disabled])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const toReturn = returnFocusRef.current;
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
      toReturn?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={`drawer${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="drawer__backdrop" onClick={onClose} />
      <div className="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu" ref={panelRef}>
        <div className="drawer__head">
          <img src={SITE.logo} alt="" width="140" height="34" />
          <button type="button" className="icon-btn" onClick={onClose} ref={closeRef} aria-label="Close menu">
            <Icon name="close" size={22} />
          </button>
        </div>

        <nav className="drawer__nav" aria-label="Mobile">
          <NavLink to="/" end className="drawer__link">
            Home
          </NavLink>
          {NAV.map((group, i) =>
            group.items ? (
              <div key={group.to} className={`drawer__group${expanded === i ? ' is-expanded' : ''}`}>
                <div className="drawer__group-head">
                  <NavLink to={group.to} end className="drawer__link">
                    {group.label}
                  </NavLink>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-expanded={expanded === i}
                    aria-label={`${expanded === i ? 'Hide' : 'Show'} ${group.label} brands`}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <Icon name="chevronDown" size={18} />
                  </button>
                </div>
                <div className="drawer__sub">
                  <div className="drawer__sub-inner">
                    {group.items.map((item) => (
                      <NavLink key={item.to} to={item.to} className="drawer__sublink" tabIndex={expanded === i ? 0 : -1}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={group.to} to={group.to} className="drawer__link">
                {group.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="drawer__contact">
          <p>
            <Icon name="pin" size={16} /> {fullAddress}
          </p>
          <p>
            <Icon name="clock" size={16} /> {SITE.hours.label}
          </p>
          <div className="drawer__actions">
            <a href={SITE.phoneHref} className="btn btn--primary">
              <Icon name="phone" /> Call
            </a>
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
              <Icon name="directions" /> Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const burgerRef = useRef(null);
  const { count, openList } = usePickup();
  const hydrated = useHydrated();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // "/" or Ctrl/Cmd+K opens search from anywhere
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '');
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // The drawer sits outside <header>: the header's backdrop-filter would
  // otherwise become the containing block for the drawer's position: fixed.
  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="site-header__inner">
          <Link to="/" className="site-header__logo" aria-label={`${SITE.name} home`}>
            <img src={SITE.logo} alt={SITE.name} width="166" height="40" />
          </Link>

          <DesktopNav />

          <div className="site-header__actions">
            <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search products" title="Search (/)">
              <Icon name="search" size={22} />
            </button>
            <button
              type="button"
              className="icon-btn site-header__bag"
              onClick={openList}
              aria-label={`Pickup list${hydrated && count ? `, ${count} items` : ''}`}
              title="Pickup list"
            >
              <Icon name="bag" size={22} />
              {hydrated && count ? <span className="site-header__badge">{count > 99 ? '99+' : count}</span> : null}
            </button>
            <a href={SITE.phoneHref} className="btn btn--primary btn--pill site-header__call" data-track="header">
              <Icon name="phone" />
              <span className="site-header__call-text">{SITE.phone}</span>
              <span className="site-header__call-short">Call</span>
            </a>
            <button
              type="button"
              className="icon-btn site-header__burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              ref={burgerRef}
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </header>
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={burgerRef} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
