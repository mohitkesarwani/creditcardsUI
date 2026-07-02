import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedDeposits } from '../hooks/useSelectedDeposits.jsx';
import DepositCompareTable from '../components/DepositCompareTable.jsx';
import Disclaimers from '../components/Disclaimers.jsx';
import { formatMoneyWhole } from '../utils.js';

function MoneyInput({ label, value, onChange }) {
  const [text, setText] = useState(formatMoneyWhole(value));
  useEffect(() => { setText(formatMoneyWhole(value)); }, [value]);
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">{label}</span>
      <input
        type="text"
        value={text}
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

function CompareDepositsPage() {
  const { selected, clearSelected } = useSelectedDeposits();
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState(10_000);

  if (!selected.length) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-gray-700 mb-4">No deposits selected for comparison.</p>
        <button
          onClick={() => navigate('/deposits')}
          className="text-blue-600 hover:underline"
        >
          Browse deposits →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 md:px-8 py-3 flex justify-between items-center">
        <span className="font-semibold text-gray-900">Compare deposits</span>
        <button onClick={clearSelected} className="text-sm underline text-gray-600 hover:text-gray-800">
          Clear all
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
          <h2 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-4">
            Yield estimate assumption
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <MoneyInput label="Balance to compare" value={principal} onChange={setPrincipal} />
            <div className="text-xs text-gray-500 leading-snug">
              The "Interest on $X / 1 yr" row uses simple compound-monthly interest at each product's headline rate.
              Real returns depend on bonus conditions, balance tiers and term — see each product's detail page.
            </div>
          </div>
        </section>

        <DepositCompareTable deposits={selected} principal={principal} />

        <Disclaimers />
      </div>
    </div>
  );
}

export default CompareDepositsPage;
