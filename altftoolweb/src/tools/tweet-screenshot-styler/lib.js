/**
 * Tweet Screenshot Styler — pure layout and formatting module.
 * No React, no DOM, no clock reads. Dates arrive as arguments.
 */

/** Standard X/Twitter post limit for a free account. Premium raises it to 25,000. */
export const POST_CHAR_LIMIT = 280;

/** X Premium post limit, kept as the hard ceiling this tool will typeset. */
export const PREMIUM_CHAR_LIMIT = 25000;

/** X usernames are 4-15 characters of letters, digits and underscore. */
export const HANDLE_MIN = 4;
export const HANDLE_MAX = 15;
export const HANDLE_PATTERN = /^[A-Za-z0-9_]+$/;

/** X display names are capped at 50 characters. */
export const DISPLAY_NAME_MAX = 50;

/**
 * Export sizes, all real platform specs:
 * Instagram feed square 1080x1080 and portrait 1080x1350, story/reel 1080x1920,
 * and the 1.91:1 summary-large-image card at 1200x675.
 */
export const CARD_PRESETS = [
  { id: "square", label: "Square post 1080 × 1080", width: 1080, height: 1080 },
  { id: "portrait", label: "Portrait post 1080 × 1350", width: 1080, height: 1350 },
  { id: "story", label: "Story / Reel 1080 × 1920", width: 1080, height: 1920 },
  { id: "landscape", label: "Link card 1200 × 675", width: 1200, height: 675 },
];

/**
 * Mean advance width of a mixed-case glyph in a humanist sans-serif, as a
 * fraction of the font size. Used to wrap text without measuring in the DOM,
 * so the same input always produces the same layout.
 */
export const AVG_GLYPH_EM = 0.52;

/** Layout ratios, all expressed against the card width so every preset scales. */
export const PADDING_RATIO = 0.075;
export const AVATAR_RATIO = 0.085;
export const NAME_SIZE_RATIO = 0.037;
export const HANDLE_SIZE_RATIO = 0.031;
export const META_SIZE_RATIO = 0.029;
export const METRIC_SIZE_RATIO = 0.029;
export const BODY_MAX_RATIO = 0.072;
export const BODY_MIN_RATIO = 0.026;
export const LINE_HEIGHT = 1.34;

export const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Proleptic Gregorian leap year rule. */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (!Number.isInteger(month) || month < 1 || month > 12) return 0;
  return lengths[month - 1];
}

/**
 * Compact engagement counts the way X renders them: the value is truncated,
 * not rounded, to one decimal place (1,299 shows as 1.2K, never 1.3K).
 */
export function formatCompactCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  const truncate1 = (x) => Math.floor(x * 10) / 10;
  const strip = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  if (n < 1000) return String(Math.floor(n));
  if (n < 1e6) return `${strip(truncate1(n / 1000))}K`;
  if (n < 1e9) return `${strip(truncate1(n / 1e6))}M`;
  return `${strip(truncate1(n / 1e9))}B`;
}

/**
 * Format the post meta line as X does: "9:41 AM · 28 Jul 2026".
 * Dates come in as strings so the function stays pure.
 */
export function formatPostMeta({ dateISO, time24 } = {}) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateISO ?? ""));
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(String(time24 ?? ""));
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const suffix = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = String(minute).padStart(2, "0");
  return `${hour12}:${mm} ${suffix} · ${day} ${MONTH_ABBR[month - 1]} ${year}`;
}

/** Strip a leading @ and surrounding space from a handle. */
export function normaliseHandle(raw) {
  return String(raw ?? "").trim().replace(/^@+/, "");
}

export function validateHandle(raw) {
  const handle = normaliseHandle(raw);
  if (handle.length === 0) return { ok: false, reason: "Enter the account handle." };
  if (handle.length < HANDLE_MIN || handle.length > HANDLE_MAX) {
    return { ok: false, reason: `Handles are ${HANDLE_MIN} to ${HANDLE_MAX} characters long.` };
  }
  if (!HANDLE_PATTERN.test(handle)) {
    return { ok: false, reason: "Handles can only use letters, digits and underscores." };
  }
  return { ok: true, handle };
}

/** Approximate rendered width of a string, in pixels. */
export function estimateTextWidth(text, fontSizePx) {
  const size = Number(fontSizePx);
  if (!Number.isFinite(size) || size <= 0) return 0;
  return String(text ?? "").length * size * AVG_GLYPH_EM;
}

/**
 * Greedy word wrap into lines that fit `maxWidthPx` at `fontSizePx`.
 * Blank source lines are preserved so paragraph breaks survive.
 */
export function wrapText(text, maxWidthPx, fontSizePx) {
  const source = String(text ?? "");
  const width = Number(maxWidthPx);
  const size = Number(fontSizePx);
  if (!Number.isFinite(width) || width <= 0) return [];
  if (!Number.isFinite(size) || size <= 0) return [];

  const charsPerLine = Math.max(1, Math.floor(width / (size * AVG_GLYPH_EM)));
  const lines = [];

  source.split("\n").forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      return;
    }
    let current = "";
    words.forEach((word) => {
      let rest = word;
      // A single word longer than a line has to be hard-broken.
      while (rest.length > charsPerLine) {
        if (current) {
          lines.push(current);
          current = "";
        }
        lines.push(rest.slice(0, charsPerLine));
        rest = rest.slice(charsPerLine);
      }
      const candidate = current ? `${current} ${rest}` : rest;
      if (candidate.length <= charsPerLine) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = rest;
      }
    });
    if (current) lines.push(current);
  });

  return lines;
}

/** Initials used on the fallback avatar when no image is supplied. */
export function initialsFrom(name, handle) {
  const source = String(name ?? "").trim() || normaliseHandle(handle);
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Lay out a quote card: pick the largest body size at which the wrapped post
 * still fits the space between the header and the footer, and return every
 * coordinate the renderer needs.
 */
export function buildQuoteCard(input) {
  const {
    text = "",
    displayName = "",
    handle = "",
    dateISO = "",
    time24 = "",
    replies = 0,
    reposts = 0,
    likes = 0,
    presetId = "square",
    showMetrics = true,
    showAvatar = true,
  } = input || {};

  const preset = CARD_PRESETS.find((p) => p.id === presetId);
  if (!preset) return { error: "Choose a valid export size." };

  const body = String(text).trim();
  if (body.length === 0) return { error: "Paste the post text you want to turn into a graphic." };
  if (body.length > PREMIUM_CHAR_LIMIT) {
    return { error: `Posts longer than ${PREMIUM_CHAR_LIMIT.toLocaleString("en-IN")} characters cannot be typeset on one card.` };
  }

  const name = String(displayName).trim();
  if (name.length === 0) return { error: "Enter the display name shown on the post." };
  if (name.length > DISPLAY_NAME_MAX) {
    return { error: `Display names are at most ${DISPLAY_NAME_MAX} characters.` };
  }

  const handleCheck = validateHandle(handle);
  if (!handleCheck.ok) return { error: handleCheck.reason };

  const counts = { replies: Number(replies), reposts: Number(reposts), likes: Number(likes) };
  if (Object.values(counts).some((n) => !Number.isFinite(n) || n < 0)) {
    return { error: "Engagement counts must be zero or a positive number." };
  }

  const meta = formatPostMeta({ dateISO, time24 });
  if (meta === null) {
    return { error: "Enter a real date as YYYY-MM-DD and a time as HH:MM in 24-hour form." };
  }

  const { width, height } = preset;
  const padding = Math.round(width * PADDING_RATIO);
  const contentWidth = width - padding * 2;
  const avatar = showAvatar ? Math.round(width * AVATAR_RATIO) : 0;
  const nameSize = Math.round(width * NAME_SIZE_RATIO);
  const handleSize = Math.round(width * HANDLE_SIZE_RATIO);
  const metaSize = Math.round(width * META_SIZE_RATIO);
  const metricSize = Math.round(width * METRIC_SIZE_RATIO);

  const headerHeight = Math.max(avatar, nameSize * 1.2 + handleSize * 1.3);
  const gap = Math.round(width * 0.045);
  const metricsHeight = showMetrics ? metricSize * 1.9 : 0;
  const footerHeight = metaSize * 1.5 + metricsHeight;

  const availableBody = height - padding * 2 - headerHeight - gap * 2 - footerHeight;
  if (availableBody <= 0) {
    return { error: "This export size is too short for a header, the post and the footer." };
  }

  const maxSize = Math.round(width * BODY_MAX_RATIO);
  const minSize = Math.round(width * BODY_MIN_RATIO);

  let bodySize = minSize;
  let lines = wrapText(body, contentWidth, minSize);
  for (let size = maxSize; size >= minSize; size -= 1) {
    const candidate = wrapText(body, contentWidth, size);
    if (candidate.length * size * LINE_HEIGHT <= availableBody) {
      bodySize = size;
      lines = candidate;
      break;
    }
  }

  // Even at the smallest size the post may not fit; trim and mark it.
  let truncated = false;
  const maxLines = Math.max(1, Math.floor(availableBody / (bodySize * LINE_HEIGHT)));
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\s+\S*$/, "")}…`;
    truncated = true;
  }

  const blockHeight = lines.length * bodySize * LINE_HEIGHT;
  const bodyTop = padding + headerHeight + gap;
  const bodyLines = lines.map((line, index) => ({
    key: `line-${index}`,
    text: line,
    y: bodyTop + index * bodySize * LINE_HEIGHT + bodySize,
  }));

  const metricsBaseline = height - padding - metricSize * 0.25;
  const metaBaseline = showMetrics ? metricsBaseline - metricSize * 1.9 : height - padding;
  const dividerY = Math.round(metaBaseline - metaSize * 1.35);

  const metrics = showMetrics
    ? [
        { id: "replies", label: "Replies", value: formatCompactCount(counts.replies) },
        { id: "reposts", label: "Reposts", value: formatCompactCount(counts.reposts) },
        { id: "likes", label: "Likes", value: formatCompactCount(counts.likes) },
      ]
    : [];

  const warnings = [];
  if (body.length > POST_CHAR_LIMIT) {
    warnings.push(
      `${body.length} characters is over the ${POST_CHAR_LIMIT}-character limit for a free X account — only Premium posts run this long.`,
    );
  }
  if (truncated) {
    warnings.push("The post is longer than this card can hold, so the graphic is trimmed with an ellipsis.");
  }

  return {
    preset,
    width,
    height,
    padding,
    contentWidth,
    avatarSize: avatar,
    nameSize,
    handleSize,
    metaSize,
    metricSize,
    bodySize,
    bodyLines,
    lineCount: lines.length,
    blockHeight,
    availableBody,
    bodyTop,
    dividerY,
    metaBaseline,
    metricsBaseline,
    headerHeight,
    handle: `@${handleCheck.handle}`,
    displayName: name,
    initials: initialsFrom(name, handleCheck.handle),
    meta,
    metrics,
    charCount: body.length,
    charsRemaining: POST_CHAR_LIMIT - body.length,
    truncated,
    warnings,
  };
}
