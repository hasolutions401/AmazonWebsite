import { createContext, useContext, useEffect } from 'react';
import { SITE } from '../data/site.js';

/**
 * Per-page <head> tags. During pre-rendering the tags are collected into the
 * HeadContext and written into the static HTML; in the browser they are
 * applied to document.head whenever the page changes.
 */
export const HeadContext = createContext(null);

const absolute = (path = '/') => (path.startsWith('http') ? path : SITE.url + encodeURI(path));

export function buildHead({ title, description, path = '/', image, type = 'website', jsonLd = [], noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} | Smoke Shop in Uncasville, CT`;
  const img = absolute(image || SITE.ogImage);
  const url = absolute(path);
  return {
    title: fullTitle,
    canonical: url,
    meta: [
      { name: 'description', content: description },
      { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: img },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: img },
    ].filter((m) => m.content),
    jsonLd: [].concat(jsonLd).filter(Boolean),
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function headToHtml(head) {
  if (!head) return '';
  const metas = head.meta
    .map((m) => `<meta ${m.name ? `name="${m.name}"` : `property="${m.property}"`} content="${esc(m.content)}" data-seo>`)
    .join('\n    ');
  const ld = head.jsonLd
    .map((j) => `<script type="application/ld+json" data-seo>${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
  return [`<title>${esc(head.title)}</title>`, metas, `<link rel="canonical" href="${esc(head.canonical)}" data-seo>`, ld]
    .filter(Boolean)
    .join('\n    ');
}

function applyHead(head) {
  document.title = head.title;
  document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
  const frag = document.createDocumentFragment();
  head.meta.forEach((m) => {
    const el = document.createElement('meta');
    if (m.name) el.setAttribute('name', m.name);
    else el.setAttribute('property', m.property);
    el.setAttribute('content', m.content);
    el.setAttribute('data-seo', '');
    frag.appendChild(el);
  });
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = head.canonical;
  link.setAttribute('data-seo', '');
  frag.appendChild(link);
  head.jsonLd.forEach((j) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(j);
    s.setAttribute('data-seo', '');
    frag.appendChild(s);
  });
  document.head.appendChild(frag);
}

export default function Seo(props) {
  const ctx = useContext(HeadContext);
  const head = buildHead(props);
  if (ctx) ctx.head = head; // server render: collected by the pre-renderer

  const key = JSON.stringify(head);
  useEffect(() => {
    applyHead(JSON.parse(key));
  }, [key]);

  return null;
}
