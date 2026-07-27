/**
 * Performance Review Prompt Builder — pure logic.
 *
 * The real work here is scoring each note the reviewer wrote. A usable review
 * note has three parts, which is what both of the standard feedback frameworks
 * ask for:
 *   STAR — Situation, Task, Action, Result (used by most competency frameworks)
 *   SBI  — Situation, Behaviour, Impact (Center for Creative Leadership)
 * Both reduce to: WHEN did it happen, WHAT did the person do, WHAT changed.
 * scoreNote() checks a note for a timeframe, an action verb and a measurable
 * result, and weights them into a 0-100 evidence score.
 *
 * No React, no DOM, no Date.now().
 */

export const REVIEW_TYPES = [
  "Manager review of a report",
  "Self review",
  "Peer review",
  "Upward review of a manager",
];

export const FRAMEWORKS = [
  { key: "STAR", label: "STAR — Situation, Task, Action, Result" },
  { key: "SBI", label: "SBI — Situation, Behaviour, Impact" },
];

export const REVIEW_PERIODS = ["Quarterly", "Half-yearly", "Annual", "Probation / 90-day"];

export const RATING_SCALES = [
  { key: "none", label: "No rating — narrative only", points: 0 },
  { key: "3point", label: "3-point (below / meets / exceeds)", points: 3 },
  { key: "4point", label: "4-point (no forced middle)", points: 4 },
  { key: "5point", label: "5-point", points: 5 },
];

/**
 * Weights for the three evidence signals. Result carries the most weight
 * because an unmeasured claim is the single most common review-writing
 * complaint; a timeframe anchors the claim to the review period; the action
 * verb is what separates a behaviour from a personality judgement.
 * Weights sum to 1.
 */
export const EVIDENCE_WEIGHTS = { result: 0.5, timeframe: 0.3, action: 0.2 };

/** Fewer than this and a review reads as an impression, not an assessment. */
export const MIN_EVIDENCE_ITEMS = 3;

/** SMART goal-setting practice: enough to be meaningful, few enough to finish. */
export const GOAL_MIN = 2;
export const GOAL_MAX = 5;

/** Sanity cap so a pasted document cannot blow up the prompt. */
export const MAX_NOTES = 30;

/** Score bands for the mean evidence score, 0-100. */
export const EVIDENCE_BANDS = [
  { min: 80, band: "Strong", advice: "Most notes name when it happened, what was done and what changed." },
  { min: 55, band: "Workable", advice: "Enough to write from, but add numbers to the weakest notes first." },
  { min: 30, band: "Thin", advice: "Several notes are opinions. Add a date and a measurable outcome to each." },
  { min: 0, band: "Mostly opinion", advice: "Almost nothing here can be evidenced. Go back to your notes and calendar." },
];

/** Verbs that describe an observable action rather than a trait. */
export const ACTION_VERBS = [
  "led", "shipped", "cut", "reduced", "increased", "grew", "launched", "built",
  "fixed", "migrated", "mentored", "coached", "negotiated", "closed", "automated",
  "designed", "delivered", "resolved", "unblocked", "saved", "improved", "owned",
  "ran", "drove", "wrote", "rolled", "onboarded", "scaled", "refactored",
  "documented", "trained", "presented", "hired", "standardised", "standardized",
  "rewrote", "reviewed", "planned", "shipped", "handled", "escalated", "audited",
  "consolidated", "simplified", "prototyped", "tested", "published", "recovered",
];

/**
 * A measurable result: a percentage, a currency figure, a multiplier, a
 * number-with-unit, or an explicit "from X to Y" movement.
 */
const RESULT_PATTERNS = [
  /\d+(?:\.\d+)?\s*%/,
  /[₹$€£¥]\s?\d/,
  /\d+(?:\.\d+)?\s*x\b/i,
  /\d+(?:\.\d+)?\s*(?:k|m|bn|mn|lakh|lakhs|crore|crores|ms|sec|secs|seconds|min|mins|minutes|hrs|hours|days|weeks|pts|points|users|customers|tickets|bugs|defects|deals|leads|accounts|rps|qps|nps|calls|articles|releases|reviews)\b/i,
  /\bfrom\s+\d[\d.,]*\s*\S*\s+to\s+\d/i,
];

/** A time anchor that ties the note to a point in the review period. */
const TIMEFRAME_PATTERNS = [
  /\bq[1-4]\b/i,
  /\bh[12]\b/i,
  /\bfy\s?\d{2,4}\b/i,
  /\b(?:january|february|march|april|june|july|august|september|october|november|december)\b/i,
  // "may" is excluded from the bare-abbreviation list: it is far more often the
  // modal verb than the month. It only counts with a day or year beside it.
  /\b(?:jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)\b/i,
  /\bmay\s+\d{1,4}\b/i,
  /\bin\s+may\b/i,
  /\b20\d{2}\b/i,
  /\b(?:last|this|the)\s+(?:quarter|month|year|half|sprint|week|cycle)\b/i,
  /\b(?:in|over|across|during)\s+\d+\s*(?:days?|weeks?|months?|quarters?|sprints?)\b/i,
  /\bweek\s+of\b/i,
];

const matchesAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

/** Split a textarea into individual notes, one per line. */
export function parseNotes(raw, max = MAX_NOTES) {
  if (typeof raw !== "string") return [];
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const note = line
      .replace(/^\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^[-*•–]\s*/, "")
      .trim();
    if (!note) continue;
    out.push(note);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Score one note out of 100 on the three evidence signals.
 * Always returns finite numbers; a non-string or empty note scores 0.
 */
export function scoreNote(note) {
  const text = typeof note === "string" ? note.trim() : "";
  const hasResult = text ? matchesAny(text, RESULT_PATTERNS) : false;
  const hasTimeframe = text ? matchesAny(text, TIMEFRAME_PATTERNS) : false;
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  const hasAction = words.some((word) => ACTION_VERBS.includes(word));

  const score = Math.round(
    100 *
      ((hasResult ? EVIDENCE_WEIGHTS.result : 0) +
        (hasTimeframe ? EVIDENCE_WEIGHTS.timeframe : 0) +
        (hasAction ? EVIDENCE_WEIGHTS.action : 0)),
  );

  const missing = [];
  if (!hasResult) missing.push("a measurable result");
  if (!hasTimeframe) missing.push("when it happened");
  if (!hasAction) missing.push("a concrete action verb");

  return { text, hasResult, hasTimeframe, hasAction, score, missing };
}

/** Band lookup for a 0-100 mean score. */
export function bandForScore(score) {
  const value = Number(score);
  const safe = Number.isFinite(value) ? value : 0;
  return EVIDENCE_BANDS.find((entry) => safe >= entry.min) || EVIDENCE_BANDS[EVIDENCE_BANDS.length - 1];
}

/** Score a list of notes and summarise. Empty list -> zeroed, never NaN. */
export function summariseNotes(notes) {
  const items = (Array.isArray(notes) ? notes : []).map(scoreNote);
  const count = items.length;
  const total = items.reduce((sum, item) => sum + item.score, 0);
  const meanScore = count > 0 ? Math.round(total / count) : 0;
  return {
    items,
    count,
    meanScore,
    withResult: items.filter((item) => item.hasResult).length,
    withTimeframe: items.filter((item) => item.hasTimeframe).length,
    withAction: items.filter((item) => item.hasAction).length,
    weakest: items.filter((item) => item.score < 50).map((item) => item.text),
    ...bandForScore(meanScore),
  };
}

/** Assemble the prompt. Returns { error } for unusable input. */
export function buildPerformanceReviewPrompt(input = {}) {
  const {
    personRole = "",
    reviewType = REVIEW_TYPES[0],
    period = "Annual",
    periodLabel = "",
    framework = "STAR",
    ratingScale = "none",
    strengthsRaw = "",
    growthRaw = "",
    goalsRaw = "",
    context = "",
  } = input;

  const role = String(personRole).trim();
  if (!role) return { error: "Enter the role being reviewed, for example 'Senior Support Engineer'." };

  const strengths = parseNotes(strengthsRaw);
  const growth = parseNotes(growthRaw);
  const goals = parseNotes(goalsRaw, GOAL_MAX + 5);

  const totalNotes = strengths.length + growth.length;
  if (totalNotes === 0) {
    return { error: "Add at least one note about what went well or what needs to improve." };
  }
  if (strengths.length === 0) {
    return { error: "Add at least one strength — a review with only criticism will not be read fairly." };
  }

  const scale = RATING_SCALES.find((entry) => entry.key === ratingScale) || RATING_SCALES[0];
  const chosenFramework = FRAMEWORKS.find((entry) => entry.key === framework) || FRAMEWORKS[0];

  const strengthSummary = summariseNotes(strengths);
  const growthSummary = summariseNotes(growth);
  const overall = summariseNotes([...strengths, ...growth]);

  // Balance: share of notes that are development notes, 0-1.
  const growthShare = totalNotes > 0 ? growth.length / totalNotes : 0;
  const balanceWarning =
    growth.length === 0
      ? "No development notes supplied. A review with no growth area gives the person nothing to act on."
      : growthShare > 0.75
        ? "Over three quarters of the notes are criticism. Add evidence of what worked before this reads as a performance case."
        : "";

  const goalWarning =
    goals.length < GOAL_MIN
      ? `Only ${goals.length} goal${goals.length === 1 ? "" : "s"} supplied. Aim for ${GOAL_MIN}-${GOAL_MAX}.`
      : goals.length > GOAL_MAX
        ? `${goals.length} goals is more than most people finish in one cycle. Aim for ${GOAL_MIN}-${GOAL_MAX}.`
        : "";

  const numbered = (items) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const lines = [];
  lines.push(
    `You are an experienced people manager writing a ${String(period).toLowerCase()} performance review. Review type: ${reviewType}.`,
  );
  lines.push("");
  lines.push("SUBJECT");
  lines.push(`- Role: ${role}`);
  lines.push(`- Review period: ${String(periodLabel).trim() || "[period start] to [period end]"}`);
  if (String(context).trim()) lines.push(`- Context the reader needs: ${String(context).trim()}`);
  lines.push(
    scale.points > 0
      ? `- Rating scale: ${scale.label}. Propose a rating and justify it from the evidence only.`
      : "- No numeric rating. Write narrative assessment only; do not invent a score.",
  );
  lines.push("");
  lines.push(`EVIDENCE — WHAT WENT WELL (${strengths.length} notes)`);
  lines.push(numbered(strengths));
  lines.push("");
  lines.push(
    growth.length
      ? `EVIDENCE — WHERE GROWTH IS NEEDED (${growth.length} notes)\n${numbered(growth)}`
      : "EVIDENCE — WHERE GROWTH IS NEEDED\nNone supplied. Do not invent a weakness; instead end with a line saying no development evidence was recorded this cycle.",
  );
  lines.push("");
  lines.push(
    goals.length
      ? `GOALS PROPOSED FOR THE NEXT CYCLE (${goals.length})\n${numbered(goals)}`
      : "GOALS PROPOSED FOR THE NEXT CYCLE\nNone supplied. Draft 3 candidate goals from the evidence above and mark each [DRAFT] for the manager to confirm.",
  );
  lines.push("");
  lines.push("HOW TO WRITE IT");
  lines.push(`1. Use the ${chosenFramework.label} structure for every point.`);
  lines.push(
    "2. Rewrite each note as a paragraph naming the situation, the action the person took and the effect it had. Keep the person's own numbers and dates verbatim.",
  );
  lines.push(
    "3. Assess behaviour and outcomes, never personality. No 'attitude', 'not a team player', 'lacks confidence' or similar trait language.",
  );
  lines.push(
    "4. Where a note has no measurable result or no date, do not paper over it — write the point, then add [NEEDS EVIDENCE: what is missing] so the reviewer can fill the gap.",
  );
  lines.push(
    `5. Goals must be SMART: each one needs a measure, a target value and a date inside the next ${String(period).toLowerCase()} cycle. Cap at ${GOAL_MAX}.`,
  );
  lines.push("6. Invent no achievements, numbers, dates or quotes that are not in the notes above.");
  lines.push(
    "7. Do not reference protected characteristics, health, family circumstances or leave taken.",
  );
  lines.push("");
  lines.push("OUTPUT");
  lines.push(
    "Markdown with these headings: Summary (3-4 sentences), Impact this period, Strengths, Areas to develop, Goals for next cycle, Support the manager will provide. Finish with an 'Evidence gaps' list of every [NEEDS EVIDENCE] marker you inserted.",
  );

  const prompt = lines.join("\n");

  return {
    prompt,
    strengths,
    growth,
    goals,
    strengthSummary,
    growthSummary,
    overall,
    totalNotes,
    growthShare,
    balanceWarning,
    goalWarning,
    scale,
    framework: chosenFramework,
    charCount: prompt.length,
  };
}
