/**
 * Portfolio Writeup Prompt Builder — pure logic.
 *
 *  1. Real outcome arithmetic: percentage change between a before and an after
 *     metric, direction-aware (a drop in load time is an improvement, a drop in
 *     conversion is not), plus the multiple ("2.4x faster") where it is defined.
 *  2. Deterministic assembly of a case-study prompt around a named structure.
 *
 * No React, no DOM, no clocks.
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/**
 * Silent reading speed for English non-fiction, 238 words per minute.
 * Source: Brysbaert, M. (2019), "How many words do we read per minute?
 * A review and meta-analysis of reading rate", Journal of Memory and Language.
 */
export const WORDS_PER_MINUTE = 238;

/** Sensible bounds for a case study a recruiter will actually finish. */
export const MIN_TARGET_WORDS = 150;
export const MAX_TARGET_WORDS = 3000;

/** Case-study structures, each a real, named framework. */
export const STRUCTURES = {
  star: {
    label: "STAR (Situation, Task, Action, Result)",
    sections: ["Situation", "Task", "Action", "Result"],
    note: "Interview-standard. Best when a recruiter will read the writeup aloud back to you.",
  },
  care: {
    label: "CARE (Challenge, Action, Result, Evaluation)",
    sections: ["Challenge", "Action", "Result", "Evaluation"],
    note: "Adds an explicit reflection section — good for senior and lead roles.",
  },
  ppo: {
    label: "Problem → Process → Outcome",
    sections: ["Problem", "Process", "Outcome"],
    note: "The shortest credible shape. Best for a one-screen case study.",
  },
  "double-diamond": {
    label: "Double Diamond (Discover, Define, Develop, Deliver)",
    sections: ["Discover", "Define", "Develop", "Deliver"],
    note: "UK Design Council framework — the expected shape for product and UX portfolios.",
  },
};

/** Whether a rise or a fall in the headline metric counts as success. */
export const METRIC_DIRECTIONS = {
  "higher-better": "higher is better",
  "lower-better": "lower is better",
};

export const AUDIENCES = {
  recruiter: "a non-technical recruiter skimming for 20 seconds before deciding to read on",
  "hiring-manager": "a hiring manager who will interrogate every design decision",
  client: "a prospective client deciding whether to hire you for similar work",
  peer: "a senior peer in the same discipline who will spot any hand-waving",
};

function clean(text) {
  return String(text ?? "").trim();
}

function round(value, places = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Compare a before and an after value on the headline metric.
 *
 * @returns {{
 *   delta: number, pctChange: number|null, improvementPct: number|null,
 *   factor: number|null, improved: boolean, summary: string
 * }}
 */
export function compareOutcome(before, after, direction = "higher-better") {
  const delta = after - before;
  const lowerBetter = direction === "lower-better";
  const pctChange = before !== 0 ? (delta / Math.abs(before)) * 100 : null;
  const improvementPct = pctChange === null ? null : lowerBetter ? -pctChange : pctChange;
  const improved = lowerBetter ? delta < 0 : delta > 0;

  // "N times" only makes sense when both sides are non-zero and same sign.
  let factor = null;
  if (before > 0 && after > 0) factor = lowerBetter ? before / after : after / before;

  let summary;
  if (delta === 0) {
    summary = "The metric did not move — lead with what you learned instead of the number.";
  } else if (improvementPct === null) {
    summary = `Moved from ${before} to ${after}. A percentage change is undefined from a baseline of zero, so state the absolute change.`;
  } else if (improved) {
    summary = `${round(Math.abs(improvementPct), 1)}% ${lowerBetter ? "reduction" : "increase"}${factor ? `, about ${round(factor, 2)}x` : ""}.`;
  } else {
    summary = `${round(Math.abs(improvementPct), 1)}% move in the wrong direction — be upfront about it and explain what you changed next.`;
  }

  return {
    delta,
    pctChange: pctChange === null ? null : round(pctChange, 1),
    improvementPct: improvementPct === null ? null : round(improvementPct, 1),
    factor: factor === null ? null : round(factor, 2),
    improved,
    summary,
  };
}

/** Reading time in minutes at WORDS_PER_MINUTE, rounded up to the nearest minute. */
export function readingMinutes(words) {
  if (!(words > 0)) return 0;
  return Math.ceil(words / WORDS_PER_MINUTE);
}

/**
 * @returns {{error: string} | {
 *   prompt: string, outcome: object, sections: string[],
 *   targetWords: number, readMinutes: number, wordsPerSection: number,
 *   wordCount: number, tokenEstimate: number
 * }}
 */
export function buildPortfolioPrompt({
  projectName = "",
  discipline = "",
  role = "",
  structure = "star",
  audience = "recruiter",
  metricName = "",
  metricUnit = "",
  beforeValue = 0,
  afterValue = 0,
  metricDirection = "higher-better",
  durationWeeks = 0,
  teamSize = 1,
  constraints = "",
  targetWords = 500,
} = {}) {
  const name = clean(projectName);
  const disciplineText = clean(discipline);
  const roleText = clean(role);
  const metric = clean(metricName);
  const unit = clean(metricUnit);

  const before = Number(beforeValue);
  const after = Number(afterValue);
  const weeks = Number(durationWeeks);
  const team = Number(teamSize);
  const words = Math.round(Number(targetWords));

  if (!name) return { error: "Give the project a name." };
  if (!roleText) return { error: "State what your role on the project was." };
  if (!metric) return { error: "Name the headline metric this project moved." };
  if (![before, after, weeks, team, words].every(Number.isFinite)) {
    return { error: "Metric values, duration, team size and target length must all be numbers." };
  }
  if (weeks < 0) return { error: "Project duration cannot be negative." };
  if (team < 1) return { error: "Team size must be at least 1 — count yourself." };
  if (words < MIN_TARGET_WORDS || words > MAX_TARGET_WORDS) {
    return { error: `Target length should be between ${MIN_TARGET_WORDS} and ${MAX_TARGET_WORDS} words.` };
  }

  const shape = STRUCTURES[structure] ?? STRUCTURES.star;
  const audienceText = AUDIENCES[audience] ?? AUDIENCES.recruiter;
  const directionText = METRIC_DIRECTIONS[metricDirection] ?? METRIC_DIRECTIONS["higher-better"];

  const outcome = compareOutcome(before, after, metricDirection);
  const readMinutes = readingMinutes(words);
  const wordsPerSection = Math.round(words / shape.sections.length);

  const unitSuffix = unit ? ` ${unit}` : "";

  const lines = [];
  lines.push(
    `Act as a portfolio editor for ${disciplineText || "design and product"} work. Write a case study about a project called "${name}" for ${audienceText}.`,
  );
  lines.push("");
  lines.push("PROJECT FACTS");
  lines.push(`- My role: ${roleText}`);
  if (team > 1) lines.push(`- Team size: ${team} people, including me`);
  else lines.push("- Team size: solo project");
  if (weeks > 0) lines.push(`- Duration: ${weeks} weeks`);
  lines.push(`- Headline metric: ${metric} (${directionText})`);
  lines.push(`- Before: ${before}${unitSuffix} → After: ${after}${unitSuffix}`);
  lines.push(`- Change: ${outcome.delta > 0 ? "+" : ""}${round(outcome.delta, 2)}${unitSuffix}. ${outcome.summary}`);
  if (clean(constraints)) lines.push(`- Constraints I worked under: ${clean(constraints)}`);
  lines.push("");
  lines.push("STRUCTURE");
  lines.push(`Use ${shape.label}. ${shape.note}`);
  shape.sections.forEach((section, index) => {
    lines.push(`${index + 1}. ${section} — about ${wordsPerSection} words.`);
  });
  lines.push("");
  lines.push("RULES");
  lines.push(`- Total length about ${words} words, roughly a ${readMinutes}-minute read.`);
  lines.push("- Open with one sentence that states the outcome, including the number, before any background.");
  lines.push("- Write in first person, past tense. Say 'I' for what I did and 'we' only for what the team did.");
  lines.push("- Every claim about impact must trace back to the metric above. Invent no other numbers.");
  lines.push("- Name at least one thing that did not work and what it changed about the approach.");
  lines.push("- End with a two-line 'what I would do differently' note.");
  lines.push("- Suggest three alternative titles and one caption per image slot the writeup implies.");
  lines.push("");
  lines.push("If any fact above is too thin to carry a section, tell me which question to answer rather than filling the gap with generic language.");

  const prompt = lines.join("\n");

  return {
    prompt,
    outcome,
    sections: shape.sections,
    structureLabel: shape.label,
    targetWords: words,
    readMinutes,
    wordsPerSection,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
