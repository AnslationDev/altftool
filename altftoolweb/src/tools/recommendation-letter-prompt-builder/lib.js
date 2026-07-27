/**
 * Recommendation Letter Prompt Builder — pure logic.
 *
 * Three real computations:
 *  1. computeRanking() turns "rank 3 of 120" into an honest percentile band.
 *     A letter may only claim a band the cohort size can actually support:
 *     you cannot say "top 1%" of a class of 40, because 1/40 is 2.5%.
 *  2. allocateWordBudget() splits the target length across the six sections of
 *     a reference letter by the largest-remainder method, so the figures sum
 *     exactly to the target.
 *  3. scoreExample() checks each anecdote for the three things admissions and
 *     hiring committees look for: a named artefact, a stated outcome, and a
 *     comparison against a peer group.
 *
 * No React, no DOM, no Date.now().
 */

/**
 * Typical length ranges. A reference letter is conventionally one page for
 * employment and one to two pages for academic admissions; at 12pt, single
 * spaced, one-inch margins a page holds roughly 500 words.
 */
export const WORDS_PER_PAGE = 500;

export const LETTER_TYPES = [
  { key: "grad", label: "Graduate school (MS or PhD)", profile: "academic", minWords: 500, maxWords: 800, defaultWords: 650 },
  { key: "undergrad", label: "Undergraduate admission", profile: "academic", minWords: 400, maxWords: 650, defaultWords: 500 },
  { key: "scholarship", label: "Scholarship or fellowship", profile: "academic", minWords: 450, maxWords: 700, defaultWords: 550 },
  { key: "job", label: "Employment reference", profile: "professional", minWords: 300, maxWords: 500, defaultWords: 400 },
  { key: "promotion", label: "Promotion or tenure", profile: "professional", minWords: 600, maxWords: 1000, defaultWords: 750 },
  { key: "character", label: "Character or community reference", profile: "professional", minWords: 250, maxWords: 450, defaultWords: 350 },
];

export const RELATIONSHIPS = [
  "Course instructor",
  "Thesis or research supervisor",
  "Direct manager",
  "Skip-level manager",
  "Project mentor",
  "Close colleague",
  "Client",
  "Community or volunteer lead",
];

/**
 * Section weights. Both profiles sum to 1. Academic letters spend more words on
 * independent work; professional letters spend more on a single worked example.
 */
export const SECTION_PROFILES = {
  academic: [
    { key: "opening", label: "Opening and how you know them", weight: 0.12 },
    { key: "ability", label: "Core ability, with evidence", weight: 0.28 },
    { key: "anecdote", label: "One specific worked example", weight: 0.22 },
    { key: "independent", label: "Independent work and initiative", weight: 0.18 },
    { key: "comparison", label: "Comparison against the cohort", weight: 0.12 },
    { key: "closing", label: "Closing endorsement and contact offer", weight: 0.08 },
  ],
  professional: [
    { key: "opening", label: "Opening and how you know them", weight: 0.14 },
    { key: "ability", label: "Core competence, with evidence", weight: 0.3 },
    { key: "anecdote", label: "One specific worked example", weight: 0.24 },
    { key: "independent", label: "Working with and through others", weight: 0.16 },
    { key: "comparison", label: "Comparison against peers", weight: 0.1 },
    { key: "closing", label: "Closing endorsement and contact offer", weight: 0.06 },
  ],
};

/**
 * Percentile bands letters conventionally use. A claim is rounded UP to the
 * next band so it never overstates: 2.5% is reported as "top 5%", not "top 1%".
 */
export const PERCENTILE_BANDS = [1, 2, 5, 10, 15, 20, 25, 33, 50];

/**
 * Below this cohort size a percentile reads as false precision — say
 * "the strongest of the N students I supervised" instead.
 */
export const MIN_COHORT_FOR_PERCENTILE = 20;

/** Weights for anecdote specificity. Sum to 1. */
export const EXAMPLE_WEIGHTS = { named: 0.4, outcome: 0.4, comparison: 0.2 };

export const MAX_EXAMPLES = 12;

const NAMED_PATTERNS = [
  /\b[A-Z]{2,5}\s?\d{2,4}\b/, // course or module code, e.g. CS 229
  /"[^"]{3,}"/, // a quoted title
  /\b\w+\s+[A-Z][a-z]{2,}/, // a proper noun that is not the first word
];

const OUTCOME_PATTERNS = [
  /\d+(?:\.\d+)?\s*%/,
  /[₹$€£¥]\s?\d/,
  /\b(?:published|accepted|awarded|won|shortlisted|presented|shipped|patented|selected|graded|scored|ranked|cited)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:papers?|citations?|users?|students?|marks?|points?|weeks?|months?|hours?|percentile|gpa|cgpa)\b/i,
];

const COMPARISON_PATTERNS = [
  /\btop\s+\d/i,
  /\b(?:only|first|best|strongest|rare|rarely|unlike|compared with|compared to|among the|one of the)\b/i,
  /\b\d+\s*(?:of|out of)\s*\d+\b/i,
];

const matchesAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

/** Split a textarea into a clean list of lines. */
export function parseLines(raw, max = MAX_EXAMPLES) {
  if (typeof raw !== "string") return [];
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const item = line
      .replace(/^\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^[-*•–]\s*/, "")
      .trim();
    if (!item) continue;
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Honest percentile from a rank inside a cohort.
 * Returns { error } for impossible input; never NaN or Infinity.
 */
export function computeRanking({ rank, cohortSize } = {}) {
  const r = Number(rank);
  const n = Number(cohortSize);
  if (!Number.isFinite(r) || !Number.isFinite(n)) {
    return { error: "Rank and cohort size must both be numbers." };
  }
  if (!Number.isInteger(r) || !Number.isInteger(n)) {
    return { error: "Rank and cohort size must be whole numbers." };
  }
  if (n < 2) return { error: "Cohort size must be at least 2 for a comparison to mean anything." };
  if (r < 1) return { error: "Rank starts at 1 — rank 1 is the strongest person in the cohort." };
  if (r > n) return { error: "Rank cannot be larger than the cohort size." };

  const exactPercent = (r / n) * 100;
  const band = PERCENTILE_BANDS.find((value) => exactPercent <= value) ?? null;
  const smallCohort = n < MIN_COHORT_FOR_PERCENTILE;

  let phrase;
  if (smallCohort) {
    phrase =
      r === 1
        ? `the strongest of the ${n} people I have worked with in this capacity`
        : `among the ${r === 2 ? "two" : r} strongest of the ${n} people I have worked with in this capacity`;
  } else if (band === null) {
    phrase = "no percentile claim — the rank does not support one; describe the work instead";
  } else {
    phrase = `top ${band}%`;
  }

  return {
    rank: r,
    cohortSize: n,
    exactPercent,
    band,
    smallCohort,
    supportable: band !== null,
    phrase,
    note: smallCohort
      ? `A cohort of ${n} is below ${MIN_COHORT_FOR_PERCENTILE}, so a percentage would be false precision. Name the actual numbers instead.`
      : band === null
        ? "A rank in the bottom half cannot be dressed up as a percentile. Write about what the person did well and let the reader draw conclusions."
        : `Rank ${r} of ${n} is ${exactPercent.toFixed(1)}%, rounded up to the next conventional band so the claim is never overstated.`,
  };
}

/** Largest-remainder split of the target words across a section profile. */
export function allocateWordBudget(target, sections) {
  const total = Math.round(Number(target));
  const usable = (Array.isArray(sections) ? sections : []).filter((s) => Number(s.weight) > 0);
  if (!Number.isFinite(total) || total < 0 || usable.length === 0) return [];

  const weightSum = usable.reduce((sum, s) => sum + Number(s.weight), 0);
  const exact = usable.map((s) => (total * Number(s.weight)) / weightSum);
  const floors = exact.map((value) => Math.floor(value));
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);

  const order = exact
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  for (let i = 0; remainder > 0 && i < order.length; i += 1) {
    floors[order[i].index] += 1;
    remainder -= 1;
  }

  return usable.map((section, index) => ({
    key: section.key,
    label: section.label,
    words: floors[index],
    share: total > 0 ? floors[index] / total : 0,
  }));
}

/** Specificity score, 0-100, for one anecdote. */
export function scoreExample(text) {
  const value = typeof text === "string" ? text.trim() : "";
  const hasNamed = value ? matchesAny(value, NAMED_PATTERNS) : false;
  const hasOutcome = value ? matchesAny(value, OUTCOME_PATTERNS) : false;
  const hasComparison = value ? matchesAny(value, COMPARISON_PATTERNS) : false;

  const score = Math.round(
    100 *
      ((hasNamed ? EXAMPLE_WEIGHTS.named : 0) +
        (hasOutcome ? EXAMPLE_WEIGHTS.outcome : 0) +
        (hasComparison ? EXAMPLE_WEIGHTS.comparison : 0)),
  );

  const missing = [];
  if (!hasNamed) missing.push("a named course, project or artefact");
  if (!hasOutcome) missing.push("what came of it");
  if (!hasComparison) missing.push("how it compared with peers");

  return { text: value, hasNamed, hasOutcome, hasComparison, score, missing };
}

/** Page estimate from a word count, to one decimal. */
export function estimatePages(words) {
  const value = Number(words);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round((value / WORDS_PER_PAGE) * 10) / 10;
}

/** Assemble the prompt. Returns { error } for unusable input. */
export function buildRecommendationPrompt(input = {}) {
  const {
    candidateName = "",
    letterType = "grad",
    targetProgramme = "",
    relationship = RELATIONSHIPS[0],
    monthsKnown = 24,
    capacity = "",
    examplesRaw = "",
    strengthsRaw = "",
    rank = "",
    cohortSize = "",
    wordTarget = "",
    includeReservation = false,
  } = input;

  const name = String(candidateName).trim();
  if (!name) return { error: "Enter the name of the person you are writing about." };

  const type = LETTER_TYPES.find((entry) => entry.key === letterType) || LETTER_TYPES[0];

  const months = Math.round(Number(monthsKnown));
  if (!Number.isFinite(months)) return { error: "Months known must be a number." };
  if (months < 1) return { error: "You need to have known the person for at least one month to write a reference." };
  if (months > 720) return { error: "Months known looks wrong — 720 months is 60 years." };

  const target = wordTarget === "" || wordTarget === null ? type.defaultWords : Math.round(Number(wordTarget));
  if (!Number.isFinite(target)) return { error: "Target length must be a number." };
  if (target < type.minWords || target > type.maxWords) {
    return {
      error: `A ${type.label.toLowerCase()} letter usually runs ${type.minWords}-${type.maxWords} words.`,
    };
  }

  const examples = parseLines(examplesRaw);
  if (examples.length === 0) {
    return { error: "Add at least one specific example, one per line — a letter with no example carries no weight." };
  }
  const strengths = parseLines(strengthsRaw);

  const scored = examples.map(scoreExample);
  const exampleScore = Math.round(scored.reduce((sum, item) => sum + item.score, 0) / scored.length);

  const wantsRanking = String(rank).trim() !== "" && String(cohortSize).trim() !== "";
  const ranking = wantsRanking ? computeRanking({ rank: Number(rank), cohortSize: Number(cohortSize) }) : null;
  if (ranking && ranking.error) return { error: ranking.error };

  const budget = allocateWordBudget(target, SECTION_PROFILES[type.profile]);
  const years = Math.floor(months / 12);
  const leftoverMonths = months % 12;
  const durationPhrase =
    years === 0
      ? `${months} month${months === 1 ? "" : "s"}`
      : leftoverMonths === 0
        ? `${years} year${years === 1 ? "" : "s"}`
        : `${years} year${years === 1 ? "" : "s"} and ${leftoverMonths} month${leftoverMonths === 1 ? "" : "s"}`;

  const shortAcquaintance = months < 6;

  const numbered = (items) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const lines = [];
  lines.push(
    `You are writing a letter of recommendation. Type: ${type.label}. Target length: about ${target} words (roughly ${estimatePages(target)} page${estimatePages(target) === 1 ? "" : "s"}).`,
  );
  lines.push("");
  lines.push("FACTS");
  lines.push(`- Person being recommended: ${name}`);
  lines.push(
    String(targetProgramme).trim()
      ? `- Applying to: ${String(targetProgramme).trim()}`
      : "- Applying to: not supplied. Keep the letter general and mark [PROGRAMME] where it should be named.",
  );
  lines.push(`- My relationship to them: ${relationship}`);
  lines.push(`- Length of acquaintance: ${durationPhrase}`);
  if (String(capacity).trim()) lines.push(`- Capacity in which I observed them: ${String(capacity).trim()}`);
  if (ranking) {
    lines.push(
      ranking.supportable || ranking.smallCohort
        ? `- Comparison I can honestly make: ${ranking.phrase} (rank ${ranking.rank} of ${ranking.cohortSize}). Use this exact wording and no stronger claim.`
        : `- Comparison: rank ${ranking.rank} of ${ranking.cohortSize}. Do NOT make a percentile claim. Describe the work and leave the comparison out.`,
    );
  } else {
    lines.push("- Comparison: none supplied. Do not invent a ranking or a percentile.");
  }
  lines.push("");
  lines.push(`SPECIFIC EXAMPLES I OBSERVED (${examples.length})`);
  lines.push(numbered(examples));
  lines.push("");
  lines.push(
    strengths.length
      ? `QUALITIES TO EVIDENCE (${strengths.length})\n${numbered(strengths)}`
      : "QUALITIES TO EVIDENCE\nNone listed separately. Draw them out of the examples above rather than adding new ones.",
  );
  lines.push("");
  lines.push("STRUCTURE AND WORD BUDGET");
  for (const row of budget) lines.push(`- ${row.label}: ~${row.words} words`);
  lines.push("");
  lines.push("RULES");
  lines.push(
    "1. Every claim about ability must be attached to one of the examples above. If a paragraph has no example behind it, cut it.",
  );
  lines.push(
    "2. Use no adjective you cannot evidence. Replace 'brilliant', 'exceptional' and 'passionate' with the observation that would make a reader think so.",
  );
  lines.push("3. Write in first person, past and present tense, formal register, no contractions.");
  lines.push(
    "4. Invent nothing: no grades, dates, projects, publications or quotations that are not in the facts above. Use [BRACKETS] for anything missing.",
  );
  lines.push(
    "5. Avoid the wording that research on reference letters flags as gendered: communal terms such as warm, nurturing, helpful and hard-working for women, and agentic terms such as ambitious, independent and brilliant for men. Describe the same evidence in neutral terms for everyone.",
  );
  lines.push("6. Do not mention age, health, marital or family status, religion, nationality or disability.");
  if (shortAcquaintance) {
    lines.push(
      `7. State plainly in the opening that the acquaintance is short (${durationPhrase}) and say what that lets me speak to. A letter that overclaims familiarity is worse than a short one.`,
    );
  }
  if (includeReservation) {
    lines.push(
      "8. Include one honest, proportionate reservation and immediately say what the person is doing about it. Do not manufacture a fake weakness such as 'works too hard'.",
    );
  }
  lines.push("");
  lines.push("OUTPUT");
  lines.push(
    "The finished letter as plain prose with a salutation and a signature block, then a short 'Checks' list naming every [BRACKET] placeholder left and every claim the examples do not fully support.",
  );

  const prompt = lines.join("\n");

  return {
    prompt,
    type,
    budget,
    budgetTotal: budget.reduce((sum, row) => sum + row.words, 0),
    target,
    pages: estimatePages(target),
    examples: scored,
    exampleScore,
    strengths,
    ranking,
    months,
    durationPhrase,
    shortAcquaintance,
    charCount: prompt.length,
  };
}
