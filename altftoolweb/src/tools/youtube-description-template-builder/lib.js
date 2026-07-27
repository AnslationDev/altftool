/**
 * YouTube description assembly plus validation of the platform's own rules
 * for chapters and hashtags.
 */

/** A YouTube video description accepts at most 5,000 characters. */
export const DESCRIPTION_MAX_CHARS = 5000;

/**
 * Characters of the description shown on the watch page before the
 * "...more" fold. YouTube shows roughly the first three short lines.
 */
export const ABOVE_FOLD_CHARS = 100;

/** Roughly the description length used in a search result snippet. */
export const SEARCH_SNIPPET_CHARS = 157;

/** YouTube only builds a chapter bar when there are at least three timestamps. */
export const MIN_CHAPTERS = 3;

/** The first chapter must begin at 00:00. */
export const FIRST_CHAPTER_SECONDS = 0;

/** Every chapter must run for at least 10 seconds. */
export const MIN_CHAPTER_SECONDS = 10;

/** YouTube ignores every hashtag on a video that carries more than 15. */
export const MAX_HASHTAGS = 15;

/** Only the first three hashtags are shown above the video title. */
export const HASHTAGS_ABOVE_TITLE = 3;

export const DISCLOSURES = [
  {
    id: "paid",
    label: "Paid promotion / sponsorship",
    text: "This video contains paid promotion. It was made in partnership with a brand and I was compensated for it.",
    note: "You must also tick the paid promotion box in YouTube Studio, not only mention it here.",
  },
  {
    id: "affiliate",
    label: "Affiliate links",
    text: "Some links above are affiliate links. If you buy through them I may earn a commission at no extra cost to you.",
    note: "Most affiliate programmes and consumer protection rules require this to be visible, not buried.",
  },
  {
    id: "gifted",
    label: "Gifted product",
    text: "One or more products in this video were sent to me free of charge. No payment was received and all opinions are my own.",
    note: "A free product counts as a material connection even when no money changed hands.",
  },
  {
    id: "altered",
    label: "Altered or synthetic media",
    text: "Parts of this video were generated or meaningfully edited with AI tools.",
    note: "YouTube also asks creators to declare realistic altered or synthetic content during upload.",
  },
];

/** Parse "m:ss", "mm:ss" or "h:mm:ss" into seconds. Returns null when unparsable. */
export function parseTimestamp(raw) {
  const text = String(raw ?? "").trim();
  if (!/^\d{1,2}(:\d{1,2}){1,2}$/.test(text)) return null;
  const parts = text.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;

  let hours = 0;
  let minutes;
  let seconds;
  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else {
    [minutes, seconds] = parts;
  }
  if (seconds > 59) return null;
  if (parts.length === 3 && minutes > 59) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

/** Format seconds back into YouTube's own timestamp style. */
export function formatTimestamp(totalSeconds) {
  const value = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Read "0:00 Intro" lines into chapters and check them against YouTube's rules.
 * Returns { chapters, issues, valid }.
 */
export function parseChapters(raw) {
  const lines = String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const chapters = [];
  const issues = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(\d{1,2}(?::\d{1,2}){1,2})\s+(.*)$/);
    if (!match) {
      issues.push(`Line ${index + 1} is not "timestamp title" — for example "1:24 The setup".`);
      return;
    }
    const seconds = parseTimestamp(match[1]);
    const title = match[2].trim();
    if (seconds === null) {
      issues.push(`Line ${index + 1}: "${match[1]}" is not a valid timestamp.`);
      return;
    }
    if (!title) {
      issues.push(`Line ${index + 1}: the chapter has a timestamp but no title.`);
      return;
    }
    chapters.push({ seconds, title, stamp: formatTimestamp(seconds) });
  });

  if (chapters.length === 0) {
    return { chapters: [], issues, valid: false };
  }

  if (chapters.length < MIN_CHAPTERS) {
    issues.push(
      `YouTube needs at least ${MIN_CHAPTERS} chapters before it builds a chapter bar. You have ${chapters.length}.`,
    );
  }
  if (chapters[0].seconds !== FIRST_CHAPTER_SECONDS) {
    issues.push(`The first chapter must start at 0:00. Yours starts at ${chapters[0].stamp}.`);
  }

  for (let i = 1; i < chapters.length; i += 1) {
    const gap = chapters[i].seconds - chapters[i - 1].seconds;
    if (gap <= 0) {
      issues.push(
        `Chapters must go forwards in time: ${chapters[i].stamp} is not after ${chapters[i - 1].stamp}.`,
      );
    } else if (gap < MIN_CHAPTER_SECONDS) {
      issues.push(
        `"${chapters[i - 1].title}" runs only ${gap}s. Every chapter needs at least ${MIN_CHAPTER_SECONDS}s.`,
      );
    }
  }

  const withDuration = chapters.map((chapter, index) => ({
    ...chapter,
    duration: index < chapters.length - 1 ? chapters[index + 1].seconds - chapter.seconds : null,
  }));

  return { chapters: withDuration, issues, valid: issues.length === 0 };
}

/** Read "Label | https://..." lines into links, flagging anything that is not a URL. */
export function parseLinks(raw) {
  const lines = String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const links = [];
  const issues = [];

  lines.forEach((line, index) => {
    const [first, ...rest] = line.split("|");
    const hasLabel = rest.length > 0;
    const label = hasLabel ? first.trim() : "";
    const url = (hasLabel ? rest.join("|") : first).trim();

    if (!/^https?:\/\/\S+$/i.test(url)) {
      issues.push(`Link ${index + 1} is not a full URL — start it with https://`);
      return;
    }
    links.push({ label: label || url.replace(/^https?:\/\//i, ""), url });
  });

  return { links, issues };
}

/** Normalise hashtags typed with or without the # and check YouTube's limits. */
export function parseHashtags(raw) {
  const tokens = String(raw ?? "")
    .split(/[\s,]+/)
    .map((token) => token.trim().replace(/^#+/, ""))
    .filter(Boolean);

  const seen = new Set();
  const tags = [];
  const issues = [];

  tokens.forEach((token) => {
    const clean = token.replace(/[^\p{L}\p{N}_]/gu, "");
    if (!clean) {
      issues.push(`"${token}" has no usable characters for a hashtag.`);
      return;
    }
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    tags.push(`#${clean}`);
  });

  if (tags.length > MAX_HASHTAGS) {
    issues.push(
      `${tags.length} hashtags. Over ${MAX_HASHTAGS} and YouTube ignores all of them — trim the list.`,
    );
  }

  return { tags, issues, aboveTitle: tags.slice(0, HASHTAGS_ABOVE_TITLE) };
}

/**
 * Assemble the full description.
 * @param {object} input
 * @param {string} input.summary       opening paragraph (the part that shows in search)
 * @param {string} input.cta           one line asking for the action
 * @param {string} input.chaptersRaw   "0:00 Intro" lines
 * @param {string} input.linksRaw      "Label | https://..." lines
 * @param {string} input.hashtagsRaw   space or comma separated hashtags
 * @param {string[]} input.disclosureIds ids from DISCLOSURES
 * @param {string} input.credits       free text block for credits/gear
 */
export function buildDescription(input = {}) {
  const {
    summary = "",
    cta = "",
    chaptersRaw = "",
    linksRaw = "",
    hashtagsRaw = "",
    disclosureIds = [],
    credits = "",
  } = input;

  const summaryText = String(summary).trim();
  if (!summaryText) {
    return { error: "Write the opening summary first — it is the part YouTube shows in search." };
  }

  const chapterReport = parseChapters(chaptersRaw);
  const linkReport = parseLinks(linksRaw);
  const hashtagReport = parseHashtags(hashtagsRaw);

  const selected = DISCLOSURES.filter((item) => disclosureIds.includes(item.id));

  const blocks = [summaryText];

  const ctaText = String(cta).trim();
  if (ctaText) blocks.push(ctaText);

  if (chapterReport.chapters.length > 0) {
    blocks.push(
      ["CHAPTERS", ...chapterReport.chapters.map((c) => `${c.stamp} ${c.title}`)].join("\n"),
    );
  }

  if (linkReport.links.length > 0) {
    blocks.push(["LINKS", ...linkReport.links.map((l) => `${l.label}: ${l.url}`)].join("\n"));
  }

  const creditsText = String(credits).trim();
  if (creditsText) blocks.push(creditsText);

  if (selected.length > 0) {
    blocks.push(["DISCLOSURE", ...selected.map((item) => item.text)].join("\n"));
  }

  if (hashtagReport.tags.length > 0) {
    blocks.push(hashtagReport.tags.join(" "));
  }

  const text = blocks.join("\n\n");
  const length = text.length;

  if (length > DESCRIPTION_MAX_CHARS) {
    return {
      error: `The description is ${length} characters. YouTube accepts a maximum of ${DESCRIPTION_MAX_CHARS} — remove ${length - DESCRIPTION_MAX_CHARS}.`,
    };
  }

  const issues = [...chapterReport.issues, ...linkReport.issues, ...hashtagReport.issues];

  return {
    text,
    length,
    remaining: DESCRIPTION_MAX_CHARS - length,
    usedShare: length / DESCRIPTION_MAX_CHARS,
    aboveFold: text.slice(0, ABOVE_FOLD_CHARS),
    searchSnippet: summaryText.slice(0, SEARCH_SNIPPET_CHARS),
    summaryLength: summaryText.length,
    summaryFitsSnippet: summaryText.length <= SEARCH_SNIPPET_CHARS,
    chapters: chapterReport.chapters,
    chaptersValid: chapterReport.chapters.length > 0 && chapterReport.valid,
    links: linkReport.links,
    hashtags: hashtagReport.tags,
    hashtagsAboveTitle: hashtagReport.aboveTitle,
    disclosures: selected,
    issues,
  };
}
