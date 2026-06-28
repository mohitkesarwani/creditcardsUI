import supabase from '../supabaseClient.js';
import { formatPercent } from '../utils.js';
import { extractHomeLoanTags } from '../lib/homeLoanTags.js';
import { extractLoanDeal } from '../lib/dealHighlights.js';

// CDR home loans live in the `home_loans` Supabase table (migration 003).
// The ingest pre-computes structured columns: min_variable_rate_owner,
// min_fixed_rate_owner, min_comparison_rate, max_lvr_percent, fee fields,
// boolean feature flags. We expose those plus display-ready strings.

const fmtRate = (n) =>
  n === null || n === undefined ? null : formatPercent(n);

const normalizeLoan = (row) => {
  if (!row) return row;
  // Choose a headline rate: lowest variable owner-occupied first, then fixed.
  const headlineRateNumber =
    row.min_variable_rate_owner ?? row.min_fixed_rate_owner ?? null;
  const headlineRateKind = row.min_variable_rate_owner
    ? 'variable'
    : row.min_fixed_rate_owner
    ? 'fixed'
    : null;

  return {
    ...row,
    // Aliases / camelCase
    id: row.id || row._id,
    brand: row.brand || row.brand_name || row.bank_name || 'Unknown',
    brandName: row.brand_name ?? row.bank_name,
    applicationUrl: row.application_uri ?? null,
    productImageUrl: row.card_art?.[0]?.imageUri ?? null,

    // Display-ready
    headlineRate: fmtRate(headlineRateNumber),
    headlineRateNumber,
    headlineRateKind,
    variableRateOwner: fmtRate(row.min_variable_rate_owner),
    variableRateInvest: fmtRate(row.min_variable_rate_invest),
    fixedRateOwner: fmtRate(row.min_fixed_rate_owner),
    fixedRateInvest: fmtRate(row.min_fixed_rate_invest),
    comparisonRate: fmtRate(row.min_comparison_rate),
    maxLvr: row.max_lvr_percent !== null && row.max_lvr_percent !== undefined
      ? `${row.max_lvr_percent}%`
      : null,
  };
};

// After we've built the base normalized object we enrich it with tagObjects
// (best-for / type / perks) and a single headline `deal` (refinance cashback,
// etc.) — same pattern as creditCards.
const withTagsAndDeal = (loan) => {
  if (!loan) return loan;
  const tagObjects = extractHomeLoanTags(loan);
  return {
    ...loan,
    tagObjects,
    tags: tagObjects.map((t) => t.label),
    deal: extractLoanDeal(loan),
  };
};

export const fetchMortgages = async (_params = {}) => {
  const { data, error } = await supabase
    .from('home_loans')
    .select('*')
    .order('is_sponsored', { ascending: false })
    .order('min_variable_rate_owner', { ascending: true, nullsFirst: false });
  if (error) {
    console.warn('[home_loans] returning empty list:', error.message);
    return [];
  }
  return (data || []).map(normalizeLoan).map(withTagsAndDeal);
};

export const fetchMortgage = async (id) => {
  const looksLikeUuid = /^[0-9a-f-]{36}$/i.test(id);
  const primary = await supabase
    .from('home_loans')
    .select('*')
    .eq(looksLikeUuid ? 'id' : 'product_id', id)
    .maybeSingle();
  if (primary.error) {
    console.warn('[home_loans] fetch by id failed:', primary.error.message);
    return null;
  }
  if (primary.data) return withTagsAndDeal(normalizeLoan(primary.data));

  const fallback = await supabase
    .from('home_loans')
    .select('*')
    .eq(looksLikeUuid ? 'product_id' : 'id', id)
    .maybeSingle();
  if (fallback.error) return null;
  return withTagsAndDeal(normalizeLoan(fallback.data));
};
