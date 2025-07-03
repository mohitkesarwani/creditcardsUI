import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';

function MortgageCompareStickyButton() {
  const { selected, clearSelected } = useSelectedMortgages();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!selected.length) return null;

  if (isMobile) {
    return (
      <div className="fixed bottom-0 inset-x-0 bg-accent text-white p-3 flex justify-between items-center z-50">
        <span className="text-sm font-medium">{selected.length} selected</span>
        <div className="flex items-center gap-3">
          {selected.length >= 2 && (
            <button onClick={() => navigate('/compare-mortgages')} className="bg-white text-accent font-semibold px-3 py-1 rounded">
              Compare Now ({selected.length})
            </button>
          )}
          <button onClick={clearSelected} className="underline text-sm">
            Clear
          </button>
        </div>
      </div>
    );
  }

  if (selected.length < 2) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-3 z-50">
      <button
        onClick={() => navigate('/compare-mortgages')}
        className="bg-accent text-white px-4 py-2 rounded shadow-lg"
        aria-label={`Compare ${selected.length} selected home loans`}
      >
        Compare Now ({selected.length})
      </button>
      <button
        onClick={clearSelected}
        className="text-sm underline text-accent focus:outline-none"
        aria-label="Clear all selected home loans"
      >
        Clear All
      </button>
    </div>
  );
}

export default MortgageCompareStickyButton;
