import React from 'react';
import { useSelectedCards } from '../hooks/useSelectedCards';
import { getMinimumAnnualFee } from '../utils.js';

function Card({ card }) {
  const { selected, toggleCard } = useSelectedCards();
  const isSelected = selected.some((c) => c.id === card.id);

  const annualFee = getMinimumAnnualFee(card);

  return (
    <div className="border rounded p-4 flex flex-col">
      <img
        src={card.cardArt?.[0]?.imageUri}
        alt={card.brandName || card.brand}
        className="w-full h-32 object-contain mb-2"
      />
      <h3 className="font-bold mb-1">{card.name}</h3>
      <p className="text-sm mb-1">{card.description}</p>
      <p className="text-sm">Interest Free: {card.feesAndPricing?.interestFreePeriod}</p>
      <p className="text-sm">Interest Rate: {card.feesAndPricing?.interestRates?.[0]?.rate}</p>
      <p className="text-sm">Comparison Rate: {card.lendingRates?.[0]?.comparisonRate}</p>
      {annualFee !== Infinity && (
        <p className="text-sm">Annual Fee: {annualFee}</p>
      )}
      <button
        onClick={() => toggleCard(card)}
        className={`mt-auto border rounded px-2 py-1 text-sm ${isSelected ? 'bg-blue-500 text-white' : ''}`}
      >
        {isSelected ? 'Selected' : 'Compare'}
      </button>
      <a
        href={card.applicationUri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 text-sm mt-1"
      >
        Apply Now
      </a>
    </div>
  );
}

export default Card;
