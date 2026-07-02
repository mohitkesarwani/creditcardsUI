// Specialty-product classification.
//
// CDR feeds include products that aren't useful for a general retail
// comparison — they distort rankings (Westpac's "Sustainable Upgrades"
// $50k top-up loan at 4.49% appears as the cheapest "home loan"; CommBank
// Neo at "0% interest" pushes real low-rate cards down the list). We hide
// these by default but expose a toggle so users can opt in.
//
// Each classifier returns:
//   { isSpecialty: boolean, specialtyReason: string | null }

const lower = (s) => (s || '').toString().toLowerCase();

// ── Home loans ─────────────────────────────────────────────────────────────
const LOAN_NAME_SPECIALTY = [
  { re: /sustainab(le|ility) upgrad/i,             reason: 'Top-up loan for energy/sustainability upgrades only' },
  { re: /green\s+(top[- ]?up|upgrade|renovation)/i, reason: 'Top-up loan for green upgrades only' },
  { re: /bridg(ing|e)/i,                            reason: 'Bridging loan — short-term only' },
];

export function classifyHomeLoan(loan) {
  if (!loan) return { isSpecialty: false, specialtyReason: null };
  const name = lower(loan.name);
  for (const { re, reason } of LOAN_NAME_SPECIALTY) {
    if (re.test(name)) return { isSpecialty: true, specialtyReason: reason };
  }
  // Cap-based detection: primary mortgages aren't capped at <$200k. A small
  // max_loan_amount is a strong signal of a top-up / renovation / specialty
  // product rather than a normal home loan.
  if (Number.isFinite(loan.max_loan_amount) && loan.max_loan_amount < 200_000) {
    return {
      isSpecialty: true,
      specialtyReason: `Loan amount capped at $${loan.max_loan_amount.toLocaleString('en-AU')}`,
    };
  }
  return { isSpecialty: false, specialtyReason: null };
}

// ── Credit cards ───────────────────────────────────────────────────────────
const CARD_NAME_SPECIALTY = [
  { re: /\bbusiness\b/i,    reason: 'Business / commercial card' },
  { re: /\bcorporate\b/i,   reason: 'Corporate card' },
  { re: /\bcommercial\b/i,  reason: 'Commercial card' },
  { re: /\bfleet\b/i,       reason: 'Fleet card' },
  { re: /\bcharity\b/i,     reason: 'Charity card' },
  { re: /\bSMSF\b/i,        reason: 'Self-managed super fund card' },
];

export function classifyCard(card) {
  if (!card) return { isSpecialty: false, specialtyReason: null };
  const name = lower(card.name);
  for (const { re, reason } of CARD_NAME_SPECIALTY) {
    if (re.test(name)) return { isSpecialty: true, specialtyReason: reason };
  }
  // 0% purchase rate is suspicious. Two cases:
  //   - Real no-interest card with monthly fee instead (CommBank Neo / Bundll
  //     / similar). Legitimate but a fundamentally different product class.
  //   - CDR data error (Summerland's "Rewards Credit Card" published at 0%).
  const rate = card.purchase_rate ?? card.interestRateNumber;
  if (rate === 0 || rate === '0' || rate === 0.0) {
    if (Number.isFinite(card.monthly_fee_amount) && card.monthly_fee_amount > 0) {
      return {
        isSpecialty: true,
        specialtyReason: `No-interest card (charges $${card.monthly_fee_amount}/mo instead)`,
      };
    }
    return {
      isSpecialty: true,
      specialtyReason: '0% purchase rate published — likely a data issue',
    };
  }
  return { isSpecialty: false, specialtyReason: null };
}

// ── Deposits ──────────────────────────────────────────────────────────────
const DEPOSIT_NAME_SPECIALTY = [
  { re: /\bbusiness\b/i,                            reason: 'Business account' },
  { re: /\bcorporate\b/i,                           reason: 'Corporate account' },
  { re: /\bcommercial\b/i,                          reason: 'Commercial account' },
  { re: /\bSMSF\b|self[- ]managed/i,                reason: 'Self-managed super fund account' },
  { re: /trust(ee)?\s+account|statutory trust/i,    reason: 'Trust account' },
  { re: /foreign\s+currency/i,                      reason: 'Foreign currency account' },
  { re: /farm\s+management/i,                       reason: 'Farm management deposit' },
  { re: /\b(migrant|pensioner|concession|community\s+fee|retirement)\b/i,
    reason: 'Restricted-eligibility account' },
  { re: /\b(youth|student|kids?|teen)\b/i,
    reason: 'Youth / student account' },
];

export function classifyDeposit(deposit) {
  if (!deposit) return { isSpecialty: false, specialtyReason: null };
  const name = lower(deposit.name);
  for (const { re, reason } of DEPOSIT_NAME_SPECIALTY) {
    if (re.test(name)) return { isSpecialty: true, specialtyReason: reason };
  }
  return { isSpecialty: false, specialtyReason: null };
}
