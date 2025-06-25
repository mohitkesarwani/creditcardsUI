import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardDetailsModal from './CardDetailsModal';
import { useSelectedCards } from '../hooks/useSelectedCards';
import apiClient from '../api/apiClient.js';
import {
  getMinimumAnnualFee,
  getFeatureTags,
  getTagColor,
  getSellingPoints,
  formatCategory,
  formatValue,
  findFeeAmount,
} from '../utils.js';

function Card({ card, selectedTags = [] }) {
  const { selected, toggleCard } = useSelectedCards();
  const isSelected = selected.some((c) => c.id === card.id);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();


  const annualFee = card.annualFee ?? findFeeAmount(card, 'annual') ?? getMinimumAnnualFee(card);
  const interestRate = card.interestRate ?? card.feesAndPricing?.interestRates?.[0]?.rate;
  const comparisonRate = card.comparisonRate ?? card.lendingRates?.[0]?.comparisonRate;
  const interestFree = card.interestFree ?? card.feesAndPricing?.interestFreePeriod;
  const latePaymentFee = findFeeAmount(card, 'late');
  const tags = card.tags || getFeatureTags(card);
  const sellingPoints = getSellingPoints(card, 4);
  const category = card.productCategory || '';
  const featuredBadge = category.toLowerCase().includes('reward')
    ? 'Top Reward'
    : category.toLowerCase().includes('travel')
    ? 'Best for Travel'
    : null;
  const sponsored = card.isSponsored;

  const handleApply = async () => {
    try {
      await apiClient.post('/api/referrals', {
        cardId: card.id,
        partnerId: card.partnerId,
        redirectUrl: card.applicationUrl || card.applicationUri,
      });
      if (window.gtag) {
        window.gtag('event', 'affiliate_click', {
          card_id: card.id,
          partner_id: card.partnerId,
        });
      }
    } catch (err) {
      console.error('Referral log failed', err);
    }
  };

  const FEATURE_ICONS = {
    'Balance Transfer Offer': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l5-5m0 0l-5-5m5 5H3" />
      </svg>
    ),
    'Travel Insurance': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.18 9" />
        <path fillRule="evenodd" d="M10.894 2.553a1 1 0 00-1.788 0l-7 14A1 1 0 003 18h14a1 1 0 00.894-1.447l-7-14z" clipRule="evenodd" />
      </svg>
    ),
    'No Annual Fee': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <line x1="4" y1="4" x2="20" y2="20" />
      </svg>
    ),
    'Low Interest Rate': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    ),
    '55 Days Interest Free': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    'No Foreign Transaction Fees': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v22m11-11H1" />
      </svg>
    ),
    Cashback: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 108 8 8 8 0 00-8-8zm1 11H9v-1h2zm0-3H9V5h2z" />
      </svg>
    ),
    Rewards: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.378 2.455a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.538 1.118L10 13.347l-3.378 2.455c-.783.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.628 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z" />
      </svg>
    ),
    'Bonus Points': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2l3 7h7l-5.5 4.5L18 21l-6-3.5L6 21l1.5-7.5L2 9h7l3-7z" />
      </svg>
    ),
    'Lounge Access': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 12h16v6H2z" /><path d="M7 6h6v6H7z" />
      </svg>
    ),
    'Credit Card': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  };

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
    <div
      className="card-tile relative transition transform hover:-translate-y-1 hover:shadow-lg hover:scale-105 flex flex-col fade-in"
    >
      <img
        src={
          card.productImageUrl ||
          card.cardArt?.[0]?.imageUri ||
          '/assets/image-not-available.svg'
        }
        alt={card.brandName || card.brand}
        className="w-full h-32 object-contain mb-2 cursor-pointer"
        onError={(e) => {
          if (e.currentTarget.src !== '/assets/image-not-available.svg') {
            e.currentTarget.src = '/assets/image-not-available.svg';
          }
        }}
        onClick={() => setShowDetails(true)}
      />
      {sponsored && (
        <span className="absolute top-2 right-2 text-xs text-white bg-yellow-600 px-2 py-0.5 rounded">Sponsored</span>
      )}
      {featuredBadge && (
        <span className="absolute top-2 left-2 text-xs text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-accent to-accent/80 animate-bounce">
          {featuredBadge}
        </span>
      )}
      <h3 className="card-title mb-1">{card.name}</h3>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((t) => {
          const match = selectedTags.includes(t);
          return (
            <span
              key={t}
              data-testid={`tag-${t.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)} hover:animate-pulse ${match ? 'ring-2 ring-accent' : ''}`}
            >
              {TAG_ICONS[t]} {t}
            </span>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        {sellingPoints.map((p) => (
          <span
            key={p}
            className="flex items-center gap-1 border rounded px-2 py-1 bg-gray-50"
          >
            {FEATURE_ICONS[p]} {p}
          </span>
        ))}
      </div>
      <div className="grid gap-1 mb-2 text-sm">
        <p className="card-subtext">
          <span className="font-bold">Interest Rate:</span>{' '}
          {interestRate ? formatValue('interest rate', interestRate) : '0%'}
        </p>
        {comparisonRate && (
          <p className="card-subtext">
            <span className="font-bold">Comparison Rate:</span>{' '}
            {formatValue('comparison rate', comparisonRate)}
          </p>
        )}
        {interestFree && (
          <p className="card-subtext">
            <span className="font-bold">Interest Free:</span> {interestFree}
          </p>
        )}
        <p className="card-subtext">
          <span className="font-bold">Annual Fee:</span>{' '}
          {annualFee !== null ? formatValue('annual fee', annualFee) : '$0'}
        </p>
        <p className="card-subtext">
          <span className="font-bold">Rewards Type:</span>{' '}
          {card.productCategory ? formatCategory(card.productCategory) : 'None'}
        </p>
        {latePaymentFee && (
          <p className="card-subtext">
            <span className="font-bold">Late Payment Fee:</span>{' '}
            {formatValue('late fee', latePaymentFee)}
          </p>
        )}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {isSelected ? (
          <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Selected
          </span>
        ) : (
          <button
            onClick={() => toggleCard(card)}
            className="text-sm border border-accent text-accent rounded-md px-3 py-1 hover:bg-accent/10 transition flex-1"
          >
            Compare
          </button>
        )}
        <button
          onClick={() => navigate(`/credit-cards/${card.id}`)}
          className="text-sm border border-accent text-accent rounded-md px-3 py-1 hover:bg-accent/10 transition flex-1"
        >
          Details
        </button>
      </div>
      <a
        href={card.applicationUrl || card.applicationUri}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleApply}
        className="mt-2 bg-accent hover:bg-accent/90 text-white rounded-md px-4 py-2 text-sm font-semibold transition transform hover:scale-105 w-full flex items-center justify-center gap-1"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-8 8a1 1 0 01-.707.293H5a1 1 0 01-1-1v-4a1 1 0 01.293-.707l8-8z" />
          <path d="M11 3l6 6" stroke="#fff" strokeWidth="2" />
        </svg>
        Apply Now
      </a>
      <CardDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        card={card}
      />
    </div>
  );
}

export default Card;
