// End-to-end tests for normalizeCard: given a Supabase row shaped like what
// the comparecreditcards ingest writes, produce the display-ready fields the
// UI reads. These would have caught both the rate field-name bug and the
// "fees_and_pricing is always null" assumption.

import test from 'node:test';
import assert from 'node:assert';
import { normalizeCard } from '../src/api/normalizeCard.js';

// Realistic ANZ-shaped row (snake_case columns from Supabase, JSONB arrays
// with the actual key names CDR returns).
const anzRow = () => ({
  id: 'uuid-1',
  product_id: '1f9a67ea-8fda-cab0-e9d3-7ab9d0627545',
  name: 'ANZ First',
  brand: 'ANZ',
  brand_name: 'ANZ',
  application_uri: 'https://www.anz.com.au/personal/credit-cards/anz-first/',
  is_sponsored: false,
  sponsor_rank: 0,
  card_art: [{ imageUri: 'https://anz.example/anz-first.png' }],
  fees_and_pricing: null, // intentionally null — CDR doesn't populate this
  lending_rates: [
    {
      rate: '0.2099',
      lendingRateType: 'PURCHASE',
      applicationFrequency: 'P1M',
      calculationFrequency: 'P1D',
    },
    {
      rate: '0.2199',
      lendingRateType: 'CASH_ADVANCE',
    },
  ],
  fees: [
    { name: 'Annual Fee', amount: '30', currency: 'AUD' },
    { name: 'Late Payment Fee', amount: '20', currency: 'AUD' },
  ],
  eligibility: [],
  features: [],
  raw: {
    bankName: 'ANZ',
    additionalInformation: {
      feesAndPricing: 'Up to 55 days interest free on purchases.',
    },
  },
});

test('normalizeCard: extracts purchase rate from lendingRateType', () => {
  const out = normalizeCard(anzRow());
  assert.strictEqual(out.interestRate, '20.99%');
  assert.strictEqual(out.interestRateNumber, 0.2099);
});

test('normalizeCard: pulls interest-free days from additionalInformation regex', () => {
  const out = normalizeCard(anzRow());
  assert.strictEqual(out.interestFree, '55 days');
});

test('normalizeCard: formats annual fee from fees array', () => {
  const out = normalizeCard(anzRow());
  assert.strictEqual(out.annualFeeNumber, 30);
  assert.match(out.annualFee, /\$30\.00/);
});

test('normalizeCard: surfaces camelCase aliases for snake_case columns', () => {
  const out = normalizeCard(anzRow());
  assert.strictEqual(out.brandName, 'ANZ');
  assert.deepStrictEqual(out.cardArt, [{ imageUri: 'https://anz.example/anz-first.png' }]);
  assert.strictEqual(out.lendingRates.length, 2);
  assert.strictEqual(out.applicationUri, 'https://www.anz.com.au/personal/credit-cards/anz-first/');
  assert.strictEqual(out.applicationUrl, out.applicationUri);
  assert.strictEqual(out.productImageUrl, 'https://anz.example/anz-first.png');
});

test('normalizeCard: comparisonRate is null when CDR data omits it', () => {
  // ANZ doesn't include a comparisonRate in its lendingRates — make sure we
  // return null rather than guessing.
  const out = normalizeCard(anzRow());
  assert.strictEqual(out.comparisonRate, null);
  assert.strictEqual(out.comparisonRateNumber, null);
});

test('normalizeCard: comparisonRate present when CDR data includes it', () => {
  const row = anzRow();
  row.lending_rates[0].comparisonRate = '0.2149';
  const out = normalizeCard(row);
  assert.strictEqual(out.comparisonRate, '21.49%');
  assert.strictEqual(out.comparisonRateNumber, 0.2149);
});

test('normalizeCard: degrades gracefully on a sparse row', () => {
  const row = {
    id: 'uuid-x',
    product_id: 'empty',
    name: 'Mystery card',
    brand: 'ACME',
    fees: [],
    lending_rates: [],
  };
  const out = normalizeCard(row);
  assert.strictEqual(out.interestRate, null);
  assert.strictEqual(out.comparisonRate, null);
  assert.strictEqual(out.interestFree, null);
  assert.strictEqual(out.annualFee, null);
  assert.strictEqual(out.annualFeeNumber, null);
  assert.strictEqual(out.brand, 'ACME');
});

test('normalizeCard: returns input unchanged for falsy input', () => {
  assert.strictEqual(normalizeCard(null), null);
  assert.strictEqual(normalizeCard(undefined), undefined);
});

test('normalizeCard: prefers structured columns (schema 002) over JSONB extraction', () => {
  const row = {
    id: 'uuid-3',
    product_id: 'p3',
    name: 'Structured card',
    brand: 'CommBank',
    bank_name: 'CommBank',
    // Structured columns set directly — should win even if JSONB has data
    annual_fee_amount: 99,
    purchase_rate: 0.1399,
    comparison_rate: null,
    interest_free_days: 55,
    // Conflicting JSONB shouldn't be used
    fees: [{ name: 'Annual Fee', fixedAmount: { amount: '999' } }],
    lending_rates: [{ rate: '0.9999', lendingRateType: 'PURCHASE' }],
  };
  const out = normalizeCard(row);
  assert.strictEqual(out.annualFeeNumber, 99);
  assert.strictEqual(out.interestRate, '13.99%');
  assert.strictEqual(out.interestRateNumber, 0.1399);
  assert.strictEqual(out.interestFree, '55 days');
  assert.strictEqual(out.comparisonRate, null);
});

test('normalizeCard: falls back to JSONB when structured cols are absent (legacy row)', () => {
  const row = {
    id: 'uuid-4',
    product_id: 'p4',
    name: 'Legacy card',
    brand: 'ANZ',
    fees: [{ name: 'Annual Fee', amount: '30' }],
    lending_rates: [{ rate: '0.2099', lendingRateType: 'PURCHASE' }],
  };
  const out = normalizeCard(row);
  assert.strictEqual(out.annualFeeNumber, 30);
  assert.strictEqual(out.interestRate, '20.99%');
});

test('normalizeCard: uses bank_name as brandName fallback', () => {
  const out = normalizeCard({
    id: 'x',
    name: 'No-brand card',
    bank_name: 'Newcastle Permanent',
    fees: [],
    lending_rates: [],
  });
  assert.strictEqual(out.brandName, 'Newcastle Permanent');
});

test('normalizeCard: works on legacy camelCase rows too (idempotency)', () => {
  // If something already normalized the row, calling normalizeCard again
  // shouldn't blow up or lose fields.
  const camelRow = {
    id: 'uuid-2',
    name: 'Re-normalized card',
    brand: 'Brand',
    lendingRates: [{ rate: '0.15', lendingRateType: 'PURCHASE' }],
    fees: [{ name: 'Annual Fee', amount: '99' }],
  };
  const out = normalizeCard(camelRow);
  assert.strictEqual(out.interestRate, '15.00%');
  assert.strictEqual(out.annualFeeNumber, 99);
});
