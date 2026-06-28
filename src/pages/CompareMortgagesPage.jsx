import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import MortgageCompareTable from '../components/MortgageCompareTable.jsx';
import ComparisonRateWarning from '../components/ComparisonRateWarning.jsx';
import Disclaimers from '../components/Disclaimers.jsx';
import { formatMoneyWhole } from '../utils.js';

function MoneyInput({ label, value, onChange, disabled }) {
  const [text, setText] = useState(formatMoneyWhole(value));
  useEffect(() => { setText(formatMoneyWhole(value)); }, [value]);
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</span>
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, '');
          setText(digits === '' ? '' : formatMoneyWhole(parseInt(digits, 10)));
          if (digits) onChange(parseInt(digits, 10));
        }}
        onBlur={() => setText(formatMoneyWhole(value))}
        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        className="w-full text-sm font-medium tabular-nums"
        aria-label={label}
      />
    </label>
  );
}

function TermSelect({ value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Loan term</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-sm font-medium"
      >
        {[15, 20, 25, 30].map((y) => (
          <option key={y} value={y}>{y} years</option>
        ))}
      </select>
    </label>
  );
}

function CompareMortgagesPage() {
  const { selected, clearSelected } = useSelectedMortgages();
  const navigate = useNavigate();

  const [propertyPrice, setPropertyPrice] = useState(1_000_000);
  const [loanAmount, setLoanAmount] = useState(800_000);
  const [useEighty, setUseEighty] = useState(false);
  const [loanTerm, setLoanTerm] = useState(30);

  useEffect(() => {
    if (useEighty) {
      const val = Math.round(propertyPrice * 0.8);
      setLoanAmount(val > 0 ? val : 1);
    }
  }, [propertyPrice, useEighty]);

  if (!selected.length) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-gray-700 mb-4">No home loans selected for comparison.</p>
        <button
          onClick={() => navigate('/home-loans')}
          className="text-blue-600 hover:underline"
        >
          Browse home loans →
        </button>
      </div>
    );
  }

  const showRateWarning = selected.some((m) => m.comparisonRate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 md:px-8 py-3 flex justify-between items-center">
        <span className="font-semibold text-gray-900">Compare home loans</span>
        <button onClick={clearSelected} className="text-sm underline text-gray-600 hover:text-gray-800">
          Clear all
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Loan-amount input panel */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
          <h2 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-4">
            Repayment assumptions
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <MoneyInput label="Property price" value={propertyPrice} onChange={setPropertyPrice} />
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={useEighty}
                  onChange={(e) => setUseEighty(e.target.checked)}
                  className="accent-blue-600"
                />
                Auto-set to 80% of price
              </label>
              <MoneyInput
                label="Loan amount"
                value={loanAmount}
                onChange={setLoanAmount}
                disabled={useEighty}
              />
            </div>
            <TermSelect value={loanTerm} onChange={setLoanTerm} />
            <div className="text-xs text-gray-500 leading-snug">
              Repayment columns below recompute against the lowest <strong>owner-occupied variable</strong> rate published by each loan.
            </div>
          </div>
        </section>

        <MortgageCompareTable mortgages={selected} loanAmount={loanAmount} loanTerm={loanTerm} />

        {showRateWarning && <ComparisonRateWarning />}
        <Disclaimers />
      </div>
    </div>
  );
}

export default CompareMortgagesPage;
