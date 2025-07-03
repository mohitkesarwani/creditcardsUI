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
      <h4 className="text-lg font-semibold mb-4">Filter Features</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => toggle(f)}
            className={`inline-flex bg-gray-100 text-sm rounded-full px-3 py-1 mb-2 cursor-pointer hover:bg-blue-100 ${active.includes(f) ? 'bg-blue-600 text-white' : ''}`}
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
          className="text-sm underline text-gray-500 hover:text-gray-800 mt-2"
          data-testid="clear-filters"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default FeatureFilter;
