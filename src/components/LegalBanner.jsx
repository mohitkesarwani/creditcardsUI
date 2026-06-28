import React, { useEffect, useState } from 'react';

// Tiny dismissible info bar at the top of substantive pages. Sets persistent
// state in localStorage so users only see it once per device.

const STORAGE_KEY = 'rr.legalBannerDismissed.v1';

export default function LegalBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(STORAGE_KEY) !== '1');
    } catch {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {/* private mode */}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div role="region" aria-label="General-advice notice"
         className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-start gap-3">
        <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9a1 1 0 102 0V7a1 1 0 10-2 0v2zm0 4a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd" />
        </svg>
        <p className="flex-1 leading-snug">
          <strong>General information only.</strong>{' '}
          Comparisons shown do not consider your personal circumstances. Read each issuer's PDS and TMD before applying.
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="text-amber-700 hover:text-amber-900 px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
