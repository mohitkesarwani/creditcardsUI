import React from 'react';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import MortgageCompareTable from '../components/MortgageCompareTable.jsx';
import { useNavigate } from 'react-router-dom';

function CompareMortgagesPage() {
  const { selected } = useSelectedMortgages();
  const navigate = useNavigate();

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
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">Compare Home Loans</h1>
      <MortgageCompareTable mortgages={selected} />
    </div>
  );
}

export default CompareMortgagesPage;
