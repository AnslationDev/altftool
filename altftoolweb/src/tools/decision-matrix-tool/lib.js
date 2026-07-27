/**
 * Decision matrix — pure logic for the weighted scoring model (also called a
 * weighted decision matrix or Pugh matrix with weights).
 *
 * The method:
 *   1. List the criteria and give each a weight.
 *   2. Rate every option against every criterion on a fixed scale.
 *   3. Normalise the weights so they sum to 1:   share_i = w_i / sum(w)
 *   4. Score each option:                        S = sum( share_i * r_i )
 *   5. Rank by S. The score lands back on the rating scale, so a 7.4 means
 *      "as good as a straight 7.4 on every criterion".
 *
 * Criteria marked "lower is better" (cost, risk, lead time) have their rating
 * mirrored on the scale: r' = RATING_MAX + RATING_MIN - r.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Rating scale used for every cell of the matrix. */
export const RATING_MIN = 1;
export const RATING_MAX = 10;

/** Weight scale. A weight of 0 removes a criterion from the decision. */
export const WEIGHT_MIN = 0;
export const WEIGHT_MAX = 10;

/** Practical limits so the table stays usable on a phone. */
export const MAX_CRITERIA = 12;
export const MAX_OPTIONS = 10;

/**
 * Two scores this close are reported as a tie: the weighted scoring model is
 * not precise enough to separate them, and pretending otherwise is the classic
 * misuse of the method.
 */
export const TIE_THRESHOLD = 0.1;

/** Confidence bands for the gap between first and second place. */
export const CONFIDENCE_BANDS = [
  { min: 1.5, label: "Clear winner", note: "The gap is wide enough that small rating errors will not change the outcome." },
  { min: 0.5, label: "Reasonably clear", note: "A one-point rating change on a heavy criterion could still narrow this." },
  { min: TIE_THRESHOLD, label: "Close call", note: "Re-check the ratings on the heaviest criteria before committing." },
  { min: 0, label: "Effectively a tie", note: "The model cannot separate these — decide on something it does not measure." },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Mirror a rating for a criterion where a lower raw value is better. */
export function orientRating(rating, lowerIsBetter) {
  const value = Number(rating);
  if (!Number.isFinite(value)) return RATING_MIN;
  const clamped = Math.min(RATING_MAX, Math.max(RATING_MIN, value));
  return lowerIsBetter ? RATING_MAX + RATING_MIN - clamped : clamped;
}

/** Confidence label for a first-to-second gap. */
export function confidenceFor(margin) {
  const gap = Math.abs(Number(margin) || 0);
  return CONFIDENCE_BANDS.find((band) => gap >= band.min) || CONFIDENCE_BANDS[CONFIDENCE_BANDS.length - 1];
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function validate(criteria, options) {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return { error: "Add at least one criterion to score against." };
  }
  if (criteria.length > MAX_CRITERIA) {
    return { error: `Use at most ${MAX_CRITERIA} criteria — beyond that the weights stop meaning anything.` };
  }
  if (!Array.isArray(options) || options.length < 2) {
    return { error: "Add at least two options — a matrix with one option has nothing to compare." };
  }
  if (options.length > MAX_OPTIONS) {
    return { error: `Use at most ${MAX_OPTIONS} options.` };
  }

  for (const criterion of criteria) {
    const weight = Number(criterion.weight);
    if (!Number.isFinite(weight) || weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
      return {
        error: `Weight for "${criterion.name || "unnamed criterion"}" must be between ${WEIGHT_MIN} and ${WEIGHT_MAX}.`,
      };
    }
  }

  const totalWeight = criteria.reduce((sum, criterion) => sum + Number(criterion.weight), 0);
  if (totalWeight <= 0) {
    return { error: "All weights are zero — give at least one criterion a weight above 0." };
  }

  for (const option of options) {
    for (const criterion of criteria) {
      const raw = option.scores ? option.scores[criterion.id] : undefined;
      const rating = Number(raw);
      if (!Number.isFinite(rating) || rating < RATING_MIN || rating > RATING_MAX) {
        return {
          error: `Rating for "${option.name || "unnamed option"}" on "${criterion.name || "unnamed criterion"}" must be between ${RATING_MIN} and ${RATING_MAX}.`,
        };
      }
    }
  }

  return { totalWeight };
}

/* ------------------------------------------------------------------ */
/* Sensitivity                                                         */
/* ------------------------------------------------------------------ */

/**
 * For the top two options, the weight each criterion would need for the
 * runner-up to overtake the winner.
 *
 * With unnormalised totals A and B, changing criterion k's weight from w to x
 * moves the lead by (x - w)(a_k - b_k), so the flip point is
 *     x = w - (A - B) / (a_k - b_k)
 * Renormalising by the new weight total scales both totals equally and cannot
 * change the sign, so this is exact.
 */
export function flipAnalysis(criteria, winner, runnerUp) {
  if (!winner || !runnerUp) return [];
  const leadRaw = criteria.reduce(
    (sum, criterion) =>
      sum +
      Number(criterion.weight) *
        (orientRating(winner.raw[criterion.id], criterion.lowerIsBetter) -
          orientRating(runnerUp.raw[criterion.id], criterion.lowerIsBetter)),
    0,
  );

  return criteria.map((criterion) => {
    const difference =
      orientRating(winner.raw[criterion.id], criterion.lowerIsBetter) -
      orientRating(runnerUp.raw[criterion.id], criterion.lowerIsBetter);
    if (difference === 0) {
      return { id: criterion.id, name: criterion.name, reachable: false, needed: null };
    }
    const needed = Number(criterion.weight) - leadRaw / difference;
    const reachable = needed >= WEIGHT_MIN && needed <= WEIGHT_MAX;
    return {
      id: criterion.id,
      name: criterion.name,
      reachable,
      needed: round(needed, 2),
      currentWeight: Number(criterion.weight),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Main evaluation                                                     */
/* ------------------------------------------------------------------ */

/**
 * Score and rank a decision matrix.
 *
 * @param {Array<{id:string,name:string,weight:number,lowerIsBetter?:boolean}>} criteria
 * @param {Array<{id:string,name:string,scores:Record<string,number>}>} options
 */
export function evaluateMatrix(criteria, options) {
  const checked = validate(criteria, options);
  if (checked.error) return { error: checked.error };
  const { totalWeight } = checked;

  const weights = criteria.map((criterion) => ({
    id: criterion.id,
    name: criterion.name,
    weight: Number(criterion.weight),
    lowerIsBetter: Boolean(criterion.lowerIsBetter),
    share: Number(criterion.weight) / totalWeight,
    sharePercent: round((Number(criterion.weight) / totalWeight) * 100, 1),
  }));

  const scored = options.map((option) => {
    const contributions = weights.map((weight) => {
      const oriented = orientRating(option.scores[weight.id], weight.lowerIsBetter);
      return {
        id: weight.id,
        name: weight.name,
        rating: Number(option.scores[weight.id]),
        oriented,
        contribution: weight.share * oriented,
      };
    });
    const score = contributions.reduce((sum, entry) => sum + entry.contribution, 0);
    return {
      id: option.id,
      name: option.name,
      raw: option.scores,
      contributions,
      score,
      scoreRounded: round(score, 2),
      // Percent of the best score the model can produce (a perfect 10 everywhere).
      percentOfMax: round((score / RATING_MAX) * 100, 1),
    };
  });

  const ranked = [...scored].sort((a, b) => b.score - a.score);
  ranked.forEach((option, index) => {
    option.rank = index + 1;
  });

  const winner = ranked[0];
  const runnerUp = ranked[1];
  const margin = winner.score - runnerUp.score;
  const tie = margin < TIE_THRESHOLD;
  const confidence = confidenceFor(margin);

  const flips = flipAnalysis(criteria, winner, runnerUp);
  const decisive = [...winner.contributions]
    .map((entry, index) => ({
      name: entry.name,
      swing: entry.contribution - runnerUp.contributions[index].contribution,
    }))
    .sort((a, b) => b.swing - a.swing)[0];

  return {
    weights,
    ranked,
    winner,
    runnerUp,
    margin: round(margin, 2),
    marginPercent: round((margin / RATING_MAX) * 100, 1),
    tie,
    confidenceLabel: confidence.label,
    confidenceNote: confidence.note,
    totalWeight,
    decisiveCriterion: decisive ? decisive.name : null,
    decisiveSwing: decisive ? round(decisive.swing, 2) : null,
    flips,
    criteriaCount: criteria.length,
    optionCount: options.length,
  };
}

/**
 * Plain-text report of a scored matrix, for the copy button.
 */
export function formatReport(result, title = "Decision matrix") {
  if (!result || result.error) return "";
  const lines = [];
  lines.push(title);
  lines.push("=".repeat(title.length));
  lines.push("");
  lines.push(`Winner: ${result.winner.name} — ${result.winner.scoreRounded} / ${RATING_MAX}`);
  lines.push(`Margin over ${result.runnerUp.name}: ${result.margin} (${result.confidenceLabel})`);
  if (result.decisiveCriterion) {
    lines.push(`Decided mainly by: ${result.decisiveCriterion}`);
  }
  lines.push("");
  lines.push("Weights");
  for (const weight of result.weights) {
    lines.push(
      `  ${weight.name}: ${weight.weight} (${weight.sharePercent}%)${weight.lowerIsBetter ? " — lower is better" : ""}`,
    );
  }
  lines.push("");
  lines.push("Ranking");
  for (const option of result.ranked) {
    lines.push(`  ${option.rank}. ${option.name} — ${option.scoreRounded}`);
  }
  return lines.join("\n");
}
