/**
 * Indian degree percentage → UK honours degree class equivalence.
 *
 * UK universities do NOT apply the UK's own 70/60/50/40 classification
 * boundaries to Indian marks, because Indian grading is markedly harsher.
 * Instead, admissions teams publish country equivalency tables. The
 * thresholds below reflect the tables commonly published by UK universities
 * for Indian bachelor's degrees (e.g. the widespread "60% ≈ UK 2:1" rule,
 * with a concession of roughly 5 points for graduates of premier
 * institutions such as IITs, NITs, IIMs, top NIRF-ranked and older central
 * universities).
 *
 * Individual universities differ (some ask 65% for a 2:1, some accept 55%),
 * so results are labelled indicative.
 */

export const INSTITUTION_TIERS = [
  {
    id: "standard",
    label: "Recognised Indian university (standard list)",
    // Common UK admissions equivalence for Indian marks from recognised universities.
    thresholds: [
      { min: 70, className: "First Class Honours", short: "First (1st)" },
      { min: 60, className: "Upper Second Class Honours", short: "2:1" },
      { min: 50, className: "Lower Second Class Honours", short: "2:2" },
      { min: 40, className: "Third Class Honours", short: "Third (3rd)" },
    ],
  },
  {
    id: "premier",
    label: "Premier institution (IIT / NIT / IIM / top NIRF-ranked)",
    // Many UK universities lower each boundary by ~5 points for premier institutions.
    thresholds: [
      { min: 65, className: "First Class Honours", short: "First (1st)" },
      { min: 55, className: "Upper Second Class Honours", short: "2:1" },
      { min: 50, className: "Lower Second Class Honours", short: "2:2" },
      { min: 40, className: "Third Class Honours", short: "Third (3rd)" },
    ],
  },
];

/** UK universities' own domestic classification boundaries, for comparison display. */
export const UK_DOMESTIC_BOUNDARIES = [
  { min: 70, short: "First (1st)" },
  { min: 60, short: "2:1" },
  { min: 50, short: "2:2" },
  { min: 40, short: "Third (3rd)" },
];

/** Typical Indian pass mark — below this no honours equivalence exists. */
export const INDIAN_PASS_MARK = 40;

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Map an Indian percentage to its UK class equivalent.
 *
 * @param {object} input
 * @param {number} input.percentage   Overall Indian degree percentage (0-100).
 * @param {string} input.tierId       "standard" | "premier".
 */
export function convertToUkClass({ percentage, tierId }) {
  const pct = Number(percentage);
  if (!Number.isFinite(pct)) return { error: "Enter your overall percentage as a number." };
  if (pct < 0 || pct > 100) return { error: "Percentage must be between 0 and 100." };

  const tier = INSTITUTION_TIERS.find((t) => t.id === tierId);
  if (!tier) return { error: "Choose your institution type." };

  const band = tier.thresholds.find((t) => pct >= t.min) ?? null;

  if (!band) {
    return {
      percentage: round1(pct),
      tier: tier.label,
      className: "Below pass — no UK class equivalent",
      short: "Fail",
      nextBand: tier.thresholds[tier.thresholds.length - 1],
      marksToNext: round1(tier.thresholds[tier.thresholds.length - 1].min - pct),
    };
  }

  // Distance to the next class up, if any.
  const index = tier.thresholds.indexOf(band);
  const nextBand = index > 0 ? tier.thresholds[index - 1] : null;

  return {
    percentage: round1(pct),
    tier: tier.label,
    className: band.className,
    short: band.short,
    nextBand,
    marksToNext: nextBand ? round1(nextBand.min - pct) : 0,
  };
}
