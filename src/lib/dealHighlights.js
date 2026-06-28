// Extract the headline "deal" on a product — the thing a deal-shopper
// actually wants to know at a glance. The app's stated purpose is finding
// deals, so this gets surfaced as a prominent badge on result cards.
//
// Returns null when there is no time-limited offer / cashback / bonus that
// justifies a badge. We deliberately don't fabricate one.
//
// Output shape:
//   {
//     kind: 'cashback' | 'bonus-points' | 'intro-rate',
//     label: 'Up to $4,000 cashback',
//     amount: 4000,              // number when extractable
//     unit:   '$' | 'pts' | '%',
//     details: 'When you refinance to this loan',  // optional secondary line
//   }

const lower = (s) => (s || '').toString().toLowerCase();

// Pulls the first dollar value from a string — e.g. "Up to $3,000 cashback when..."
const firstDollar = (text) => {
  const m = String(text || '').match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

// Pulls a bare integer big enough to be a points count — e.g. "90000" or "75,000 bonus points"
const firstPoints = (text) => {
  const m = String(text || '').match(/([\d,]{4,})/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ''), 10);
  return Number.isFinite(n) && n >= 1000 ? n : null;
};

const formatMoney = (n) =>
  Number.isFinite(n)
    ? n >= 1000
      ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
      : `$${n}`
    : null;

const formatPoints = (n) =>
  Number.isFinite(n)
    ? n >= 1000
      ? `${Math.round(n / 1000)}k pts`
      : `${n} pts`
    : null;

// ── Credit-card deal extractor ────────────────────────────────────────────
export function extractCardDeal(card) {
  if (!card) return null;
  const features = card.features || [];

  // 1) Welcome bonus points — BONUS_REWARDS feature is the canonical signal.
  //    additionalValue is usually the raw point count ("90000").
  const bonusFeature = features.find((f) => f?.featureType === 'BONUS_REWARDS');
  if (bonusFeature) {
    const text = `${bonusFeature.additionalValue || ''} ${bonusFeature.additionalInfo || ''}`.trim();
    const points = firstPoints(bonusFeature.additionalValue) ?? firstPoints(text);
    const dollars = firstDollar(text);
    if (points && points >= 5000) {
      return {
        kind: 'bonus-points',
        label: `${formatPoints(points)} welcome bonus`,
        amount: points,
        unit: 'pts',
        details: cleanSentence(bonusFeature.additionalInfo),
      };
    }
    if (dollars) {
      return {
        kind: 'cashback',
        label: `${formatMoney(dollars)} welcome bonus`,
        amount: dollars,
        unit: '$',
        details: cleanSentence(bonusFeature.additionalInfo),
      };
    }
  }

  // 2) Cashback offer — CASHBACK_OFFER feature on cards is usually a sign-up
  //    bonus rather than ongoing % cashback. Pull the $ amount when present.
  const cashbackFeature = features.find((f) => f?.featureType === 'CASHBACK_OFFER');
  if (cashbackFeature) {
    const text = `${cashbackFeature.additionalValue || ''} ${cashbackFeature.additionalInfo || ''}`.trim();
    const dollars = firstDollar(text) ?? (Number.isFinite(+cashbackFeature.additionalValue) ? +cashbackFeature.additionalValue : null);
    if (dollars && dollars >= 50) {
      return {
        kind: 'cashback',
        label: `${formatMoney(dollars)} cashback`,
        amount: dollars,
        unit: '$',
        details: cleanSentence(cashbackFeature.additionalInfo),
      };
    }
  }

  // 3) 0% balance transfer for X months — INTEREST_FREE_TRANSFERS feature
  const btFeature = features.find((f) => f?.featureType === 'INTEREST_FREE_TRANSFERS');
  if (btFeature && btFeature.additionalValue) {
    const months = parseIsoToMonths(btFeature.additionalValue);
    if (months) {
      return {
        kind: 'intro-rate',
        label: `0% balance transfer for ${months} mo`,
        amount: months,
        unit: 'mo',
        details: cleanSentence(btFeature.additionalInfo),
      };
    }
  }

  return null;
}

// ── Home-loan deal extractor ──────────────────────────────────────────────
export function extractLoanDeal(loan) {
  if (!loan) return null;

  // CASHBACK_OFFER feature is the canonical refinance-cashback signal in CDR.
  // It's also where the $ amount typically lives (e.g. additionalValue="3000"
  // or additionalInfo="Up to $4,000 cashback when you refinance").
  const cashbackFeature = (loan.features || []).find((f) => f?.featureType === 'CASHBACK_OFFER');
  if (cashbackFeature) {
    const text = `${cashbackFeature.additionalValue || ''} ${cashbackFeature.additionalInfo || ''}`;
    const dollars = firstDollar(text) ?? (Number.isFinite(+cashbackFeature.additionalValue) ? +cashbackFeature.additionalValue : null);
    if (dollars && dollars >= 100) {
      return {
        kind: 'cashback',
        label: `${formatMoney(dollars)} cashback`,
        amount: dollars,
        unit: '$',
        details: cleanSentence(cashbackFeature.additionalInfo) || 'When you refinance to this loan.',
      };
    }
    return {
      kind: 'cashback',
      label: 'Cashback offer',
      details: cleanSentence(cashbackFeature.additionalInfo),
    };
  }

  // Fallback: text mention in description / additional info
  const text = lower(loan.description) + ' ' + lower(loan.additionalInformation || '');
  if (/\bcash\s*back\b/.test(text)) {
    const dollars = firstDollar(text);
    if (dollars && dollars >= 100) {
      return {
        kind: 'cashback',
        label: `${formatMoney(dollars)} cashback`,
        amount: dollars,
        unit: '$',
        details: 'Mentioned in the loan description.',
      };
    }
  }

  return null;
}

// "P18M" → 18, "P1Y" → 12, etc.
function parseIsoToMonths(iso) {
  if (!iso) return null;
  const m = String(iso).match(/^P(\d+)M$/i);
  if (m) return Number(m[1]);
  const y = String(iso).match(/^P(\d+)Y$/i);
  if (y) return Number(y[1]) * 12;
  return null;
}

// Trim free text to a one-liner for the badge tooltip.
function cleanSentence(s) {
  if (!s) return null;
  const first = String(s).split(/[.\n]/)[0].trim();
  return first.length > 4 ? first.slice(0, 140) : null;
}
