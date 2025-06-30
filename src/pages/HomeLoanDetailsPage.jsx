import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMortgage } from '../api/residentialMortgages';
import { formatMoney, formatPercent, getMortgageFeatureTags, getTagColor } from '../utils.js';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';

function HomeLoanDetailsPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-accent underline mb-4 text-sm">
          &larr; Go Back
        </button>
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-2xl font-bold mb-1">{loan.name}</h2>
          <p className="text-gray-700 mb-4">{loan.bankName || loan.brandName}</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
            {rate && (
              <span>
                <span className="font-semibold">Rate:</span> {formatPercent(rate)}
              </span>
            )}
            {comparisonRate && (
              <span>
                <span className="font-semibold">Comparison:</span> {formatPercent(comparisonRate)}
              </span>
            )}
            {fees.map((f) => (
              <span key={f.name} className="flex items-center gap-1">
                <span className="font-semibold">{f.name}:</span> {formatMoney(f.amount)}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((t) => (
              <span key={t} className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)}`}>{t}</span>
            ))}
          </div>
          {loan.eligibility?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Eligibility</h4>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {loan.eligibility.map((e, i) => (
                  <li key={i}>{e.eligibilityType}</li>
                ))}
              </ul>
            </div>
          )}
          {loan.additionalInfo && (
            <p className="mb-4 whitespace-pre-line">{loan.additionalInfo}</p>
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
              <a href={loan.applicationUri} target="_blank" rel="noopener noreferrer" className="text-sm border border-accent text-accent rounded-md px-3 py-1 hover:bg-accent/10 transition">
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
