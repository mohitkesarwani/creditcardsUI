import { test } from 'node:test';
import assert from 'node:assert/strict';

import { extractDepositTags, topDepositTags, DEPOSIT_TAG_STYLES } from '../src/lib/depositTags.js';
import { extractDepositDeal } from '../src/lib/dealHighlights.js';

test('extractDepositTags always emits a product-type tag', () => {
  const td = extractDepositTags({ product_category: 'TERM_DEPOSIT' });
  assert.ok(td.find((t) => t.id === 'term-deposit'));

  const sav = extractDepositTags({ product_category: 'SAVINGS' });
  assert.ok(sav.find((t) => t.id === 'savings'));

  const tx = extractDepositTags({ product_category: 'TRANSACTION' });
  assert.ok(tx.find((t) => t.id === 'transaction'));
});

test('savings with bonus interest → bonus-interest perk + emergency-fund best-for', () => {
  const tags = extractDepositTags({
    name: 'High Saver',
    product_category: 'SAVINGS',
    has_bonus_rate: true,
    bonus_rate: 0.05,
    base_rate: 0.001,
    monthly_fee_amount: 0,
  });
  const ids = tags.map((t) => t.id);
  assert.ok(ids.includes('bonus-interest'));
  assert.ok(ids.includes('emergency-fund'));
  assert.ok(ids.includes('no-monthly-fee'));
});

test('savings with intro rate → introductory-boost + intro-rate', () => {
  const tags = extractDepositTags({
    product_category: 'SAVINGS',
    has_intro_rate: true,
    intro_rate: 0.055,
    intro_period_months: 4,
  });
  const ids = tags.map((t) => t.id);
  assert.ok(ids.includes('introductory-boost'));
  assert.ok(ids.includes('intro-rate'));
});

test('TD with short term → short-term-park', () => {
  const tags = extractDepositTags({
    product_category: 'TERM_DEPOSIT',
    min_term_days: 30,
    max_term_days: 90,
    max_rate: 0.035,
  });
  assert.ok(tags.find((t) => t.id === 'short-term-park'));
  assert.ok(!tags.find((t) => t.id === 'long-term-lock'));
});

test('TD with long max term → long-term-lock', () => {
  const tags = extractDepositTags({
    product_category: 'TERM_DEPOSIT',
    min_term_days: 30,
    max_term_days: 365 * 5,
    max_rate: 0.045,
  });
  assert.ok(tags.find((t) => t.id === 'long-term-lock'));
});

test('TD with high max rate → high-balance', () => {
  const tags = extractDepositTags({
    product_category: 'TERM_DEPOSIT',
    max_rate: 0.045,
    min_term_days: 90,
    max_term_days: 365,
  });
  assert.ok(tags.find((t) => t.id === 'high-balance'));
});

test('transaction account does NOT pick up emergency-fund / savings tags', () => {
  const tags = extractDepositTags({
    product_category: 'TRANSACTION',
    base_rate: 0.0001,
    has_card_access: true,
    has_unlimited_txns: true,
  });
  const ids = tags.map((t) => t.id);
  assert.ok(!ids.includes('emergency-fund'));
  assert.ok(!ids.includes('bonus-interest'));
  assert.ok(ids.includes('card-access'));
  assert.ok(ids.includes('unlimited-txns'));
});

test('youth / student naming → kids-account', () => {
  const tags = extractDepositTags({
    name: 'Student Saver',
    product_category: 'SAVINGS',
    description: 'Account for under 18s.',
  });
  assert.ok(tags.find((t) => t.id === 'kids-account'));
});

test('topDepositTags pins active-filter labels first', () => {
  const tags = [
    { id: 'savings', label: 'Savings account', category: 'product-type', priority: 0 },
    { id: 'bonus-interest', label: 'Bonus interest', category: 'perk', priority: 1 },
    { id: 'emergency-fund', label: 'Emergency fund', category: 'best-for', priority: 1 },
    { id: 'card-access', label: 'Card access', category: 'perk', priority: 3 },
  ];
  const top = topDepositTags(tags, 3, ['Card access']);
  assert.equal(top[0].id, 'card-access', 'pinned label first');
  // Should still include product-type
  assert.ok(top.find((t) => t.id === 'savings'));
});

test('DEPOSIT_TAG_STYLES exposes per-category classes', () => {
  assert.ok(DEPOSIT_TAG_STYLES['product-type']);
  assert.ok(DEPOSIT_TAG_STYLES['best-for']);
  assert.ok(DEPOSIT_TAG_STYLES['perk']);
});

// ── Deal extractor ────────────────────────────────────────────────────────

test('extractDepositDeal: intro rate → intro-rate deal with period', () => {
  const deal = extractDepositDeal({
    has_intro_rate: true,
    intro_rate: 0.055,
    intro_period_months: 4,
  });
  assert.equal(deal.kind, 'intro-rate');
  assert.ok(/5.5%/.test(deal.label));
  assert.ok(/4 mo/.test(deal.label));
});

test('extractDepositDeal: bonus rate with balance cap', () => {
  const deal = extractDepositDeal({
    has_bonus_rate: true,
    bonus_rate: 0.0499,
    bonus_max_balance: 250_000,
  });
  assert.equal(deal.kind, 'bonus-rate');
  assert.ok(/4.99%/.test(deal.label));
  assert.ok(/\$250k/.test(deal.label));
});

test('extractDepositDeal: TD with "special" wording + max_rate → intro-rate deal', () => {
  const deal = extractDepositDeal({
    product_category: 'TERM_DEPOSIT',
    description: 'Special 5.10% rate for new money on 9-month terms.',
    max_rate: 0.051,
  });
  assert.equal(deal.kind, 'intro-rate');
  assert.ok(/5.1%/.test(deal.label));
});

test('extractDepositDeal: nothing notable → null', () => {
  assert.equal(extractDepositDeal({ product_category: 'TRANSACTION', base_rate: 0.0001 }), null);
});
