import React from 'react';
import { formatPercent } from '../../utils.js';

// Lending rates broken out cleanly. Each row gets a label, the formatted
// rate, an optional comparison rate and frequency hint.
//
// The CDR `lendingRates[]` entries shape we render:
//   { lendingRateType, rate, comparisonRate?, applicationFrequency?, calculationFrequency? }

const HUMAN_TYPE = {
  PURCHASE: 'Purchase',
  CASH_ADVANCE: 'Cash advance',
  PENALTY: 'Penalty / overdue',
  BUSINESS: 'Business',
  STANDARD: 'Standard',
};

const formatFreq = (iso) => {
  if (!iso) return '';
  if (/^P1D$/i.test(iso)) return 'daily';
  if (/^P1M$/i.test(iso)) return 'monthly';
  if (/^P1Y$/i.test(iso)) return 'yearly';
  if (/^P(\d+)D$/i.test(iso)) return iso.replace(/P(\d+)D/i, '$1-day');
  return iso;
};

export default function RatesBreakdown({ rates }) {
  if (!rates?.length) {
    return <p className="text-sm text-gray-500">No structured rate data published by the issuer.</p>;
  }

  return (
    <div className="overflow-hidden border border-gray-100 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Rate</th>
            <th className="px-4 py-2 font-medium hidden md:table-cell">Comparison</th>
            <th className="px-4 py-2 font-medium hidden md:table-cell">Calc / Charged</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rates.map((r, i) => {
            const type = r.lendingRateType || r.rateType || 'Other';
            const label = HUMAN_TYPE[type] || type.replace(/_/g, ' ').toLowerCase();
            return (
              <tr key={i} className="text-gray-800">
                <td className="px-4 py-2 capitalize">{label}</td>
                <td className="px-4 py-2 font-semibold">
                  {r.rate ? formatPercent(parseFloat(r.rate)) : '—'}
                </td>
                <td className="px-4 py-2 hidden md:table-cell text-gray-600">
                  {r.comparisonRate ? formatPercent(parseFloat(r.comparisonRate)) : '—'}
                </td>
                <td className="px-4 py-2 hidden md:table-cell text-gray-500 text-xs">
                  {[formatFreq(r.calculationFrequency), formatFreq(r.applicationFrequency)]
                    .filter(Boolean)
                    .join(' · ')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
