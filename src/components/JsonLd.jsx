import React, { useEffect } from 'react';
import { ORG_INFO, AUTHORS } from '../lib/authors.js';

// Renders JSON-LD structured data into <head>. Schema.org markup is what
// Google + LLMs use to understand who we are, who wrote our content, and
// what our products mean. Critical for E-E-A-T and AI-search visibility.
//
// Usage: drop <JsonLd schema={...}> anywhere in a page; it injects into
// document.head and cleans up on unmount.

function injectScript(id, payload) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload);
}

function removeScript(id) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

export default function JsonLd({ id, schema }) {
  useEffect(() => {
    if (!id || !schema) return;
    injectScript(id, schema);
    return () => removeScript(id);
  }, [id, schema]);
  return null;
}

// ── Reusable schema builders ──────────────────────────────────────────────

// Organization schema — injected once globally so every page asserts the
// same brand identity to crawlers.
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ORG_INFO.tradingName,
  legalName: ORG_INFO.legalName,
  url: ORG_INFO.url,
  logo: ORG_INFO.logoUrl,
  email: ORG_INFO.contactEmail,
  foundingDate: ORG_INFO.founded,
  areaServed: 'AU',
  sameAs: ORG_INFO.sameAs,
  description:
    'RewardRadar is an Australian product comparison tool for credit cards, home loans and deposits. Data sourced from each issuer\'s public Consumer Data Right feed.',
};

// WebSite schema — supports site-link search box in Google results.
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: ORG_INFO.tradingName,
  url: ORG_INFO.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${ORG_INFO.url}/credit-cards?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// Person schema for an author bio. Use on author detail pages or as part
// of Article schema on long-form content.
export const personSchema = (authorId) => {
  const a = AUTHORS[authorId];
  if (!a) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: a.name,
    jobTitle: a.role,
    description: a.bio,
    sameAs: a.sameAs,
    image: a.photoUrl || undefined,
    worksFor: {
      '@type': 'Organization',
      name: ORG_INFO.tradingName,
      url: ORG_INFO.url,
    },
  };
};

// FAQPage schema for the FAQ. Helps both Google rich results and LLMs.
export const faqPageSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: typeof i.answer === 'string' ? i.answer : '',
    },
  })),
});

// FinancialProduct schema for a product detail page. Includes provider,
// rate, fees etc — gives LLMs a structured product record.
export const financialProductSchema = (product, productType) => {
  if (!product) return null;
  const issuer = product.brandName || product.brand || product.bank_name || 'Unknown';
  const rate =
    product.headlineRateNumber ??
    product.purchase_rate ??
    product.min_variable_rate_owner ??
    product.base_rate ??
    null;
  return {
    '@context': 'https://schema.org',
    '@type': productType === 'card' ? 'CreditCard'
          : productType === 'loan' ? 'MortgageLoan'
          : 'BankAccount',
    name: product.name,
    description: product.description || `${issuer} ${product.name}`,
    provider: { '@type': 'Organization', name: issuer },
    annualPercentageRate: Number.isFinite(rate)
      ? { '@type': 'QuantitativeValue', value: rate * 100, unitText: 'percent' }
      : undefined,
    url:
      productType === 'card' ? `${ORG_INFO.url}/credit-cards/${product.id}`
      : productType === 'loan' ? `${ORG_INFO.url}/home-loans/${product.id}`
      : `${ORG_INFO.url}/deposits/${product.id}`,
  };
};
