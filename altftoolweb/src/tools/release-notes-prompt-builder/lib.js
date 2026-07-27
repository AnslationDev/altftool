/**
 * Release Notes Prompt Builder.
 *
 * Sorts a flat list of shipped changes into features, fixes, breaking changes,
 * deprecations, security items and known issues; sizes the announcement against
 * the channel it will be published on; calculates the removal date implied by a
 * deprecation notice period; and writes the announcement prompt.
 *
 * Pure module: no React, no DOM, no clock reads. Dates arrive as arguments.
 */

/**
 * Change buckets. The prefix is what the user types at the start of a line;
 * `weight` sets the order the announcement puts them in — a reader must meet
 * anything that breaks them before anything that delights them.
 */
export const CHANGE_KINDS = [
  {
    id: "breaking",
    prefixes: ["breaking", "break"],
    label: "Breaking change",
    weight: 1,
    directive:
      "What broke, who it affects, and the exact migration step. Include the old and new form side by side.",
  },
  {
    id: "security",
    prefixes: ["security", "sec"],
    label: "Security fix",
    weight: 2,
    directive:
      "Severity, affected versions and the version that fixes it. Do not describe the exploit in enough detail to reproduce it.",
  },
  {
    id: "deprecated",
    prefixes: ["deprecated", "deprecate", "dep"],
    label: "Deprecation",
    weight: 3,
    directive:
      "What is deprecated, what replaces it, and the date it stops working. A deprecation without a date is ignored.",
  },
  {
    id: "feature",
    prefixes: ["feature", "feat", "added", "add", "new"],
    label: "New feature",
    weight: 4,
    directive:
      "Lead with what the reader can now do. One sentence, then where to find it.",
  },
  {
    id: "improvement",
    prefixes: ["improvement", "improved", "improve", "perf", "changed", "change"],
    label: "Improvement",
    weight: 5,
    directive:
      "State the measurable difference where one exists — faster, fewer steps, higher limit — otherwise say plainly what changed.",
  },
  {
    id: "fix",
    prefixes: ["fix", "fixed", "bug"],
    label: "Bug fix",
    weight: 6,
    directive: "Describe the symptom the user saw, not the internal cause.",
  },
  {
    id: "known",
    prefixes: ["known", "issue", "knownissue"],
    label: "Known issue",
    weight: 7,
    directive: "The symptom, any workaround, and whether a fix is scheduled.",
  },
];

/**
 * Publishing channel. The limits are the practical ceilings each format
 * imposes before readers stop, not platform-enforced maxima.
 */
export const CHANNELS = [
  {
    id: "blog",
    label: "Blog or docs page",
    maxWords: 900,
    directive:
      "Long form: a headline, a two-sentence summary, then one section per change kind with subheadings and code samples where useful.",
  },
  {
    id: "email",
    label: "Customer email",
    maxWords: 250,
    directive:
      "One subject line under 60 characters, a two-sentence opening, at most three highlights as bullets, and a single link to the full notes.",
  },
  {
    id: "inApp",
    label: "In-app notification",
    maxWords: 60,
    directive:
      "One sentence on the single biggest change, one on what to do next. No lists, no links beyond one.",
  },
  {
    id: "github",
    label: "GitHub release",
    maxWords: 600,
    directive:
      "Markdown with a Highlights section, then Breaking changes, then the full list. Reference issue and pull request numbers where supplied.",
  },
];

/** Practical bounds. */
export const LIMITS = {
  items: { min: 1, max: 120 },
  highlights: { min: 1, max: 6 },
  noticeDays: { min: 0, max: 1095 },
};

/**
 * Silent reading speed for adult English prose, about 238 words per minute
 * (Brysbaert, 2019, meta-analysis of 190 reading-rate studies).
 */
export const READING_WPM = 238;

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const BULLET_PREFIX = /^\s*(?:[-*•]|\d+[.)])\s*/;

/** Proleptic Gregorian leap rule: divisible by 4, except centuries not by 400. */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, monthIndex) {
  if (monthIndex === 1 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[monthIndex];
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

/**
 * Add whole days to an ISO date, rolling over months and years.
 * @returns {{error:string}|{date:string}}
 */
export function addDays(isoDate, days) {
  if (typeof isoDate !== "string" || !ISO_DATE_PATTERN.test(isoDate)) {
    return { error: "Enter the release date as YYYY-MM-DD." };
  }
  if (!Number.isFinite(days) || !Number.isInteger(days) || days < 0) {
    return { error: "The notice period must be a whole number of days, zero or more." };
  }
  const [, yearText, monthText, dayText] = isoDate.match(ISO_DATE_PATTERN);
  let year = Number(yearText);
  let monthIndex = Number(monthText) - 1;
  let day = Number(dayText);
  if (monthIndex < 0 || monthIndex > 11) return { error: "Month must be between 01 and 12." };
  if (day < 1 || day > daysInMonth(year, monthIndex)) {
    return { error: `${isoDate} is not a real calendar date.` };
  }

  let remaining = days;
  while (remaining > 0) {
    const room = daysInMonth(year, monthIndex) - day;
    if (remaining <= room) {
      day += remaining;
      remaining = 0;
    } else {
      remaining -= room + 1;
      day = 1;
      monthIndex += 1;
      if (monthIndex > 11) {
        monthIndex = 0;
        year += 1;
      }
    }
  }
  return { date: `${year}-${pad2(monthIndex + 1)}-${pad2(day)}` };
}

export function getChannel(id) {
  return CHANNELS.find((item) => item.id === id) || null;
}

export function getKind(id) {
  return CHANGE_KINDS.find((item) => item.id === id) || null;
}

/** Match a line's leading "word:" against the known prefixes. */
function kindFromPrefix(word) {
  const key = word.toLowerCase().replace(/[^a-z]/g, "");
  return CHANGE_KINDS.find((kind) => kind.prefixes.includes(key)) || null;
}

/**
 * Sort change lines into buckets. A line with no recognised prefix is filed
 * as an improvement and counted, so it can be flagged rather than dropped.
 * @returns {{error:string}|{items:Array,byKind:object,unclassified:number}}
 */
export function parseChanges(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "List at least one change, e.g. \"feature: bulk CSV import\"." };
  }
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(BULLET_PREFIX, "").trim())
    .filter((line) => line.length > 0);

  if (lines.length < LIMITS.items.min) {
    return { error: "List at least one change, e.g. \"feature: bulk CSV import\"." };
  }
  if (lines.length > LIMITS.items.max) {
    return {
      error: `Keep it to ${LIMITS.items.max} changes per release note — link to the full changelog for the rest.`,
    };
  }

  const items = [];
  const byKind = {};
  let unclassified = 0;

  for (const line of lines) {
    const separator = line.indexOf(":");
    let kind = null;
    let summary = line;
    if (separator > 0) {
      kind = kindFromPrefix(line.slice(0, separator));
      if (kind) summary = line.slice(separator + 1).trim();
    }
    if (!kind) {
      kind = getKind("improvement");
      unclassified += 1;
    }
    if (summary.length === 0) continue;
    items.push({ kind: kind.id, label: kind.label, weight: kind.weight, summary });
    byKind[kind.id] = (byKind[kind.id] || 0) + 1;
  }

  if (items.length === 0) {
    return { error: "Every line was empty after its prefix — write the change after the colon." };
  }

  items.sort((a, b) => a.weight - b.weight);
  return { items, byKind, unclassified };
}

/** Reading time in minutes, rounded up, never below one minute for real text. */
export function readingMinutes(wordCount) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / READING_WPM));
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Build the release notes prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildReleaseNotesPrompt({
  productName,
  version,
  releaseDate,
  channelId,
  changeText,
  highlightCount,
  noticeDays,
  notes,
} = {}) {
  const name = typeof productName === "string" ? productName.trim() : "";
  if (!name) return { error: "Enter the product name." };
  const versionLabel = typeof version === "string" ? version.trim() : "";
  if (!versionLabel) return { error: "Enter the version or release name." };

  const channel = getChannel(channelId);
  if (!channel) return { error: "Choose where the release note will be published." };

  const highlights = Number(highlightCount);
  if (
    !Number.isInteger(highlights) ||
    highlights < LIMITS.highlights.min ||
    highlights > LIMITS.highlights.max
  ) {
    return {
      error: `Pick between ${LIMITS.highlights.min} and ${LIMITS.highlights.max} highlights.`,
    };
  }

  const parsed = parseChanges(changeText);
  if (parsed.error) return { error: parsed.error };

  const days = Number(noticeDays);
  if (!Number.isInteger(days) || days < LIMITS.noticeDays.min || days > LIMITS.noticeDays.max) {
    return {
      error: `The deprecation notice period must be between ${LIMITS.noticeDays.min} and ${LIMITS.noticeDays.max} days.`,
    };
  }

  const deprecationCount = parsed.byKind.deprecated || 0;
  let removalDate = null;
  if (deprecationCount > 0) {
    const computed = addDays(releaseDate, days);
    if (computed.error) return { error: computed.error };
    removalDate = computed.date;
  }

  const extra = typeof notes === "string" ? notes.trim() : "";
  const usedKinds = CHANGE_KINDS.filter((kind) => parsed.byKind[kind.id] > 0);
  const effectiveHighlights = Math.min(highlights, parsed.items.length);

  const lines = [
    `Write the release note for ${name} ${versionLabel}${releaseDate ? `, shipping ${releaseDate}` : ""}.`,
    "",
    `CHANNEL: ${channel.label}. ${channel.directive}`,
    `LENGTH: at most ${channel.maxWords} words. If the material does not fill it, stop early.`,
    `HIGHLIGHTS: open with the ${effectiveHighlights} change${effectiveHighlights === 1 ? "" : "s"} that matter most to the reader, chosen from the list below — breaking changes and security fixes outrank new features.`,
    "",
    `CHANGES (${parsed.items.length}), already ordered by what the reader must read first:`,
  ];

  for (const kind of usedKinds) {
    lines.push("", `${kind.label.toUpperCase()} (${parsed.byKind[kind.id]}) — ${kind.directive}`);
    for (const item of parsed.items.filter((entry) => entry.kind === kind.id)) {
      lines.push(`- ${item.summary}`);
    }
  }

  if (removalDate) {
    lines.push(
      "",
      `DEPRECATION TIMELINE: announced ${releaseDate}, ${days} days' notice, so the deprecated behaviour stops working on ${removalDate}. State that date explicitly next to every deprecation, and say what happens to callers who do nothing.`,
    );
  }

  lines.push(
    "",
    "RULES:",
    "- Write for someone who did not follow the development. Assume no knowledge of the internal names.",
    "- One change per line. Do not merge a breaking change into a feature bullet.",
    "- Say what the reader must do, and when, before saying what is new.",
    "- No superlatives, no \"we're excited to announce\", no version number in every sentence.",
    "- Do not invent changes, dates, metrics or issue numbers. Anything missing is TODO(verify).",
    "- Finish with where to get help, and the link to the full changelog.",
  );

  if (parsed.unclassified > 0) {
    lines.push(
      `- ${parsed.unclassified} line${parsed.unclassified === 1 ? "" : "s"} had no kind prefix and defaulted to Improvement. Re-classify from the wording and flag anything ambiguous as TODO(verify).`,
    );
  }
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    items: parsed.items,
    byKind: parsed.byKind,
    usedKinds,
    itemCount: parsed.items.length,
    unclassified: parsed.unclassified,
    channel,
    highlightCount: effectiveHighlights,
    deprecationCount,
    removalDate,
    estimatedReadMinutes: readingMinutes(channel.maxWords),
    ...measureText(text),
  };
}
