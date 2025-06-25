import React from 'react';

function FeatureFilter({ active, setActive, tags = [] }) {
  const toggle = (f) => {
    if (active.includes(f)) {
      setActive(active.filter((p) => p !== f));
    } else {
      setActive([...active, f]);
    }
  };

  const clear = () => setActive([]);

  return (
    <div className="mb-4">
      <h4 className="font-bold mb-2">Filter Features</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => toggle(f)}
            className={`text-sm px-3 py-1 rounded-full border transition ${active.includes(f) ? 'bg-accent text-white border-accent' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            data-testid={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {f}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <button
          type="button"
          onClick={clear}
          className="text-xs text-accent mt-2 underline"
          data-testid="clear-filters"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default FeatureFilter;
