import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';

const FALLBACK_IMG = '/assets/image-not-available.svg';

// Mirror of CompareStickyButton but for home loans: thumbnails along the
// bottom, Compare CTA when 2+ selected.
function MortgageCompareStickyButton() {
  const { selected, toggleMortgage, clearSelected } = useSelectedMortgages();
  const navigate = useNavigate();

  if (!selected.length) return null;

  return (
    <div
      role="region"
      aria-label="Home-loan selection"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <span className="hidden md:inline text-sm font-medium text-gray-700 whitespace-nowrap">
          {selected.length} of 3 selected
        </span>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {selected.map((m) => (
            <div
              key={m.id}
              className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg pl-2 pr-7 py-1.5 shrink-0 max-w-[220px]"
              title={m.name}
            >
              <img
                src={m.productImageUrl || m.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                alt=""
                className="w-8 h-6 object-contain rounded"
              />
              <span className="text-xs font-medium text-gray-700 truncate">
                {m.brandName || m.bank_name || m.brand} · {m.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${m.name}`}
                onClick={() => toggleMortgage(m)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200"
              >
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - selected.length) }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 shrink-0"
            >
              Pick {2 - selected.length - i} more
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearSelected}
            className="text-sm text-gray-500 hover:underline"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={selected.length < 2}
            onClick={() => navigate('/compare-mortgages')}
            className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default MortgageCompareStickyButton;
