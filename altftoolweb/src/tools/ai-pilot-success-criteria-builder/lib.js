/**
 * AI Pilot Success Criteria Builder.
 *
 * Turns a set of go/no-go criteria into (a) the required change on each metric and
 * (b) the number of observations per arm needed to detect that change, using the
 * standard normal-approximation sample-size formulas for a two-sample comparison.
 *
 * Two-proportion test (independent groups, two-sided):
 *   n per arm = (z_(1-alpha/2) + z_(1-beta))^2 * [p1(1-p1) + p2(1-p2)] / (p1 - p2)^2
 *
 * Two-mean test (independent groups, equal variance, two-sided):
 *   n per arm = 2 * (z_(1-alpha/2) + z_(1-beta))^2 * sigma^2 / delta^2
 *
 * Both are the uncorrected large-sample formulas found in standard biostatistics
 * texts (e.g. Rosner, Fundamentals of Biostatistics); they omit the Yates continuity
 * correction, so published tables that include it may sit a few subjects higher.
 */

/**
 * Two-sided standard normal critical values z_(1-alpha/2).
 * 1.959964 = 97.5th percentile of N(0,1); 1.644854 = 95th; 2.575829 = 99.5th.
 */
export const SIGNIFICANCE_LEVELS = [
  { id: "0.05", label: "95% confidence (alpha 0.05)", alpha: 0.05, z: 1.959964 },
  { id: "0.10", label: "90% confidence (alpha 0.10)", alpha: 0.1, z: 1.644854 },
  { id: "0.01", label: "99% confidence (alpha 0.01)", alpha: 0.01, z: 2.575829 },
];

/**
 * One-sided standard normal quantiles z_(1-beta) for the chosen statistical power.
 * 0.841621 = 80th percentile of N(0,1); 1.281552 = 90th; 1.644854 = 95th.
 */
export const POWER_LEVELS = [
  { id: "0.80", label: "80% power", power: 0.8, z: 0.841621 },
  { id: "0.90", label: "90% power", power: 0.9, z: 1.281552 },
  { id: "0.95", label: "95% power", power: 0.95, z: 1.644854 },
];

/** A criterion is either a rate (percentage of events) or a continuous mean. */
export const METRIC_KINDS = [
  { id: "rate", label: "Rate / percentage", unit: "%" },
  { id: "continuous", label: "Average of a number", unit: "" },
];

/** Which way "better" points for the metric. */
export const DIRECTIONS = [
  { id: "increase", label: "Higher is better" },
  { id: "decrease", label: "Lower is better" },
];

/** Must-have criteria gate the decision; nice-to-have criteria only add colour. */
export const TIERS = [
  { id: "must", label: "Must-have (gates the decision)" },
  { id: "nice", label: "Nice-to-have" },
];

/** Above this the sample requirement is impractical for a normal pilot; we flag it. */
export const IMPRACTICAL_SAMPLE_THRESHOLD = 1000000;

/** Pilot windows shorter or longer than this are almost certainly a typo. */
export const DURATION_MIN_WEEKS = 1;
export const DURATION_MAX_WEEKS = 104;

function toNumber(value) {
  if (value === null || value === undefined) return Number.NaN;
  const text = String(value).trim();
  if (text === "") return Number.NaN;
  return Number(text);
}

/**
 * Observations needed per arm to detect a difference between two proportions.
 * p1 and p2 are proportions in [0, 1].
 */
export function sampleSizePerArmForProportions({ p1, p2, zAlpha, zBeta }) {
  if (![p1, p2, zAlpha, zBeta].every(Number.isFinite)) return null;
  if (p1 < 0 || p1 > 1 || p2 < 0 || p2 > 1) return null;
  const delta = p2 - p1;
  if (delta === 0) return null;
  const variance = p1 * (1 - p1) + p2 * (1 - p2);
  if (variance === 0) return null;
  const n = ((zAlpha + zBeta) ** 2 * variance) / delta ** 2;
  if (!Number.isFinite(n)) return null;
  return Math.ceil(n);
}

/**
 * Observations needed per arm to detect a difference between two means,
 * assuming a common standard deviation sigma.
 */
export function sampleSizePerArmForMeans({ delta, stdDev, zAlpha, zBeta }) {
  if (![delta, stdDev, zAlpha, zBeta].every(Number.isFinite)) return null;
  if (stdDev <= 0) return null;
  const absDelta = Math.abs(delta);
  if (absDelta === 0) return null;
  const n = (2 * (zAlpha + zBeta) ** 2 * stdDev ** 2) / absDelta ** 2;
  if (!Number.isFinite(n)) return null;
  return Math.ceil(n);
}

/**
 * Validate and describe one criterion.
 * Returns { ok: false, error } or the evaluated criterion.
 */
export function evaluateCriterion(criterion, index = 0) {
  const label = String(criterion?.label ?? "").trim() || `Criterion ${index + 1}`;
  const kind = METRIC_KINDS.some((k) => k.id === criterion?.kind) ? criterion.kind : "rate";
  const direction = DIRECTIONS.some((d) => d.id === criterion?.direction)
    ? criterion.direction
    : "increase";
  const tier = TIERS.some((t) => t.id === criterion?.tier) ? criterion.tier : "must";

  const baseline = toNumber(criterion?.baseline);
  const target = toNumber(criterion?.target);

  if (!Number.isFinite(baseline)) {
    return { ok: false, error: `"${label}": enter today's measured baseline as a number.` };
  }
  if (!Number.isFinite(target)) {
    return { ok: false, error: `"${label}": enter the target value as a number.` };
  }
  if (kind === "rate" && (baseline < 0 || baseline > 100 || target < 0 || target > 100)) {
    return { ok: false, error: `"${label}": a rate must sit between 0% and 100%.` };
  }
  if (baseline === target) {
    return { ok: false, error: `"${label}": the target must differ from the baseline.` };
  }
  if (direction === "increase" && target < baseline) {
    return {
      ok: false,
      error: `"${label}": higher is better, so the target must be above the baseline.`,
    };
  }
  if (direction === "decrease" && target > baseline) {
    return {
      ok: false,
      error: `"${label}": lower is better, so the target must be below the baseline.`,
    };
  }

  const absoluteChange = target - baseline;
  const relativeChangePct = baseline === 0 ? null : (absoluteChange / baseline) * 100;

  const observedRaw = String(criterion?.observed ?? "").trim();
  let observed = null;
  if (observedRaw !== "") {
    const value = toNumber(observedRaw);
    if (!Number.isFinite(value)) {
      return { ok: false, error: `"${label}": the observed value must be a number, or blank.` };
    }
    if (kind === "rate" && (value < 0 || value > 100)) {
      return { ok: false, error: `"${label}": an observed rate must sit between 0% and 100%.` };
    }
    observed = value;
  }

  let status = "pending";
  if (observed !== null) {
    const met = direction === "increase" ? observed >= target : observed <= target;
    status = met ? "pass" : "fail";
  }

  return {
    ok: true,
    label,
    kind,
    direction,
    tier,
    baseline,
    target,
    observed,
    absoluteChange,
    relativeChangePct,
    status,
  };
}

/**
 * Build the full pilot plan: validated criteria, sample size for the primary metric,
 * and the go/no-go decision rule.
 *
 * @param {object} input
 * @param {string} input.pilotName
 * @param {number|string} input.durationWeeks
 * @param {Array}  input.criteria           List of raw criterion objects.
 * @param {number} input.primaryIndex       Index of the criterion the pilot is sized on.
 * @param {string} input.significanceId     Id from SIGNIFICANCE_LEVELS.
 * @param {string} input.powerId            Id from POWER_LEVELS.
 * @param {number|string} input.stdDev      Standard deviation, required for a continuous primary.
 * @returns {object} plan, or { error } when the input cannot produce a meaningful answer.
 */
export function buildPilotPlan({
  pilotName,
  durationWeeks,
  criteria = [],
  primaryIndex = 0,
  significanceId = "0.05",
  powerId = "0.80",
  stdDev = "",
}) {
  const name = String(pilotName ?? "").replace(/\s+/g, " ").trim();
  if (!name) return { error: "Name the pilot so the criteria sheet has a title." };

  if (!Array.isArray(criteria) || criteria.length === 0) {
    return { error: "Add at least one success criterion." };
  }

  const weeks = toNumber(durationWeeks);
  if (!Number.isFinite(weeks) || weeks < DURATION_MIN_WEEKS || weeks > DURATION_MAX_WEEKS) {
    return {
      error: `Pilot length must be between ${DURATION_MIN_WEEKS} and ${DURATION_MAX_WEEKS} weeks.`,
    };
  }

  const evaluated = [];
  for (let i = 0; i < criteria.length; i += 1) {
    const outcome = evaluateCriterion(criteria[i], i);
    if (!outcome.ok) return { error: outcome.error };
    evaluated.push(outcome);
  }

  if (!evaluated.some((c) => c.tier === "must")) {
    return { error: "Mark at least one criterion as a must-have, or the pilot has no gate." };
  }

  const index = Number(primaryIndex);
  const primary = evaluated[Number.isInteger(index) && evaluated[index] ? index : 0];

  const significance =
    SIGNIFICANCE_LEVELS.find((s) => s.id === significanceId) ?? SIGNIFICANCE_LEVELS[0];
  const powerLevel = POWER_LEVELS.find((p) => p.id === powerId) ?? POWER_LEVELS[0];

  let samplePerArm = null;
  let sampleNote = "";
  if (primary.kind === "rate") {
    samplePerArm = sampleSizePerArmForProportions({
      p1: primary.baseline / 100,
      p2: primary.target / 100,
      zAlpha: significance.z,
      zBeta: powerLevel.z,
    });
    sampleNote =
      "Two-proportion normal approximation, two-sided, equal group sizes and no continuity correction.";
  } else {
    const sigma = toNumber(stdDev);
    if (!Number.isFinite(sigma) || sigma <= 0) {
      return {
        error:
          "The primary metric is an average, so enter the standard deviation of that measure (greater than zero).",
      };
    }
    samplePerArm = sampleSizePerArmForMeans({
      delta: primary.absoluteChange,
      stdDev: sigma,
      zAlpha: significance.z,
      zBeta: powerLevel.z,
    });
    sampleNote =
      "Two-sample z formula for means, two-sided, equal group sizes and a common standard deviation.";
  }

  if (samplePerArm === null) {
    return { error: "The primary metric cannot be sized — check its baseline, target and spread." };
  }

  const totalSample = samplePerArm * 2;
  const perWeek = Math.ceil(totalSample / weeks);
  const impractical = totalSample > IMPRACTICAL_SAMPLE_THRESHOLD;

  const mustHaves = evaluated.filter((c) => c.tier === "must");
  const measured = evaluated.filter((c) => c.status !== "pending");
  const passed = evaluated.filter((c) => c.status === "pass");

  let decision;
  let decisionReason;
  if (mustHaves.some((c) => c.status === "fail")) {
    decision = "No-go";
    decisionReason =
      "At least one must-have criterion was missed, so the pilot does not graduate as scoped.";
  } else if (mustHaves.every((c) => c.status === "pass")) {
    const niceMissed = evaluated.filter((c) => c.tier === "nice" && c.status === "fail").length;
    decision = niceMissed > 0 ? "Go with caveats" : "Go";
    decisionReason =
      niceMissed > 0
        ? `Every must-have was met, but ${niceMissed} nice-to-have criterion${niceMissed === 1 ? " was" : "s were"} missed — carry them into the rollout plan.`
        : "Every must-have criterion was met, so the pilot graduates as scoped.";
  } else {
    decision = "Not measured yet";
    decisionReason =
      "Leave the observed column blank until the pilot ends; the decision rule below is what you commit to now.";
  }

  const rule = [
    `GO if ${mustHaves.length === 1 ? "the single must-have criterion is" : `all ${mustHaves.length} must-have criteria are`} met`,
    `after ${weeks} week${weeks === 1 ? "" : "s"}`,
    `with at least ${samplePerArm.toLocaleString("en-US")} observations per arm`,
    "on the primary metric; NO-GO otherwise.",
  ].join(" ");

  const lines = [];
  lines.push(`# AI pilot success criteria — ${name}`);
  lines.push("");
  lines.push(`Pilot length: ${weeks} week${weeks === 1 ? "" : "s"}`);
  lines.push(`Primary metric: ${primary.label}`);
  lines.push(
    `Statistical plan: ${significance.label}, ${powerLevel.label}, ${samplePerArm.toLocaleString("en-US")} observations per arm (${totalSample.toLocaleString("en-US")} total, about ${perWeek.toLocaleString("en-US")} per week).`,
  );
  lines.push("");
  lines.push("## Criteria");
  evaluated.forEach((c, i) => {
    const unit = c.kind === "rate" ? "%" : "";
    const rel =
      c.relativeChangePct === null
        ? "n/a"
        : `${c.relativeChangePct > 0 ? "+" : ""}${c.relativeChangePct.toFixed(1)}%`;
    lines.push(
      `${i + 1}. [${c.tier === "must" ? "MUST" : "NICE"}] ${c.label} — ${c.direction === "increase" ? "raise" : "cut"} from ${c.baseline}${unit} to ${c.target}${unit} (relative change ${rel})${c.observed === null ? "" : ` — observed ${c.observed}${unit}: ${c.status.toUpperCase()}`}`,
    );
  });
  lines.push("");
  lines.push("## Decision rule");
  lines.push(rule);
  lines.push("");
  lines.push("## Status");
  lines.push(`${decision} — ${decisionReason}`);

  return {
    name,
    weeks,
    criteria: evaluated,
    primary,
    significance,
    powerLevel,
    samplePerArm,
    totalSample,
    perWeek,
    impractical,
    sampleNote,
    mustHaveCount: mustHaves.length,
    measuredCount: measured.length,
    passedCount: passed.length,
    decision,
    decisionReason,
    rule,
    doc: lines.join("\n"),
  };
}
