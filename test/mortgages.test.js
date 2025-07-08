import test from 'node:test';
import assert from 'node:assert';
import { fetchMortgages } from '../src/api/residentialMortgages.js';
import apiClient from '../src/api/apiClient.js';

const originalGet = apiClient.get;

function mockGet(fn) {
  apiClient.get = fn;
}

test('fetchMortgages adds pagination params', async () => {
  let calledParams;
  mockGet(async (_url, config) => {
    calledParams = config.params;
    return { data: { mortgages: [{ id: 1 }], total: 5 } };
  });
  const res = await fetchMortgages(2, 10);
  assert.deepStrictEqual(calledParams, { page: 2, limit: 10 });
  assert.strictEqual(res.total, 5);
  assert.deepStrictEqual(res.mortgages, [{ id: 1 }]);
});

test.after(() => {
  apiClient.get = originalGet;
});
