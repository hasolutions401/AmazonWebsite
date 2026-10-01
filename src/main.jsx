import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import { initAnalytics } from './lib/analytics.js';

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Pages are pre-rendered at build time; in dev the root starts empty.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);

initAnalytics();

// Offline support + "install app" (production only, so dev never serves stale files)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
