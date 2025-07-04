import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMortgage } from '../api/residentialMortgages';
import {
  formatMoney,
  formatPercent,
  getMortgageFeatureTags,
  normalizeMortgageFeature,
  filterProminentMortgageRates,
} from '../utils.js';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import LoanRepaymentCalculator from '../components/LoanRepaymentCalculator.jsx';
import FeatureTags from '../components/FeatureTags.tsx';
import SocialStats from '../components/SocialStats.tsx';
import ReviewsSection from '../components/ReviewsSection.tsx';
import useEngagement from '../hooks/useEngagement.ts';

function calcRepayments(amount, rate, years) {
  const r = parseFloat(rate);
  if (Number.isNaN(r)) return null;
  const monthly = r / 100 / 12;
  const n = years * 12;
  const payment = (amount * monthly) / (1 - Math.pow(1 + monthly, -n));
  return { monthly: payment, total: payment * n };
}

function Section({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex justify-between items-center w-full cursor-pointer"
        aria-expanded={open}
      >
        <h3 className="font-semibold">{title}</h3>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      <div className={`${open ? 'block' : 'hidden'} mt-2 text-sm`}>{children}</div>
    </div>
  );
}

function HomeLoanDetailsPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRates, setShowAllRates] = useState(false);
  const [preview, setPreview] = useState({ monthly: null, total: null, costPerDollar: null });
  const { selected, toggleMortgage } = useSelectedMortgages();
  const { data: engagement, isLoading: engagementLoading, like, share, review } = useEngagement(loanId);

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

  const lendingRates = loan?.lendingRates || [];
  const prominentRates = useMemo(
    () => filterProminentMortgageRates(lendingRates),
    [lendingRates]
  );
  const cleanedEligibility = useMemo(() => {
    if (!Array.isArray(loan?.eligibility)) return [];
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
  }, [loan]);

  if (loading) return <LoaderSkeleton rows={4} />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!loan) return <div className="p-4">Loan not found.</div>;

  const rateRaw = loan.lendingRates?.[0]?.rate;
  const comparisonRateRaw = loan.lendingRates?.[0]?.comparisonRate;
  const rate = rateRaw ? parseFloat(rateRaw) : null;
  const comparisonRate = comparisonRateRaw
    ? parseFloat(comparisonRateRaw)
    : null;
  // Convert values less than 1 from decimal (e.g. 0.0624) to percentage form
  const ratePercent = rate !== null ? (rate <= 1 ? rate * 100 : rate) : null;
  const comparisonRatePercent =
    comparisonRate !== null ? (comparisonRate <= 1 ? comparisonRate * 100 : comparisonRate) : null;
  const fees = loan.feesAndPricing?.fees || [];
  const tags = getMortgageFeatureTags(loan);
  const isSelected = selected.some((m) => m.id === loan.id);
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


  const bumpInfo = calcRepayments(
    150000,
    ratePercent !== null ? ratePercent + 1 : null,
    30
  );

  const setupFee = fees.find((f) => /(establishment|application|setup)/i.test(f.name || ''));
  const ongoingFee = fees.find((f) => /(ongoing|monthly|annual|service)/i.test(f.name || ''));

  const featureLabels = ['Offset', 'Redraw', 'Extra Repayments', 'Digital Access', 'Cashback'];
  const featureSet = new Set(
    loan.features?.map((f) => normalizeMortgageFeature(f.featureType)) || []
  );

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-blue-600 underline mb-4 text-sm">
          &larr; Go Back
        </button>
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="font-bold" style={{ fontSize: '1.5em' }}>
              {loan.bankName || loan.brandName} – {loan.name}
            </h2>
            <p className="text-xs text-gray-500">Last Updated: July 01, 2025, 03:55 PM AEST</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="font-semibold">Interest Type:</span>{' '}
                {rateTypes[0] || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Rate:</span>{' '}
                {ratePercent ? formatPercent(ratePercent) : 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Comparison:</span>
                {comparisonRatePercent ? formatPercent(comparisonRatePercent) : 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Loan Term:</span> Up to 30 years
              </div>
          </div>
        </div>

        <LoanRepaymentCalculator rate={ratePercent} onChange={setPreview} />

        <Section title="Estimated Cost (Preview)">
            {preview.monthly !== null ? (
              <div className="grid grid-cols-2 gap-2">
                <p>Monthly Repayment: {formatMoney(preview.monthly)}</p>
                <p>Total Repayment: {formatMoney(preview.total)}</p>
                <p className="col-span-2 text-xs text-gray-600">
                  Cost per $1 borrowed: {formatMoney(preview.costPerDollar)}
                </p>
                <p className="col-span-2 text-xs text-gray-600">
                  Estimate based on standard loan assumptions
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Not Available</p>
            )}
          </Section>

          <Section title="Loan Features">
            <FeatureTags tags={featureLabels} className="mt-2" />
          </Section>

          <Section title="Fees & Charges">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <th className="border px-2 py-1 text-left">Setup Fee</th>
                  <td className="border px-2 py-1">{setupFee ? formatMoney(setupFee.amount) : 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-2 py-1 text-left">Ongoing Fee</th>
                  <td className="border px-2 py-1">{ongoingFee ? formatMoney(ongoingFee.amount) : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {cleanedEligibility.length > 0 && (
            <Section title="Eligibility Criteria">
              <ul className="list-disc ml-5 text-sm space-y-1">
                {cleanedEligibility.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Helpful Insights">
            {preview.monthly !== null && bumpInfo ? (
              <div className="space-y-1 text-sm">
                <p>
                  If the rate increases by 1%, your monthly repayment could be around{' '}
                  {formatMoney(bumpInfo.monthly)}.
                </p>
                {featureSet.has('Extra Repayments') && (
                  <p>You can repay faster by making extra payments when possible.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Not Available</p>
            )}
          </Section>

          {(purposes.length || repayments.length || rateTypes.length || maxLvr) && (
            <Section title="Available Options">
              {purposes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Purposes</h4>
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
                  <h4 className="font-semibold text-sm mb-1">Repayments</h4>
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
            </Section>
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

          <SocialStats
            likes={engagement?.likes ?? 0}
            comments={engagement?.comments ?? 0}
            shares={engagement?.shares ?? 0}
            rating={engagement?.rating ?? 0}
            loading={engagementLoading && !engagement}
            onLike={() => like.mutate()}
            onShare={() => share.mutate()}
            productId={loanId}
            productType="home-loans"
          />

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
              <button
                onClick={() => toggleMortgage(loan)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2 transition-all duration-300 ease-in-out"
              >
                Compare
              </button>
            )}
            {loan.applicationUri && (
              <a
                href={loan.applicationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2 transition-all duration-300 ease-in-out"
              >
                Apply
              </a>
            )}
          </div>
          {engagement && (
            <ReviewsSection reviews={engagement.reviews} onAdd={(r) => review.mutate(r)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeLoanDetailsPage;
