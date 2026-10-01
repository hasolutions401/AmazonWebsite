import { useEffect, useState } from 'react';
import { track } from '../lib/analytics.js';
import Icon from './ui/Icon.jsx';

/** "Install app" button — only rendered when the browser can actually install the site. */
export default function InstallApp() {
  const [prompt, setPrompt] = useState(null);
  const [ios, setIos] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) return undefined;
    // iPhone/iPad Safari has no install prompt; show instructions instead
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (prompt) {
    return (
      <button
        type="button"
        className="footer__install"
        onClick={async () => {
          prompt.prompt();
          const { outcome } = await prompt.userChoice;
          track('install_app', { outcome });
          setPrompt(null);
        }}
      >
        <Icon name="download" size={16} /> Install the Amazon Bazar app
      </button>
    );
  }

  if (ios) {
    return (
      <div>
        <button type="button" className="footer__install" onClick={() => setShowTip(!showTip)} aria-expanded={showTip}>
          <Icon name="download" size={16} /> Add to Home Screen
        </button>
        {showTip ? (
          <p className="footer__install-tip">
            Tap <Icon name="share" size={14} /> <strong>Share</strong> in Safari, then <strong>Add to Home Screen</strong>.
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}
