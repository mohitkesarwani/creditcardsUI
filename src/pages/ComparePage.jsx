import React from 'react';
import { useSelectedCards } from '../hooks/useSelectedCards';
import CompareTable from '../components/CompareTable';
import { useNavigate } from 'react-router-dom';
import Disclaimers from '../components/Disclaimers';

function ComparePage() {
  const { selected } = useSelectedCards();
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
    <div className="p-4 md:p-8 bg-gradient-to-br from-brand-start/10 to-brand-end/10 min-h-screen overflow-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-brand-start mb-4 text-center">
        Browse &amp; Compare Credit Cards
      </h1>
      <CompareTable cards={selected} />
      <Disclaimers className="mt-8" />
    </div>
  );
}

export default ComparePage;
