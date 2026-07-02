import React from 'react';
import { Link } from 'react-router-dom';

function H2({ children }) {
  return <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Privacy policy</h1>
      <p className="text-sm text-gray-500 mt-1">Last updated: 28 June 2026</p>

      <p className="mt-6 text-gray-700">
        This policy explains how RewardRadar (we, us) handles personal information collected
        through the Site, in accordance with the Australian Privacy Principles in the
        <em> Privacy Act 1988</em> (Cth).
      </p>

      <H2>1. What we collect</H2>
      <p className="text-gray-700">
        You can browse the Site without providing any personal information. We collect
        personal information only when you choose to submit it through the contact form.
        The information we collect in those cases is limited to: name, email address,
        topic, and the message you choose to send.
      </p>
      <p className="text-gray-700 mt-2">
        We <strong>do not</strong> collect income, balances, credit scores, account
        numbers, or any other financial information from you. We do not request
        identity documents. We do not run credit checks. Selecting a product, ticking
        the "compare" box, and filtering results all happen entirely in your browser
        and are not sent to us.
      </p>

      <H2>1a. Contact-form data — retention and access</H2>
      <p className="text-gray-700">
        Messages submitted via the contact form are emailed to our support inbox and
        retained for up to <strong>24 months</strong> for support and quality
        purposes, then deleted. Access is limited to RewardRadar staff handling your
        enquiry. We do not use contact-form data for marketing, do not add it to any
        mailing list, and do not share it with third parties (including issuers) unless
        you explicitly ask us to.
      </p>
      <p className="text-gray-700 mt-2">
        You can request a copy of the personal information we hold about you, or ask us
        to delete it, by emailing the support inbox. We will respond within 30 days.
      </p>

      <H2>2. Anonymous usage data</H2>
      <p className="text-gray-700">
        We may collect anonymous usage data such as page views, clicks on comparison
        cards, and aggregate counts of "likes" and "shares" against individual products.
        This data is not linked to your identity. We do not use third-party advertising
        cookies or tracking pixels by default.
      </p>

      <H2>3. How we use information</H2>
      <ul className="list-disc pl-6 text-gray-700 space-y-1">
        <li>To respond to enquiries you submit through the Site.</li>
        <li>To track aggregate engagement on listed products (likes, comments, shares) so other users see community signals.</li>
        <li>To improve the Site, fix bugs, and inform what data we surface next.</li>
      </ul>

      <H2>4. Disclosure to third parties</H2>
      <p className="text-gray-700">
        If you click an "Apply" link, you leave the Site and proceed to the issuer's
        website, which is governed by the issuer's own privacy policy. We do not transmit
        your personal information to issuers as part of that click-through.
      </p>
      <p className="text-gray-700 mt-2">
        Lead-form submissions may be forwarded to a CRM provider engaged by us to manage
        responses. We do not sell personal information to third parties.
      </p>

      <H2>5. Where data is stored</H2>
      <p className="text-gray-700">
        Personal information is stored in a managed Postgres database (Supabase) hosted in
        Australia. We apply reasonable technical and organisational measures to protect it
        against loss, misuse and unauthorised access.
      </p>

      <H2>6. Access and correction</H2>
      <p className="text-gray-700">
        You may request access to, correction of, or deletion of personal information we
        hold about you by emailing{' '}
        <a href="mailto:privacy@rewardradar.example" className="text-blue-600 hover:underline">
          privacy@rewardradar.example
        </a>.
        We will respond within 30 days.
      </p>

      <H2>7. Complaints</H2>
      <p className="text-gray-700">
        If you believe we have breached your privacy you can contact us at the email above
        in the first instance. If you are not satisfied with our response you may lodge a
        complaint with the Office of the Australian Information Commissioner (OAIC) at{' '}
        <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          oaic.gov.au
        </a>.
      </p>

      <H2>8. Changes to this policy</H2>
      <p className="text-gray-700">
        We may update this policy from time to time. The "Last updated" date at the top of
        the page indicates when the policy was last revised.
      </p>

      <Link to="/" className="inline-block mt-10 text-sm text-blue-600 hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
