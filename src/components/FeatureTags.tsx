import React from 'react';
import FeatureTag from './FeatureTag.tsx';

interface FeatureTagsProps {
  tags?: string[];
  highlightTags?: string[];
  className?: string;
}

export default function FeatureTags({ tags = [], highlightTags = [], className = '' }: FeatureTagsProps) {
  if (!tags.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {tags.map((t) => {
        const match = highlightTags.includes(t);
        return (
          <FeatureTag
            key={t}
            label={t}
            selected={match}
            className="text-xs px-2"
            data-testid={`tag-${String(t).toLowerCase().replace(/\s+/g, '-')}`}
          />
        );
      })}
    </div>
  );
}
