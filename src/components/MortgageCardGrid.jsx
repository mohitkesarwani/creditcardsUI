import React from 'react';
import MortgageCard from './MortgageCard';
import AdBanner from './AdBanner.jsx';

function MortgageCardGrid({ mortgages, selectedTags = [], adFrequency = 4 }) {
  if (!mortgages.length) {
    return (
      <p className="text-center py-8" data-testid="no-mortgages">
        No loans match your criteria.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {mortgages.map((m, idx) => (
        <React.Fragment key={m.id}>
          <MortgageCard mortgage={m} highlightTags={selectedTags} />
          {adFrequency > 0 && idx % adFrequency === adFrequency - 1 && (
            <AdBanner />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default MortgageCardGrid;
