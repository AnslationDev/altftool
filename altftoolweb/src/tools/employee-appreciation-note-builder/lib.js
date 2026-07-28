/**
 * Employee appreciation note builder.
 *
 * Uses the Situation-Behaviour-Impact (SBI) feedback model developed by the Center
 * for Creative Leadership: name the situation, describe the observed behaviour, then
 * state the impact. The same structure works for praise as for corrective feedback,
 * and it is what stops a note collapsing into "great job".
 *
 * Pure module — no React, no DOM, no clock reads (today's date is an argument).
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

/** Praise loses its link to the behaviour once the week is over. */
export const TIMELY_WINDOW_DAYS = 7;

/** Adjective-only praise that names no behaviour. Flagged, not blocked. */
export const VAGUE_WORDS = [
  "great job",
  "good job",
  "well done",
  "awesome",
  "amazing",
  "incredible",
  "rockstar",
  "rock star",
  "ninja",
  "superstar",
  "legend",
  "killing it",
  "brilliant",
  "fantastic",
  "outstanding",
];

/** Numbers, percentages, currency and time units all count as a measurable impact. */
const METRIC_PATTERN =
  /(\d[\d,.]*\s*(%|percent|hours?|hrs?|days?|weeks?|minutes?|mins?|customers?|tickets?|users?|crore|lakh|k\b|x\b))|[₹$€£]\s?\d/i;

export const CHANNELS = [
  {
    id: "oneonone",
    label: "Private note to the person",
    minWords: 45,
    maxWords: 120,
    opener: (name) => `${name},`,
    guidance: "Private praise can be longer and more personal; name what you saw, not what you assume.",
  },
  {
    id: "team",
    label: "Team channel shout-out",
    minWords: 30,
    maxWords: 90,
    opener: (name) => `Shout-out to ${name} 👏`,
    guidance: "Public praise should be short and factual so it reads as recognition, not favouritism.",
  },
  {
    id: "manager",
    label: "Email to their manager",
    minWords: 50,
    maxWords: 140,
    opener: (name) => `I wanted to pass on some feedback about ${name}.`,
    guidance: "Written for someone who did not see the work — spell out the situation before the behaviour.",
  },
  {
    id: "nomination",
    label: "Award nomination",
    minWords: 70,
    maxWords: 180,
    opener: (name) => `I am nominating ${name}.`,
    guidance: "A panel needs evidence: dates, numbers and what would have happened otherwise.",
  },
];

export const STRENGTHS = [
  { id: "ownership", label: "Ownership", phrase: "takes ownership without being asked" },
  { id: "craft", label: "Quality of craft", phrase: "holds the quality bar under time pressure" },
  { id: "teamwork", label: "Helping others", phrase: "makes someone else's work easier" },
  { id: "customer", label: "Customer focus", phrase: "puts the customer's experience first" },
  { id: "judgement", label: "Judgement", phrase: "makes a good call with incomplete information" },
  { id: "persistence", label: "Persistence", phrase: "stays with a hard problem to the end" },
];

export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? LONG_DATE.format(date) : "";
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Vague praise words present in the text, lowercased and de-duplicated. */
export function findVagueWords(text) {
  if (typeof text !== "string") return [];
  const haystack = text.toLowerCase();
  return VAGUE_WORDS.filter((word) => haystack.includes(word));
}

export function hasMetric(text) {
  return typeof text === "string" && METRIC_PATTERN.test(text);
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function endWithStop(sentence) {
  if (!sentence) return "";
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function stripStop(sentence) {
  return sentence ? sentence.replace(/[.,;:!?]+$/, "") : "";
}

function capitalise(sentence) {
  return sentence ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : "";
}

/**
 * Build the appreciation note.
 * Returns { note, wordCount, ... } or { error }.
 */
export function buildAppreciationNote(input = {}) {
  const name = clean(input.name);
  if (!name) return { error: "Add the person's name — unaddressed praise reads as a template." };

  const situation = clean(input.situation);
  if (!situation) {
    return { error: "Describe the situation: when and where the behaviour happened." };
  }

  const behaviour = clean(input.behaviour);
  if (!behaviour) {
    return { error: "Describe the behaviour you actually observed, in verbs not adjectives." };
  }

  const impact = clean(input.impact);
  if (!impact) {
    return { error: "State the impact: what changed for the team, the customer or the number." };
  }

  const eventDate = parseIsoDate(input.eventDate);
  if (!eventDate) return { error: "Pick a valid date for when this happened." };

  const today = parseIsoDate(input.today);
  if (!today) return { error: "Pick a valid date for today." };
  if (today.getTime() < eventDate.getTime()) {
    return { error: "The event cannot be in the future — check the two dates." };
  }

  const daysSinceEvent = Math.round((today.getTime() - eventDate.getTime()) / MS_PER_DAY);

  const channel = CHANNELS.find((item) => item.id === clean(input.channelId)) || CHANNELS[0];
  const strength = STRENGTHS.find((item) => item.id === clean(input.strengthId)) || null;

  const senderName = clean(input.senderName);
  const closing = clean(input.closing);

  const lines = [];
  lines.push(channel.opener(name));
  lines.push("");

  // SBI reads as one sentence: situation, then the observed behaviour.
  const prefix =
    daysSinceEvent <= TIMELY_WINDOW_DAYS ? "" : `Back on ${formatDate(eventDate)}, `;
  const sbSentence = capitalise(
    `${prefix}${prefix ? stripStop(situation).charAt(0).toLowerCase() + stripStop(situation).slice(1) : stripStop(situation)}, ${stripStop(behaviour)}`,
  );
  lines.push(endWithStop(sbSentence));
  lines.push(endWithStop(capitalise(impact)));

  if (strength) {
    lines.push(`That is exactly what it looks like when someone ${strength.phrase}.`);
  }
  if (closing) lines.push(endWithStop(closing));

  lines.push("");
  lines.push(channel.id === "team" ? "" : "Thank you.");
  if (senderName) lines.push(`— ${senderName}`);

  const note = lines.filter((line, index) => line !== "" || index < lines.length - 1).join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const wordCount = countWords(note);
  const vagueWordsFound = findVagueWords([situation, behaviour, impact, closing].join(" "));
  const impactHasMetric = hasMetric(impact);

  const checklist = [
    { label: "Names the situation (when and where)", ok: countWords(situation) >= 5 },
    { label: "Describes an observed behaviour, not a trait", ok: countWords(behaviour) >= 6 },
    { label: "States the impact on people or numbers", ok: countWords(impact) >= 5 },
    { label: "Impact includes a measurable figure", ok: impactHasMetric },
    { label: "No adjective-only praise words", ok: vagueWordsFound.length === 0 },
    {
      label: `Sent within ${TIMELY_WINDOW_DAYS} days of the event`,
      ok: daysSinceEvent <= TIMELY_WINDOW_DAYS,
    },
    {
      label: `Length fits this channel (${channel.minWords}-${channel.maxWords} words)`,
      ok: wordCount >= channel.minWords && wordCount <= channel.maxWords,
    },
  ];

  return {
    note,
    wordCount,
    daysSinceEvent,
    isTimely: daysSinceEvent <= TIMELY_WINDOW_DAYS,
    eventDateLabel: formatDate(eventDate),
    channelLabel: channel.label,
    channelGuidance: channel.guidance,
    minWords: channel.minWords,
    maxWords: channel.maxWords,
    vagueWordsFound,
    impactHasMetric,
    strengthLabel: strength ? strength.label : "Not set",
    checklist,
    score: checklist.filter((item) => item.ok).length,
    scoreMax: checklist.length,
  };
}
