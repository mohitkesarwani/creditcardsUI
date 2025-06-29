import React, { useMemo, useState, useEffect } from 'react';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import { formatMoney, formatPercent, getMortgageFeatureTags } from '../utils.js';

const rowDefs = [
  { key: 'bank', label: 'Bank', fn: (m) => m.bankName || m.brandName },
  { key: 'interestRate', label: 'Interest Rate', fn: (m) => m.lendingRates?.[0]?.rate, rate: true },
  { key: 'comparisonRate', label: 'Comparison Rate', fn: (m) => m.lendingRates?.[0]?.comparisonRate, rate: true },
  {
    key: 'fees',
    label: 'Key Fees',
    fn: (m) =>
      (m.feesAndPricing?.fees || [])
        .slice(0, 2)
        .map((f) => `${f.name}: ${formatMoney(f.amount)}`)
        .join(', '),
  },
  { key: 'features', label: 'Features', fn: (m) => getMortgageFeatureTags(m).join(', ') },
];

function Row({ label, values }) {
  if (values.every((v) => !v)) return null;
  return (
    <tr className="md:table-row block even:bg-[#f9f9f9] dark:even:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 border-b border-gray-200 dark:border-gray-700">
      <th className="md:table-cell block text-left md:border-r px-4 py-3 bg-white md:sticky md:left-0 z-10 font-normal text-gray-600">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="md:table-cell block px-4 py-3 text-left max-w-xs font-medium">
          {v || '–'}
        </td>
      ))}
    </tr>
  );
}

function RateRow({ label, values }) {
  if (values.every((v) => !v)) return null;
  const nums = values.map((v) => parseFloat(String(v).replace(/[^0-9.]/g, '')));
  const min = Math.min(...nums.filter((n) => !Number.isNaN(n)));
  return (
    <tr className="md:table-row block even:bg-[#f9f9f9] dark:even:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 border-b border-gray-200 dark:border-gray-700">
      <th className="md:table-cell block text-left md:border-r px-4 py-3 bg-white md:sticky md:left-0 z-10 font-normal text-gray-600">
        {label}
      </th>
      {values.map((v, i) => {
        const num = nums[i];
        const highlight = !Number.isNaN(num) && num === min;
        return (
          <td key={i} className={`md:table-cell block px-4 py-3 text-left max-w-xs font-medium ${highlight ? 'bg-green-50 dark:bg-green-900' : ''}`}>
            {v ? formatPercent(v) : '–'}
          </td>
        );
      })}
    </tr>
  );
}

function MortgageCompareTable({ mortgages }) {
  const [isMobile, setIsMobile] = useState(false);
  const { toggleMortgage } = useSelectedMortgages();

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const rows = useMemo(() => {
    return rowDefs.map((r) => {
      const values = mortgages.map((m) => r.fn(m));
      return r.rate ? <RateRow key={r.key} label={r.label} values={values} /> : <Row key={r.key} label={r.label} values={values} />;
    });
  }, [mortgages]);

  const mobileView = (
    <div className="space-y-4 md:hidden">
      {mortgages.map((m) => (
        <div key={m.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center gap-3 p-4 border-b">
            <p className="font-semibold flex-1" title={m.name}>{m.name}</p>
            <button onClick={() => toggleMortgage(m)} className="text-xs text-accent underline">Remove</button>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {rowDefs.map((r) => {
                const val = r.fn(m);
                if (!val) return null;
                return (
                  <tr key={r.key} className="border-t">
                    <th className="text-left px-4 py-2 w-1/2 font-normal text-gray-600">{r.label}</th>
                    <td className="px-4 py-2">{r.rate ? formatPercent(val) : val}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  if (isMobile) return mobileView;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle shadow-md rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        <table className="min-w-full text-sm leading-relaxed block md:table">
          <thead className="hidden md:table-header-group">
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="border px-4 py-3 sticky left-0 z-20 bg-gray-50 dark:bg-gray-700"></th>
              {mortgages.map((m) => (
                <th key={m.id} className="border px-4 py-3 bg-white dark:bg-gray-800 text-center max-w-[12rem]">
                  <div className="flex flex-col items-center gap-3 p-4 rounded-lg" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <p className="font-semibold text-[1.1rem] leading-snug truncate" title={m.name}>{m.name}</p>
                    <button onClick={() => toggleMortgage(m)} className="text-xs text-accent underline">Remove</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="block md:table-row-group">{rows}</tbody>
        </table>
      </div>
    </div>
  );
}

export default MortgageCompareTable;
