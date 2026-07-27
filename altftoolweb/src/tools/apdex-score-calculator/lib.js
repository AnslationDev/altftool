/**
 * Apdex (Application Performance Index) calculator.
 *
 * Defined by the Apdex Alliance specification (Apdex Technical Specification
 * v1.1) and used verbatim by New Relic, Datadog and other APM tools:
 *
 *   Apdex_T = (satisfied + tolerating / 2) / total samples
 *
 * against a chosen target time T:
 *   satisfied   response time <= T
 *   tolerating  T < response time <= 4T   (the spec fixes the factor at 4)
 *   frustrated  response time > 4T, or the request errored
 *
 * The score runs 0.00 (all frustrated) to 1.00 (all satisfied).
 */

/** The tolerating ceiling is 4 x T — fixed by the Apdex specification. */
export const TOLERATING_MULTIPLIER = 4;

/**
 * Rating bands from the Apdex Alliance specification.
 * Order matters: first band whose min the score reaches wins.
 */
export const RATING_BANDS = [
  { min: 0.94, label: "Excellent" },
  { min: 0.85, label: "Good" },
  { min: 0.7, label: "Fair" },
  { min: 0.5, label: "Poor" },
  { min: 0, label: "Unacceptable" },
];

/** Keep counts inside what a real monitoring window produces. */
export const MAX_COUNT = 1_000_000_000;

function toNumber(value) {
  if (typeof value === "string" && value.trim() === "") return NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

/** Band label for a score in [0, 1]. */
export function ratingFor(score) {
  const band = RATING_BANDS.find((entry) => score >= entry.min);
  return band ? band.label : "Unacceptable";
}

/**
 * Compute the Apdex score.
 *
 * @param {object} input
 * @param {number} input.satisfied    requests at or under T
 * @param {number} input.tolerating   requests over T, at or under 4T
 * @param {number} input.frustrated   requests over 4T (or errored)
 * @param {number} [input.targetSeconds]  the T threshold, for display only
 * @returns {object|{error:string}}
 */
export function computeApdex({ satisfied, tolerating, frustrated, targetSeconds } = {}) {
  const counts = [satisfied, tolerating, frustrated].map(toNumber);
  if (counts.some((value) => Number.isNaN(value))) {
    return { error: "Enter a number for each of the three buckets (0 is fine)." };
  }
  if (counts.some((value) => value < 0)) return { error: "Request counts cannot be negative." };
  if (counts.some((value) => !Number.isInteger(value))) {
    return { error: "Request counts must be whole numbers." };
  }
  if (counts.some((value) => value > MAX_COUNT)) {
    return { error: `Counts above ${MAX_COUNT.toLocaleString("en-US")} are outside this model.` };
  }

  const [ok, tolerable, bad] = counts;
  const total = ok + tolerable + bad;
  if (total === 0) return { error: "Enter at least one request across the three buckets." };

  let target = null;
  if (targetSeconds !== undefined && String(targetSeconds).trim() !== "") {
    target = toNumber(targetSeconds);
    if (Number.isNaN(target) || target <= 0) {
      return { error: "The target time T must be a positive number of seconds." };
    }
  }

  // Apdex_T = (satisfied + tolerating/2) / total
  const score = (ok + tolerable / 2) / total;

  return {
    score,
    rating: ratingFor(score),
    total,
    satisfied: ok,
    tolerating: tolerable,
    frustrated: bad,
    satisfiedShare: (ok / total) * 100,
    toleratingShare: (tolerable / total) * 100,
    frustratedShare: (bad / total) * 100,
    targetSeconds: target,
    toleratingCeilingSeconds: target === null ? null : target * TOLERATING_MULTIPLIER,
  };
}

/**
 * Cheapest set of request "fixes" that lifts the score to a target.
 *
 * Moving one frustrated request to satisfied raises the numerator by 1;
 * moving one tolerating request to satisfied raises it by 0.5. The total
 * stays fixed, so the greedy order (frustrated first) is optimal.
 *
 * @param {object} input  same counts as computeApdex, plus targetScore (0-1]
 * @returns {{achievable:boolean, fixFrustrated:number, fixTolerating:number,
 *            resultingScore:number}|{error:string}}
 */
export function fixesForTarget({ satisfied, tolerating, frustrated, targetScore } = {}) {
  const base = computeApdex({ satisfied, tolerating, frustrated });
  if (base.error) return { error: base.error };

  const target = toNumber(targetScore);
  if (Number.isNaN(target) || target <= 0 || target > 1) {
    return { error: "The target Apdex score must be between 0 and 1." };
  }

  const { total } = base;
  let ok = base.satisfied;
  let tolerable = base.tolerating;
  let bad = base.frustrated;

  const scoreOf = () => (ok + tolerable / 2) / total;

  if (scoreOf() >= target) {
    return { achievable: true, fixFrustrated: 0, fixTolerating: 0, resultingScore: scoreOf() };
  }

  // Needed numerator: target * total. Frustrated -> satisfied gains 1 per fix.
  const needed = target * total - (ok + tolerable / 2);
  let fixFrustrated = Math.min(bad, Math.ceil(needed - 1e-9));
  ok += fixFrustrated;
  bad -= fixFrustrated;

  let fixTolerating = 0;
  const remaining = target * total - (ok + tolerable / 2);
  if (remaining > 1e-9) {
    // Tolerating -> satisfied gains 0.5 per fix.
    fixTolerating = Math.min(tolerable, Math.ceil(remaining / 0.5 - 1e-9));
    ok += fixTolerating;
    tolerable -= fixTolerating;
  }

  const resultingScore = scoreOf();
  return {
    achievable: resultingScore >= target - 1e-9,
    fixFrustrated,
    fixTolerating,
    resultingScore,
  };
}
