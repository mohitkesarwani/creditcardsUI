// Home-loan tag extractor — mortgage-relevant taxonomy mirroring cardTags.js.
//
// Tag categories:
//   • 'best-for'  — borrower situation (refinance / first-home / investor / …)
//   • 'type'      — loan positioning (low rate / package / basic / fixed avail)
//   • 'perk'      — discrete features users care about (offset / cashback / …)
//
// All rules are data-driven first; we only fall back to description regex when
// the CDR structured fields don't carry the signal (e.g. "first home buyer").

const lower = (s) => (s || '').toString().toLowerCase();

const featureTexts = (loan) =>
  (loan?.features || []).map((f) =>
    [f.featureType, f.additionalValue, f.additionalInfo].filter(Boolean).join(' ').toLowerCase(),
  );

const allText = (loan) =>
  [loan?.name, loan?.description, ...featureTexts(loan)].filter(Boolean).join(' ').toLowerCase();

const hasFeatureType = (loan, type) =>
  (loan?.features || []).some((f) => f?.featureType === type);

// ── Best-for (borrower situation) ──────────────────────────────────────────
const BEST_FOR = [
  {
    id: 'refinance',
    label: 'Refinancers',
    category: 'best-for',
    priority: 1,
    match: (loan, text) =>
      /\brefinanc/.test(text) ||
      hasFeatureType(loan, 'CASHBACK_OFFER'), // refinance cashback is the headline deal here
  },
  {
    id: 'first-home-buyer',
    label: 'First home buyers',
    category: 'best-for',
    priority: 1,
    match: (loan, text) =>
      /\b(first[- ]?home|fhb)\b/.test(text) ||
      // Guarantor support + room for low deposit is the structural FHB signal
      (hasFeatureType(loan, 'GUARANTOR') && (loan.max_lvr_percent ?? 0) >= 95),
  },
  {
    id: 'investment',
    label: 'Investors',
    category: 'best-for',
    priority: 1,
    match: (loan) =>
      // Has any investment-purpose rate published
      Number.isFinite(loan.min_variable_rate_invest) ||
      Number.isFinite(loan.min_fixed_rate_invest) ||
      /\b(investor|investment loan)\b/.test(allText(loan)),
  },
  {
    id: 'construction',
    label: 'Construction',
    category: 'best-for',
    priority: 2,
    match: (loan) => loan.has_construction_option === true || /\bconstruction\b/.test(allText(loan)),
  },
  {
    id: 'bridging',
    label: 'Bridging',
    category: 'best-for',
    priority: 2,
    match: (loan, text) => /\bbridg(e|ing)\b/.test(text),
  },
  {
    id: 'green-loan',
    label: 'Green / sustainable',
    category: 'best-for',
    priority: 2,
    match: (loan, text) =>
      /\b(green loan|sustainab|energy[- ]efficient|solar|eco[- ]friendly)\b/.test(text),
  },
  {
    id: 'low-deposit',
    label: 'Low deposit',
    category: 'best-for',
    priority: 3,
    match: (loan) => Number.isFinite(loan.max_lvr_percent) && loan.max_lvr_percent >= 95,
  },
  {
    id: 'high-borrower',
    label: 'Large loans',
    category: 'best-for',
    priority: 3,
    match: (loan) => Number.isFinite(loan.max_loan_amount) && loan.max_loan_amount >= 2_000_000,
  },
];

// ── Loan type (positioning) ────────────────────────────────────────────────
function loanTypeTags(loan, text) {
  const out = [];
  const fee = loan?.annual_fee_amount;
  const vRate = loan?.min_variable_rate_owner;
  const fRate = loan?.min_fixed_rate_owner;

  // No annual fee — explicit
  if (fee === 0) {
    out.push({ id: 'no-annual-fee', label: 'No annual fee', category: 'type', priority: 1, source: 'annual_fee_amount=0' });
  }

  // Low rate — variable owner-occupied below 5.85% (~ low quartile of current Aus market)
  if (Number.isFinite(vRate) && vRate < 0.0585) {
    out.push({ id: 'low-rate', label: 'Low rate', category: 'type', priority: 1, source: 'min_variable_rate_owner<5.85%' });
  }

  // Package / Premium — explicit "package" mention OR high annual fee with multiple flagship features
  const isPackage =
    /\b(package|premier|premium)\b/.test(text) ||
    (Number.isFinite(fee) && fee >= 300 && loan.has_offset && loan.has_redraw);
  if (isPackage) {
    out.push({ id: 'package', label: 'Package', category: 'type', priority: 2, source: 'high fee + offset+redraw OR "package" name' });
  }

  // Basic — low-fee no-frills product. Signal: explicit "basic"/"no frills" OR
  // (no offset + no annual fee + no upfront fee).
  const isBasic =
    /\b(basic|no[- ]frills)\b/.test(text) ||
    (!loan.has_offset && (fee === 0 || fee === null) && loan.upfront_fee_amount === 0);
  if (isBasic && !isPackage) {
    out.push({ id: 'basic', label: 'Basic / low fee', category: 'type', priority: 2, source: 'no offset + $0 fees OR "basic" name' });
  }

  // Fixed available
  if (Number.isFinite(fRate)) {
    out.push({ id: 'fixed-available', label: 'Fixed rate available', category: 'type', priority: 3 });
  }

  return out;
}

// ── Perks (real features users want when shopping) ────────────────────────
function perkTags(loan) {
  const out = [];

  // Cashback offer — the big deal signal for refinancers
  if (hasFeatureType(loan, 'CASHBACK_OFFER') || /\bcash\s*back\b/.test(allText(loan))) {
    out.push({ id: 'cashback-offer', label: 'Cashback offer', category: 'perk', priority: 1 });
  }

  if (loan.has_offset)              out.push({ id: 'offset',        label: 'Offset account',  category: 'perk', priority: 2 });
  if (loan.has_redraw)              out.push({ id: 'redraw',        label: 'Redraw',          category: 'perk', priority: 2 });
  if (loan.has_extra_repayments)    out.push({ id: 'extra-repay',   label: 'Extra repayments',category: 'perk', priority: 3 });
  if (loan.has_rate_lock)           out.push({ id: 'rate-lock',     label: 'Rate lock',       category: 'perk', priority: 3 });
  if (loan.has_split_loan)          out.push({ id: 'split-loan',    label: 'Split loan',      category: 'perk', priority: 3 });
  if (loan.has_construction_option) out.push({ id: 'construction-opt', label: 'Construction option', category: 'perk', priority: 3 });

  if (hasFeatureType(loan, 'GUARANTOR')) {
    out.push({ id: 'guarantor', label: 'Guarantor support', category: 'perk', priority: 3 });
  }
  if (hasFeatureType(loan, 'RELATIONSHIP_MANAGEMENT')) {
    out.push({ id: 'relationship-manager', label: 'Relationship manager', category: 'perk', priority: 4 });
  }
  if (hasFeatureType(loan, 'DIGITAL_BANKING')) {
    out.push({ id: 'digital-banking', label: 'Digital banking', category: 'perk', priority: 4 });
  }

  // Zero-fee perks
  if (loan.upfront_fee_amount === 0) {
    out.push({ id: 'no-upfront-fee', label: '$0 upfront fee', category: 'perk', priority: 2 });
  }
  if (loan.discharge_fee_amount === 0) {
    out.push({ id: 'no-discharge-fee', label: '$0 discharge fee', category: 'perk', priority: 4 });
  }

  return out;
}

// ── Main entry point ──────────────────────────────────────────────────────
export function extractHomeLoanTags(loan) {
  if (!loan) return [];
  const text = allText(loan);

  const bestFor = BEST_FOR.filter((r) => r.match(loan, text)).map((r) => ({ ...r, match: undefined }));
  const type    = loanTypeTags(loan, text);
  const perks   = perkTags(loan);

  return [...bestFor, ...type, ...perks].sort((a, b) => a.priority - b.priority);
}

// CSS classes mapped to category. Reused from card tags so the visual
// language is consistent across products.
export const HOME_LOAN_TAG_STYLES = {
  'best-for': 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  type:       'bg-blue-50 text-blue-800 border border-blue-200',
  perk:       'bg-violet-50 text-violet-800 border border-violet-200',
};

// Pick the most decision-relevant N tags for a compact view (result row).
// Always include any pinned (currently-filtered) tags so users can see why
// the AND filter matched.
export function topHomeLoanTags(tags, n = 4, pinnedLabels = []) {
  const byPriority = (a, b) => (a.priority ?? 99) - (b.priority ?? 99);
  const pinnedSet = new Set(pinnedLabels.map((l) => l.toLowerCase()));
  const matchesPin = (t) => t.label && pinnedSet.has(t.label.toLowerCase());

  const pinned = tags.filter(matchesPin);
  const remaining = tags.filter((t) => !matchesPin(t));
  const bestFor = remaining.filter((t) => t.category === 'best-for').sort(byPriority);
  const others  = remaining.filter((t) => t.category !== 'best-for').sort(byPriority);

  const out = [...pinned];
  if (out.length < n && bestFor.length) out.push(bestFor[0]);
  for (const t of [...bestFor.slice(1), ...others]) {
    if (out.length >= n) break;
    if (!out.find((x) => x.id === t.id)) out.push(t);
  }
  return out.slice(0, n);
}
