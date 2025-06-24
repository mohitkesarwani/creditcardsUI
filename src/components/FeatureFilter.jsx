import React from 'react';

function FeatureFilter({ active, setActive, tags = [] }) {
  const toggle = (f) => {
    setActive((prev) => {
      if (prev.includes(f)) {
        return prev.filter((p) => p !== f);
      }
      return [...prev, f];
    });
  };

  const clear = () => setActive([]);

  return (
    <div className="mb-4">
      <h4 className="font-bold mb-2">Filter Features</h4>
      {tags.map((f) => (
        <label key={f} className="flex items-center text-sm space-x-2 py-1">
          <input
            type="checkbox"
            className="rounded text-brand-start focus:ring-brand-start"
            checked={active.includes(f)}
            onChange={() => toggle(f)}
            data-testid={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
          />
          <span>{f}</span>
        </label>
      ))}
      {tags.length > 0 && (
        <button
          type="button"
          onClick={clear}
          className="text-xs text-brand-start mt-2 underline"
          data-testid="clear-filters"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default FeatureFilter;
