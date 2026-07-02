import React, { useMemo, useState } from 'react';
import { formatPercent } from '../../utils.js';

// "How long to reach my goal?" calculator. Inverse of the interest-earned
// calculator: given a target balance, starting amount, monthly deposit and
// rate — solve for months.
//
// Closed-form for future value of an annuity:
//   FV = P(1+r)^n + C * [((1+r)^n − 1) / r]
//   Solve numerically (binary search over n) because n is the unknown.

const fmtMoney = (n) =>
  Number.isFinite(n) ? `$${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })}` : '—';

const fmtDuration = (months) => {
  if (!Number.isFinite(months) || months <= 0) return '—';
  if (months < 12) return `${Math.round(months)} mo`;
  const y = Math.floor(months / 12);
  const m = Math.round(months - y * 12);
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
};

function futureValue({ principal, monthly, ratePct, months }) {
  const r = (ratePct / 100) / 12;
  if (r === 0) return principal + monthly * months;
  return principal * Math.pow(1 + r, months) + monthly * ((Math.pow(1 + r, months) - 1) / r);
}

function monthsToReach({ principal, monthly, ratePct, target }) {
  if (target <= principal) return 0;
  // If nothing earns and nothing is added, never reach.
  if (monthly <= 0 && (ratePct <= 0 || principal <= 0)) return Infinity;
  let lo = 0;
  let hi = 600; // 50 years upper bound
  // Sanity: bail if even 600 months won't reach
  if (futureValue({ principal, monthly, ratePct, months: hi }) < target) return Infinity;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    if (futureValue({ principal, monthly, ratePct, months: mid }) < target) lo = mid;
    else hi = mid;
  }
  return hi;
}

function defaultsFor(deposit) {
  return {
    target: 50_000,
    principal: 5_000,
    monthly: 500,
    ratePct: ((deposit?.headlineRateNumber ?? 0.045) * 100).toFixed(2) * 1,
  };
}

export default function SavingsGoalCalculator({ deposit }) {
  const d = defaultsFor(deposit);

  const minPrincipal = Number.isFinite(deposit?.min_deposit_amount) && deposit.min_deposit_amount > 0
    ? deposit.min_deposit_amount
    : 0;

  const [target, setTarget] = useState(d.target);
  const [principal, setPrincipal] = useState(Math.max(d.principal, minPrincipal));
  const [monthly, setMonthly] = useState(d.monthly);
  const [ratePct, setRatePct] = useState(d.ratePct);

  const belowMin = minPrincipal > 0 && principal < minPrincipal;
  const overBonusCap =
    Number.isFinite(deposit?.bonus_max_balance) &&
    deposit.bonus_max_balance > 0 &&
    target > deposit.bonus_max_balance;

  const result = useMemo(() => {
    const months = monthsToReach({ principal, monthly, ratePct, target });
    const totalContributed = principal + monthly * months;
    const interest = Number.isFinite(months) ? target - totalContributed : null;
    return { months, totalContributed, interest };
  }, [target, principal, monthly, ratePct]);

  const unreachable = !Number.isFinite(result.months) || result.months === Infinity;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
            Goal amount
          </span>
          <input
            type="number"
            min={0}
            step={500}
            value={target}
            onChange={(e) => setTarget(Math.max(0, Number(e.target.value) || 0))}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 tabular-nums"
          />
        </label>
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
            step={25}
            value={monthly}
            onChange={(e) => setMonthly(Math.max(0, Number(e.target.value) || 0))}
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
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Time to goal</p>
          <p className={`text-lg font-semibold tabular-nums ${unreachable ? 'text-red-700' : 'text-gray-900'}`}>
            {unreachable ? '50+ yr' : fmtDuration(result.months)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">You contribute</p>
          <p className="text-lg font-semibold text-gray-700 tabular-nums">
            {unreachable ? '—' : fmtMoney(result.totalContributed)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Interest earned</p>
          <p className="text-lg font-semibold text-emerald-700 tabular-nums">
            {unreachable ? '—' : fmtMoney(result.interest)}
          </p>
        </div>
      </div>

      {unreachable && (
        <p className="text-xs text-red-700">
          Increase the monthly deposit or rate to reach this goal within a reasonable timeframe.
        </p>
      )}

      {overBonusCap && (
        <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 leading-snug">
          <strong>Above bonus cap:</strong> bonus interest stops paying above {fmtMoney(deposit.bonus_max_balance)}.
          The figure above assumes the bonus rate applies to the whole goal — real time-to-goal will be longer
          once the balance crosses the cap.
        </p>
      )}

      <p className="text-[11px] text-gray-500 leading-snug">
        Estimate only — uses monthly compounding at {formatPercent(ratePct / 100)} p.a. and assumes
        contributions never miss. Bonus conditions are not modelled.
      </p>
    </div>
  );
}
