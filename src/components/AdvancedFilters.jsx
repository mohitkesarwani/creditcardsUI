import React from 'react';
import FeatureFilter from './FeatureFilter';

const CARD_TYPES = ['', 'Rewards', 'Travel', 'Balance transfer', 'Low interest', 'No annual fee'];

function AdvancedFilters({ filters, setFilters }) {
  const update = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const setFeatures = (features) => update('features', features);

  return (
    <div className="mb-4 space-y-4">
      <h4 className="font-bold">Filters</h4>
      <label className="block text-sm">
        Card Type
        <select
          className="mt-1 border rounded p-1 w-full"
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
      <label className="block text-sm">
        Minimum Credit Score
        <input
          type="number"
          className="mt-1 border rounded p-1 w-full"
          value={filters.creditScore}
          onChange={(e) => update('creditScore', e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Max Annual Fee
        <input
          type="number"
          className="mt-1 border rounded p-1 w-full"
          value={filters.annualFee}
          onChange={(e) => update('annualFee', e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Max Interest Rate
        <input
          type="number"
          className="mt-1 border rounded p-1 w-full"
          value={filters.interestRate}
          onChange={(e) => update('interestRate', e.target.value)}
        />
      </label>
      <FeatureFilter active={filters.features} setActive={setFeatures} />
    </div>
  );
}

export default AdvancedFilters;
