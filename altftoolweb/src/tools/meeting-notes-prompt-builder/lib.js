/**
 * Meeting Notes Prompt Builder — pure logic.
 *
 * Classifies each line of raw notes as a decision, an action, an open question
 * or context, checks whether the action lines carry an owner and a due date,
 * and writes a prompt that names the exact gaps found.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/** OpenAI's published English rule of thumb: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/**
 * Silent reading rate for adult non-fiction prose. Brysbaert's 2019
 * meta-analysis of 190 studies put the mean at about 238 words per minute.
 */
export const READING_WPM = 238;

export const MAX_NOTE_CHARS = 20000;
export const MIN_NOTE_WORDS = 5;

/** A line is a decision when it records something settled. */
export const DECISION_PATTERN =
  /\b(decided|decision|we agreed|agreed to|agreement|approved|sign(?:ed)? off|going with|go with|final(?:ised|ized)?|resolved|conclusion|no-?go|green ?light)\b/i;

/** A line is an action when it commits someone to do something. */
export const ACTION_PATTERN =
  /(^\s*(?:action|ap|todo|to-?do|next step)\b)|\b(will|to follow up|follows? up|owns?|owner|takes? (?:this|it) on|needs? to|should|must|assign(?:ed)?|raise|send|draft|prepare|share|schedule|book|update|review|fix|ship|check)\b/i;

/**
 * Question detection runs in two strengths. A trailing question mark or an
 * explicit "open question" prefix outranks a decision keyword, because
 * "do we need legal sign off?" contains "sign off" but settles nothing.
 */
export const STRONG_QUESTION_PATTERN = /(\?\s*$)|^\s*(?:open question|question|q:)/i;
export const WEAK_QUESTION_PATTERN =
  /\b(tbd|to be (?:decided|confirmed)|unclear|unknown|parked|blocked on|waiting on)\b/i;

/** Owner formats we can spot: @handle, "Name will", "Name — ", "Name:" */
export const HANDLE_PATTERN = /@([A-Za-z][A-Za-z0-9._-]{1,30})/g;
export const NAMED_OWNER_PATTERN =
  /\b([A-Z][a-z]{1,20})(?:\s+[A-Z][a-z]{1,20})?\s+(?:will|to|owns|is going to|takes|shall|has agreed to)\b/g;

/**
 * Capitalised words that start a note line but are not people. Without this,
 * "Agreed to ship..." reports "Agreed" as an owner.
 */
export const NOT_A_NAME = new Set(
  [
    "agreed", "decided", "decision", "action", "actions", "open", "discussed",
    "need", "needs", "going", "we", "they", "this", "that", "it", "next",
    "also", "team", "tbd", "will", "should", "must", "plan", "note", "follow",
    "update", "review", "send", "draft", "prepare", "share", "schedule", "book",
    "raise", "fix", "ship", "check", "everyone", "all", "someone", "nobody",
    "the", "our", "their", "his", "her", "moving", "still", "left", "yet",
  ].map((word) => word.toLowerCase())
);

/** Anything that looks like a deadline. */
export const DATE_PATTERN =
  /\b(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{4}-\d{2}-\d{2}|by (?:mon|tues?|wed(?:nes)?|thur?s?|fri|sat(?:ur)?|sun)[a-z]*|(?:mon|tues?|wed(?:nes)?|thur?s?|fri|sat(?:ur)?|sun)day|next week|this week|end of (?:day|week|month|quarter)|eo[dwm]|q[1-4]\b|\d{1,2}\s?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s?\d{1,2})\b/i;

export const OUTPUT_FORMATS = [
  {
    id: "action-first",
    label: "Actions first (for a team channel)",
    spec: [
      "1. Actions — a table of owner, action, due date, and blocked-on. One row per commitment.",
      "2. Decisions — one line each, stating what was decided and by whom.",
      "3. Open questions — each with the person who can close it.",
      "4. Everything else in three bullets or fewer.",
    ],
  },
  {
    id: "decision-log",
    label: "Decision log (for a project record)",
    spec: [
      "1. Decision log — decision, rationale, alternatives rejected, owner, date.",
      "2. Actions arising from each decision, indented under it.",
      "3. Open questions that block a decision, marked as blocking.",
      "4. A one-line summary a newcomer could read in isolation.",
    ],
  },
  {
    id: "exec-summary",
    label: "Executive summary (for someone who missed it)",
    spec: [
      "1. Three sentences on what changed as a result of this meeting.",
      "2. What needs a decision from the reader, with the options.",
      "3. Actions and owners as a short list.",
      "4. What to read only if they want detail.",
    ],
  },
  {
    id: "client-recap",
    label: "Client recap email",
    spec: [
      "1. A short opening paragraph confirming what was agreed.",
      "2. Agreed scope and decisions as bullets.",
      "3. What you need from the client, with dates.",
      "4. What happens next and when they will hear from you.",
    ],
  },
];

export const TONES = [
  { id: "neutral", label: "Neutral and factual", rule: "plain, factual, no adjectives that were not in the notes" },
  { id: "direct", label: "Direct and short", rule: "as short as possible; cut anything that is not a commitment" },
  { id: "formal", label: "Formal", rule: "complete sentences suitable for an external record" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const countWords = (text) => (String(text).trim() ? String(text).trim().split(/\s+/).length : 0);

const stripBullet = (line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim();

/** Classify every non-empty line and note what each action line is missing. */
export function analyseNotes(text) {
  const raw = String(text || "");
  const lines = raw
    .split(/\n+/)
    .map((line) => stripBullet(line))
    .filter((line) => line.length > 0);

  const classified = lines.map((line) => {
    const isStrongQuestion = STRONG_QUESTION_PATTERN.test(line);
    const isDecision = !isStrongQuestion && DECISION_PATTERN.test(line);
    const isAction = !isStrongQuestion && !isDecision && ACTION_PATTERN.test(line);
    const isWeakQuestion = WEAK_QUESTION_PATTERN.test(line);
    const hasDate = DATE_PATTERN.test(line);
    const handles = [...line.matchAll(HANDLE_PATTERN)].map((match) => match[1]);
    const names = [...line.matchAll(NAMED_OWNER_PATTERN)]
      .map((match) => match[1])
      .filter((name) => !NOT_A_NAME.has(name.toLowerCase()));
    const owners = [...new Set([...handles, ...names])];

    let kind = "context";
    if (isStrongQuestion) kind = "question";
    else if (isDecision) kind = "decision";
    else if (isAction) kind = "action";
    else if (isWeakQuestion) kind = "question";

    return { line, kind, hasDate, owners, hasOwner: owners.length > 0 };
  });

  const decisions = classified.filter((item) => item.kind === "decision");
  const actions = classified.filter((item) => item.kind === "action");
  const questions = classified.filter((item) => item.kind === "question");
  const ownerless = actions.filter((item) => !item.hasOwner);
  const dateless = actions.filter((item) => !item.hasDate);
  const people = [...new Set(classified.flatMap((item) => item.owners))];
  const words = countWords(raw);

  return {
    lines: classified,
    lineCount: classified.length,
    words,
    readingMinutes: words / READING_WPM,
    decisions,
    actions,
    questions,
    ownerless,
    dateless,
    people,
    gapCount: ownerless.length + dateless.length + questions.length,
  };
}

export function buildMeetingPrompt(input) {
  const {
    notes = "",
    meetingTitle = "",
    attendees = "",
    outputFormat = "action-first",
    tone = "neutral",
    audience = "",
  } = input || {};

  const raw = String(notes);
  if (raw.length > MAX_NOTE_CHARS) {
    return { error: `Notes are longer than ${MAX_NOTE_CHARS} characters — split the meeting into parts.` };
  }

  const analysis = analyseNotes(raw);
  if (analysis.words < MIN_NOTE_WORDS) {
    return { error: `Paste at least ${MIN_NOTE_WORDS} words of notes.` };
  }
  if (analysis.lineCount === 0) return { error: "No usable lines found in the notes." };

  const formatEntry = OUTPUT_FORMATS.find((item) => item.id === outputFormat) || OUTPUT_FORMATS[0];
  const toneEntry = TONES.find((item) => item.id === tone) || TONES[0];

  const gapLines = [
    analysis.ownerless.length
      ? `${analysis.ownerless.length} ${analysis.ownerless.length === 1 ? "line looks like a commitment but names" : "lines look like commitments but name"} nobody — mark each as OWNER UNKNOWN rather than guessing.`
      : null,
    analysis.dateless.length
      ? `${analysis.dateless.length} ${analysis.dateless.length === 1 ? "commitment carries" : "commitments carry"} no date — mark each as DUE DATE MISSING rather than inventing one.`
      : null,
    analysis.questions.length
      ? `${analysis.questions.length} ${analysis.questions.length === 1 ? "line is" : "lines are"} unresolved. Keep them as open questions; do not answer them yourself.`
      : null,
    analysis.decisions.length === 0
      ? "Nothing in these notes reads as a decision. Say so explicitly rather than promoting a discussion point into one."
      : null,
  ].filter(Boolean);

  const constraints = [
    "Use only what is in the notes. Do not add context, rationale or next steps that were not said.",
    "If a line is ambiguous, list it under 'needs confirmation' with the exact wording, rather than resolving it.",
    ...gapLines,
    analysis.people.length
      ? `Names that appear in the notes: ${analysis.people.join(", ")}. Do not introduce anyone else.`
      : "No names were detected in the notes, so every action will need an owner assigned afterwards.",
    attendees.trim() ? `Attendees: ${attendees.trim()}.` : null,
    audience.trim() ? `This will be read by: ${audience.trim()}.` : null,
    `Tone: ${toneEntry.rule}.`,
  ].filter(Boolean);

  const prompt = [
    "You convert raw meeting notes into a record. You never invent commitments, owners or dates.",
    "",
    `Turn the notes below into ${formatEntry.label.toLowerCase()}${meetingTitle.trim() ? ` for "${meetingTitle.trim()}"` : ""}.`,
    "",
    "CONSTRAINTS",
    ...constraints.map((line) => `- ${line}`),
    "",
    "OUTPUT FORMAT",
    ...formatEntry.spec,
    "",
    "RAW NOTES",
    raw.trim(),
    "",
    "End with a short list titled 'Assumptions I did not make', naming what a reader might expect you to have filled in but which the notes do not support.",
  ].join("\n");

  const charCount = prompt.length;

  return {
    prompt,
    ...analysis,
    formatLabel: formatEntry.label,
    toneLabel: toneEntry.label,
    wordCount: countWords(prompt),
    charCount,
    tokenEstimate: Math.ceil(charCount / CHARS_PER_TOKEN),
    ownerCoveragePct: analysis.actions.length
      ? ((analysis.actions.length - analysis.ownerless.length) / analysis.actions.length) * 100
      : null,
    dateCoveragePct: analysis.actions.length
      ? ((analysis.actions.length - analysis.dateless.length) / analysis.actions.length) * 100
      : null,
  };
}

export function formatMinutes(minutes) {
  if (!isFiniteNumber(minutes) || minutes < 0) return "—";
  if (minutes < 1) return "under a minute";
  const whole = Math.round(minutes);
  return `${whole} min`;
}
