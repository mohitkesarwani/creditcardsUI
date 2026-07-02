// Authors / editors of content on the site. E-E-A-T (Experience, Expertise,
// Authoritativeness, Trustworthiness) compliance — Google rates finance
// content (YMYL) much more harshly without identifiable, credentialed
// authors. The September 2025 Search Quality Rater Guidelines update +
// March 2026 Core Update both tightened this; YMYL content correlation
// with E-E-A-T signals is now ~24%.
//
// Each author should have:
//   - real name + verifiable bio
//   - credentials (degree, certifications)
//   - sameAs URLs (LinkedIn, personal site) — strengthens identity
//   - a portrait (data-uri or hosted image)
//
// Until we hire a named editor (Phase 1 of [[BUSINESS-PLAN/07-Roadmap.md]]),
// the editorial responsibility sits with the founder. This MUST be replaced
// before publishing any long-form content article — placeholder bios fail
// the E-E-A-T sniff test.

export const AUTHORS = {
  'editorial-team': {
    id: 'editorial-team',
    name: 'RewardRadar Editorial Team',
    role: 'Editorial',
    bio: `The RewardRadar editorial team writes plain-English explainers about
Australian banking products. We don't recommend specific products. Every
article cites a primary source (RBA, ASIC, APRA, ABS or the issuer's own PDS)
and is updated when the underlying data changes.`,
    sameAs: [
      'https://www.linkedin.com/company/rewardradar',
    ],
    photoUrl: null,
  },
  // Placeholder for the named editor we'll hire in Phase 1.
  // Until then, do not assign articles to a fictional person.
  'placeholder-editor': {
    id: 'placeholder-editor',
    name: 'TO BE HIRED — Named Editor',
    role: 'Head of Editorial (Pending)',
    bio: 'We are hiring a Head of Editorial with a financial journalism or licensed financial-advice background. Until then, articles are bylined "RewardRadar Editorial Team" and reviewed by the founder.',
    sameAs: [],
    photoUrl: null,
  },
};

export const ORG_INFO = {
  legalName: 'RewardRadar Pty Ltd',
  tradingName: 'RewardRadar',
  abn: 'XX XXX XXX XXX (registration pending)',
  url: 'https://rewardradar.com.au',
  logoUrl: 'https://rewardradar.com.au/radar.svg',
  contactEmail: 'hello@rewardradar.com.au',
  // sameAs — anchors brand identity for Knowledge Graph
  sameAs: [
    'https://www.linkedin.com/company/rewardradar',
  ],
  founded: '2026',
  jurisdiction: 'Australia',
};

// Authoritative primary sources we cite across the site.
// Use these for any factual claim about Australian banking / regulation.
export const PRIMARY_SOURCES = {
  RBA: {
    name: 'Reserve Bank of Australia',
    url: 'https://www.rba.gov.au',
    useFor: 'Cash rate history, household credit statistics, payment-system data',
  },
  ASIC: {
    name: 'Australian Securities and Investments Commission',
    url: 'https://www.asic.gov.au',
    useFor: 'Regulatory guides, enforcement, comparison-rate warnings',
  },
  APRA: {
    name: 'Australian Prudential Regulation Authority',
    url: 'https://www.apra.gov.au',
    useFor: 'Bank statistics, prudential standards, deposit data',
  },
  ABS: {
    name: 'Australian Bureau of Statistics',
    url: 'https://www.abs.gov.au',
    useFor: 'Household income, mortgage stress, financial-product penetration',
  },
  CDR: {
    name: 'Consumer Data Right',
    url: 'https://www.cdr.gov.au',
    useFor: 'Product data feeds (the legal basis for our data layer)',
  },
  ACCC: {
    name: 'Australian Competition and Consumer Commission',
    url: 'https://www.accc.gov.au',
    useFor: 'Consumer-law guidance, comparator-site enforcement, RG 234 advertising',
  },
};
