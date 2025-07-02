export function parseCurrency(value) {
  if (value === undefined || value === null) return null;
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(num) ? null : num;
}

// Gracefully handle undefined/null values when displaying UI fields
export function safeDisplay(value, fallback = '–') {
  return value === undefined || value === null || value === '' ? fallback : value;
}

// Format various numeric or string values consistently
export function formatValue(label, value, fallback = '–') {
  const val = safeDisplay(value, null);
  if (val === null) return fallback;
  if (typeof val === 'string' && (/\$/i.test(val) || /%/.test(val))) return val;
  const num = parseFloat(val);
  if (!Number.isNaN(num)) {
    const l = label.toLowerCase();
    if (/fee|payment|amount|cash|advance/.test(l)) return formatMoney(num);
    if (/rate|interest|percent|comparison/.test(l)) return formatPercent(num);
    if (num >= 0 && num <= 1) return formatPercent(num);
  }
  return val;
}

export function formatMoney(value) {
  const num = parseCurrency(value);
  if (num === null) return value;
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format currency without cents for whole number displays
export function formatMoneyWhole(value) {
  const num = parseCurrency(value);
  if (num === null) return value;
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Format currency without symbol for use inside inputs
export function formatMoneyWholeNoSymbol(value) {
  const formatted = formatMoneyWhole(value);
  return typeof formatted === 'string' ? formatted.replace(/\$/g, '') : formatted;
}

// Format currency for mortgage pages without triggering bonus point text
// Inserts a zero-width space after the dollar sign to avoid regex matches
export function formatMoneyClean(value, digits = 0) {
  const num = parseCurrency(value);
  if (num === null) return value;
  const options = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  };
  const formatted = num.toLocaleString('en-US', options);
  return formatted.replace('$', '$\u200B');
}

export function getMinimumAnnualFee(card) {
  const fees = card.details?.fees || card.fees || [];

  // Prefer fees explicitly labeled as annual
  const annuals = fees
    .filter((f) => /annual/i.test(f.name || ''))
    .map((f) => parseCurrency(f.amount))
    .filter((n) => n !== null);

  if (annuals.length) {
    return Math.min(...annuals);
  }

  const numeric = fees
    .map((f) => parseCurrency(f.amount))
    .filter((n) => n !== null);

  if (numeric.length) {
    return Math.min(...numeric);
  }

  return card.annualFee ? parseCurrency(card.annualFee) : null;
}

export function findFeeAmount(card, label) {
  if (!label) return null;
  const fees = card.details?.fees || card.fees || [];
  const entry = fees.find(
    (f) => f.name && f.name.toLowerCase().includes(label.toLowerCase())
  );
  return entry ? entry.amount : null;
}

export function formatCategory(category) {
  if (!category) return category;
  if (category === 'CRED_AND_CHRG_CARDS') return 'Credit Card';
  return category;
}

/**
 * Extract up to `max` feature tags from a card object. Tags are derived from
 * featureType strings and the card's productCategory when present.
 */
export function getFeatureTags(card, max = 3) {
  const tags = new Set();
  if (card?.productCategory) {
    tags.add(formatCategory(card.productCategory));
  }
  card?.features?.forEach((f) => {
    if (!f.featureType) return;
    const t = f.featureType.toLowerCase();
    if (t.includes('reward')) tags.add('Rewards');
    if (t.includes('travel')) tags.add('Travel');
    if (t.includes('balance')) tags.add('Balance Transfer');
    if (t.includes('point')) tags.add('Points');
    if (t.includes('business')) tags.add('Business');
    if (t.includes('low')) tags.add('Low Rate');
  });
  return Array.from(tags).slice(0, max);
}

const TAG_COLORS = {
  Rewards: 'bg-blue-100 text-blue-800',
  Travel: 'bg-purple-100 text-purple-800',
  'Balance Transfer': 'bg-red-100 text-red-800',
  Points: 'bg-indigo-100 text-indigo-800',
  Business: 'bg-yellow-100 text-yellow-800',
  'Low Rate': 'bg-green-100 text-green-800',
};

export function getTagColor(tag) {
  return TAG_COLORS[tag] || 'bg-gray-100 text-gray-800';
}

export function formatPercent(value, digits = 2) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return value;
  const pct = num > 1 ? num : num * 100;
  return pct.toFixed(digits) + '%';
}

export function categorizeFeatures(features = []) {
  const groups = {
    Insurance: [],
    'Digital Wallets': [],
    Loyalty: [],
    'Travel Benefits': [],
    Other: [],
  };
  features.forEach((f) => {
    if (!f?.featureType) return;
    const normalized = f.featureType.trim().toUpperCase();
    if (normalized === 'OTHER' || normalized === 'UNLIMITED_TXNS') return;
    const t = normalized.toLowerCase();
    if (t.includes('insurance') || t.includes('protection')) groups.Insurance.push(f);
    else if (t.includes('wallet') || t.includes('apple') || t.includes('google') || t.includes('samsung')) groups['Digital Wallets'].push(f);
    else if (t.includes('loyalty') || t.includes('reward') || t.includes('point')) groups.Loyalty.push(f);
    else if (t.includes('travel') || t.includes('lounge') || t.includes('flight')) groups['Travel Benefits'].push(f);
    else groups.Other.push(f);
  });
  return groups;
}

/**
 * Derive up to `max` selling points from card metadata and description.
 * Looks for common phrases that market the card's benefits.
 */
export function getSellingPoints(card, max = 4) {
  if (!card) return [];
  const collected = [];
  const textParts = [card.description];
  if (Array.isArray(card.features)) {
    textParts.push(
      card.features
        .map((f) => `${f.featureType || ''} ${f.additionalValue || ''}`)
        .join(' ')
    );
  }
  const text = textParts.join(' ').toLowerCase();

  const checks = [
    { regex: /0%[^]*balance transfer/, label: 'Balance Transfer Offer' },
    { regex: /complimentary[^]*travel insurance/, label: 'Travel Insurance' },
    { regex: /(no|\$0)\s*annual fee/, label: 'No Annual Fee' },
    { regex: /low[^]*interest rate/, label: 'Low Interest Rate' },
    { regex: /55[^]*interest free/, label: '55 Days Interest Free' },
    {
      regex:
        /no[^]*international[^]*purchase fees|no[^]*foreign transaction fees/,
      label: 'No Foreign Transaction Fees',
    },
    { regex: /cash\s*back|cashback/, label: 'Cashback' },
    { regex: /bonus[^]*points/, label: 'Bonus Points' },
    { regex: /lounge access|airport lounge/, label: 'Lounge Access' },
    { regex: /reward/, label: 'Rewards' },
  ];

  for (const { regex, label } of checks) {
    if (regex.test(text) && !collected.includes(label)) {
      collected.push(label);
      if (collected.length >= max) break;
    }
  }

  if (!collected.length) {
    collected.push('Credit Card');
  }

  return collected.slice(0, max);
}

/**
 * Combine feature tags and selling points into a single list of tags.
 * This is used for filtering so every label shown on the card is captured.
 */
export function getCardTags(card, maxSellingPoints = 4) {
  const combined = new Set(getFeatureTags(card));
  getSellingPoints(card, maxSellingPoints).forEach((t) => combined.add(t));
  return Array.from(combined);
}

export function normalizeMortgageFeature(label) {
  if (!label) return null;
  const upper = label.trim().toUpperCase();
  if (upper === 'OTHER') return null;
  if (upper.includes('DIGITAL')) return 'Digital Access';
  return label
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getMortgageFeatureTags(mortgage) {
  if (!mortgage?.features) return [];
  const tags = mortgage.features
    .map((f) => normalizeMortgageFeature(f.featureType))
    .filter(Boolean);
  return Array.from(new Set(tags));
}

export function getPurchaseInterestRate(card) {
  const rates = card.lendingRates || card.feesAndPricing?.interestRates || [];
  const entry = rates.find(
    (r) => r.rateType && /purchase/i.test(r.rateType)
  );
  return entry?.rate || card.interestRate || null;
}

export function getCashAdvanceRate(card) {
  const rates = card.lendingRates || card.feesAndPricing?.interestRates || [];
  const entry = rates.find(
    (r) => r.rateType && /cash|advance/i.test(r.rateType)
  );
  return entry?.rate || null;
}

export function getInternationalFee(card, multi = false) {
  const label = multi ? 'multi' : 'international';
  const fees = card.details?.fees || card.fees || [];
  const entry = fees.find(
    (f) =>
      f.name &&
      f.name.toLowerCase().includes('transaction') &&
      f.name.toLowerCase().includes(label)
  );
  return entry ? entry.amount : null;
}

export function getLatePaymentFee(card) {
  return findFeeAmount(card, 'late');
}

export function getAdditionalCardFee(card) {
  return findFeeAmount(card, 'additional');
}

export function getInterestFreePeriod(card) {
  return card.interestFree || card.feesAndPricing?.interestFreePeriod || null;
}

export function getDigitalWallets(card) {
  const wallets = new Set();
  card?.features?.forEach((f) => {
    const text = `${f.featureType || ''} ${f.additionalValue || ''}`.toLowerCase();
    if (text.includes('apple')) wallets.add('Apple Pay');
    if (text.includes('google')) wallets.add('Google Pay');
    if (text.includes('samsung')) wallets.add('Samsung Pay');
  });
  return Array.from(wallets);
}

export function getInsuranceTypes(card) {
  const list = [];
  card?.features?.forEach((f) => {
    const t = (f.featureType || '').toLowerCase();
    if (t.includes('insurance') || t.includes('protection')) {
      list.push(f.additionalValue ? `${f.featureType} - ${f.additionalValue}` : f.featureType);
    }
  });
  return list;
}

export function getRewardsProgram(card) {
  const feature = card?.features?.find((f) => /reward|loyalty|point/i.test(f.featureType || ''));
  if (feature) {
    return feature.additionalValue ? `${feature.featureType} ${feature.additionalValue}` : feature.featureType;
  }
  return null;
}

export function getBonusOffer(card) {
  const feature = card?.features?.find((f) =>
    /cashback|bonus|welcome/i.test(`${f.featureType || ''} ${f.additionalValue || ''}`)
  );
  return feature?.additionalValue || null;
}

export function getRewardsValue(card) {
  const regex = /(\d[\d,]*)\s*(bonus|reward)?\s*points/i;
  for (const f of card?.features || []) {
    const text = `${f.featureType || ''} ${f.additionalValue || ''}`;
    const m = text.match(regex);
    if (m) return parseInt(m[1].replace(/,/g, ''), 10);
  }
  return null;
}

export function filterProminentMortgageRates(rates) {
  if (!Array.isArray(rates)) return [];
  const groups = new Map();
  rates.forEach(r => {
    const type = (r.rateType || r.lendingRateType || '').toLowerCase();
    const duration = (r.additionalValue || r.interestPaymentDue || '').toString().toLowerCase();
    const key = `${type}|${duration}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });
  const selected = [];
  groups.forEach(list => {
    const withMeta = list.filter(x => x.loanPurpose || x.repaymentType);
    const candidates = withMeta.length ? withMeta : list;
    candidates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
    if (candidates[0]) selected.push(candidates[0]);
  });
  const deduped = [];
  selected.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
  selected.forEach(r => {
    const match = deduped.find(d => (
      (d.rateType || d.lendingRateType) === (r.rateType || r.lendingRateType) &&
      Math.abs(parseFloat(d.rate) - parseFloat(r.rate)) <= 0.05 &&
      Math.abs(parseFloat(d.comparisonRate || 0) - parseFloat(r.comparisonRate || 0)) <= 0.05
    ));
    if (!match) deduped.push(r);
  });
  const variable = deduped
    .filter(r => /(variable|discount|intro)/i.test(r.rateType || r.lendingRateType))
    .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
  const fixed = deduped
    .filter(r => /fixed/i.test(r.rateType || r.lendingRateType))
    .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
  return [...variable, ...fixed];
}

