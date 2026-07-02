// Deposit tag extractor — mirrors the cards/loans tag systems. Three
// categories:
//   • 'product-type' — TERM DEPOSIT / SAVINGS / TRANSACTION (always present
//                      so the user sees what they're looking at).
//   • 'best-for'    — situational fit (emergency fund / kids / FHB / etc.).
//   • 'perk'        — discrete features users actually want.

const lower = (s) => (s || '').toString().toLowerCase();

const featureTexts = (d) =>
  (d?.features || []).map((f) =>
    [f.featureType, f.additionalValue, f.additionalInfo].filter(Boolean).join(' ').toLowerCase(),
  );

const allText = (d) =>
  [d?.name, d?.description, ...featureTexts(d)].filter(Boolean).join(' ').toLowerCase();

const hasFeatureType = (d, type) =>
  (d?.features || []).some((f) => f?.featureType === type);

// ── Product-type tag (always shown) ────────────────────────────────────────
function productTypeTag(d) {
  if (d?.product_category === 'TERM_DEPOSIT') {
    return { id: 'term-deposit', label: 'Term deposit', category: 'product-type', priority: 0 };
  }
  if (d?.product_category === 'SAVINGS') {
    return { id: 'savings', label: 'Savings account', category: 'product-type', priority: 0 };
  }
  if (d?.product_category === 'TRANSACTION') {
    return { id: 'transaction', label: 'Everyday account', category: 'product-type', priority: 0 };
  }
  return null;
}

// ── Best-for ──────────────────────────────────────────────────────────────
const BEST_FOR = [
  {
    id: 'emergency-fund',
    label: 'Emergency fund',
    category: 'best-for',
    priority: 1,
    match: (d) =>
      d?.product_category === 'SAVINGS' &&
      // Liquid + decent rate + no balance cap that punishes small balances
      (d?.has_bonus_rate || (Number.isFinite(d?.base_rate) && d?.base_rate >= 0.025)),
  },
  {
    id: 'first-home-saver',
    label: 'First-home saver',
    category: 'best-for',
    priority: 1,
    match: (d, text) =>
      /\b(first[- ]?home|fhss|fhsa)\b/.test(text) ||
      (d?.product_category === 'SAVINGS' && d?.has_bonus_rate),
  },
  {
    id: 'kids-account',
    label: 'Kids / under 18',
    category: 'best-for',
    priority: 2,
    match: (d, text) =>
      /\b(youth|kid|child|teen|student|young saver|under\s*18)\b/.test(text),
  },
  {
    id: 'short-term-park',
    label: 'Short-term park',
    category: 'best-for',
    priority: 2,
    match: (d) =>
      d?.product_category === 'TERM_DEPOSIT' &&
      Number.isFinite(d?.min_term_days) && d?.min_term_days <= 90,
  },
  {
    id: 'long-term-lock',
    label: 'Long-term lock',
    category: 'best-for',
    priority: 2,
    match: (d) =>
      d?.product_category === 'TERM_DEPOSIT' &&
      Number.isFinite(d?.max_term_days) && d?.max_term_days >= 365 * 2,
  },
  {
    id: 'high-balance',
    label: 'High balances',
    category: 'best-for',
    priority: 3,
    match: (d) =>
      // Savings: no bonus cap or a very high one; TDs: max-rate AT high tiers
      (d?.product_category === 'SAVINGS' &&
        d?.has_bonus_rate &&
        (!Number.isFinite(d?.bonus_max_balance) || d?.bonus_max_balance >= 250_000)) ||
      (d?.product_category === 'TERM_DEPOSIT' &&
        Number.isFinite(d?.max_rate) && d?.max_rate >= 0.04),
  },
  {
    id: 'introductory-boost',
    label: 'Intro rate boost',
    category: 'best-for',
    priority: 3,
    match: (d) => d?.has_intro_rate === true,
  },
];

// ── Perks ─────────────────────────────────────────────────────────────────
function perkTags(d) {
  const out = [];

  if (d?.monthly_fee_amount === 0) {
    out.push({ id: 'no-monthly-fee', label: 'No monthly fee', category: 'perk', priority: 1 });
  }
  if (d?.has_bonus_rate) {
    out.push({ id: 'bonus-interest', label: 'Bonus interest', category: 'perk', priority: 1 });
  }
  if (d?.has_intro_rate) {
    out.push({ id: 'intro-rate', label: 'Introductory rate', category: 'perk', priority: 1 });
  }
  // No bonus condition - savings without a bonus tier (rare but exists)
  if (
    d?.product_category === 'SAVINGS' &&
    !d?.has_bonus_rate &&
    Number.isFinite(d?.base_rate) &&
    d?.base_rate >= 0.04
  ) {
    out.push({ id: 'no-conditions', label: 'No bonus conditions', category: 'perk', priority: 2 });
  }
  if (d?.has_card_access) {
    out.push({ id: 'card-access', label: 'Card access', category: 'perk', priority: 3 });
  }
  if (d?.has_unlimited_txns) {
    out.push({ id: 'unlimited-txns', label: 'Unlimited transactions', category: 'perk', priority: 3 });
  }
  if (d?.has_digital_banking) {
    out.push({ id: 'digital-banking', label: 'Digital banking', category: 'perk', priority: 4 });
  }
  if (d?.has_npp_payid) {
    out.push({ id: 'payid', label: 'PayID', category: 'perk', priority: 4 });
  }
  if (
    d?.product_category === 'SAVINGS' &&
    (!Number.isFinite(d?.bonus_max_balance) || d?.bonus_max_balance >= 500_000) &&
    d?.has_bonus_rate
  ) {
    out.push({ id: 'no-balance-cap', label: 'No bonus balance cap', category: 'perk', priority: 2 });
  }
  return out;
}

// ── Main entry point ──────────────────────────────────────────────────────
export function extractDepositTags(deposit) {
  if (!deposit) return [];
  const text = allText(deposit);
  const out = [];
  const pt = productTypeTag(deposit);
  if (pt) out.push(pt);

  for (const r of BEST_FOR) {
    if (r.match(deposit, text)) {
      out.push({ id: r.id, label: r.label, category: r.category, priority: r.priority });
    }
  }
  out.push(...perkTags(deposit));
  return out.sort((a, b) => a.priority - b.priority);
}

export const DEPOSIT_TAG_STYLES = {
  'product-type': 'bg-slate-100 text-slate-800 border border-slate-300',
  'best-for':     'bg-emerald-50 text-emerald-800 border border-emerald-200',
  perk:           'bg-violet-50 text-violet-800 border border-violet-200',
};

// Pick the top-N tags, always pinning active-filter labels first.
export function topDepositTags(tags, n = 4, pinnedLabels = []) {
  const byPriority = (a, b) => (a.priority ?? 99) - (b.priority ?? 99);
  const pinnedSet = new Set((pinnedLabels || []).map((l) => l.toLowerCase()));
  const matchesPin = (t) => t.label && pinnedSet.has(t.label.toLowerCase());

  const pinned = tags.filter(matchesPin);
  const remaining = tags.filter((t) => !matchesPin(t));
  const productType = remaining.filter((t) => t.category === 'product-type');
  const bestFor = remaining.filter((t) => t.category === 'best-for').sort(byPriority);
  const others  = remaining.filter((t) => t.category === 'perk').sort(byPriority);

  const out = [...pinned, ...productType];
  for (const t of [...bestFor, ...others]) {
    if (out.length >= n) break;
    if (!out.find((x) => x.id === t.id)) out.push(t);
  }
  return out.slice(0, n);
}
