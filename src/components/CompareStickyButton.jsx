import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';

const FALLBACK_IMG = '/assets/image-not-available.svg';

// Flight-comparison-style selection bar pinned to the bottom of the page.
// Shows a thumbnail per selected card with an X to remove, plus the Compare
// CTA which lights up at 2+.
function CompareStickyButton() {
  const { selected, toggleCard, clearSelected } = useSelectedCards();
  const navigate = useNavigate();

  if (!selected.length) return null;

  return (
    <div
      role="region"
      aria-label="Card selection"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-hairline glass shadow-lift-lg animate-fade-up"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <span className="hidden md:inline text-sm font-medium text-gray-700 whitespace-nowrap">
          {selected.length} of 4 selected
        </span>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {selected.map((c) => (
            <div
              key={c.id}
              className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg pl-2 pr-7 py-1.5 shrink-0 max-w-[200px]"
              title={c.name}
            >
              <img
                src={c.productImageUrl || c.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                alt=""
                className="w-8 h-6 object-contain rounded"
              />
              <span className="text-xs font-medium text-gray-700 truncate">{c.name}</span>
              <button
                type="button"
                aria-label={`Remove ${c.name}`}
                onClick={() => toggleCard(c)}
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
            onClick={() => navigate('/compare')}
            className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompareStickyButton;
