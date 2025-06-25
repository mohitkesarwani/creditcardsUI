import React from 'react';

function LoaderSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 py-6 animate-pulse" data-testid="loader">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded" />
      ))}
    </div>
  );
}

export default LoaderSkeleton;
