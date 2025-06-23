import test from 'node:test';
import assert from 'node:assert';
import { getMinimumAnnualFee, parseCurrency } from '../src/utils.js';

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
