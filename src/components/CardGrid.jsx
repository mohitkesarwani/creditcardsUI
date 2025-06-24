import React from 'react';
import Card from './Card';

function CardGrid({ cards, selectedTags = [] }) {
  if (!cards.length) {
    return (
      <p className="text-center py-8">
        No cards match your selected filters. Try adjusting your filters.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.id} card={card} selectedTags={selectedTags} />
      ))}
    </div>
  );
}

export default CardGrid;
