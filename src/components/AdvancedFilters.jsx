import React from 'react';
import FeatureFilter from './FeatureFilter';

function AdvancedFilters({ filters, setFilters, availableTags = [], banks = [] }) {
  const update = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const setFeatures = (features) => update('features', features);
  const clearAll = () => setFilters({ annualFee: '', features: [], bank: '' });

  return (
    <div className="mb-4 space-y-4 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-md hover:shadow-lg transition divide-y divide-gray-200 dark:divide-gray-700">
      <h4 className="font-bold flex items-center gap-1">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filters
      </h4>
      <FeatureFilter
        active={filters.features}
        setActive={setFeatures}
        tags={availableTags}
      />
      <label className="block text-sm">
        Max Annual Fee
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
      <label className="block text-sm">
        Bank / Brand
        <input
          type="text"
          list="bank-list"
          value={filters.bank || ''}
          onChange={(e) => update('bank', e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1 text-sm"
          placeholder="Any"
        />
        <datalist id="bank-list">
          {banks.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </label>
      <button
        type="button"
        onClick={clearAll}
        className="text-sm text-accent underline"
        data-testid="clear-all-filters"
      >
        Reset All Filters
      </button>
    </div>
  );
}

export default AdvancedFilters;
