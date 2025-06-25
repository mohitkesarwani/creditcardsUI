import React from 'react';
import Card from './Card';
import AdBanner from './AdBanner.jsx';

function CardGrid({ cards, selectedTags = [], adFrequency = 4 }) {
  if (!cards.length) {
    return (
      <p className="text-center py-8">
        No cards match your selected filters. Try adjusting your filters.
      </p>
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
