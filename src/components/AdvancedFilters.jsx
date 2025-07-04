import React from 'react';
import FeatureFilter from './FeatureFilter';

function AdvancedFilters({ filters, setFilters, availableTags = [], banks = [] }) {
  const update = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const setFeatures = (features) => update('features', features);
  const clearAll = () => setFilters({ annualFee: '', features: [], bank: '' });

  return (
    <div className="space-y-4 p-4 overflow-y-auto max-h-screen bg-white">
      <button
        type="button"
        onClick={clearAll}
        className="text-sm underline text-gray-500 hover:text-gray-800"
        data-testid="clear-all-filters"
      >
        Clear Filters
      </button>
      <details open className="border border-gray-200 rounded-xl p-4 first:mt-0 mt-4">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Features</summary>
        <FeatureFilter
          active={filters.features}
          setActive={setFeatures}
          tags={availableTags}
        />
      </details>
      <details open className="border border-gray-200 rounded-xl p-4 mt-4">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Max Annual Fee</summary>
        <label className="block text-sm">
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min="0"
              max="1000"
              value={filters.annualFee || 1000}
              onChange={(e) =>
                update('annualFee', e.target.value === '1000' ? '' : e.target.value)
              }
              className="w-full accent-accent"
            />
            <span className="text-xs font-medium w-12 text-right">
              {filters.annualFee ? `$${filters.annualFee}` : 'Any'}
            </span>
          </div>
        </label>
      </details>
      <details open className="border border-gray-200 rounded-xl p-4 mt-4">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Bank / Brand</summary>
        <select
          value={filters.bank}
          onChange={(e) => update('bank', e.target.value)}
          className="mt-1 w-full border rounded px-2 py-2 text-sm"
        >
          <option value="">Any</option>
          {banks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </details>
    </div>
  );
}

export default AdvancedFilters;
