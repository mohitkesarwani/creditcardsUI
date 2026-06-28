import React, { useMemo, useState } from 'react';
import { formatMoneyWhole, formatPercent } from '../../utils.js';

// Repayment estimator using standard amortisation. Sliders for loan amount
// and term; switch between the loan's published variable + fixed rates.

function monthlyRepayment(principal, annualRate, years) {
  if (!Number.isFinite(annualRate) || annualRate <= 0) return null;
  if (!Number.isFinite(principal) || principal <= 0) return null;
  const r = annualRate / 12;
  const n = years * 12;
  const m = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Number.isFinite(m) ? m : null;
}

// `pinnedRate` is optional — when present, the estimator uses *that* specific
// rate (from RateFinder) instead of letting the user toggle between the
// loan's headline variable / fixed numbers. Shape:
//   { key, label, rate, comparisonRate }
export default function RepaymentEstimator({
  variableRate,
  fixedRate,
  pinnedRate = null,
  onClearPinned,
}) {
  const [amount, setAmount] = useState(800_000);
  const [years, setYears] = useState(30);
  const [rateKind, setRateKind] = useState(variableRate ? 'variable' : 'fixed');

  // Pinned rate wins. Otherwise fall back to the user's variable/fixed toggle.
  const rate = pinnedRate
    ? pinnedRate.rate
    : rateKind === 'fixed'
    ? fixedRate
    : variableRate;

  const breakdown = useMemo(() => {
    if (!Number.isFinite(rate)) return null;
    const monthly = monthlyRepayment(amount, rate, years);
    if (!monthly) return null;
    const total = monthly * years * 12;
    const interest = total - amount;
    return { monthly, total, interest };
  }, [amount, years, rate]);

  const hasBoth = Number.isFinite(variableRate) && Number.isFinite(fixedRate);

  return (
    <div className="space-y-4">
      {/* If a rate is pinned from Find Your Rate, show what's being used and
          give the user a clear way back to the default. */}
      {pinnedRate ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-blue-700 font-semibold">
                Using rate from Find your rate
              </p>
              <p className="text-sm text-blue-900 mt-0.5">{pinnedRate.label}</p>
              <p className="text-xs text-blue-700 mt-0.5 tabular-nums">
                {formatPercent(pinnedRate.rate)}
                {Number.isFinite(pinnedRate.comparisonRate) && (
                  <span className="text-blue-600/80"> · {formatPercent(pinnedRate.comparisonRate)} comp.</span>
                )}
              </p>
            </div>
            {onClearPinned && (
              <button
                type="button"
                onClick={onClearPinned}
                className="text-xs text-blue-700 hover:text-blue-900 hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      ) : (
        hasBoth && (
          <div role="tablist" className="bg-gray-100 rounded-lg p-1 flex">
            <button
              role="tab"
              aria-selected={rateKind === 'variable'}
              onClick={() => setRateKind('variable')}
              className="sort-pill flex-1"
              data-active={rateKind === 'variable'}
            >
              Variable {Number.isFinite(variableRate) ? `(${(variableRate * 100).toFixed(2)}%)` : ''}
            </button>
            <button
              role="tab"
              aria-selected={rateKind === 'fixed'}
              onClick={() => setRateKind('fixed')}
              className="sort-pill flex-1"
              data-active={rateKind === 'fixed'}
            >
              Fixed {Number.isFinite(fixedRate) ? `(${(fixedRate * 100).toFixed(2)}%)` : ''}
            </button>
          </div>
        )
      )}

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label htmlFor="loan-amount" className="text-sm text-gray-700">Loan amount</label>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">{formatMoneyWhole(amount)}</span>
        </div>
        <input
          id="loan-amount"
          type="range"
          min="100000" max="2000000" step="10000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
          <span>$100k</span><span>$2M</span>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label htmlFor="loan-term" className="text-sm text-gray-700">Loan term</label>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">{years} years</span>
        </div>
        <input
          id="loan-term"
          type="range"
          min="5" max="30" step="1"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
          <span>5 yrs</span><span>30 yrs</span>
        </div>
      </div>

      {breakdown ? (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
          <li className="px-4 py-2.5 flex items-center justify-between bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Monthly repayment</span>
            <span className="text-lg font-bold text-gray-900 tabular-nums">
              {formatMoneyWhole(breakdown.monthly)}
            </span>
          </li>
          <li className="px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Total to repay</span>
            <span className="font-medium text-gray-800 tabular-nums">{formatMoneyWhole(breakdown.total)}</span>
          </li>
          <li className="px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">of which interest</span>
            <span className="font-medium text-gray-800 tabular-nums">{formatMoneyWhole(breakdown.interest)}</span>
          </li>
        </ul>
      ) : (
        <p className="text-xs text-gray-500">No rate published for this option.</p>
      )}

      <p className="text-xs text-gray-500">
        Estimate only — assumes the rate stays constant for the whole term, no offset balance, no extra repayments.
      </p>
    </div>
  );
}
