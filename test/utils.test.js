import test from 'node:test';
import assert from 'node:assert';
import { getMinimumAnnualFee, parseCurrency, findFeeAmount } from '../src/utils.js';

test('returns lowest numeric fee', () => {
  const card = { fees: [{ amount: '99' }, { amount: '50' }] };
  assert.strictEqual(getMinimumAnnualFee(card), 50);
});

test('returns null when no numeric fees', () => {
  const card = { fees: [{ amount: undefined }, { foo: 'bar' }] };
  assert.strictEqual(getMinimumAnnualFee(card), null);
});

test('parses amounts with dollar signs', () => {
  const card = { fees: [{ amount: '$200' }, { amount: '$100' }] };
  assert.strictEqual(getMinimumAnnualFee(card), 100);
});

test('prefers annual fee entry', () => {
  const card = {
    fees: [
      { name: 'Cash Advance', amount: '$5' },
      { name: 'Annual Fee', amount: '$249' },
    ],
  };
  assert.strictEqual(getMinimumAnnualFee(card), 249);
});

test('parseCurrency strips symbols', () => {
  assert.strictEqual(parseCurrency('$50'), 50);
});

test('details.fees override in getMinimumAnnualFee', () => {
  const card = {
    fees: [{ name: 'Annual Fee', amount: '$99' }],
    details: { fees: [{ name: 'Annual Fee', amount: '$49' }] },
  };
  assert.strictEqual(getMinimumAnnualFee(card), 49);
});

test('findFeeAmount locates fee by name', () => {
  const card = {
    details: { fees: [{ name: 'International Purchase Fee', amount: '2.95%' }] },
  };
  assert.strictEqual(findFeeAmount(card, 'international purchase'), '2.95%');
});
