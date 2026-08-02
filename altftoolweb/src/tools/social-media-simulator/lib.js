/**
 * Social Media Simulator — post preview and per-platform length engine.
 *
 * The point of this file is that each network counts a post differently, so a
 * caption that fits one will silently lose its ending on another:
 *
 *  - X uses the twitter-text weighted-length algorithm (config v3): every code
 *    point costs 200 units, except four ranges that cost 100, the whole thing
 *    is divided by a scale of 100, and any URL is replaced by a fixed cost of
 *    23 regardless of its real length. Emoji are parsed as single units at the
 *    full 200, so one emoji costs two of the 280.
 *  - Bluesky counts grapheme clusters, capped at 300, and separately caps the
 *    record at 3000 UTF-8 bytes. Links count as the text you typed.
 *  - Mastodon counts characters up to 500, charges 23 for any link, and for a
 *    remote mention only counts the @user part, not the @user@server part.
 *  - Instagram, LinkedIn and Facebook count plain characters against much
 *    larger caps, but crop the visible post in the feed long before the cap and
 *    hide the rest behind a "more" link.
 *
 * Everything here is a pure function of the text you pass in. No network, no
 * clock, no randomness: the same caption always produces the same numbers.
 */

/* -------------------------------------------------------------------------- */
/* Unicode helpers                                                            */
/* -------------------------------------------------------------------------- */

const SEGMENTER =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

/** Split into user-perceived characters (grapheme clusters). */
export function toGraphemes(text) {
  const value = String(text == null ? "" : text);
  if (!value) return [];
  if (SEGMENTER) {
    const out = [];
    for (const part of SEGMENTER.segment(value)) out.push(part.segment);
    return out;
  }
  return Array.from(value);
}

export function countGraphemes(text) {
  return toGraphemes(text).length;
}

/** Code points, which is what Mastodon, Instagram, LinkedIn and Facebook count. */
export function countCodePoints(text) {
  return Array.from(String(text == null ? "" : text)).length;
}

/** UTF-8 byte length, computed from code points so no encoder API is needed. */
export function countUtf8Bytes(text) {
  let bytes = 0;
  for (const char of String(text == null ? "" : text)) {
    const cp = char.codePointAt(0);
    if (cp < 0x80) bytes += 1;
    else if (cp < 0x800) bytes += 2;
    else if (cp < 0x10000) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

const EMOJI_RE = /\p{Extended_Pictographic}/u;
// Flag emoji: a pair of Regional_Indicator code points (e.g. US flag). The
// grapheme segmenter already groups these into one cluster per UAX #29
// GB12/GB13, but Extended_Pictographic does not cover Regional_Indicator, so
// they need their own check.
const REGIONAL_INDICATOR_RE = /^\p{Regional_Indicator}+$/u;
// Keycap sequences: a digit/#/* optionally followed by U+FE0F (variation
// selector-16) then U+20E3 (combining enclosing keycap), e.g. 1️⃣.
const KEYCAP_RE = /^[0-9#*]\uFE0F?\u20E3$/;

export function isEmojiCluster(grapheme) {
  return EMOJI_RE.test(grapheme) || REGIONAL_INDICATOR_RE.test(grapheme) || KEYCAP_RE.test(grapheme);
}

/* -------------------------------------------------------------------------- */
/* Entity extraction                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A deliberately conservative link matcher: explicit schemes, www. hosts, and
 * bare host.tld forms limited to a fixed TLD list so ordinary sentences ending
 * in a full stop are not mistaken for links.
 */
const LINK_TLDS =
  "com|org|net|io|dev|co|app|ai|me|xyz|info|news|blog|shop|store|edu|gov|uk|us|in|de|fr|jp|au|ca|nl|es|it|br|se|no|ch";

const URL_RE = new RegExp(
  String.raw`(?:https?:\/\/[^\s<>"']+)` +
    String.raw`|(?:www\.[^\s<>"']+)` +
    String.raw`|(?:\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.(?:${LINK_TLDS})\b(?:\/[^\s<>"']*)?)`,
  "gi",
);

const HASHTAG_RE = /(^|[\s(\[{])#([\p{L}\p{N}_]+)/gu;
const MENTION_RE = /(^|[\s(\[{])@([A-Za-z0-9_.-]+(?:@[A-Za-z0-9.-]+\.[A-Za-z]{2,})?)/gu;

function collect(re, text, pick) {
  const out = [];
  const source = String(text == null ? "" : text);
  re.lastIndex = 0;
  let match = re.exec(source);
  while (match) {
    out.push(pick(match));
    if (match.index === re.lastIndex) re.lastIndex += 1;
    match = re.exec(source);
  }
  return out;
}

export function extractEntities(text) {
  const source = String(text == null ? "" : text);
  const urls = collect(URL_RE, source, (m) => ({ value: m[0], index: m.index }));
  const hashtags = collect(HASHTAG_RE, source, (m) => ({
    value: `#${m[2]}`,
    index: m.index + m[1].length,
  }));
  const mentions = collect(MENTION_RE, source, (m) => ({
    value: `@${m[2]}`,
    index: m.index + m[1].length,
  }));
  // A mention inside a URL path is not a mention.
  const inUrl = (index) => urls.some((url) => index > url.index && index < url.index + url.value.length);
  const emoji = toGraphemes(source).filter(isEmojiCluster);
  const lines = source.split("\n");
  return {
    urls,
    hashtags: hashtags.filter((item) => !inUrl(item.index)),
    mentions: mentions.filter((item) => !inUrl(item.index)),
    emoji,
    lines,
    lineCount: lines.length,
    blankLineCount: lines.filter((line) => line.trim() === "").length,
    firstLine: lines[0] || "",
  };
}

/**
 * Split a post into typed runs so a renderer can style links, hashtags and
 * mentions the way each app does, without doing any parsing of its own.
 * @returns {{type:'text'|'url'|'hashtag'|'mention', value:string}[]}
 */
export function tokenizePost(text) {
  const source = String(text == null ? "" : text);
  if (!source) return [];
  const entities = extractEntities(source);
  const marks = [
    ...entities.urls.map((item) => ({ ...item, type: "url" })),
    ...entities.hashtags.map((item) => ({ ...item, type: "hashtag" })),
    ...entities.mentions.map((item) => ({ ...item, type: "mention" })),
  ].sort((a, b) => a.index - b.index);

  const tokens = [];
  let cursor = 0;
  for (const mark of marks) {
    if (mark.index < cursor) continue;
    if (mark.index > cursor) {
      tokens.push({ type: "text", value: source.slice(cursor, mark.index) });
    }
    tokens.push({ type: mark.type, value: mark.value });
    cursor = mark.index + mark.value.length;
  }
  if (cursor < source.length) tokens.push({ type: "text", value: source.slice(cursor) });
  return tokens;
}

/* -------------------------------------------------------------------------- */
/* X / twitter-text weighted length (config v3)                               */
/* -------------------------------------------------------------------------- */

export const TWITTER_CONFIG = {
  version: 3,
  maxWeightedTweetLength: 280,
  scale: 100,
  defaultWeight: 200,
  transformedURLLength: 23,
  ranges: [
    { start: 0, end: 4351, weight: 100 },
    { start: 8192, end: 8205, weight: 100 },
    { start: 8208, end: 8223, weight: 100 },
    { start: 8242, end: 8247, weight: 100 },
  ],
};

function codePointWeight(cp) {
  for (const range of TWITTER_CONFIG.ranges) {
    if (cp >= range.start && cp <= range.end) return range.weight;
  }
  return TWITTER_CONFIG.defaultWeight;
}

function weightChunk(chunk) {
  let total = 0;
  let doubleWeighted = 0;
  for (const grapheme of toGraphemes(chunk)) {
    if (isEmojiCluster(grapheme)) {
      // twitter-text parses an emoji cluster, including ZWJ sequences, as one
      // unit at the default weight.
      total += TWITTER_CONFIG.defaultWeight;
      doubleWeighted += 1;
      continue;
    }
    for (const char of grapheme) {
      const weight = codePointWeight(char.codePointAt(0));
      total += weight;
      if (weight === TWITTER_CONFIG.defaultWeight) doubleWeighted += 1;
    }
  }
  return { total, doubleWeighted };
}

/**
 * @returns {{ weighted:number, doubleWeighted:number, urlCount:number }}
 *   `weighted` is the number X shows against the 280 cap.
 */
export function weightedLength(text) {
  const source = String(text == null ? "" : text);
  const urls = extractEntities(source).urls;
  let cursor = 0;
  let total = 0;
  let doubleWeighted = 0;
  for (const url of urls) {
    const before = source.slice(cursor, url.index);
    const chunk = weightChunk(before);
    total += chunk.total;
    doubleWeighted += chunk.doubleWeighted;
    total += TWITTER_CONFIG.transformedURLLength * TWITTER_CONFIG.scale;
    cursor = url.index + url.value.length;
  }
  const tail = weightChunk(source.slice(cursor));
  total += tail.total;
  doubleWeighted += tail.doubleWeighted;
  return {
    weighted: Math.round(total / TWITTER_CONFIG.scale),
    doubleWeighted,
    urlCount: urls.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Platform table                                                             */
/* -------------------------------------------------------------------------- */

/**
 * `previewChars` is where the feed crops the body and hides the rest behind a
 * "more" control. It is a rendering behaviour of each app's feed, not a value
 * any API returns, so it is reported as an observed crop point rather than a
 * hard limit.
 */
export const PLATFORMS = [
  {
    id: "x",
    name: "X",
    counting: "weighted",
    unit: "weighted units",
    limit: 280,
    urlCost: 23,
    previewChars: null,
    hashtagHardMax: null,
    handleStyle: "@handle",
    engagement: ["Reply", "Repost", "Like", "Views"],
    docs: [
      "Counted with the twitter-text weighted algorithm: most Latin characters cost 1, CJK and emoji cost 2.",
      "Any link is charged a flat 23 units however long or short it is, because it is rewritten to a t.co address.",
      "The whole post is shown in the feed up to the 280-unit cap; longer posts are a paid feature and are not modelled here.",
    ],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    counting: "grapheme",
    unit: "graphemes",
    limit: 300,
    byteLimit: 3000,
    urlCost: null,
    previewChars: null,
    hashtagHardMax: null,
    handleStyle: "@handle.domain",
    engagement: ["Reply", "Repost", "Like"],
    docs: [
      "Counts grapheme clusters, so a flag or a skin-toned emoji counts as one, not as its component code points.",
      "There is a second, separate cap of 3000 UTF-8 bytes on the record text.",
      "Links are stored as facets over the text you typed, so the full URL counts against the 300.",
    ],
  },
  {
    id: "mastodon",
    name: "Mastodon",
    counting: "mastodon",
    unit: "characters",
    limit: 500,
    urlCost: 23,
    previewChars: null,
    hashtagHardMax: null,
    handleStyle: "@user@server",
    engagement: ["Reply", "Boost", "Favourite"],
    docs: [
      "500 characters is the default server setting; an individual instance can be configured higher or lower.",
      "Every link counts as 23 characters no matter its length.",
      "For a remote mention only the @user part is counted, not the @server that follows it.",
    ],
  },
  {
    id: "threads",
    name: "Threads",
    counting: "grapheme",
    unit: "characters",
    limit: 500,
    urlCost: null,
    previewChars: null,
    hashtagHardMax: null,
    handleStyle: "@handle",
    engagement: ["Like", "Reply", "Repost", "Share"],
    docs: [
      "500 characters per post, with links counting in full.",
      "Longer thoughts are posted as a chain of replies rather than one long post.",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    counting: "codepoint",
    unit: "characters",
    limit: 2200,
    urlCost: null,
    previewChars: 125,
    hashtagHardMax: 30,
    handleStyle: "handle",
    engagement: ["Like", "Comment", "Share", "Save"],
    docs: [
      "Captions are capped at 2200 characters and at 30 hashtags — a caption over 30 hashtags is rejected outright.",
      "The feed crops the caption at roughly 125 characters and hides the rest behind 'more'.",
      "Links in a caption are not clickable, so a URL in the body is read, not followed.",
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    counting: "codepoint",
    unit: "characters",
    limit: 3000,
    urlCost: null,
    previewChars: 210,
    previewCharsMobile: 140,
    hashtagHardMax: null,
    handleStyle: "Name · headline",
    engagement: ["Like", "Comment", "Repost", "Send"],
    docs: [
      "3000 characters per post.",
      "The feed crops at roughly 210 characters on desktop and about 140 on mobile before '…see more'.",
      "Anything after the crop, including a link, is invisible until someone expands the post.",
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    counting: "codepoint",
    unit: "characters",
    limit: 63206,
    urlCost: null,
    previewChars: 477,
    hashtagHardMax: null,
    handleStyle: "Name",
    engagement: ["Like", "Comment", "Share"],
    docs: [
      "The post cap is 63,206 characters, which almost nothing reaches.",
      "The feed crops at roughly 477 characters and hides the rest behind 'See more'.",
      "A link at the end of a long post sits below the crop and is not seen by most scrollers.",
    ],
  },
];

const PLATFORM_BY_ID = new Map(PLATFORMS.map((item) => [item.id, item]));

/* -------------------------------------------------------------------------- */
/* Counting per platform                                                      */
/* -------------------------------------------------------------------------- */

const REMOTE_MENTION_RE = /(^|[\s(\[{])@([A-Za-z0-9_.-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

function countForPlatform(platform, text) {
  if (platform.counting === "weighted") {
    const weight = weightedLength(text);
    return { counted: weight.weighted, doubleWeighted: weight.doubleWeighted };
  }
  if (platform.counting === "grapheme") {
    return { counted: countGraphemes(text), doubleWeighted: 0 };
  }
  if (platform.counting === "mastodon") {
    // Links are charged 23; remote mentions lose their @server portion.
    let working = String(text == null ? "" : text).replace(REMOTE_MENTION_RE, "$1@$2");
    const urls = extractEntities(working).urls;
    let bare = working;
    for (let i = urls.length - 1; i >= 0; i -= 1) {
      const url = urls[i];
      bare = bare.slice(0, url.index) + bare.slice(url.index + url.value.length);
    }
    return {
      counted: countCodePoints(bare) + urls.length * platform.urlCost,
      doubleWeighted: 0,
    };
  }
  return { counted: countCodePoints(text), doubleWeighted: 0 };
}

/** Cut a string at `n` grapheme clusters. */
export function cutAtGraphemes(text, n) {
  const graphemes = toGraphemes(text);
  if (!Number.isFinite(n) || n < 0 || graphemes.length <= n) {
    return { visible: String(text == null ? "" : text), hidden: "", truncated: false };
  }
  return {
    visible: graphemes.slice(0, n).join(""),
    hidden: graphemes.slice(n).join(""),
    truncated: true,
  };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export const MAX_INPUT_CHARS = 100000;

/**
 * @param {object} input
 * @param {string} input.text       the post body
 * @param {string} input.platformId one of PLATFORMS[].id
 * @returns {{error:string}|object}
 */
export function analysePost(input) {
  const source = input && typeof input === "object" ? input : {};
  const platform = PLATFORM_BY_ID.get(source.platformId);
  if (!platform) {
    return { error: `Unknown platform "${source.platformId}". Pick one of: ${PLATFORMS.map((p) => p.id).join(", ")}.` };
  }
  if (typeof source.text !== "string") {
    return { error: "Post text must be a string." };
  }
  if (source.text.length > MAX_INPUT_CHARS) {
    return { error: `Post text is longer than ${MAX_INPUT_CHARS} characters, which is past every platform's cap.` };
  }

  const text = source.text;
  const entities = extractEntities(text);
  const { counted, doubleWeighted } = countForPlatform(platform, text);
  const remaining = platform.limit - counted;
  const over = remaining < 0;

  const bytes = countUtf8Bytes(text);
  const overBytes = typeof platform.byteLimit === "number" && bytes > platform.byteLimit;

  const cut =
    typeof platform.previewChars === "number"
      ? cutAtGraphemes(text, platform.previewChars)
      : { visible: text, hidden: "", truncated: false };

  const warnings = [];

  if (text.trim() === "") {
    warnings.push({ level: "warn", message: "The post is empty, so there is nothing to preview." });
  }

  if (over) {
    warnings.push({
      level: "error",
      message: `Over the ${platform.name} limit by ${Math.abs(remaining)} ${platform.unit}. The post will be rejected as written.`,
    });
  }

  if (overBytes) {
    warnings.push({
      level: "error",
      message: `${bytes} UTF-8 bytes, over the ${platform.byteLimit}-byte record cap. Emoji and non-Latin scripts use 3 to 4 bytes each.`,
    });
  }

  if (typeof platform.hashtagHardMax === "number" && entities.hashtags.length > platform.hashtagHardMax) {
    warnings.push({
      level: "error",
      message: `${entities.hashtags.length} hashtags, over the hard cap of ${platform.hashtagHardMax}. ${platform.name} refuses the caption rather than trimming it.`,
    });
  }

  if (cut.truncated) {
    warnings.push({
      level: "warn",
      message: `The feed crops at about ${platform.previewChars} characters, so ${countGraphemes(cut.hidden)} characters sit behind the "more" control.`,
    });
    const cutIndex = cut.visible.length;
    const hiddenUrls = entities.urls.filter((url) => url.index >= cutIndex);
    if (hiddenUrls.length > 0) {
      warnings.push({
        level: "warn",
        message: `${hiddenUrls.length} link${hiddenUrls.length === 1 ? "" : "s"} fall after the crop, so nobody sees ${hiddenUrls.length === 1 ? "it" : "them"} without expanding the post.`,
      });
    }
    const hiddenTags = entities.hashtags.filter((tag) => tag.index >= cutIndex);
    if (hiddenTags.length > 0 && hiddenTags.length === entities.hashtags.length) {
      warnings.push({
        level: "info",
        message: "Every hashtag sits after the crop. They still index, but they are not visible in the feed.",
      });
    }
  }

  if (platform.counting === "weighted" && doubleWeighted > 0) {
    warnings.push({
      level: "info",
      message: `${doubleWeighted} character${doubleWeighted === 1 ? "" : "s"} cost 2 units each here (emoji, or scripts outside the first Unicode block), not 1.`,
    });
  }

  if (platform.urlCost && entities.urls.length > 0) {
    warnings.push({
      level: "info",
      message: `${entities.urls.length} link${entities.urls.length === 1 ? "" : "s"} charged at a flat ${platform.urlCost} ${platform.unit} each regardless of real length.`,
    });
  }

  return {
    platform: {
      id: platform.id,
      name: platform.name,
      unit: platform.unit,
      limit: platform.limit,
      previewChars: platform.previewChars,
      previewCharsMobile: platform.previewCharsMobile || null,
      handleStyle: platform.handleStyle,
      engagement: platform.engagement,
      docs: platform.docs,
    },
    counted,
    limit: platform.limit,
    remaining,
    over,
    percentUsed: platform.limit > 0 ? Math.round((counted / platform.limit) * 1000) / 10 : 0,
    bytes,
    byteLimit: platform.byteLimit || null,
    overBytes,
    graphemes: countGraphemes(text),
    codePoints: countCodePoints(text),
    entities: {
      urls: entities.urls.map((item) => item.value),
      hashtags: entities.hashtags.map((item) => item.value),
      mentions: entities.mentions.map((item) => item.value),
      emojiCount: entities.emoji.length,
      lineCount: entities.lineCount,
      blankLineCount: entities.blankLineCount,
      firstLine: entities.firstLine,
    },
    preview: {
      visible: cut.visible,
      hidden: cut.hidden,
      truncated: cut.truncated,
      hiddenCount: countGraphemes(cut.hidden),
    },
    warnings,
  };
}

/** Run every platform over the same text, in table order. */
export function analyseAllPlatforms(text) {
  if (typeof text !== "string") return { error: "Post text must be a string." };
  const rows = [];
  for (const platform of PLATFORMS) {
    const result = analysePost({ text, platformId: platform.id });
    if (result.error) return result;
    rows.push({
      id: platform.id,
      name: platform.name,
      unit: platform.unit,
      counted: result.counted,
      limit: result.limit,
      remaining: result.remaining,
      over: result.over,
      bytes: result.bytes,
      byteLimit: result.byteLimit,
      overBytes: result.overBytes,
      truncated: result.preview.truncated,
      hiddenCount: result.preview.hiddenCount,
    });
  }
  return { rows };
}

/** Up to two initials for the placeholder avatar. No image is ever fetched. */
export function initials(name) {
  const parts = String(name == null ? "" : name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join("").toUpperCase();
  return (Array.from(parts[0])[0] + Array.from(parts[parts.length - 1])[0]).toUpperCase();
}

/** Plain-text report for the copy button. */
export function buildReport(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push(`${result.platform.name} post check`);
  lines.push("");
  lines.push(`Length: ${result.counted} / ${result.limit} ${result.platform.unit} (${result.remaining} left)`);
  lines.push(`Graphemes: ${result.graphemes}  Code points: ${result.codePoints}  UTF-8 bytes: ${result.bytes}`);
  lines.push(
    `Links: ${result.entities.urls.length}  Hashtags: ${result.entities.hashtags.length}  Mentions: ${result.entities.mentions.length}  Emoji: ${result.entities.emojiCount}  Lines: ${result.entities.lineCount}`,
  );
  if (result.preview.truncated) {
    lines.push(`Feed crop: after ${result.platform.previewChars} characters, ${result.preview.hiddenCount} hidden`);
  } else {
    lines.push("Feed crop: none — the whole post is shown");
  }
  if (result.warnings.length > 0) {
    lines.push("");
    lines.push("Notes:");
    for (const item of result.warnings) lines.push(`  [${item.level}] ${item.message}`);
  }
  return lines.join("\n");
}
