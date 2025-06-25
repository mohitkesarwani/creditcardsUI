import React from 'react';
import { getMinimumAnnualFee, formatValue, safeDisplay } from '../utils.js';


function Row({ label, values }) {
  if (values.every((v) => v === undefined || v === null || v === '')) return null;
  const first = values[0];
  const diffs = values.map((v) => v !== first);
  const anyDiff = diffs.some(Boolean);
  return (
    <tr className="even:bg-gray-50 hover:bg-accent/5">
      <th className="text-left border px-3 py-2 bg-white sticky left-0 z-10">{label}</th>
      {values.map((v, i) => (
        <td
          key={i}
          className={`border px-3 py-2 text-left max-w-xs ${anyDiff && diffs[i] ? 'bg-yellow-50' : ''}`}
        >
          {formatValue(label, safeDisplay(v))}
        </td>
      ))}
    </tr>
  );
}

function CompareTable({ cards }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-max leading-relaxed">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 sticky left-0 z-20 bg-gray-100"></th>
            {cards.map((c) => (
              <th key={c.id} className="border px-3 py-2 text-center max-w-[12rem]">
                <img
                  src={c.productImageUrl || c.cardArt?.[0]?.imageUri}
                  alt={c.name}
                  className="h-12 mx-auto object-contain"
                  onError={(e) => (e.currentTarget.src = '/radar.svg')}
                />
                <p className="font-bold text-sm mt-1 truncate" title={c.name}>{c.name}</p>
                {c.applicationUrl && (
                  <a
                    href={c.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block bg-accent text-white px-3 py-1 rounded text-xs"
                  >
                    Apply
                  </a>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
        <Row label="Brand" values={cards.map((c) => c.brand)} />
        <Row
          label="Interest Free"
          values={cards.map((c) => c.interestFree)}
        />
        <Row
          label="Interest Rate"
          values={cards.map((c) => c.interestRate)}
        />
        <Row
          label="Comparison Rate"
          values={cards.map((c) => c.comparisonRate)}
        />
        <Row
          label="Annual Fee"
          values={cards.map((c) => c.annualFee ?? getMinimumAnnualFee(c))}
        />
        <Row
          label="Eligibility"
          values={cards.map((c) => c.eligibilityCriteria)}
        />
        </tbody>
      </table>
    </div>
  );
}

export default CompareTable;
