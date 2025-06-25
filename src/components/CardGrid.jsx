import React from 'react';
import Card from './Card';
import AdBanner from './AdBanner.jsx';

function CardGrid({ cards, selectedTags = [], adFrequency = 4, onReset }) {
  if (!cards.length) {
    return (
      <div className="text-center py-8 space-y-4">
        <p>We couldn’t find any credit cards matching your filters.</p>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-outline text-sm"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, idx) => (
        <React.Fragment key={card.id}>
          <Card card={card} selectedTags={selectedTags} />
          {adFrequency > 0 && idx % adFrequency === adFrequency - 1 && (
            <AdBanner />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default CardGrid;
