/**
 * Caption length checking across social platforms.
 *
 * Two things are measured for every platform:
 *  - the hard character limit the platform will reject a post over, and
 *  - the approximate point at which the feed collapses the caption behind a
 *    "more" link, which is where the reader actually stops.
 *
 * Preview lengths are approximate: they move with device width, font size and
 * app updates. Hard limits are the platform's published values.
 */

/**
 * X wraps every link in a t.co short link, so any URL counts as a fixed
 * 23 characters no matter how long the original is.
 */
export const X_URL_WEIGHT = 23;

export const PLATFORMS = [
  {
    id: "instagram-feed",
    label: "Instagram feed post",
    maxChars: 2200,
    previewChars: 125,
    maxHashtags: 30,
    urlWeight: 0,
    note: "Only the first line or two show before \"... more\"; hashtags past 30 block the post.",
  },
  {
    id: "instagram-reels",
    label: "Instagram Reels",
    maxChars: 2200,
    previewChars: 90,
    maxHashtags: 30,
    urlWeight: 0,
    note: "The Reels player overlays the caption, so the visible slice is shorter than the feed's.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    maxChars: 2200,
    previewChars: 100,
    maxHashtags: null,
    urlWeight: 0,
    note: "Hashtags count against the same 2,200 characters as the caption text.",
  },
  {
    id: "x-free",
    label: "X (standard account)",
    maxChars: 280,
    previewChars: 280,
    maxHashtags: null,
    urlWeight: X_URL_WEIGHT,
    note: "Every link counts as 23 characters after t.co wrapping, whatever its real length.",
  },
  {
    id: "x-premium",
    label: "X (Premium)",
    maxChars: 25000,
    previewChars: 280,
    maxHashtags: null,
    urlWeight: X_URL_WEIGHT,
    note: "Premium raises the post limit, but the timeline still collapses past roughly 280 characters.",
  },
  {
    id: "linkedin",
    label: "LinkedIn post",
    maxChars: 3000,
    previewChars: 140,
    maxHashtags: null,
    urlWeight: 0,
    note: "Mobile collapses earliest — put the point before the \"...see more\" break.",
  },
  {
    id: "facebook",
    label: "Facebook post",
    maxChars: 63206,
    previewChars: 477,
    maxHashtags: null,
    urlWeight: 0,
    note: "The limit is enormous but the feed still hides everything past the \"See more\" fold.",
  },
  {
    id: "threads",
    label: "Threads",
    maxChars: 500,
    previewChars: 500,
    maxHashtags: null,
    urlWeight: 0,
    note: "Short by design; longer thoughts have to be split into a chain.",
  },
  {
    id: "bluesky",
    label: "Bluesky",
    maxChars: 300,
    previewChars: 300,
    maxHashtags: null,
    urlWeight: 0,
    note: "300 graphemes per post, links included at their full length.",
  },
  {
    id: "pinterest",
    label: "Pinterest pin description",
    maxChars: 500,
    previewChars: 50,
    maxHashtags: null,
    urlWeight: 0,
    note: "Only the opening line shows on the pin close-up before it is cut.",
  },
  {
    id: "youtube-description",
    label: "YouTube description",
    maxChars: 5000,
    previewChars: 100,
    maxHashtags: 15,
    urlWeight: 0,
    note: "More than 15 hashtags on a video and YouTube ignores all of them.",
  },
  {
    id: "youtube-title",
    label: "YouTube title",
    maxChars: 100,
    previewChars: 60,
    maxHashtags: null,
    urlWeight: 0,
    note: "Search and suggested feeds clip titles well before the 100-character limit.",
  },
];

const URL_PATTERN = /https?:\/\/\S+/gi;

/** Count characters by code point so an emoji is one character, not two. */
export function characterCount(text) {
  return Array.from(String(text ?? "")).length;
}

/** Hashtags in a caption, deduplicated case-insensitively. */
export function extractHashtags(text) {
  const matches = String(text ?? "").match(/#[\p{L}\p{N}_]+/gu) || [];
  const seen = new Set();
  const tags = [];
  matches.forEach((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    tags.push(tag);
  });
  return tags;
}

/** URLs found in a caption. */
export function extractUrls(text) {
  return String(text ?? "").match(URL_PATTERN) || [];
}

/**
 * Characters a caption costs on one platform. When the platform applies a
 * fixed link weight, every URL is charged that weight instead of its length.
 */
export function countForPlatform(text, platform) {
  const value = String(text ?? "");
  const weight = platform && platform.urlWeight ? platform.urlWeight : 0;
  if (!weight) return characterCount(value);

  const urls = extractUrls(value);
  const bare = value.replace(URL_PATTERN, "");
  return characterCount(bare) + urls.length * weight;
}

/** Cut a caption at the preview point, on a word boundary where possible. */
export function previewSlice(text, previewChars) {
  const chars = Array.from(String(text ?? ""));
  if (chars.length <= previewChars) return { visible: chars.join(""), truncated: false };

  const raw = chars.slice(0, previewChars).join("");
  const lastSpace = raw.lastIndexOf(" ");
  // Only back off to a word boundary if it does not throw away most of the slice.
  const visible = lastSpace > previewChars * 0.6 ? raw.slice(0, lastSpace) : raw;
  return { visible, truncated: true };
}

export function getPlatform(platformId) {
  return PLATFORMS.find((platform) => platform.id === platformId) || null;
}

/**
 * Check one caption against every selected platform.
 * @param {object} input
 * @param {string} input.caption
 * @param {string[]} [input.platformIds] defaults to every platform
 */
export function analyseCaption(input = {}) {
  const { caption = "", platformIds } = input;

  const text = String(caption);
  if (!text.trim()) {
    return { error: "Write or paste a caption to check it." };
  }

  const selected =
    Array.isArray(platformIds) && platformIds.length > 0
      ? PLATFORMS.filter((platform) => platformIds.includes(platform.id))
      : PLATFORMS;

  if (selected.length === 0) {
    return { error: "Select at least one platform." };
  }

  const hashtags = extractHashtags(text);
  const urls = extractUrls(text);
  const plainChars = characterCount(text);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n").length;

  const results = selected.map((platform) => {
    const used = countForPlatform(text, platform);
    const { visible, truncated } = previewSlice(text, platform.previewChars);
    const hashtagsOver =
      platform.maxHashtags !== null ? Math.max(0, hashtags.length - platform.maxHashtags) : 0;

    return {
      id: platform.id,
      label: platform.label,
      note: platform.note,
      maxChars: platform.maxChars,
      previewChars: platform.previewChars,
      maxHashtags: platform.maxHashtags,
      used,
      remaining: platform.maxChars - used,
      overBy: Math.max(0, used - platform.maxChars),
      fits: used <= platform.maxChars,
      usedShare: platform.maxChars > 0 ? used / platform.maxChars : 0,
      visible,
      truncated,
      hiddenChars: Math.max(0, plainChars - characterCount(visible)),
      hashtagsOver,
    };
  });

  const failing = results.filter((row) => !row.fits || row.hashtagsOver > 0);
  const tightest = results.reduce(
    (worst, row) => (worst === null || row.remaining < worst.remaining ? row : worst),
    null,
  );

  return {
    chars: plainChars,
    words,
    lines,
    hashtags,
    urls,
    results,
    failing,
    fitsEverywhere: failing.length === 0,
    tightest,
  };
}
