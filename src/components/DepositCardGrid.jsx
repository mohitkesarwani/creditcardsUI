import React from 'react';
import DepositCard from './DepositCard';
import AdBanner from './AdBanner.jsx';

function DepositCardGrid({ deposits, selectedTags = [], adFrequency = 4 }) {
  if (!deposits.length) {
    return (
      <p className="text-center py-8" data-testid="no-deposits">
        No deposits match your criteria.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {deposits.map((d, idx) => (
        <React.Fragment key={d.id}>
          <DepositCard deposit={d} highlightTags={selectedTags} />
          {adFrequency > 0 && idx % adFrequency === adFrequency - 1 && <AdBanner />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default DepositCardGrid;
