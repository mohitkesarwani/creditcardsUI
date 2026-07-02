// Pure helper for matching a home-loan's lendingRates[] against a borrower
// scenario. Used by:
//   - RateFinder.jsx (to render the matching options list)
//   - HomeLoanDetailsPage.jsx (to auto-pin the top match into the
//     Repayment Estimator so the user's selection flows through)
//
// Keeping it pure (no React) means both call sites stay consistent.

const rateType = (r) => (r?.lendingRateType || r?.rateType || '').toUpperCase();
const purpose  = (r) => (r?.loanPurpose || '').toUpperCase();
const repay    = (r) => (r?.repaymentType || '').toUpperCase();

const tierCovers = (tiers, userLvr) => {
  if (!Array.isArray(tiers) || !tiers.length) return true;
  return tiers.some((t) => {
    if (!/LVR/i.test(t?.name || '') && !/^PERCENT$/.test(t?.unitOfMeasure || '')) return true;
    const norm = (n) => {
      const x = parseFloat(n);
      if (!Number.isFinite(x)) return null;
      return x > 1 ? x : x * 100;
    };
    const min = norm(t.minimumValue);
    const max = norm(t.maximumValue);
    if (min !== null && userLvr < min) return false;
    if (max !== null && userLvr > max) return false;
    return true;
  });
};

function humanType(t) {
  if (!t) return 'Rate';
  if (t === 'VARIABLE') return 'Variable rate';
  if (t === 'FIXED') return 'Fixed rate';
  if (t === 'DISCOUNT') return 'Discount variable';
  if (t === 'INTRODUCTORY') return 'Introductory rate';
  return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function labelRepayment(rt) {
  if (rt === 'PRINCIPAL_AND_INTEREST') return 'P&I';
  if (rt === 'INTEREST_ONLY') return 'Interest only';
  return rt || '';
}

function describeTiers(tiers) {
  if (!Array.isArray(tiers)) return '';
  const lvr = tiers.find((t) => /LVR/i.test(t?.name || '') || /^PERCENT$/.test(t?.unitOfMeasure || ''));
  if (!lvr) return '';
  const norm = (n) => {
    const x = parseFloat(n);
    if (!Number.isFinite(x)) return null;
    return x > 1 ? x : x * 100;
  };
  const a = norm(lvr.minimumValue);
  const b = norm(lvr.maximumValue);
  if (a !== null && b !== null) return `LVR ${a}%–${b}%`;
  if (b !== null) return `LVR ≤${b}%`;
  if (a !== null) return `LVR ≥${a}%`;
  return '';
}

// Default wizard answers used as the starting state on every loan detail page.
export const DEFAULT_WIZARD_ANSWERS = {
  purpose: 'owner',
  repayment: 'pi',
  rateType: 'either',
  lvr: 80,
  fhb: false,
};

export function findRateMatches(loan, answers) {
  const all = Array.isArray(loan?.lendingRates) ? loan.lendingRates : (loan?.lending_rates || []);
  if (!all.length || !answers) return [];

  const wantPurpose = answers.purpose === 'invest' ? /INVEST/ : /OWNER/;
  const wantRepay   = answers.repayment === 'io'  ? /INTEREST_ONLY/ : /PRINCIPAL/;
  const wantRate =
    answers.rateType === 'fixed'    ? /FIXED/
    : answers.rateType === 'variable' ? /VARIABLE|DISCOUNT|INTRODUCTORY/
    : null;

  return all
    .filter((r) => wantPurpose.test(purpose(r)))
    .filter((r) => wantRepay.test(repay(r)))
    .filter((r) => !wantRate || wantRate.test(rateType(r)))
    .filter((r) => tierCovers(r.tiers, answers.lvr))
    .map((r) => {
      const lvrLabel = describeTiers(r.tiers);
      const label = `${humanType(rateType(r))}${r.repaymentType ? ` · ${labelRepayment(r.repaymentType)}` : ''}${lvrLabel ? ` · ${lvrLabel}` : ''}${r.additionalValue ? ` · ${r.additionalValue}` : ''}`;
      return {
        key: `${parseFloat(r.rate)}|${label}`,
        rateType: rateType(r),
        rate: parseFloat(r.rate),
        comparisonRate: parseFloat(r.comparisonRate),
        term: r.additionalValue || r.term || '',
        repaymentType: r.repaymentType,
        additionalInfo: r.additionalInfo,
        label,
      };
    })
    .filter((r) => Number.isFinite(r.rate))
    .sort((a, b) => a.rate - b.rate);
}
