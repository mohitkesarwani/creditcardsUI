import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';

function CompareStickyButton() {
  const { selected } = useSelectedCards();
  const navigate = useNavigate();

  if (selected.length < 2) return null;

  return (
    <button
      onClick={() => navigate('/compare')}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-accent text-white px-4 py-2 rounded shadow-lg z-50"
    >
      Compare Now ({selected.length})
    </button>
  );
}

export default CompareStickyButton;
