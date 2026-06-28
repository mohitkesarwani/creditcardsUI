import React from 'react';

// Prominent badge that surfaces the headline deal on a product card —
// cashback offer, welcome bonus points, 0% balance transfer term.
//
// Render-nothing when `deal` is null so consumers can spread it
// unconditionally without guards everywhere.

const KIND_STYLES = {
  cashback:     'bg-emerald-600 text-white',
  'bonus-points': 'bg-amber-500 text-white',
  'intro-rate': 'bg-indigo-600 text-white',
};

const KIND_ICONS = {
  cashback:     '💰',
  'bonus-points': '✦',
  'intro-rate': '0%',
};

export default function DealBadge({ deal, className = '' }) {
  if (!deal) return null;
  const style = KIND_STYLES[deal.kind] || 'bg-gray-700 text-white';
  const icon  = KIND_ICONS[deal.kind] || '★';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${style} ${className}`}
      title={deal.details || deal.label}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{deal.label}</span>
    </span>
  );
}
