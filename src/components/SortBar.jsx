import React from 'react';

// Segmented control sort, like Skyscanner's "Best / Cheapest / Fastest" tabs.
// Plus a "results summary" on the left for orientation.

export const SORTS = [
  { key: 'featured',  label: 'Featured',       hint: 'Sponsored + popular' },
  { key: 'feeAsc',    label: 'Lowest fee',     hint: 'Cheapest annual fee first' },
  { key: 'rateAsc',   label: 'Lowest rate',    hint: 'Cheapest purchase rate first' },
  { key: 'compAsc',   label: 'Lowest comp.',   hint: 'Cheapest comparison rate first' },
];

function SortBar({ summary, sortBy, onSortChange, rightSlot, sorts, freshness }) {
  const options = sorts && sorts.length ? sorts : SORTS;
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div className="text-sm text-gray-700 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
        <span>{summary}</span>
        {freshness}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 hidden sm:inline">Sort</span>
        <div role="tablist" className="bg-gray-100 rounded-lg p-1 flex">
          {options.map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={sortBy === s.key}
              className="sort-pill"
              data-active={sortBy === s.key}
              title={s.hint}
              onClick={() => onSortChange(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {rightSlot}
      </div>
    </div>
  );
}

export default SortBar;
