import React, { useState, useMemo, useEffect } from 'react';
import { formatMoney, formatMoneyWhole } from '../utils.js';
import RepaymentChart from './RepaymentChart.jsx';

function calcMonthly(amount, rate, years) {
  const r = parseFloat(rate);
  if (Number.isNaN(r)) return null;
  const monthly = r / 100 / 12;
  const n = years * 12;
  const payment = (amount * monthly) / (1 - Math.pow(1 + monthly, -n));
  return payment;
}

function generateSchedule(amount, rate, years, interestOnly) {
  const r = parseFloat(rate);
  if (Number.isNaN(r) || !amount || !years) return [];
  const monthlyRate = r / 100 / 12;
  const months = years * 12;
  const payment = interestOnly ? amount * monthlyRate : calcMonthly(amount, rate, years);
  let balance = amount;
  const schedule = [];
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principal = interestOnly ? 0 : payment - interest;
    balance = interestOnly ? balance : Math.max(0, balance - principal);
    schedule.push({ month: m, payment, principal, interest, balance });
  }
  return schedule;
}

function LoanRepaymentCalculator({ rate: defaultRate = 0, onChange }) {
  const [propertyPrice, setPropertyPrice] = useState(1000000);
  const [loanAmount, setLoanAmount] = useState(800000);
  const [rate, setRate] = useState(parseFloat(defaultRate) || 0);
  const [term, setTerm] = useState(30);
  const [interestOnly, setInterestOnly] = useState(false);
  const [propertyPriceInput, setPropertyPriceInput] = useState(
    formatMoneyWhole(1000000)
  );
  const [loanAmountInput, setLoanAmountInput] = useState(
    formatMoneyWhole(800000)
  );
  const [rateInput, setRateInput] = useState(rate.toFixed(2) + '%');

  // Update rate if defaultRate prop changes
  useEffect(() => {
    const parsed = parseFloat(defaultRate);
    if (!Number.isNaN(parsed)) {
      setRate(parsed);
      setRateInput(parsed.toFixed(2) + '%');
    }
  }, [defaultRate]);

  // Keep formatted input fields in sync with numeric values
  useEffect(() => {
    setPropertyPriceInput(formatMoneyWhole(propertyPrice));
  }, [propertyPrice]);

  useEffect(() => {
    setLoanAmountInput(formatMoneyWhole(loanAmount));
  }, [loanAmount]);

  useEffect(() => {
    setRateInput(rate.toFixed(2) + '%');
  }, [rate]);

  const validInputs =
    propertyPrice > 0 &&
    propertyPrice <= 10000000 &&
    loanAmount > 0 &&
    loanAmount <= 10000000 &&
    rate > 0 &&
    term > 0;

  const suggest = () => {
    const val = Math.round(propertyPrice * 0.8);
    setLoanAmount(val);
    setLoanAmountInput(formatMoneyWhole(val));
  };

  const schedule = useMemo(
    () =>
      validInputs ? generateSchedule(loanAmount, rate, term, interestOnly) : [],
    [loanAmount, rate, term, interestOnly, validInputs]
  );

  const monthly = useMemo(() => {
    if (!validInputs) return null;
    return interestOnly
      ? loanAmount * (rate / 100 / 12)
      : calcMonthly(loanAmount, rate, term);
  }, [loanAmount, rate, term, interestOnly, validInputs]);

  const total = monthly ? monthly * term * 12 : null;
  const costPerDollar = total ? total / loanAmount : null;

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ monthly, total, costPerDollar });
    }
  }, [monthly, total, costPerDollar, onChange]);

  return (
    <div className="space-y-4" id="loan-calculator">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="text-sm">Property Price
          <input
            type="text"
            className="mt-1 w-full text-sm"
            aria-label="Property Price"
            value={propertyPriceInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9,]/g, '');
              setPropertyPriceInput(raw);
              const val = parseInt(raw.replace(/,/g, ''), 10);
              if (!Number.isNaN(val)) setPropertyPrice(val);
            }}
            onBlur={() =>
              setPropertyPriceInput(formatMoneyWhole(propertyPrice))
            }
          />
        </label>
        <label className="text-sm">Loan Amount
          <input
            type="text"
            className="mt-1 w-full text-sm"
            aria-label="Loan Amount"
            value={loanAmountInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9,]/g, '');
              setLoanAmountInput(raw);
              const val = parseInt(raw.replace(/,/g, ''), 10);
              if (!Number.isNaN(val)) setLoanAmount(val);
            }}
            onBlur={() => setLoanAmountInput(formatMoneyWhole(loanAmount))}
          />
        </label>
        <label className="text-sm">Interest Rate
          <input
            type="text"
            className="mt-1 w-full text-sm"
            aria-label="Interest Rate"
            value={rateInput}
            onChange={(e) => {
              const raw = e.target.value;
              setRateInput(raw);
              const val = parseFloat(raw.replace(/[^0-9.]/g, ''));
              if (!Number.isNaN(val)) setRate(val);
            }}
            onBlur={() => setRateInput(rate.toFixed(2) + '%')}
          />
          <input
            type="range"
            min="0"
            max="20"
            step="0.05"
            className="w-full mt-1"
            value={rate}
            aria-label="Adjust Interest Rate"
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
        </label>
        <label className="text-sm">Term (years)
          <select
            className="mt-1 w-full text-sm"
            aria-label="Term (years)"
            value={term}
            onChange={(e) => setTerm(parseInt(e.target.value, 10))}
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            className="w-full mt-1"
            value={term}
            aria-label="Adjust Term"
            onChange={(e) => setTerm(parseInt(e.target.value, 10))}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={interestOnly}
            onChange={(e) => setInterestOnly(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          Interest Only
        </label>
        {interestOnly && (
          <p className="text-red-600 text-xs" role="alert">
            Interest-only loans may increase total repayment costs.
          </p>
        )}
        <button type="button" onClick={suggest} className="text-xs text-blue-600 underline">
          Use 80% of Price
        </button>
        <span className="cursor-help" title="We assume an 80% LVR as a common lending benchmark">?</span>
        <span className="text-xs text-gray-500" title="CoreLogic 2025 Median Price">
          Default values from CoreLogic 2025 Median Price
        </span>
        <span className="cursor-help text-xs" title="These values come from CoreLogic's 2025 median property data">?</span>
      </div>
      {monthly ? (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Monthly Repayment: {formatMoney(monthly)}</p>
          <p>Total Repayment: {formatMoney(total)}</p>
          <p className="col-span-2 text-xs text-gray-600">
            Cost per $1 borrowed: {formatMoney(costPerDollar)}
          </p>
        </div>
      ) : (
        <p className="text-red-600 text-sm" role="alert">Please enter valid values for calculation</p>
      )}
      <RepaymentChart schedule={schedule} />
    </div>
  );
}

export default LoanRepaymentCalculator;
