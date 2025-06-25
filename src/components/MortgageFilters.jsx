import React from 'react';
import RangeSlider from './RangeSlider';
import { formatPercent } from '../utils.js';

function MortgageFilters({ filters, setFilters, availableFeatures = [], availableEligibility = [], rateBounds = [0,0] }) {
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

  const clear = () => setFilters({ rate: rateBounds, fees: [], features: [], eligibility: [] });

  return (
    <div className="mb-4 space-y-4 bg-white/80 p-4 rounded-lg shadow-md" data-testid="mortgage-filters">
      <h4 className="font-bold">Filters</h4>
      <div>
        <label className="block text-sm font-semibold mb-2">Interest Rate Range</label>
        <RangeSlider
          min={rateBounds[0]}
          max={rateBounds[1]}
          step={0.005}
          value={filters.rate}
          onChange={(val) => update('rate', val)}
        />
        <div className="text-xs text-gray-600 mt-1">
          Showing: {formatPercent(filters.rate[0], 3)} – {formatPercent(filters.rate[1], 3)}
        </div>
      </div>
      <div>
        <h5 className="font-semibold text-sm">Features</h5>
        {availableFeatures.map(f => (
          <label key={f} className="flex items-center text-sm space-x-2 py-1">
            <input
              type="checkbox"
              checked={filters.features.includes(f)}
              onChange={() => toggle('features', f)}
              className="rounded text-brand-start focus:ring-brand-start"
              data-testid={`filter-${f.toLowerCase().replace(/\s+/g,'-')}`}
            />
            <span>{f}</span>
          </label>
        ))}
      </div>
      <div>
        <h5 className="font-semibold text-sm">Eligibility</h5>
        {availableEligibility.map(f => (
          <label key={f} className="flex items-center text-sm space-x-2 py-1">
            <input
              type="checkbox"
              checked={filters.eligibility.includes(f)}
              onChange={() => toggle('eligibility', f)}
              className="rounded text-brand-start focus:ring-brand-start"
              data-testid={`elig-${f.toLowerCase().replace(/\s+/g,'-')}`}
            />
            <span>{f}</span>
          </label>
        ))}
      </div>
      <button type="button" onClick={clear} className="text-sm text-brand-start underline" data-testid="clear-all-filters">Clear All Filters</button>
    </div>
  );
}

export default MortgageFilters;
