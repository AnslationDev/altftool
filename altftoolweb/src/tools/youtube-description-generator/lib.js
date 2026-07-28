/**
 * YouTube Description Generator — assembles a description and checks it
 * against YouTube's own published limits.
 *
 * The rules encoded here all come from YouTube Help, not from folklore:
 *
 *  - A video description may contain at most 5,000 characters.
 *  - Automatic chapters require the list to start at 00:00, to contain at
 *    least three timestamps, and for every chapter to run at least 10 seconds.
 *    Break any one of those and YouTube shows no chapters at all.
 *  - A video may carry at most 60 hashtags. Above that, YouTube ignores every
 *    hashtag on the video rather than just the extras.
 *  - The first three hashtags in the description are the ones shown above the
 *    video title.
 *
 * The watch page collapses a description after its first three lines behind
 * "…more", so the module also returns those three lines as the above-the-fold
 * preview — the only part most viewers ever read.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Maximum characters in a YouTube video description (YouTube Help). */
export const DESCRIPTION_LIMIT = 5000;

/** Maximum hashtags per video; beyond this YouTube ignores all of them. */
export const HASHTAG_LIMIT = 60;

/** Hashtags shown above the video title on the watch page. */
export const HASHTAGS_ABOVE_TITLE = 3;

/** Chapter requirements: at least this many timestamps, first at 00:00,
 * and every chapter at least this many seconds long. */
export const MIN_CHAPTERS = 3;
export const MIN_CHAPTER_SECONDS = 10;

/** Lines of description shown before the "…more" fold on the watch page. */
export const ABOVE_FOLD_LINES = 3;

/** Maximum length of a YouTube video title, for the reminder in the UI. */
export const TITLE_LIMIT = 100;

/** Seconds in a minute and an hour, for timestamp maths. */
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** Section headings used when assembling the description. */
export const HEADINGS = {
  chapters: "CHAPTERS",
  links: "LINKS MENTIONED",
  resources: "GEAR & RESOURCES",
  socials: "FIND ME HERE",
};

/** The affiliate wording the FTC endorsement guides expect to be plain and
 * unavoidable; shown verbatim when the creator ticks the affiliate box. */
export const AFFILIATE_DISCLOSURE =
  "Some links above are affiliate links. If you buy through them I may earn a small commission at no extra cost to you.";

/**
 * Parse "0:00", "1:23", "01:02:03" or "3s" style timestamps into seconds.
 * @returns {number|null} null when the text is not a timestamp
 */
export function parseTimestamp(text) {
  if (typeof text !== "string") return null;
  const match = text.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = match[1] === undefined ? 0 : Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (minutes > 59 || seconds > 59) return null;
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

/** Render seconds as "m:ss", or "h:mm:ss" once past an hour. */
export function formatTimestamp(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / SECONDS_PER_HOUR);
  const minutes = Math.floor((whole % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = whole % SECONDS_PER_MINUTE;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  return hours > 0
    ? `${hours}:${mm}:${String(seconds).padStart(2, "0")}`
    : `${mm}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Read a block of "0:00 Intro" lines into chapter objects, in the order given.
 *
 * @param {string} text
 * @returns {{chapters:Array<{seconds:number,label:string}>, badLines:string[]}}
 */
export function parseChapters(text) {
  const chapters = [];
  const badLines = [];
  if (typeof text !== "string") return { chapters, badLines };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "") continue;
    const match = line.match(/^((?:\d{1,2}:)?\d{1,2}:\d{2})\s*[-–—|)]?\s*(.*)$/);
    const seconds = match ? parseTimestamp(match[1]) : null;
    if (seconds === null) {
      badLines.push(line);
      continue;
    }
    chapters.push({ seconds, label: match[2].trim() });
  }
  return { chapters, badLines };
}

/**
 * Check a chapter list against YouTube's three chapter rules.
 *
 * @param {Array<{seconds:number,label:string}>} chapters
 * @returns {{valid:boolean, issues:string[]}}
 */
export function validateChapters(chapters) {
  const issues = [];
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return { valid: false, issues: ["No timestamps yet — chapters need at least three."] };
  }
  if (chapters[0].seconds !== 0) {
    issues.push("The first timestamp must be 0:00 or YouTube shows no chapters at all.");
  }
  if (chapters.length < MIN_CHAPTERS) {
    issues.push(`Chapters need at least ${MIN_CHAPTERS} timestamps; you have ${chapters.length}.`);
  }
  for (let i = 0; i < chapters.length; i += 1) {
    if (chapters[i].label === "") {
      issues.push(`The timestamp ${formatTimestamp(chapters[i].seconds)} has no chapter title.`);
    }
    if (i === 0) continue;
    const gap = chapters[i].seconds - chapters[i - 1].seconds;
    if (gap <= 0) {
      issues.push(
        `${formatTimestamp(chapters[i].seconds)} is not after ${formatTimestamp(chapters[i - 1].seconds)} — timestamps must go forwards.`,
      );
    } else if (gap < MIN_CHAPTER_SECONDS) {
      issues.push(
        `The chapter starting ${formatTimestamp(chapters[i - 1].seconds)} lasts ${gap}s; every chapter must be at least ${MIN_CHAPTER_SECONDS}s.`,
      );
    }
  }
  return { valid: issues.length === 0, issues };
}

/**
 * Clean a free-text hashtag list into valid YouTube hashtags.
 * Spaces and punctuation are stripped because a hashtag ends at the first
 * space, so "#home baking" would tag only "#home".
 *
 * @param {string} text
 * @returns {string[]} unique tags, each starting with "#"
 */
export function normaliseHashtags(text) {
  if (typeof text !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const piece of text.split(/[\s,]+/)) {
    const cleaned = piece.replace(/[^\p{L}\p{N}_]/gu, "");
    if (cleaned === "") continue;
    const tag = `#${cleaned}`;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

/** Split a textarea into trimmed, non-empty lines. */
export function toLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/**
 * Assemble the description.
 *
 * @param {{
 *   hook?:string, summary?:string, chapters?:string, links?:string,
 *   resources?:string, socials?:string, callToAction?:string,
 *   hashtags?:string, affiliate?:boolean, includeHeadings?:boolean
 * }} input
 * @returns {{
 *   description:string, characters:number, remaining:number, lines:number,
 *   aboveFold:string, chapters:Array, chapterCheck:object, badChapterLines:string[],
 *   hashtags:string[], shownHashtags:string[], warnings:string[]
 * }|{error:string}}
 */
export function buildDescription(input = {}) {
  const {
    hook = "",
    summary = "",
    chapters: chapterText = "",
    links = "",
    resources = "",
    socials = "",
    callToAction = "",
    hashtags: hashtagText = "",
    affiliate = false,
    includeHeadings = true,
  } = input;

  const hookLine = String(hook).trim();
  const summaryText = String(summary).trim();

  if (hookLine === "" && summaryText === "") {
    return { error: "Write an opening line or a summary — a description needs at least one of them." };
  }

  const { chapters, badLines } = parseChapters(chapterText);
  const chapterCheck = validateChapters(chapters);
  const hashtags = normaliseHashtags(hashtagText);

  const blocks = [];
  if (hookLine !== "") blocks.push(hookLine);
  if (summaryText !== "") blocks.push(summaryText);

  if (chapters.length > 0) {
    const body = chapters
      .map((chapter) => `${formatTimestamp(chapter.seconds)} ${chapter.label}`.trim())
      .join("\n");
    blocks.push(includeHeadings ? `${HEADINGS.chapters}\n${body}` : body);
  }

  const linkLines = toLines(links);
  if (linkLines.length > 0) {
    blocks.push(includeHeadings ? `${HEADINGS.links}\n${linkLines.join("\n")}` : linkLines.join("\n"));
  }

  const resourceLines = toLines(resources);
  if (resourceLines.length > 0) {
    blocks.push(
      includeHeadings ? `${HEADINGS.resources}\n${resourceLines.join("\n")}` : resourceLines.join("\n"),
    );
  }

  if (affiliate && (linkLines.length > 0 || resourceLines.length > 0)) {
    blocks.push(AFFILIATE_DISCLOSURE);
  }

  const cta = String(callToAction).trim();
  if (cta !== "") blocks.push(cta);

  const socialLines = toLines(socials);
  if (socialLines.length > 0) {
    blocks.push(includeHeadings ? `${HEADINGS.socials}\n${socialLines.join("\n")}` : socialLines.join("\n"));
  }

  if (hashtags.length > 0) blocks.push(hashtags.join(" "));

  const description = blocks.join("\n\n");
  const characters = description.length;
  const allLines = description.split("\n");

  const warnings = [];
  if (characters > DESCRIPTION_LIMIT) {
    warnings.push(
      `This is ${characters - DESCRIPTION_LIMIT} characters over YouTube's ${DESCRIPTION_LIMIT}-character limit and will be cut off.`,
    );
  }
  if (hashtags.length > HASHTAG_LIMIT) {
    warnings.push(
      `${hashtags.length} hashtags is above the limit of ${HASHTAG_LIMIT} — YouTube then ignores every hashtag on the video, not just the extras.`,
    );
  }
  if (badLines.length > 0) {
    warnings.push(
      `${badLines.length} chapter line${badLines.length === 1 ? "" : "s"} had no readable timestamp and ${badLines.length === 1 ? "was" : "were"} skipped.`,
    );
  }
  if (chapters.length > 0 && !chapterCheck.valid) {
    warnings.push(...chapterCheck.issues);
  }
  if (hookLine === "") {
    warnings.push("Only the first three lines show before “…more”, so put your strongest line first.");
  }

  return {
    description,
    characters,
    remaining: DESCRIPTION_LIMIT - characters,
    lines: allLines.length,
    aboveFold: allLines.slice(0, ABOVE_FOLD_LINES).join("\n"),
    chapters,
    chapterCheck,
    badChapterLines: badLines,
    hashtags,
    shownHashtags: hashtags.slice(0, HASHTAGS_ABOVE_TITLE),
    warnings,
  };
}

/** Worked example used as the tool's starting state. */
export const SAMPLE_INPUT = {
  hook: "Five sourdough mistakes I made for two years — and the fix for each one.",
  summary:
    "A slack, flat loaf is almost always one of five things, and none of them is your flour. In this video I bake two loaves side by side so you can see exactly what over-proofing, a cold kitchen and a weak shape do to the crumb.",
  chapters: `0:00 Why your loaf goes flat
0:48 Mistake 1: over-proofing
3:10 Mistake 2: a cold kitchen
6:32 Mistake 3: skipping the shape
9:05 Side-by-side bake
12:40 The 5-point checklist`,
  links: `Free proofing checklist (PDF): https://example.com/checklist
The starter schedule I use: https://example.com/starter`,
  resources: `Banneton I use: https://example.com/banneton
Dough scraper: https://example.com/scraper`,
  socials: `Instagram: https://instagram.com/example
Newsletter: https://example.com/newsletter`,
  callToAction: "If this saved you a loaf, subscribe — new baking videos every Thursday.",
  hashtags: "sourdough baking breadmaking homebaking",
  affiliate: true,
  includeHeadings: true,
};
