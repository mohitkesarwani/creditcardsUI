import React from 'react';
import { Link } from 'react-router-dom';
import { AUTHORS, PRIMARY_SOURCES } from '../lib/authors.js';
import JsonLd, { personSchema } from '../components/JsonLd.jsx';

// Editorial Standards page. Required E-E-A-T artefact for any site
// publishing finance content. Google's quality raters look for: who runs
// the site, what their qualifications are, how content is reviewed, what
// the corrections policy is, and who to contact about issues.
//
// This page is the single source of truth for "how we operate". It's
// linked from the Footer, the FAQ "still have a question?" block, and
// shown to the user the first time they hit a long-form content article.

function H2({ children, id }) {
  return <h2 id={id} className="text-xl font-bold text-ink-900 mt-10 mb-3 scroll-mt-20">{children}</h2>;
}

const LAST_UPDATED = '28 June 2026';

export default function EditorialStandardsPage() {
  const editorial = AUTHORS['editorial-team'];

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--surface-subtle))' }}>
      <JsonLd id="schema-org-editorial-person" schema={personSchema('editorial-team')} />

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.16em] text-brand-700 font-bold mb-2">Editorial standards</p>
        <h1 className="text-display-sm md:text-display font-bold text-ink-900 tracking-tighter-2 mb-3">
          How RewardRadar writes, sources and corrects its content.
        </h1>
        <p className="text-lg text-ink-600 leading-relaxed">
          A working document on the editorial approach — who writes what, where we get our data,
          what we'll do when we get it wrong. Designed to be read by humans, search-engine
          quality raters and language models.
        </p>
        <p className="text-sm text-ink-500 mt-2">Last updated: {LAST_UPDATED}</p>

        <H2 id="who">Who writes the content</H2>
        <p>
          Articles and FAQ entries are written by the <strong>{editorial.name}</strong> and
          reviewed by the founder before publication. We are actively hiring a Head of
          Editorial with a financial-journalism or licensed-financial-advice background to
          take over editorial responsibility — see <Link to="/contact" className="text-brand-700 hover:underline">Contact</Link> if
          that's you.
        </p>
        <p className="mt-2">
          We do not use anonymous bylines, pseudonyms, or AI-only generated content. AI
          tools may assist with research and first drafts; every published piece is reviewed,
          edited and signed off by a named human before going live.
        </p>

        <H2 id="sources">Where our data comes from</H2>
        <p>Every product on the site is sourced from the issuer's public Consumer Data Right (CDR) endpoint — the same machine-readable feed banks are required to publish under federal regulation. For commentary, statistics and regulatory context we cite primary sources only:</p>
        <ul className="mt-3 space-y-2">
          {Object.entries(PRIMARY_SOURCES).map(([key, s]) => (
            <li key={key} className="flex flex-col">
              <a href={s.url} className="text-brand-700 hover:underline font-medium" rel="noopener noreferrer">
                {s.name}
              </a>
              <span className="text-sm text-ink-600">{s.useFor}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          We don't cite blog posts, social media, AI-generated content, or competitor comparison
          sites as sources for factual claims. If we reference another site, it's a hyperlink for
          the reader's benefit — not a citation for a fact.
        </p>

        <H2 id="freshness">When we update content</H2>
        <p>
          Product data refreshes daily against the CDR feed. Each page shows a "Data refreshed"
          badge sourced from the underlying record's <code>updated_at</code> timestamp.
        </p>
        <p className="mt-2">Long-form articles carry a "Last updated" date in the byline. We review:</p>
        <ul className="mt-2 ml-5 list-disc">
          <li>FAQ entries every 6 months, or sooner when the underlying regulation changes</li>
          <li>Legal pages (Privacy, Terms) every 12 months</li>
          <li>Long-form explainers when the cited primary source updates</li>
        </ul>

        <H2 id="independence">Independence</H2>
        <p>
          RewardRadar is independently owned, not affiliated with any bank, mutual or non-bank
          lender. Our editorial content (FAQ entries, explainers, "how it works" copy) is
          written without involvement from any issuer. We don't accept editorial submissions
          from issuers and don't allow issuers to review or approve our copy before publication.
        </p>
        <p className="mt-2">
          We may receive a referral fee when a user clicks through and successfully opens an
          account at an issuer. The fee is the same regardless of which product you pick and
          does not affect the comparison data, the ranking, or which products we list. See
          <Link to="/how-we-make-money" className="text-brand-700 hover:underline ml-1">How we make money</Link> for the
          full breakdown.
        </p>

        <H2 id="no-advice">What we do NOT do</H2>
        <ul className="mt-2 ml-5 list-disc">
          <li><strong>We do not provide financial product advice.</strong> Nothing on the site is personal advice — we don't know your circumstances and aren't licensed to assess them.</li>
          <li><strong>We do not recommend specific products.</strong> Our wizards and filters return all matching options, never one "best for you".</li>
          <li><strong>We do not collect personal financial information.</strong> No income, no balances, no credit checks, no identity documents.</li>
          <li><strong>We do not sell user data.</strong> Ever.</li>
          <li><strong>We do not host application forms.</strong> Every "Apply now" button goes directly to the issuer's own site.</li>
        </ul>

        <H2 id="corrections">Corrections policy</H2>
        <p>
          If you spot an error — wrong rate, missing product, factually incorrect statement
          — email us via the <Link to="/contact" className="text-brand-700 hover:underline">Contact page</Link>. We aim
          to acknowledge within 2 business days and either correct or explain within 5
          business days. Significant corrections are logged with a dated note on the affected
          page.
        </p>

        <H2 id="contact">Editorial complaints + responsible disclosure</H2>
        <p>
          Editorial complaints, requests for source verification, and responsible-disclosure
          reports (security issues, privacy concerns) can be sent to the same contact form.
          We do not retaliate against good-faith reporters.
        </p>

        <div className="mt-12 surface p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-700">Have feedback on these standards?</p>
            <p className="text-xs text-ink-500 mt-0.5">We update this page when our process changes.</p>
          </div>
          <Link to="/contact" className="btn btn-primary text-sm">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
