import React, { useMemo, useState, useEffect } from 'react';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import { formatMoney, formatPercent, getMortgageFeatureTags } from '../utils.js';
import RepaymentChart from './RepaymentChart.jsx';

const DEFAULT_AMOUNT = 800000;
const DEFAULT_TERM = 30;

function calcMonthly(amount, rate, years) {
  const r = parseFloat(rate);
  if (Number.isNaN(r)) return null;
  const monthly = r / 100 / 12;
  const n = years * 12;
  return (amount * monthly) / (1 - Math.pow(1 + monthly, -n));
}

function generateSchedule(amount, rate, years) {
  const payment = calcMonthly(amount, rate, years);
  if (!payment) return [];
  const monthlyRate = parseFloat(rate) / 100 / 12;
  let balance = amount;
  const schedule = [];
  for (let m = 1; m <= years * 12; m++) {
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    schedule.push({ month: m, payment, principal, interest, balance });
  }
  return schedule;
}

function getRepaymentInfo(mortgage) {
  const rate = mortgage.lendingRates?.[0]?.rate;
  if (!rate) return null;
  const monthly = calcMonthly(DEFAULT_AMOUNT, rate, DEFAULT_TERM);
  if (!monthly) return null;
  const total = monthly * DEFAULT_TERM * 12;
  const costPerDollar = total / DEFAULT_AMOUNT;
  const schedule = generateSchedule(DEFAULT_AMOUNT, rate, DEFAULT_TERM);
  return { monthly, total, costPerDollar, schedule, rate };
}

const rowDefs = [
  { key: 'bank', label: 'Bank', fn: (m) => m.bankName || m.brandName },
  { key: 'interestRate', label: 'Interest Rate', fn: (m) => m.lendingRates?.[0]?.rate, rate: true },
  { key: 'comparisonRate', label: 'Comparison Rate', fn: (m) => m.lendingRates?.[0]?.comparisonRate, rate: true },
  {
    key: 'monthly',
    label: 'Monthly Repayment',
    fn: (m) => getRepaymentInfo(m)?.monthly,
    money: true,
    tooltipFn: (m) => {
      const info = getRepaymentInfo(m);
      return info ? `Based on $${DEFAULT_AMOUNT.toLocaleString()} over ${DEFAULT_TERM}yrs at ${info.rate}%` : null;
    },
  },
  {
    key: 'total',
    label: 'Total Repayment',
    fn: (m) => getRepaymentInfo(m)?.total,
    money: true,
    highlightMin: true,
  },
  {
    key: 'costPerDollar',
    label: 'Cost Per $1 Borrowed',
    fn: (m) => getRepaymentInfo(m)?.costPerDollar,
    money: true,
  },
  { key: 'loanTerm', label: 'Loan Term', fn: () => `Up to ${DEFAULT_TERM} Years` },
  { key: 'repaymentType', label: 'Repayment Type', fn: (m) => m.lendingRates?.[0]?.repaymentType },
  {
    key: 'setupFee',
    label: 'Setup Fee',
    fn: (m) => (m.feesAndPricing?.fees || []).find((f) => /(establishment|application|setup)/i.test(f.name || ''))?.amount,
    money: true,
  },
  {
    key: 'ongoingFee',
    label: 'Ongoing Fee',
    fn: (m) => (m.feesAndPricing?.fees || []).find((f) => /(ongoing|monthly|annual|service)/i.test(f.name || ''))?.amount,
    money: true,
  },
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
  { key: 'chart', label: 'Repayment Breakdown', chart: true },
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

function MoneyRow({ label, values, highlightMin = false, tooltips = [] }) {
  if (values.every((v) => v == null)) return null;
  const nums = values.map((v) => parseFloat(v));
  const min = Math.min(...nums.filter((n) => !Number.isNaN(n)));
  return (
    <tr className="md:table-row block even:bg-[#f9f9f9] dark:even:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 border-b border-gray-200 dark:border-gray-700">
      <th className="md:table-cell block text-left md:border-r px-4 py-3 bg-white md:sticky md:left-0 z-10 font-normal text-gray-600">
        {label}
      </th>
      {values.map((v, i) => {
        const num = nums[i];
        const highlight = highlightMin && !Number.isNaN(num) && num === min;
        return (
          <td
            key={i}
            className={`md:table-cell block px-4 py-3 text-left max-w-xs font-medium ${highlight ? 'bg-green-50 dark:bg-green-900' : ''}`}
            title={tooltips[i] || undefined}
          >
            {v != null ? formatMoney(v) : 'N/A'}
          </td>
        );
      })}
    </tr>
  );
}

function ChartRow({ label, mortgages }) {
  const schedules = mortgages.map((m) => getRepaymentInfo(m)?.schedule || []);
  if (schedules.every((s) => !s.length)) return null;
  return (
    <tr className="md:table-row block even:bg-[#f9f9f9] dark:even:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 border-b border-gray-200 dark:border-gray-700">
      <th className="md:table-cell block text-left md:border-r px-4 py-3 bg-white md:sticky md:left-0 z-10 font-normal text-gray-600">
        {label}
      </th>
      {schedules.map((s, i) => (
        <td key={i} className="md:table-cell block px-4 py-3 text-left max-w-xs font-medium">
          <RepaymentChart schedule={s} />
        </td>
      ))}
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
      if (r.chart) return <ChartRow key={r.key} label={r.label} mortgages={mortgages} />;
      const values = mortgages.map((m) => r.fn(m));
      if (r.rate) return <RateRow key={r.key} label={r.label} values={values} />;
      if (r.money) {
        const tips = r.tooltipFn ? mortgages.map((m) => r.tooltipFn(m)) : [];
        return (
          <MoneyRow
            key={r.key}
            label={r.label}
            values={values}
            highlightMin={r.highlightMin}
            tooltips={tips}
          />
        );
      }
      return <Row key={r.key} label={r.label} values={values} />;
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
                if (r.chart) {
                  const schedule = getRepaymentInfo(m)?.schedule || [];
                  if (!schedule.length) return null;
                  return (
                    <tr key={r.key} className="border-t">
                      <th className="text-left px-4 py-2 w-1/2 font-normal text-gray-600">{r.label}</th>
                      <td className="px-4 py-2"><RepaymentChart schedule={schedule} /></td>
                    </tr>
                  );
                }
                const val = r.fn(m);
                if (val == null) return null;
                const tooltip = r.tooltipFn ? r.tooltipFn(m) : null;
                const content = r.rate
                  ? formatPercent(val)
                  : r.money
                  ? formatMoney(val)
                  : val;
                return (
                  <tr key={r.key} className="border-t">
                    <th className="text-left px-4 py-2 w-1/2 font-normal text-gray-600">{r.label}</th>
                    <td className="px-4 py-2" title={tooltip || undefined}>{content}</td>
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
      <div className="inline-block min-w-full align-middle shadow rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 md:p-6">
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
