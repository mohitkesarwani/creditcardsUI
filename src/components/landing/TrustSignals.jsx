import React from 'react';

// Data-source provenance strip. Reassures users where numbers come from and
// keeps us honest about being general info, not advice.
export default function TrustSignals() {
  return (
    <section className="py-12 md:py-16 border-y border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-3 gap-6 items-start">
        <div>
          <div className="text-3xl font-bold text-gray-900 tabular-nums">100+</div>
          <p className="text-sm text-gray-600 mt-1">
            Australian issuers polled — the four major banks plus regionals, credit unions and neobanks.
          </p>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tabular-nums">CDR</div>
          <p className="text-sm text-gray-600 mt-1">
            Powered by the Consumer Data Right — the open-banking framework regulated by ACCC and Treasury.
          </p>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tabular-nums">$0</div>
          <p className="text-sm text-gray-600 mt-1">
            Free to use. We may receive a referral fee when you apply for a card through one of our links; this never changes the data we show.
          </p>
        </div>
      </div>
    </section>
  );
}
