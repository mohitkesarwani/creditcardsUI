// Flattens the raw CDR-shaped card row into the fields the UI expects.
// Runs client-side. Keeps both snake_case (Supabase) and camelCase (legacy)
// access patterns working at once.

import {
  getMinimumAnnualFee,
  formatPercent,
  formatMoney,
  getPurchaseInterestRate,
  getComparisonRate,
  getInterestFreeDays,
} from '../utils.js';
import { extractCardTags } from '../lib/cardTags.js';
import { extractCardDeal } from '../lib/dealHighlights.js';

const parseRateValue = (raw) => {
  if (raw === null || raw === undefined || raw === '') return null;
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : null;
};

export function normalizeCard(card) {
  if (!card) return card;

  // Surface camelCase aliases for the snake_case JSONB columns so the helpers
  // and components don't need to know about Supabase.
  const camel = {
    ...card,
    cardArt: card.card_art ?? card.cardArt,
    feesAndPricing: card.fees_and_pricing ?? card.feesAndPricing,
    lendingRates: card.lending_rates ?? card.lendingRates,
    applicationUri: card.application_uri ?? card.applicationUri,
    brandName: card.brand_name ?? card.brandName ?? card.bank_name,
    isSponsored: card.is_sponsored ?? card.isSponsored ?? false,
    sponsorRank: card.sponsor_rank ?? card.sponsorRank ?? 0,
    additionalInformation:
      card.additional_information ??
      card.additionalInformation ??
      card.raw?.additionalInformation,
  };

  // Prefer the structured columns populated by the ingest (schema 002). Fall
  // back to JSONB extraction so legacy rows / partial migrations still render.
  const purchaseRateRaw =
    card.purchase_rate ?? parseRateValue(getPurchaseInterestRate(camel));
  const comparisonRateRaw =
    card.comparison_rate ?? parseRateValue(getComparisonRate(camel));
  const annualFeeNumber =
    card.annual_fee_amount ?? getMinimumAnnualFee(camel);
  const interestFreeDays = card.interest_free_days;
  const interestFreeText =
    interestFreeDays !== null && interestFreeDays !== undefined
      ? `${interestFreeDays} days`
      : getInterestFreeDays(camel);

  const eligibility = camel.eligibility?.length
    ? `${camel.eligibility[0].value}${camel.eligibility[0].unit || ''}`
    : null;

  const productImageUrl = camel.cardArt?.[0]?.imageUri ?? null;
  const applicationUrl = camel.applicationUri ?? null;
  const hasRequired = !!(productImageUrl && applicationUrl);

  const out = {
    ...camel,
    id: card.id || card._id,
    brand: card.brand || camel.brandName || 'Unknown',
    // Display-ready fields (used by the new card UI directly).
    interestRate: purchaseRateRaw !== null ? formatPercent(purchaseRateRaw) : null,
    interestRateNumber: purchaseRateRaw,
    interestFree: interestFreeText,
    comparisonRate: comparisonRateRaw !== null ? formatPercent(comparisonRateRaw) : null,
    comparisonRateNumber: comparisonRateRaw,
    annualFee: annualFeeNumber !== null ? formatMoney(annualFeeNumber) : null,
    annualFeeNumber,
    eligibilityCriteria: eligibility,
    applicationUrl,
    productImageUrl,
    status: hasRequired ? 'complete' : 'incomplete',
  };
  // Structured tags: spending categories, card type, perks. Replaces the old
  // flat string list. Components that want the legacy shape can map t => t.label.
  out.tagObjects = extractCardTags(out);
  out.tags = out.tagObjects.map((t) => t.label);
  out.deal = extractCardDeal(out);
  return out;
}

// Maps an `engagements` row (or the engagement_summary view row) to the
// shape components consumed from the old REST endpoint.
export function normalizeEngagement(row) {
  if (!row) return { likes: 0, shares: 0, comments: 0, rating: 0, reviews: [] };
  const comments = row.comments ?? row.comments_count ?? 0;
  const rating =
    row.average_rating ??
    (row.rating_count
      ? Number((row.rating_sum / row.rating_count).toFixed(2))
      : 0);
  return {
    likes: row.likes ?? 0,
    shares: row.shares ?? 0,
    comments,
    rating,
    averageRating: rating,
    reviews: row.reviews ?? [],
  };
}
