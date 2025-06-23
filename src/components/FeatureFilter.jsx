import React from 'react';

const FILTERS = [
  'Rewards',
  'Flight points',
  'Low interest',
  'Balance transfer',
  'No annual fee',
];

function FeatureFilter({ active, setActive }) {
  const toggle = (f) => {
    setActive((prev) => {
      if (prev.includes(f)) {
        return prev.filter((p) => p !== f);
      }
      return [...prev, f];
    });
  };

  return (
    <div className="mb-4">
      <h4 className="font-bold mb-2">Filter Features</h4>
      {FILTERS.map((f) => (
        <label key={f} className="flex items-center text-sm space-x-2 py-1">
          <input
            type="checkbox"
            className="rounded text-brand-start focus:ring-brand-start"
            checked={active.includes(f)}
            onChange={() => toggle(f)}
          />
          <span>{f}</span>
        </label>
      ))}
    </div>
  );
}

export default FeatureFilter;
