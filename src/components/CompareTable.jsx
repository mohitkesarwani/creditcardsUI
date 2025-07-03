import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';
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

const rowDefs = [
  { key: 'brand', label: 'Brand', fn: (c) => c.brand },
  {
    key: 'interestFree',
    label: 'Interest-Free Period',
    fn: (c) => getInterestFreePeriod(c) || 'Not Offered',
  },
  {
    key: 'purchaseRate',
    label: 'Purchase Interest Rate',
    fn: (c) => getPurchaseInterestRate(c),
    rate: true,
  },
  {
    key: 'cashAdvance',
    label: (
      <span title="Using your card to withdraw cash">Cash Advance Rate</span>
    ),
    fn: (c) => getCashAdvanceRate(c),
  },
  { key: 'lateFee', label: 'Late Payment Fee', fn: (c) => getLatePaymentFee(c) },
  {
    key: 'comparisonRate',
    label: (
      <span title="The rate that includes fees and interest">Comparison Rate</span>
    ),
    fn: (c) => c.comparisonRate,
  },
  {
    key: 'annualFee',
    label: 'Annual Fee',
    fn: (c) => c.annualFee ?? getMinimumAnnualFee(c),
  },
  {
    key: 'intlSingle',
    label: 'International Transaction Fee - Single Currency',
    fn: (c) => getInternationalFee(c, false),
  },
  {
    key: 'intlMulti',
    label: 'International Transaction Fee - Multi Currency',
    fn: (c) => getInternationalFee(c, true),
  },
  { key: 'addCard', label: 'Additional Card Fee', fn: (c) => getAdditionalCardFee(c) },
  {
    key: 'eligibility',
    label: <span title="Typical qualification criteria">Eligibility</span>,
    fn: (c) => c.eligibilityCriteria,
  },
  { key: 'rewardsProg', label: 'Rewards Program', fn: (c) => getRewardsProgram(c) },
  { key: 'wallets', label: 'Digital Wallets', fn: (c) => getDigitalWallets(c).join(', ') },
  {
    key: 'insurance',
    label: 'Insurance Offered',
    fn: (c) => {
      const list = getInsuranceTypes(c);
      return list.length > 3 ? list.slice(0, 3).join(', ') + '…' : list.join(', ');
    },
  },
  { key: 'cashback', label: 'Cashback Offer', fn: (c) => getBonusOffer(c) },
];

function Row({ label, values }) {
  if (values.every((v) => v === undefined || v === null || v === '')) return null;
  const first = values[0];
  return (
    <tr className="odd:bg-white even:bg-gray-50">
      <th className="text-left p-3 font-normal text-gray-600">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="text-left p-3 text-sm text-gray-700">
          {formatValue(label, safeDisplay(v, 'Not available'))}
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
    <tr className="odd:bg-white even:bg-gray-50">
      <th className="text-left p-3 font-normal text-gray-600">
        {label}
      </th>
      {values.map((v, i) => {
        const num = nums[i];
        const highlight = !Number.isNaN(num) && num === min;
        return (
          <td
            key={i}
            className={`text-left p-3 text-sm text-gray-700 ${highlight ? 'bg-green-50' : ''}`}
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
  const [isMobile, setIsMobile] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const { toggleCard } = useSelectedCards();

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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

  const rows = rowDefs.map((r) => {
    const values = sortedCards.map((c) => r.fn(c));
    return r.rate ? (
      <RateRow key={r.key} label={r.label} values={values} />
    ) : (
      <Row key={r.key} label={r.label} values={values} />
    );
  });

  const mobileView = (
    <div className="space-y-4 md:hidden">
      {sortedCards.map((c) => (
        <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center gap-3 p-4 border-b">
            <img
              src={
                c.productImageUrl ||
                c.cardArt?.[0]?.imageUri ||
                '/assets/image-not-available.svg'
              }
              alt={c.name}
              className="h-10 object-contain rounded-lg"
              onError={(e) => {
                if (e.currentTarget.src !== '/assets/image-not-available.svg') {
                  e.currentTarget.src = '/assets/image-not-available.svg';
                }
              }}
            />
            <p className="font-semibold flex-1" title={c.name}>{c.name}</p>
            <button onClick={() => toggleCard(c)} className="text-xs text-accent underline">
              Remove
            </button>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {rowDefs.map((r) => {
                const val = r.fn(c);
                if (val === 'Not Offered' || val === undefined || val === null || val === '') return null;
                return (
                  <tr key={r.key} className="border-t">
                    <th className="text-left px-4 py-2 w-1/2 font-normal text-gray-600">
                      {r.label}
                    </th>
                    <td className="px-4 py-2">{formatValue(r.label, safeDisplay(val, '–'))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  if (isMobile) return mobileView;

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm p-6">
      <div className="mb-4 flex gap-2 items-center">
        <label className="text-sm">Sort by:</label>
        <select
          value={sort.by}
          onChange={(e) => setSort((s) => ({ ...s, by: e.target.value }))}
          className="border rounded px-3 py-2 text-sm"
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
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="bg-gray-50 text-sm font-semibold p-3 text-left"></th>
              {sortedCards.map((c) => (
                <th key={c.id} className="bg-gray-50 text-sm font-semibold p-3 text-left border-t-4 border-blue-600">
                  <div
                    className="flex flex-col items-center gap-3 p-4 rounded-lg"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    <img
                      src={
                        c.productImageUrl ||
                        c.cardArt?.[0]?.imageUri ||
                        '/assets/image-not-available.svg'
                      }
                      alt={c.name}
                      className="h-12 object-contain rounded-lg"
                      onError={(e) => {
                        if (e.currentTarget.src !== '/assets/image-not-available.svg') {
                          e.currentTarget.src = '/assets/image-not-available.svg';
                        }
                      }}
                    />
                    <p className="font-semibold text-[1.1rem] leading-snug truncate" title={c.name}>{c.name}</p>
                    <button
                      onClick={() => navigate(`/credit-cards/${c.id}`)}
                      aria-label={`View details for ${c.name}`}
                      className="btn btn-primary text-xs px-3 py-1 hover:bg-accent/90"
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
            {rows.map((row, idx) => (isMobile && !showMore && idx >= 5 ? null : row))}
          </tbody>
          {isMobile && !showMore && (
            <tfoot className="block md:hidden">
              <tr>
                <td colSpan={sortedCards.length + 1} className="text-center py-2">
                  <button
                    onClick={() => setShowMore(true)}
                    className="text-xs text-accent underline"
                  >
                    + Show more
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default CompareTable;
