/**
 * Customer Support Prompt Pack — readability analysis + prompt composition.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/**
 * Flesch Reading Ease (Rudolf Flesch, 1948):
 *   206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
 */
export const FRE_BASE = 206.835;
export const FRE_SENTENCE_WEIGHT = 1.015;
export const FRE_SYLLABLE_WEIGHT = 84.6;

/**
 * Flesch-Kincaid Grade Level (Kincaid et al., 1975, US Navy Research Branch
 * Report 8-75):
 *   0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
 */
export const FKGL_SENTENCE_WEIGHT = 0.39;
export const FKGL_SYLLABLE_WEIGHT = 11.8;
export const FKGL_CONSTANT = 15.59;

/** Flesch's own interpretation bands for the reading-ease score. */
export const READING_BANDS = [
  { min: 90, label: "Very easy", note: "understood by an average 11-year-old" },
  { min: 80, label: "Easy", note: "conversational English" },
  { min: 70, label: "Fairly easy", note: "comfortable for most support replies" },
  { min: 60, label: "Standard", note: "plain English, 13-15 year-old reading level" },
  { min: 50, label: "Fairly difficult", note: "starts to feel like a policy document" },
  { min: 30, label: "Difficult", note: "university reading level" },
  { min: -Infinity, label: "Very confusing", note: "rewrite this before sending" },
];

/**
 * Suggested body lengths per channel. Only X/Twitter's 280 characters is a hard
 * platform limit; the rest are practical caps for a reply that gets read.
 */
export const CHANNELS = [
  { id: "email", label: "Email reply", cap: 1200, hardLimit: false, note: "RFC 5322 recommends wrapping body lines at 78 characters." },
  { id: "macro", label: "Help-desk macro / saved reply", cap: 800, hardLimit: false, note: "Written once, reused by the whole team." },
  { id: "chat", label: "Live chat", cap: 320, hardLimit: false, note: "Long paragraphs stall a live conversation." },
  { id: "inapp", label: "In-app message", cap: 240, hardLimit: false, note: "Competes with the interface around it." },
  { id: "public", label: "Public reply on X", cap: 280, hardLimit: true, note: "280 characters is X's hard limit for a standard post." },
];

export const SUPPORT_TASKS = [
  {
    id: "macro-rewrite",
    label: "Rewrite a macro",
    blurb: "Make a saved reply sound human without losing the facts.",
    instruction:
      "Rewrite the draft below as a reusable macro. Keep every factual claim, policy limit and link exactly as written. Remove filler openings, remove any sentence that only restates the customer's problem back at them, and replace passive constructions with the active voice. Mark any place the agent must personalise with a bracketed token like [order number].",
  },
  {
    id: "tone-soften",
    label: "Soften the tone",
    blurb: "Same decision, less blunt.",
    instruction:
      "Rewrite the draft below so it lands more gently without changing what is being agreed or refused. Do not add promises, credits or timelines that are not already in the draft. Acknowledge the impact on the customer in the first sentence, keep the decision in the second, and put the next step last.",
  },
  {
    id: "escalation-summary",
    label: "Escalation summary",
    blurb: "Hand the ticket up with everything engineering needs.",
    instruction:
      "Turn the ticket notes below into an escalation summary for a senior engineer who has never seen this ticket. Separate what the customer observed from what we have verified. State the reproduction steps, the impact and the blocker in that order, and end with the single question you need answered to move the ticket forward.",
  },
  {
    id: "decline",
    label: "Decline a request",
    blurb: "Say no clearly, and offer what you can.",
    instruction:
      "Rewrite the draft below as a clear refusal. Give the decision in the first sentence rather than burying it after an apology. State the reason in one sentence using the policy wording supplied, avoid the word 'unfortunately' more than once, and close with the nearest thing you can actually offer.",
  },
  {
    id: "apology",
    label: "Apology with a remedy",
    blurb: "Own the failure and state the fix.",
    instruction:
      "Rewrite the draft below as an apology. Name what went wrong in plain words, do not use conditional apologies such as 'sorry if', state the remedy already agreed, and give a concrete date or window for the next update. Do not speculate about the cause.",
  },
  {
    id: "followup",
    label: "Follow-up / closing note",
    blurb: "Close the loop before the ticket auto-closes.",
    instruction:
      "Rewrite the draft below as a follow-up before the ticket closes. Summarise what was done in one line, confirm whether anything is still open, and tell the customer exactly how to reopen the ticket. Keep it short enough to read on a phone lock screen preview.",
  },
];

export const TONES = [
  { id: "warm", label: "Warm and human", instruction: "Warm, first-person, contractions allowed. Never chirpy about a problem." },
  { id: "neutral", label: "Neutral and professional", instruction: "Professional and even. No exclamation marks, no emoji." },
  { id: "formal", label: "Formal", instruction: "Formal register, full words instead of contractions, suitable for a regulated or enterprise account." },
  { id: "brief", label: "Brief and factual", instruction: "Strip everything that is not a fact or a next step. One idea per sentence." },
];

/** Practical target range for support writing. */
export const MIN_TARGET_GRADE = 4;
export const MAX_TARGET_GRADE = 14;

/** Words of 3 letters or fewer are treated as one syllable. */
const SHORT_WORD_LENGTH = 3;

/** Split into words on any non-letter/digit/apostrophe run. */
export function splitWords(text) {
  if (typeof text !== "string") return [];
  return text
    .replace(/[^A-Za-z0-9'’\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Sentence count. Any run of . ! ? closes a sentence; non-empty text with no
 * terminator still counts as one sentence so the ratio never divides by zero.
 */
export function countSentences(text) {
  if (typeof text !== "string" || !text.trim()) return 0;
  const matches = text.match(/[.!?]+(?=\s|$)/g);
  const count = matches ? matches.length : 0;
  return count > 0 ? count : 1;
}

/**
 * Syllable estimate using the standard vowel-group heuristic: drop a silent
 * trailing "e"/"ed"/"es", then count runs of vowels. Minimum one per word.
 */
export function countSyllables(word) {
  const clean = String(word || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (!clean) {
    // A token with no letters is still spoken aloud (an order number, a date),
    // so it counts as at least one syllable. Truly empty input counts as zero.
    return /\d/.test(String(word || "")) ? 1 : 0;
  }
  if (clean.length <= SHORT_WORD_LENGTH) return 1;
  const trimmed = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return groups && groups.length > 0 ? groups.length : 1;
}

/** Sum of countSyllables over every word. */
export function countTextSyllables(text) {
  return splitWords(text).reduce((total, word) => total + countSyllables(word), 0);
}

/** Band label for a Flesch reading-ease score. */
export function readingEaseBand(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return READING_BANDS[READING_BANDS.length - 1];
  return READING_BANDS.find((band) => value >= band.min) || READING_BANDS[READING_BANDS.length - 1];
}

/**
 * Full readability report for a block of prose.
 * @returns {object} { error } when there is nothing to measure.
 */
export function analyseReadability(text) {
  const words = splitWords(text);
  const wordCount = words.length;
  if (wordCount === 0) return { error: "Paste the draft reply you want rewritten." };

  const sentenceCount = countSentences(text);
  const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);
  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  const readingEase =
    FRE_BASE - FRE_SENTENCE_WEIGHT * wordsPerSentence - FRE_SYLLABLE_WEIGHT * syllablesPerWord;
  const grade =
    FKGL_SENTENCE_WEIGHT * wordsPerSentence + FKGL_SYLLABLE_WEIGHT * syllablesPerWord - FKGL_CONSTANT;

  const band = readingEaseBand(readingEase);

  return {
    wordCount,
    sentenceCount,
    syllableCount,
    wordsPerSentence,
    syllablesPerWord,
    readingEase,
    grade,
    bandLabel: band.label,
    bandNote: band.note,
    charCount: String(text).length,
  };
}

/** Look-ups. Each returns null for an unknown id. */
export function getSupportTask(taskId) {
  return SUPPORT_TASKS.find((item) => item.id === taskId) || null;
}
export function getChannel(channelId) {
  return CHANNELS.find((item) => item.id === channelId) || null;
}
export function getTone(toneId) {
  return TONES.find((item) => item.id === toneId) || null;
}

/**
 * Compose the rewrite prompt.
 *
 * @returns {object} { prompt, readability, ... } or { error }
 */
export function buildSupportPrompt({
  taskId,
  draft = "",
  channelId = "email",
  toneId = "warm",
  targetGrade = 8,
  policyNotes = "",
  product = "",
} = {}) {
  const task = getSupportTask(taskId);
  if (!task) return { error: "Pick the kind of reply you are writing." };

  const channel = getChannel(channelId);
  if (!channel) return { error: "Pick the channel this reply goes out on." };

  const tone = getTone(toneId);
  if (!tone) return { error: "Pick a tone for the reply." };

  const gradeTarget = Number(targetGrade);
  if (!Number.isFinite(gradeTarget)) return { error: "Target reading grade must be a number." };
  if (gradeTarget < MIN_TARGET_GRADE || gradeTarget > MAX_TARGET_GRADE) {
    return {
      error: `Target reading grade must be between ${MIN_TARGET_GRADE} and ${MAX_TARGET_GRADE}.`,
    };
  }

  const readability = analyseReadability(draft);
  if (readability.error) return { error: readability.error };

  const productLine = String(product || "").trim();
  const policy = String(policyNotes || "").trim();
  const currentGrade = readability.grade;
  const gap = currentGrade - gradeTarget;

  const sections = [
    {
      title: "Role",
      body: `You are a senior customer support writer${productLine ? ` for ${productLine}` : ""}. You edit replies for clarity and accuracy. You never invent policy, refunds, dates or account details.`,
    },
    { title: "Task", body: task.instruction },
    {
      title: "Draft to rewrite",
      body: String(draft).trim(),
    },
    ...(policy ? [{ title: "Policy and facts I can rely on", body: policy }] : []),
    {
      title: "Constraints",
      body: [
        tone.instruction,
        `Channel: ${channel.label}. Keep the reply under ${channel.cap} characters${channel.hardLimit ? " — this is a hard platform limit" : ""}. ${channel.note}`,
        `Target a Flesch-Kincaid grade level of about ${gradeTarget}. The draft currently scores ${currentGrade.toFixed(1)} (${readability.readingEase.toFixed(1)} reading ease, "${readability.bandLabel}"), so ${
          gap > 0.5
            ? "shorten sentences and swap long words for short ones"
            : gap < -0.5
              ? "you have room for slightly fuller sentences if it adds clarity"
              : "hold roughly the current sentence length"
        }.`,
        "Do not add any commitment, refund, discount, deadline or policy that is not in the draft or in the facts above.",
        "Keep every number, order reference, link and product name character-for-character identical.",
        "Do not open with 'I hope this email finds you well' or any equivalent filler.",
      ].join("\n"),
    },
    {
      title: "Output format",
      body: "Return the rewritten reply only, ready to paste. Underneath, add a line of dashes and then a two-bullet note listing what you changed and anything you think is factually missing.",
    },
  ];

  const prompt = sections.map((section) => `${section.title}:\n${section.body}`).join("\n\n");

  return {
    prompt,
    sections,
    readability,
    taskLabel: task.label,
    channelLabel: channel.label,
    channelCap: channel.cap,
    targetGrade: gradeTarget,
    gradeGap: gap,
    draftOverCap: readability.charCount > channel.cap,
    promptChars: prompt.length,
  };
}
