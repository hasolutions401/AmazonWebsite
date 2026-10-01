// Pre-renders every route to static HTML after `vite build`, then writes
// legacy-URL redirects, sitemap.xml and robots.txt into dist/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');
const SITE_URL = 'https://amazonbazarct.com';

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, routes } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

const write = (file, html) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

const page = (url) => {
  const rendered = render(url);
  // React 19 emits <link rel="preload"> tags for images at the start of the
  // markup. They belong in <head> (and would break hydration inside #root).
  const leading = rendered.html.match(/^(?:<link [^>]*\/>)+/)?.[0] ?? '';
  const html = rendered.html.slice(leading.length);
  const preloads = (leading.match(/<link [^>]*\/>/g) ?? []).filter((l) => /fetchPriority="high"/.test(l));
  const head = [rendered.head, ...preloads].join('\n    ');
  return template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
};

for (const url of routes) {
  const html = page(url);
  if (url === '/') {
    write(path.join(dist, 'index.html'), html);
    continue;
  }
  // Both forms so /cigars and /cigars/ work on any static host
  write(path.join(dist, url, 'index.html'), html);
  write(path.join(dist, `${url}.html`), html);
}
write(path.join(dist, '404.html'), page('/404'));
console.log(`prerendered ${routes.length} pages + 404.html`);

// Old static-site URLs (still in Google's index and people's bookmarks) -> new pages
const LEGACY = {
  'Pages/Disposable-Vapes.html': '/disposable-vapes',
  'Pages/Pod-systems.html': '/pod-systems',
  'Pages/Nicotine-Pouches.html': '/nicotine-pouches',
  'Pages/Cig.html': '/cigarettes',
  'Pages/Cigarettes.html': '/cigarettes',
  'Pages/Cigar.html': '/cigars',
  'Pages/Accessories.html': '/accessories',
  'Pages/GKP.html': '/disposable-vapes/geek-bar',
  'Pages/Foger.html': '/disposable-vapes/foger',
  'Pages/Podsalt.html': '/disposable-vapes/pod-salt',
  'Pages/Tyson.html': '/disposable-vapes/tyson',
  'Pages/Oxbar.html': '/disposable-vapes/oxbar',
  'Pages/Upends.html': '/disposable-vapes/upends',
  'Pages/Yovo.html': '/disposable-vapes/yovo',
  'Pages/Raz.html': '/disposable-vapes/raz',
  'Pages/Airis.html': '/disposable-vapes/airis',
  'Pages/viho.html': '/disposable-vapes/viho',
  'Pages/luckywolf.html': '/disposable-vapes/lucky-wolf',
  'Pages/spaceman.html': '/disposable-vapes/space-man',
  'Pages/finestchamp.html': '/disposable-vapes/finest-champ',
  'Pages/sugardaddy.html': '/disposable-vapes/sugar-daddy',
  'Pages/swfticon.html': '/disposable-vapes/swft-icon',
  'Pages/zeronicotine.html': '/disposable-vapes/zero-nicotine',
  'Pages/glamee.html': '/disposable-vapes/glamee',
  'Pages/offstamp.html': '/disposable-vapes/off-stamp',
  'Pages/otherdisposiblevapes.html': '/disposable-vapes/other-disposable-vapes',
  'Pages/funky.html': '/disposable-vapes/funky',
  'Pages/vuse.html': '/pod-systems/vuse',
  'Pages/juul.html': '/pod-systems/juul',
  'Pages/zyn.html': '/nicotine-pouches/zyn',
  'Pages/sesh.html': '/nicotine-pouches/sesh',
  'Pages/skoal.html': '/nicotine-pouches/skoal',
};

const redirectHtml = (to) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITE_URL}${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)} + location.hash)</script>
</head><body><p>This page moved to <a href="${to}">${SITE_URL}${to}</a>.</p></body></html>
`;

const redirectLines = [];
for (const [from, to] of Object.entries(LEGACY)) {
  write(path.join(dist, from), redirectHtml(to));
  // Old menus also linked to lowercase file names on case-sensitive hosts
  const lower = from.replace(/[^/]+$/, (f) => f.toLowerCase());
  if (lower !== from) write(path.join(dist, lower), redirectHtml(to));
  redirectLines.push(`/${from}  ${to}  301`);
  if (lower !== from) redirectLines.push(`/${lower}  ${to}  301`);
}
// Netlify / Cloudflare Pages read this file and send real 301s
redirectLines.push('/index.html  /  301');
fs.writeFileSync(path.join(dist, '_redirects'), redirectLines.join('\n') + '\n');

// Apache / cPanel hosting: real 301s, extensionless URLs and the 404 page
const htaccess = [
  'Options -MultiViews',
  'ErrorDocument 404 /404.html',
  'RewriteEngine On',
  ...Object.entries(LEGACY).map(([from, to]) => `RewriteRule ^${from.replace(/\./g, '\\.')}$ ${to} [R=301,NC,L]`),
  '# /cigars -> /cigars.html',
  'RewriteCond %{REQUEST_FILENAME} !-f',
  'RewriteCond %{REQUEST_FILENAME}.html -f',
  'RewriteRule ^(.+?)/?$ $1.html [L]',
  '',
  '<IfModule mod_expires.c>',
  '  ExpiresActive On',
  '  ExpiresByType image/webp "access plus 30 days"',
  '  ExpiresByType text/css "access plus 1 year"',
  '  ExpiresByType application/javascript "access plus 1 year"',
  '</IfModule>',
].join('\n');
fs.writeFileSync(path.join(dist, '.htaccess'), htaccess + '\n');

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod><priority>${u === '/' ? '1.0' : u.split('/').length > 2 ? '0.7' : '0.8'}</priority></url>`)
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

fs.rmSync(ssrDir, { recursive: true, force: true });
console.log(`wrote ${Object.keys(LEGACY).length} legacy redirects, sitemap.xml, robots.txt`);
