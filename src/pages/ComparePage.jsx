import React from 'react';
import { useSelectedCards } from '../hooks/useSelectedCards';
import CompareTable from '../components/CompareTable';
import { useNavigate } from 'react-router-dom';

function ComparePage() {
  const { selected, clearSelected } = useSelectedCards();
  const navigate = useNavigate();

  if (!selected.length) {
    return (
      <div className="p-4">
        <p>No cards selected for comparison.</p>
        <button
          className="mt-2 px-3 py-1 text-blue-600 underline"
          onClick={() => navigate('/credit-cards')}
        >
          Back to cards
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <span className="font-semibold">Compare Credit Cards</span>
        <button onClick={clearSelected} className="text-sm underline text-gray-600 hover:text-gray-800">Clear All</button>
      </div>
      <div className="p-4 md:p-8">
        <CompareTable cards={selected} />
      </div>
    </div>
  );
}

export default ComparePage;
