import React from 'react';
import FeatureTag from './FeatureTag.tsx';

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
      <div className="flex flex-wrap gap-1.5">
        {tags.map((f) => (
          <FeatureTag
            key={f}
            label={f}
            selected={active.includes(f)}
            onClick={() => toggle(f)}
            isClickable
            className="filter-feature text-xs px-2"
            data-testid={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
          />
        ))}
      </div>
    </div>
  );
}

export default FeatureFilter;
