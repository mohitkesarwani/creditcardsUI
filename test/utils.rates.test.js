// Tests for the rate / interest-free helpers. The bug that motivated these:
// CDR responses use `lendingRateType`, but the original helpers only matched
// `rateType`, so the Purchase Rate KPI rendered "—" for every card.

import test from 'node:test';
import assert from 'node:assert';
import {
  getPurchaseInterestRate,
  getCashAdvanceRate,
  getComparisonRate,
  getInterestFreeDays,
  formatPercent,
} from '../src/utils.js';

// --- getPurchaseInterestRate ------------------------------------------------

test('getPurchaseInterestRate: matches lendingRateType (CDR spec field)', () => {
  const card = {
    lendingRates: [
      { rate: '0.2099', lendingRateType: 'PURCHASE' },
      { rate: '0.2199', lendingRateType: 'CASH_ADVANCE' },
    ],
  };
  assert.strictEqual(getPurchaseInterestRate(card), '0.2099');
});

test('getPurchaseInterestRate: matches legacy rateType field', () => {
  const card = {
    lendingRates: [{ rate: '0.1899', rateType: 'PURCHASE' }],
  };
  assert.strictEqual(getPurchaseInterestRate(card), '0.1899');
});

test('getPurchaseInterestRate: falls back to first rate when no PURCHASE tag', () => {
  const card = {
    lendingRates: [{ rate: '0.1499', lendingRateType: 'STANDARD' }],
  };
  assert.strictEqual(getPurchaseInterestRate(card), '0.1499');
});

test('getPurchaseInterestRate: returns null when no rates', () => {
  assert.strictEqual(getPurchaseInterestRate({ lendingRates: [] }), null);
  assert.strictEqual(getPurchaseInterestRate({}), null);
});

test('getPurchaseInterestRate: falls back to card.interestRate', () => {
  assert.strictEqual(getPurchaseInterestRate({ interestRate: '19.99%' }), '19.99%');
});

// --- getCashAdvanceRate -----------------------------------------------------

test('getCashAdvanceRate: matches CASH_ADVANCE under lendingRateType', () => {
  const card = {
    lendingRates: [
      { rate: '0.2099', lendingRateType: 'PURCHASE' },
      { rate: '0.2199', lendingRateType: 'CASH_ADVANCE' },
    ],
  };
  assert.strictEqual(getCashAdvanceRate(card), '0.2199');
});

test('getCashAdvanceRate: null when no cash-advance entry', () => {
  const card = { lendingRates: [{ rate: '0.20', lendingRateType: 'PURCHASE' }] };
  assert.strictEqual(getCashAdvanceRate(card), null);
});

// --- getComparisonRate ------------------------------------------------------

test('getComparisonRate: prefers entry tagged PURCHASE', () => {
  const card = {
    lendingRates: [
      { lendingRateType: 'CASH_ADVANCE', comparisonRate: '0.25' },
      { lendingRateType: 'PURCHASE', comparisonRate: '0.21' },
    ],
  };
  assert.strictEqual(getComparisonRate(card), '0.21');
});

test('getComparisonRate: falls back to any entry that has one', () => {
  const card = {
    lendingRates: [{ lendingRateType: 'STANDARD', comparisonRate: '0.18' }],
  };
  assert.strictEqual(getComparisonRate(card), '0.18');
});

test('getComparisonRate: null when no entries carry a comparisonRate', () => {
  const card = { lendingRates: [{ lendingRateType: 'PURCHASE', rate: '0.20' }] };
  assert.strictEqual(getComparisonRate(card), null);
});

// --- getInterestFreeDays ----------------------------------------------------

test('getInterestFreeDays: uses explicit interestFree first', () => {
  assert.strictEqual(getInterestFreeDays({ interestFree: '55 days' }), '55 days');
});

test('getInterestFreeDays: regex from additionalInformation', () => {
  const card = {
    additionalInformation: {
      feesAndPricing: 'Up to 55 days interest free on purchases.',
    },
  };
  assert.strictEqual(getInterestFreeDays(card), '55 days');
});

test('getInterestFreeDays: returns null when no source has it', () => {
  assert.strictEqual(getInterestFreeDays({}), null);
});

// --- formatPercent (regression: decimal vs percent input) -------------------

test('formatPercent: decimal input is converted', () => {
  assert.strictEqual(formatPercent('0.2099'), '20.99%');
});

test('formatPercent: percent-form input is preserved', () => {
  assert.strictEqual(formatPercent('20.99'), '20.99%');
});

test('formatPercent: bad input is returned as-is', () => {
  assert.strictEqual(formatPercent(undefined), undefined);
  assert.strictEqual(formatPercent('abc'), 'abc');
});
