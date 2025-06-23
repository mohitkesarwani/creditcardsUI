import React from 'react';
import FeatureFilter from './FeatureFilter';

const CARD_TYPES = ['', 'Rewards', 'Travel', 'Balance transfer', 'Low interest', 'No annual fee'];

function AdvancedFilters({ filters, setFilters }) {
  const update = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const setFeatures = (features) => update('features', features);

  return (
    <div className="mb-4 space-y-4 bg-white/70 p-4 rounded shadow">
      <h4 className="font-bold">Filters</h4>
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
      <FeatureFilter active={filters.features} setActive={setFeatures} />
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
          Max Interest Rate
          <input
            type="number"
            className="mt-1 w-full rounded border-gray-300 px-3 py-2 focus:border-brand-start focus:ring-brand-start"
            value={filters.interestRate}
            onChange={(e) => update('interestRate', e.target.value)}
          />
        </label>
      </details>
    </div>
  );
}

export default AdvancedFilters;
