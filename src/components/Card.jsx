import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';
import useEngagement from '../hooks/useEngagement.ts';
import supabase from '../supabaseClient.js';
import CardKpis from './CardKpis.jsx';
import { formatMoneyWhole } from '../utils.js';
import { topTagsForCard, TAG_STYLES } from '../lib/cardTags.js';
import DealBadge from './DealBadge.jsx';

const FALLBACK_IMG = '/assets/image-not-available.svg';

// normalizeCard has already produced formatted strings (or null) for these
// fields, so the Card just renders them. Annual fee is special-cased so $0
// shows as "$0" rather than "$0.00".
const displayFee = (card) => {
  const n = card.annualFeeNumber;
  if (n === 0) return '$0';
  if (n !== null && n !== undefined) return formatMoneyWhole(n);
  if (card.annualFee) return card.annualFee;
  return '—';
};

const displayOrDash = (v) => (v === null || v === undefined || v === '' ? '—' : v);

function Star({ filled }) {
  return (
    <svg
      className={`w-3.5 h-3.5 ${filled ? 'text-amber-400' : 'text-gray-300'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.97a1 1 0 00.95.69h4.18c.97 0 1.37 1.24.59 1.81l-3.38 2.46a1 1 0 00-.36 1.12l1.29 3.97c.3.92-.76 1.69-1.54 1.12L10 13.35l-3.38 2.46c-.78.57-1.84-.2-1.54-1.12l1.29-3.97a1 1 0 00-.36-1.12L2.63 9.4c-.78-.57-.38-1.81.59-1.81h4.17a1 1 0 00.95-.69L9.05 2.93z" />
    </svg>
  );
}

function Card({ card, selectedTags = [] }) {
  const { selected, toggleCard } = useSelectedCards();
  const isSelected = selected.some((c) => c.id === card.id);
  const reachedLimit = !isSelected && selected.length >= 4;
  const navigate = useNavigate();
  const { data: engagement } = useEngagement(card.id);

  // All formatting happens in normalizeCard now — Card just displays.
  const tagObjects = card.tagObjects || [];
  // Pin tags matching the user's active filter so they're always visible
  // (otherwise low-priority perks like Purchase Protection get crowded out
  // and the AND filter looks like it isn't working).
  const topTags = topTagsForCard(tagObjects, 4, selectedTags);
  const rating = engagement?.averageRating ?? engagement?.rating ?? 0;
  const issuer = card.brandName || card.brand || 'Unknown issuer';

  const handleApply = async (e) => {
    try {
      await supabase.from('referrals').insert({
        card_id: card.id,
        partner_id: card.partnerId,
        redirect_url: card.applicationUrl || card.applicationUri,
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
    // let the <a> proceed
  };

  const kpis = [
    { label: 'Annual fee',      value: displayFee(card),                  tooltip: 'Yearly card-membership cost' },
    { label: 'Purchase rate',   value: displayOrDash(card.interestRate),  tooltip: 'Interest charged on purchases' },
    { label: 'Comparison rate', value: displayOrDash(card.comparisonRate),tooltip: 'Rate including standard fees' },
    { label: 'Interest-free',   value: displayOrDash(card.interestFree),  tooltip: 'Days you can carry a balance before interest applies' },
  ];

  return (
    <article
      className="result-card p-4 md:p-5"
      data-selected={isSelected}
      id={card.id}
    >
      {/* Top row: image | name & tags | apply */}
      <div className="grid grid-cols-[88px_1fr] md:grid-cols-[112px_1fr_auto] gap-4 items-start">
        <button
          type="button"
          onClick={() => navigate(`/credit-cards/${card.id}`)}
          className="bg-gray-50 rounded-lg p-2 flex items-center justify-center h-20 md:h-24 hover:bg-gray-100 transition-colors"
        >
          <img
            src={card.productImageUrl || card.cardArt?.[0]?.imageUri || FALLBACK_IMG}
            alt={card.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              if (e.currentTarget.src.indexOf(FALLBACK_IMG) === -1) {
                e.currentTarget.src = FALLBACK_IMG;
              }
            }}
          />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs text-gray-500 uppercase tracking-wide truncate">{issuer}</span>
            {card.isSponsored && (
              <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                Sponsored
              </span>
            )}
            {card.deal && <DealBadge deal={card.deal} />}
          </div>
          <h3
            className="text-base md:text-lg font-semibold text-gray-900 leading-snug truncate cursor-pointer hover:text-blue-700"
            onClick={() => navigate(`/credit-cards/${card.id}`)}
            title={card.name}
          >
            {card.name}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= Math.round(rating)} />
              ))}
              <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
            </div>
          )}
          {topTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {topTags.map((t) => {
                const highlight = selectedTags?.includes(t.label);
                return (
                  <span
                    key={t.id}
                    className={
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ' +
                      (highlight
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : TAG_STYLES[t.category])
                    }
                    title={`${t.label} · ${t.category}`}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Apply CTA — desktop only here; bottom bar covers mobile */}
        <div className="hidden md:flex flex-col items-end gap-2">
          <a
            href={card.applicationUrl || card.applicationUri || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApply}
            className="btn btn-primary text-sm whitespace-nowrap"
          >
            Apply now
          </a>
          <button
            type="button"
            onClick={() => navigate(`/credit-cards/${card.id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            View details →
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <CardKpis cells={kpis} className="mt-4" />

      {/* Bottom row: compare toggle + (mobile) actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <label
          className={`flex items-center gap-2 text-sm select-none ${reachedLimit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            disabled={reachedLimit}
            onChange={() => toggleCard(card)}
            className="accent-blue-600 w-4 h-4"
          />
          <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>
            {isSelected ? 'Added to compare' : reachedLimit ? 'Compare full (4)' : 'Compare'}
          </span>
        </label>
        <div className="md:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/credit-cards/${card.id}`)}
            className="text-sm text-blue-600"
          >
            Details
          </button>
          <a
            href={card.applicationUrl || card.applicationUri || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApply}
            className="btn btn-primary text-sm"
          >
            Apply
          </a>
        </div>
      </div>
    </article>
  );
}

export default Card;
