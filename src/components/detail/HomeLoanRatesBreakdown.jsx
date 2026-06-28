import React, { useMemo, useState } from 'react';
import { formatPercent } from '../../utils.js';

// A home loan typically has 10-60 lending-rate entries (rate type ×
// loan purpose × repayment type × LVR tier). We surface the cheapest per
// (loan purpose, rate type) and let the user expand to see all.

const PURPOSE_LABEL = {
  OWNER_OCCUPIED: 'Owner-occupied',
  INVESTMENT: 'Investment',
};
const TYPE_LABEL = {
  VARIABLE: 'Variable',
  FIXED: 'Fixed',
  DISCOUNT: 'Discount variable',
  INTRODUCTORY: 'Introductory',
};

const rateType = (r) => (r?.lendingRateType || r?.rateType || '').toUpperCase();
const purposeKey = (r) => (r?.loanPurpose || 'OTHER').toUpperCase();
const repaymentLabel = (s) =>
  s === 'PRINCIPAL_AND_INTEREST' ? 'P&I' : s === 'INTEREST_ONLY' ? 'IO' : s || '';

const lvrSummary = (r) => {
  const tiers = (r?.tiers || []).filter(
    (t) => /LVR/i.test(t?.name || '') || /^PERCENT$/.test(t?.unitOfMeasure || ''),
  );
  if (!tiers.length) return null;
  const t = tiers[0];
  const min = parseFloat(t.minimumValue);
  const max = parseFloat(t.maximumValue);
  const norm = (n) => (Number.isFinite(n) ? (n > 1 ? n : n * 100) : null);
  const a = norm(min);
  const b = norm(max);
  if (a !== null && b !== null) return `LVR ${a}%–${b}%`;
  if (b !== null) return `LVR ≤${b}%`;
  if (a !== null) return `LVR ≥${a}%`;
  return null;
};

export default function HomeLoanRatesBreakdown({ rates }) {
  const [showAll, setShowAll] = useState(false);

  const grouped = useMemo(() => {
    if (!Array.isArray(rates) || !rates.length) return [];
    const map = new Map();
    for (const r of rates) {
      const t = rateType(r);
      const p = purposeKey(r);
      const key = `${p}|${t}`;
      const arr = map.get(key) || [];
      arr.push(r);
      map.set(key, arr);
    }

    const out = [];
    for (const [key, list] of map.entries()) {
      const [p, t] = key.split('|');
      // Sort by rate ascending — the headline number first.
      list.sort((a, b) => (parseFloat(a.rate) || Infinity) - (parseFloat(b.rate) || Infinity));
      out.push({
        purpose: p,
        type: t,
        rates: list,
        cheapest: list[0],
      });
    }
    // Sort groups: Owner-occupied first, then Investment; Variable before Fixed.
    out.sort((a, b) => {
      if (a.purpose !== b.purpose)
        return a.purpose === 'OWNER_OCCUPIED' ? -1 : 1;
      if (a.type === 'VARIABLE' && b.type !== 'VARIABLE') return -1;
      if (b.type === 'VARIABLE' && a.type !== 'VARIABLE') return 1;
      return a.type.localeCompare(b.type);
    });
    return out;
  }, [rates]);

  if (!grouped.length) {
    return <p className="text-sm text-gray-500">No structured rate data published by the issuer.</p>;
  }

  return (
    <div className="space-y-4">
      {grouped.map((g) => {
        const c = g.cheapest;
        return (
          <div key={`${g.purpose}|${g.type}`} className="border border-gray-100 rounded-lg overflow-hidden">
            <header className="bg-gray-50 px-4 py-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-800">
                {PURPOSE_LABEL[g.purpose] || g.purpose} · {TYPE_LABEL[g.type] || g.type}
              </span>
              <span className="text-xs text-gray-500">{g.rates.length} option{g.rates.length === 1 ? '' : 's'}</span>
            </header>
            <ul className="divide-y divide-gray-100">
              {(showAll ? g.rates : g.rates.slice(0, 3)).map((r, i) => {
                const lvr = lvrSummary(r);
                return (
                  <li key={i} className="px-4 py-2.5 flex items-baseline justify-between gap-4">
                    <div className="text-xs text-gray-500">
                      {repaymentLabel(r.repaymentType)}
                      {lvr && <span> · {lvr}</span>}
                      {r.additionalValue && <span> · {r.additionalValue}</span>}
                    </div>
                    <div className="text-right tabular-nums">
                      <span className="text-sm font-semibold text-gray-900">
                        {r.rate ? formatPercent(parseFloat(r.rate)) : '—'}
                      </span>
                      {r.comparisonRate && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatPercent(parseFloat(r.comparisonRate))} comp.)
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
              {g.rates.length > 3 && !showAll && (
                <li className="px-4 py-2 text-center text-xs text-blue-600">
                  <button onClick={() => setShowAll(true)} className="hover:underline">
                    + {g.rates.length - 3} more rate option{g.rates.length - 3 === 1 ? '' : 's'}
                  </button>
                </li>
              )}
            </ul>
          </div>
        );
      })}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs text-blue-600 hover:underline"
        >
          Show top 3 per group
        </button>
      )}
    </div>
  );
}
