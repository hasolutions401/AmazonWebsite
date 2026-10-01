import { useEffect, useRef, useState } from 'react';
import { SITE } from '../../data/site.js';
import './AgeGate.css';

export const AGE_KEY = 'ab-age-verified';

/**
 * 21+ gate. An inline script in index.html adds `age-ok` to <html> before
 * first paint for returning visitors, so verified users never see a flash.
 */
export default function AgeGate() {
  const [open, setOpen] = useState(true);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (document.documentElement.classList.contains('age-ok')) {
      setOpen(false);
      return undefined;
    }
    confirmRef.current?.focus();
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const buttons = [...document.querySelectorAll('.age-gate button')];
      const i = buttons.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? (i <= 0 ? buttons.length - 1 : i - 1) : (i + 1) % buttons.length;
      buttons[next].focus();
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  if (!open) return null;

  const confirm = () => {
    try {
      sessionStorage.setItem(AGE_KEY, '1');
    } catch {
      /* private mode: still let them in for this page view */
    }
    document.documentElement.classList.add('age-ok');
    setOpen(false);
  };

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-title" aria-describedby="age-desc">
      <div className="age-gate__box">
        <img src={SITE.logo} alt={SITE.name} width="220" height="53" />
        <h2 id="age-title">21+ Age Verification</h2>
        <p id="age-desc">
          This website contains tobacco and nicotine products. You must be 21 years or older to enter.
        </p>
        <div className="age-gate__actions">
          <button type="button" className="btn btn--primary btn--pill" onClick={confirm} ref={confirmRef}>
            I Am 21 or Older
          </button>
          <button type="button" className="btn btn--outline btn--pill" onClick={() => window.location.assign('https://www.google.com')}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
