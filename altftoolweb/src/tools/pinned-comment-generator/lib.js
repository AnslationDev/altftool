/**
 * Pinned comment builder.
 *
 * A pinned comment does four jobs a description cannot: it carries the links
 * people ask for, corrects anything wrong in the video, gives the audience a
 * single thing to reply to, and sits above the rest of the thread. This module
 * assembles those parts in a fixed order and checks the result against each
 * platform's comment length limit.
 */

/**
 * Comment character limits per platform.
 * YouTube allows 10,000 characters in a comment, Instagram 2,200, and LinkedIn
 * 1,250. Platforms change these occasionally — check before filling the ceiling.
 */
export const PLATFORMS = [
  { id: "youtube", label: "YouTube", limit: 10000 },
  { id: "instagram", label: "Instagram", limit: 2200 },
  { id: "linkedin", label: "LinkedIn", limit: 1250 },
];

/** Above this many links a comment is more likely to be held for review or hidden. */
export const LINK_SOFT_LIMIT = 3;

/** A pinned comment past this length stops being scannable in a thread. */
export const SCANNABLE_CHARS = 900;

/** Prompt styles. Each returns one closing line that invites a specific reply. */
export const PROMPT_STYLES = [
  {
    id: "question",
    label: "Open question",
    build: (topic) => `What is your experience with ${topic}? Reply and I will answer as many as I can.`,
  },
  {
    id: "poll",
    label: "Two-way choice",
    build: (topic) => `Quick one: when it comes to ${topic}, are you team A or team B? Reply with a letter.`,
  },
  {
    id: "request",
    label: "Ask for the next topic",
    build: (topic) => `What should I cover next on ${topic}? The most-liked reply usually becomes a video.`,
  },
  {
    id: "challenge",
    label: "Small challenge",
    build: (topic) => `Try one thing from this on ${topic} this week — what happened when you did?`,
  },
  {
    id: "resource",
    label: "Crowdsource resources",
    build: (topic) => `Drop your best resource on ${topic} below — what would you add for other viewers?`,
  },
];

export function promptById(id) {
  return PROMPT_STYLES.find((style) => style.id === id) || null;
}

export function platformById(id) {
  return PLATFORMS.find((platform) => platform.id === id) || null;
}

const collapse = (value) => (typeof value === "string" ? value.replace(/[ \t]+/g, " ").trim() : "");

export function toLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => collapse(line))
    .filter(Boolean);
}

const TIMESTAMP = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s+(.+)$/;
const URL_PATTERN = /https?:\/\/[^\s]+/gi;

/** Parse "0:00 Label" lines, keeping order and reporting anything unparsable. */
export function parseTimestamps(text) {
  const lines = toLines(text);
  const rows = [];
  const issues = [];

  lines.forEach((line, index) => {
    const match = TIMESTAMP.exec(line);
    if (!match) {
      issues.push(`Line ${index + 1} is not "0:00 Label" — "${line}".`);
      return;
    }
    const [, a, b, c, label] = match;
    const seconds =
      c === undefined ? Number(a) * 60 + Number(b) : Number(a) * 3600 + Number(b) * 60 + Number(c);
    rows.push({ seconds, label: label.trim(), text: line });
  });

  for (let index = 1; index < rows.length; index += 1) {
    if (rows[index].seconds <= rows[index - 1].seconds) {
      issues.push(`"${rows[index].label}" is not later than the timestamp before it.`);
    }
  }

  return { rows, issues };
}

/** Parse "Label | https://..." or a bare URL into a label/url pair. */
export function parseLinks(text) {
  const lines = toLines(text);
  const rows = [];
  const issues = [];

  lines.forEach((line, index) => {
    // Split on the LAST "|" so a label containing its own pipe (or a stray
    // extra separator) still leaves the URL — which always comes last in
    // "Label | https://..." — intact in its own segment.
    const pipeIndex = line.lastIndexOf("|");
    const [rawLabel, rawUrl] = pipeIndex === -1 ? [null, line] : [line.slice(0, pipeIndex), line.slice(pipeIndex + 1)];
    const url = collapse(rawUrl);
    if (!/^https?:\/\/\S+$/i.test(url)) {
      issues.push(`Line ${index + 1} has no usable URL — "${line}".`);
      return;
    }
    rows.push({ label: rawLabel ? collapse(rawLabel) : url.replace(/^https?:\/\//i, ""), url });
  });

  return { rows, issues };
}

/** Fill in defaults and reject unusable input. */
export function normaliseBrief(input) {
  const raw = input && typeof input === "object" ? input : {};
  // Strip trailing periods before checking for emptiness — a topic of only
  // dots (e.g. ".", "...") must not slip past validation and then collapse
  // to an empty string further down the pipeline.
  const topic = collapse(raw.topic).replace(/[.]+$/, "");
  if (!topic) return { error: "Enter the video topic so the comment has something to talk about." };

  const platform = platformById(typeof raw.platformId === "string" ? raw.platformId : "youtube");
  if (!platform) return { error: "Choose one of the listed platforms." };

  const promptStyle = promptById(typeof raw.promptId === "string" ? raw.promptId : "question");
  if (!promptStyle) return { error: "Choose one of the listed prompt styles." };

  return {
    topic,
    platform,
    promptStyle,
    intro: collapse(raw.intro),
    linksText: typeof raw.linksText === "string" ? raw.linksText : "",
    timestampsText: typeof raw.timestampsText === "string" ? raw.timestampsText : "",
    correction: collapse(raw.correction),
    disclosure: raw.disclosure === true,
    disclosureText:
      collapse(raw.disclosureText) ||
      "Some links above are affiliate links. If you use them I may earn a commission at no extra cost to you.",
    nextUp: collapse(raw.nextUp),
  };
}

/**
 * Build the pinned comment. Order: context, correction, timestamps, links,
 * disclosure, next up, prompt — corrections first because they are the reason
 * people scroll to a pinned comment at all.
 */
export function buildPinnedComment(input) {
  const brief = normaliseBrief(input);
  if (brief.error) return brief;

  const timestamps = parseTimestamps(brief.timestampsText);
  const links = parseLinks(brief.linksText);

  const blocks = [];

  blocks.push(brief.intro || `Everything from this video on ${brief.topic}, in one place.`);

  if (brief.correction) blocks.push(`Correction: ${brief.correction}`);

  if (timestamps.rows.length > 0) {
    blocks.push(["Timestamps:", ...timestamps.rows.map((row) => row.text)].join("\n"));
  }

  if (links.rows.length > 0) {
    blocks.push(["Links:", ...links.rows.map((row) => `${row.label} — ${row.url}`)].join("\n"));
  }

  // Only claim "links above" when a Links block actually rendered — an
  // affiliate disclosure with no links to disclose is a false statement.
  if (brief.disclosure && links.rows.length > 0) blocks.push(brief.disclosureText);

  if (brief.nextUp) blocks.push(`Next up: ${brief.nextUp}`);

  blocks.push(brief.promptStyle.build(brief.topic));

  const text = blocks.join("\n\n");

  return { brief, timestamps, links, blocks, text };
}

/**
 * Check a finished pinned comment: length against the platform limit, link count,
 * scannability, and whether a disclosure is present when links look commercial.
 */
export function analysePinnedComment(text, options) {
  const raw = typeof text === "string" ? text : "";
  if (raw.trim() === "") return { error: "There is nothing to check yet." };

  const opts = options && typeof options === "object" ? options : {};
  const platform = platformById(typeof opts.platformId === "string" ? opts.platformId : "youtube");
  if (!platform) return { error: "Choose one of the listed platforms." };

  // Count Unicode code points, not UTF-16 code units — raw.length would
  // double-count every emoji (surrogate pair) against the platform limit.
  const characters = Array.from(raw).length;
  const lines = raw.split(/\r?\n/).length;
  const urls = raw.match(URL_PATTERN) || [];
  // Case-sensitive: URL paths differ by case per spec, so "/PageOne" and
  // "/pageone" are two distinct links, not duplicates — matching how
  // buildPinnedComment renders every parsed row verbatim with no dedup.
  const uniqueUrls = new Set(urls);
  const hasQuestion = /\?/.test(raw);
  const hasDisclosure = /affiliate|sponsor|paid partnership|commission|#ad\b/i.test(raw);

  const issues = [];
  if (characters > platform.limit) {
    issues.push(
      `${characters - platform.limit} characters over the ${platform.label} comment limit of ${platform.limit}.`,
    );
  }
  if (characters > SCANNABLE_CHARS) {
    issues.push(
      `${characters} characters — past about ${SCANNABLE_CHARS} a pinned comment stops being scannable; move the detail into the description.`,
    );
  }
  if (uniqueUrls.size > LINK_SOFT_LIMIT) {
    issues.push(
      `${uniqueUrls.size} links. Comments with more than about ${LINK_SOFT_LIMIT} are more likely to be held for review or hidden as spam.`,
    );
  }
  if (!hasQuestion) {
    issues.push("No question mark anywhere — a pinned comment works hardest when it asks for one specific reply.");
  }
  if (opts.affiliate === true && !hasDisclosure) {
    issues.push(
      "Affiliate or sponsored links are marked but no disclosure appears. A material connection has to be disclosed clearly and close to the link.",
    );
  }

  return {
    characters,
    lines,
    linkCount: uniqueUrls.size,
    remaining: platform.limit - characters,
    limit: platform.limit,
    platformLabel: platform.label,
    overLimit: characters > platform.limit,
    usedPercent: Math.round((characters / platform.limit) * 1000) / 10,
    hasQuestion,
    hasDisclosure,
    issues,
    clean: issues.length === 0,
  };
}
