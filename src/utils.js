export function getMinimumAnnualFee(card) {
  const fee = card.fees?.reduce((min, f) => {
    if (f.amount === undefined) return min;
    const amount = Number(f.amount);
    if (Number.isNaN(amount)) return min;
    return Math.min(min, amount);
  }, Infinity);
  return fee === Infinity ? null : fee;
}

/**
 * Extract up to `max` feature tags from a card object. Tags are derived from
 * featureType strings and the card's productCategory when present.
 */
export function getFeatureTags(card, max = 3) {
  const tags = new Set();
  if (card?.productCategory) {
    tags.add(card.productCategory);
  }
  card?.features?.forEach((f) => {
    if (!f.featureType) return;
    const t = f.featureType.toLowerCase();
    if (t.includes('reward')) tags.add('Rewards');
    if (t.includes('travel')) tags.add('Travel');
    if (t.includes('balance')) tags.add('Balance Transfer');
    if (t.includes('point')) tags.add('Points');
    if (t.includes('business')) tags.add('Business');
    if (t.includes('low')) tags.add('Low Rate');
  });
  return Array.from(tags).slice(0, max);
}

const TAG_COLORS = {
  Rewards: 'bg-blue-100 text-blue-800',
  Travel: 'bg-purple-100 text-purple-800',
  'Balance Transfer': 'bg-red-100 text-red-800',
  Points: 'bg-indigo-100 text-indigo-800',
  Business: 'bg-yellow-100 text-yellow-800',
  'Low Rate': 'bg-green-100 text-green-800',
};

export function getTagColor(tag) {
  return TAG_COLORS[tag] || 'bg-gray-100 text-gray-800';
}

