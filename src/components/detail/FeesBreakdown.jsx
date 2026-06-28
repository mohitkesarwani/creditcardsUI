import React from 'react';
import { formatMoney } from '../../utils.js';

// CDR fee groups we surface separately. Order matters — most important first.
const GROUPS = [
  {
    label: 'Yearly / membership',
    match: (f) =>
      f?.feeType === 'PERIODIC' && /^P(1Y|12M|365D)$/i.test(f?.additionalValue || ''),
  },
  {
    label: 'Monthly',
    match: (f) =>
      f?.feeType === 'PERIODIC' && /^P(1M|30D)$/i.test(f?.additionalValue || ''),
  },
  {
    label: 'Transaction',
    match: (f) => /TRANSACTION|PURCHASE|WITHDRAWAL/i.test(f?.feeType || ''),
  },
  {
    label: 'Penalty / behavioural',
    match: (f) => /PENALTY/i.test(f?.feeType || '') || /late|over/i.test(f?.name || ''),
  },
];

const friendlyAmount = (fee) => {
  if (fee?.amount === null || fee?.amount === undefined) {
    if (fee?.balanceRate) return `${(parseFloat(fee.balanceRate) * 100).toFixed(2)}% of balance`;
    if (fee?.transactionRate) return `${(parseFloat(fee.transactionRate) * 100).toFixed(2)}% per txn`;
    return '—';
  }
  return formatMoney(fee.amount);
};

const friendlyPeriod = (iso) => {
  if (!iso) return '';
  if (/^P1Y|P12M|P365D$/i.test(iso)) return '/year';
  if (/^P1M|P30D$/i.test(iso)) return '/month';
  if (/^P1D$/i.test(iso)) return '/day';
  return '';
};

export default function FeesBreakdown({ fees }) {
  if (!fees?.length) {
    return <p className="text-sm text-gray-500">No fees published by the issuer.</p>;
  }

  // Partition each fee into the first group it matches; leftovers go to "Other".
  const used = new Set();
  const grouped = GROUPS.map((g) => {
    const items = fees.filter((f) => {
      if (used.has(f)) return false;
      const ok = g.match(f);
      if (ok) used.add(f);
      return ok;
    });
    return { label: g.label, items };
  });
  const other = fees.filter((f) => !used.has(f));
  if (other.length) grouped.push({ label: 'Other', items: other });

  return (
    <div className="space-y-4">
      {grouped
        .filter((g) => g.items.length)
        .map((g) => (
          <div key={g.label}>
            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
              {g.label}
            </h3>
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              {g.items.map((f, i) => (
                <li key={i} className="px-4 py-2.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{f.name || f.feeType || 'Unnamed fee'}</p>
                    {f.additionalInfo && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2" title={f.additionalInfo}>
                        {f.additionalInfo}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {friendlyAmount(f)}
                      <span className="font-normal text-gray-500 text-xs">{friendlyPeriod(f.additionalValue)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
