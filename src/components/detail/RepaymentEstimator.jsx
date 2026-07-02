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
//
// `loan` is optional — when present, the loan-amount and term sliders are
// clamped to its published min_loan_amount / max_loan_amount / max_term_months.
// Without it the sliders fall back to safe AU defaults ($100k–$2M, 5–30 yrs).
export default function RepaymentEstimator({
  variableRate,
  fixedRate,
  pinnedRate = null,
  onClearPinned,
  loan = null,
}) {
  // Slider bounds — fall back to safe defaults when the loan doesn't publish.
  const minAmount = Number.isFinite(loan?.min_loan_amount) && loan.min_loan_amount > 0
    ? Math.round(loan.min_loan_amount / 10_000) * 10_000
    : 100_000;
  const maxAmountRaw = Number.isFinite(loan?.max_loan_amount) && loan.max_loan_amount > minAmount
    ? Math.round(loan.max_loan_amount / 10_000) * 10_000
    : 2_000_000;
  // Cap absurd published maxes for slider sanity (some loans say $50M).
  const maxAmount = Math.min(maxAmountRaw, 5_000_000);

  const maxYearsFromLoan = Number.isFinite(loan?.max_term_months)
    ? Math.floor(loan.max_term_months / 12)
    : null;
  const maxYears = maxYearsFromLoan ? Math.min(40, Math.max(5, maxYearsFromLoan)) : 30;

  const defaultAmount = Math.min(Math.max(800_000, minAmount), maxAmount);
  const defaultYears = Math.min(30, maxYears);

  const [amount, setAmount] = useState(defaultAmount);
  const [years, setYears] = useState(defaultYears);
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
          min={minAmount} max={maxAmount} step="10000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
          <span>{formatMoneyWhole(minAmount)}</span><span>{formatMoneyWhole(maxAmount)}</span>
        </div>
        {loan && (Number.isFinite(loan.min_loan_amount) || Number.isFinite(loan.max_loan_amount)) && (
          <p className="text-[10px] text-gray-500 mt-0.5">
            Slider range follows this loan's published limits.
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label htmlFor="loan-term" className="text-sm text-gray-700">Loan term</label>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">{years} years</span>
        </div>
        <input
          id="loan-term"
          type="range"
          min="5" max={maxYears} step="1"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
          <span>5 yrs</span><span>{maxYears} yrs</span>
        </div>
        {maxYearsFromLoan && maxYears < 30 && (
          <p className="text-[10px] text-gray-500 mt-0.5">
            Max term capped at {maxYears} years for this loan.
          </p>
        )}
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
