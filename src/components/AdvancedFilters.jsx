import React from 'react';
import FeatureFilter from './FeatureFilter';
import RangeSlider from './RangeSlider';
import { formatPercent } from '../utils.js';

const CARD_TYPES = ['', 'Rewards', 'Travel', 'Balance transfer', 'Low interest', 'No annual fee'];

function AdvancedFilters({ filters, setFilters, availableTags = [], interestBounds = [0, 0] }) {
  const update = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const setFeatures = (features) => update('features', features);
  const clearAll = () =>
    setFilters({ type: '', creditScore: '', annualFee: '', interestRate: interestBounds, features: [] });

  return (
    <div className="mb-4 space-y-4 bg-white/80 p-4 rounded-lg shadow-md hover:shadow-lg transition">
      <h4 className="font-bold flex items-center gap-1">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filters
      </h4>
      <label className="block text-sm">
        Card Type
        <select
          className="mt-1 w-full rounded border-gray-300 px-3 py-2 focus:border-brand-start focus:ring-brand-start"
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
        >
          {CARD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t || 'Any'}
            </option>
          ))}
        </select>
      </label>
      <FeatureFilter
        active={filters.features}
        setActive={setFeatures}
        tags={availableTags}
      />
      <details className="space-y-4">
        <summary className="cursor-pointer font-semibold">More Filters</summary>
        <label className="block text-sm">
          Minimum Credit Score
          <input
            type="number"
            className="mt-1 w-full rounded border-gray-300 px-3 py-2 focus:border-brand-start focus:ring-brand-start"
            value={filters.creditScore}
            onChange={(e) => update('creditScore', e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Max Annual Fee
          <input
            type="number"
            className="mt-1 w-full rounded border-gray-300 px-3 py-2 focus:border-brand-start focus:ring-brand-start"
            value={filters.annualFee}
            onChange={(e) => update('annualFee', e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Interest Rate Range
          <RangeSlider
            min={interestBounds[0]}
            max={interestBounds[1]}
            step={0.005}
            value={filters.interestRate}
            onChange={(val) => update('interestRate', val)}
          />
          <div className="text-xs text-gray-600 mt-1">
            Showing: {formatPercent(filters.interestRate[0], 3)} – {formatPercent(filters.interestRate[1], 3)}
          </div>
        </label>
      </details>
      <button
        type="button"
        onClick={clearAll}
        className="text-sm text-brand-start underline"
        data-testid="clear-all-filters"
      >
        Clear All Filters
      </button>
    </div>
  );
}

export default AdvancedFilters;
