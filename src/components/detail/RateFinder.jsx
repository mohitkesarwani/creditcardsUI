import React, { useMemo } from 'react';
import { formatPercent } from '../../utils.js';
import { findRateMatches } from '../../lib/findRateMatches.js';

// Wizard that asks the borrower a few questions and filters this loan's
// `lendingRates` JSONB to the matching subset, sorted cheapest-first.
//
// Answers state is owned by the parent (HomeLoanDetailsPage) so it survives
// tab switches AND so the parent can auto-pin the top match into the
// Repayment Estimator. Match-finding logic lives in `lib/findRateMatches.js`.

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

export default function RateFinder({ loan, answers, setAnswers, pinnedKey = null, onPin }) {
  // Cap LVR slider at the loan's published max LVR when present — picking
  // 95% on an 80%-cap loan would otherwise return 0 matches with no hint why.
  const lvrCap = Number.isFinite(loan?.max_lvr_percent) ? loan.max_lvr_percent : 95;
  const lvrFloor = 50;
  const sliderMax = Math.max(lvrFloor + 5, Math.min(95, lvrCap));

  const set = (k, v) => setAnswers((s) => ({ ...s, [k]: v }));

  const matches = useMemo(() => findRateMatches(loan, answers), [loan, answers]);
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

        <Field
          label={`Your LVR: ${answers.lvr}%`}
          hint={
            sliderMax < 95
              ? `This loan caps at ${sliderMax}% LVR — slider stops there.`
              : 'Loan ÷ property value. Lower LVR usually unlocks cheaper rates.'
          }
        >
          <input
            type="range" min={lvrFloor} max={sliderMax} step="5"
            value={answers.lvr}
            onChange={(e) => set('lvr', Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 tabular-nums">
            <span>{lvrFloor}%</span><span>{sliderMax}%</span>
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
