// Pins every discrepancy the user flagged + several new tag rules. Uses
// fixtures shaped like real Supabase rows so each test is meaningful.

import test from 'node:test';
import assert from 'node:assert';
import { extractCardTags, topTagsForCard } from '../src/lib/cardTags.js';

const ids = (tags) => tags.map((t) => t.id);

// ── ANZ Frequent Flyer Black (real shape) ──────────────────────────────────
const anzFFBlack = {
  name: 'ANZ Frequent Flyer Black',
  description: 'Our most rewarding Qantas experience',
  annualFeeNumber: 370,
  interestRateNumber: 0.2099,
  interest_free_days: 44,
  productCategory: 'CRED_AND_CHRG_CARDS',
  features: [
    { featureType: 'INSURANCE',          additionalValue: 'International Travel Insurance' },
    { featureType: 'INSURANCE',          additionalValue: 'Domestic Travel Insurance' },
    { featureType: 'INSURANCE',          additionalValue: 'Purchase Protection Insurance' },
    { featureType: 'INSURANCE',          additionalValue: 'Extended Warranty Insurance' },
    { featureType: 'DIGITAL_WALLET',     additionalValue: 'Apple Pay' },
    { featureType: 'DIGITAL_WALLET',     additionalValue: 'Google Pay' },
    { featureType: 'DIGITAL_WALLET',     additionalValue: 'Samsung Pay' },
    { featureType: 'LOYALTY_PROGRAM',    additionalValue: 'Qantas Points' },
    { featureType: 'BONUS_REWARDS',      additionalValue: '90000' },
    { featureType: 'CASHBACK_OFFER',     additionalValue: '200' }, // one-off sign-up bonus — must NOT trigger Cashback tag
    { featureType: 'BALANCE_TRANSFERS',  additionalValue: 'Eligibility criteria apply' }, // present but no 0% promo
    { featureType: 'INTEREST_FREE_TRANSFERS', additionalValue: 'P18M' }, // real 18-month balance-transfer promo
  ],
};

test('ANZ FF Black: gets Travel (Qantas) and Rewards but NOT misleading Cashback', () => {
  const tags = extractCardTags(anzFFBlack);
  const setIds = ids(tags);
  assert.ok(setIds.includes('travel'), 'travel tag missing');
  assert.ok(setIds.includes('rewards'), 'rewards tag missing');
  assert.ok(!setIds.includes('cashback'), '$200 sign-up bonus must NOT trigger Cashback tag');
});

test('ANZ FF Black: gets Balance transfer (INTEREST_FREE_TRANSFERS, not the plain BALANCE_TRANSFERS feature)', () => {
  const tags = extractCardTags(anzFFBlack);
  assert.ok(ids(tags).includes('balance-transfer'));
});

test('ANZ FF Black: gets Premium (high fee + travel insurance)', () => {
  assert.ok(ids(extractCardTags(anzFFBlack)).includes('premium'));
});

test('ANZ FF Black: perks include travel insurance, purchase protection, lounge-free, multi-wallet', () => {
  const setIds = ids(extractCardTags(anzFFBlack));
  assert.ok(setIds.includes('travel-insurance'));
  assert.ok(setIds.includes('purchase-protection'));
  assert.ok(setIds.includes('digital-wallets'));
});

// ── Bankwest Zero Platinum (real shape) ───────────────────────────────────
const bankwestZero = {
  name: 'Bankwest Zero Platinum Mastercard',
  description: 'No annual fee credit card with complimentary insurances',
  annualFeeNumber: 0,
  interestRateNumber: 0.1899,
  interest_free_days: 55,
  features: [
    { featureType: 'INSURANCE', additionalValue: 'Travel Insurance' },
    { featureType: 'DIGITAL_WALLET', additionalValue: 'Apple Pay' },
    { featureType: 'DIGITAL_WALLET', additionalValue: 'Google Pay' },
  ],
};

test('Bankwest Zero Platinum: No annual fee, Travel insurance perk; no Rewards (no loyalty program)', () => {
  const setIds = ids(extractCardTags(bankwestZero));
  assert.ok(setIds.includes('no-annual-fee'));
  assert.ok(setIds.includes('travel-insurance'));
  assert.ok(!setIds.includes('rewards'), 'No loyalty program → no Rewards tag');
  assert.ok(!setIds.includes('cashback'));
});

// ── Coles Low Rate (Flybuys ⇒ groceries) ──────────────────────────────────
const colesLowRate = {
  name: 'Coles Low Rate Platinum Mastercard',
  description: 'Low interest rate credit card with Flybuys Points and complimentary insurances',
  annualFeeNumber: 58,
  interestRateNumber: 0.1349,
  interest_free_days: 55,
  features: [
    { featureType: 'LOYALTY_PROGRAM', additionalValue: 'Flybuys' },
    { featureType: 'INSURANCE',       additionalValue: 'Complimentary Insurance' },
    { featureType: 'INTEREST_FREE',   additionalValue: 'P55D' },
  ],
};

test('Coles Low Rate: Groceries (Flybuys), Low rate (purchase_rate < 13.5%), Rewards', () => {
  const setIds = ids(extractCardTags(colesLowRate));
  assert.ok(setIds.includes('groceries'), 'Flybuys → Groceries');
  assert.ok(setIds.includes('low-rate'), 'rate < 13.5% → Low rate');
  assert.ok(setIds.includes('rewards'), 'LOYALTY_PROGRAM → Rewards');
  // No false Travel even though "complimentary insurance" mentions insurance generally
  assert.ok(!setIds.includes('travel'));
});

// ── Cashback false-positive guard ─────────────────────────────────────────
test('CASHBACK_OFFER alone (sign-up bonus only) → no Cashback tag', () => {
  const card = {
    name: 'Generic Card',
    annualFeeNumber: 99,
    interestRateNumber: 0.20,
    features: [{ featureType: 'CASHBACK_OFFER', additionalValue: '150' }],
  };
  assert.ok(!ids(extractCardTags(card)).includes('cashback'));
});

test('CASHBACK_OFFER with ongoing % cashback signal → Cashback tag', () => {
  const card = {
    name: 'Real Cashback Card',
    description: '2% cashback on every purchase',
    annualFeeNumber: 0,
    interestRateNumber: 0.22,
    features: [{ featureType: 'CASHBACK_OFFER', additionalInfo: 'Earn 2% cash back on every $1 spent' }],
  };
  assert.ok(ids(extractCardTags(card)).includes('cashback'));
});

// ── Balance Transfer false-positive guard ─────────────────────────────────
test('Plain BALANCE_TRANSFERS feature with no INTEREST_FREE_TRANSFERS → no Balance transfer tag', () => {
  const card = {
    name: 'Some Card',
    annualFeeNumber: 0,
    interestRateNumber: 0.19,
    features: [{ featureType: 'BALANCE_TRANSFERS', additionalValue: 'Eligibility criteria apply' }],
  };
  assert.ok(!ids(extractCardTags(card)).includes('balance-transfer'));
});

// ── topTagsForCard prioritisation ─────────────────────────────────────────
test('topTagsForCard: always prefers spending categories over perks', () => {
  const tags = [
    { id: 'travel-insurance',  category: 'perk',     priority: 3 },
    { id: 'groceries',         category: 'spending', priority: 1 },
    { id: 'no-annual-fee',     category: 'type',     priority: 1 },
    { id: 'long-interest-free',category: 'perk',     priority: 4 },
  ];
  const top = topTagsForCard(tags, 2);
  assert.deepStrictEqual(top.map((t) => t.id), ['groceries', 'no-annual-fee']);
});

test('topTagsForCard: returns at most N items', () => {
  const tags = Array.from({ length: 10 }, (_, i) => ({ id: `t${i}`, category: 'type', priority: i }));
  assert.strictEqual(topTagsForCard(tags, 3).length, 3);
});

test('topTagsForCard: pins active-filter tags first, even low-priority perks', () => {
  // Realistic: a Premium travel card where Travel + Rewards + Premium + Balance Transfer
  // would normally take the top 4, pushing Purchase Protection out. When the user
  // filters for "Purchase protection", it MUST be visible so the AND is verifiable.
  const tags = [
    { id: 'travel',              label: 'Travel',              category: 'spending', priority: 1 },
    { id: 'rewards',             label: 'Rewards',             category: 'type',     priority: 1 },
    { id: 'premium',             label: 'Premium',             category: 'type',     priority: 2 },
    { id: 'balance-transfer',    label: 'Balance transfer',    category: 'type',     priority: 2 },
    { id: 'travel-insurance',    label: 'Travel insurance',    category: 'perk',     priority: 3 },
    { id: 'purchase-protection', label: 'Purchase protection', category: 'perk',     priority: 4 },
  ];
  const top = topTagsForCard(tags, 4, ['Travel insurance', 'Purchase protection']);
  const ids = top.map((t) => t.id);
  assert.ok(ids.includes('travel-insurance'),    'travel-insurance must be pinned');
  assert.ok(ids.includes('purchase-protection'), 'purchase-protection must be pinned');
});

test('topTagsForCard: pinning is case-insensitive', () => {
  const tags = [{ id: 'p', label: 'Purchase protection', category: 'perk', priority: 4 }];
  assert.strictEqual(
    topTagsForCard(tags, 1, ['PURCHASE PROTECTION'])[0].id,
    'p',
  );
});
