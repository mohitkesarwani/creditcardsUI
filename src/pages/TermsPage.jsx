import React from 'react';
import { Link } from 'react-router-dom';

// Generic terms of use suitable for an Australian online credit-comparison
// site. Not legal advice — review with counsel before going live in a
// commercial setting.

function H2({ children }) {
  return <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h2>;
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Terms of use</h1>
      <p className="text-sm text-gray-500 mt-1">Last updated: 28 June 2026</p>

      <p className="mt-6 text-gray-700">
        These terms govern your use of the RewardRadar website (the "Site"). By using the
        Site you agree to these terms. If you do not agree, please do not use the Site.
      </p>

      <H2>1. General information only</H2>
      <p className="text-gray-700">
        Information on the Site is general in nature. It is not financial product advice,
        is not tailored to your personal objectives, financial situation or needs, and
        should not be relied on as the sole basis for any decision. Before applying for any
        credit product, read the issuer's Product Disclosure Statement (PDS) and Target
        Market Determination (TMD). If you are unsure whether a product is right for you,
        consult a licensed financial adviser.
      </p>

      <H2>2. Accuracy of information</H2>
      <p className="text-gray-700">
        We source product data from each issuer's public Consumer Data Right (CDR)
        endpoint. While we make reasonable efforts to keep data current, rates, fees and
        product features can change without notice and may be up to 24 hours out of date.
        You should always confirm rates, fees and features directly with the issuer before
        applying.
      </p>

      <H2>3. Comparison rates</H2>
      <p className="text-gray-700">
        Comparison rates shown (where available) are calculated by the issuer based on a
        prescribed loan amount and term. The comparison rate is true only for the examples
        given and may not include all fees and charges. Different terms, fees or other loan
        amounts might result in a different comparison rate.
      </p>

      <H2>4. Commissions and sponsored placements</H2>
      <p className="text-gray-700">
        RewardRadar may receive a commission from some issuers when you apply for or open a
        product (credit card, home loan or deposit) through links on this Site. The fee does
        not change which products we list, the order in which non-sponsored products appear,
        or the data we present. Sponsored products are clearly labelled. See{' '}
        <Link to="/how-we-make-money" className="text-blue-600 hover:underline">
          How we make money
        </Link>
        {' '}for the full disclosure.
      </p>

      <H2>5. No warranty</H2>
      <p className="text-gray-700">
        The Site is provided "as is" without any warranty, express or implied. To the
        extent permitted by law, RewardRadar excludes all liability for any loss or damage
        arising from your use of the Site or reliance on its contents.
      </p>

      <H2>6. Third-party links</H2>
      <p className="text-gray-700">
        The Site contains links to third-party websites operated by credit-card issuers
        and other providers. We do not control or endorse those websites and are not
        responsible for their content or practices.
      </p>

      <H2>7. Intellectual property</H2>
      <p className="text-gray-700">
        All content on the Site (other than third-party trademarks and product details
        published by issuers) is owned by RewardRadar or its licensors. You may view and
        print pages for personal, non-commercial use; you may not reproduce or
        redistribute content without our written consent.
      </p>

      <H2>8. Changes to these terms</H2>
      <p className="text-gray-700">
        We may update these terms from time to time. Continued use of the Site after
        changes are posted constitutes acceptance of the revised terms.
      </p>

      <H2>9. Contact</H2>
      <p className="text-gray-700">
        Questions about these terms can be sent to{' '}
        <a href="mailto:support@rewardradar.example" className="text-blue-600 hover:underline">
          support@rewardradar.example
        </a>.
      </p>

      <Link to="/" className="inline-block mt-10 text-sm text-blue-600 hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
