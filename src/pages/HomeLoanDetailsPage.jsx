import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMortgage } from '../api/residentialMortgages';
import {
  formatMoney,
  formatPercent,
  getMortgageFeatureTags,
  getTagColor,
  normalizeMortgageFeature,
  filterProminentMortgageRates,
} from '../utils.js';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';

function HomeLoanDetailsPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRates, setShowAllRates] = useState(false);
  const { selected, toggleMortgage } = useSelectedMortgages();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMortgage(loanId);
        setLoan(data);
      } catch (err) {
        setError('Failed to load loan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanId]);

  if (loading) return <LoaderSkeleton rows={4} />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!loan) return <div className="p-4">Loan not found.</div>;

  const rate = loan.lendingRates?.[0]?.rate;
  const comparisonRate = loan.lendingRates?.[0]?.comparisonRate;
  const fees = loan.feesAndPricing?.fees || [];
  const tags = getMortgageFeatureTags(loan);
  const isSelected = selected.some((m) => m.id === loan.id);
  const lendingRates = loan.lendingRates || [];
  const prominentRates = useMemo(
    () => filterProminentMortgageRates(lendingRates),
    [lendingRates]
  );
  const displayRates = showAllRates ? lendingRates : prominentRates;
  const purposes = Array.from(
    new Set(lendingRates.map((r) => r.loanPurpose).filter(Boolean))
  );
  const repayments = Array.from(
    new Set(lendingRates.map((r) => r.repaymentType).filter(Boolean))
  );
  const rateTypes = Array.from(
    new Set(
      lendingRates
        .map((r) => r.rateType || r.lendingRateType)
        .filter(Boolean)
    )
  );
  const lvrValues = lendingRates
    .map((r) => parseFloat(r.lvr || r.loanToValueRatio))
    .filter((n) => !Number.isNaN(n));
  const maxLvr = lvrValues.length ? Math.max(...lvrValues) : null;

  const cleanedEligibility = useMemo(() => {
    if (!Array.isArray(loan.eligibility)) return [];
    const list = loan.eligibility
      .filter(
        (e) =>
          e &&
          e.eligibilityType &&
          e.eligibilityType.trim() !== '' &&
          e.eligibilityType.toLowerCase() !== 'other'
      )
      .map((e) =>
        e.additionalValue
          ? `${e.eligibilityType} - ${e.additionalValue}`
          : e.eligibilityType
      );
    return Array.from(new Set(list));
  }, [loan.eligibility]);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-accent underline mb-4 text-sm">
          &larr; Go Back
        </button>
        <div className="bg-white rounded-xl shadow p-4 md:p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{loan.name}</h2>
            <p className="text-gray-700 mb-2">{loan.bankName || loan.brandName}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)}`}
                >
                  {t}
                </span>
              ))}
            </div>
            {loan.description && <p className="text-sm mb-2">{loan.description}</p>}
            {loan.additionalInfo && (
              <p className="text-sm whitespace-pre-line mb-2">{loan.additionalInfo}</p>
            )}
          </div>

          <section>
            <h3 className="font-semibold mb-2">Interest &amp; Comparison Rates</h3>
            {lendingRates.length ? (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">Type</th>
                    <th className="border px-2 py-1 text-left">Rate</th>
                    <th className="border px-2 py-1 text-left">Comparison</th>
                    <th className="border px-2 py-1 text-left">Purpose</th>
                    <th className="border px-2 py-1 text-left">Repayment</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRates.map((r, i) => (
                    <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="border px-2 py-1">
                        {r.additionalValue && /fixed/i.test(r.rateType || r.lendingRateType)
                          ? `${r.rateType || r.lendingRateType} – ${r.additionalValue}`
                          : r.rateType || r.lendingRateType || '–'}
                      </td>
                      <td className="border px-2 py-1">
                        {r.rate ? formatPercent(r.rate) : '–'}
                      </td>
                      <td className="border px-2 py-1">
                        {r.comparisonRate ? formatPercent(r.comparisonRate) : '–'}
                      </td>
                      <td className="border px-2 py-1">{r.loanPurpose || '–'}</td>
                      <td className="border px-2 py-1">{r.repaymentType || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lendingRates.length > prominentRates.length && (
                <button
                  className="mt-2 text-sm text-accent underline"
                  onClick={() => setShowAllRates((v) => !v)}
                >
                  {showAllRates ? 'Hide All Rate Options' : 'View All Rate Options'}
                </button>
              )}
            ) : (
              <p className="text-sm text-gray-600">Not specified.</p>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-2">Loan Features</h3>
            {loan.features?.length ? (
              <ul className="list-disc ml-5 space-y-1 text-sm">
                {loan.features.map((f, i) => (
                  <li key={i}>
                    {normalizeMortgageFeature(f.featureType)}
                    {f.additionalValue ? ` - ${f.additionalValue}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">Not specified.</p>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-2">Fees &amp; Charges</h3>
            {fees.length ? (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">Fee</th>
                    <th className="border px-2 py-1 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f, i) => (
                    <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="border px-2 py-1">{f.name || `Fee ${i + 1}`}</td>
                      <td className="border px-2 py-1">{formatMoney(f.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-600">Not specified.</p>
            )}
          </section>

          {cleanedEligibility.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {cleanedEligibility.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </section>
          )}

          {(purposes.length || repayments.length || rateTypes.length || maxLvr) && (
            <section className="space-y-2">
              {purposes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Available Purposes</h4>
                  <div className="flex flex-wrap gap-1">
                    {purposes.map((p) => (
                      <span key={p} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {repayments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Repayment Options</h4>
                  <div className="flex flex-wrap gap-1">
                    {repayments.map((r) => (
                      <span key={r} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {rateTypes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Rate Types</h4>
                  <div className="flex flex-wrap gap-1">
                    {rateTypes.map((r) => (
                      <span key={r} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {maxLvr && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Max LVR</h4>
                  <p className="text-sm">{formatPercent(maxLvr)}</p>
                </div>
              )}
            </section>
          )}

          {(loan.additionalInfoUri || loan.productGuideUri) && (
            <div>
              <a
                href={loan.additionalInfoUri || loan.productGuideUri}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline mt-2"
              >
                Download Product Guide
              </a>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isSelected ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Selected
                </span>
                <button onClick={() => toggleMortgage(loan)} className="text-xs text-accent underline">
                  Deselect
                </button>
              </div>
            ) : (
              <button onClick={() => toggleMortgage(loan)} className="text-sm border border-accent text-accent rounded-md px-3 py-1 hover:bg-accent/10 transition">
                Compare
              </button>
            )}
            {loan.applicationUri && (
              <a
                href={loan.applicationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm border border-accent text-accent rounded-md px-3 py-1 hover:bg-accent/10 transition"
              >
                Apply
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeLoanDetailsPage;
