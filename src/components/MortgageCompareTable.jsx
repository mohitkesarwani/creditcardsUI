import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import { formatMoneyWhole, formatPercent } from '../utils.js';

const FALLBACK_IMG = '/assets/image-not-available.svg';
const dash = '—';
const isPresent = (v) => v !== undefined && v !== null && v !== '';

// ── Cell formatters ────────────────────────────────────────────────────────
const fmtRate = (n) => (Number.isFinite(n) ? formatPercent(n) : dash);
const fmtMoney = (n) => (Number.isFinite(n) ? `$${Math.round(n).toLocaleString()}` : dash);
const fmtLvr = (n) => (Number.isFinite(n) ? `${n}%` : dash);
const fmtBool = (b) =>
  b ? <span className="text-emerald-700 font-medium">Yes</span> : <span className="text-gray-400">No</span>;
const fmtTermMonths = (n) =>
  !Number.isFinite(n)
    ? dash
    : n >= 12
    ? `${Math.round(n / 12)} years`
    : `${n} months`;
const fmtLoanAmount = (n) =>
  !Number.isFinite(n) ? dash : n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : fmtMoney(n);

// Repayment calculator — standard amortisation
function calcMonthly(amount, annualRate, years) {
  if (!Number.isFinite(annualRate) || annualRate <= 0 || !Number.isFinite(amount) || amount <= 0) return null;
  const r = annualRate / 12;
  const n = years * 12;
  const payment = (amount * r) / (1 - Math.pow(1 + r, -n));
  return Number.isFinite(payment) ? payment : null;
}

// ── Row definitions ───────────────────────────────────────────────────────
//   direction: 'lower' | 'higher' | undefined (no highlight)
//   numericFn: how to coerce to number for best detection
//   renderFn:  how to display the cell
const buildRows = (loanAmount, loanTerm) => [
  // ── Rates ────────────────────────────────────────────────────────────────
  {
    section: 'Rates',
    key: 'minVariableOwner',
    label: 'Variable (owner-occupied)',
    tooltip: 'Lowest variable rate the lender publishes for owner-occupied P&I borrowers.',
    fn: (m) => m.min_variable_rate_owner,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtRate,
  },
  {
    section: 'Rates',
    key: 'minFixedOwner',
    label: 'Fixed (owner-occupied)',
    fn: (m) => m.min_fixed_rate_owner,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtRate,
  },
  {
    section: 'Rates',
    key: 'minVariableInvest',
    label: 'Variable (investment)',
    fn: (m) => m.min_variable_rate_invest,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtRate,
  },
  {
    section: 'Rates',
    key: 'minFixedInvest',
    label: 'Fixed (investment)',
    fn: (m) => m.min_fixed_rate_invest,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtRate,
  },
  {
    section: 'Rates',
    key: 'comparison',
    label: 'Comparison rate',
    tooltip: 'Lowest comparison rate across all this loan\'s rate options.',
    fn: (m) => m.min_comparison_rate,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtRate,
  },

  // ── Repayment (derived from headline variable owner rate) ────────────────
  {
    section: 'Repayments',
    key: 'monthlyRepayment',
    label: `Monthly repayment (on ${formatMoneyWhole(loanAmount)} over ${loanTerm} yrs)`,
    fn: (m) => {
      const rate = m.min_variable_rate_owner ?? m.min_fixed_rate_owner;
      return calcMonthly(loanAmount, rate, loanTerm);
    },
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtMoney,
  },
  {
    section: 'Repayments',
    key: 'totalCost',
    label: 'Total to repay',
    fn: (m) => {
      const rate = m.min_variable_rate_owner ?? m.min_fixed_rate_owner;
      const monthly = calcMonthly(loanAmount, rate, loanTerm);
      return monthly ? monthly * loanTerm * 12 : null;
    },
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtMoney,
  },

  // ── Limits ───────────────────────────────────────────────────────────────
  {
    section: 'Limits',
    key: 'maxLvr',
    label: 'Max LVR',
    tooltip: 'Maximum loan-to-value ratio offered.',
    fn: (m) => m.max_lvr_percent,
    direction: 'higher',
    numericFn: (v) => v,
    renderFn: fmtLvr,
  },
  {
    section: 'Limits',
    key: 'minLoan',
    label: 'Min loan amount',
    fn: (m) => m.min_loan_amount,
    renderFn: fmtLoanAmount,
  },
  {
    section: 'Limits',
    key: 'maxLoan',
    label: 'Max loan amount',
    fn: (m) => m.max_loan_amount,
    direction: 'higher',
    numericFn: (v) => v,
    renderFn: fmtLoanAmount,
  },
  {
    section: 'Limits',
    key: 'maxTerm',
    label: 'Max term',
    fn: (m) => m.max_term_months,
    direction: 'higher',
    numericFn: (v) => v,
    renderFn: fmtTermMonths,
  },

  // ── Fees ─────────────────────────────────────────────────────────────────
  {
    section: 'Fees',
    key: 'upfrontFee',
    label: 'Upfront / establishment',
    fn: (m) => m.upfront_fee_amount,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtMoney,
  },
  {
    section: 'Fees',
    key: 'annualFee',
    label: 'Annual fee',
    fn: (m) => m.annual_fee_amount,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtMoney,
  },
  {
    section: 'Fees',
    key: 'monthlyFee',
    label: 'Monthly service fee',
    fn: (m) => m.monthly_fee_amount,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtMoney,
  },
  {
    section: 'Fees',
    key: 'dischargeFee',
    label: 'Discharge fee',
    fn: (m) => m.discharge_fee_amount,
    direction: 'lower',
    numericFn: (v) => v,
    renderFn: fmtMoney,
  },

  // ── Features ─────────────────────────────────────────────────────────────
  { section: 'Features', key: 'fOffset',  label: 'Offset account',  fn: (m) => m.has_offset,           renderFn: fmtBool },
  { section: 'Features', key: 'fRedraw',  label: 'Redraw',          fn: (m) => m.has_redraw,           renderFn: fmtBool },
  { section: 'Features', key: 'fExtra',   label: 'Extra repayments',fn: (m) => m.has_extra_repayments, renderFn: fmtBool },
  { section: 'Features', key: 'fLock',    label: 'Rate lock',       fn: (m) => m.has_rate_lock,        renderFn: fmtBool },
  { section: 'Features', key: 'fSplit',   label: 'Split loan',      fn: (m) => m.has_split_loan,       renderFn: fmtBool },
  { section: 'Features', key: 'fConstr',  label: 'Construction',    fn: (m) => m.has_construction_option, renderFn: fmtBool },
];

const SECTION_ORDER = ['Rates', 'Repayments', 'Limits', 'Fees', 'Features'];

function bestIndex(rowDef, mortgages) {
  if (!rowDef.direction || !rowDef.numericFn) return -1;
  const nums = mortgages.map((m) => rowDef.numericFn(rowDef.fn(m)));
  const valid = nums
    .map((n, i) => (Number.isFinite(n) ? { n, i } : null))
    .filter(Boolean);
  if (valid.length < 2) return -1;
  valid.sort((a, b) => (rowDef.direction === 'higher' ? b.n - a.n : a.n - b.n));
  if (valid[0].n === valid[1].n) return -1;
  return valid[0].i;
}

function MortgageCompareTable({ mortgages, loanAmount = 800_000, loanTerm = 30 }) {
  const navigate = useNavigate();
  const { toggleMortgage } = useSelectedMortgages();
  const [sortBy, setSortBy] = useState('variableAsc');

  const sortedMortgages = useMemo(() => {
    const arr = [...mortgages];
    const num = (v) => (Number.isFinite(v) ? v : Infinity);
    switch (sortBy) {
      case 'fixedAsc':
        arr.sort((a, b) => num(a.min_fixed_rate_owner) - num(b.min_fixed_rate_owner));
        break;
      case 'compAsc':
        arr.sort((a, b) => num(a.min_comparison_rate) - num(b.min_comparison_rate));
        break;
      case 'variableAsc':
      default:
        arr.sort((a, b) => num(a.min_variable_rate_owner) - num(b.min_variable_rate_owner));
    }
    return arr;
  }, [mortgages, sortBy]);

  const allRows = buildRows(loanAmount, loanTerm);
  const preparedRows = useMemo(
    () =>
      allRows
        .map((r) => {
          const values = sortedMortgages.map((m) => r.fn(m));
          if (values.every((v) => !isPresent(v) && v !== false)) return null;
          return { def: r, values, best: bestIndex(r, sortedMortgages) };
        })
        .filter(Boolean),
    [sortedMortgages, loanAmount, loanTerm],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
        <p className="text-sm text-gray-700">
          Comparing <strong>{sortedMortgages.length}</strong> home loan{sortedMortgages.length === 1 ? '' : 's'}
        </p>
        <label className="text-sm text-gray-600 flex items-center gap-2">
          Sort
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="variableAsc">Lowest variable rate</option>
            <option value="fixedAsc">Lowest fixed rate</option>
            <option value="compAsc">Lowest comparison rate</option>
          </select>
        </label>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <colgroup>
            <col className="w-64" />
            {sortedMortgages.map((m) => <col key={m.id} />)}
          </colgroup>

          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="text-left p-4 align-bottom">
                <span className="text-xs uppercase tracking-wide text-gray-500">Attribute</span>
              </th>
              {sortedMortgages.map((m) => (
                <th key={m.id} className="p-4 align-bottom border-l border-gray-100 min-w-[220px] text-left">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={m.productImageUrl || m.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                        alt=""
                        className="h-10 w-14 object-contain shrink-0 bg-gray-50 rounded"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">
                          {m.brandName || m.bank_name || m.brand}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 leading-snug" title={m.name}>{m.name}</p>
                      </div>
                    </div>
                    {(m.applicationUrl || m.application_uri) && (
                      <a
                        href={m.applicationUrl || m.application_uri}
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
                        onClick={() => navigate(`/home-loans/${m.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMortgage(m)}
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
                    <th colSpan={sortedMortgages.length + 1} className="text-left px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-gray-600">
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

      {/* Mobile: stacked per loan */}
      <div className="md:hidden divide-y divide-gray-100">
        {sortedMortgages.map((m) => (
          <div key={m.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={m.productImageUrl || m.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                alt=""
                className="h-10 w-14 object-contain rounded bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase">{m.brandName || m.bank_name || m.brand}</p>
                <p className="text-sm font-semibold leading-tight truncate" title={m.name}>{m.name}</p>
              </div>
              <button type="button" onClick={() => toggleMortgage(m)} className="text-xs text-gray-500 hover:underline">
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
                      const v = values[sortedMortgages.indexOf(m)];
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

            {(m.applicationUrl || m.application_uri) && (
              <a
                href={m.applicationUrl || m.application_uri}
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

export default MortgageCompareTable;
