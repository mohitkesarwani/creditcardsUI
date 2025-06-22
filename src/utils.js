export function getMinimumAnnualFee(card) {
  const fee = card.fees?.reduce((min, f) => {
    if (f.amount === undefined) return min;
    const amount = Number(f.amount);
    if (Number.isNaN(amount)) return min;
    return Math.min(min, amount);
  }, Infinity);
  return fee === Infinity ? null : fee;
}
