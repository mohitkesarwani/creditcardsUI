import React from 'react';
import FeatureFilter from './FeatureFilter';
import RangeSlider from './RangeSlider';

function DepositFilters({ filters, setFilters, availableFeatures = [], rateBounds = [0,0], banks = [] }) {
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const setFeatures = (features) => update('features', features);

  const clear = () => {
    setFilters({ rate: rateBounds, features: [], bank: '' });
  };

  return (
    <div className="bg-white rounded-2xl divide-y divide-gray-100 overflow-y-auto max-h-screen p-4">
      <button type="button" onClick={clear} className="w-full text-sm underline text-gray-500 hover:text-gray-800 px-4 py-4 text-left">
        Clear Filters
      </button>
      <details open className="p-4 first:mt-0 mt-4">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Brand / Bank</summary>
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
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{filters.bank}</span>
            <button type="button" onClick={() => update('bank', '')} className="text-xs text-accent">×</button>
          </div>
        )}
      </details>
      <details open className="p-4 mt-4">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Interest Rate Range</summary>
        <RangeSlider
          min={rateBounds[0]}
          max={rateBounds[1]}
          step={0.01}
          value={filters.rate}
          onChange={(val) => update('rate', val)}
          asPercent
        />
      </details>
      <details open className="p-4 mt-4">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Features</summary>
        <FeatureFilter active={filters.features} setActive={setFeatures} tags={availableFeatures} />
      </details>
    </div>
  );
}

export default DepositFilters;
