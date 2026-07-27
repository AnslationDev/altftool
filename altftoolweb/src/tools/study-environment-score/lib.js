/**
 * Study environment scoring.
 *
 * Each factor is rated 0-5 and contributes weight × (rating / 5) points, so a
 * perfect environment scores 100:
 *
 *   score = Σ weightᵢ × ratingᵢ / RATING_MAX
 *
 * The weights are this tool's rubric, not a published standard: phone
 * placement carries the largest weight because self-report logs consistently
 * rank the phone as students' single biggest distractor, distraction factors
 * (noise, phone) together outweigh comfort factors, and lighting/ergonomics
 * matter but rarely break a session on their own.
 */

/** Ratings run 0 (terrible) to 5 (ideal). */
export const RATING_MAX = 5;

/** Factors and weights (weights sum to 100). */
export const FACTORS = [
  {
    id: "phone",
    label: "Phone placement",
    weight: 25,
    hint: "5 = another room / switched off, 0 = in hand with notifications on",
    tip: "Move the phone out of the room, or at minimum into a closed drawer on Do Not Disturb.",
  },
  {
    id: "noise",
    label: "Noise level",
    weight: 20,
    hint: "5 = quiet room, 0 = constant loud conversation or TV",
    tip: "Shift study to the quietest hour available, or use earplugs / steady background masking.",
  },
  {
    id: "desk",
    label: "Desk & chair setup",
    weight: 15,
    hint: "5 = proper desk and supportive chair, 0 = studying on the bed",
    tip: "A plain table and upright chair beat a bed or sofa — posture keeps arousal levels up.",
  },
  {
    id: "lighting",
    label: "Lighting",
    weight: 15,
    hint: "5 = bright, even light on the page, 0 = dim single bulb with glare",
    tip: "Use a desk lamp aimed at the page plus room light to cut glare and eye strain.",
  },
  {
    id: "clutter",
    label: "Desk clutter",
    weight: 15,
    hint: "5 = only current subject's material out, 0 = piles of unrelated stuff",
    tip: "Clear everything except the material for the current subject before sitting down.",
  },
  {
    id: "climate",
    label: "Temperature & air",
    weight: 10,
    hint: "5 = comfortable and ventilated, 0 = stuffy, too hot or too cold",
    tip: "Ventilate the room before long sessions; a stuffy room makes drowsiness arrive early.",
  },
];

/** Score bands — this tool's rubric on the 0-100 scale. */
export const SCORE_BANDS = [
  { min: 85, id: "excellent", label: "Excellent — a genuine deep-work setup" },
  { min: 70, id: "good", label: "Good — small tweaks left" },
  { min: 50, id: "fair", label: "Needs work — fixable leaks" },
  { min: 0, id: "poor", label: "Poor — the room is fighting you" },
];

const round1 = (v) => Math.round(v * 10) / 10;

/**
 * Score the environment.
 *
 * @param {object} input
 * @param {Record<string, number|string>} input.ratings  factor id -> 0..5 rating.
 * @returns {object} score breakdown, or { error }.
 */
export function scoreEnvironment({ ratings }) {
  if (!ratings || typeof ratings !== "object") {
    return { error: "Rate each factor from 0 to 5." };
  }

  const breakdown = [];
  let score = 0;
  for (const factor of FACTORS) {
    const rating = Number(ratings[factor.id]);
    if (!Number.isFinite(rating)) {
      return { error: `Rate "${factor.label}" from 0 to ${RATING_MAX}.` };
    }
    if (rating < 0 || rating > RATING_MAX) {
      return { error: `"${factor.label}" must be between 0 and ${RATING_MAX}.` };
    }
    const points = (factor.weight * rating) / RATING_MAX;
    // Points left on the table for this factor.
    const lost = factor.weight - points;
    breakdown.push({
      id: factor.id,
      label: factor.label,
      weight: factor.weight,
      rating,
      points: round1(points),
      lost: round1(lost),
      tip: factor.tip,
    });
    score += points;
  }

  const total = round1(score);
  const band = SCORE_BANDS.find((b) => total >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];

  // Improvement priorities: factors losing the most points, biggest first.
  const priorities = breakdown
    .filter((f) => f.lost > 0)
    .sort((a, b) => b.lost - a.lost)
    .slice(0, 3);

  return {
    score: total,
    bandId: band.id,
    bandLabel: band.label,
    breakdown,
    priorities,
    maxScore: 100,
  };
}
