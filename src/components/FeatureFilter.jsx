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
        <label key={f} className="block text-sm">
          <input
            type="checkbox"
            className="mr-1"
            checked={active.includes(f)}
            onChange={() => toggle(f)}
          />
          {f}
        </label>
      ))}
    </div>
  );
}

export default FeatureFilter;
