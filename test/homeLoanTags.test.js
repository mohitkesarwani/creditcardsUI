import test from 'node:test';
import assert from 'node:assert';
import { extractHomeLoanTags, topHomeLoanTags } from '../src/lib/homeLoanTags.js';
import { extractCardDeal, extractLoanDeal } from '../src/lib/dealHighlights.js';

const ids = (tags) => tags.map((t) => t.id);

// ── Home-loan tag rules ───────────────────────────────────────────────────
test('home-loan tags: refinance + cashback offer triggers Refinancers + Cashback', () => {
  const loan = {
    name: 'Smart Booster Home Loan',
    description: 'Up to $4,000 cashback when you refinance',
    features: [{ featureType: 'CASHBACK_OFFER', additionalValue: '4000' }],
    has_redraw: true,
    annual_fee_amount: 0,
  };
  const tagIds = ids(extractHomeLoanTags(loan));
  assert.ok(tagIds.includes('refinance'), 'should tag as Refinancers');
  assert.ok(tagIds.includes('cashback-offer'), 'should tag with Cashback offer perk');
  assert.ok(tagIds.includes('no-annual-fee'));
});

test('home-loan tags: GUARANTOR + 95% LVR triggers First home buyers', () => {
  const loan = {
    name: 'Family Home Loan',
    features: [{ featureType: 'GUARANTOR', additionalValue: 'Family guarantor accepted' }],
    max_lvr_percent: 95,
  };
  assert.ok(ids(extractHomeLoanTags(loan)).includes('first-home-buyer'));
});

test('home-loan tags: investment rate present → Investors tag', () => {
  const loan = { name: 'Standard Variable', min_variable_rate_invest: 0.0625 };
  assert.ok(ids(extractHomeLoanTags(loan)).includes('investment'));
});

test('home-loan tags: package detection — high fee + offset + redraw', () => {
  const loan = {
    name: 'Premier Package',
    annual_fee_amount: 395,
    has_offset: true,
    has_redraw: true,
  };
  assert.ok(ids(extractHomeLoanTags(loan)).includes('package'));
});

test('home-loan tags: basic — no offset + $0 fees', () => {
  const loan = {
    name: 'Basic Variable',
    has_offset: false,
    annual_fee_amount: 0,
    upfront_fee_amount: 0,
  };
  assert.ok(ids(extractHomeLoanTags(loan)).includes('basic'));
});

test('home-loan tags: low rate when variable owner < 5.85%', () => {
  const loan = { min_variable_rate_owner: 0.0579 };
  assert.ok(ids(extractHomeLoanTags(loan)).includes('low-rate'));
});

test('home-loan tags: low rate NOT applied at 6%', () => {
  const loan = { min_variable_rate_owner: 0.06 };
  assert.ok(!ids(extractHomeLoanTags(loan)).includes('low-rate'));
});

test('home-loan tags: $0 upfront fee perk', () => {
  const loan = { upfront_fee_amount: 0 };
  assert.ok(ids(extractHomeLoanTags(loan)).includes('no-upfront-fee'));
});

test('home-loan tags: green / sustainable detection from text', () => {
  const loan = { name: 'Green Home Loan', description: 'Discounted rate for energy-efficient homes' };
  assert.ok(ids(extractHomeLoanTags(loan)).includes('green-loan'));
});

test('topHomeLoanTags: pins matched-filter tags first', () => {
  const tags = [
    { id: 'refinance',      label: 'Refinancers',      category: 'best-for', priority: 1 },
    { id: 'low-rate',       label: 'Low rate',         category: 'type',     priority: 1 },
    { id: 'no-annual-fee',  label: 'No annual fee',    category: 'type',     priority: 1 },
    { id: 'cashback-offer', label: 'Cashback offer',   category: 'perk',     priority: 1 },
    { id: 'guarantor',      label: 'Guarantor support',category: 'perk',     priority: 3 },
  ];
  const out = topHomeLoanTags(tags, 3, ['Guarantor support']);
  assert.ok(ids(out).includes('guarantor'), 'pinned tag must be present');
});

// ── Deal-highlight extraction (cross-product) ─────────────────────────────
test('card deal: BONUS_REWARDS feature → bonus-points label', () => {
  const card = { features: [{ featureType: 'BONUS_REWARDS', additionalValue: '90000', additionalInfo: 'When you spend $3,000 in the first 90 days' }] };
  const deal = extractCardDeal(card);
  assert.strictEqual(deal.kind, 'bonus-points');
  assert.strictEqual(deal.amount, 90000);
  assert.match(deal.label, /90k pts/i);
});

test('card deal: CASHBACK_OFFER ($200 sign-up) → cashback label', () => {
  const card = { features: [{ featureType: 'CASHBACK_OFFER', additionalValue: '200' }] };
  const deal = extractCardDeal(card);
  assert.strictEqual(deal.kind, 'cashback');
  assert.strictEqual(deal.amount, 200);
  assert.match(deal.label, /\$200/);
});

test('card deal: INTEREST_FREE_TRANSFERS P18M → balance-transfer offer', () => {
  const card = { features: [{ featureType: 'INTEREST_FREE_TRANSFERS', additionalValue: 'P18M' }] };
  const deal = extractCardDeal(card);
  assert.strictEqual(deal.kind, 'intro-rate');
  assert.match(deal.label, /18 mo/);
});

test('card deal: no qualifying features → null', () => {
  assert.strictEqual(extractCardDeal({ features: [] }), null);
});

test('loan deal: CASHBACK_OFFER $4000 → cashback badge', () => {
  const loan = { features: [{ featureType: 'CASHBACK_OFFER', additionalValue: '4000' }] };
  const deal = extractLoanDeal(loan);
  assert.strictEqual(deal.kind, 'cashback');
  assert.strictEqual(deal.amount, 4000);
  assert.match(deal.label, /\$4k/);
});

test('loan deal: text fallback when no CASHBACK_OFFER feature but $ in description', () => {
  const loan = { description: 'Receive up to $3,000 cashback when you refinance.' };
  const deal = extractLoanDeal(loan);
  assert.strictEqual(deal.amount, 3000);
});

test('loan deal: no cashback signal → null', () => {
  assert.strictEqual(extractLoanDeal({ description: 'A standard variable loan.', features: [] }), null);
});
