import React from 'react';

// CDR `featureType` enum is large; we collapse it into 5 user-facing buckets.
const BUCKETS = {
  Insurance:        { match: /INSURANCE|PROTECTION/i, color: 'bg-emerald-50 text-emerald-800' },
  'Rewards & Points': { match: /REWARD|LOYALTY|POINT|CASHBACK|BONUS/i, color: 'bg-amber-50 text-amber-800' },
  Travel:           { match: /TRAVEL|LOUNGE|FLIGHT/i, color: 'bg-sky-50 text-sky-800' },
  'Digital wallets': { match: /WALLET|APPLE|GOOGLE|SAMSUNG|GARMIN|FITBIT|PAY$/i, color: 'bg-violet-50 text-violet-800' },
  Other:            { match: /./, color: 'bg-gray-50 text-gray-800' },
};

const SKIP = new Set(['OTHER', 'UNLIMITED_TXNS']);

const humanise = (s) => (s || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function FeaturesGrid({ features }) {
  if (!features?.length) return <p className="text-sm text-gray-500">No features published by the issuer.</p>;

  // Bucket every feature into the first matching group.
  const buckets = {};
  Object.keys(BUCKETS).forEach((k) => (buckets[k] = []));

  for (const f of features) {
    const type = (f?.featureType || '').toUpperCase();
    if (SKIP.has(type) || !type) continue;
    const bucket = Object.entries(BUCKETS).find(([_k, v]) => v.match.test(type))?.[0] || 'Other';
    buckets[bucket].push(f);
  }

  const visible = Object.entries(buckets).filter(([_, items]) => items.length);
  if (!visible.length) return <p className="text-sm text-gray-500">No notable features.</p>;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {visible.map(([label, items]) => (
        <div key={label} className="border border-gray-100 rounded-lg p-4">
          <h3 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">{label}</h3>
          <ul className="space-y-1.5">
            {items.map((f, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm">
                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${BUCKETS[label].color.split(' ')[0].replace('bg-', 'bg-').replace('-50', '-400')}`} />
                <span className="text-gray-800">
                  {humanise(f.featureType)}
                  {f.additionalValue && (
                    <span className="text-gray-500"> · {f.additionalValue}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
