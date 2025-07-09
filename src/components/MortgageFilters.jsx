import React, { useEffect, useState } from 'react';
import RangeSlider from './RangeSlider';
import FeatureFilter from './FeatureFilter';
import { fetchMortgageRateRange } from '../api/residentialMortgages';

function MortgageFilters({ filters, setFilters, availableFeatures = [], banks = [] }) {
  const [rateBounds, setRateBounds] = useState(null);
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const setFeatures = (features) => update('features', features);

  useEffect(() => {
    const load = async () => {
      try {
        const { minRate, maxRate } = await fetchMortgageRateRange();
        if (typeof minRate === 'number' && typeof maxRate === 'number') {
          const range = [minRate * 100, maxRate * 100];
          setRateBounds(range);
          setFilters(prev => {
            if (prev.rate && prev.rate[0] === 0 && prev.rate[1] === 0) {
              return { ...prev, rate: range };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to load mortgage rate range', err);
      }
    };
    load();
  }, []);

  const clear = () => {
    localStorage.removeItem('mortgageFilters');
    setFilters({ rate: rateBounds || [0, 0], fees: [], features: [], bank: '' });
  };

  return (
    <div
      className="bg-white rounded-2xl divide-y divide-gray-100 overflow-y-auto max-h-screen p-4"
      data-testid="mortgage-filters"
    >
      <button
        type="button"
        onClick={clear}
        className="w-full text-sm underline text-gray-500 hover:text-gray-800 px-4 py-4 text-left"
        data-testid="clear-all-filters"
        aria-label="Reset all filters"
      >
        Clear Filters
      </button>
      <details open className="p-4 first:mt-0 mt-4" aria-label="Filter by bank or brand">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Bank / Brand</summary>
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
      <details open className="p-4 mt-4" aria-label="Filter by interest rate">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">
          {rateBounds
            ? `Interest Rate Range (${rateBounds[0].toFixed(2)}% – ${rateBounds[1].toFixed(2)}%)`
            : 'Interest Rate Range'}
        </summary>
        {rateBounds ? (
          <RangeSlider
            min={rateBounds[0]}
            max={rateBounds[1]}
            step={0.01}
            value={filters.rate}
            onChange={(val) => update('rate', val)}
          />
        ) : (
          <p>Loading range…</p>
        )}
      </details>
      <details open className="p-4 mt-4" aria-label="Filter by features">
        <summary className="text-lg font-semibold border-b border-gray-200 mb-2 pb-1 cursor-pointer">Filter Features</summary>
        <FeatureFilter
          active={filters.features}
          setActive={setFeatures}
          tags={availableFeatures}
        />
      </details>
    </div>
  );
}

export default MortgageFilters;
