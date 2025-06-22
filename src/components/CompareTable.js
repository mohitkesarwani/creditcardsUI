import React from 'react';

function row(label, values) {
  return (
    <tr>
      <th className="text-left border px-2 py-1 bg-gray-50">{label}</th>
      {values.map((v, i) => (
        <td key={i} className="border px-2 py-1 text-center">
          {v || '-'}
        </td>
      ))}
    </tr>
  );
}

function CompareTable({ cards }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1"></th>
          {cards.map((c) => (
            <th key={c.id} className="border px-2 py-1">
              <img
                src={c.cardArt?.[0]?.imageUri}
                alt={c.name}
                className="h-12 mx-auto"
              />
              <p className="font-bold text-sm mt-1">{c.name}</p>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {row('Brand', cards.map((c) => c.brandName || c.brand))}
        {row('Interest Free', cards.map((c) => c.feesAndPricing?.interestFreePeriod))}
        {row('Interest Rate', cards.map((c) => c.feesAndPricing?.interestRates?.[0]?.rate))}
        {row('Comparison Rate', cards.map((c) => c.lendingRates?.[0]?.comparisonRate))}
        {row(
          'Annual Fee',
          cards.map((c) => {
            const fee = c.fees?.reduce((min, f) => {
              if (f.amount === undefined) return min;
              return Math.min(min, Number(f.amount));
            }, Infinity);
            return fee !== Infinity ? fee : '';
          })
        )}
        {row(
          'Eligibility',
          cards.map((c) =>
            c.eligibility?.length
              ? `${c.eligibility[0].value}${c.eligibility[0].unit || ''}`
              : ''
          )
        )}
        {row('Application', cards.map((c) => (
          <a
            href={c.applicationUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            Apply
          </a>
        )))}
      </tbody>
    </table>
  );
}

export default CompareTable;
