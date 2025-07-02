import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import {
  formatMoney,
  formatMoneyClean,
  formatPercent,
  getMortgageFeatureTags,
} from '../utils.js';
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

function getRatePercent(raw) {
  const r = parseFloat(raw);
  if (Number.isNaN(r)) return null;
  return r <= 1 ? r * 100 : r;
}

function generateSchedule(amount, ratePercent, years) {
  const payment = calcMonthly(amount, ratePercent, years);
  if (!payment) return [];
  const monthlyRate = parseFloat(ratePercent) / 100 / 12;
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

function getRepaymentInfo(mortgage, amount = DEFAULT_AMOUNT) {
  const rawRate = mortgage.lendingRates?.[0]?.rate;
  const ratePercent = getRatePercent(rawRate);
  if (ratePercent === null) return null;
  const monthly = calcMonthly(amount, ratePercent, DEFAULT_TERM);
  if (!monthly) return null;
  const total = monthly * DEFAULT_TERM * 12;
  const costPerDollar = total / amount;
  const schedule = generateSchedule(amount, ratePercent, DEFAULT_TERM);
  return { monthly, total, costPerDollar, schedule, rate: ratePercent };
}

function getRowDefs(amount) {
  return [
    { key: 'bank', label: 'Bank', fn: (m) => m.bankName || m.brandName },
    {
      key: 'interestRate',
      label: 'Interest Rate',
      fn: (m) => getRatePercent(m.lendingRates?.[0]?.rate),
      rate: true,
    },
    {
      key: 'comparisonRate',
      label: 'Comparison Rate',
      fn: (m) => getRatePercent(m.lendingRates?.[0]?.comparisonRate),
      rate: true,
    },
    {
      key: 'monthly',
      label: 'Monthly Repayment',
      fn: (m) => getRepaymentInfo(m, amount)?.monthly,
      money: true,
      tooltipFn: (m) => {
        const info = getRepaymentInfo(m, amount);
        return info
          ? `Based on $${amount.toLocaleString()} over ${DEFAULT_TERM}yrs at ${info.rate}%`
          : null;
      },
    },
    {
      key: 'total',
      label: 'Total Repayment',
      fn: (m) => getRepaymentInfo(m, amount)?.total,
      money: true,
      highlightMin: true,
      formatFn: (v) => formatMoneyClean(v, 0),
    },
    {
      key: 'costPerDollar',
      label: 'Cost Per $1 Borrowed',
      fn: (m) => getRepaymentInfo(m, amount)?.costPerDollar,
      money: true,
    },
    { key: 'loanTerm', label: 'Loan Term', fn: () => `Up to ${DEFAULT_TERM} Years` },
    {
      key: 'repaymentType',
      label: 'Repayment Type',
      fn: (m) => m.lendingRates?.[0]?.repaymentType,
    },
    {
      key: 'setupFee',
      label: 'Setup Fee',
      fn: (m) =>
        (m.feesAndPricing?.fees || []).find((f) => /(establishment|application|setup)/i.test(f.name || ''))?.amount,
      money: true,
    },
    {
      key: 'ongoingFee',
      label: 'Ongoing Fee',
      fn: (m) =>
        (m.feesAndPricing?.fees || []).find((f) => /(ongoing|monthly|annual|service)/i.test(f.name || ''))?.amount,
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
    {
      key: 'features',
      label: 'Features',
      fn: (m) => getMortgageFeatureTags(m).join(', '),
    },
    { key: 'chart', label: 'Repayment Breakdown', chart: true },
  ];
}


function Row({ label, values }) {
  if (values.every((v) => !v)) return null;
  return (
    <tr className="md:table-row block even:bg-[#f9f9f9] dark:even:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 border-b border-gray-200 dark:border-gray-700">
      <th className="md:table-cell block text-left md:border-r px-4 py-3 bg-white md:sticky md:left-0 z-10 font-normal text-gray-600">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="comparison-column md:table-cell block px-4 py-3 text-left font-medium">
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
          <td
            key={i}
            className={`comparison-column md:table-cell block px-4 py-3 text-left font-medium ${highlight ? 'bg-green-50 dark:bg-green-900' : ''}`}
          >
            {v ? formatPercent(v) : '–'}
          </td>
        );
      })}
    </tr>
  );
}

function MoneyRow({
  label,
  values,
  highlightMin = false,
  tooltips = [],
  formatFn = formatMoney,
}) {
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
            className={`comparison-column md:table-cell block px-4 py-3 text-left font-medium ${highlight ? 'bg-green-50 dark:bg-green-900' : ''}`}
            title={tooltips[i] || undefined}
          >
            {v != null ? formatFn(v) : 'N/A'}
          </td>
        );
      })}
    </tr>
  );
}

function ChartRow({ label, mortgages, amount }) {
  const schedules = mortgages.map((m) => getRepaymentInfo(m, amount)?.schedule || []);
  if (schedules.every((s) => !s.length)) return null;
  return (
    <tr className="md:table-row block even:bg-[#f9f9f9] dark:even:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 border-b border-gray-200 dark:border-gray-700">
      <th className="md:table-cell block text-left md:border-r px-4 py-3 bg-white md:sticky md:left-0 z-10 font-normal text-gray-600">
        {label}
      </th>
      {schedules.map((s, i) => (
        <td key={i} className="comparison-column md:table-cell block px-4 py-3 text-left font-medium">
          <div className="w-full overflow-x-auto max-w-full p-2">
            <div className="min-w-[16rem]">
              <RepaymentChart schedule={s} />
            </div>
          </div>
        </td>
      ))}
    </tr>
  );
}

function MortgageCompareTable({ mortgages, loanAmount = DEFAULT_AMOUNT }) {
  const [isMobile, setIsMobile] = useState(false);
  const { toggleMortgage } = useSelectedMortgages();

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const rows = useMemo(() => {
    const defs = getRowDefs(loanAmount);
    return defs.map((r) => {
      if (r.chart)
        return (
          <ChartRow key={r.key} label={r.label} mortgages={mortgages} amount={loanAmount} />
        );
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
            formatFn={r.formatFn || formatMoney}
          />
        );
      }
      return <Row key={r.key} label={r.label} values={values} />;
    });
  }, [mortgages, loanAmount]);

  const mobileView = (
    <div className="space-y-4 md:hidden">
      {mortgages.map((m) => (
        <div key={m.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center gap-3 p-4 border-b">
            <p className="font-semibold flex-1" title={m.name}>{m.name}</p>
            <button onClick={() => toggleMortgage(m)} className="text-xs text-accent underline">Remove</button>
          </div>
          <div className="flex gap-2 p-4 pt-2 border-b">
            <Link to={`/home-loans/${m.id}`} className="bg-accent text-white rounded-md px-3 py-1 text-xs hover:bg-accent/90 transition text-center flex-1">Go to Details</Link>
            <Link to={`/apply/${m.id}`} className="bg-accent text-white rounded-md px-3 py-1 text-xs hover:bg-accent/90 transition text-center flex-1">Apply</Link>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {getRowDefs(loanAmount).map((r) => {
                if (r.chart) {
                  const schedule = getRepaymentInfo(m, loanAmount)?.schedule || [];
                  if (!schedule.length) return null;
                  return (
                    <tr key={r.key} className="border-t">
                      <th className="text-left px-4 py-2 w-1/2 font-normal text-gray-600">{r.label}</th>
                      <td className="px-4 py-2">
                        <div className="w-full overflow-x-auto max-w-full p-2">
                          <div className="min-w-[16rem]">
                            <RepaymentChart schedule={schedule} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                const val = r.fn(m);
                if (val == null) return null;
                const tooltip = r.tooltipFn ? r.tooltipFn(m) : null;
                const content = r.rate
                  ? formatPercent(val)
                  : r.money
                  ? (r.formatFn || formatMoney)(val)
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
            <tr className="bg-gray-50 dark:bg-gray-700 comparison-cards">
              <th className="border px-4 py-3 sticky left-0 z-20 bg-gray-50 dark:bg-gray-700"></th>
              {mortgages.map((m) => (
                <th key={m.id} className="comparison-column border px-4 py-3 bg-white dark:bg-gray-800 text-center">
                  <div className="comparison-card" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <p className="font-semibold text-[1.1rem] leading-snug truncate" title={m.name}>{m.name}</p>
                    <button onClick={() => toggleMortgage(m)} className="text-xs text-accent underline">Remove</button>
                    <div className="flex gap-2 mt-1">
                      <Link to={`/home-loans/${m.id}`} className="bg-accent text-white rounded-md px-3 py-1 text-xs hover:bg-accent/90 transition">Go to Details</Link>
                      <Link to={`/apply/${m.id}`} className="bg-accent text-white rounded-md px-3 py-1 text-xs hover:bg-accent/90 transition">Apply</Link>
                    </div>
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
