import test from 'node:test';
import assert from 'node:assert';
import { fetchMortgages, fetchMortgageRateRange } from '../src/api/residentialMortgages.js';
import apiClient from '../src/api/apiClient.js';

const originalGet = apiClient.get;

function mockGet(fn) {
  apiClient.get = fn;
}

test('fetchMortgages adds pagination params', async () => {
  let calledParams;
  mockGet(async (_url, config) => {
    calledParams = config.params;
    return {
      data: {
        mortgages: [{ id: 1 }],
        total: 5,
        minRate: 1,
        maxRate: 10,
      },
    };
  });
  const res = await fetchMortgages(2, 10);
  assert.deepStrictEqual(calledParams, { page: 2, limit: 10 });
  assert.strictEqual(res.total, 5);
  assert.deepStrictEqual(res.mortgages, [{ id: 1 }]);
  assert.strictEqual(res.minRate, 1);
  assert.strictEqual(res.maxRate, 10);
});

test('fetchMortgages returns min and max when provided', async () => {
  mockGet(async () => ({
    data: { mortgages: [], total: 0, minRate: 0.5, maxRate: 5 },
  }));
  const res = await fetchMortgages();
  assert.strictEqual(res.minRate, 0.5);
  assert.strictEqual(res.maxRate, 5);
});

test('fetchMortgageRateRange fetches rate bounds', async () => {
  mockGet(async (url) => {
    assert.strictEqual(url, '/api/residential-mortgages/rate-range');
    return { data: { minRate: 4.25, maxRate: 7.5 } };
  });
  const res = await fetchMortgageRateRange();
  assert.deepStrictEqual(res, { minRate: 4.25, maxRate: 7.5 });
});

test.after(() => {
  apiClient.get = originalGet;
});
