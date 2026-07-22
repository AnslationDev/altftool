// Scoring rules for the match-3 game.
// Base: 10 points per cleared candy.
// Bonus: extra points for matches larger than 3 candies.
// Cascade multiplier: each consecutive cascade step multiplies the payout,
// so chaining combos is rewarded heavily.

export function scoreForClear(clearedCount, cascade) {
  const base = clearedCount * 10;
  const bonus = Math.max(0, clearedCount - 3) * 15;
  const multiplier = Math.max(1, cascade);
  return Math.round((base + bonus) * multiplier);
}
