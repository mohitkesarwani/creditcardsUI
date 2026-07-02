import React, { useEffect, useState } from 'react';

// Lightweight cookie consent banner. Only shows if (a) GA is configured via
// VITE_GA_ID env var AND (b) the user hasn't recorded a preference yet.
//
// Australia doesn't strictly mandate cookie consent like the EU does, but
// our Privacy Policy is cleaner when analytics is explicitly opt-in. Also
// future-proofs against EU traffic + tightening AU privacy laws.

const STORAGE_KEY = 'rr.cookieConsent.v1';

export default function CookieBanner() {
  const gaEnabled = !!import.meta.env.VITE_GA_ID;
  const [decision, setDecision] = useState(() => {
    if (typeof window === 'undefined') return 'unknown';
    return localStorage.getItem(STORAGE_KEY) || 'unknown';
  });

  // Tell GA whether to track based on the user's decision. Uses the standard
  // `window['ga-disable-<ID>']` global flag which all GA loaders respect.
  useEffect(() => {
    if (!gaEnabled) return;
    const flag = `ga-disable-${import.meta.env.VITE_GA_ID}`;
    window[flag] = decision !== 'accept';
  }, [decision, gaEnabled]);

  if (!gaEnabled) return null;        // No tracking running → no banner needed
  if (decision !== 'unknown') return null;  // User has already chosen

  const persist = (v) => {
    try { localStorage.setItem(STORAGE_KEY, v); } catch {/* private mode */}
    setDecision(v);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50
                 surface p-4 md:p-5 animate-fade-up shadow-lift-lg"
    >
      <p className="text-sm font-semibold text-ink-900 mb-1">Allow analytics cookies?</p>
      <p className="text-[13px] text-ink-700 leading-snug mb-3">
        We use Google Analytics to understand how the site is used (page views, bounce rate).
        We don't collect personal data. <a href="/privacy" className="text-brand-700 hover:underline">Privacy policy</a>.
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => persist('accept')} className="btn btn-primary text-sm flex-1">
          Allow
        </button>
        <button type="button" onClick={() => persist('decline')} className="btn btn-outline text-sm flex-1">
          Decline
        </button>
      </div>
    </div>
  );
}
