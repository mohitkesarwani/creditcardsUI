import test from 'node:test';
import assert from 'node:assert';
import { fetchDeposits, fetchDeposit } from '../src/api/deposits.js';
import apiClient from '../src/api/apiClient.js';

const originalGet = apiClient.get;

// helper to mock apiClient.get
function mockGet(fn) {
  apiClient.get = fn;
}

test('fetchDeposits handles array payload', async () => {
  mockGet(async () => ({ data: [{ id: 1 }, { id: 2 }] }));
  const res = await fetchDeposits();
  assert.strictEqual(res.length, 2);
  assert.strictEqual(res[0].id, 1);
});

test('fetchDeposits handles deposits key', async () => {
  mockGet(async () => ({ data: { deposits: [{ id: 'a' }] } }));
  const res = await fetchDeposits();
  assert.deepStrictEqual(res, [{ id: 'a' }]);
});

test('fetchDeposit handles deposit key', async () => {
  mockGet(async () => ({ data: { deposit: { id: 'x' } } }));
  const res = await fetchDeposit('x');
  assert.strictEqual(res.id, 'x');
});

// restore after tests
test.after(() => {
  apiClient.get = originalGet;
});
