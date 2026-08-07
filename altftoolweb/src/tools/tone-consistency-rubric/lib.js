/**
 * Tone consistency rubric.
 *
 * Method: a behaviourally anchored rating scale (BARS). Each voice dimension is
 * a 1-5 scale where every level has a concrete written anchor, so two people
 * rating the same paragraph land on the same number. The score is the weighted
 * mean alignment with the target level, normalised per dimension by the worst
 * possible miss for that target — a target of 3 can only be missed by 2 points,
 * a target of 1 can be missed by 4, and an unnormalised average would punish
 * the second unfairly.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** Rating scale bounds. Five levels is the usual ceiling before rater agreement collapses. */
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 5;

/** Weight range offered in the UI. Zero means "ignore this dimension". */
export const MIN_WEIGHT = 0;
export const MAX_WEIGHT = 5;

export const DIMENSIONS = [
  {
    id: "formality",
    label: "Formality",
    lowLabel: "too casual",
    highLabel: "too formal",
    defaultTarget: 3,
    defaultWeight: 3,
    anchors: [
      "Texting register: lowercase starts, slang, emoji, sentence fragments.",
      "Relaxed and chatty: contractions everywhere, 'you'll want to', occasional aside.",
      "Professional but human: contractions kept, plain words, no legalese.",
      "Buttoned-up: few contractions, full sentences, cautious phrasing.",
      "Formal register: no contractions, third person, hedged and clause-heavy.",
    ],
  },
  {
    id: "warmth",
    label: "Warmth",
    lowLabel: "too cold",
    highLabel: "too effusive",
    defaultTarget: 4,
    defaultWeight: 3,
    anchors: [
      "Transactional: states facts, never addresses the reader's situation.",
      "Polite but distant: correct courtesies, no acknowledgement of feeling.",
      "Friendly: addresses the reader as 'you', acknowledges the problem once.",
      "Genuinely supportive: names the frustration, offers help before instructions.",
      "Effusive: repeated reassurance, superlatives, exclamation marks about the reader.",
    ],
  },
  {
    id: "directness",
    label: "Directness",
    lowLabel: "too hedged",
    highLabel: "too blunt",
    defaultTarget: 4,
    defaultWeight: 3,
    anchors: [
      "Buried: the ask or answer appears after three sentences of preamble.",
      "Hedged: 'you might want to consider possibly', qualifiers stacked.",
      "Balanced: answer in the first half, with a caveat where one is warranted.",
      "Answer first: the recommendation opens the message, reasons follow.",
      "Blunt: bare imperatives, no context, can read as curt.",
    ],
  },
  {
    id: "energy",
    label: "Energy",
    lowLabel: "too flat",
    highLabel: "too hyped",
    defaultTarget: 3,
    defaultWeight: 2,
    anchors: [
      "Flat: passive voice, long sentences, no verbs with momentum.",
      "Measured: steady pace, neutral verbs, no exclamation marks.",
      "Lively: active voice, varied sentence length, one point of emphasis.",
      "Punchy: short sentences, strong verbs, deliberate rhythm.",
      "Hype: exclamation marks, capitals, 'game-changing', 'insane'.",
    ],
  },
  {
    id: "jargon",
    label: "Jargon density",
    lowLabel: "too simplified",
    highLabel: "too jargon-heavy",
    defaultTarget: 2,
    defaultWeight: 2,
    anchors: [
      "Zero domain terms: anything technical is paraphrased in plain words.",
      "Everyday language: a domain term appears only when it is defined on first use.",
      "Mixed: assumes basic domain vocabulary, explains the specialist terms.",
      "Practitioner-level: acronyms used unexplained, dense noun phrases.",
      "Insider-only: undefined acronyms, internal codenames, unreadable outside the team.",
    ],
  },
  {
    id: "humour",
    label: "Humour",
    lowLabel: "too dry",
    highLabel: "too jokey",
    defaultTarget: 2,
    defaultWeight: 1,
    anchors: [
      "None: strictly informational.",
      "Dry: an occasional light turn of phrase, never a joke as such.",
      "Playful: about one wink per few paragraphs, never in an error state.",
      "Comedic: jokes are part of the structure, puns in headings.",
      "Constant: every sentence reaches for a gag, meaning takes second place.",
    ],
  },
];

export const VERDICT_BANDS = [
  { min: 90, label: "On voice", tone: "success", note: "Publishable as written; differences are inside normal rater noise." },
  { min: 75, label: "Minor drift", tone: "success", note: "One or two light edits will bring it back onto the guide." },
  { min: 60, label: "Noticeable drift", tone: "warning", note: "A reader who knows the brand would feel the difference. Revise before publishing." },
  { min: 0, label: "Off voice", tone: "danger", note: "This reads as a different brand. Rewrite against the target column rather than patching." },
];

/** How far off one dimension is, in plain words. */
export const SEVERITY = [
  { max: 0, label: "On target" },
  { max: 1, label: "Slight drift" },
  { max: 2, label: "Clear drift" },
  { max: 4, label: "Severe drift" },
];

const clampLevel = (n) => Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, n));

const toFinite = (value) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
};

const round = (value, dp = 2) => {
  const f = Math.pow(10, dp);
  return Math.round(value * f) / f;
};

export function severityFor(distance) {
  return (SEVERITY.find((s) => distance <= s.max) || SEVERITY[SEVERITY.length - 1]).label;
}

export function bandFor(score) {
  return VERDICT_BANDS.find((b) => score >= b.min) || VERDICT_BANDS[VERDICT_BANDS.length - 1];
}

/**
 * Worst possible miss for a given target on a 1-5 scale.
 * target 3 -> 2, target 1 or 5 -> 4. Never zero, so the division is always safe.
 */
export function worstMiss(target) {
  return Math.max(target - MIN_LEVEL, MAX_LEVEL - target);
}

/**
 * Grade one sample.
 * ratings / targets / weights are objects keyed by dimension id.
 * Returns { error } for anything the caller should fix rather than a bad number.
 */
export function scoreTone({ ratings = {}, targets = {}, weights = {} } = {}) {
  const rows = [];
  let weightSum = 0;
  let weightedAlignment = 0;

  for (const dim of DIMENSIONS) {
    const rating = toFinite(ratings[dim.id] ?? dim.defaultTarget);
    const target = toFinite(targets[dim.id] ?? dim.defaultTarget);
    const weight = toFinite(weights[dim.id] ?? dim.defaultWeight);

    if (Number.isNaN(rating) || Number.isNaN(target) || Number.isNaN(weight)) {
      return { error: `Enter numbers for every field on "${dim.label}".` };
    }
    if (rating < MIN_LEVEL || rating > MAX_LEVEL) {
      return { error: `"${dim.label}" rating must be between ${MIN_LEVEL} and ${MAX_LEVEL}.` };
    }
    if (target < MIN_LEVEL || target > MAX_LEVEL) {
      return { error: `"${dim.label}" target must be between ${MIN_LEVEL} and ${MAX_LEVEL}.` };
    }
    if (weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
      return { error: `"${dim.label}" weight must be between ${MIN_WEIGHT} and ${MAX_WEIGHT}.` };
    }

    const distance = Math.abs(rating - target);
    const worst = worstMiss(target);
    const alignment = 1 - distance / worst;
    const direction = distance === 0 ? "on target" : rating > target ? dim.highLabel : dim.lowLabel;

    weightSum += weight;
    weightedAlignment += weight * alignment;

    rows.push({
      id: dim.id,
      label: dim.label,
      rating,
      target,
      weight,
      distance: round(distance, 2),
      alignmentPct: round(alignment * 100, 1),
      direction,
      severity: severityFor(distance),
      loss: round(weight * (distance / worst), 4),
      anchorObserved: dim.anchors[clampLevel(Math.round(rating)) - 1],
      anchorTarget: dim.anchors[clampLevel(Math.round(target)) - 1],
    });
  }

  if (weightSum <= 0) {
    return { error: "At least one dimension needs a weight above zero, otherwise there is nothing to score." };
  }

  const score = Math.round((weightedAlignment / weightSum) * 100);
  const drifting = rows.filter((r) => r.distance > 0 && r.weight > 0).sort((a, b) => b.loss - a.loss);
  const onTarget = rows.filter((r) => r.distance === 0);

  return {
    rows,
    score,
    band: bandFor(score),
    weightSum: round(weightSum, 2),
    drifting,
    onTargetCount: onTarget.length,
    biggestDrift: drifting[0] || null,
    meanDistance: round(rows.reduce((s, r) => s + r.distance, 0) / rows.length, 2),
  };
}

/**
 * Rater agreement between two people scoring the same sample.
 * Exact agreement and adjacent agreement (within one scale point) are the two
 * figures normally reported for anchored 1-5 rubrics; adjacent agreement below
 * about 80% usually means an anchor is ambiguous rather than the rater is wrong.
 */
export const ADJACENT_AGREEMENT_TARGET_PCT = 80;

export function compareRaters(raterA = {}, raterB = {}) {
  const pairs = [];
  for (const dim of DIMENSIONS) {
    const a = toFinite(raterA[dim.id]);
    const b = toFinite(raterB[dim.id]);
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    if (a < MIN_LEVEL || a > MAX_LEVEL || b < MIN_LEVEL || b > MAX_LEVEL) continue;
    pairs.push({ id: dim.id, label: dim.label, a, b, diff: Math.abs(a - b) });
  }
  if (pairs.length === 0) {
    return { error: "Enter both raters' scores on at least one dimension." };
  }
  const exact = pairs.filter((p) => p.diff === 0).length;
  const adjacent = pairs.filter((p) => p.diff <= 1).length;
  return {
    pairs,
    n: pairs.length,
    exactPct: round((exact / pairs.length) * 100, 1),
    adjacentPct: round((adjacent / pairs.length) * 100, 1),
    meanAbsDiff: round(pairs.reduce((s, p) => s + p.diff, 0) / pairs.length, 2),
    passesTarget: (adjacent / pairs.length) * 100 >= ADJACENT_AGREEMENT_TARGET_PCT,
    worstPair: [...pairs].sort((x, y) => y.diff - x.diff)[0],
  };
}

/** Copyable plain-text scorecard. */
export function buildSummary(result, sampleName = "Sample") {
  if (!result || result.error) return "";
  const lines = [
    `Tone Consistency Rubric — ${sampleName || "Sample"}`,
    `Score: ${result.score}/100 (${result.band.label})`,
    `${result.onTargetCount} of ${result.rows.length} dimensions on target · mean miss ${result.meanDistance} points`,
    "",
    "Dimension | Target | Observed | Verdict",
  ];
  result.rows.forEach((r) => {
    lines.push(
      `${r.label} | ${r.target} | ${r.rating} | ${r.distance === 0 ? "on target" : `${r.severity}, ${r.direction}`}`
    );
  });
  if (result.biggestDrift) {
    lines.push("", `Fix first: ${result.biggestDrift.label} — currently ${result.biggestDrift.direction}.`);
    lines.push(`Target anchor: ${result.biggestDrift.anchorTarget}`);
  }
  return lines.join("\n");
}
