/**
 * Video Description Template Builder — pure text assembly and rule checking.
 * No React, no JSX, no DOM.
 *
 * The limits below are YouTube's published rules for descriptions, automatic
 * chapters and hashtags.
 */

/** A YouTube description can hold 5,000 characters. */
export const MAX_DESCRIPTION_CHARS = 5000;

/** Roughly what is visible before "Show more" and in search results. */
export const ABOVE_FOLD_CHARS = 157;

/** Automatic chapters need at least three timestamps. */
export const MIN_CHAPTERS = 3;

/** Every chapter must run for at least 10 seconds. */
export const MIN_CHAPTER_SECONDS = 10;

/** The first three hashtags appear above the video title. */
export const HASHTAGS_ABOVE_TITLE = 3;

/** More than 15 hashtags and YouTube ignores all of them. */
export const MAX_HASHTAGS = 15;

/** Placeholder syntax used by templates: {{name}}. */
const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

/**
 * Parse "M:SS" or "H:MM:SS" into seconds.
 * Returns null when the value is not a valid timestamp.
 */
export function parseTimecode(value) {
  const text = String(value ?? "").trim();
  const match = /^(?:(\d{1,2}):)?(\d{1,3}):(\d{2})$/.exec(text);
  if (!match) return null;
  const hours = match[1] === undefined ? 0 : Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (seconds > 59) return null;
  if (match[1] !== undefined && minutes > 59) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

/** Seconds -> "M:SS" or "H:MM:SS". */
export function formatTimecode(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const whole = Math.round(value);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/**
 * Parse a chapter block. One chapter per line: "0:00 Introduction".
 */
export function parseChapters(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^((?:\d{1,2}:)?\d{1,3}:\d{2})\s*[-–—|]?\s*(.*)$/.exec(line);
      if (!match) return { raw: line, seconds: null, title: line };
      return { raw: line, seconds: parseTimecode(match[1]), title: match[2].trim() };
    });
}

/**
 * Check a chapter list against YouTube's automatic-chapter rules.
 *
 * @returns {{valid:boolean,problems:string[],chapters:Array}}
 */
export function validateChapters(chapters) {
  const list = Array.isArray(chapters) ? chapters : [];
  const problems = [];

  if (list.length === 0) {
    return { valid: false, problems: ["No chapters added."], chapters: [] };
  }

  const bad = list.filter((chapter) => chapter.seconds === null);
  if (bad.length > 0) {
    problems.push(`${bad.length} line${bad.length === 1 ? " does" : "s do"} not start with a valid timestamp such as 0:00.`);
  }
  const untitled = list.filter((chapter) => chapter.seconds !== null && !chapter.title);
  if (untitled.length > 0) {
    problems.push(`${untitled.length} timestamp${untitled.length === 1 ? " has" : "s have"} no chapter title after it.`);
  }

  const valid = list.filter((chapter) => chapter.seconds !== null);
  if (valid.length < MIN_CHAPTERS) {
    problems.push(`Chapters need at least ${MIN_CHAPTERS} timestamps; there ${valid.length === 1 ? "is" : "are"} ${valid.length}.`);
  }
  if (valid.length > 0 && valid[0].seconds !== 0) {
    problems.push("The first chapter must start at 0:00.");
  }
  for (let i = 1; i < valid.length; i += 1) {
    if (valid[i].seconds <= valid[i - 1].seconds) {
      problems.push(`Chapter ${i + 1} (${formatTimecode(valid[i].seconds)}) is not later than the one before it.`);
      break;
    }
  }
  for (let i = 1; i < valid.length; i += 1) {
    const gap = valid[i].seconds - valid[i - 1].seconds;
    if (gap > 0 && gap < MIN_CHAPTER_SECONDS) {
      problems.push(`Chapter ${i} is only ${gap} seconds long; every chapter must run at least ${MIN_CHAPTER_SECONDS} seconds.`);
      break;
    }
  }

  return { valid: problems.length === 0, problems, chapters: valid };
}

/** Pull "#tag" tokens out of free text and normalise them. */
export function parseHashtags(text) {
  const found = String(text ?? "").match(/#[\p{L}\p{N}_]+/gu) || [];
  const seen = new Set();
  const tags = [];
  for (const tag of found) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

/** One "Label | https://example.com" per line. */
export function parseLinks(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      if (parts.length >= 2) {
        return { label: parts[0].trim(), url: parts.slice(1).join("|").trim() };
      }
      return { label: "", url: line };
    })
    .filter((link) => link.url);
}

/** Fill {{placeholders}} and report any that were left unfilled. */
export function applyTemplate(template, values = {}) {
  const missing = new Set();
  const text = String(template ?? "").replace(PLACEHOLDER_RE, (whole, key) => {
    const replacement = values[key];
    if (replacement === undefined || replacement === null || String(replacement).trim() === "") {
      missing.add(key);
      return whole;
    }
    return String(replacement);
  });
  return { text, missing: Array.from(missing) };
}

/** List the placeholder names used by a template. */
export function templatePlaceholders(template) {
  const names = new Set();
  const matches = String(template ?? "").matchAll(PLACEHOLDER_RE);
  for (const match of matches) names.add(match[1]);
  return Array.from(names);
}

/**
 * Assemble the description and check it against the platform rules.
 *
 * @returns {{error:string}|{text:string,length:number,remaining:number,aboveFold:string,warnings:string[],chapterCheck:object,hashtagCount:number,linkCount:number}}
 */
export function buildDescription({
  hook = "",
  summary = "",
  chapterText = "",
  linkText = "",
  hashtagText = "",
  cta = "",
  disclosure = "",
  values = {},
} = {}) {
  const chapters = parseChapters(chapterText);
  const chapterCheck = validateChapters(chapters);
  const links = parseLinks(linkText);
  const hashtags = parseHashtags(hashtagText);

  const blocks = [];
  if (String(hook).trim()) blocks.push(String(hook).trim());
  if (String(summary).trim()) blocks.push(String(summary).trim());
  if (String(cta).trim()) blocks.push(String(cta).trim());
  if (chapters.length > 0) {
    blocks.push(
      ["CHAPTERS", ...chapters.map((chapter) =>
        chapter.seconds === null ? chapter.raw : `${formatTimecode(chapter.seconds)} ${chapter.title}`.trim(),
      )].join("\n"),
    );
  }
  if (links.length > 0) {
    blocks.push(["LINKS", ...links.map((link) => (link.label ? `${link.label}: ${link.url}` : link.url))].join("\n"));
  }
  if (String(disclosure).trim()) blocks.push(String(disclosure).trim());
  if (hashtags.length > 0) blocks.push(hashtags.join(" "));

  if (blocks.length === 0) {
    return { error: "Add at least a hook or a summary to build a description." };
  }

  const assembled = blocks.join("\n\n");
  const filled = applyTemplate(assembled, values);
  const text = filled.text;
  const length = text.length;

  const warnings = [];
  if (length > MAX_DESCRIPTION_CHARS) {
    warnings.push(
      `The description is ${length - MAX_DESCRIPTION_CHARS} characters over the ${MAX_DESCRIPTION_CHARS}-character limit.`,
    );
  }
  if (hashtags.length > MAX_HASHTAGS) {
    warnings.push(
      `${hashtags.length} hashtags — over ${MAX_HASHTAGS} and YouTube ignores every hashtag on the video.`,
    );
  }
  if (chapters.length > 0 && !chapterCheck.valid) {
    warnings.push("Chapters will not appear until the timestamp problems below are fixed.");
  }
  if (filled.missing.length > 0) {
    warnings.push(`Unfilled placeholders: ${filled.missing.map((key) => `{{${key}}}`).join(", ")}.`);
  }
  const firstLine = text.split("\n")[0] || "";
  if (firstLine.length > ABOVE_FOLD_CHARS) {
    warnings.push(
      `The opening line is ${firstLine.length} characters; only about ${ABOVE_FOLD_CHARS} show before "Show more".`,
    );
  }

  return {
    text,
    length,
    remaining: MAX_DESCRIPTION_CHARS - length,
    aboveFold: text.slice(0, ABOVE_FOLD_CHARS),
    warnings,
    chapterCheck,
    chapterCount: chapterCheck.chapters.length,
    hashtagCount: hashtags.length,
    pinnedHashtags: hashtags.slice(0, HASHTAGS_ABOVE_TITLE),
    linkCount: links.length,
    missingPlaceholders: filled.missing,
  };
}
