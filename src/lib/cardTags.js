// Credit-card tag extractor.
//
// Replaces the old getCardTags/getSellingPoints/getFeatureTags trio which:
//   (a) scanned the marketing `description` with loose regex (cashback false
//       positives from "no cashback fee", balance-transfer hits from any
//       BALANCE_TRANSFERS feature, etc.), and
//   (b) gave no "what's this card good for" signal — no groceries / travel /
//       streaming category.
//
// This module is data-driven first. It reads structured columns
// (annual_fee_amount, purchase_rate, interest_free_days), then enriches from
// CDR feature arrays. Only when a category is genuinely only mentioned in
// free text do we fall back to regex — and we're explicit about which signal
// fired so we can audit.
//
// Output shape: an array of Tag objects
//   { id, label, category, priority, source }
//   category ∈ 'spending' | 'type' | 'perk'
//   priority — lower is more important (used to pick the top-N on cards)

// ── Helpers ────────────────────────────────────────────────────────────────
const lower = (s) => (s || '').toString().toLowerCase();
const has = (s, re) => re.test(lower(s));

const featureTexts = (card) =>
  (card?.features || []).map((f) => {
    return [f.featureType, f.additionalValue, f.additionalInfo]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  });

const allText = (card) =>
  [
    card?.name,
    card?.description,
    ...featureTexts(card),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

// ── Spending-category rules (where this card is best for) ─────────────────
// Each rule says: if any of these patterns match the card's combined text,
// the spending tag applies. Patterns are tight — brand names + canonical words.
const SPENDING_CATEGORIES = [
  {
    id: 'travel',
    label: 'Travel',
    category: 'spending',
    priority: 1,
    match: (card, text) =>
      /\b(qantas|velocity|virgin australia|frequent flyer|airline|airpoints)\b/.test(text) ||
      hasFeatureLike(card, 'LOYALTY_PROGRAM', /qantas|velocity|airline/) ||
      hasFeatureLike(card, 'COMPLEMENTARY_PRODUCT_DISCOUNTS', /qantas|lounge|airline/),
  },
  {
    id: 'groceries',
    label: 'Groceries',
    category: 'spending',
    priority: 1,
    match: (card, text) =>
      /\b(woolworths|coles|flybuys|iga|supermarket|grocery|everyday rewards)\b/.test(text) ||
      hasFeatureLike(card, 'LOYALTY_PROGRAM', /flybuys|everyday rewards|woolworths|coles/),
  },
  {
    id: 'shopping',
    label: 'Shopping',
    category: 'spending',
    priority: 2,
    match: (card, text) =>
      /\b(myer|david jones|amazon|big w|kmart|target|department store|retail)\b/.test(text),
  },
  {
    id: 'fuel',
    label: 'Fuel',
    category: 'spending',
    priority: 2,
    match: (card, text) =>
      /\b(fuel|petrol|bp|caltex|shell|ampol|7[- ]eleven)\b/.test(text),
  },
  {
    id: 'dining',
    label: 'Dining',
    category: 'spending',
    priority: 3,
    match: (card, text) =>
      /\b(dining|restaurant|cafe|food delivery|uber eats|menulog|deliveroo)\b/.test(text),
  },
  {
    id: 'entertainment',
    label: 'Movies & events',
    category: 'spending',
    priority: 3,
    match: (card, text) =>
      /\b(movies?|cinema|hoyts|event cinemas|ticketek|concerts?)\b/.test(text),
  },
  {
    id: 'streaming',
    label: 'Streaming',
    category: 'spending',
    priority: 3,
    match: (card, text) =>
      /\b(netflix|spotify|disney\+|stan|kayo|amazon prime|streaming)\b/.test(text),
  },
];

// Feature-array helper
function hasFeatureLike(card, featureType, valueRe) {
  return (card?.features || []).some((f) => {
    if (f?.featureType !== featureType) return false;
    return valueRe.test(lower(f.additionalValue || f.additionalInfo || ''));
  });
}

// ── Card-type rules (positioning) ─────────────────────────────────────────
// These are mostly data-driven — they look at structured columns first.
function cardTypeTags(card) {
  const out = [];
  const fee = card?.annualFeeNumber ?? card?.annual_fee_amount;
  const rate = card?.interestRateNumber ?? card?.purchase_rate;
  const text = allText(card);

  if (fee === 0) {
    out.push({ id: 'no-annual-fee', label: 'No annual fee', category: 'type', priority: 1, source: 'annual_fee_amount=0' });
  }

  if (Number.isFinite(rate) && rate < 0.135) {
    out.push({ id: 'low-rate', label: 'Low rate', category: 'type', priority: 1, source: 'purchase_rate<13.5%' });
  }

  if (Number.isFinite(fee) && fee >= 200 && hasFeatureLike(card, 'INSURANCE', /travel|rental|inconvenience/)) {
    out.push({ id: 'premium', label: 'Premium', category: 'type', priority: 2, source: 'high fee + travel insurance' });
  }

  // Business via productCategory or name
  if (
    /CHRG/.test(card?.productCategory || '') === false &&
    (/business|corporate/i.test(card?.name || '') ||
      hasFeatureLike(card, 'LOYALTY_PROGRAM', /business/))
  ) {
    out.push({ id: 'business', label: 'Business', category: 'type', priority: 2, source: 'name/category' });
  }

  // Rewards — only when there's an actual loyalty program OR earn-points feature
  const hasRewards =
    (card?.features || []).some((f) => /LOYALTY_PROGRAM|BONUS_REWARDS/.test(f?.featureType || ''));
  if (hasRewards) {
    out.push({ id: 'rewards', label: 'Rewards', category: 'type', priority: 1, source: 'LOYALTY_PROGRAM or BONUS_REWARDS' });
  }

  // True cashback: % cashback on spend (not a one-off welcome offer).
  // Signal: description mentions cashback rate, or feature.additionalInfo
  // mentions "earn X% back". CASHBACK_OFFER alone is usually a sign-up bonus.
  const cashbackSignal =
    /\b(\d+(?:\.\d+)?%\s*cash\s*back|cashback on (every|all) (purchase|spend))\b/.test(text) ||
    (card?.features || []).some(
      (f) =>
        /CASHBACK_OFFER/.test(f?.featureType || '') &&
        /%\s*back|every\s*\$|per\s*\$/i.test(f?.additionalInfo || ''),
    );
  if (cashbackSignal) {
    out.push({ id: 'cashback', label: 'Cashback', category: 'type', priority: 2, source: 'ongoing cashback signal' });
  }

  // Balance transfer offer — INTEREST_FREE_TRANSFERS is the canonical "0%
  // for X months" promo signal. The plain BALANCE_TRANSFERS feature exists
  // on most cards regardless of promo, so we ignore it for tagging.
  const btSignal =
    hasFeatureLike(card, 'INTEREST_FREE_TRANSFERS', /./) ||
    /\b0\s*%\s*(p\.a\.|interest)?\s*(on\s*)?balance transfer/.test(text);
  if (btSignal) {
    out.push({ id: 'balance-transfer', label: 'Balance transfer', category: 'type', priority: 2, source: 'INTEREST_FREE_TRANSFERS or "0% balance transfer"' });
  }

  // Student
  if (/student/i.test(card?.name || '')) {
    out.push({ id: 'student', label: 'Student', category: 'type', priority: 2 });
  }

  return out;
}

// ── Perk rules (specific features users care about) ───────────────────────
function perkTags(card) {
  const out = [];
  const feats = card?.features || [];

  const insuranceTypes = feats
    .filter((f) => /INSURANCE/.test(f?.featureType || ''))
    .map((f) => lower(f.additionalValue || f.additionalInfo || ''));

  if (insuranceTypes.some((v) => /travel/.test(v))) {
    out.push({ id: 'travel-insurance', label: 'Travel insurance', category: 'perk', priority: 3 });
  }
  if (insuranceTypes.some((v) => /purchase protection/.test(v))) {
    out.push({ id: 'purchase-protection', label: 'Purchase protection', category: 'perk', priority: 4 });
  }
  if (insuranceTypes.some((v) => /extended warranty/.test(v))) {
    out.push({ id: 'extended-warranty', label: 'Extended warranty', category: 'perk', priority: 4 });
  }

  // Lounge access — mentioned in COMPLEMENTARY_PRODUCT_DISCOUNTS or anywhere
  if (
    feats.some(
      (f) =>
        /COMPLEMENTARY_PRODUCT_DISCOUNTS/.test(f?.featureType || '') &&
        /lounge/i.test(`${f.additionalValue} ${f.additionalInfo}`),
    ) ||
    /\blounge access\b/i.test(card?.description || '')
  ) {
    out.push({ id: 'lounge-access', label: 'Lounge access', category: 'perk', priority: 3 });
  }

  // Digital wallets — only flag if we have ≥ 2 (most cards have one or two)
  const wallets = feats.filter((f) => f?.featureType === 'DIGITAL_WALLET');
  if (wallets.length >= 3) {
    out.push({ id: 'digital-wallets', label: 'Apple/Google/Samsung Pay', category: 'perk', priority: 5 });
  }

  // Concierge
  if (/concierge/i.test(card?.description || '') || feats.some((f) => /CONCIERGE/.test(f?.featureType || ''))) {
    out.push({ id: 'concierge', label: 'Concierge', category: 'perk', priority: 4 });
  }

  // Interest-free days — only flag if 55+ (50 is the floor for most cards)
  const ifDays = card?.interest_free_days;
  if (Number.isFinite(ifDays) && ifDays >= 55) {
    out.push({ id: 'long-interest-free', label: `${ifDays} days interest-free`, category: 'perk', priority: 4 });
  }

  return out;
}

// ── Main entry point ──────────────────────────────────────────────────────
export function extractCardTags(card) {
  if (!card) return [];
  const text = allText(card);

  const spending = SPENDING_CATEGORIES
    .filter((rule) => rule.match(card, text))
    .map((rule) => ({ ...rule, match: undefined, source: 'spending category match' }));

  const type = cardTypeTags(card);
  const perks = perkTags(card);

  return [...spending, ...type, ...perks].sort((a, b) => a.priority - b.priority);
}

// Pick the most decision-relevant N tags for a compact view (e.g. result row).
// Algorithm: at least 1 spending category if available; fill the rest by
// priority across all categories.
// `pinnedLabels` (optional) — any tag labels currently filtered for. These
// always appear in the result, so users can see why the card matched their
// AND filter (otherwise low-priority perks like Purchase Protection lose to
// spending/type tags and the filter looks broken).
export function topTagsForCard(tags, n = 4, pinnedLabels = []) {
  const byPriority = (a, b) => (a.priority ?? 99) - (b.priority ?? 99);
  const pinnedSet = new Set(pinnedLabels.map((l) => l.toLowerCase()));

  // 1) Always include tags matching the active filter (the AND signal).
  const matchesPin = (t) => t.label && pinnedSet.has(t.label.toLowerCase());
  const pinned = tags.filter(matchesPin);

  // 2) Fill remaining slots by category + priority.
  const remaining = tags.filter((t) => !matchesPin(t));
  const spending = remaining.filter((t) => t.category === 'spending').sort(byPriority);
  const others   = remaining.filter((t) => t.category !== 'spending').sort(byPriority);

  const out = [...pinned];
  if (out.length < n && spending.length) {
    out.push(spending[0]);
  }
  for (const t of [...spending.slice(1), ...others]) {
    if (out.length >= n) break;
    if (!out.find((x) => x.id === t.id)) out.push(t);
  }
  return out.slice(0, n);
}

// CSS class names per category — keeps the UI consistent.
export const TAG_STYLES = {
  spending: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  type:     'bg-blue-50 text-blue-800 border border-blue-200',
  perk:     'bg-violet-50 text-violet-800 border border-violet-200',
};
