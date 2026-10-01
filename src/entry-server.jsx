import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App.jsx';
import { HeadContext, headToHtml } from './components/Seo.jsx';
import { BRANDS, CATEGORIES, brandPath } from './data/catalog.js';

/** Every URL that gets its own static HTML file. */
export const routes = [
  '/',
  ...CATEGORIES.map((c) => `/${c.slug}`),
  ...BRANDS.filter((b) => b.slug !== b.category).map(brandPath),
];

export function render(url) {
  const ctx = { head: null };
  const html = renderToString(
    <StrictMode>
      <HeadContext.Provider value={ctx}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  );
  return { html, head: headToHtml(ctx.head) };
}
