import React from 'react';

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
          <span
            key={t}
            data-testid={`tag-${t.toLowerCase().replace(/\s+/g, '-')}`}
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${match ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}
