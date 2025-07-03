import React from 'react';

function FeatureFilter({ active, setActive, tags = [] }) {
  const toggle = (f) => {
    if (active.includes(f)) {
      setActive(active.filter((p) => p !== f));
    } else {
      setActive([...active, f]);
    }
  };

  return (
    <div className="mb-4">
      <h4 className="text-lg font-semibold mb-4">Filter Features</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => toggle(f)}
            className={`filter-option cursor-pointer ${
              active.includes(f)
                ? 'filter-option-active'
                : 'filter-option-inactive'
            }`}
            data-testid={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FeatureFilter;
