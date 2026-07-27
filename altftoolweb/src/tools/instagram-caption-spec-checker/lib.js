/**
 * Instagram Caption Spec Checker — pure analysis module.
 * No React, no DOM, no clock reads.
 */

/** Instagram caps a caption at 2,200 characters. */
export const CAPTION_LIMIT = 2200;

/** A post accepts at most 30 hashtags, counting the caption and comments together. */
export const HASHTAG_LIMIT = 30;

/**
 * The feed shows roughly the first 125 characters before collapsing the rest
 * behind a "... more" link. The exact cut-off shifts with screen width, so
 * treat it as the point to write towards rather than an exact boundary.
 */
export const FEED_TRUNCATION_CHARS = 125;

/** Past this, a caption reads as a hashtag dump rather than a caption. */
export const HASHTAG_DENSITY_WARN_PCT = 30;

/**
 * Hashtags: letters, digits and underscore only — a space or punctuation ends
 * the tag. The hash must also start a word: Instagram does not turn the "#pop"
 * in "hip#pop" into a hashtag, so the pattern requires start of line or a space
 * before it and captures the tag itself in group two.
 */
const HASHTAG_PATTERN = /(^|[ \t])(#[\p{L}\p{N}_]+)/gmu;

/** Mentions follow the same character rules but allow a dot inside the handle. */
const MENTION_PATTERN = /@[A-Za-z0-9_.]+/g;

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s]+/gi;

const EMOJI_PATTERN = /\p{Extended_Pictographic}/gu;

/** Pull every hashtag out of a caption, in the order they appear. */
export function extractHashtags(text) {
  const source = String(text ?? "");
  return [...source.matchAll(HASHTAG_PATTERN)].map((match) => match[2]);
}

export function extractMentions(text) {
  const matches = String(text ?? "").match(MENTION_PATTERN);
  return matches ? matches.map((mention) => mention.replace(/\.+$/, "")) : [];
}

export function extractUrls(text) {
  const matches = String(text ?? "").match(URL_PATTERN);
  return matches ? matches.slice() : [];
}

/**
 * Split a caption at the point the feed collapses it.
 * Returns the part a scrolling reader sees and the part behind "... more".
 */
export function splitAtTruncation(text, limit = FEED_TRUNCATION_CHARS) {
  const source = String(text ?? "");
  const cut = Number(limit);
  if (!Number.isFinite(cut) || cut < 0) return { visible: source, hidden: "", truncated: false };
  if (source.length <= cut) return { visible: source, hidden: "", truncated: false };
  return {
    visible: source.slice(0, cut),
    hidden: source.slice(cut),
    truncated: true,
  };
}

/**
 * Analyse a caption against Instagram's published limits.
 * Every issue names the rule it comes from and what to change.
 */
export function analyseCaption(text) {
  const raw = String(text ?? "");
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return { error: "Paste the caption you want to check." };
  }

  const chars = raw.length;
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const lines = raw.split("\n");
  const hashtags = extractHashtags(raw);
  const mentions = extractMentions(raw);
  const urls = extractUrls(raw);
  const emoji = raw.match(EMOJI_PATTERN) || [];

  // Instagram treats hashtags case-insensitively, so #Diwali and #diwali are
  // the same tag but each occurrence still counts towards the 30 limit.
  const seen = new Map();
  hashtags.forEach((tag) => {
    const key = tag.toLowerCase();
    seen.set(key, (seen.get(key) || 0) + 1);
  });
  const duplicateTags = [...seen.entries()].filter(([, count]) => count > 1).map(([tag]) => tag);
  const uniqueHashtags = seen.size;

  // An all-numeric tag does not become a working hashtag on Instagram.
  const numericTags = hashtags.filter((tag) => /^#\p{N}+$/u.test(tag));

  const hashtagChars = hashtags.reduce((total, tag) => total + tag.length, 0);
  const hashtagDensityPct = chars > 0 ? (hashtagChars / chars) * 100 : 0;

  const split = splitAtTruncation(raw);
  const firstLine = lines[0] || "";

  const trailingBlankLines = (() => {
    let count = 0;
    for (let index = lines.length - 1; index >= 0; index -= 1) {
      if (lines[index].trim() === "") count += 1;
      else break;
    }
    return count;
  })();

  const longBlankRuns = (() => {
    let max = 0;
    let run = 0;
    lines.forEach((line) => {
      if (line.trim() === "") {
        run += 1;
        if (run > max) max = run;
      } else {
        run = 0;
      }
    });
    return max;
  })();

  const issues = [];
  const passes = [];

  if (chars > CAPTION_LIMIT) {
    issues.push({
      id: "overCaptionLimit",
      severity: "error",
      message: `${chars} characters is over the ${CAPTION_LIMIT}-character caption limit by ${chars - CAPTION_LIMIT}.`,
      fix: `Cut ${chars - CAPTION_LIMIT} characters, or move the tail into a first comment.`,
    });
  } else {
    passes.push(`Within the ${CAPTION_LIMIT}-character caption limit.`);
  }

  if (hashtags.length > HASHTAG_LIMIT) {
    issues.push({
      id: "overHashtagLimit",
      severity: "error",
      message: `${hashtags.length} hashtags exceeds the ${HASHTAG_LIMIT} allowed on a post.`,
      fix: `Remove ${hashtags.length - HASHTAG_LIMIT}. Instagram drops the caption entirely on some clients when the cap is exceeded.`,
    });
  } else if (hashtags.length > 0) {
    passes.push(`${hashtags.length} hashtags, within the ${HASHTAG_LIMIT} cap.`);
  }

  if (duplicateTags.length > 0) {
    issues.push({
      id: "duplicateHashtags",
      severity: "warn",
      message: `${duplicateTags.length} hashtag${duplicateTags.length === 1 ? " is" : "s are"} repeated (${duplicateTags.slice(0, 3).join(", ")}). Hashtags are case-insensitive, so #Diwali and #diwali are the same tag.`,
      fix: "Delete the repeats — each one still counts against the 30 limit.",
    });
  }

  if (numericTags.length > 0) {
    issues.push({
      id: "numericHashtags",
      severity: "warn",
      message: `${numericTags.join(", ")} contains only digits, which Instagram does not turn into a working hashtag.`,
      fix: "Add at least one letter, for example #top10 rather than #10.",
    });
  }

  if (!split.truncated) {
    passes.push(`Whole caption is visible in the feed without a "more" tap.`);
  } else {
    issues.push({
      id: "truncated",
      severity: "info",
      message: `${split.hidden.length} characters sit behind the "... more" link, which appears after about ${FEED_TRUNCATION_CHARS} characters.`,
      fix: "Put the hook and the point in the first 125 characters.",
    });
  }

  if (urls.length > 0) {
    issues.push({
      id: "url",
      severity: "warn",
      message: `${urls.length} link${urls.length === 1 ? "" : "s"} in the caption. Instagram does not make caption links clickable.`,
      fix: "Move it to your bio link or a story sticker and say \"link in bio\" instead.",
    });
  }

  if (hashtagDensityPct > HASHTAG_DENSITY_WARN_PCT) {
    issues.push({
      id: "hashtagDensity",
      severity: "warn",
      message: `Hashtags are ${Math.round(hashtagDensityPct)}% of the caption text.`,
      fix: "Write more caption or move the tag block into the first comment.",
    });
  }

  if (trailingBlankLines > 0) {
    issues.push({
      id: "trailingBlankLines",
      severity: "info",
      message: `${trailingBlankLines} blank line${trailingBlankLines === 1 ? "" : "s"} at the end will be stripped when the caption is saved.`,
      fix: "Remove them so what you preview is what posts.",
    });
  }

  if (longBlankRuns > 2) {
    issues.push({
      id: "blankRuns",
      severity: "info",
      message: `A run of ${longBlankRuns} blank lines is used to push hashtags below the fold.`,
      fix: "A single blank line reads more cleanly, and the fold moves with screen size anyway.",
    });
  }

  if (firstLine.trim().length === 0) {
    issues.push({
      id: "emptyFirstLine",
      severity: "warn",
      message: "The caption opens with a blank line, so the preview in the feed starts empty.",
      fix: "Lead with the hook on line one.",
    });
  } else if (firstLine.length <= FEED_TRUNCATION_CHARS) {
    passes.push("Opens with a first line that fits before the fold.");
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warnCount = issues.filter((issue) => issue.severity === "warn").length;

  let verdict = "Ready to post";
  if (errorCount > 0) verdict = "Will not post as written";
  else if (warnCount > 0) verdict = "Postable, worth tidying";

  return {
    chars,
    charsRemaining: CAPTION_LIMIT - chars,
    captionUsedPct: (chars / CAPTION_LIMIT) * 100,
    words,
    lineCount: lines.length,
    hashtags,
    hashtagCount: hashtags.length,
    uniqueHashtags,
    hashtagsRemaining: HASHTAG_LIMIT - hashtags.length,
    duplicateTags,
    numericTags,
    hashtagDensityPct,
    mentions,
    mentionCount: mentions.length,
    urls,
    emojiCount: emoji.length,
    firstLine,
    firstLineLength: firstLine.length,
    visibleText: split.visible,
    hiddenText: split.hidden,
    truncated: split.truncated,
    hiddenChars: split.hidden.length,
    trailingBlankLines,
    longBlankRuns,
    issues,
    passes,
    errorCount,
    warnCount,
    verdict,
  };
}

/**
 * Produce a tidied caption: drop repeated hashtags, collapse long blank runs
 * and strip the trailing blank lines Instagram removes anyway.
 */
export function cleanCaption(text, options = {}) {
  const { dedupeHashtags = true, collapseBlankRuns = true, trimTrailing = true } = options;
  let output = String(text ?? "");
  if (output.trim().length === 0) return { error: "There is no caption to tidy." };

  if (dedupeHashtags) {
    const seen = new Set();
    // Dropping the whole match removes the leading space with the tag, so no
    // double space is left where a repeat used to be.
    output = output.replace(HASHTAG_PATTERN, (match, lead, tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return "";
      seen.add(key);
      return match;
    });
    output = output
      .replace(/[ \t]{2,}/g, " ")
      .replace(/[ \t]+$/gm, "")
      // A removed tag at the start of a line leaves the next tag indented.
      .replace(/^[ \t]+(?=#)/gm, "");
  }

  if (collapseBlankRuns) {
    output = output.replace(/\n{3,}/g, "\n\n");
  }

  if (trimTrailing) {
    output = output.replace(/\s+$/, "");
  }

  return { caption: output, chars: output.length };
}
