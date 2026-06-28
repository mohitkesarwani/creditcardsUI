import React, { useMemo, useState } from 'react';
import { formatPercent } from '../../utils.js';

// Wizard that asks the borrower a few questions and filters this loan's
// `lendingRates` JSONB to the matching subset, sorted cheapest-first.
//
// Inputs the user gives:
//   purpose     'owner' | 'invest'
//   repayment   'pi' | 'io'             (Principal-and-Interest vs Interest-only)
//   rateType    'variable' | 'fixed' | 'either'
//   lvr         number (50-95)          (loan-to-value ratio %)
//   firstHomeBuyer  boolean             (informational only — CDR doesn't tag rates as FHB)
//
// Then maps to CDR `lendingRates[]` filters:
//   loanPurpose   ∈ ['OWNER_OCCUPIED' | 'INVESTMENT']
//   repaymentType ∈ ['PRINCIPAL_AND_INTEREST' | 'INTEREST_ONLY']
//   lendingRateType matches VARIABLE / FIXED / DISCOUNT etc.
//   tiers cover the user's LVR (their LVR fits in [minimumValue, maximumValue])

const rateType = (r) => (r?.lendingRateType || r?.rateType || '').toUpperCase();
const purpose  = (r) => (r?.loanPurpose || '').toUpperCase();
const repay    = (r) => (r?.repaymentType || '').toUpperCase();

const STEPS = [
  { id: 'purpose',  label: 'Who is the loan for?' },
  { id: 'repayment',label: 'How will you repay?' },
  { id: 'rateType', label: 'Rate type?' },
  { id: 'lvr',      label: 'How much deposit?' },
  { id: 'fhb',      label: 'First-home buyer?' },
];

// LVR tier match: returns true if user LVR fits the tier's range.
const tierCovers = (tiers, userLvr) => {
  if (!Array.isArray(tiers) || !tiers.length) return true; // no tiers → applies broadly
  return tiers.some((t) => {
    if (!/LVR/i.test(t?.name || '') && !/^PERCENT$/.test(t?.unitOfMeasure || '')) return true;
    const norm = (n) => {
      const x = parseFloat(n);
      if (!Number.isFinite(x)) return null;
      return x > 1 ? x : x * 100; // 0.9 → 90
    };
    const min = norm(t.minimumValue);
    const max = norm(t.maximumValue);
    if (min !== null && userLvr < min) return false;
    if (max !== null && userLvr > max) return false;
    return true;
  });
};

function ChoiceRow({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            'px-3 py-2 rounded-lg border text-sm transition-colors ' +
            (value === o.value
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50')
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Helpers used by both the row and the parent-passed callback.
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

export default function RateFinder({ loan, pinnedKey = null, onPin }) {
  const [answers, setAnswers] = useState({
    purpose: 'owner',
    repayment: 'pi',
    rateType: 'either',
    lvr: 80,
    fhb: false,
  });

  const set = (k, v) => setAnswers((s) => ({ ...s, [k]: v }));

  const matches = useMemo(() => {
    const all = Array.isArray(loan.lendingRates) ? loan.lendingRates : (loan.lending_rates || []);
    if (!all.length) return [];
    const wantPurpose = answers.purpose === 'invest' ? /INVEST/ : /OWNER/;
    const wantRepay = answers.repayment === 'io' ? /INTEREST_ONLY/ : /PRINCIPAL/;
    const wantRate =
      answers.rateType === 'fixed'    ? /FIXED/
      : answers.rateType === 'variable' ? /VARIABLE|DISCOUNT|INTRODUCTORY/
      : null; // 'either' = any

    return all
      .filter((r) => wantPurpose.test(purpose(r)))
      .filter((r) => wantRepay.test(repay(r)))
      .filter((r) => !wantRate || wantRate.test(rateType(r)))
      .filter((r) => tierCovers(r.tiers, answers.lvr))
      .map((r, idx) => {
        const lvrLabel = describeTiers(r.tiers);
        const label = `${humanType(rateType(r))}${r.repaymentType ? ` · ${labelRepayment(r.repaymentType)}` : ''}${lvrLabel ? ` · ${lvrLabel}` : ''}${r.additionalValue ? ` · ${r.additionalValue}` : ''}`;
        return {
          // Stable key: rate + label so pin survives re-renders.
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
  }, [loan, answers]);

  const top3 = matches.slice(0, 3);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Answer five quick questions — we'll filter this loan's published rates to the options that actually apply to your situation.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Who is the loan for?">
          <ChoiceRow
            value={answers.purpose}
            onChange={(v) => set('purpose', v)}
            options={[
              { value: 'owner',  label: 'I\'ll live in it (owner-occupied)' },
              { value: 'invest', label: 'I\'ll rent it out (investment)' },
            ]}
          />
        </Field>

        <Field label="Repayment type">
          <ChoiceRow
            value={answers.repayment}
            onChange={(v) => set('repayment', v)}
            options={[
              { value: 'pi', label: 'Principal & interest' },
              { value: 'io', label: 'Interest only' },
            ]}
          />
        </Field>

        <Field label="Rate preference">
          <ChoiceRow
            value={answers.rateType}
            onChange={(v) => set('rateType', v)}
            options={[
              { value: 'variable', label: 'Variable' },
              { value: 'fixed',    label: 'Fixed' },
              { value: 'either',   label: 'Either' },
            ]}
          />
        </Field>

        <Field label={`Your LVR: ${answers.lvr}%`} hint="Loan ÷ property value. Lower LVR usually unlocks cheaper rates.">
          <input
            type="range" min="50" max="95" step="5"
            value={answers.lvr}
            onChange={(e) => set('lvr', Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 tabular-nums">
            <span>50%</span><span>95%</span>
          </div>
        </Field>
      </div>

      <Field label="First-home buyer?" hint="The CDR data doesn't tag rates as FHB-specific, but it's useful to surface what's available — many lenders offer grants and reduced LMI separately.">
        <ChoiceRow
          value={answers.fhb ? 'yes' : 'no'}
          onChange={(v) => set('fhb', v === 'yes')}
          options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
        />
        {answers.fhb && (
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded p-2 mt-2">
            <strong>Heads-up:</strong> ask the lender about First Home Guarantee, the First Home Owner Grant (state-based), and any LMI waiver at higher LVRs. These don't appear in the rate feed but may apply to your application.
          </p>
        )}
      </Field>

      {/* Results */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            {matches.length} matching rate option{matches.length === 1 ? '' : 's'}
          </h3>
          {matches.length > 3 && (
            <span className="text-xs text-gray-500">Showing top 3 by rate</span>
          )}
        </div>

        {top3.length === 0 ? (
          <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
            No published rates match those answers. Try widening your selection — or this lender may not offer that combination.
          </p>
        ) : (
          <ul className="space-y-2">
            {top3.map((m, i) => {
              const isPinned = pinnedKey === m.key;
              return (
                <li
                  key={m.key}
                  className={
                    'rounded-lg border p-3 transition-colors ' +
                    (isPinned
                      ? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-300'
                      : i === 0
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-gray-200 bg-white')
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{m.label}</p>
                      {m.additionalInfo && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1" title={m.additionalInfo}>
                          {m.additionalInfo}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <p className="text-lg font-bold text-gray-900">{formatPercent(m.rate)}</p>
                      {Number.isFinite(m.comparisonRate) && (
                        <p className="text-[11px] text-gray-500">{formatPercent(m.comparisonRate)} comp.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {isPinned ? (
                      <span className="text-[11px] text-blue-700 font-semibold">✓ Using this rate in the estimator</span>
                    ) : i === 0 ? (
                      <span className="text-[11px] text-emerald-700 font-medium">Cheapest match</span>
                    ) : <span />}

                    {onPin && !isPinned && (
                      <button
                        type="button"
                        onClick={() => onPin(m)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Use this rate →
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
