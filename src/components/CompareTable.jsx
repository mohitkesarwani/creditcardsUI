import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMinimumAnnualFee,
  formatValue,
  safeDisplay,
  parseCurrency,
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

const DiffIcon = () => (
  <svg
    className="w-3 h-3 text-accent"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9l2 2 4-4" />
  </svg>
);


function Row({ label, values }) {
  if (values.every((v) => v === undefined || v === null || v === '')) return null;
  const first = values[0];
  const diffs = values.map((v) => v !== first);
  const anyDiff = diffs.some(Boolean);
  return (
    <tr className="even:bg-gray-50 hover:bg-accent/5">
      <th className="text-left border px-3 py-2 bg-white sticky left-0 z-10 font-medium">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="border px-3 py-2 text-left max-w-xs">
          <span className="flex items-center gap-1">
            {anyDiff && diffs[i] && <DiffIcon />}
            {formatValue(label, safeDisplay(v, 'Not available'))}
          </span>
        </td>
      ))}
    </tr>
  );
}

function RateRow({ label, values }) {
  if (values.every((v) => v === undefined || v === null || v === '')) return null;
  const nums = values.map((v) => parseFloat(String(v).replace(/[^0-9.]/g, '')));
  const min = Math.min(...nums.filter((n) => !Number.isNaN(n)));
  return (
    <tr className="even:bg-gray-50 hover:bg-accent/5">
      <th className="text-left border px-3 py-2 bg-white sticky left-0 z-10 font-medium">
        {label}
      </th>
      {values.map((v, i) => {
        const num = nums[i];
        const highlight = !Number.isNaN(num) && num === min;
        return (
          <td
            key={i}
            className={`border px-3 py-2 text-left max-w-xs ${highlight ? 'bg-green-50' : ''}`}
          >
            {formatValue(label, safeDisplay(v, 'Not available'))}
          </td>
        );
      })}
    </tr>
  );
}

function CompareTable({ cards }) {
  const [sort, setSort] = useState({ by: 'annualFee', dir: 'asc' });
  const navigate = useNavigate();

  const sortedCards = useMemo(() => {
    const arr = [...cards];
    const getVal = (c) => {
      if (sort.by === 'interestRate') {
        return parseFloat(String(getPurchaseInterestRate(c)).replace(/[^0-9.]/g, '')) || 0;
      }
      if (sort.by === 'rewards') {
        return getRewardsValue(c) || 0;
      }
      return parseCurrency(c.annualFee ?? getMinimumAnnualFee(c)) || 0;
    };
    arr.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      return sort.dir === 'asc' ? av - bv : bv - av;
    });
    return arr;
  }, [cards, sort]);

  return (
    <div className="overflow-x-auto">
      <div className="p-2 flex gap-2 items-center bg-white border-b">
        <label className="text-sm">Sort by:</label>
        <select
          value={sort.by}
          onChange={(e) => setSort((s) => ({ ...s, by: e.target.value }))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="annualFee">Annual Fee</option>
          <option value="interestRate">Interest Rate</option>
          <option value="rewards">Rewards Value</option>
        </select>
        <button
          className="text-sm underline"
          onClick={() =>
            setSort((s) => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))
          }
        >
          {sort.dir === 'asc' ? '▲' : '▼'}
        </button>
      </div>
      <div className="inline-block min-w-full align-middle shadow-md rounded-lg border bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-3 sticky left-0 z-20 bg-gray-50"></th>
              {sortedCards.map((c) => (
                <th key={c.id} className="border px-4 py-3 bg-white text-center max-w-[12rem]">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={c.productImageUrl || c.cardArt?.[0]?.imageUri || '/radar.svg'}
                      alt={c.name}
                      className="h-12 object-contain"
                      onError={(e) => {
                        if (e.currentTarget.src !== '/radar.svg') {
                          e.currentTarget.src = '/radar.svg';
                        }
                      }}
                    />
                    <p className="font-medium text-sm truncate" title={c.name}>{c.name}</p>
                    <button
                      onClick={() => navigate(`/credit-cards/${c.id}`)}
                      className="btn btn-primary text-xs px-3 py-1"
                    >
                      Details
                    </button>
                    {c.applicationUrl && (
                      <a
                        href={c.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-accent text-white px-3 py-1 rounded text-xs"
                      >
                        Apply
                      </a>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        <tbody>
        <Row label="Brand" values={sortedCards.map((c) => c.brand)} />
        <Row
          label="Interest-Free Period"
          values={sortedCards.map((c) => getInterestFreePeriod(c) || 'Not Offered')}
        />
        <RateRow
          label="Purchase Interest Rate"
          values={sortedCards.map((c) => getPurchaseInterestRate(c))}
        />
        <Row
          label={<span title="Using your card to withdraw cash">Cash Advance Rate</span>}
          values={sortedCards.map((c) => getCashAdvanceRate(c))}
        />
        <Row
          label="Late Payment Fee"
          values={sortedCards.map((c) => getLatePaymentFee(c))}
        />
        <Row
          label={<span title="The rate that includes fees and interest">Comparison Rate</span>}
          values={sortedCards.map((c) => c.comparisonRate)}
        />
        <Row
          label="Annual Fee"
          values={sortedCards.map((c) => c.annualFee ?? getMinimumAnnualFee(c))}
        />
        <Row
          label="International Transaction Fee - Single Currency"
          values={sortedCards.map((c) => getInternationalFee(c, false))}
        />
        <Row
          label="International Transaction Fee - Multi Currency"
          values={sortedCards.map((c) => getInternationalFee(c, true))}
        />
        <Row
          label="Additional Card Fee"
          values={sortedCards.map((c) => getAdditionalCardFee(c))}
        />
        <Row
          label={<span title="Typical qualification criteria">Eligibility</span>}
          values={sortedCards.map((c) => c.eligibilityCriteria)}
        />
        <Row
          label="Rewards Program"
          values={sortedCards.map((c) => getRewardsProgram(c))}
        />
        <Row
          label="Digital Wallets"
          values={sortedCards.map((c) => getDigitalWallets(c).join(', '))}
        />
        <Row
          label="Insurance Offered"
          values={sortedCards.map((c) => {
            const list = getInsuranceTypes(c);
            return list.length > 3 ? list.slice(0, 3).join(', ') + '…' : list.join(', ');
          })}
        />
        <Row
          label="Cashback Offer"
          values={sortedCards.map((c) => getBonusOffer(c))}
        />
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareTable;
