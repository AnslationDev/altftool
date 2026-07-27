/**
 * Class rank → percentile conversion.
 *
 * Two standard readings, both used on applications:
 *
 * 1. "Top X%" — the figure admissions offices and automatic-admission rules
 *    (e.g. Texas's top-10% rule under Texas Education Code §51.803) use:
 *      topPercent = rank / classSize × 100
 *    A rank of 25 in a class of 500 is "top 5%".
 *
 * 2. Percentile — the share of the class ranked strictly below you:
 *      percentile = (classSize − rank) / classSize × 100
 *    Rank 25 of 500 → 95th percentile.
 *
 * Rank 1 is the highest rank. Ties are assumed to share the better rank, as
 * registrars report them.
 */

/** Named bands for quick interpretation of the top-percent figure. */
export const RANK_BANDS = [
  { maxTopPercent: 1, label: "Top 1% — valedictorian territory" },
  { maxTopPercent: 5, label: "Top 5% — highly competitive nationally" },
  { maxTopPercent: 10, label: "Top 10% — auto-admit range in some states (e.g. Texas)" },
  { maxTopPercent: 25, label: "Top quarter" },
  { maxTopPercent: 50, label: "Top half" },
  { maxTopPercent: 100, label: "Bottom half" },
];

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Convert a class rank into percentile figures.
 *
 * @param {object} input
 * @param {number} input.rank       Your rank (1 = highest).
 * @param {number} input.classSize  Number of students ranked.
 */
export function computeRankPercentile({ rank, classSize }) {
  const r = Number(rank);
  const n = Number(classSize);

  if (!Number.isFinite(r) || !Number.isInteger(r)) {
    return { error: "Rank must be a whole number." };
  }
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { error: "Class size must be a whole number." };
  }
  if (n < 1) return { error: "Class size must be at least 1." };
  if (r < 1) return { error: "Rank starts at 1 (the top student)." };
  if (r > n) return { error: "Rank cannot be larger than the class size." };

  const topPercent = (r / n) * 100;
  const percentile = ((n - r) / n) * 100;
  const band = RANK_BANDS.find((b) => topPercent <= b.maxTopPercent) ?? RANK_BANDS[RANK_BANDS.length - 1];
  const studentsBelow = n - r;

  return {
    rank: r,
    classSize: n,
    topPercent: round1(topPercent),
    percentile: round1(percentile),
    studentsBelow,
    band: band.label,
    topDecile: topPercent <= 10,
    topQuartile: topPercent <= 25,
    topHalf: topPercent <= 50,
  };
}
