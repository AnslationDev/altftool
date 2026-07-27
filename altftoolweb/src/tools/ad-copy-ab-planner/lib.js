/**
 * Ad Copy A/B Planner — sizes and schedules a two-variant ad copy test, and
 * checks each variant against the character limits the ad platform enforces.
 *
 * Sample size uses the standard two-proportion test with a pooled null variance:
 *
 *   n per variant = [ z(1-a/2) * sqrt(2 * p_bar * (1 - p_bar))
 *                   + z(power) * sqrt(p1(1-p1) + p2(1-p2)) ]^2 / (p2 - p1)^2
 *
 * where p1 is the control rate, p2 the rate you want to be able to detect, and
 * p_bar = (p1 + p2) / 2. This is the formula behind every standard A/B test
 * calculator; it assumes a fixed-horizon test (decide once, at the end).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Two-sided normal quantiles z(1 - alpha/2) for the usual confidence levels. */
export const Z_BY_CONFIDENCE = {
  90: 1.6448536269514722,
  95: 1.959963984540054,
  99: 2.5758293035489004,
};

/** One-sided normal quantiles z(power) for the usual power targets. */
export const Z_BY_POWER = {
  80: 0.8416212335729143,
  90: 1.2815515655446004,
  95: 1.6448536269514722,
};

/**
 * Denominator units a copy test can be measured in.
 * `costBasis` is how many units one unit of cost buys: CPM prices 1000
 * impressions, CPC prices a single click.
 */
export const METRIC_UNITS = {
  impressions: { label: "Impressions (testing CTR)", costBasis: 1000, costLabel: "CPM (cost per 1,000 impressions)" },
  clicks: { label: "Clicks (testing conversion rate)", costBasis: 1, costLabel: "CPC (cost per click)" },
};

/**
 * Published character limits for the fields a copy test usually varies.
 * Sources: Google Ads responsive search ad specs, Meta Ads text guidance,
 * LinkedIn sponsored content specs, X ads copy limits.
 */
export const PLATFORM_SPECS = {
  "google-rsa": {
    label: "Google — Responsive Search Ad",
    fields: [
      { id: "headline", label: "Headline", limit: 30 },
      { id: "description", label: "Description", limit: 90 },
      { id: "path", label: "Display path", limit: 15 },
    ],
  },
  meta: {
    label: "Meta — Facebook / Instagram",
    fields: [
      { id: "primary", label: "Primary text", limit: 125 },
      { id: "headline", label: "Headline", limit: 40 },
      { id: "description", label: "Link description", limit: 30 },
    ],
  },
  linkedin: {
    label: "LinkedIn — Sponsored Content",
    fields: [
      { id: "intro", label: "Introductory text", limit: 150 },
      { id: "headline", label: "Headline", limit: 70 },
    ],
  },
  x: {
    label: "X — Promoted Post",
    fields: [{ id: "post", label: "Post text", limit: 280 }],
  },
};

/** Action verbs used for the call-to-action check on each variant. */
export const CTA_VERBS = [
  "buy", "book", "browse", "call", "claim", "compare", "download", "explore",
  "find", "get", "grab", "join", "learn", "order", "register", "save", "see",
  "shop", "start", "switch", "try", "unlock", "upgrade",
];

/** A test shorter than this cannot cover a full weekly traffic cycle. */
export const MIN_SOUND_TEST_DAYS = 7;

/** Above this many days the market itself has usually changed underneath you. */
export const MAX_PRACTICAL_TEST_DAYS = 56;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Size and schedule a two-variant copy test.
 *
 * @param {object} input
 * @param {number} input.baselineRatePercent current CTR or conversion rate, e.g. 2 for 2%
 * @param {number} input.relativeLiftPercent smallest lift worth detecting, e.g. 20 for +20% relative
 * @param {number} input.dailyVolume impressions or clicks available per day across BOTH variants
 * @param {number} input.confidence 90 | 95 | 99
 * @param {number} input.power 80 | 90 | 95
 * @param {number} [input.unitCost] CPM or CPC used to price the test
 * @param {"impressions"|"clicks"} [input.unit]
 * @returns {object} plan, or { error }
 */
export function planAbTest({
  baselineRatePercent,
  relativeLiftPercent,
  dailyVolume,
  confidence = 95,
  power = 80,
  unitCost = 0,
  unit = "impressions",
}) {
  if (!isNum(baselineRatePercent) || baselineRatePercent <= 0) {
    return { error: "Enter a baseline rate greater than 0%." };
  }
  if (baselineRatePercent >= 100) {
    return { error: "A baseline rate of 100% or more leaves nothing to improve." };
  }
  if (!isNum(relativeLiftPercent) || relativeLiftPercent <= 0) {
    return { error: "Enter the lift you want to detect as a percentage above zero." };
  }
  if (!isNum(dailyVolume) || dailyVolume <= 0) {
    return { error: "Enter the daily traffic available for the test." };
  }
  const z = Z_BY_CONFIDENCE[confidence];
  const zPower = Z_BY_POWER[power];
  if (!z || !zPower) return { error: "Choose a supported confidence level and power target." };

  const p1 = baselineRatePercent / 100;
  const p2 = p1 * (1 + relativeLiftPercent / 100);
  if (p2 >= 1) {
    return { error: "That lift pushes the variant rate to 100% or more, which cannot be tested." };
  }

  const delta = p2 - p1;
  const pBar = (p1 + p2) / 2;
  const pooled = z * Math.sqrt(2 * pBar * (1 - pBar));
  const unpooled = zPower * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  const perVariant = Math.ceil(((pooled + unpooled) ** 2) / (delta * delta));

  if (!Number.isFinite(perVariant) || perVariant <= 0) {
    return { error: "That combination of rate and lift is too small to size a test for." };
  }

  const totalSample = perVariant * 2;
  const days = Math.ceil(totalSample / dailyVolume);
  const unitMeta = METRIC_UNITS[unit] ?? METRIC_UNITS.impressions;
  const cost = isNum(unitCost) && unitCost > 0 ? (totalSample / unitMeta.costBasis) * unitCost : 0;

  return {
    perVariant,
    totalSample,
    days,
    weeks: days / 7,
    /** Rounding the schedule up to whole weeks removes day-of-week bias. */
    wholeWeeks: Math.max(1, Math.ceil(days / 7)),
    baselineRate: p1,
    variantRate: p2,
    absoluteLiftPoints: delta * 100,
    expectedControlEvents: perVariant * p1,
    expectedVariantEvents: perVariant * p2,
    estimatedCost: cost,
    dailyVolume,
    unit: unitMeta.label,
    tooShort: days < MIN_SOUND_TEST_DAYS,
    tooLong: days > MAX_PRACTICAL_TEST_DAYS,
  };
}

/**
 * The lift a given traffic budget can actually detect — the inverse question.
 * Solved by bisection on planAbTest, because the sample-size formula cannot be
 * inverted in closed form once the pooled and unpooled terms differ.
 *
 * @returns {{ relativeLiftPercent:number } | { error:string }}
 */
export function detectableLift({ baselineRatePercent, dailyVolume, days, confidence = 95, power = 80 }) {
  if (!isNum(days) || days <= 0) return { error: "Enter how many days you can run the test." };
  if (!isNum(dailyVolume) || dailyVolume <= 0) return { error: "Enter the daily traffic available." };
  const budget = dailyVolume * days;

  let low = 0.1;
  let high = 500;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const plan = planAbTest({
      baselineRatePercent,
      relativeLiftPercent: mid,
      dailyVolume,
      confidence,
      power,
    });
    if (plan.error) {
      high = mid;
      continue;
    }
    if (plan.totalSample > budget) low = mid;
    else high = mid;
  }
  const answer = high;
  if (!Number.isFinite(answer) || answer >= 499) {
    return { error: "That traffic cannot detect any realistic lift — run the test for longer." };
  }
  return { relativeLiftPercent: answer };
}

/**
 * Check one piece of copy against a platform field limit and run the
 * plain-language checks that decide whether two variants differ meaningfully.
 *
 * @returns {object}
 */
export function analyseCopy(text, limit) {
  const value = typeof text === "string" ? text : "";
  const trimmed = value.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const lower = trimmed.toLowerCase();
  const cap = isNum(limit) && limit > 0 ? Math.round(limit) : null;
  return {
    characters: value.length,
    limit: cap,
    remaining: cap === null ? null : cap - value.length,
    overBy: cap === null ? 0 : Math.max(0, value.length - cap),
    withinLimit: cap === null ? true : value.length <= cap,
    words: words.length,
    averageWordLength: words.length ? trimmed.replace(/\s/g, "").length / words.length : 0,
    hasNumber: /\d/.test(value),
    hasQuestion: value.includes("?"),
    hasCta: CTA_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(lower)),
    upperCaseWords: words.filter((word) => word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)).length,
  };
}

/**
 * How different two variants are, as the share of distinct words they do NOT
 * share (1 - Jaccard similarity on the lower-cased word sets). A copy test
 * where the variants overlap almost completely tells you very little.
 *
 * @returns {{ differencePercent:number, sharedWords:number, totalWords:number }}
 */
export function copyDifference(a, b) {
  const words = (text) =>
    new Set(
      String(text ?? "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean),
    );
  const setA = words(a);
  const setB = words(b);
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return { differencePercent: 0, sharedWords: 0, totalWords: 0 };
  let shared = 0;
  for (const word of setA) if (setB.has(word)) shared += 1;
  return {
    differencePercent: (1 - shared / union.size) * 100,
    sharedWords: shared,
    totalWords: union.size,
  };
}
