import React from 'react';

// Shows when product data was last refreshed against the issuer's CDR feed.
// RG 234 (advertising guidance) expects time-sensitive rate data to be
// time-stamped — this badge backs up our "refreshed daily" claim.
//
// Pass an array of items with `updated_at` ISO strings (or a single date).
// Renders nothing if no date can be derived.

const formatRelative = (date) => {
  const now = Date.now();
  const then = new Date(date).getTime();
  if (!Number.isFinite(then)) return null;
  const diffMin = Math.max(0, Math.round((now - then) / 60000));
  if (diffMin < 5) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7)   return `${diffDay} days ago`;
  if (diffDay < 30)  return `${Math.round(diffDay / 7)} wk ago`;
  return new Date(date).toLocaleDateString('en-AU');
};

export default function DataFreshness({ items, className = '' }) {
  if (!items || items.length === 0) return null;
  // Find the freshest updated_at across the set
  const latest = items
    .map((i) => i?.updated_at)
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter((n) => Number.isFinite(n))
    .reduce((acc, n) => (n > acc ? n : acc), 0);

  if (!latest) return null;
  const relative = formatRelative(latest);
  if (!relative) return null;

  return (
    <span
      title="Rates and fees are pulled from each issuer's public CDR feed. Always confirm the current number on the issuer's own page before applying."
      className={
        'inline-flex items-center gap-1.5 text-[11px] text-ink-500 ' +
        'whitespace-nowrap ' + className
      }
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      Data refreshed <strong className="text-ink-700">{relative}</strong>
      <span className="opacity-60">· as at {new Date(latest).toLocaleDateString('en-AU')}</span>
    </span>
  );
}
