import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedDeposits } from '../hooks/useSelectedDeposits.jsx';
import { formatPercent } from '../utils.js';

const FALLBACK_IMG = '/assets/image-not-available.svg';
const dash = '—';
const isPresent = (v) => v !== undefined && v !== null && v !== '';

const fmtRate = (n) => (Number.isFinite(n) ? formatPercent(n) : dash);
const fmtMoney = (n) =>
  Number.isFinite(n) ? (n === 0 ? '$0' : `$${Math.round(n).toLocaleString('en-AU')}`) : dash;
const fmtDays = (n) =>
  !Number.isFinite(n)
    ? dash
    : n < 30
    ? `${n} days`
    : n < 365
    ? `${Math.round(n / 30)} mo`
    : `${(n / 365).toFixed(n % 365 === 0 ? 0 : 1)} yr`;
const fmtTermRange = (d) => {
  if (!Number.isFinite(d.min_term_days) || !Number.isFinite(d.max_term_days)) return dash;
  if (d.min_term_days === d.max_term_days) return fmtDays(d.min_term_days);
  return `${fmtDays(d.min_term_days)} – ${fmtDays(d.max_term_days)}`;
};
const fmtBool = (b) =>
  b ? <span className="text-emerald-700 font-medium">Yes</span> : <span className="text-gray-400">No</span>;
const fmtCategory = (c) => {
  switch (c) {
    case 'TERM_DEPOSIT': return 'Term deposit';
    case 'SAVINGS':      return 'Savings account';
    case 'TRANSACTION':  return 'Everyday account';
    default:             return dash;
  }
};

// Yield estimate (simple compound monthly) on $10,000 over 12 months at the
// product's headline rate — gives a single-number "what would I earn?" cell.
const calcAnnualInterest = (rate, principal = 10_000) => {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const monthly = rate / 12;
  const balance = principal * Math.pow(1 + monthly, 12);
  return balance - principal;
};

const buildRows = (principal = 10_000) => [
  // ── Headline ───────────────────────────────────────────────────────────────
  {
    section: 'Overview',
    key: 'category',
    label: 'Product type',
    fn: (d) => d.product_category,
    renderFn: fmtCategory,
  },
  {
    section: 'Overview',
    key: 'headlineRate',
    label: 'Headline rate',
    tooltip: 'The rate UI uses for the result-row badge: max FIXED for TDs, bonus → intro → base for savings.',
    fn: (d) => d.headlineRateNumber,
    direction: 'higher',
    numericFn: (v) => v,
    renderFn: fmtRate,
  },
  {
    section: 'Overview',
    key: 'yearlyInterest',
    label: `Interest on $${principal.toLocaleString()} / 1 yr`,
    tooltip: 'Simple compound-monthly estimate at the headline rate. Not a quote.',
    fn: (d) => calcAnnualInterest(d.headlineRateNumber, principal),
    direction: 'higher',
    numericFn: (v) => v,
    renderFn: fmtMoney,
  },

  // ── Rates ─────────────────────────────────────────────────────────────────
  { section: 'Rates', key: 'baseRate',  label: 'Base rate',       fn: (d) => d.base_rate,  direction: 'higher', numericFn: (v) => v, renderFn: fmtRate },
  { section: 'Rates', key: 'bonusRate', label: 'Bonus rate',      fn: (d) => d.bonus_rate, direction: 'higher', numericFn: (v) => v, renderFn: fmtRate },
  { section: 'Rates', key: 'introRate', label: 'Intro rate',      fn: (d) => d.intro_rate, direction: 'higher', numericFn: (v) => v, renderFn: fmtRate },
  { section: 'Rates', key: 'introPer',  label: 'Intro period',    fn: (d) => d.intro_period_months, renderFn: (n) => Number.isFinite(n) ? `${n} mo` : dash },
  { section: 'Rates', key: 'bonusCap',  label: 'Bonus cap',       fn: (d) => d.bonus_max_balance,  renderFn: fmtMoney },
  { section: 'Rates', key: 'tdMin',     label: 'TD min rate',     fn: (d) => d.min_rate, direction: 'lower',  numericFn: (v) => v, renderFn: fmtRate },
  { section: 'Rates', key: 'tdMax',     label: 'TD max rate',     fn: (d) => d.max_rate, direction: 'higher', numericFn: (v) => v, renderFn: fmtRate },

  // ── Terms / limits ────────────────────────────────────────────────────────
  { section: 'Terms', key: 'termRange', label: 'Term length',     fn: (d) => d, renderFn: fmtTermRange },
  { section: 'Terms', key: 'minDep',    label: 'Min deposit',     fn: (d) => d.min_deposit_amount, direction: 'lower', numericFn: (v) => v, renderFn: fmtMoney },

  // ── Fees ──────────────────────────────────────────────────────────────────
  { section: 'Fees', key: 'monthlyFee', label: 'Monthly fee',     fn: (d) => d.monthly_fee_amount, direction: 'lower', numericFn: (v) => v, renderFn: fmtMoney },

  // ── Features ──────────────────────────────────────────────────────────────
  { section: 'Features', key: 'cardAccess',  label: 'Card access',          fn: (d) => d.has_card_access,      renderFn: fmtBool },
  { section: 'Features', key: 'unlimited',   label: 'Unlimited transactions', fn: (d) => d.has_unlimited_txns, renderFn: fmtBool },
  { section: 'Features', key: 'digital',     label: 'Digital banking',      fn: (d) => d.has_digital_banking,  renderFn: fmtBool },
  { section: 'Features', key: 'payid',       label: 'PayID',                fn: (d) => d.has_npp_payid,        renderFn: fmtBool },
];

const SECTION_ORDER = ['Overview', 'Rates', 'Terms', 'Fees', 'Features'];

function bestIndex(rowDef, deposits) {
  if (!rowDef.direction || !rowDef.numericFn) return -1;
  const nums = deposits.map((d) => rowDef.numericFn(rowDef.fn(d)));
  const valid = nums.map((n, i) => (Number.isFinite(n) ? { n, i } : null)).filter(Boolean);
  if (valid.length < 2) return -1;
  valid.sort((a, b) => (rowDef.direction === 'higher' ? b.n - a.n : a.n - b.n));
  if (valid[0].n === valid[1].n) return -1;
  return valid[0].i;
}

function DepositCompareTable({ deposits, principal = 10_000 }) {
  const navigate = useNavigate();
  const { toggleDeposit } = useSelectedDeposits();
  const [sortBy, setSortBy] = useState('rateDesc');

  const sorted = useMemo(() => {
    const arr = [...deposits];
    const num = (v) => (Number.isFinite(v) ? v : -Infinity);
    switch (sortBy) {
      case 'baseDesc':
        arr.sort((a, b) => num(b.base_rate) - num(a.base_rate));
        break;
      case 'feeAsc': {
        const fee = (x) => (Number.isFinite(x.monthly_fee_amount) ? x.monthly_fee_amount : Infinity);
        arr.sort((a, b) => fee(a) - fee(b));
        break;
      }
      case 'rateDesc':
      default:
        arr.sort((a, b) => num(b.headlineRateNumber) - num(a.headlineRateNumber));
    }
    return arr;
  }, [deposits, sortBy]);

  const allRows = buildRows(principal);
  const preparedRows = useMemo(
    () =>
      allRows
        .map((r) => {
          const values = sorted.map((d) => r.fn(d));
          // Drop rows where every value is empty (e.g. TD-only fields for savings)
          if (
            r.key !== 'termRange' &&
            values.every((v) => !isPresent(v) && v !== false)
          ) return null;
          return { def: r, values, best: bestIndex(r, sorted) };
        })
        .filter(Boolean),
    [sorted, principal],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
        <p className="text-sm text-gray-700">
          Comparing <strong>{sorted.length}</strong> deposit{sorted.length === 1 ? '' : 's'}
        </p>
        <label className="text-sm text-gray-600 flex items-center gap-2">
          Sort
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
            <option value="rateDesc">Highest headline rate</option>
            <option value="baseDesc">Highest base rate</option>
            <option value="feeAsc">Lowest monthly fee</option>
          </select>
        </label>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <colgroup>
            <col className="w-64" />
            {sorted.map((d) => <col key={d.id} />)}
          </colgroup>

          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="text-left p-4 align-bottom">
                <span className="text-xs uppercase tracking-wide text-gray-500">Attribute</span>
              </th>
              {sorted.map((d) => (
                <th key={d.id} className="p-4 align-bottom border-l border-gray-100 min-w-[220px] text-left">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={d.productImageUrl || d.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                        alt=""
                        className="h-10 w-14 object-contain shrink-0 bg-gray-50 rounded"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">
                          {d.brandName || d.bank_name || d.brand}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 leading-snug" title={d.name}>{d.name}</p>
                      </div>
                    </div>
                    {(d.applicationUrl || d.application_uri) && (
                      <a
                        href={d.applicationUrl || d.application_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-xs text-center w-full"
                      >
                        Open account
                      </a>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <button type="button" onClick={() => navigate(`/deposits/${d.id}`)} className="text-blue-600 hover:underline">
                        Details
                      </button>
                      <button type="button" onClick={() => toggleDeposit(d)} className="text-gray-400 hover:text-gray-700">
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
                    <th colSpan={sorted.length + 1} className="text-left px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-gray-600">
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
                          <td key={i} className={`px-4 py-3 align-top border-l border-gray-100 ${isBest ? 'bg-emerald-50/50' : ''}`}>
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

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {sorted.map((d) => (
          <div key={d.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={d.productImageUrl || d.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                alt=""
                className="h-10 w-14 object-contain rounded bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase">{d.brandName || d.bank_name || d.brand}</p>
                <p className="text-sm font-semibold leading-tight truncate" title={d.name}>{d.name}</p>
              </div>
              <button type="button" onClick={() => toggleDeposit(d)} className="text-xs text-gray-500 hover:underline">
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
                      const v = values[sorted.indexOf(d)];
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

            {(d.applicationUrl || d.application_uri) && (
              <a
                href={d.applicationUrl || d.application_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-sm w-full block text-center mt-3"
              >
                Open account
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DepositCompareTable;
