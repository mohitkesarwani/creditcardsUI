import React from 'react';
import { Link } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';
import {
  getMinimumAnnualFee,
  getFeatureTags,
  getTagColor,
  formatCategory,
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

  const TAG_ICONS = {
    Rewards: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.378 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.538 1.118L10 13.347l-3.378 2.455c-.783.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.628 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z" />
      </svg>
    ),
    Travel: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.18 9" />
        <path
          fillRule="evenodd"
          d="M10.894 2.553a1 1 0 00-1.788 0l-7 14A1 1 0 003 18h14a1 1 0 00.894-1.447l-7-14z"
          clipRule="evenodd"
        />
      </svg>
    ),
    'Balance Transfer': (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l5-5m0 0l-5-5m5 5H3" />
      </svg>
    ),
  };

  return (
    <div className="bg-white rounded-lg shadow transition transform hover:-translate-y-1 hover:shadow-lg p-4 flex flex-col relative fade-in">
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
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)} hover:animate-pulse`}
          >
            {TAG_ICONS[t]} {t}
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
            <span className="font-bold">Rewards Type:</span> {formatCategory(card.productCategory)}
          </p>
        )}
      </div>
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => toggleCard(card)}
          className={`rounded px-2 py-1 text-sm flex-1 ${isSelected ? 'bg-gradient-to-r from-brand-start to-brand-end text-white' : 'border'} `}
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
        className="mt-2 bg-gradient-to-r from-brand-start to-brand-end text-white text-sm rounded px-2 py-1 text-center flex items-center justify-center gap-1"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-8 8a1 1 0 01-.707.293H5a1 1 0 01-1-1v-4a1 1 0 01.293-.707l8-8z" />
          <path d="M11 3l6 6" stroke="#fff" strokeWidth="2" />
        </svg>
        Apply Now
      </a>
    </div>
  );
}

export default Card;
