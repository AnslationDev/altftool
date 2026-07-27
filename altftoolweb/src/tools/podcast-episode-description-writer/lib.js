/**
 * Podcast episode description builder and checker.
 *
 * Everything here is deterministic string work: the same notes always produce the
 * same description, and every check is a rule that can be pointed at.
 */

/**
 * Published description limits, in characters.
 * Apple Podcasts and Spotify both cap an episode description at 4,000 characters;
 * a YouTube video description is capped at 5,000. Feed hosts sometimes apply a
 * lower limit of their own, so treat these as the ceiling, not the target.
 */
export const PLATFORM_LIMITS = [
  { id: "apple", name: "Apple Podcasts", limit: 4000 },
  { id: "spotify", name: "Spotify", limit: 4000 },
  { id: "youtube", name: "YouTube", limit: 5000 },
];

/**
 * Roughly how much of a description a listener sees before tapping "more" in a
 * podcast app list view. Apps differ; 150 characters is a conservative preview.
 */
export const PREVIEW_CHARS = 150;

/** A description shorter than this rarely carries enough to be searchable. */
export const MIN_USEFUL_CHARS = 200;

/**
 * YouTube chapter rules, applied when chapters are included:
 * the list must start at 00:00, contain at least three timestamps, and each
 * chapter must last at least 10 seconds.
 */
export const CHAPTER_MIN_COUNT = 3;
export const CHAPTER_MIN_SECONDS = 10;

const collapse = (value) => (typeof value === "string" ? value.replace(/[ \t]+/g, " ").trim() : "");

export function countWords(text) {
  const clean = typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
  if (!clean) return 0;
  return clean.split(" ").filter((token) => /[A-Za-z0-9]/.test(token)).length;
}

/** Split a textarea into trimmed, non-empty lines. */
export function toLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => collapse(line))
    .filter(Boolean);
}

/** Seconds -> M:SS or H:MM:SS, matching the way chapters are written. */
export function formatTimestamp(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.floor(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

const TIMESTAMP = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s+(.+)$/;

/**
 * Parse "0:00 Cold open" style lines into chapters and validate them against the
 * YouTube chapter rules.
 */
export function parseChapters(text) {
  const lines = toLines(text);
  if (lines.length === 0) return { chapters: [], issues: [], valid: false, empty: true };

  const chapters = [];
  const issues = [];

  lines.forEach((line, index) => {
    const match = TIMESTAMP.exec(line);
    if (!match) {
      issues.push(`Line ${index + 1} is not "0:00 Label" — "${line}".`);
      return;
    }
    const [, a, b, c, label] = match;
    const seconds = c === undefined
      ? Number(a) * 60 + Number(b)
      : Number(a) * 3600 + Number(b) * 60 + Number(c);
    chapters.push({ seconds, label: label.trim(), formatted: formatTimestamp(seconds) });
  });

  if (chapters.length > 0 && chapters[0].seconds !== 0) {
    issues.push("The first chapter must start at 0:00 for YouTube to show chapters.");
  }
  if (chapters.length > 0 && chapters.length < CHAPTER_MIN_COUNT) {
    issues.push(`At least ${CHAPTER_MIN_COUNT} chapters are needed; there are ${chapters.length}.`);
  }
  for (let index = 1; index < chapters.length; index += 1) {
    const gap = chapters[index].seconds - chapters[index - 1].seconds;
    if (gap <= 0) {
      issues.push(`"${chapters[index].label}" is not later than the chapter before it.`);
    } else if (gap < CHAPTER_MIN_SECONDS) {
      issues.push(
        `"${chapters[index - 1].label}" lasts ${gap}s — each chapter must be at least ${CHAPTER_MIN_SECONDS}s.`,
      );
    }
  }

  return {
    chapters,
    issues,
    valid: chapters.length >= CHAPTER_MIN_COUNT && issues.length === 0,
    empty: false,
  };
}

/** Fill in defaults and reject unusable input. */
export function normaliseBrief(input) {
  const raw = input && typeof input === "object" ? input : {};
  const topic = collapse(raw.topic);
  if (!topic) return { error: "Describe what the episode is about before generating a draft." };

  const episodeNumber = collapse(String(raw.episodeNumber ?? ""));
  if (episodeNumber && !/^\d{1,5}$/.test(episodeNumber)) {
    return { error: "Episode number must be a whole number." };
  }

  return {
    showName: collapse(raw.showName),
    episodeNumber,
    topic: topic.replace(/\s*[.]+$/, ""),
    guestName: collapse(raw.guestName),
    guestTitle: collapse(raw.guestTitle),
    audience: collapse(raw.audience),
    keyword: collapse(raw.keyword),
    takeaways: toLines(raw.takeaways).slice(0, 8),
    chapterText: typeof raw.chapterText === "string" ? raw.chapterText : "",
    links: toLines(raw.links).slice(0, 8),
    cta: collapse(raw.cta),
  };
}

/**
 * Assemble the description. Order matters: the searchable summary goes first
 * because podcast apps and search engines both read the opening characters.
 */
export function buildDescription(input) {
  const brief = normaliseBrief(input);
  if (brief.error) return brief;

  const chapters = parseChapters(brief.chapterText);
  const blocks = [];

  const guest = brief.guestName
    ? brief.guestTitle
      ? `${brief.guestName}, ${brief.guestTitle},`
      : `${brief.guestName}`
    : "";

  const opening = guest
    ? `${guest} joins ${brief.showName || "the show"} to unpack ${brief.topic}.`
    : `${brief.showName ? `${brief.showName} takes on` : "This episode covers"} ${brief.topic}.`;

  const audienceLine = brief.audience
    ? `Made for ${brief.audience} who want something they can act on rather than a summary of the news.`
    : "";

  blocks.push([opening, audienceLine].filter(Boolean).join(" "));

  if (brief.takeaways.length > 0) {
    blocks.push(["In this episode:", ...brief.takeaways.map((item) => `- ${item}`)].join("\n"));
  }

  if (chapters.chapters.length > 0) {
    blocks.push(
      ["Chapters:", ...chapters.chapters.map((c) => `${c.formatted} ${c.label}`)].join("\n"),
    );
  }

  if (brief.links.length > 0) {
    blocks.push(["Mentioned in this episode:", ...brief.links.map((item) => `- ${item}`)].join("\n"));
  }

  if (brief.cta) blocks.push(brief.cta);

  const text = blocks.join("\n\n");
  const title = [
    brief.episodeNumber ? `#${brief.episodeNumber}` : "",
    brief.guestName ? `${brief.guestName} on ${brief.topic}` : brief.topic,
  ]
    .filter(Boolean)
    .join(" — ");

  return { brief, chapters, text, title, blocks };
}

/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check a finished description: length against each platform, keyword placement,
 * preview text, and common structural problems.
 */
export function analyseDescription(text, options) {
  const raw = typeof text === "string" ? text : "";
  if (raw.trim() === "") return { error: "There is nothing to check yet — add some notes above." };

  const opts = options && typeof options === "object" ? options : {};
  const keyword = collapse(opts.keyword);

  const characters = raw.length;
  const words = countWords(raw);
  const preview = raw.replace(/\s+/g, " ").trim().slice(0, PREVIEW_CHARS);
  const truncated = raw.replace(/\s+/g, " ").trim().length > PREVIEW_CHARS;

  let keywordCount = 0;
  let keywordInPreview = false;
  let density = 0;
  if (keyword) {
    const pattern = new RegExp(escapeRegExp(keyword), "gi");
    keywordCount = (raw.match(pattern) || []).length;
    keywordInPreview = new RegExp(escapeRegExp(keyword), "i").test(preview);
    const keywordWords = countWords(keyword) || 1;
    density = words > 0 ? Math.round(((keywordCount * keywordWords) / words) * 1000) / 10 : 0;
  }

  const limits = PLATFORM_LIMITS.map((platform) => ({
    ...platform,
    used: characters,
    remaining: platform.limit - characters,
    over: characters > platform.limit,
    usedPercent: Math.round((characters / platform.limit) * 1000) / 10,
  }));

  const issues = [];
  if (characters < MIN_USEFUL_CHARS) {
    issues.push(
      `Only ${characters} characters — under ${MIN_USEFUL_CHARS} there is rarely enough for search or for a listener to judge the episode.`,
    );
  }
  for (const platform of limits) {
    if (platform.over) {
      issues.push(`${platform.remaining * -1} characters over the ${platform.name} limit of ${platform.limit}.`);
    }
  }
  if (keyword && keywordCount === 0) {
    issues.push(`The focus phrase "${keyword}" does not appear anywhere in the description.`);
  } else if (keyword && !keywordInPreview) {
    issues.push(`"${keyword}" appears, but not in the first ${PREVIEW_CHARS} characters that listeners see before tapping more.`);
  }
  // Repetition is the problem, not a single mention: a long focus phrase can pass
  // 3% on one occurrence alone, so require several occurrences before flagging.
  if (keyword && keywordCount >= 3 && density > 3) {
    issues.push(`The focus phrase makes up about ${density}% of the words — repeating it that often reads as spam.`);
  }
  if (/https?:\/\//i.test(preview)) {
    issues.push("A link appears in the preview text; put the summary first and links further down.");
  }

  return {
    characters,
    words,
    preview,
    truncated,
    keyword,
    keywordCount,
    keywordInPreview,
    density,
    limits,
    issues,
    healthy: issues.length === 0,
  };
}
