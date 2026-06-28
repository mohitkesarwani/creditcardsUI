import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';
import CompareTable from '../components/CompareTable';
import ComparisonRateWarning from '../components/ComparisonRateWarning.jsx';
import Disclaimers from '../components/Disclaimers.jsx';

function ComparePage() {
  const { selected, clearSelected } = useSelectedCards();
  const navigate = useNavigate();

  if (!selected.length) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-gray-700 mb-4">No cards selected for comparison.</p>
        <button
          onClick={() => navigate('/credit-cards')}
          className="text-blue-600 hover:underline"
        >
          Browse credit cards →
        </button>
      </div>
    );
  }

  const showRateWarning = selected.some((c) => c.comparisonRate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 md:px-8 py-3 flex justify-between items-center">
        <span className="font-semibold text-gray-900">Compare credit cards</span>
        <button onClick={clearSelected} className="text-sm underline text-gray-600 hover:text-gray-800">
          Clear all
        </button>
      </div>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <CompareTable cards={selected} />
        {showRateWarning && <ComparisonRateWarning />}
        <Disclaimers />
      </div>
    </div>
  );
}

export default ComparePage;
