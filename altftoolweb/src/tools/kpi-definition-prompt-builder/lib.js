/**
 * KPI Definition Prompt Builder — pure logic.
 *
 *  1. Real metric arithmetic: numerator over denominator evaluated as a
 *     percentage, ratio, rate per N, average, count or currency figure.
 *  2. Real statistics for proportion metrics: the 95% margin of error using the
 *     normal approximation, and the sample size needed to reach a target margin.
 *  3. Deterministic assembly of the metric-definition prompt.
 *
 * No React, no DOM, no clocks.
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/**
 * Two-tailed z value for a 95% confidence interval on a normal distribution.
 * 1.96 is the rounded textbook figure; 1.959964 is the precise value.
 */
export const Z_95 = 1.959964;

/**
 * Normal-approximation margin of error is unreliable when the expected count of
 * successes or failures is under 5 — the standard np >= 5 and n(1-p) >= 5 rule.
 */
export const MIN_EXPECTED_COUNT = 5;

/** Above this margin (in percentage points) a proportion metric is too noisy to steer by. */
export const NOISY_MOE_PP = 5;

export const METRIC_TYPES = {
  percentage: { label: "Percentage (e.g. conversion rate)", unit: "%", proportion: true },
  ratio: { label: "Ratio (e.g. LTV to CAC)", unit: "x", proportion: false },
  "rate-per": { label: "Rate per N (e.g. errors per 1,000 sessions)", unit: "", proportion: false },
  average: { label: "Average (e.g. items per order)", unit: "", proportion: false },
  count: { label: "Count (e.g. signups)", unit: "", proportion: false },
  currency: { label: "Money per unit (e.g. ARPU)", unit: "", proportion: false },
};

export const GRAINS = ["Daily", "Weekly", "Monthly", "Quarterly", "Rolling 7 days", "Rolling 28 days"];

export const DIRECTIONS = {
  up: "higher is better",
  down: "lower is better",
  target: "closer to the target is better",
};

/** Edge cases every metric definition should settle before it ships. */
export const EDGE_CASES = [
  "Denominator is zero",
  "Late-arriving or backfilled events",
  "Duplicate events from retries",
  "Test, internal and bot traffic",
  "Refunds, cancellations and reversals",
  "Users who appear in more than one segment",
  "Time zone and day-boundary definition",
  "Deleted or anonymised records",
  "Currency conversion and exchange-rate date",
  "Partial periods at the start and end",
];

function clean(text) {
  return String(text ?? "").trim();
}

function round(value, places = 2) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Evaluate the metric for one worked example.
 * @returns {{value: number, display: string} | {error: string}}
 */
export function evaluateMetric({ type, numerator, denominator, perN = 1000, currency = "USD" }) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return { error: "Numerator and denominator must both be numbers." };
  }
  if (type === "count") {
    return { value: numerator, display: numerator.toLocaleString("en-US") };
  }
  if (denominator === 0) {
    return { error: "Denominator is zero — decide what the metric shows for an empty denominator before shipping it." };
  }
  const quotient = numerator / denominator;
  switch (type) {
    case "percentage":
      return { value: quotient * 100, display: `${round(quotient * 100, 2)}%` };
    case "ratio":
      return { value: quotient, display: `${round(quotient, 2)}x` };
    case "rate-per": {
      if (!Number.isFinite(perN) || perN <= 0) return { error: "The 'per N' figure must be greater than zero." };
      return { value: quotient * perN, display: `${round(quotient * perN, 2)} per ${perN.toLocaleString("en-US")}` };
    }
    case "currency": {
      let display;
      try {
        display = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(quotient);
      } catch {
        display = `${currency} ${round(quotient, 2)}`;
      }
      return { value: quotient, display };
    }
    default:
      return { value: quotient, display: String(round(quotient, 2)) };
  }
}

/**
 * 95% margin of error for a proportion, in percentage points, using the normal
 * approximation: z * sqrt(p(1-p)/n).
 */
export function proportionMarginOfError(successes, sample) {
  if (!(sample > 0)) return null;
  const p = successes / sample;
  if (!(p >= 0) || !(p <= 1)) return null;
  return Z_95 * Math.sqrt((p * (1 - p)) / sample) * 100;
}

/**
 * Sample size needed for a target margin of error in percentage points:
 * n = z² p(1-p) / e², with e expressed as a proportion.
 */
export function requiredSample(p, targetMoePP) {
  if (!(p >= 0) || !(p <= 1) || !(targetMoePP > 0)) return null;
  const e = targetMoePP / 100;
  return Math.ceil((Z_95 ** 2 * p * (1 - p)) / e ** 2);
}

/**
 * @returns {{error: string} | object}
 */
export function buildKpiPrompt({
  metricName = "",
  type = "percentage",
  numeratorDefinition = "",
  denominatorDefinition = "",
  sampleNumerator = 0,
  sampleDenominator = 0,
  perN = 1000,
  currency = "USD",
  grain = "Weekly",
  direction = "up",
  targetValue = "",
  owner = "",
  sourceTables = "",
  edgeCases = [],
  targetMoePP = 2,
} = {}) {
  const name = clean(metricName);
  const numDef = clean(numeratorDefinition);
  const denDef = clean(denominatorDefinition);
  const num = Number(sampleNumerator);
  const den = Number(sampleDenominator);
  const per = Number(perN);
  const targetMoe = Number(targetMoePP);

  if (!name) return { error: "Name the metric you are defining." };
  if (!numDef) return { error: "Define the numerator — exactly which events or rows are counted." };
  if (type !== "count" && !denDef) {
    return { error: "Define the denominator — exactly what the numerator is divided by." };
  }
  if (![num, den, per, targetMoe].every(Number.isFinite)) {
    return { error: "The worked-example numbers must all be numeric." };
  }
  if (num < 0 || den < 0) return { error: "Worked-example counts cannot be negative." };
  if (targetMoe <= 0 || targetMoe > 50) {
    return { error: "Target margin of error should be between 0 and 50 percentage points." };
  }
  if (!METRIC_TYPES[type]) return { error: "Pick a metric type from the list." };

  const evaluated = evaluateMetric({ type, numerator: num, denominator: den, perN: per, currency });
  if (evaluated.error) return { error: evaluated.error };

  const isProportion = METRIC_TYPES[type].proportion;
  let moe = null;
  let needed = null;
  let stability = null;
  if (isProportion && den > 0) {
    if (num > den) {
      return { error: "For a percentage metric the numerator cannot exceed the denominator." };
    }
    const p = num / den;
    moe = proportionMarginOfError(num, den);
    needed = requiredSample(p, targetMoe);
    const expectedSuccess = num;
    const expectedFailure = den - num;
    if (expectedSuccess < MIN_EXPECTED_COUNT || expectedFailure < MIN_EXPECTED_COUNT) {
      stability = `Fewer than ${MIN_EXPECTED_COUNT} in one of the two outcome groups — the normal approximation does not hold, so treat the interval as indicative only.`;
    } else if (moe !== null && moe > NOISY_MOE_PP) {
      stability = `Margin of error is over ${NOISY_MOE_PP} percentage points at this sample size — the metric will move on noise alone.`;
    } else {
      stability = "Sample is large enough for the interval to be usable at this grain.";
    }
  }

  const chosenEdges = (Array.isArray(edgeCases) ? edgeCases : []).map(clean).filter(Boolean);
  const directionText = DIRECTIONS[direction] ?? DIRECTIONS.up;

  const lines = [];
  lines.push(`Act as an analytics engineer. Write a complete, unambiguous definition for one metric: ${name}.`);
  lines.push("");
  lines.push("WHAT I ALREADY KNOW");
  lines.push(`- Metric type: ${METRIC_TYPES[type].label}`);
  lines.push(`- Numerator: ${numDef}`);
  if (type !== "count") lines.push(`- Denominator: ${denDef}`);
  if (type === "rate-per") lines.push(`- Expressed per ${per.toLocaleString("en-US")}`);
  lines.push(`- Reporting grain: ${grain}`);
  lines.push(`- Direction: ${directionText}`);
  if (clean(targetValue)) lines.push(`- Target: ${clean(targetValue)}`);
  if (clean(owner)) lines.push(`- Owner: ${clean(owner)}`);
  if (clean(sourceTables)) lines.push(`- Source tables or events: ${clean(sourceTables)}`);
  lines.push("");
  lines.push("WORKED EXAMPLE");
  if (type === "count") {
    lines.push(`- Count: ${evaluated.display}`);
  } else {
    lines.push(`- Numerator ${num.toLocaleString("en-US")} over denominator ${den.toLocaleString("en-US")} gives ${evaluated.display}`);
  }
  if (moe !== null) {
    lines.push(
      `- 95% margin of error at this sample: ±${round(moe, 2)} percentage points (normal approximation, z = ${Z_95})`,
    );
    lines.push(`- To get within ±${targetMoe} points you would need about ${needed.toLocaleString("en-US")} in the denominator`);
    lines.push(`- Stability: ${stability}`);
  }
  lines.push("");
  lines.push("WHAT TO PRODUCE");
  lines.push("1. A one-sentence definition a non-analyst could read aloud in a meeting without ambiguity.");
  lines.push("2. The formula written out, naming the exact events, filters and time window on both sides.");
  lines.push("3. A list of what is explicitly excluded, and why each exclusion exists.");
  if (chosenEdges.length) {
    lines.push(`4. A decision for each of these edge cases, stated as a rule rather than a caveat: ${chosenEdges.join("; ")}.`);
  } else {
    lines.push("4. The edge cases this metric will hit in production, each with a decided rule rather than a caveat.");
  }
  lines.push("5. Three ways this metric can be gamed or accidentally inflated, and the guardrail metric that would catch each.");
  lines.push("6. The smallest change that should count as real movement, given the margin of error above.");
  lines.push("7. Two metrics this one must be read alongside, so nobody optimises it in isolation.");
  lines.push("");
  lines.push("Be specific to the definitions I gave. Where my definition is ambiguous, say which reading you took and flag it as a decision I still owe you.");

  const prompt = lines.join("\n");

  return {
    prompt,
    display: evaluated.display,
    value: evaluated.value,
    marginOfError: moe === null ? null : round(moe, 2),
    requiredSampleSize: needed,
    stability,
    isProportion,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
