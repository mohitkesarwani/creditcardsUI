import React from 'react';
import MortgageCard from './MortgageCard';

function MortgageCardGrid({ mortgages, selectedTags = [] }) {
  if (!mortgages.length) {
    return (
      <p className="text-center py-8" data-testid="no-mortgages">
        No loans match your criteria.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mortgages.map((m) => (
        <MortgageCard key={m.id} mortgage={m} highlightTags={selectedTags} />
      ))}
    </div>
  );
}

export default MortgageCardGrid;
