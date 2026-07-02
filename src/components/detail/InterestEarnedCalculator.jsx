import React, { useMemo, useState } from 'react';
import { formatPercent } from '../../utils.js';

// "How much will I earn?" calculator for deposits.
//   Inputs:  starting balance, term (months), interest rate (annual)
//   Outputs: total interest, final balance, monthly accrual table
//
// Compounding: monthly. Real products vary (daily / monthly / quarterly) but
// monthly is close enough for headline-quality estimates and matches most
// CDR-published calculationFrequency / applicationFrequency combinations.

const fmtMoney = (n) =>
  Number.isFinite(n) ? `$${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })}` : '—';

function defaultsFor(deposit) {
  // Sensible defaults by product category
  if (deposit?.product_category === 'TERM_DEPOSIT') {
    return {
      principal: 25_000,
      months: Math.min(12, Math.max(1, Math.round((deposit.max_term_days || 365) / 30))),
      ratePct: (deposit.max_rate ?? deposit.headlineRateNumber ?? 0.045) * 100,
    };
  }
  if (deposit?.product_category === 'SAVINGS') {
    return {
      principal: 10_000,
      months: 12,
      ratePct: (deposit.bonus_rate ?? deposit.intro_rate ?? deposit.base_rate ?? 0.045) * 100,
    };
  }
  return {
    principal: 5_000,
    months: 12,
    ratePct: (deposit.base_rate ?? 0.001) * 100,
  };
}

function calcInterest({ principal, monthlyContribution, months, ratePct }) {
  const r = (ratePct / 100) / 12;
  let balance = principal;
  let totalContributed = principal;
  const monthly = [];
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthlyContribution;
    totalContributed += monthlyContribution;
    monthly.push({ month: m, balance, contributed: totalContributed });
  }
  return {
    finalBalance: balance,
    totalInterest: balance - totalContributed,
    totalContributed,
    monthly,
  };
}

export default function InterestEarnedCalculator({ deposit }) {
  const d = defaultsFor(deposit);

  // Clamp inputs to what the product actually supports:
  // - principal: at least min_deposit_amount when published
  // - months (TD only): within [min_term_days/30, max_term_days/30]
  const minPrincipal = Number.isFinite(deposit?.min_deposit_amount) && deposit.min_deposit_amount > 0
    ? deposit.min_deposit_amount
    : 0;
  const isTerm = deposit?.product_category === 'TERM_DEPOSIT';
  const minMonths = isTerm && Number.isFinite(deposit?.min_term_days)
    ? Math.max(1, Math.round(deposit.min_term_days / 30))
    : 1;
  const maxMonths = isTerm && Number.isFinite(deposit?.max_term_days)
    ? Math.max(minMonths, Math.round(deposit.max_term_days / 30))
    : 120;

  const startPrincipal = Math.max(d.principal, minPrincipal);
  const startMonths = Math.min(Math.max(d.months, minMonths), maxMonths);

  const [principal, setPrincipal] = useState(startPrincipal);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [months, setMonths] = useState(startMonths);
  const [ratePct, setRatePct] = useState(Number(d.ratePct.toFixed(2)));

  const belowMin = minPrincipal > 0 && principal < minPrincipal;
  const overBonusCap =
    Number.isFinite(deposit?.bonus_max_balance) &&
    deposit.bonus_max_balance > 0 &&
    principal > deposit.bonus_max_balance;

  const result = useMemo(
    () => calcInterest({ principal, monthlyContribution, months, ratePct }),
    [principal, monthlyContribution, months, ratePct],
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
            Starting balance{minPrincipal > 0 && <span className="text-gray-400 ml-1 normal-case">(min {fmtMoney(minPrincipal)})</span>}
          </span>
          <input
            type="number"
            min={minPrincipal}
            step={100}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
            className={
              'w-full text-sm border rounded-md px-3 py-2 tabular-nums ' +
              (belowMin ? 'border-amber-400 bg-amber-50' : 'border-gray-300')
            }
          />
          {belowMin && (
            <span className="block text-[11px] text-amber-700 mt-1">
              Below the published minimum of {fmtMoney(minPrincipal)} for this product.
            </span>
          )}
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
            Monthly deposit
          </span>
          <input
            type="number"
            min={0}
            step={50}
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value) || 0))}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 tabular-nums"
          />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
            Term (months){isTerm && <span className="text-gray-400 ml-1 normal-case">({minMonths}–{maxMonths})</span>}
          </span>
          <input
            type="number"
            min={minMonths}
            max={maxMonths}
            value={months}
            onChange={(e) => setMonths(Math.max(minMonths, Math.min(maxMonths, Number(e.target.value) || minMonths)))}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 tabular-nums"
          />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
            Interest rate (% p.a.)
          </span>
          <input
            type="number"
            min={0}
            max={20}
            step={0.05}
            value={ratePct}
            onChange={(e) => setRatePct(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 tabular-nums"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Final balance</p>
          <p className="text-lg font-semibold text-gray-900 tabular-nums">{fmtMoney(result.finalBalance)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Total interest</p>
          <p className="text-lg font-semibold text-emerald-700 tabular-nums">{fmtMoney(result.totalInterest)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">You contributed</p>
          <p className="text-lg font-semibold text-gray-700 tabular-nums">{fmtMoney(result.totalContributed)}</p>
        </div>
      </div>

      {overBonusCap && (
        <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 leading-snug">
          <strong>Above bonus cap:</strong> bonus interest is only paid on the first {fmtMoney(deposit.bonus_max_balance)}.
          The figure above assumes the full balance earns the bonus rate — real returns will be lower as the excess earns
          the base rate.
        </p>
      )}

      <p className="text-[11px] text-gray-500 leading-snug">
        Estimate only — uses monthly compounding at {formatPercent(ratePct / 100)} p.a. Bonus conditions,
        balance tiers and term-specific rates aren't modelled here. See <em>Rates</em> tab for the issuer's
        full breakdown.
      </p>
    </div>
  );
}
