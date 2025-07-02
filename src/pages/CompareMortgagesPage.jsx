import React, { useState, useEffect } from 'react';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import MortgageCompareTable from '../components/MortgageCompareTable.jsx';
import { useNavigate } from 'react-router-dom';
import { formatMoneyWhole, formatMoneyWholeNoSymbol } from '../utils.js';

function CompareMortgagesPage() {
  const { selected, clearSelected } = useSelectedMortgages();
  const navigate = useNavigate();

  const [propertyPrice, setPropertyPrice] = useState(1000000);
  const [loanAmount, setLoanAmount] = useState(800000);
  const [useEighty, setUseEighty] = useState(false);
  const [propertyPriceInput, setPropertyPriceInput] = useState(
    formatMoneyWholeNoSymbol(1000000)
  );
  const [loanAmountInput, setLoanAmountInput] = useState(
    formatMoneyWholeNoSymbol(800000)
  );

  useEffect(() => {
    setPropertyPriceInput(formatMoneyWholeNoSymbol(propertyPrice));
  }, [propertyPrice]);

  useEffect(() => {
    setLoanAmountInput(formatMoneyWholeNoSymbol(loanAmount));
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <label className="text-sm">
            <span className="block font-medium mb-1">Property Price</span>
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <span className="flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-500 text-sm">$</span>
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
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
                    setPropertyPriceInput(formatMoneyWholeNoSymbol(val));
                  }
                }}
              onBlur={() =>
                setPropertyPriceInput(formatMoneyWholeNoSymbol(propertyPrice))
              }
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              aria-label="Property Price"
            />
          </div>
        </label>
          <label className="text-sm">
            <span className="block font-medium mb-1">Loan Amount</span>
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <span className="flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-500 text-sm">$</span>
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
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
                    setLoanAmountInput(formatMoneyWholeNoSymbol(val));
                  }
                }}
              onBlur={() =>
                setLoanAmountInput(formatMoneyWholeNoSymbol(loanAmount))
              }
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              aria-label="Loan Amount"
            />
          </div>
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
      </div>
      <MortgageCompareTable mortgages={selected} loanAmount={loanAmount} />
    </div>
  );
}

export default CompareMortgagesPage;
