import React, { useState, useEffect } from 'react';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import MortgageCompareTable from '../components/MortgageCompareTable.jsx';
import { useNavigate } from 'react-router-dom';
import { formatMoneyWhole } from '../utils.js';

function CompareMortgagesPage() {
  const { selected, clearSelected } = useSelectedMortgages();
  const navigate = useNavigate();

  const [propertyPrice, setPropertyPrice] = useState(1000000);
  const [loanAmount, setLoanAmount] = useState(800000);
  const [useEighty, setUseEighty] = useState(false);
  const [propertyPriceInput, setPropertyPriceInput] = useState(
    formatMoneyWhole(1000000)
  );
  const [loanAmountInput, setLoanAmountInput] = useState(
    formatMoneyWhole(800000)
  );

  useEffect(() => {
    setPropertyPriceInput(formatMoneyWhole(propertyPrice));
  }, [propertyPrice]);

  useEffect(() => {
    setLoanAmountInput(formatMoneyWhole(loanAmount));
  }, [loanAmount]);

  useEffect(() => {
    if (useEighty) {
      const val = Math.round(propertyPrice * 0.8);
      setLoanAmount(val > 0 ? val : 1);
    }
  }, [propertyPrice, useEighty]);

  if (!selected.length) {
    return (
      <div className="p-4">
        <p>No mortgages selected for comparison.</p>
        <button className="mt-2 px-3 py-1 text-blue-600 underline" onClick={() => navigate('/home-loans')}>
          Back to mortgages
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 min-h-screen overflow-auto">
      <button
        onClick={() => navigate('/home-loans')}
        className="text-accent underline mb-4 text-sm text-left"
      >
        &larr; Go Back
      </button>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">Compare Home Loans</h1>
      <div className="flex justify-end mb-4">
        <button onClick={clearSelected} className="text-sm text-accent underline">Clear All</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-end max-w-xl">
        <label className="flex-1 text-sm">
          <span className="block font-medium mb-1">Property Price</span>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-sm"
            value={propertyPriceInput}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^0-9]/g, '');
              if (digits === '') {
                setPropertyPriceInput('');
                return;
              }
              const val = parseInt(digits, 10);
              if (!Number.isNaN(val) && val > 0) {
                setPropertyPrice(val);
                setPropertyPriceInput(formatMoneyWhole(val));
              }
              const raw = e.target.value.replace(/[^0-9,]/g, '');
              setPropertyPriceInput(raw);
              const val = parseInt(raw.replace(/,/g, ''), 10);
              if (!Number.isNaN(val) && val > 0) setPropertyPrice(val);
            }}
            onBlur={() => setPropertyPriceInput(formatMoneyWhole(propertyPrice))}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            aria-label="Property Price"
          />
        </label>
        <label className="flex-1 text-sm">
          <span className="block font-medium mb-1">Loan Amount</span>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-sm"
            value={loanAmountInput}
            disabled={useEighty}
            onChange={(e) => {
              if (useEighty) return;
              const digits = e.target.value.replace(/[^0-9]/g, '');
              if (digits === '') {
                setLoanAmountInput('');
                return;
              }
              const val = parseInt(digits, 10);
              if (!Number.isNaN(val) && val > 0) {
                setLoanAmount(val);
                setLoanAmountInput(formatMoneyWhole(val));
              }
              const raw = e.target.value.replace(/[^0-9,]/g, '');
              setLoanAmountInput(raw);
              const val = parseInt(raw.replace(/,/g, ''), 10);
              if (!Number.isNaN(val) && val > 0) setLoanAmount(val);
            }}
            onBlur={() => setLoanAmountInput(formatMoneyWhole(loanAmount))}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            aria-label="Loan Amount"
          />
          <label className="flex items-center gap-2 mt-2 text-xs">
            <input
              type="checkbox"
              className="rounded text-accent focus:ring-accent"
              checked={useEighty}
              onChange={(e) => setUseEighty(e.target.checked)}
            />
            Use 80% of Property Price
          </label>
        </label>
      </div>
      <MortgageCompareTable mortgages={selected} loanAmount={loanAmount} />
    </div>
  );
}

export default CompareMortgagesPage;
