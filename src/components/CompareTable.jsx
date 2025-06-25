import React from 'react';
import { getMinimumAnnualFee, formatValue, safeDisplay } from '../utils.js';

const DiffIcon = () => (
  <svg
    className="w-3 h-3 text-accent"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9l2 2 4-4" />
  </svg>
);


function Row({ label, values }) {
  if (values.every((v) => v === undefined || v === null || v === '')) return null;
  const first = values[0];
  const diffs = values.map((v) => v !== first);
  const anyDiff = diffs.some(Boolean);
  return (
    <tr className="even:bg-gray-50 hover:bg-accent/5">
      <th className="text-left border px-3 py-2 bg-white sticky left-0 z-10 font-medium">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="border px-3 py-2 text-left max-w-xs">
          <span className={`flex items-center gap-1 ${anyDiff && diffs[i] ? 'font-semibold' : ''}`}> 
            {anyDiff && diffs[i] && <DiffIcon />} 
            {formatValue(label, safeDisplay(v, 'Not available'))}
          </span>
        </td>
      ))}
    </tr>
  );
}

function CompareTable({ cards }) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle shadow-md rounded-lg border bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-3 sticky left-0 z-20 bg-gray-50"></th>
              {cards.map((c) => (
                <th key={c.id} className="border px-4 py-3 bg-white text-center max-w-[12rem]">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={c.productImageUrl || c.cardArt?.[0]?.imageUri}
                      alt={c.name}
                      className="h-12 object-contain"
                      onError={(e) => (e.currentTarget.src = '/radar.svg')}
                    />
                    <p className="font-semibold text-sm truncate" title={c.name}>{c.name}</p>
                    {c.applicationUrl && (
                      <a
                        href={c.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-accent text-white px-3 py-1 rounded text-xs"
                      >
                        Apply
                      </a>
                    )}
                  </div>
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
          label={<span title="The rate that includes fees and interest">Comparison Rate</span>}
          values={cards.map((c) => c.comparisonRate)}
        />
        <Row
          label="Annual Fee"
          values={cards.map((c) => c.annualFee ?? getMinimumAnnualFee(c))}
        />
        <Row
          label={<span title="Typical qualification criteria">Eligibility</span>}
          values={cards.map((c) => c.eligibilityCriteria)}
        />
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareTable;
