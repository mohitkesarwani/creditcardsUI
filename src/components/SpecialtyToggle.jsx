import React from 'react';

// Small footer toggle shown beneath a list page when specialty products have
// been hidden. Honest about the gap — clicking expands the list to include
// business / SMSF / trust / capped-amount / no-interest products that would
// otherwise distort the comparison.
export default function SpecialtyToggle({ count, show, onToggle, productLabel }) {
  if (!count) return null;
  return (
    <div className="mt-6 surface p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
          {show
            ? `Showing ${count} specialty ${productLabel}${count === 1 ? '' : 's'}`
            : `${count} specialty ${productLabel}${count === 1 ? '' : 's'} hidden`}
        </p>
        <p className="text-xs text-ink-600 dark:text-ink-300 mt-0.5 leading-snug">
          {show
            ? 'These are business, SMSF, trust, restricted-purpose or capped-amount products. They\'re not always comparable to standard products.'
            : 'Business, SMSF, trust, no-interest and capped-amount products are excluded by default because they distort the comparison.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="btn btn-outline text-sm whitespace-nowrap shrink-0"
      >
        {show ? 'Hide them' : 'Show them'}
      </button>
    </div>
  );
}
