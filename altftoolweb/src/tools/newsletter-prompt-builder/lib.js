/**
 * Newsletter Prompt Builder.
 *
 * Turns an audience segment, sending cadence and item count into a newsletter
 * prompt with a per-item word budget, subject-line and preheader limits, and
 * a single-CTA rule written into the instructions.
 */

/**
 * Mobile mail clients display roughly 30–40 characters of a subject line
 * before truncating (iPhone Mail portrait is the usual worst case), so 40 is
 * the working ceiling used here. Desktop clients show more, but most email
 * opens happen on mobile, so the mobile limit governs.
 */
export const SUBJECT_LINE_MAX_CHARS = 40;

/**
 * Preheader (preview) text: clients show roughly 40–100 characters next to or
 * under the subject; shorter than ~40 lets the client pad the slot with the
 * email's first stray text.
 */
export const PREHEADER_MIN_CHARS = 40;
export const PREHEADER_MAX_CHARS = 100;

/**
 * Mean silent reading rate for English non-fiction, 238 words per minute
 * (Brysbaert, 2019, meta-analysis of 190 reading-rate studies).
 */
export const READING_WORDS_PER_MINUTE = 238;

/** Share of the email given to the opening note, with a practical floor. */
export const INTRO_SHARE = 0.1;
export const MIN_INTRO_WORDS = 30;

/** Share given to the sign-off (plus CTA restatement), with a floor. */
export const SIGNOFF_SHARE = 0.05;
export const MIN_SIGNOFF_WORDS = 25;

/** An item thinner than this is a bare link, not an item. */
export const MIN_ITEM_WORDS = 40;

/** The primary CTA appears at most this many times in one email. */
export const MAX_CTA_APPEARANCES = 2;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const LIMITS = {
  totalWords: { min: 100, max: 2500 },
  items: { min: 1, max: 10 },
};

/**
 * Cadence presets. The word ceilings are editorial rules of thumb — the more
 * often you land in the inbox, the shorter each email must be to keep opens.
 */
export const CADENCES = [
  {
    id: "daily",
    label: "Daily",
    recommendedMaxWords: 300,
    directive:
      "Daily cadence: one idea per send, no recap of previous editions, written to be read in under 90 seconds.",
  },
  {
    id: "weekly",
    label: "Weekly",
    recommendedMaxWords: 800,
    directive:
      "Weekly cadence: open with the single most useful item of the week, and date-stamp anything time-sensitive.",
  },
  {
    id: "fortnightly",
    label: "Fortnightly",
    recommendedMaxWords: 1200,
    directive:
      "Fortnightly cadence: items must still feel current after two weeks — prefer analysis over news that will be stale.",
  },
  {
    id: "monthly",
    label: "Monthly",
    recommendedMaxWords: 1500,
    directive:
      "Monthly cadence: readers will have forgotten the last edition — make every item self-contained with zero assumed context.",
  },
];

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Split a whole-number budget into `parts` pieces that sum exactly to it.
 * The first (budget mod parts) pieces get one extra word.
 */
export function splitEvenly(budget, parts) {
  if (!(parts > 0)) return [];
  const base = Math.floor(budget / parts);
  const remainder = budget - base * parts;
  return Array.from({ length: parts }, (unused, index) => base + (index < remainder ? 1 : 0));
}

export function getCadence(cadenceId) {
  return CADENCES.find((cadence) => cadence.id === cadenceId) || null;
}

/**
 * Allocate the email's word budget across opening, items and sign-off.
 * @returns {{error:string}|object}
 */
export function planNewsletter({ totalWords, itemCount, cadenceId } = {}) {
  const total = toInt(totalWords);
  const items = toInt(itemCount);
  const cadence = getCadence(cadenceId);

  if ([total, items].some((value) => Number.isNaN(value))) {
    return { error: "Enter whole numbers for the length and the number of items." };
  }
  if (!cadence) return { error: "Choose how often the newsletter goes out." };
  if (total < LIMITS.totalWords.min || total > LIMITS.totalWords.max) {
    return {
      error: `Email length must be between ${LIMITS.totalWords.min} and ${LIMITS.totalWords.max} words.`,
    };
  }
  if (items < LIMITS.items.min || items > LIMITS.items.max) {
    return { error: `Use between ${LIMITS.items.min} and ${LIMITS.items.max} items.` };
  }

  const intro = Math.max(MIN_INTRO_WORDS, Math.round(total * INTRO_SHARE));
  const signoff = Math.max(MIN_SIGNOFF_WORDS, Math.round(total * SIGNOFF_SHARE));
  const body = total - intro - signoff;

  if (body < items * 20) {
    return {
      error: `Only ${Math.max(0, body)} words remain for ${items} items after the opening and sign-off. Raise the length or cut items.`,
    };
  }

  const itemWords = splitEvenly(body, items);
  const perItem = body / items;

  const warnings = [];
  if (perItem < MIN_ITEM_WORDS) {
    warnings.push(
      `Each item gets only ${Math.round(perItem)} words — below about ${MIN_ITEM_WORDS} an item is just a link. Use fewer items or a longer email.`,
    );
  }
  if (total > cadence.recommendedMaxWords) {
    warnings.push(
      `${total} words is over the ~${cadence.recommendedMaxWords}-word ceiling that works for a ${cadence.label.toLowerCase()} send — long frequent emails train readers to skip.`,
    );
  }

  return {
    total,
    intro,
    signoff,
    body,
    items,
    perItem,
    itemWords,
    cadence,
    readingMinutes: total / READING_WORDS_PER_MINUTE,
    warnings,
  };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the newsletter prompt, embedding the plan and deliverability limits.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildNewsletterPrompt({
  newsletterName,
  segment,
  theme,
  cta,
  notes,
  plan,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid word budget first." };
  const segmentText = typeof segment === "string" && segment.trim() ? segment.trim() : "";
  if (!segmentText) return { error: "Describe the audience segment this edition goes to." };
  const ctaText = typeof cta === "string" && cta.trim() ? cta.trim() : "";
  if (!ctaText) return { error: "Enter the one action this edition asks readers to take." };
  const name =
    typeof newsletterName === "string" && newsletterName.trim()
      ? newsletterName.trim()
      : "the newsletter";
  const themeText = typeof theme === "string" && theme.trim() ? theme.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    `Write one edition of ${name}. Follow every limit below exactly.`,
    "",
    `AUDIENCE SEGMENT: ${segmentText} — write to this segment only; cut anything a different segment would need explained.`,
    `CADENCE: ${plan.cadence.label}. ${plan.cadence.directive}`,
  ];
  if (themeText) lines.push(`THIS EDITION'S THEME: ${themeText}`);
  lines.push(
    `PRIMARY CTA: ${ctaText}. This is the only ask in the email; it may appear at most ${MAX_CTA_APPEARANCES} times (once mid-email, once in the sign-off). No competing links styled as buttons.`,
    "",
    "SUBJECT AND PREVIEW:",
    `- Subject line: at most ${SUBJECT_LINE_MAX_CHARS} characters (mobile clients truncate around there). State the concrete payoff of opening; no clickbait, no ALL CAPS, no emoji spam.`,
    `- Preheader: ${PREHEADER_MIN_CHARS}-${PREHEADER_MAX_CHARS} characters that continue the subject rather than repeat it.`,
    "- Provide 3 subject-line options and mark which one you would send.",
    "",
    `STRUCTURE AND WORD BUDGET — total ${plan.total} words, about ${Math.max(1, Math.round(plan.readingMinutes * 60))} seconds of reading at ${READING_WORDS_PER_MINUTE} words per minute:`,
    `- Opening note: ${plan.intro} words, first person, one sentence of context then straight into item 1.`,
  );
  plan.itemWords.forEach((words, index) => {
    lines.push(
      `- Item ${index + 1}: ${words} words — a bolded one-line takeaway, then the why-it-matters for this segment.`,
    );
  });
  lines.push(
    `- Sign-off: ${plan.signoff} words, restate the CTA once, sign with a person's name not a brand.`,
    "",
    "RULES:",
    "- Plain conversational English; contractions allowed; no marketing superlatives.",
    "- Every item must pass the forward test: would a reader forward this item to a colleague on its own?",
    "- Do not invent news, dates, statistics or product claims — write [fact needed] where a real detail must be inserted.",
    "- No 'Happy [day]!' openers and no weather talk.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, ...measureText(text) };
}
