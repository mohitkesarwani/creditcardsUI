import supabase from '../supabaseClient.js';
import { formatPercent } from '../utils.js';
import { extractDepositTags } from '../lib/depositTags.js';
import { extractDepositDeal } from '../lib/dealHighlights.js';
import { classifyDeposit } from '../lib/specialtyClassifier.js';

// CDR deposit products live in the `deposits` Supabase table (migration 004).
// Three product categories share one table: TERM_DEPOSIT, SAVINGS, TRANSACTION.
// The ingest pre-computes structured columns (rate ranges, term ranges,
// bonus / intro rates, feature flags). UI reads those + JSONB on detail.

const fmtRate = (n) =>
  n === null || n === undefined ? null : formatPercent(n);

// Pick the single number the UI shows in the result row as "the rate".
// Rules of thumb that match what a deal-shopper looks for:
//   - Term deposit: best (max) FIXED rate across all terms × tiers
//   - Savings:      bonus > intro > base — the rate the bank advertises
//   - Transaction:  effectively no rate; surface the base if it exists
const headlineFor = (row) => {
  switch (row.product_category) {
    case 'TERM_DEPOSIT':
      return { rate: row.max_rate, kind: 'fixed' };
    case 'SAVINGS': {
      if (Number.isFinite(row.bonus_rate))
        return { rate: row.bonus_rate, kind: 'bonus' };
      if (Number.isFinite(row.intro_rate))
        return { rate: row.intro_rate, kind: 'intro' };
      return { rate: row.base_rate, kind: 'base' };
    }
    case 'TRANSACTION':
      return { rate: row.base_rate, kind: 'base' };
    default:
      return { rate: null, kind: null };
  }
};

// A short human-friendly term description for term deposits.
//   30..365  → "1–12 mo"
//   30..30   → "30 days"
const formatTermRange = (minDays, maxDays) => {
  if (!Number.isFinite(minDays) || !Number.isFinite(maxDays)) return null;
  if (minDays === maxDays) {
    return minDays < 30 ? `${minDays} days` : `${Math.round(minDays / 30)} mo`;
  }
  const minMonths = Math.round(minDays / 30);
  const maxMonths = Math.round(maxDays / 30);
  return `${minMonths}–${maxMonths} mo`;
};

const normalizeDeposit = (row) => {
  if (!row) return row;
  const headline = headlineFor(row);
  return {
    ...row,
    id: row.id || row._id,
    brand: row.brand || row.brand_name || row.bank_name || 'Unknown',
    brandName: row.brand_name ?? row.bank_name,
    applicationUrl: row.application_uri ?? null,
    productImageUrl: row.card_art?.[0]?.imageUri ?? null,

    // Display-ready
    headlineRate: fmtRate(headline.rate),
    headlineRateNumber: headline.rate,
    headlineRateKind: headline.kind,
    baseRate: fmtRate(row.base_rate),
    bonusRate: fmtRate(row.bonus_rate),
    introRate: fmtRate(row.intro_rate),
    maxRate: fmtRate(row.max_rate),
    minRate: fmtRate(row.min_rate),
    termRange: formatTermRange(row.min_term_days, row.max_term_days),
  };
};

const withTagsAndDeal = (d) => {
  if (!d) return d;
  const tagObjects = extractDepositTags(d);
  const specialty = classifyDeposit(d);
  return {
    ...d,
    tagObjects,
    tags: tagObjects.map((t) => t.label),
    deal: extractDepositDeal(d),
    isSpecialty: specialty.isSpecialty,
    specialtyReason: specialty.specialtyReason,
  };
};

export const fetchDeposits = async (_params = {}) => {
  // Order: sponsored first, then highest headline rate. Postgres can't sort
  // by a COALESCE expression directly through PostgREST, so we sort client-side
  // after fetching — the result set is small (hundreds, not thousands).
  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .order('is_sponsored', { ascending: false });
  if (error) {
    console.warn('[deposits] returning empty list:', error.message);
    return [];
  }
  const enriched = (data || []).map(normalizeDeposit).map(withTagsAndDeal);
  return enriched.sort((a, b) => {
    if (a.is_sponsored !== b.is_sponsored) return a.is_sponsored ? -1 : 1;
    const an = a.headlineRateNumber ?? -1;
    const bn = b.headlineRateNumber ?? -1;
    return bn - an;
  });
};

export const fetchDeposit = async (id) => {
  const looksLikeUuid = /^[0-9a-f-]{36}$/i.test(id);
  const primary = await supabase
    .from('deposits')
    .select('*')
    .eq(looksLikeUuid ? 'id' : 'product_id', id)
    .maybeSingle();
  if (primary.error) {
    console.warn('[deposits] fetch by id failed:', primary.error.message);
    return null;
  }
  if (primary.data) return withTagsAndDeal(normalizeDeposit(primary.data));

  const fallback = await supabase
    .from('deposits')
    .select('*')
    .eq(looksLikeUuid ? 'product_id' : 'id', id)
    .maybeSingle();
  if (fallback.error) return null;
  return withTagsAndDeal(normalizeDeposit(fallback.data));
};
