import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';
import {
  formatMoneyWhole,
  formatPercent,
  parseCurrency,
  getMinimumAnnualFee,
  getPurchaseInterestRate,
  getCashAdvanceRate,
  getInternationalFee,
  getLatePaymentFee,
  getInterestFreePeriod,
  getDigitalWallets,
  getInsuranceTypes,
  getRewardsProgram,
  getBonusOffer,
  getAdditionalCardFee,
  getRewardsValue,
} from '../utils.js';

const FALLBACK_IMG = '/assets/image-not-available.svg';

// ── Display helpers ─────────────────────────────────────────────────────────
const dashIfEmpty = '—';
const isPresent = (v) => v !== undefined && v !== null && v !== '';

const moneyOrDash = (v) => {
  if (!isPresent(v)) return dashIfEmpty;
  if (typeof v === 'string' && /\$/.test(v)) return v;
  const n = typeof v === 'number' ? v : parseCurrency(v);
  if (!Number.isFinite(n)) return dashIfEmpty;
  return n === 0 ? '$0' : formatMoneyWhole(n);
};

const percentOrDash = (v) => {
  if (!isPresent(v)) return dashIfEmpty;
  if (typeof v === 'string' && /%$/.test(v)) return v;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? formatPercent(n) : dashIfEmpty;
};

const textOrDash = (v) => (isPresent(v) ? v : dashIfEmpty);

// CDR `additionalValue` for a CASHBACK_OFFER is usually a dollar string ("240.00").
// For BONUS POINTS it's plain digits ("75000"). Render the right symbol.
const welcomeOffer = (raw) => {
  if (!isPresent(raw)) return dashIfEmpty;
  const s = String(raw);
  const num = parseFloat(s.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(num)) return s;
  if (/point/i.test(s) || num >= 5000) return `${num.toLocaleString()} pts`;
  return formatMoneyWhole(num);
};

// Collapse a long list (e.g. insurance types) into "A, B, +N more" with hover full list.
function CompactList({ items, max = 2 }) {
  if (!items || items.length === 0) return <span className="text-gray-400">—</span>;
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <span title={items.join(', ')}>
      {shown.join(', ')}
      {extra > 0 && <span className="text-gray-500"> · +{extra} more</span>}
    </span>
  );
}

// ── Row metadata ────────────────────────────────────────────────────────────
// direction: 'lower' = lower-is-better (fees, rates); 'higher' = higher-is-better.
// numericFn: how to coerce a raw value to a comparable number (for Best detection).
// renderFn:  how to display a single cell.
const ROWS = [
  // ── Costs
  {
    section: 'Costs',
    key: 'annualFee',
    label: 'Annual fee',
    tooltip: 'Yearly card-membership fee.',
    fn: (c) => (c.annualFeeNumber ?? c.annual_fee_amount ?? parseCurrency(c.annualFee) ?? getMinimumAnnualFee(c)),
    direction: 'lower',
    numericFn: (v) => (typeof v === 'number' ? v : parseCurrency(v)),
    renderFn: moneyOrDash,
  },
  {
    section: 'Costs',
    key: 'monthlyFee',
    label: 'Monthly fee',
    fn: (c) => c.monthly_fee_amount ?? null,
    direction: 'lower',
    numericFn: (v) => (typeof v === 'number' ? v : null),
    renderFn: moneyOrDash,
  },
  {
    section: 'Costs',
    key: 'lateFee',
    label: 'Late payment fee',
    fn: (c) => getLatePaymentFee(c),
    direction: 'lower',
    numericFn: parseCurrency,
    renderFn: moneyOrDash,
  },
  {
    section: 'Costs',
    key: 'foreign',
    label: 'Foreign transaction fee',
    fn: (c) => getInternationalFee(c, false),
    direction: 'lower',
    numericFn: parseCurrency,
    renderFn: moneyOrDash,
  },
  {
    section: 'Costs',
    key: 'addCard',
    label: 'Additional card fee',
    fn: (c) => getAdditionalCardFee(c),
    direction: 'lower',
    numericFn: parseCurrency,
    renderFn: moneyOrDash,
  },

  // ── Rates
  {
    section: 'Rates',
    key: 'purchaseRate',
    label: 'Purchase rate',
    tooltip: 'Interest charged on purchases.',
    fn: (c) => c.interestRateNumber ?? c.purchase_rate ?? getPurchaseInterestRate(c),
    direction: 'lower',
    numericFn: (v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''))),
    renderFn: percentOrDash,
  },
  {
    section: 'Rates',
    key: 'cashRate',
    label: 'Cash advance rate',
    fn: (c) => c.cash_advance_rate ?? getCashAdvanceRate(c),
    direction: 'lower',
    numericFn: (v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''))),
    renderFn: percentOrDash,
  },
  {
    section: 'Rates',
    key: 'comparisonRate',
    label: 'Comparison rate',
    tooltip: 'Rate including standard fees. Rarely published in CDR data.',
    fn: (c) => c.comparisonRateNumber ?? c.comparison_rate ?? c.comparisonRate ?? null,
    direction: 'lower',
    numericFn: (v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''))),
    renderFn: percentOrDash,
  },
  {
    section: 'Rates',
    key: 'interestFree',
    label: 'Interest-free period',
    tooltip: 'Days you can carry a balance before interest applies.',
    fn: (c) => c.interest_free_days ?? (() => {
      const text = getInterestFreePeriod(c);
      if (!text) return null;
      const m = String(text).match(/(\d+)/);
      return m ? Number(m[1]) : null;
    })(),
    direction: 'higher',
    numericFn: (v) => (typeof v === 'number' ? v : null),
    renderFn: (v) => (isPresent(v) ? `${v} days` : dashIfEmpty),
  },

  // ── Rewards
  {
    section: 'Rewards',
    key: 'rewardsProg',
    label: 'Rewards program',
    fn: (c) => getRewardsProgram(c),
    renderFn: textOrDash,
  },
  {
    section: 'Rewards',
    key: 'welcome',
    label: 'Welcome / cashback',
    tooltip: 'Sign-up bonus, expressed in dollars or points.',
    fn: (c) => getBonusOffer(c) ?? getRewardsValue(c),
    renderFn: welcomeOffer,
  },

  // ── Features
  {
    section: 'Features',
    key: 'wallets',
    label: 'Digital wallets',
    fn: (c) => getDigitalWallets(c),
    renderFn: (v) => <CompactList items={v} max={3} />,
  },
  {
    section: 'Features',
    key: 'insurance',
    label: 'Insurance included',
    fn: (c) => getInsuranceTypes(c),
    renderFn: (v) => <CompactList items={v} max={2} />,
  },

  // ── Eligibility
  {
    section: 'Eligibility',
    key: 'eligibility',
    label: 'Min eligibility',
    fn: (c) => c.eligibilityCriteria,
    renderFn: textOrDash,
  },
];

const SECTION_ORDER = ['Costs', 'Rates', 'Rewards', 'Features', 'Eligibility'];

// ── Best detection ──────────────────────────────────────────────────────────
function bestIndex(rowDef, cards) {
  if (!rowDef.direction || !rowDef.numericFn) return -1;
  const nums = cards.map((c) => rowDef.numericFn(rowDef.fn(c)));
  const valid = nums
    .map((n, i) => (Number.isFinite(n) ? { n, i } : null))
    .filter(Boolean);
  if (valid.length < 2) return -1;
  valid.sort((a, b) => (rowDef.direction === 'higher' ? b.n - a.n : a.n - b.n));
  if (valid[0].n === valid[1].n) return -1;
  return valid[0].i;
}

// ── Component ───────────────────────────────────────────────────────────────
function CompareTable({ cards }) {
  const navigate = useNavigate();
  const { toggleCard } = useSelectedCards();
  const [sortBy, setSortBy] = useState('feeAsc');

  const sortedCards = useMemo(() => {
    const arr = [...cards];
    const valueOf = (c) => {
      switch (sortBy) {
        case 'rateAsc':
          return c.interestRateNumber ?? c.purchase_rate ?? Infinity;
        case 'welcomeDesc':
          return -(getRewardsValue(c) || 0);
        case 'feeAsc':
        default:
          return c.annualFeeNumber ?? c.annual_fee_amount ?? parseCurrency(c.annualFee) ?? Infinity;
      }
    };
    arr.sort((a, b) => valueOf(a) - valueOf(b));
    return arr;
  }, [cards, sortBy]);

  // Prepare rows: compute values + best index per row, drop rows that are entirely empty.
  const preparedRows = useMemo(() =>
    ROWS.map((r) => {
      const values = sortedCards.map((c) => r.fn(c));
      if (values.every((v) => !isPresent(v) && !(Array.isArray(v) && v.length))) return null;
      return { def: r, values, best: bestIndex(r, sortedCards) };
    }).filter(Boolean)
  , [sortedCards]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Controls */}
      <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
        <p className="text-sm text-gray-700">
          Comparing <strong>{sortedCards.length}</strong> card{sortedCards.length === 1 ? '' : 's'}
        </p>
        <label className="text-sm text-gray-600 flex items-center gap-2">
          Sort
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="feeAsc">Annual fee (low → high)</option>
            <option value="rateAsc">Purchase rate (low → high)</option>
            <option value="welcomeDesc">Welcome bonus (high → low)</option>
          </select>
        </label>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <colgroup>
            <col className="w-56" />
            {sortedCards.map((c) => <col key={c.id} />)}
          </colgroup>

          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="text-left p-4 align-bottom">
                <span className="text-xs uppercase tracking-wide text-gray-500">Attribute</span>
              </th>
              {sortedCards.map((c) => (
                <th key={c.id} className="p-4 align-bottom border-l border-gray-100 min-w-[220px] text-left">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={c.productImageUrl || c.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                        alt=""
                        className="h-10 w-14 object-contain shrink-0 bg-gray-50 rounded"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">{c.brandName || c.brand}</p>
                        <p className="text-sm font-semibold text-gray-900 leading-snug" title={c.name}>{c.name}</p>
                      </div>
                    </div>
                    {(c.applicationUrl || c.applicationUri) && (
                      <a
                        href={c.applicationUrl || c.applicationUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-xs text-center w-full"
                      >
                        Apply now
                      </a>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => navigate(`/credit-cards/${c.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCard(c)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {SECTION_ORDER.map((section) => {
              const rows = preparedRows.filter((r) => r.def.section === section);
              if (!rows.length) return null;
              return (
                <React.Fragment key={section}>
                  <tr className="bg-gray-50">
                    <th colSpan={sortedCards.length + 1} className="text-left px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-gray-600">
                      {section}
                    </th>
                  </tr>
                  {rows.map(({ def, values, best }) => (
                    <tr key={def.key} className="border-t border-gray-100">
                      <th className="text-left px-4 py-3 align-top font-medium text-gray-700 sticky left-0 bg-white">
                        <div className="flex items-center gap-1">
                          {def.label}
                          {def.tooltip && (
                            <span
                              title={def.tooltip}
                              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] cursor-help"
                            >
                              ?
                            </span>
                          )}
                        </div>
                      </th>
                      {values.map((v, i) => {
                        const isBest = i === best;
                        return (
                          <td
                            key={i}
                            className={`px-4 py-3 align-top border-l border-gray-100 ${isBest ? 'bg-emerald-50/50' : ''}`}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={isBest ? 'font-semibold text-emerald-900' : 'text-gray-800'}>
                                {def.renderFn(v)}
                              </span>
                              {isBest && <span className="best-pill">Best</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked sections per card */}
      <div className="md:hidden divide-y divide-gray-100">
        {sortedCards.map((c) => (
          <div key={c.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={c.productImageUrl || c.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                alt=""
                className="h-10 w-14 object-contain rounded bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase">{c.brandName || c.brand}</p>
                <p className="text-sm font-semibold leading-tight truncate" title={c.name}>{c.name}</p>
              </div>
              <button type="button" onClick={() => toggleCard(c)} className="text-xs text-gray-500 hover:underline">
                Remove
              </button>
            </div>

            {SECTION_ORDER.map((section) => {
              const rows = preparedRows.filter((r) => r.def.section === section);
              if (!rows.length) return null;
              return (
                <div key={section} className="mb-3 last:mb-0">
                  <h3 className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1">{section}</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    {rows.map(({ def, values }) => {
                      const v = values[sortedCards.indexOf(c)];
                      return (
                        <div key={def.key} className="bg-gray-50 rounded p-2">
                          <dt className="text-[10px] uppercase tracking-wide text-gray-500">{def.label}</dt>
                          <dd className="text-sm font-medium text-gray-900 mt-0.5">{def.renderFn(v)}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              );
            })}

            {(c.applicationUrl || c.applicationUri) && (
              <a
                href={c.applicationUrl || c.applicationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-sm w-full block text-center mt-3"
              >
                Apply now
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompareTable;
