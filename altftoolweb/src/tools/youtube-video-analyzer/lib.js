/**
 * YouTube Video Analyzer — everything that can honestly be worked out from a
 * YouTube link and from metadata the user pastes, without ever calling YouTube.
 *
 * This module makes NO network requests. It therefore cannot know a video's real
 * title, view count, duration, channel or publish date. What it *can* do, exactly
 * and repeatably, is:
 *
 *   1. Take a YouTube URL apart — video id, playlist, start/end time, tracking
 *      parameters — and rebuild clean, canonical, privacy-enhanced and embed links.
 *   2. Check the video id against the structure YouTube ids actually have: 11
 *      base64url characters encoding a 64-bit value, which constrains the final
 *      character to 16 of the 64 alphabet symbols.
 *   3. Derive the fixed i.ytimg.com thumbnail URLs and their known pixel sizes.
 *   4. Audit a pasted title and description against YouTube's published limits:
 *      100-character title, 5000-character description, 15 hashtags, and the
 *      chapter rules (first chapter at 0:00, at least three, each 10s or longer).
 *
 * Pure functions, no DOM, no clock, no randomness.
 */

/* ------------------------------------------------------------------ *
 * Video id structure
 * ------------------------------------------------------------------ */

/** RFC 4648 section 5 "URL and filename safe" alphabet, the one YouTube ids use. */
export const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export const VIDEO_ID_LENGTH = 11;

/**
 * 11 base64url characters carry 66 bits but a YouTube video id is a 64-bit value,
 * so the last character contributes only 4 significant bits and its alphabet index
 * is always a multiple of 4. That leaves exactly 16 possible final characters.
 */
export const VIDEO_ID_FINAL_CHARS = BASE64URL_ALPHABET.split("").filter(
  (_, index) => index % 4 === 0,
).join("");

/** Hosts that actually serve YouTube content. */
export const YOUTUBE_HOSTS = [
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "youtubekids.com",
  "youtubeeducation.com",
];

/**
 * Query parameters that carry attribution / analytics rather than playback state.
 * `si` is the share-session token YouTube adds to the copy-link button.
 */
export const TRACKING_PARAMS = [
  "si",
  "pp",
  "feature",
  "ab_channel",
  "source_ve_path",
  "gclid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/** Parameters that change what is actually played, and are worth keeping. */
export const PLAYBACK_PARAMS = ["v", "list", "index", "t", "start", "end", "loop", "rel", "mute"];

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

const isBlank = (value) => String(value ?? "").trim() === "";

/** Count Unicode code points, not UTF-16 units, so emoji count as one. */
export function codePointLength(text) {
  return Array.from(String(text ?? "")).length;
}

/** Cut a string to `limit` code points. */
export function truncateCodePoints(text, limit) {
  const chars = Array.from(String(text ?? ""));
  if (chars.length <= limit) return chars.join("");
  return chars.slice(0, limit).join("");
}

/** Seconds -> "1:02:03" / "4:07". Returns "" for anything not a finite second count. */
export function formatTimecode(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Parse the `t` / `start` / `end` URL parameter. YouTube accepts a bare second
 * count ("90"), a second count with a suffix ("90s") or a compound form
 * ("1h2m10s"). Returns null when the token is not one of those.
 */
export function parseDurationToken(raw) {
  const token = String(raw ?? "").trim().toLowerCase();
  if (token === "") return null;
  if (/^\d+$/.test(token)) return Number(token);
  const compound = token.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!compound) return null;
  const [, h, m, s] = compound;
  if (h === undefined && m === undefined && s === undefined) return null;
  return Number(h || 0) * 3600 + Number(m || 0) * 60 + Number(s || 0);
}

/** Parse "1:02:03" / "4:07" / "02:03" into seconds. Returns null when malformed. */
export function parseTimestamp(raw) {
  const token = String(raw ?? "").trim();
  const match = token.match(/^(?:(\d{1,3}):)?([0-5]?\d):([0-5]\d)$/);
  if (!match) return null;
  const [, h, m, s] = match;
  return Number(h || 0) * 3600 + Number(m) * 60 + Number(s);
}

/* ------------------------------------------------------------------ *
 * Video id
 * ------------------------------------------------------------------ */

/**
 * Structural check on an id. This is not an existence check — nothing here can
 * tell you whether a video is live, private or deleted.
 *
 * @returns {{ id: string, length: number, charsetOk: boolean, badChars: string[],
 *             lengthOk: boolean, finalCharOk: boolean, finalChar: string,
 *             wellFormed: boolean, notes: string[] }}
 */
export function inspectVideoId(raw) {
  const id = String(raw ?? "").trim();
  const chars = id.split("");
  const badChars = Array.from(new Set(chars.filter((c) => !BASE64URL_ALPHABET.includes(c))));
  const lengthOk = id.length === VIDEO_ID_LENGTH;
  const charsetOk = badChars.length === 0 && id.length > 0;
  const finalChar = id.slice(-1);
  const finalCharOk = lengthOk && charsetOk && VIDEO_ID_FINAL_CHARS.includes(finalChar);

  const notes = [];
  if (!lengthOk) {
    notes.push(
      `A YouTube video id is exactly ${VIDEO_ID_LENGTH} characters; this one is ${id.length}.`,
    );
  }
  if (badChars.length > 0) {
    notes.push(
      `Ids only use A-Z a-z 0-9 - and _. Not allowed here: ${badChars.join(" ")}.`,
    );
  }
  if (lengthOk && charsetOk && !finalCharOk) {
    notes.push(
      `The last character "${finalChar}" cannot end a YouTube id. Ids encode a 64-bit number, so the final character is always one of ${VIDEO_ID_FINAL_CHARS} — this id is probably mistyped or truncated.`,
    );
  }

  return {
    id,
    length: id.length,
    charsetOk,
    badChars,
    lengthOk,
    finalChar,
    finalCharOk,
    wellFormed: lengthOk && charsetOk && finalCharOk,
    notes,
  };
}

/* ------------------------------------------------------------------ *
 * Thumbnails
 * ------------------------------------------------------------------ */

/**
 * The fixed thumbnail paths YouTube serves from i.ytimg.com. Sizes are the
 * published dimensions of each named variant; maxresdefault only exists if the
 * source upload was at least 1280x720.
 */
export const THUMBNAIL_VARIANTS = [
  { name: "default", file: "default.jpg", width: 120, height: 90, note: "Always present." },
  { name: "medium", file: "mqdefault.jpg", width: 320, height: 180, note: "Always present, 16:9." },
  { name: "high", file: "hqdefault.jpg", width: 480, height: 360, note: "Always present, 4:3 letterboxed." },
  { name: "standard", file: "sddefault.jpg", width: 640, height: 480, note: "Missing on some older uploads." },
  { name: "maxres", file: "maxresdefault.jpg", width: 1280, height: 720, note: "Only if the upload was 720p or better." },
  { name: "frame 1", file: "1.jpg", width: 120, height: 90, note: "Auto-picked frame, 25% through." },
  { name: "frame 2", file: "2.jpg", width: 120, height: 90, note: "Auto-picked frame, 50% through." },
  { name: "frame 3", file: "3.jpg", width: 120, height: 90, note: "Auto-picked frame, 75% through." },
];

export function thumbnailUrls(videoId) {
  const id = String(videoId ?? "").trim();
  if (id === "") return [];
  return THUMBNAIL_VARIANTS.map((variant) => ({
    ...variant,
    url: `https://i.ytimg.com/vi/${id}/${variant.file}`,
    webpUrl: variant.file.endsWith("default.jpg")
      ? `https://i.ytimg.com/vi_webp/${id}/${variant.file.replace(/\.jpg$/, ".webp")}`
      : null,
  }));
}

/* ------------------------------------------------------------------ *
 * URL parsing
 * ------------------------------------------------------------------ */

const KIND_LABELS = {
  watch: "Standard watch page",
  short: "youtu.be share link",
  shorts: "Shorts",
  embed: "Embedded player",
  live: "Live / premiere page",
  legacy: "Legacy /v/ or /e/ path",
  playlist: "Playlist page (no single video)",
  clip: "Clip page (the clip id is not the video id)",
  channel: "Channel page (no video)",
  attribution: "Attribution redirect wrapper",
  unknown: "Unrecognised YouTube path",
};

function stripHostPrefix(hostname) {
  return hostname.replace(/^(www|m|music|gaming)\./, "");
}

/**
 * Take a YouTube URL apart.
 *
 * @param {string} raw
 * @returns {object} either { error } or the parsed shape.
 */
export function parseYouTubeUrl(raw) {
  const input = String(raw ?? "").trim();
  if (input === "") return { error: "Paste a YouTube link to analyse." };
  if (/\s/.test(input)) return { error: "That link contains a space — paste a single URL." };

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input}`;

  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return { error: "That is not a URL. Expected something like https://youtu.be/dQw4w9WgXcQ" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: `Only http and https links can be analysed, not "${url.protocol}"` };
  }

  const hostname = url.hostname.toLowerCase();
  const bareHost = stripHostPrefix(hostname);
  if (!YOUTUBE_HOSTS.includes(bareHost)) {
    return {
      error: `${hostname} is not a YouTube domain. Expected youtube.com, youtu.be or youtube-nocookie.com.`,
    };
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const params = url.searchParams;

  let kind = "unknown";
  let videoId = null;
  let clipId = null;
  let channelRef = null;

  if (bareHost === "youtu.be") {
    kind = "short";
    videoId = segments[0] || null;
  } else if (segments[0] === "watch") {
    kind = "watch";
    videoId = params.get("v");
  } else if (segments[0] === "shorts") {
    kind = "shorts";
    videoId = segments[1] || null;
  } else if (segments[0] === "embed") {
    kind = "embed";
    videoId = segments[1] || null;
  } else if (segments[0] === "live") {
    kind = "live";
    videoId = segments[1] || null;
  } else if (segments[0] === "v" || segments[0] === "e") {
    kind = "legacy";
    videoId = segments[1] || null;
  } else if (segments[0] === "playlist") {
    kind = "playlist";
  } else if (segments[0] === "clip") {
    kind = "clip";
    clipId = segments[1] || null;
  } else if (segments[0] === "attribution_link") {
    kind = "attribution";
    const inner = params.get("u");
    if (inner) {
      const innerParsed = parseYouTubeUrl(`https://www.youtube.com${inner}`);
      if (!innerParsed.error && innerParsed.videoId) videoId = innerParsed.videoId;
    }
  } else if (segments[0] && (segments[0].startsWith("@") || ["c", "user", "channel"].includes(segments[0]))) {
    kind = "channel";
    channelRef = segments[0].startsWith("@") ? segments[0] : `${segments[0]}/${segments[1] || ""}`;
  }

  if (videoId !== null) videoId = videoId.trim();
  if (videoId === "") videoId = null;

  const playlistId = params.get("list");
  const indexRaw = params.get("index");
  const listIndex = indexRaw !== null && /^\d+$/.test(indexRaw) ? Number(indexRaw) : null;

  const startRaw = params.get("t") ?? params.get("start");
  const startSeconds = startRaw === null ? null : parseDurationToken(startRaw);
  const endRaw = params.get("end");
  const endSeconds = endRaw === null ? null : parseDurationToken(endRaw);

  const tracking = [];
  const playback = [];
  const other = [];
  for (const [key, value] of params.entries()) {
    const entry = { key, value };
    if (TRACKING_PARAMS.includes(key)) tracking.push(entry);
    else if (PLAYBACK_PARAMS.includes(key)) playback.push(entry);
    else other.push(entry);
  }

  return {
    input,
    normalisedInput: withScheme,
    hostname,
    bareHost,
    isNoCookie: bareHost === "youtube-nocookie.com",
    isMobileHost: /^m\./.test(hostname),
    isHttps: url.protocol === "https:",
    pathname: url.pathname,
    segments,
    kind,
    kindLabel: KIND_LABELS[kind] || KIND_LABELS.unknown,
    videoId,
    clipId,
    channelRef,
    playlistId,
    listIndex,
    startRaw,
    startSeconds,
    endRaw,
    endSeconds,
    trackingParams: tracking,
    playbackParams: playback,
    otherParams: other,
  };
}

/* ------------------------------------------------------------------ *
 * Link rebuilding + embed code
 * ------------------------------------------------------------------ */

export function buildLinks(parsed) {
  const id = parsed.videoId;
  if (!id) return null;
  const start = Number.isFinite(parsed.startSeconds) && parsed.startSeconds > 0 ? parsed.startSeconds : null;

  const watch = `https://www.youtube.com/watch?v=${id}`;
  const links = {
    canonicalWatch: watch,
    shortShare: `https://youtu.be/${id}`,
    timestamped: start ? `${watch}&t=${start}s` : null,
    shortTimestamped: start ? `https://youtu.be/${id}?t=${start}` : null,
    inPlaylist: parsed.playlistId ? `${watch}&list=${parsed.playlistId}` : null,
    embed: `https://www.youtube.com/embed/${id}`,
    embedNoCookie: `https://www.youtube-nocookie.com/embed/${id}`,
    shorts: `https://www.youtube.com/shorts/${id}`,
    oembedEndpoint: `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`,
    thumbnailBase: `https://i.ytimg.com/vi/${id}/`,
  };
  return links;
}

/**
 * Build an <iframe> embed. Every option maps to a documented IFrame Player
 * parameter; nothing is invented.
 */
export function buildEmbedCode({
  videoId,
  start = null,
  end = null,
  privacyEnhanced = true,
  autoplay = false,
  mute = false,
  loop = false,
  hideRelated = true,
  width = 560,
  height = 315,
  title = "YouTube video player",
} = {}) {
  const id = String(videoId ?? "").trim();
  if (id === "") return { error: "No video id, so there is nothing to embed." };

  const host = privacyEnhanced ? "www.youtube-nocookie.com" : "www.youtube.com";
  const query = [];
  if (Number.isFinite(start) && start > 0) query.push(`start=${Math.floor(start)}`);
  if (Number.isFinite(end) && end > 0) query.push(`end=${Math.floor(end)}`);
  if (autoplay) query.push("autoplay=1");
  if (mute || autoplay) query.push("mute=1"); // browsers block unmuted autoplay
  if (loop) query.push("loop=1", `playlist=${id}`); // loop needs playlist=<same id>
  if (hideRelated) query.push("rel=0");

  const src = `https://${host}/embed/${id}${query.length ? `?${query.join("&")}` : ""}`;
  const code = [
    `<iframe width="${width}" height="${height}"`,
    `  src="${src}"`,
    `  title="${title}"`,
    `  frameborder="0" loading="lazy"`,
    `  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`,
    `  referrerpolicy="strict-origin-when-cross-origin"`,
    `  allowfullscreen></iframe>`,
  ].join("\n");

  const notes = [];
  if (autoplay) notes.push("Autoplay only works muted — mute=1 has been added for you.");
  if (loop) notes.push("A single-video loop needs playlist=<same id>; that has been added.");
  notes.push(
    privacyEnhanced
      ? "youtube-nocookie.com does not set tracking cookies until the viewer presses play."
      : "youtube.com sets cookies on page load; switch on privacy-enhanced mode to defer that.",
  );

  return { src, code, host, params: query, notes };
}

/* ------------------------------------------------------------------ *
 * Metadata audit — YouTube's published limits
 * ------------------------------------------------------------------ */

/** Titles longer than this are rejected by the upload form. */
export const TITLE_MAX = 100;
/** Roughly what survives before the ellipsis in search and suggested rails. */
export const TITLE_VISIBLE_APPROX = 60;
/** Description hard limit. */
export const DESCRIPTION_MAX = 5000;
/** Roughly the slice reused as the search snippet / meta description. */
export const DESCRIPTION_SNIPPET_APPROX = 157;
/** More than this many hashtags and YouTube ignores all of them. */
export const HASHTAG_MAX = 15;
/** Hashtags shown above the title on the watch page. */
export const HASHTAGS_SHOWN = 3;
/** Chapter rules. */
export const CHAPTER_MIN_COUNT = 3;
export const CHAPTER_MIN_SECONDS = 10;

const STOPWORDS = new Set([
  "the", "and", "for", "you", "your", "with", "this", "that", "from", "have", "will",
  "what", "when", "how", "why", "are", "was", "were", "but", "not", "all", "can",
  "our", "out", "get", "got", "its", "it's", "into", "about", "they", "them", "then",
  "than", "over", "just", "more", "most", "some", "such", "here", "there", "very",
  "video", "watch", "subscribe", "channel",
]);

/** Pull #hashtags out of a piece of text, in order, lowercased and de-duplicated. */
export function extractHashtags(text) {
  const source = String(text ?? "");
  const found = [];
  const re = /(^|[\s(])#([\p{L}\p{N}_]+)/gu;
  let match = re.exec(source);
  while (match !== null) {
    found.push(`#${match[2]}`);
    match = re.exec(source);
  }
  return found;
}

/** Pull http(s) links out of text. */
export function extractLinks(text) {
  const source = String(text ?? "");
  return source.match(/https?:\/\/[^\s<>"')]+/g) || [];
}

/**
 * Read chapter markers out of a description and check them against YouTube's
 * three rules: first marker at 0:00, at least three markers, each chapter at
 * least 10 seconds long.
 *
 * @param {string} description
 * @param {number|null} videoDurationSeconds optional, only used to measure the
 *        last chapter — leave null if you do not know it.
 */
export function parseChapters(description, videoDurationSeconds = null) {
  const lines = String(description ?? "").split(/\r?\n/);
  const found = [];

  lines.forEach((line, index) => {
    const match = line.match(/(?:^|\s)((?:\d{1,3}:)?[0-5]?\d:[0-5]\d)(?=\s|$|[)\]\-–—])/);
    if (!match) return;
    const seconds = parseTimestamp(match[1]);
    if (seconds === null) return;
    const label = line
      .replace(match[1], "")
      .replace(/^[\s\-–—:|•*[\]()]+/, "")
      .replace(/[\s\-–—:|]+$/, "")
      .trim();
    found.push({ line: index + 1, raw: line.trim(), timecode: formatTimecode(seconds), seconds, label });
  });

  const issues = [];
  if (found.length === 0) {
    return {
      chapters: [],
      issues: ["No timestamps found, so this description creates no chapters."],
      notes: [],
      valid: false,
      enabled: false,
    };
  }

  if (found.length < CHAPTER_MIN_COUNT) {
    issues.push(
      `Only ${found.length} timestamp${found.length === 1 ? "" : "s"} — YouTube needs at least ${CHAPTER_MIN_COUNT} before it turns them into chapters.`,
    );
  }
  if (found[0].seconds !== 0) {
    issues.push(
      `The first timestamp is ${found[0].timecode}. Chapters are ignored unless the first one is 0:00.`,
    );
  }

  const chapters = found.map((item, index) => {
    const next = found[index + 1];
    const endsAt = next
      ? next.seconds
      : Number.isFinite(videoDurationSeconds) && videoDurationSeconds > item.seconds
        ? videoDurationSeconds
        : null;
    return {
      ...item,
      lengthSeconds: endsAt === null ? null : endsAt - item.seconds,
    };
  });

  for (let i = 1; i < chapters.length; i += 1) {
    if (chapters[i].seconds <= chapters[i - 1].seconds) {
      issues.push(
        `${chapters[i].timecode} on line ${chapters[i].line} is not after ${chapters[i - 1].timecode} — timestamps must climb.`,
      );
    }
  }

  chapters.forEach((chapter) => {
    if (chapter.lengthSeconds !== null && chapter.lengthSeconds < CHAPTER_MIN_SECONDS) {
      issues.push(
        `"${chapter.label || chapter.timecode}" is only ${chapter.lengthSeconds}s long; every chapter must be at least ${CHAPTER_MIN_SECONDS}s.`,
      );
    }
    if (chapter.label === "") {
      issues.push(`The timestamp ${chapter.timecode} on line ${chapter.line} has no chapter title next to it.`);
    }
  });

  const notes = [];
  if (chapters[chapters.length - 1].lengthSeconds === null) {
    notes.push(
      "The last chapter's length depends on the video's total run time — enter that above if you want it checked too.",
    );
  }

  return { chapters, issues, notes, valid: issues.length === 0, enabled: true };
}

/** Word frequency, plainly counted — no scoring, no weighting. */
export function keywordCounts(text, limit = 8) {
  const words = String(text ?? "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .match(/[\p{L}\p{N}']{3,}/gu);
  if (!words) return [];
  const counts = new Map();
  words.forEach((word) => {
    if (STOPWORDS.has(word)) return;
    counts.set(word, (counts.get(word) || 0) + 1);
  });
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Audit a pasted title + description against YouTube's documented limits.
 * Every check states the rule it applies; nothing is scored or guessed.
 */
export function auditMetadata({ title = "", description = "", videoDurationSeconds = null } = {}) {
  const titleLength = codePointLength(title);
  const descriptionLength = codePointLength(description);
  const titleHashtags = extractHashtags(title);
  const descriptionHashtags = extractHashtags(description);
  const allHashtags = [...titleHashtags, ...descriptionHashtags];
  const links = extractLinks(description);
  const chapters = parseChapters(description, videoDurationSeconds);
  const snippet = truncateCodePoints(description.replace(/\s+/g, " ").trim(), DESCRIPTION_SNIPPET_APPROX);

  const checks = [];
  const push = (id, status, label, detail, rule) => checks.push({ id, status, label, detail, rule });

  if (isBlank(title)) {
    push("title", "info", "Title", "No title pasted, so nothing was checked.", `Hard limit ${TITLE_MAX} characters.`);
  } else if (titleLength > TITLE_MAX) {
    push("title", "fail", "Title length", `${titleLength} characters — YouTube will refuse to save this.`, `Hard limit ${TITLE_MAX} characters.`);
  } else if (titleLength > TITLE_VISIBLE_APPROX) {
    push("title", "warn", "Title length", `${titleLength} characters. Roughly the first ${TITLE_VISIBLE_APPROX} survive before the ellipsis in search and suggested rails, so "${truncateCodePoints(title, TITLE_VISIBLE_APPROX)}" is what most viewers read.`, `Hard limit ${TITLE_MAX} characters.`);
  } else {
    push("title", "pass", "Title length", `${titleLength} characters — fits inside the ~${TITLE_VISIBLE_APPROX} that stay visible.`, `Hard limit ${TITLE_MAX} characters.`);
  }

  if (isBlank(description)) {
    push("description", "info", "Description", "No description pasted, so nothing was checked.", `Hard limit ${DESCRIPTION_MAX} characters.`);
  } else if (descriptionLength > DESCRIPTION_MAX) {
    push("description", "fail", "Description length", `${descriptionLength} characters — ${descriptionLength - DESCRIPTION_MAX} over the limit.`, `Hard limit ${DESCRIPTION_MAX} characters.`);
  } else {
    push("description", "pass", "Description length", `${descriptionLength} of ${DESCRIPTION_MAX} characters used.`, `Hard limit ${DESCRIPTION_MAX} characters.`);
  }

  if (!isBlank(description)) {
    const firstLink = links.length > 0 ? description.indexOf(links[0]) : -1;
    if (firstLink >= 0 && codePointLength(description.slice(0, firstLink)) < DESCRIPTION_SNIPPET_APPROX) {
      push("snippet", "warn", "Opening lines", `A link appears inside the first ~${DESCRIPTION_SNIPPET_APPROX} characters, which is the part reused as the search snippet.`, "The collapsed description is what search engines quote.");
    } else {
      push("snippet", "pass", "Opening lines", `Snippet preview: "${snippet}${descriptionLength > DESCRIPTION_SNIPPET_APPROX ? "…" : ""}"`, "The collapsed description is what search engines quote.");
    }
  }

  if (allHashtags.length === 0) {
    push("hashtags", "info", "Hashtags", "None found.", `More than ${HASHTAG_MAX} and YouTube ignores every one of them.`);
  } else if (allHashtags.length > HASHTAG_MAX) {
    push("hashtags", "fail", "Hashtags", `${allHashtags.length} hashtags — over ${HASHTAG_MAX}, so YouTube ignores all of them.`, `More than ${HASHTAG_MAX} and YouTube ignores every one of them.`);
  } else {
    const shown = descriptionHashtags.slice(0, HASHTAGS_SHOWN);
    push("hashtags", "pass", "Hashtags", `${allHashtags.length} found.${shown.length ? ` Shown above the title: ${shown.join(" ")}` : ""}`, `The first ${HASHTAGS_SHOWN} description hashtags appear above the title.`);
  }

  if (!chapters.enabled) {
    push("chapters", "info", "Chapters", "No timestamps in the description, so the video has no chapters.", `First at 0:00, at least ${CHAPTER_MIN_COUNT}, each ${CHAPTER_MIN_SECONDS}s or longer.`);
  } else if (chapters.valid) {
    push("chapters", "pass", "Chapters", `${chapters.chapters.length} chapters and every rule is satisfied.`, `First at 0:00, at least ${CHAPTER_MIN_COUNT}, each ${CHAPTER_MIN_SECONDS}s or longer.`);
  } else {
    push("chapters", "fail", "Chapters", chapters.issues.join(" "), `First at 0:00, at least ${CHAPTER_MIN_COUNT}, each ${CHAPTER_MIN_SECONDS}s or longer.`);
  }

  return {
    titleLength,
    titleVisible: truncateCodePoints(title, TITLE_VISIBLE_APPROX),
    titleTruncated: titleLength > TITLE_VISIBLE_APPROX,
    descriptionLength,
    descriptionLines: isBlank(description) ? 0 : String(description).split(/\r?\n/).length,
    snippet,
    titleHashtags,
    descriptionHashtags,
    hashtagCount: allHashtags.length,
    links,
    linkCount: links.length,
    chapters,
    keywords: keywordCounts(`${title}\n${description}`),
    checks,
  };
}

/* ------------------------------------------------------------------ *
 * Top-level composition
 * ------------------------------------------------------------------ */

/**
 * Analyse a link, and optionally the metadata pasted alongside it.
 *
 * @returns {object} { error } or the full local report.
 */
export function analyzeYouTubeVideo({
  url,
  title = "",
  description = "",
  videoDurationSeconds = null,
  embedOptions = {},
} = {}) {
  const parsed = parseYouTubeUrl(url);
  if (parsed.error) return { error: parsed.error };

  if (!parsed.videoId) {
    const reason =
      parsed.kind === "playlist"
        ? "That is a playlist URL — open one video from the playlist to get a video id."
        : parsed.kind === "channel"
          ? "That is a channel URL, not a video."
          : parsed.kind === "clip"
            ? "Clip URLs hide the underlying video id; open the clip and copy the full watch link."
            : "No video id in that URL.";
    return { error: reason };
  }

  const idCheck = inspectVideoId(parsed.videoId);
  const links = buildLinks(parsed);
  const embed = buildEmbedCode({
    videoId: parsed.videoId,
    start: parsed.startSeconds,
    end: parsed.endSeconds,
    ...embedOptions,
  });
  const metadata = auditMetadata({ title, description, videoDurationSeconds });

  const privacyNotes = [];
  if (parsed.trackingParams.length > 0) {
    privacyNotes.push(
      `${parsed.trackingParams.length} tracking parameter${parsed.trackingParams.length === 1 ? "" : "s"} in this link (${parsed.trackingParams.map((p) => p.key).join(", ")}). The clean watch link below drops them.`,
    );
  } else {
    privacyNotes.push("No tracking parameters in this link.");
  }
  if (!parsed.isHttps) privacyNotes.push("This link is plain http; YouTube redirects to https anyway.");
  if (parsed.isNoCookie) privacyNotes.push("Already on youtube-nocookie.com — cookies are deferred until playback.");

  return {
    parsed,
    idCheck,
    links,
    embed,
    thumbnails: thumbnailUrls(parsed.videoId),
    metadata,
    privacyNotes,
    startTimecode: parsed.startSeconds === null ? null : formatTimecode(parsed.startSeconds),
    endTimecode: parsed.endSeconds === null ? null : formatTimecode(parsed.endSeconds),
    limitations: [
      "This page never contacts YouTube, so it cannot read the real title, view count, duration, channel or publish date.",
      "Paste the title and description yourself to have them audited against YouTube's limits.",
      "The id check tests structure only — a well-formed id can still point at a deleted or private video.",
    ],
  };
}

export default analyzeYouTubeVideo;
