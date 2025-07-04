import React from 'react';
import Tag from './Tag.tsx';

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
          <Tag
            key={f}
            label={f}
            selected={active.includes(f)}
            onClick={() => toggle(f)}
            isClickable
            data-testid={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
          />
        ))}
      </div>
    </div>
  );
}

export default FeatureFilter;
