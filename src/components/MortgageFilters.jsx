import React from 'react';
import RangeSlider from './RangeSlider';
import { formatPercent } from '../utils.js';

function MortgageFilters({ filters, setFilters, availableFeatures = [], rateBounds = [0,0], banks = [] }) {
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const toggle = (key, val) => {
    setFilters(prev => {
      const arr = prev[key];
      if (arr.includes(val)) {
        return { ...prev, [key]: arr.filter(v => v !== val) };
      }
      return { ...prev, [key]: [...arr, val] };
    });
  };

  const clear = () => {
    localStorage.removeItem('mortgageFilters');
    setFilters({ rate: rateBounds, fees: [], features: [], bank: '' });
  };

  return (
    <div
      className="mb-4 space-y-4 bg-white p-4 rounded-xl shadow-md sticky top-20"
      data-testid="mortgage-filters"
    >
      <h4 className="font-bold">Filters</h4>
      <label className="block text-sm">Bank / Brand
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
      </label>
      {filters.bank && (
        <div className="flex items-center gap-1 mt-1" data-testid="bank-chip">
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
      <div>
        <label className="block text-sm font-semibold mb-2">Interest Rate Range</label>
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
      </div>
      <div>
        <h5 className="font-semibold text-sm">Features</h5>
        {availableFeatures.map(f => (
          <label
            key={f}
            className={`flex items-center text-sm font-medium space-x-2 py-1 cursor-pointer ${filters.features.includes(f) ? 'text-blue-700' : 'text-gray-700'}`}
          >
            <input
              type="checkbox"
              checked={filters.features.includes(f)}
              onChange={() => toggle('features', f)}
              className="rounded text-blue-600 focus:ring-blue-500"
              data-testid={`filter-${f.toLowerCase().replace(/\s+/g,'-')}`}
            />
            <span>{f}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={clear}
        className="text-sm text-blue-600 underline"
        data-testid="clear-all-filters"
      >
        Clear All Filters
      </button>
    </div>
  );
}

export default MortgageFilters;
