import test from 'node:test';
import assert from 'node:assert';
import { getMinimumAnnualFee } from '../src/utils.js';

test('returns lowest numeric fee', () => {
  const card = { fees: [{ amount: '99' }, { amount: '50' }] };
  assert.strictEqual(getMinimumAnnualFee(card), 50);
});

test('returns null when no numeric fees', () => {
  const card = { fees: [{ amount: undefined }, { foo: 'bar' }] };
  assert.strictEqual(getMinimumAnnualFee(card), null);
});
