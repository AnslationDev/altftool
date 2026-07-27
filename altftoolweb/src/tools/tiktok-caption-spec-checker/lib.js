/**
 * TikTok caption + on-screen text specification rules.
 *
 * Two independent checks live here:
 *   1. analyseCaption()  - caption length, hashtag and mention accounting.
 *   2. checkSafeZone()   - whether a burned-in text block clears the app UI.
 *
 * Pure functions only: no Date.now(), no DOM, same input -> same output.
 */

/**
 * Maximum caption length TikTok accepts on a video post.
 * TikTok raised the caption field from 300 to 2,200 characters in its 2022
 * caption update; hashtags and @mentions are counted inside that same budget.
 */
export const CAPTION_MAX_CHARS = 2200;

/**
 * Approximately how much of a caption is visible in the feed before the
 * "more" link appears. TikTok clamps the overlay to roughly one to two lines
 * on a phone, so treat the opening ~100 characters as the part that must sell
 * the video on its own.
 */
export const CAPTION_PREVIEW_CHARS = 100;

/**
 * TikTok's creator guidance consistently recommends a small set of relevant
 * hashtags rather than a hashtag wall. Five is the default soft ceiling used
 * here; it is a recommendation, not a platform-enforced limit.
 */
export const HASHTAG_SOFT_LIMIT = 5;

/** Native TikTok upload frame: 1080 x 1920, i.e. 9:16 portrait. */
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

/**
 * UI chrome allowances on a 1080 x 1920 frame, measured inward from each edge.
 * These are the widely used creator-template margins for the areas TikTok
 * draws its own interface over:
 *   top    - the "Following / For You" tab row and status bar
 *   right  - the avatar, like, comment, bookmark, share and sound column
 *   bottom - username, caption, music ticker and the app navigation bar
 *   left   - a small gutter so text is not flush against the bezel
 * They are defaults, not a published API: every value is editable in the UI.
 */
export const SAFE_INSETS_1080 = Object.freeze({
  top: 130,
  right: 140,
  bottom: 320,
  left: 44,
});

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /@[\p{L}\p{N}_.]+/gu;
const URL_RE = /https?:\/\/\S+/giu;
const EMOJI_RE = /\p{Extended_Pictographic}/gu;

/**
 * Count characters the way a text field does - by Unicode code point, so a
 * non-BMP emoji counts once rather than twice.
 */
export function countCharacters(text) {
  if (typeof text !== "string") return 0;
  return Array.from(text).length;
}

/** Take the first n code points of a string without splitting a surrogate pair. */
export function takeCharacters(text, n) {
  if (typeof text !== "string") return "";
  if (!(n > 0)) return "";
  return Array.from(text).slice(0, Math.floor(n)).join("");
}

function matchAll(text, re) {
  return text.match(re) || [];
}

/**
 * Analyse a TikTok caption.
 *
 * @param {object} input
 * @param {string} input.caption      - the caption text as typed.
 * @param {number} [input.hashtagLimit] - soft ceiling for hashtag count.
 * @returns {object} report, or { error } when the input cannot be checked.
 */
export function analyseCaption({ caption = "", hashtagLimit = HASHTAG_SOFT_LIMIT } = {}) {
  if (typeof caption !== "string") {
    return { error: "Caption must be text." };
  }
  if (!caption.trim()) {
    return {
      error: `Enter a caption to check it against TikTok's ${CAPTION_MAX_CHARS.toLocaleString("en-US")} character limit.`,
    };
  }
  const limit = Number(hashtagLimit);
  if (!Number.isFinite(limit) || limit < 1) {
    return { error: "Hashtag limit must be a whole number of at least 1." };
  }

  const charCount = countCharacters(caption);
  const remaining = CAPTION_MAX_CHARS - charCount;
  const overBy = remaining < 0 ? -remaining : 0;
  const usedPercent = (charCount / CAPTION_MAX_CHARS) * 100;

  const hashtags = matchAll(caption, HASHTAG_RE);
  const mentions = matchAll(caption, MENTION_RE);
  const urls = matchAll(caption, URL_RE);
  const emojis = matchAll(caption, EMOJI_RE);

  const sumChars = (list) => list.reduce((total, item) => total + countCharacters(item), 0);
  const hashtagChars = sumChars(hashtags);
  const mentionChars = sumChars(mentions);
  const wordChars = Math.max(0, charCount - hashtagChars - mentionChars);

  const seen = new Map();
  const duplicateHashtags = [];
  for (const tag of hashtags) {
    const key = tag.toLowerCase();
    const count = (seen.get(key) || 0) + 1;
    seen.set(key, count);
    if (count === 2) duplicateHashtags.push(key);
  }

  const preview = takeCharacters(caption, CAPTION_PREVIEW_CHARS);
  const previewTruncated = charCount > CAPTION_PREVIEW_CHARS;
  const lineCount = caption.split(/\r?\n/).length;
  const lineBreaks = lineCount - 1;
  const hashtagsInPreview = matchAll(preview, HASHTAG_RE).length;

  const issues = [];
  if (overBy > 0) {
    issues.push({
      level: "error",
      message: `Caption is ${overBy.toLocaleString("en-US")} characters over the ${CAPTION_MAX_CHARS.toLocaleString("en-US")} character limit and will be rejected or cut.`,
    });
  } else if (remaining <= 100) {
    issues.push({
      level: "warning",
      message: `Only ${remaining} characters left before the ${CAPTION_MAX_CHARS.toLocaleString("en-US")} character limit.`,
    });
  }
  if (hashtags.length > limit) {
    issues.push({
      level: "warning",
      message: `${hashtags.length} hashtags used. Keeping it to about ${limit} relevant tags reads better than a hashtag wall.`,
    });
  }
  if (duplicateHashtags.length > 0) {
    issues.push({
      level: "warning",
      message: `Repeated hashtag${duplicateHashtags.length > 1 ? "s" : ""}: ${duplicateHashtags.join(", ")}. A repeat adds characters without adding reach.`,
    });
  }
  if (hashtagsInPreview > 0 && wordChars > 0 && previewTruncated) {
    issues.push({
      level: "info",
      message: `${hashtagsInPreview} hashtag${hashtagsInPreview > 1 ? "s appear" : " appears"} inside the first ${CAPTION_PREVIEW_CHARS} characters, using space the visible hook needs.`,
    });
  }
  if (urls.length > 0) {
    issues.push({
      level: "info",
      message: "Links in a caption are not tappable on TikTok. Point people to the profile link instead.",
    });
  }
  if (wordChars === 0) {
    issues.push({
      level: "warning",
      message: "The caption is only hashtags and mentions - there is no hook for a viewer to read.",
    });
  }
  if (!previewTruncated && hashtags.length === 0) {
    issues.push({
      level: "info",
      message: "No hashtags found. One or two specific tags help the caption describe the topic.",
    });
  }

  const status = overBy > 0
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    charCount,
    remaining,
    overBy,
    usedPercent,
    limit: CAPTION_MAX_CHARS,
    hashtags,
    hashtagCount: hashtags.length,
    hashtagChars,
    duplicateHashtags,
    mentions,
    mentionCount: mentions.length,
    mentionChars,
    urlCount: urls.length,
    emojiCount: emojis.length,
    wordChars,
    lineCount,
    lineBreaks,
    preview,
    previewTruncated,
    hashtagsInPreview,
    issues,
    status,
  };
}

/**
 * Scale the 1080 x 1920 safe-zone insets to another frame size.
 * Horizontal insets scale with width, vertical insets scale with height.
 */
export function scaleInsets(videoWidth, videoHeight, insets = SAFE_INSETS_1080) {
  const sx = videoWidth / VIDEO_WIDTH;
  const sy = videoHeight / VIDEO_HEIGHT;
  return {
    top: Math.round(insets.top * sy),
    bottom: Math.round(insets.bottom * sy),
    left: Math.round(insets.left * sx),
    right: Math.round(insets.right * sx),
  };
}

/**
 * Test whether a rectangular block of burned-in text clears TikTok's UI.
 *
 * All coordinates are in pixels with the origin at the top-left of the frame.
 *
 * @returns {object} { fits, safe, intrusions, suggestion, ... } or { error }.
 */
export function checkSafeZone({
  videoWidth = VIDEO_WIDTH,
  videoHeight = VIDEO_HEIGHT,
  boxLeft = 0,
  boxTop = 0,
  boxWidth = 0,
  boxHeight = 0,
  insets = SAFE_INSETS_1080,
} = {}) {
  const nums = [videoWidth, videoHeight, boxLeft, boxTop, boxWidth, boxHeight].map(Number);
  if (nums.some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every frame and text-box field." };
  }
  const [vw, vh, bx, by, bw, bh] = nums;
  if (!(vw > 0) || !(vh > 0)) {
    return { error: "Frame width and height must be greater than zero." };
  }
  if (!(bw > 0) || !(bh > 0)) {
    return { error: "Text box width and height must be greater than zero." };
  }
  if (bx < 0 || by < 0) {
    return { error: "Text box position cannot be negative - it would sit outside the frame." };
  }

  const scaled = scaleInsets(vw, vh, insets);
  const safe = {
    left: scaled.left,
    top: scaled.top,
    right: vw - scaled.right,
    bottom: vh - scaled.bottom,
  };
  const safeWidth = safe.right - safe.left;
  const safeHeight = safe.bottom - safe.top;
  if (!(safeWidth > 0) || !(safeHeight > 0)) {
    return { error: "The frame is too small for these UI margins - nothing is left inside the safe area." };
  }

  const boxRight = bx + bw;
  const boxBottom = by + bh;

  const intrusions = {
    left: Math.max(0, safe.left - bx),
    top: Math.max(0, safe.top - by),
    right: Math.max(0, boxRight - safe.right),
    bottom: Math.max(0, boxBottom - safe.bottom),
  };
  const worst = Math.max(intrusions.left, intrusions.top, intrusions.right, intrusions.bottom);
  const fits = worst === 0;

  const tooWide = bw > safeWidth;
  const tooTall = bh > safeHeight;

  const suggestion = {
    left: tooWide ? safe.left : Math.min(Math.max(bx, safe.left), safe.right - bw),
    top: tooTall ? safe.top : Math.min(Math.max(by, safe.top), safe.bottom - bh),
    width: Math.min(bw, safeWidth),
    height: Math.min(bh, safeHeight),
    resized: tooWide || tooTall,
  };

  const frameArea = vw * vh;
  const safeArea = safeWidth * safeHeight;

  return {
    fits,
    safe,
    safeWidth,
    safeHeight,
    safeAreaPercent: (safeArea / frameArea) * 100,
    intrusions,
    worstIntrusion: worst,
    boxRight,
    boxBottom,
    tooWide,
    tooTall,
    suggestion,
    scaledInsets: scaled,
    aspectRatio: vw / vh,
    isPortrait916: Math.abs(vw / vh - VIDEO_WIDTH / VIDEO_HEIGHT) < 0.01,
    rects: {
      box: toPercentRect(bx, by, bw, bh, vw, vh),
      safe: toPercentRect(safe.left, safe.top, safeWidth, safeHeight, vw, vh),
    },
  };
}

/**
 * Express a pixel rectangle as percentages of the frame so a preview can be
 * drawn at any size. Kept here so the component holds no geometry maths.
 */
export function toPercentRect(left, top, width, height, frameWidth, frameHeight) {
  if (!(frameWidth > 0) || !(frameHeight > 0)) return null;
  const clamp = (value) => Math.max(0, Math.min(100, value));
  return {
    left: `${clamp((left / frameWidth) * 100)}%`,
    top: `${clamp((top / frameHeight) * 100)}%`,
    width: `${clamp((width / frameWidth) * 100)}%`,
    height: `${clamp((height / frameHeight) * 100)}%`,
  };
}
