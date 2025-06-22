import React from 'react';
import Card from './Card';

function CardGrid({ cards }) {
  if (!cards.length) {
    return <p>No cards found.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
}

export default CardGrid;
