import React from 'react';
import { useSelectedCards } from '../hooks/useSelectedCards';
import CompareTable from '../components/CompareTable';
import { useNavigate } from 'react-router-dom';

function ComparePage() {
  const { selected } = useSelectedCards();
  const navigate = useNavigate();

  if (!selected.length) {
    return (
      <div className="p-4">
        <p>No cards selected for comparison.</p>
        <button
          className="mt-2 px-3 py-1 text-blue-600 underline"
          onClick={() => navigate('/cards')}
        >
          Back to cards
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-auto">
      <CompareTable cards={selected} />
    </div>
  );
}

export default ComparePage;
