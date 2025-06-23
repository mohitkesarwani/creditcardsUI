import React from 'react';
import { Link } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';
import {
  getMinimumAnnualFee,
  getFeatureTags,
  getTagColor,
} from '../utils.js';

function Card({ card }) {
  const { selected, toggleCard } = useSelectedCards();
  const isSelected = selected.some((c) => c.id === card.id);

  const annualFee = getMinimumAnnualFee(card);
  const interestRate = card.feesAndPricing?.interestRates?.[0]?.rate;
  const comparisonRate = card.lendingRates?.[0]?.comparisonRate;
  const interestFree = card.feesAndPricing?.interestFreePeriod;
  const tags = getFeatureTags(card);
  const featuredBadge = card.productCategory?.toLowerCase().includes('reward')
    ? 'Top Reward'
    : card.productCategory?.toLowerCase().includes('travel')
    ? 'Best for Travel'
    : null;

  return (
    <div className="border rounded p-4 flex flex-col relative">
      <img
        src={card.cardArt?.[0]?.imageUri}
        alt={card.brandName || card.brand}
        className="w-full h-32 object-contain mb-2"
      />
      {featuredBadge && (
        <span className="absolute top-2 left-2 text-xs text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-start to-brand-end animate-bounce">
          {featuredBadge}
        </span>
      )}
      <h3 className="font-bold mb-1">{card.name}</h3>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)}`}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="text-sm mb-1">{card.description}</p>
      <div className="text-sm space-y-1 mb-2">
        {interestRate && (
          <p>
            <span className="font-bold">Interest Rate:</span> {interestRate}
          </p>
        )}
        {comparisonRate && (
          <p>
            <span className="font-bold">Comparison Rate:</span> {comparisonRate}
          </p>
        )}
        {interestFree && (
          <p>
            <span className="font-bold">Interest Free:</span> {interestFree}
          </p>
        )}
        {annualFee !== null && (
          <p>
            <span className="font-bold">Annual Fee:</span> {annualFee}
          </p>
        )}
        {card.productCategory && (
          <p>
            <span className="font-bold">Rewards Type:</span> {card.productCategory}
          </p>
        )}
      </div>
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => toggleCard(card)}
          className={`border rounded px-2 py-1 text-sm flex-1 ${isSelected ? 'bg-blue-500 text-white' : ''}`}
        >
          {isSelected ? 'Selected' : 'Compare'}
        </button>
        <Link
          to={`/cards/${card.id}`}
          className="border rounded px-2 py-1 text-sm text-center flex-1 bg-gray-50"
        >
          Details
        </Link>
      </div>
      <a
        href={card.applicationUri}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 bg-blue-600 text-white text-sm rounded px-2 py-1 text-center"
      >
        Apply Now
      </a>
    </div>
  );
}

export default Card;
