// Google Analytics 4 — completely off unless VITE_GA_ID is set (see .env.example).
// Tracks page views plus the actions that matter for a local shop:
// calls, directions, texted pickup orders, searches and pickup-list adds.
const GA_ID = import.meta.env.VITE_GA_ID;

let ready = false;

export function initAnalytics() {
  if (ready || !GA_ID || typeof window === 'undefined') return;
  ready = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
  };
  window.gtag('js', new Date());
  // Page views are sent manually on route changes (single-page navigation)
  window.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  // One listener catches every call / directions / text link on the site
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href');
    const where = a.closest('[data-track]')?.getAttribute('data-track') || location.pathname;
    if (href.startsWith('tel:')) track('call_click', { location: where });
    else if (href.startsWith('sms:')) track('text_click', { location: where });
    else if (/google\.[a-z.]+\/maps/.test(href)) track('directions_click', { location: where });
  });
}

export function track(event, params = {}) {
  if (ready && window.gtag) window.gtag('event', event, params);
}

export function trackPageView(path) {
  if (ready && window.gtag) window.gtag('event', 'page_view', { page_path: path, page_title: document.title });
}
