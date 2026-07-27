/**
 * Podcast show notes formatter.
 *
 * Rules encoded here are platform rules, not house style:
 *
 *  - YouTube only turns a description into clickable chapters when the first
 *    timestamp is 00:00, there are at least three timestamps in ascending
 *    order, and every chapter runs for at least 10 seconds.
 *  - Apple Podcasts caps an episode description at 4,000 characters, and shows
 *    plain text or a small subset of HTML only.
 *  - Spotify caps an episode description at 4,000 characters.
 *  - A YouTube video description is capped at 5,000 characters.
 *  - The Podcasting 2.0 chapters specification stores each chapter as an object
 *    with a startTime in whole seconds and a title.
 */

/** Minimum chapter length YouTube requires, in seconds. */
export const YOUTUBE_MIN_CHAPTER_SECONDS = 10;
/** Minimum number of timestamps YouTube requires before it builds chapters. */
export const YOUTUBE_MIN_CHAPTERS = 3;
/** Apple Podcasts episode description limit, in characters. */
export const APPLE_DESCRIPTION_LIMIT = 4000;
/** Spotify episode description limit, in characters. */
export const SPOTIFY_DESCRIPTION_LIMIT = 4000;
/** YouTube video description limit, in characters. */
export const YOUTUBE_DESCRIPTION_LIMIT = 5000;
/** Seconds in an hour, used to decide whether to print an hours field. */
export const SECONDS_PER_HOUR = 3600;

/** Matches a leading timestamp, with or without bullet, brackets or a dash. */
const TIMESTAMP_LINE = /^\s*(?:[-*•]\s*)?\(?(\d{1,3}:\d{2}(?::\d{2})?)\)?\s*(?:[-–—:|]\s*)?(.*)$/;
const URL_PATTERN = /https?:\/\/[^\s<>()[\]"']+/g;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

/**
 * Parse a timestamp of the form m:ss, mm:ss, h:mm:ss or hh:mm:ss.
 * @returns {{ seconds:number }|{ error:string }}
 */
export function parseTimestamp(text) {
  const raw = String(text ?? "").trim();
  const parts = raw.split(":");
  if (parts.length < 2 || parts.length > 3) {
    return { error: `"${raw}" is not a timestamp — use m:ss or h:mm:ss.` };
  }
  const numbers = parts.map((part) => {
    if (!/^\d+$/.test(part)) return NaN;
    return Number(part);
  });
  if (numbers.some((value) => !Number.isFinite(value))) {
    return { error: `"${raw}" contains something that is not a number.` };
  }
  if (parts.length === 2) {
    const [minutes, seconds] = numbers;
    if (seconds > 59) return { error: `"${raw}" has more than 59 seconds.` };
    return { seconds: minutes * 60 + seconds };
  }
  const [hours, minutes, seconds] = numbers;
  if (minutes > 59) return { error: `"${raw}" has more than 59 minutes.` };
  if (seconds > 59) return { error: `"${raw}" has more than 59 seconds.` };
  return { seconds: hours * SECONDS_PER_HOUR + minutes * 60 + seconds };
}

/**
 * Format seconds as a timestamp. Hours are included when the value needs them,
 * or when `forceHours` is set so a whole list stays aligned.
 */
export function formatTimestamp(totalSeconds, { forceHours = false } = {}) {
  const value = Math.max(0, Math.trunc(Number(totalSeconds) || 0));
  const hours = Math.floor(value / SECONDS_PER_HOUR);
  const minutes = Math.floor((value % SECONDS_PER_HOUR) / 60);
  const seconds = value % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (hours > 0 || forceHours) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

/** Pull the hostname out of a URL without throwing on malformed input. */
export function domainOf(url) {
  const match = /^https?:\/\/([^/?#:]+)/i.exec(String(url ?? ""));
  if (!match) return "";
  return match[1].replace(/^www\./i, "");
}

/**
 * Split rough notes into timestamped chapters, links and free paragraphs.
 * @returns {{ chapters:object[], links:object[], paragraphs:string[], errors:string[] }}
 */
export function parseNotes(raw) {
  const lines = String(raw ?? "").split(/\r?\n/);
  const chapters = [];
  const paragraphs = [];
  const errors = [];
  const linkMap = new Map();

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const urls = trimmed.match(URL_PATTERN) || [];
    urls.forEach((rawUrl) => {
      const url = rawUrl.replace(TRAILING_PUNCTUATION, "");
      if (!linkMap.has(url)) {
        const label = trimmed
          .replace(URL_PATTERN, "")
          .replace(/^\s*(?:[-*•]\s*)?/, "")
          .replace(/[-–—:|]\s*$/, "")
          .trim()
          // A dangling preposition is left behind by "... mentioned at <url>".
          .replace(/\s+\b(?:at|to|on|in|via|from|here)\b\s*$/i, "")
          .replace(/[-–—:|,]\s*$/, "")
          .trim();
        linkMap.set(url, { url, domain: domainOf(url), label: label || domainOf(url) });
      }
    });

    const match = TIMESTAMP_LINE.exec(trimmed);
    if (match && /^\d/.test(match[1])) {
      const parsed = parseTimestamp(match[1]);
      if (parsed.error) {
        errors.push(`Line ${index + 1}: ${parsed.error}`);
        return;
      }
      const label = match[2].replace(URL_PATTERN, "").trim().replace(TRAILING_PUNCTUATION, "");
      chapters.push({
        seconds: parsed.seconds,
        label: label || `Chapter ${chapters.length + 1}`,
        line: index + 1,
      });
      return;
    }

    // A line that carries a URL is already represented in the links list.
    if (urls.length) return;
    paragraphs.push(trimmed.replace(/^\s*(?:[-*•]\s*)/, ""));
  });

  chapters.sort((a, b) => a.seconds - b.seconds);

  return { chapters, links: Array.from(linkMap.values()), paragraphs, errors };
}

/**
 * Check a chapter list against YouTube's published chapter requirements.
 * @returns {{ ok:boolean, issues:string[] }}
 */
export function validateYouTubeChapters(chapters) {
  const issues = [];
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return { ok: false, issues: ["No timestamps found, so YouTube will not build chapters."] };
  }
  if (chapters.length < YOUTUBE_MIN_CHAPTERS) {
    issues.push(`YouTube needs at least ${YOUTUBE_MIN_CHAPTERS} timestamps; there are ${chapters.length}.`);
  }
  if (chapters[0].seconds !== 0) {
    issues.push(`The first timestamp must be 0:00 — yours starts at ${formatTimestamp(chapters[0].seconds)}.`);
  }
  for (let i = 1; i < chapters.length; i += 1) {
    const gap = chapters[i].seconds - chapters[i - 1].seconds;
    if (gap <= 0) {
      issues.push(`"${chapters[i].label}" is not after the chapter before it.`);
    } else if (gap < YOUTUBE_MIN_CHAPTER_SECONDS) {
      issues.push(
        `"${chapters[i - 1].label}" lasts ${gap}s — YouTube requires at least ${YOUTUBE_MIN_CHAPTER_SECONDS}s per chapter.`,
      );
    }
  }
  return { ok: issues.length === 0, issues };
}

/**
 * Build every show-notes output from rough input.
 *
 * @param {object} input
 * @param {string} input.title
 * @param {string|number} [input.episodeNumber]
 * @param {string} [input.showName]
 * @param {string} [input.summary]
 * @param {string} input.notes - the rough notes block
 * @param {string[]} [input.guests]
 * @returns {object} outputs or { error }
 */
export function buildShowNotes({
  title = "",
  episodeNumber = "",
  showName = "",
  summary = "",
  notes = "",
  guests = "",
} = {}) {
  const episodeTitle = String(title).trim();
  if (!episodeTitle) return { error: "Enter an episode title." };
  if (!String(notes).trim()) return { error: "Paste some rough notes to format." };

  const parsed = parseNotes(notes);
  if (parsed.chapters.length === 0 && parsed.paragraphs.length === 0 && parsed.links.length === 0) {
    return { error: "Nothing usable found in the notes — add timestamps, bullets or links." };
  }

  const guestList = String(guests)
    .split(/[,\n]/)
    .map((name) => name.trim())
    .filter(Boolean);

  const needsHours = parsed.chapters.some((chapter) => chapter.seconds >= SECONDS_PER_HOUR);
  const youtube = validateYouTubeChapters(parsed.chapters);
  const numberLabel = String(episodeNumber).trim();
  const heading = numberLabel ? `Episode ${numberLabel}: ${episodeTitle}` : episodeTitle;
  const summaryText = String(summary).trim();

  const chapterLines = parsed.chapters.map(
    (chapter) => `${formatTimestamp(chapter.seconds, { forceHours: needsHours })} ${chapter.label}`,
  );

  // null means "leave this line out"; "" is a deliberate blank line.
  const compose = (lines) => lines.filter((line) => line !== null).join("\n").replace(/\n{3,}/g, "\n\n");

  const guestLabel = `Guest${guestList.length > 1 ? "s" : ""}`;

  const markdown = compose([
    `## ${heading}`,
    showName ? `*${String(showName).trim()}*` : null,
    "",
    summaryText || null,
    guestList.length ? "" : null,
    guestList.length ? `**${guestLabel}:** ${guestList.join(", ")}` : null,
    parsed.chapters.length ? "" : null,
    parsed.chapters.length ? "### Chapters" : null,
    parsed.chapters.length ? "" : null,
    ...parsed.chapters.map(
      (chapter) =>
        `- \`${formatTimestamp(chapter.seconds, { forceHours: needsHours })}\` ${chapter.label}`,
    ),
    parsed.paragraphs.length ? "" : null,
    parsed.paragraphs.length ? "### In this episode" : null,
    parsed.paragraphs.length ? "" : null,
    ...parsed.paragraphs.map((paragraph) => `- ${paragraph}`),
    parsed.links.length ? "" : null,
    parsed.links.length ? "### Links mentioned" : null,
    parsed.links.length ? "" : null,
    ...parsed.links.map((link) => `- [${link.label}](${link.url})`),
    "",
  ]);

  const plain = compose([
    heading,
    showName ? String(showName).trim() : null,
    "",
    summaryText || null,
    guestList.length ? "" : null,
    guestList.length ? `${guestLabel}: ${guestList.join(", ")}` : null,
    parsed.chapters.length ? "" : null,
    parsed.chapters.length ? "Chapters" : null,
    ...chapterLines,
    parsed.paragraphs.length ? "" : null,
    parsed.paragraphs.length ? "In this episode" : null,
    ...parsed.paragraphs.map((paragraph) => `- ${paragraph}`),
    parsed.links.length ? "" : null,
    parsed.links.length ? "Links mentioned" : null,
    ...parsed.links.map((link) => `${link.label}: ${link.url}`),
    "",
  ]);

  const youtubeDescription = compose([
    summaryText || null,
    summaryText ? "" : null,
    ...chapterLines,
    parsed.links.length ? "" : null,
    parsed.links.length ? "Links mentioned" : null,
    ...parsed.links.map((link) => `${link.label}: ${link.url}`),
    "",
  ]);

  const chaptersJson = JSON.stringify(
    {
      version: "1.2.0",
      chapters: parsed.chapters.map((chapter) => ({
        startTime: chapter.seconds,
        title: chapter.label,
      })),
    },
    null,
    2,
  );

  const limits = [
    { platform: "Apple Podcasts", used: plain.length, limit: APPLE_DESCRIPTION_LIMIT },
    { platform: "Spotify", used: plain.length, limit: SPOTIFY_DESCRIPTION_LIMIT },
    { platform: "YouTube", used: youtubeDescription.length, limit: YOUTUBE_DESCRIPTION_LIMIT },
  ].map((row) => ({ ...row, over: row.used > row.limit, remaining: row.limit - row.used }));

  const lastChapter = parsed.chapters[parsed.chapters.length - 1];

  return {
    heading,
    markdown,
    plain,
    youtubeDescription,
    chaptersJson,
    chapters: parsed.chapters.map((chapter) => ({
      ...chapter,
      display: formatTimestamp(chapter.seconds, { forceHours: needsHours }),
    })),
    links: parsed.links,
    paragraphs: parsed.paragraphs,
    parseErrors: parsed.errors,
    youtube,
    limits,
    stats: {
      chapterCount: parsed.chapters.length,
      linkCount: parsed.links.length,
      bulletCount: parsed.paragraphs.length,
      lastTimestamp: lastChapter ? formatTimestamp(lastChapter.seconds, { forceHours: needsHours }) : "—",
      markdownChars: markdown.length,
    },
  };
}
