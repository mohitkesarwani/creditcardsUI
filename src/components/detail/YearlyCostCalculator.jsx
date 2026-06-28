import React, { useMemo, useState } from 'react';
import {
  formatMoneyWhole,
  getInternationalFee,
  getCashAdvanceRate,
  getLatePaymentFee,
  parseCurrency,
} from '../../utils.js';

// Usage-profile-based cost estimator for credit cards.
//
// The old version asked "how much would carrying a balance cost over a year"
// — but that's a question most users aren't asking and the answer overstates
// the cost for the typical pay-in-full cardholder. This version flips the
// model: the user ticks how they'll actually use the card and we sum the
// real fees from the bank's data.
//
// Default state = "pay in full" → just the annual fee. Toggles reveal extras.

const fxRate = (card) => {
  // Foreign-transaction fee is published as a flat $ amount on some cards and
  // as a percent on others. Try to pull a percent first.
  const fees = card.fees || [];
  const candidate = fees.find(
    (f) =>
      /foreign|overseas|international/i.test(f?.name || '') ||
      /foreign|overseas|international/i.test(f?.additionalInfo || ''),
  );
  if (!candidate) return null;

  // Try parsing as percent first ("3.5%" in additionalInfo)
  const pctMatch = (candidate.additionalInfo || candidate.name || '').match(/(\d+(?:\.\d+)?)\s*%/);
  if (pctMatch) return { pct: Number(pctMatch[1]) / 100, flat: null };

  // Else a flat amount
  const flat = parseCurrency(candidate.amount);
  return Number.isFinite(flat) ? { pct: null, flat } : null;
};

export default function YearlyCostCalculator({ card }) {
  const [includes, setIncludes] = useState({
    fullPay: true,
    carry: false,
    overseas: false,
    cashAdv: false,
    late: false,
  });
  const [carryBalance, setCarryBalance] = useState(2_000);
  const [overseasMonth, setOverseasMonth] = useState(300);
  const [cashAdvYear, setCashAdvYear] = useState(500);
  const [lateTimes, setLateTimes] = useState(1);

  const toggle = (k) => setIncludes((s) => ({ ...s, [k]: !s[k] }));

  const annualFee = card?.annualFeeNumber ?? null;
  const purchaseRate = card?.interestRateNumber ?? null;
  const cashAdvRate = parseRate(getCashAdvanceRate(card));
  const lateFee = parseCurrency(getLatePaymentFee(card));
  const fx = fxRate(card);

  const items = useMemo(() => {
    const list = [];
    if (annualFee !== null) {
      list.push({ key: 'fee', label: 'Annual fee', value: annualFee });
    }
    if (includes.carry && purchaseRate && carryBalance > 0) {
      list.push({
        key: 'interest',
        label: `Interest on ~${formatMoneyWhole(carryBalance)} avg balance @ ${(purchaseRate * 100).toFixed(2)}%`,
        value: carryBalance * purchaseRate,
        tone: 'warning',
      });
    }
    if (includes.overseas && fx && overseasMonth > 0) {
      const yearly = overseasMonth * 12;
      const cost = fx.pct ? yearly * fx.pct : (fx.flat || 0) * 12;
      list.push({
        key: 'fx',
        label: fx.pct
          ? `Foreign transactions (${formatMoneyWhole(overseasMonth)}/mo × ${(fx.pct * 100).toFixed(1)}%)`
          : `Foreign-transaction fees (${fx.flat ? `$${fx.flat}/txn` : ''})`,
        value: cost,
      });
    }
    if (includes.cashAdv && cashAdvRate && cashAdvYear > 0) {
      // Rough: assume avg balance = half the yearly withdrawal amount, charged for half a year on average
      const interest = cashAdvYear * 0.5 * cashAdvRate * 0.5;
      list.push({
        key: 'cashadv',
        label: `Cash advance interest (~${formatMoneyWhole(cashAdvYear)}/yr @ ${(cashAdvRate * 100).toFixed(2)}%)`,
        value: interest,
        tone: 'warning',
      });
    }
    if (includes.late && lateFee && lateTimes > 0) {
      list.push({
        key: 'late',
        label: `Late payment fees (${lateTimes}× per year)`,
        value: lateFee * lateTimes,
        tone: 'warning',
      });
    }
    return list;
  }, [annualFee, purchaseRate, cashAdvRate, lateFee, fx, includes, carryBalance, overseasMonth, cashAdvYear, lateTimes]);

  const total = items.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">
        Tick what applies to you. We'll sum the real fees this card publishes.
      </p>

      <ul className="space-y-2">
        <ToggleRow
          checked={includes.fullPay && !includes.carry}
          onChange={() => {
            setIncludes((s) => ({ ...s, fullPay: true, carry: false }));
          }}
          label="Pay my balance in full each month"
          hint="The typical case — no interest charged."
          disabled={includes.carry}
        />

        <ToggleRow
          checked={includes.carry}
          onChange={() => toggle('carry')}
          label="Carry a balance some months"
          warning
        >
          {includes.carry && (
            <Slider
              label="Average balance carried"
              value={carryBalance}
              setValue={setCarryBalance}
              min={0} max={10000} step={250}
              format={formatMoneyWhole}
            />
          )}
        </ToggleRow>

        {fx && (
          <ToggleRow
            checked={includes.overseas}
            onChange={() => toggle('overseas')}
            label="Use it overseas"
          >
            {includes.overseas && (
              <Slider
                label="Monthly overseas spend"
                value={overseasMonth}
                setValue={setOverseasMonth}
                min={0} max={3000} step={50}
                format={formatMoneyWhole}
              />
            )}
          </ToggleRow>
        )}

        {cashAdvRate && (
          <ToggleRow
            checked={includes.cashAdv}
            onChange={() => toggle('cashAdv')}
            label="Take cash advances"
            warning
          >
            {includes.cashAdv && (
              <Slider
                label="Cash withdrawn per year"
                value={cashAdvYear}
                setValue={setCashAdvYear}
                min={0} max={5000} step={100}
                format={formatMoneyWhole}
              />
            )}
          </ToggleRow>
        )}

        {lateFee && (
          <ToggleRow
            checked={includes.late}
            onChange={() => toggle('late')}
            label="Sometimes pay late"
            warning
          >
            {includes.late && (
              <Stepper
                label="Times per year"
                value={lateTimes}
                setValue={setLateTimes}
                min={0} max={6}
              />
            )}
          </ToggleRow>
        )}
      </ul>

      {/* Total */}
      <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
        {items.map((r) => (
          <li key={r.key} className="px-3 py-2 flex items-center justify-between text-sm">
            <span className={r.tone === 'warning' ? 'text-amber-800' : 'text-gray-600'}>{r.label}</span>
            <span className={`tabular-nums font-medium ${r.tone === 'warning' ? 'text-amber-800' : 'text-gray-800'}`}>
              {formatMoneyWhole(r.value)}
            </span>
          </li>
        ))}
        <li className="px-3 py-2.5 flex items-center justify-between bg-gray-50">
          <span className="text-sm font-semibold text-gray-700">Estimated yearly cost</span>
          <span className="text-base font-bold text-gray-900 tabular-nums">{formatMoneyWhole(total)}</span>
        </li>
      </ul>

      {/* Behavioural warning when carry is on — this is where rewards-card users lose money */}
      {includes.carry && (card.tags || []).some((t) => /reward|point/i.test(t)) && (
        <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 leading-snug">
          <strong>Heads-up:</strong> rewards cards are designed for cardholders who pay in full each month.
          If you carry a balance long-term, the interest usually outweighs the rewards earned — a low-rate card may cost you less overall.
        </p>
      )}
    </div>
  );
}

function ToggleRow({ checked, onChange, label, hint, warning, disabled, children }) {
  return (
    <li className={`rounded-lg border p-2.5 ${checked ? (warning ? 'border-amber-200 bg-amber-50/50' : 'border-blue-200 bg-blue-50/40') : 'border-gray-200'}`}>
      <label className={`flex items-start gap-2 cursor-pointer ${disabled ? 'opacity-60' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="mt-0.5 accent-blue-600"
        />
        <span className="min-w-0 flex-1">
          <span className="text-sm text-gray-800 font-medium">{label}</span>
          {hint && <span className="block text-[11px] text-gray-500">{hint}</span>}
        </span>
      </label>
      {children && <div className="mt-2 pl-6">{children}</div>}
    </li>
  );
}

function Slider({ label, value, setValue, min, max, step, format }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-900 tabular-nums">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
}

function Stepper({ label, value, setValue, min, max }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          className="w-6 h-6 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
        >−</button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => setValue(Math.min(max, value + 1))}
          className="w-6 h-6 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
        >+</button>
      </div>
    </div>
  );
}

// Helper: rate strings come in as "0.2099" or "20.99%". Normalise to decimal.
function parseRate(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n)) return null;
  return n > 1 ? n / 100 : n;
}
