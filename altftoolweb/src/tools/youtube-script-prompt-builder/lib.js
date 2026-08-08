/**
 * YouTube Script Prompt Builder.
 *
 * Converts a target runtime into a word count at spoken pace, splits it
 * across hook, setup, chapters and outro with timings, schedules retention
 * beats, and writes the script prompt with all of it embedded.
 */

/**
 * Conversational English narration runs about 140–160 words per minute;
 * 150 wpm is the standard scripting figure used for timing scripts.
 */
export const SPEAKING_WORDS_PER_MINUTE = 150;

/**
 * YouTube's own creator guidance: viewers decide whether to stay within
 * roughly the first 15 seconds, so the hook is budgeted at 15 seconds.
 */
export const HOOK_SECONDS = 15;

/** Setup/context block for longer videos; skipped under 4 minutes. */
export const SETUP_SECONDS = 30;
export const SETUP_MIN_RUNTIME_SECONDS = 240;

/** Outro + CTA block. Longer outros bleed end-screen retention. */
export const OUTRO_SECONDS = 20;

/**
 * Practitioner retention rule: re-earn attention with a pattern interrupt
 * (visual change, question, payoff preview) every 30–60 seconds. The
 * midpoint, 45 seconds, is used to schedule beats.
 */
export const RETENTION_BEAT_INTERVAL_SECONDS = 45;

/** YouTube hard limit: video titles are capped at 100 characters. */
export const TITLE_MAX_CHARS = 100;

/** A chapter shorter than this cannot land a point on screen. */
export const MIN_CHAPTER_SECONDS = 20;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const LIMITS = {
  runtimeMinutes: { min: 1, max: 60 },
  chapters: { min: 1, max: 12 },
};

export const VIDEO_STYLES = [
  {
    id: "tutorial",
    label: "Tutorial — teach one skill",
    directive:
      "Each chapter is one step with the on-screen action described in [brackets]. State what the viewer can now do at the end of every chapter.",
  },
  {
    id: "explainer",
    label: "Explainer — make one idea click",
    directive:
      "Build one concept per chapter, each on top of the last. Use one concrete analogy per chapter, and never two analogies for the same idea.",
  },
  {
    id: "listicle",
    label: "List — ranked items",
    directive:
      "One item per chapter, ranked weakest to strongest so retention builds. Tease the top item in the hook without naming it.",
  },
  {
    id: "story",
    label: "Story — what happened and why it matters",
    directive:
      "Chapters follow the arc: stakes, attempt, complication, resolution, lesson. Open each chapter mid-action, not with recap.",
  },
];

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  // Reject non-integer input instead of silently rounding it: rounding would
  // let the field show e.g. "10.5" while the stats panel and generated
  // prompt disagree and say "11-minute video". Feeding NaN through here
  // surfaces the existing "Enter whole numbers..." error instead.
  return Number.isInteger(number) ? number : NaN;
}

/** Words spoken in a given number of seconds at the scripting pace. */
export function wordsForSeconds(seconds) {
  return Math.round((seconds / 60) * SPEAKING_WORDS_PER_MINUTE);
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

export function getStyle(styleId) {
  return VIDEO_STYLES.find((style) => style.id === styleId) || null;
}

/** Format whole seconds as m:ss. */
export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Turn a runtime and chapter count into timed, word-budgeted blocks.
 * @returns {{error:string}|object}
 */
export function planScript({ runtimeMinutes, chapterCount } = {}) {
  const minutes = toInt(runtimeMinutes);
  const chapters = toInt(chapterCount);

  if ([minutes, chapters].some((value) => Number.isNaN(value))) {
    return { error: "Enter whole numbers for the runtime and chapter count." };
  }
  if (minutes < LIMITS.runtimeMinutes.min || minutes > LIMITS.runtimeMinutes.max) {
    return {
      error: `Runtime must be between ${LIMITS.runtimeMinutes.min} and ${LIMITS.runtimeMinutes.max} minutes.`,
    };
  }
  if (chapters < LIMITS.chapters.min || chapters > LIMITS.chapters.max) {
    return { error: `Use between ${LIMITS.chapters.min} and ${LIMITS.chapters.max} chapters.` };
  }

  const totalSeconds = minutes * 60;
  const setupSeconds = totalSeconds >= SETUP_MIN_RUNTIME_SECONDS ? SETUP_SECONDS : 0;
  const bodySeconds = totalSeconds - HOOK_SECONDS - setupSeconds - OUTRO_SECONDS;

  if (bodySeconds < chapters * MIN_CHAPTER_SECONDS) {
    return {
      error: `${chapters} chapters need at least ${chapters * MIN_CHAPTER_SECONDS} seconds of body, but only ${Math.max(0, bodySeconds)} remain after the hook and outro. Use fewer chapters or a longer runtime.`,
    };
  }

  const totalWords = wordsForSeconds(totalSeconds);
  const hookWords = wordsForSeconds(HOOK_SECONDS);
  const setupWords = wordsForSeconds(setupSeconds);
  const outroWords = wordsForSeconds(OUTRO_SECONDS);
  const bodyWords = totalWords - hookWords - setupWords - outroWords;

  const chapterSecondsEach = bodySeconds / chapters;
  const chapterWords = splitEvenly(bodyWords, chapters);

  // Chapter start timestamps (for the script's chapter markers).
  let cursor = HOOK_SECONDS + setupSeconds;
  const chapterPlan = chapterWords.map((words, index) => {
    const start = cursor;
    cursor += chapterSecondsEach;
    return {
      index: index + 1,
      words,
      startSeconds: Math.round(start),
      startLabel: formatTime(start),
      durationSeconds: Math.round(chapterSecondsEach),
    };
  });

  const retentionBeats = Math.floor(bodySeconds / RETENTION_BEAT_INTERVAL_SECONDS);

  return {
    minutes,
    totalSeconds,
    totalWords,
    hookWords,
    setupSeconds,
    setupWords,
    outroWords,
    bodySeconds,
    bodyWords,
    chapters,
    chapterSecondsEach,
    chapterPlan,
    retentionBeats,
    warnings:
      chapterSecondsEach < 40
        ? [
            `Chapters average ${Math.round(chapterSecondsEach)} seconds — under ~40 seconds a chapter barely lands before the next cut. Consider fewer chapters.`,
          ]
        : [],
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
 * Write the script prompt, embedding the timing and word budgets.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildScriptPrompt({ topic, audience, styleId, cta, notes, plan } = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid runtime first." };
  const style = getStyle(styleId);
  if (!style) return { error: "Choose a video style." };
  const subject = typeof topic === "string" && topic.trim() ? topic.trim() : "";
  if (!subject) return { error: "Enter what the video is about." };
  const viewer =
    typeof audience === "string" && audience.trim() ? audience.trim() : "a general viewer";
  const ctaText = typeof cta === "string" && cta.trim() ? cta.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    `Write a complete word-for-word YouTube script for a ${plan.minutes}-minute video (about ${plan.totalWords} words at ${SPEAKING_WORDS_PER_MINUTE} words per minute spoken). Follow the timing plan exactly.`,
    "",
    `VIDEO: ${subject}`,
    `VIEWER: ${viewer}`,
    `STYLE: ${style.label.split("—")[0].trim()} — ${style.directive}`,
    "",
    "TIMING PLAN:",
    `- 0:00 HOOK (${HOOK_SECONDS}s, ~${plan.hookWords} words): open on the payoff or the problem — viewers decide to stay in the first ${HOOK_SECONDS} seconds. No channel intro, no "welcome back".`,
  ];
  if (plan.setupSeconds > 0) {
    lines.push(
      `- ${formatTime(HOOK_SECONDS)} SETUP (${plan.setupSeconds}s, ~${plan.setupWords} words): only the context the viewer must have; cut anything they can infer.`,
    );
  }
  for (const chapter of plan.chapterPlan) {
    lines.push(
      `- ${chapter.startLabel} CHAPTER ${chapter.index} (${chapter.durationSeconds}s, ~${chapter.words} words)`,
    );
  }
  lines.push(
    `- ${formatTime(plan.totalSeconds - OUTRO_SECONDS)} OUTRO (${OUTRO_SECONDS}s, ~${plan.outroWords} words): one-line recap, then ${ctaText ? `this single CTA: ${ctaText}` : "one single CTA (subscribe OR the next video, not both)"} — end within ${OUTRO_SECONDS} seconds, no long goodbye.`,
    "",
    `RETENTION: place ${plan.retentionBeats} pattern interrupts across the body — one every ~${RETENTION_BEAT_INTERVAL_SECONDS} seconds. Mark each as [BEAT: what changes on screen or what question opens]. A beat is a visual change, an open question, or a payoff preview — not a topic change.`,
    "",
    "ALSO PROVIDE:",
    `- 3 title options, each under ${TITLE_MAX_CHARS} characters (YouTube's title limit), stating the payoff without clickbait.`,
    "- A chapter list with the timestamps above, phrased as search-friendly labels.",
    "",
    "RULES:",
    "- Spoken register: short sentences, contractions, no written-English constructions.",
    "- Describe every on-screen action or b-roll cue in [brackets] on its own line.",
    "- Do not invent statistics, dates or demos — write [fact needed] where a real detail must be inserted.",
    "- The word 'subscribe' may appear at most once, in the outro.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, style, ...measureText(text) };
}
