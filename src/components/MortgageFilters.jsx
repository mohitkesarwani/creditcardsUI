import React from 'react';
import RangeSlider from './RangeSlider';
import FeatureFilter from './FeatureFilter';
import { formatPercent } from '../utils.js';

function MortgageFilters({ filters, setFilters, availableFeatures = [], rateBounds = [0,0], banks = [] }) {
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const setFeatures = (features) => update('features', features);

  const clear = () => {
    localStorage.removeItem('mortgageFilters');
    setFilters({ rate: rateBounds, fees: [], features: [], bank: '' });
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-md divide-y divide-gray-100"
      data-testid="mortgage-filters"
    >
      <details open className="p-4" aria-label="Filter by bank or brand">
        <summary className="text-lg font-semibold mb-2 cursor-pointer">Bank / Brand</summary>
        <input
          type="text"
          list="bank-list"
          value={filters.bank}
          onChange={(e) => update('bank', e.target.value)}
          placeholder="Search bank..."
          className="mt-1 w-full border rounded px-2 py-2 text-sm"
        />
        <datalist id="bank-list">
          {banks.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        {filters.bank && (
          <div className="flex items-center gap-1 mt-2" data-testid="bank-chip">
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              {filters.bank}
            </span>
            <button
              type="button"
              onClick={() => update('bank', '')}
              aria-label="Clear bank"
              className="text-xs text-accent"
            >
              ×
            </button>
          </div>
        )}
      </details>
      <details open className="p-4" aria-label="Filter by interest rate">
        <summary className="text-lg font-semibold mb-2 cursor-pointer">Interest Rate Range</summary>
        <RangeSlider
          min={rateBounds[0]}
          max={rateBounds[1]}
          step={0.005}
          value={filters.rate}
          onChange={(val) => update('rate', val)}
          asPercent
        />
        <div className="text-xs text-gray-600 mt-1">
          Showing: {formatPercent(filters.rate[0], 3)} – {formatPercent(filters.rate[1], 3)}
        </div>
      </details>
      <details open className="p-4" aria-label="Filter by features">
        <summary className="text-lg font-semibold mb-2 cursor-pointer">Filter Features</summary>
        <FeatureFilter
          active={filters.features}
          setActive={setFeatures}
          tags={availableFeatures}
        />
      </details>
      <button
        type="button"
        onClick={clear}
        className="block w-full text-sm underline text-gray-500 hover:text-gray-800 px-4 py-4 text-left"
        data-testid="clear-all-filters"
        aria-label="Reset all filters"
      >
        Reset All Filters
      </button>
    </div>
  );
}

export default MortgageFilters;
