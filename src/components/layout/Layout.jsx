import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SITE } from '../../data/site.js';
import { trackPageView } from '../../lib/analytics.js';
import { PickupProvider } from '../pickup/PickupContext.jsx';
import PickupDrawer, { PickupToast } from '../pickup/PickupDrawer.jsx';
import Icon from '../ui/Icon.jsx';
import AgeGate from './AgeGate.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import './Layout.css';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function PageViews() {
  const { pathname } = useLocation();
  // Runs after <Seo> has set the new document.title
  useEffect(() => {
    const t = setTimeout(() => trackPageView(pathname), 0);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <PickupProvider>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <ScrollToTop />
      <PageViews />
      <AgeGate />
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <a href={SITE.phoneHref} className="call-fab" aria-label={`Call ${SITE.name} at ${SITE.phone}`} data-track="floating-call">
        <Icon name="phone" size={20} />
        <span>Call Now</span>
      </a>
      <PickupDrawer />
      <PickupToast />
    </PickupProvider>
  );
}
