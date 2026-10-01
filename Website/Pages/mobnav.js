/**
 * =====================================================
 *  AMAZON BAZAR — Universal Mobile Nav & Responsive
 *  Link this ONE file on every page and get:
 *  1) Hamburger button (blue, same as homepage)
 *  2) Slide-in drawer with submenus
 *  3) Images auto-adjust (hero, gallery, cards)
 *  4) Category card grid responsive
 *  5) Product page: price+stock strip auto-injected
 *     under image — never scrolls away (mobile only)
 * =====================================================
 */

(function () {
  if (document.documentElement.dataset.mobnavReady === 'true') return;
  document.documentElement.dataset.mobnavReady = 'true';

  const onIdle = (cb, timeout = 600) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb, { timeout });
      return;
    }
    window.setTimeout(cb, 1);
  };

  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* ── CONSTANTS ─────────────────────────────────── */
  const C = {
    PRIMARY: '#0ea5ff',
    DARK_BG: '#0a1120',
    Z_HAMBURGER: 2000,
    Z_DRAWER: 2050,
    Z_PRICE_STRIP: 20,
    MOBILE_BREAKPOINT: 768,
    TRANSITION_FAST: '0.2s',
    TRANSITION_MED: '0.3s',
    TRANSITION_SLOW: '0.35s',
    IDLE_TIMEOUT: 600
  };

  const NAV_MODEL = {
    groups: [
      {
        title: 'Disposable Vapes',
        href: 'Pages/Disposable-Vapes.html',
        items: [
          { label: 'Geek Bar', href: 'Pages/GKP.html' },
          { label: 'Foger', href: 'Pages/Foger.html' },
          { label: 'Pod Salt', href: 'Pages/Podsalt.html' },
          { label: 'Tyson', href: 'Pages/Tyson.html' },
          { label: 'Oxbar', href: 'Pages/Oxbar.html' },
          { label: 'Upends', href: 'Pages/Upends.html' },
          { label: 'Yovo', href: 'Pages/Yovo.html' },
          { label: 'Raz', href: 'Pages/Raz.html' },
          { label: 'Airis', href: 'Pages/Airis.html' },
          { label: 'Viho', href: 'Pages/viho.html' },
          { label: 'Lucky Wolf', href: 'Pages/luckywolf.html' },
          { label: 'Space Man', href: 'Pages/spaceman.html' },
          { label: 'Finest Champ', href: 'Pages/finestchamp.html' },
          { label: 'Sugar Daddy', href: 'Pages/sugardaddy.html' },
          { label: 'SWFT iCON', href: 'Pages/swfticon.html' },
          { label: 'Zero Nicotine', href: 'Pages/zeronicotine.html' },
          { label: 'Glamee', href: 'Pages/glamee.html' },
          { label: 'Off Stamp', href: 'Pages/offstamp.html' },
          { label: 'Other Disposable Vapes', href: 'Pages/otherdisposiblevapes.html' },
          { label: 'Funky', href: 'Pages/funky.html' }
        ]
      },
      {
        title: 'Pod System',
        href: 'Pages/Pod-systems.html',
        items: [
          { label: 'VUSE', href: 'Pages/vuse.html' },
          { label: 'JUUL', href: 'Pages/juul.html' }
        ]
      },
      {
        title: 'Nicotine Pouches',
        href: 'Pages/Nicotine-Pouches.html',
        items: [
          { label: 'ZYN', href: 'Pages/zyn.html' },
          { label: 'Sesh+', href: 'Pages/sesh.html' },
          { label: 'Skoal', href: 'Pages/skoal.html' }
        ]
      }
    ],
    links: [
      { label: 'Home', href: '/index.html' },
      { label: 'Cigarettes', href: 'Pages/Cig.html' },
      { label: 'Cigars', href: 'Pages/Cigar.html' },
      { label: 'Hookahs and Accessories', href: 'Pages/Accessories.html' }
    ]
  };

  const inPagesDir = () => /\/pages\//i.test(window.location.pathname);

  const toPageHref = (path) => {
    if (!path) return '#';
    return inPagesDir() ? path.replace(/^Pages\//i, '') : path;
  };

  const normalizePath = (href) => {
    try {
      return new URL(href, window.location.href)
        .pathname
        .replace(/\/{2,}/g, '/')
        .replace(/\/$/, '')
        .toLowerCase();
    } catch (_) {
      return String(href || '').toLowerCase();
    }
  };

  const isHomePath = (path) => {
    const normalized = normalizePath(path);
    return normalized === '' || normalized === '/' || normalized.endsWith('/index.html') || normalized.endsWith('/index.html');
  };

  const setActiveState = (linkEl, isActive) => {
    if (!linkEl) return;
    linkEl.classList.toggle('active', Boolean(isActive));
    if (isActive) linkEl.setAttribute('aria-current', 'page');
    else linkEl.removeAttribute('aria-current');
  };

  const isActiveHref = (href) => {
    const targetPath = normalizePath(href);
    const currentPath = normalizePath(window.location.href);
    if (targetPath === currentPath) return true;
    if (isHomePath(targetPath) && isHomePath(currentPath)) return true;
    return false;
  };

  /* ── 1. INJECT CSS ─────────────────────────────── */
  const styleId = 'amazon-bazar-mobnav-style';
  const style = document.getElementById(styleId) || document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 28px;
      height: 20px;
      background: 0;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-left: auto;
      z-index: ${C.Z_HAMBURGER};
      flex-shrink: 0;
    }
    .hamburger span {
      display: block;
      height: 3px;
      width: 100%;
      background: ${C.PRIMARY};
      border-radius: 3px;
      transition: all ${C.TRANSITION_MED} ease;
    }
    .hamburger.open span:nth-child(1) { transform: translateY(8.5px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-8.5px) rotate(-45deg); }
    .nav-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: ${C.Z_HAMBURGER};
      transition: ${C.TRANSITION_MED};
    }
    .nav-overlay.active { display: block; }
    .mobile-drawer {
      position: fixed;
      top: 0;
      right: -100%;
      width: 78%;
      max-width: 310px;
      height: 100vh;
      background: ${C.DARK_BG};
      z-index: ${C.Z_DRAWER};
      padding: 80px 0 30px;
      overflow-y: auto;
      transition: right ${C.TRANSITION_SLOW} ease;
      display: flex;
      flex-direction: column;
      box-shadow: -5px 0 20px rgba(0,0,0,0.6);
      will-change: right;
      overscroll-behavior: contain;
    }
    .mobile-drawer.open { right: 0; }
    .logo {
      display: flex !important;
      align-items: center !important;
      line-height: 0 !important;
      flex-shrink: 0 !important;
    }
    .logo > a {
      display: inline-flex !important;
      align-items: center !important;
    }
    .logo img {
      height: 85px !important;
      width: auto !important;
      max-width: none !important;
      object-fit: contain !important;
      display: block !important;
      filter: drop-shadow(0 0 15px #00bfff) drop-shadow(0 0 35px #0077ff) !important;
      transform: translateZ(0);
      transition: transform ${C.TRANSITION_MED} ease, filter ${C.TRANSITION_MED} ease;
    }
    @keyframes mobileLogoGlow {
      0%, 100% {
        filter: drop-shadow(0 0 15px #00bfff) drop-shadow(0 0 35px #0077ff);
      }
      50% {
        filter: drop-shadow(0 0 22px #38bdf8) drop-shadow(0 0 52px #0ea5ff);
      }
    }
    @media (min-width: ${C.MOBILE_BREAKPOINT + 1}px) {
      .logo {
        justify-content: center !important;
        width: 100% !important;
      }
      .logo > a {
        margin: 0 auto !important;
        justify-content: center !important;
      }
    }
    .mobile-drawer a {
      color: #fff;
      text-decoration: none;
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 500;
      padding: 16px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: block;
      position: relative;
      transition: color ${C.TRANSITION_FAST}, background ${C.TRANSITION_FAST};
      text-align: left;
      -webkit-tap-highlight-color: transparent;
    }
    .mobile-drawer a:focus,
    .mobile-drawer a:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    .mobile-drawer a::after {
      content: none !important;
      display: none !important;
    }
    .mobile-drawer a.active,
    .mobile-drawer a[aria-current="page"] {
      color: ${C.PRIMARY};
    }
    .mobile-drawer a.active::after,
    .mobile-drawer a[aria-current="page"]::after { display: none !important; }
    @media (hover: hover) {
      .mobile-drawer a:hover {
        background: rgba(14,165,255,0.08);
        color: ${C.PRIMARY};
      }
      .mobile-drawer a:hover::after { display: none !important; }
    }
    .drawer-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      cursor: pointer;
      transition: background ${C.TRANSITION_FAST};
      -webkit-tap-highlight-color: transparent;
    }
    .drawer-toggle:focus,
    .drawer-toggle:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    .drawer-toggle:hover { background: rgba(255,255,255,0.04); }
    .drawer-toggle .drawer-title {
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.2;
    }
    .drawer-toggle .arrow {
      color: #aaa;
      font-size: 13px;
      transition: transform ${C.TRANSITION_MED};
      flex-shrink: 0;
    }
    .drawer-toggle.active-group > .drawer-title,
    .drawer-toggle[aria-current="page"] > .drawer-title {
      color: ${C.PRIMARY};
    }
    .drawer-toggle.active-group .arrow,
    .drawer-toggle[aria-current="page"] .arrow {
      color: ${C.PRIMARY};
    }
    .drawer-toggle.active-toggle .arrow { transform: rotate(180deg); }
    .drawer-toggle.active-toggle > .drawer-title { color: ${C.PRIMARY}; }
    .drawer-submenu { display: none; flex-direction: column; background: rgba(14,165,255,0.05); }
    .drawer-submenu.open { display: flex; }
    .drawer-submenu a {
      padding: 13px 44px !important;
      font-size: 14px !important;
      color: #94a3b8 !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
    }
    .drawer-submenu a::after {
      left: 44px;
      right: 44px;
    }
    .drawer-submenu a:hover { color: ${C.PRIMARY} !important; background: 0 !important; }
    .nicotine-ribbon {
      margin: 0 0 46px;
      background: linear-gradient(90deg, #0a2b62, #0e4aa8, #0a2b62);
      border-top: 1px solid rgba(125, 211, 252, 0.35);
      border-bottom: 1px solid rgba(56, 189, 248, 0.25);
      overflow: hidden;
      position: relative;
    }
    .nicotine-ribbon::before,
    .nicotine-ribbon::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 58px;
      z-index: 2;
      pointer-events: none;
    }
    .nicotine-ribbon::before { left: 0; background: linear-gradient(90deg, rgba(11,17,32,.55), transparent); }
    .nicotine-ribbon::after { right: 0; background: linear-gradient(270deg, rgba(11,17,32,.55), transparent); }
    .nicotine-ribbon-track {
      display: flex;
      align-items: center;
      white-space: nowrap;
      will-change: transform;
      animation: nicotineRibbonSlide 22s linear infinite;
    }
    .nicotine-ribbon-track span {
      display: inline-flex;
      align-items: center;
      padding: 12px 24px;
      color: #eaf6ff;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: .2px;
      text-transform: uppercase;
    }
    .nicotine-ribbon-track span::before {
      content: '\\26A0';
      font-size: 12px;
      margin-right: 10px;
      color: #7dd3fc;
      opacity: .95;
    }
    @keyframes nicotineRibbonSlide {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @media (max-width: ${C.MOBILE_BREAKPOINT}px) {
      .hamburger { display: flex !important; }
      .nav-links { display: none !important; }
      .mobile-drawer a::after { content: none !important; display: none !important; }
      .flavor-section,
      #flavorGrid,
      .product-image {
        scroll-margin-top: 82px !important;
      }
      nav {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 20px !important;
        height: 70px !important;
        text-align: left !important;
      }
      .logo img {
        height: 45px !important;
        animation: mobileLogoGlow 2.4s ease-in-out infinite !important;
        will-change: filter;
      }
      .nicotine-ribbon {
        margin: 10px 0 34px;
      }
      .nicotine-ribbon::before,
      .nicotine-ribbon::after {
        width: 24px;
      }
      .nicotine-ribbon-track {
        animation-duration: 14s;
      }
      .nicotine-ribbon-track span {
        font-size: 11px;
        padding: 10px 14px;
      }
      .nicotine-ribbon-track span::before {
        font-size: 10px;
        margin-right: 7px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .nicotine-ribbon-track {
        animation: none !important;
      }
    }
  `;
  if (!style.parentNode) {
    document.head.appendChild(style);
  }

  /* ── 1.25 ENSURE BASE NAV EXISTS ────────────── */
  function ensureBaseNav() {
    const homeHref = inPagesDir() ? '../index.html' : 'index.html';
    const logoSrc = inPagesDir() ? '../Images/logo.webp' : 'Images/logo.webp';

    let nav = document.querySelector('nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.innerHTML = `
        <div class="logo">
          <a href="${homeHref}">
            <img src="${logoSrc}" alt="Amazon Bazar Logo">
          </a>
        </div>
        <div class="nav-links"></div>
      `;
      document.body.insertAdjacentElement('afterbegin', nav);
    }

    if (!nav.querySelector('.logo')) {
      const logo = document.createElement('div');
      logo.className = 'logo';
      logo.innerHTML = `<a href="${homeHref}"><img src="${logoSrc}" alt="Amazon Bazar Logo"></a>`;
      nav.insertAdjacentElement('afterbegin', logo);
    }

    if (!nav.querySelector('.nav-links')) {
      const navLinks = document.createElement('div');
      navLinks.className = 'nav-links';
      nav.appendChild(navLinks);
    }
  }


  /* ── 1.5 SYNC DESKTOP NAV ────────────────────── */
  function syncDesktopNav() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    navLinks.innerHTML = '';

    const homeItem = NAV_MODEL.links.find((item) => item.label === 'Home');
    if (homeItem) {
      const homeAnchor = document.createElement('a');
      homeAnchor.href = toPageHref(homeItem.href);
      homeAnchor.textContent = homeItem.label;
      setActiveState(homeAnchor, isActiveHref(homeAnchor.href));
      navLinks.appendChild(homeAnchor);
    }

    NAV_MODEL.groups.forEach((group) => {
      const dropdown = document.createElement('div');
      dropdown.className = 'dropdown';

      const main = document.createElement('a');
      const mainHref = toPageHref(group.href);
      main.href = mainHref;
      main.className = 'drop-trigger';
      main.textContent = `${group.title} ▾`;

      const menu = document.createElement('div');
      menu.className = 'dropdown-menu';

      const childHrefs = [];
      group.items.forEach((item) => {
        const a = document.createElement('a');
        a.href = toPageHref(item.href);
        a.textContent = item.label;
        setActiveState(a, isActiveHref(a.href));
        childHrefs.push(a.href);
        menu.appendChild(a);
      });

      setActiveState(main, isActiveHref(mainHref) || childHrefs.some((href) => isActiveHref(href)));

      dropdown.appendChild(main);
      dropdown.appendChild(menu);
      navLinks.appendChild(dropdown);
    });

    NAV_MODEL.links.forEach((item) => {
      if (item.label === 'Home') return;
      const a = document.createElement('a');
      a.href = toPageHref(item.href);
      a.textContent = item.label;
      setActiveState(a, isActiveHref(a.href));
      navLinks.appendChild(a);
    });
  }


  /* ── 2. INJECT HAMBURGER ──────────────────────── */
  function injectHamburger() {
    const nav = document.querySelector('nav');
    if (!nav || document.getElementById('hamburgerBtn')) return;
    const btn = document.createElement('button');
    btn.className = 'hamburger';
    btn.id = 'hamburgerBtn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mobileDrawer');
    btn.innerHTML = '<span></span><span></span><span></span>';
    const logo = nav.querySelector('.logo');
    (logo || nav).insertAdjacentElement(logo ? 'afterend' : 'afterbegin', btn);
  }

  /* ── 3. INJECT OVERLAY ────────────────────────── */
  function injectOverlay() {
    if (!document.getElementById('navOverlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.id = 'navOverlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.insertAdjacentElement('afterbegin', overlay);
    }
  }

  /* ── 4. INJECT DRAWER ─────────────────────────── */
  function injectDrawer() {
    if (document.getElementById('mobileDrawer')) return;
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const homeHref = inPagesDir() ? '../index.html' : 'index.html';
    const seenLinks = new Set();
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobileDrawer';
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'Mobile navigation');
    drawer.setAttribute('aria-hidden', 'true');

    const homePath = normalizePath(homeHref);
    seenLinks.add(homePath);
    const homeLink = document.createElement('a');
    homeLink.href = homeHref;
    homeLink.textContent = 'Home';
    setActiveState(homeLink, isActiveHref(homeHref));
    drawer.appendChild(homeLink);

    const cleanText = (txt) => String(txt || '').replace('▾', '').trim();
    const normalizeDrawerLabel = (label, href = '') => {
      const hrefText = String(href || '').toLowerCase();
      if (hrefText.includes('accessories.html')) {
        return 'Hookahs and Accessories';
      }
      if (/^hookahs?$/i.test(label) || /^accessories$/i.test(label) || /^accessories\s*(and|&)\s*hookahs?$/i.test(label)) {
        return 'Hookahs and Accessories';
      }
      return label;
    };

    navLinks.querySelectorAll(':scope > a, :scope > .dropdown').forEach(function(item) {
      if (item.tagName === 'A') {
        const normalized = normalizePath(item.href);
        if (seenLinks.has(normalized)) return;
        seenLinks.add(normalized);

        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = normalizeDrawerLabel(cleanText(item.textContent), a.href);
        setActiveState(a, item.classList.contains('active') || isActiveHref(a.href));
        drawer.appendChild(a);
      } else if (item.classList.contains('dropdown')) {
        const mainLink = item.querySelector(':scope > a') || item.querySelector('a');
        const subLinks = item.querySelectorAll('.dropdown-menu a');
        const id = 'drawerDrop_' + Math.random().toString(36).slice(2, 7);
        const toggle = document.createElement('div');
        toggle.className = 'drawer-toggle';
        toggle.id = id;
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        const mainLabel = normalizeDrawerLabel(cleanText(mainLink.textContent), mainLink ? mainLink.href : '');
        if (mainLink && mainLink.href) {
          toggle.setAttribute('data-main-href', mainLink.href);
        }
        toggle.setAttribute('aria-label', mainLabel + ' menu');
        toggle.innerHTML = `<span class="drawer-title">${mainLabel}</span><span class="arrow">▾</span>`;
        drawer.appendChild(toggle);
        const submenu = document.createElement('div');
        submenu.className = 'drawer-submenu';
        submenu.id = id + 'Menu';
        toggle.setAttribute('aria-controls', submenu.id);
        submenu.setAttribute('aria-label', mainLabel + ' submenu');
        submenu.setAttribute('aria-hidden', 'true');
        let hasActiveChild = false;
        subLinks.forEach((sl) => {
          const normalized = normalizePath(sl.href);
          if (seenLinks.has(normalized)) return;
          seenLinks.add(normalized);

          const a = document.createElement('a');
          a.href = sl.href;
          a.textContent = normalizeDrawerLabel(sl.textContent.trim(), a.href);
          const isChildActive = isActiveHref(a.href);
          if (isChildActive) hasActiveChild = true;
          setActiveState(a, isChildActive);
          submenu.appendChild(a);
        });

        const isMainActive = Boolean(mainLink && mainLink.href && isActiveHref(mainLink.href));
        const isGroupActive = isMainActive || hasActiveChild;
        if (isGroupActive) {
          toggle.classList.add('active-group');
          toggle.setAttribute('aria-current', 'page');
        }

        drawer.appendChild(submenu);
      }
    });

    // Final safeguard so legacy/cached nav text cannot show old label.
    drawer.querySelectorAll('a[href]').forEach((linkEl) => {
      if (normalizePath(linkEl.href).endsWith('/pages/accessories.html') || normalizePath(linkEl.href).endsWith('/accessories.html')) {
        linkEl.textContent = 'Hookahs and Accessories';
      }
    });

    document.querySelector('nav').insertAdjacentElement('afterend', drawer);
  }


  /* ── 5. BIND NAV EVENTS ───────────────────────── */
  function bindEvents() {
    const btn = document.getElementById('hamburgerBtn');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('navOverlay');
    if (!btn || !drawer || !overlay) return;

    let drawerOpen = false;
    let lastFocusedEl = null;
    let resizeRaf = null;
    const bodyOverflow = document.body.style.overflow;

    const getFocusableEls = () =>
      Array.from(drawer.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetParent !== null && !el.hasAttribute('disabled'));

    const trapFocus = (e) => {
      if (!drawerOpen || e.key !== 'Tab') return;

      const focusables = getFocusableEls();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    const setDrawerState = (isOpen) => {
      drawerOpen = isOpen;
      btn.classList.toggle('open', isOpen);
      drawer.classList.toggle('open', isOpen);
      overlay.classList.toggle('active', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      document.body.style.overflow = isOpen ? 'hidden' : bodyOverflow;

      if (isOpen) {
        lastFocusedEl = document.activeElement;
        const focusables = getFocusableEls();
        const isTouchPointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        if (!isTouchPointer && focusables.length) focusables[0].focus();
      } else if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setDrawerState(!drawer.classList.contains('open'));
    });

    overlay.addEventListener('click', () => setDrawerState(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerState(false);
        return;
      }
      trapFocus(e);
    });

    document.addEventListener('click', (e) => {
      if (!drawerOpen) return;
      const target = e.target;
      if (!target) return;
      if (drawer.contains(target) || btn.contains(target) || overlay.contains(target)) return;
      setDrawerState(false);
    }, true);

    window.addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        if (window.innerWidth > C.MOBILE_BREAKPOINT && drawerOpen) {
          setDrawerState(false);
        }
      });
    }, { passive: true });

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setDrawerState(false));
    });

    drawer.querySelectorAll('.drawer-toggle').forEach((toggle) => {
      const onToggle = (e) => {
        e.stopPropagation();
        const submenu = document.getElementById(toggle.id + 'Menu');
        if (submenu) {
          const isCurrentlyOpen = submenu.classList.contains('open');
          const mainHref = toggle.getAttribute('data-main-href') || '';

          // First tap opens submenu, second tap navigates to parent category page.
          if (isCurrentlyOpen && mainHref && mainHref !== '#') {
            window.location.href = mainHref;
            return;
          }

          const nextOpen = !isCurrentlyOpen;
          submenu.classList.toggle('open', nextOpen);
          toggle.classList.toggle('active-toggle', nextOpen);
          toggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
          submenu.setAttribute('aria-hidden', nextOpen ? 'false' : 'true');
        }
      };

      toggle.addEventListener('click', onToggle);
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(e);
        }
      });
    });
  }


  /* ── 6. PRODUCT PAGE: PRICE+STOCK STRIP ──────── */
  function injectPriceStrip() {
    if (window.innerWidth > C.MOBILE_BREAKPOINT) return;
    const productImage = document.querySelector('.product-image');
    if (!productImage || document.getElementById('mobPriceStrip')) return;

    const strip = document.createElement('div');
    strip.className = 'mob-price-strip';
    strip.id = 'mobPriceStrip';
    strip.innerHTML = '<span class="mps-price" id="mpsPrice"></span><span class="mps-stock" id="mpsStock"></span>';
    productImage.insertAdjacentElement('afterend', strip);

    const syncPrice = () => {
      const priceEl = document.getElementById('mpsPrice');
      const src = document.querySelector('.price');
      if (!priceEl || !src) return;

      const raw = src.textContent.trim();
      const match = raw.match(/^(\D*)(\d+)([\.,]\d+)?$/);
      if (match) {
        const [, sym, whole, cents] = match;
        priceEl.innerHTML = `<span class="mps-sym">${sym || '$'}</span><span class="mps-whole">${whole}</span>${cents ? `<span class="mps-cents">${cents}</span>` : ''}`;
      } else {
        priceEl.textContent = raw;
      }
    };

    const syncStock = () => {
      const stockEl = document.getElementById('mpsStock');
      const st = document.querySelector('.stock-status');
      if (!stockEl || !st) return;

      stockEl.textContent = st.textContent.trim();
      const isIn = st.classList.contains('in-stock') || st.textContent.toLowerCase().includes('available');
      stockEl.className = 'mps-stock ' + (isIn ? 'in-stock' : 'out-stock');
    };

    const sync = () => { syncPrice(); syncStock(); };
    sync();

    const info = document.querySelector('.product-info');
    if (info) {
      const observer = new MutationObserver(sync);
      observer.observe(info, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class']
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > C.MOBILE_BREAKPOINT) {
          observer.disconnect();
        }
      }, { passive: true, once: true });
    }
  }


  /* ── 7. IMAGE SWAP HELPER ─────────────────────── */
  function initImageSwap() {
    const img = document.getElementById('mainProductImage');
    if (!img) return;

    const scrollWithOffset = (el, topGap = 12) => {
      if (!el || window.innerWidth > C.MOBILE_BREAKPOINT) return;
      const nav = document.querySelector('nav');
      const navHeight = nav ? nav.getBoundingClientRect().height : 70;
      const top = window.scrollY + el.getBoundingClientRect().top - navHeight + topGap;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    const scrollToImage = () => {
      if (window.innerWidth <= C.MOBILE_BREAKPOINT) {
        const w = document.querySelector('.product-image');
        if (w) scrollWithOffset(w, 24);
      }
    };

    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'style') {
          if (img.style.opacity === '0') img.style.transform = 'scale(0.95)';
          if (img.style.opacity === '1') {
            img.style.transform = 'scale(1)';
            setTimeout(scrollToImage, 100);
          }
        }
      });
    }).observe(img, { attributes: true, attributeFilter: ['style'] });

    new MutationObserver(() => {
      setTimeout(scrollToImage, 250);
    }).observe(img, { attributes: true, attributeFilter: ['src'] });
  }

  function initListingAutoFlow() {
    const isMobile = () => window.innerWidth <= C.MOBILE_BREAKPOINT;

    const scrollWithOffset = (el, topGap = 12) => {
      if (!el || !isMobile()) return;
      const nav = document.querySelector('nav');
      const navHeight = nav ? nav.getBoundingClientRect().height : 70;
      const top = window.scrollY + el.getBoundingClientRect().top - navHeight + topGap;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    const scrollToFlavorSection = () => {
      if (!isMobile()) return;
      const flavorGrid = document.getElementById('flavorGrid') || document.getElementById('variantGrid');
      if (!flavorGrid) return;
      const target = flavorGrid.closest('.flavor-section') || flavorGrid;
      scrollWithOffset(target, 8);
    };

    const scrollToProductImage = () => {
      if (!isMobile()) return;
      const imageWrap = document.querySelector('.product-image');
      if (!imageWrap) return;
      scrollWithOffset(imageWrap, 24);
    };

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;

      const modelOption = target.closest('#brandGrid .flavor-option, #modelGrid .flavor-option');
      if (modelOption) {
        // Let page scripts update variants first, then move user to flavor list.
        window.setTimeout(scrollToFlavorSection, 180);
        return;
      }

      const flavorOption = target.closest('#flavorGrid .flavor-option, #variantGrid .flavor-option');
      if (flavorOption) {
        // Give image swap handlers time to apply, then reveal the product image.
        window.setTimeout(scrollToProductImage, 240);
      }
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const active = document.activeElement;
      if (!active) return;

      if (active.matches('#brandGrid .flavor-option, #modelGrid .flavor-option')) {
        window.setTimeout(scrollToFlavorSection, 180);
        return;
      }

      if (active.matches('#flavorGrid .flavor-option, #variantGrid .flavor-option')) {
        window.setTimeout(scrollToProductImage, 240);
      }
    });
  }

  function shouldInjectNicotineRibbon() {
    const path = (window.location.pathname || '').toLowerCase();
    const file = path.split('/').pop() || '';

    const excludedPages = new Set([
      '',
      'index.html',
      'homepage.html',
      'accessories.html',
      'seo-optimized-template.html',
      'zeronicotine.html'
    ]);

    if (excludedPages.has(file)) return false;
    if (!/\/pages\//i.test(path)) return false;
    return true;
  }

  function injectNicotineRibbon() {
    if (!shouldInjectNicotineRibbon()) return;
    if (document.querySelector('.nicotine-ribbon')) return;

    const main = document.querySelector('main') || document.getElementById('main-content');
    if (!main) return;

    const ribbon = document.createElement('section');
    ribbon.className = 'nicotine-ribbon';
    ribbon.setAttribute('aria-label', 'Nicotine warning ticker');
    ribbon.innerHTML = `
      <div class="nicotine-ribbon-track">
        <span>This product contains nicotine. Nicotine is an addictive chemical.</span>
        <span>This product contains nicotine. Nicotine is an addictive chemical.</span>
        <span>This product contains nicotine. Nicotine is an addictive chemical.</span>
        <span>This product contains nicotine. Nicotine is an addictive chemical.</span>
      </div>
    `;

    const hero = document.querySelector('.hero');
    if (hero && hero.parentNode) {
      hero.insertAdjacentElement('afterend', ribbon);
      return;
    }

    main.insertAdjacentElement('beforebegin', ribbon);
  }

  function optimizeImages() {
    document.querySelectorAll('img').forEach((img) => {
      if (img.dataset.mobnavOptimized === 'true') return;

      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      if (!img.hasAttribute('loading') && img.getAttribute('fetchpriority') !== 'high' && !img.classList.contains('hero-img')) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.hasAttribute('referrerpolicy') && /^https?:\/\//i.test(img.currentSrc || img.src || '')) {
        img.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      }

      img.dataset.mobnavOptimized = 'true';
    });
  }

  /* ── 8. REMOVE UNWANTED HEADER UI ────────────── */
  function cleanupHeaderNoise() {
    // Remove only duplicated search controls inside nav/header wrappers.
    // This keeps intentional page promo content intact.
    const noisySelectors = [
      'header .search',
      'header .search-box',
      'header .search-bar',
      'header .search-container',
      'header .search-icon',
      'header .search-btn',
      'header .search-toggle',
      'nav .search',
      'nav .search-box',
      'nav .search-bar',
      'nav .search-container',
      'nav .search-icon',
      'nav .search-btn',
      'nav .search-toggle'
    ];

    noisySelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el || el.id === 'navOverlay' || el.id === 'mobileDrawer') return;
        el.remove();
      });
    });
  }

  /* ── 9. INIT ──────────────────────────────────── */
  const init = () => {
    // Critical path for usable navigation.
    [cleanupHeaderNoise, ensureBaseNav, syncDesktopNav, injectHamburger, injectOverlay, injectDrawer, bindEvents, injectNicotineRibbon].forEach((f) => f());

    // Defer non-critical helpers to reduce main-thread contention on first paint.
    onIdle(() => {
      optimizeImages();
      injectPriceStrip();
      initImageSwap();
      initListingAutoFlow();
    }, C.IDLE_TIMEOUT);
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();