/**
 * Testimonial card layout engine.
 *
 * Real maths in this file:
 *  - star geometry: a five-point star is a 10-vertex polygon whose inner radius is
 *    1/phi^2 of the outer radius, phi being the golden ratio. That ratio is what makes
 *    a star look like the ones in app-store ratings rather than a spiky asterisk.
 *  - type fitting: greedy word wrap plus a downward font-size search.
 *  - WCAG 2.1 relative luminance and contrast ratio for the colour check.
 */

/* ------------------------------------------------------------------ canvas sizes */

/** Published pixel sizes for each placement. */
export const CARD_PRESETS = [
  { id: "ig-square", label: "Instagram square", width: 1080, height: 1080, note: "1:1 feed post" },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, note: "4:5 feed post" },
  { id: "story", label: "Story / Reel", width: 1080, height: 1920, note: "9:16 full screen" },
  { id: "x-post", label: "X post", width: 1600, height: 900, note: "16:9 in-stream" },
  { id: "linkedin", label: "LinkedIn", width: 1200, height: 627, note: "1.91:1 link image" },
  { id: "wide-slide", label: "Deck slide", width: 1920, height: 1080, note: "16:9 presentation" },
];

/** Instagram's own UI covers roughly this much of a 1080x1920 story canvas. */
export const STORY_SAFE_TOP_PX = 250;
export const STORY_SAFE_BOTTOM_PX = 420;

export const MARGIN_RATIO = 0.08;
export const QUOTE_LINE_HEIGHT_RATIO = 1.32;
export const MAX_FONT_RATIO = 0.075;
export const MIN_FONT_RATIO = 0.024;
export const AVG_GLYPH_WIDTH_RATIO = 0.52;

/** A testimonial past this length stops being scannable in a feed. */
export const MAX_TESTIMONIAL_CHARS = 420;

/* ------------------------------------------------------------------ rating */

export const RATING_MAX = 5;

/** Golden-ratio inner radius: 1 / phi^2 = 0.381966..., the classic five-point star. */
export const STAR_INNER_RATIO = 1 / ((1 + Math.sqrt(5)) / 2) ** 2;

/** Clamp a rating to 0-5 in half-star steps. Returns null for unusable input. */
export function normaliseRating(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return null;
  const clamped = Math.min(RATING_MAX, Math.max(0, raw));
  return Math.round(clamped * 2) / 2;
}

/**
 * Vertices of a regular five-point star, first point at the top.
 * @returns {{x:number,y:number}[]} 10 points, alternating outer and inner radius.
 */
export function starPolygon({ cx, cy, outerRadius, points = 5, innerRatio = STAR_INNER_RATIO }) {
  const count = Math.max(3, Math.round(points));
  const outer = Math.max(0, Number(outerRadius) || 0);
  const inner = outer * innerRatio;
  const vertices = [];
  const step = Math.PI / count;
  let angle = -Math.PI / 2; // start at 12 o'clock
  for (let i = 0; i < count * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    vertices.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    angle += step;
  }
  return vertices;
}

/** Per-star fill fraction for a rating, e.g. 3.5 -> [1,1,1,0.5,0]. */
export function starFills(rating, max = RATING_MAX) {
  const value = normaliseRating(rating);
  if (value === null) return [];
  return Array.from({ length: max }, (_, index) => Math.min(1, Math.max(0, value - index)));
}

/* ------------------------------------------------------------------ identity */

/** Up to two initials from a person's name. Falls back to a single character. */
export function initialsFrom(name) {
  const parts = String(name || "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic hue from a name, so the same person always gets the same avatar colour. */
export function hueFromName(name) {
  const text = String(name || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 360;
  }
  return hash;
}

/* ------------------------------------------------------------------ colour */

export const PALETTES = [
  { id: "ink", label: "Ink", bg: { h: 222, s: 47, l: 11 }, card: { h: 222, s: 40, l: 16 }, fg: { h: 210, s: 40, l: 98 }, accent: { h: 174, s: 80, l: 45 } },
  { id: "paper", label: "Paper", bg: { h: 40, s: 38, l: 95 }, card: { h: 0, s: 0, l: 100 }, fg: { h: 25, s: 30, l: 16 }, accent: { h: 18, s: 78, l: 48 } },
  { id: "teal", label: "Teal", bg: { h: 174, s: 70, l: 28 }, card: { h: 174, s: 45, l: 20 }, fg: { h: 180, s: 60, l: 98 }, accent: { h: 45, s: 96, l: 62 } },
  { id: "slate", label: "Slate", bg: { h: 215, s: 20, l: 92 }, card: { h: 0, s: 0, l: 100 }, fg: { h: 215, s: 30, l: 18 }, accent: { h: 221, s: 83, l: 53 } },
  { id: "plum", label: "Plum", bg: { h: 280, s: 46, l: 22 }, card: { h: 280, s: 36, l: 28 }, fg: { h: 300, s: 30, l: 97 }, accent: { h: 322, s: 84, l: 66 } },
];

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));
const toHexPair = (value) => clampNumber(Math.round(value), 0, 255).toString(16).padStart(2, "0");

export function hslToHex({ h, s, l }) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clampNumber(Number(s), 0, 100) / 100;
  const light = clampNumber(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = table[Math.floor(hue / 60) % 6];
  return `#${toHexPair((r + m) * 255)}${toHexPair((g + m) * 255)}${toHexPair((b + m) * 255)}`;
}

export function parseHex(value) {
  const raw = String(value || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    const [r, g, b] = raw.split("");
    return { r: parseInt(r + r, 16), g: parseInt(g + g, 16), b: parseInt(b + b, 16) };
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return { r: parseInt(raw.slice(0, 2), 16), g: parseInt(raw.slice(2, 4), 16), b: parseInt(raw.slice(4, 6), 16) };
  }
  return null;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(colour) {
  const channels = parseHex(colour);
  if (!channels) return null;
  const linear = (raw) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(channels.r) + 0.7152 * linear(channels.g) + 0.0722 * linear(channels.b);
}

/** WCAG 2.1 contrast ratio, 1 to 21. */
export function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const AA_NORMAL_RATIO = 4.5;
export const AA_LARGE_RATIO = 3;

export function contrastVerdict(ratio) {
  if (!Number.isFinite(ratio)) return { level: "unknown", label: "Contrast unknown" };
  if (ratio >= 7) return { level: "aaa", label: "Passes AAA (7:1)" };
  if (ratio >= AA_NORMAL_RATIO) return { level: "aa", label: "Passes AA (4.5:1)" };
  if (ratio >= AA_LARGE_RATIO) return { level: "aa-large", label: "Passes AA for large text only (3:1)" };
  return { level: "fail", label: "Fails AA — the quote will be hard to read" };
}

/* ------------------------------------------------------------------ type fitting */

export function estimateWidth(text, fontSize) {
  return String(text).length * fontSize * AVG_GLYPH_WIDTH_RATIO;
}

export function wrapText(text, maxWidth, measure) {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0 || !(maxWidth > 0)) return [];
  const lines = [];
  let current = "";
  const breakWord = (word) => {
    let chunk = "";
    for (const char of word) {
      if (chunk && measure(chunk + char) > maxWidth) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk += char;
      }
    }
    return chunk;
  };
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = measure(word) > maxWidth ? breakWord(word) : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function fitTextBlock({ text, boxWidth, boxHeight, minFontSize, maxFontSize, lineHeightRatio = QUOTE_LINE_HEIGHT_RATIO, measure = estimateWidth }) {
  const width = Number(boxWidth);
  const height = Number(boxHeight);
  const min = Math.max(1, Math.floor(Number(minFontSize) || 1));
  const max = Math.max(min, Math.floor(Number(maxFontSize) || min));
  const body = String(text || "").trim();
  if (!body || !(width > 0) || !(height > 0)) {
    return { fontSize: min, lines: [], lineHeight: min * lineHeightRatio, blockHeight: 0, overflow: false };
  }
  for (let size = max; size >= min; size -= 1) {
    const lines = wrapText(body, width, (chunk) => measure(chunk, size));
    const lineHeight = size * lineHeightRatio;
    const blockHeight = lines.length * lineHeight;
    if (blockHeight <= height) return { fontSize: size, lines, lineHeight, blockHeight, overflow: false };
  }
  const lines = wrapText(body, width, (chunk) => measure(chunk, min));
  return { fontSize: min, lines, lineHeight: min * lineHeightRatio, blockHeight: lines.length * min * lineHeightRatio, overflow: true };
}

/* ------------------------------------------------------------------ the card */

export function findPreset(id) {
  return CARD_PRESETS.find((preset) => preset.id === id) || CARD_PRESETS[0];
}

export function findPalette(id) {
  return PALETTES.find((palette) => palette.id === id) || PALETTES[0];
}

/**
 * How credible does the testimonial look? Reviewers and buyers weight a full name,
 * a role and a company far more than the quote itself, so those carry the weight.
 */
export const CREDIBILITY_FIELDS = [
  { key: "name", label: "Full name", weight: 30 },
  { key: "role", label: "Job title", weight: 20 },
  { key: "company", label: "Company", weight: 20 },
  { key: "rating", label: "Star rating", weight: 15 },
  { key: "source", label: "Source or date", weight: 15 },
];

/**
 * Build the testimonial card spec.
 * @returns {object} spec, or { error } when the input cannot be laid out.
 */
export function buildTestimonialCard(input = {}) {
  const quote = String(input.quote || "").trim();
  if (!quote) return { error: "Paste the testimonial text to see the card." };
  if (quote.length > MAX_TESTIMONIAL_CHARS) {
    return {
      error: `The testimonial is ${quote.length} characters. Over ${MAX_TESTIMONIAL_CHARS} it has to be set too small to read in a feed — trim it to the strongest sentence or two.`,
    };
  }

  const rating = normaliseRating(input.rating);
  if (input.showRating !== false && rating === null) {
    return { error: "The rating must be a number between 0 and 5." };
  }

  const preset = findPreset(input.presetId);
  const palette = findPalette(input.paletteId);
  const background = parseHex(input.background) ? input.background : hslToHex(palette.bg);
  const card = parseHex(input.card) ? input.card : hslToHex(palette.card);
  const foreground = parseHex(input.foreground) ? input.foreground : hslToHex(palette.fg);
  const accent = parseHex(input.accent) ? input.accent : hslToHex(palette.accent);

  const { width, height } = preset;
  const shortEdge = Math.min(width, height);
  const outerMargin = Math.round(shortEdge * MARGIN_RATIO);
  const isStory = preset.id === "story";

  const cardTop = isStory ? Math.max(outerMargin, STORY_SAFE_TOP_PX) : outerMargin;
  const cardBottom = height - (isStory ? Math.max(outerMargin, STORY_SAFE_BOTTOM_PX) : outerMargin);
  const cardX = outerMargin;
  const cardWidth = width - outerMargin * 2;
  const cardHeight = cardBottom - cardTop;
  if (cardHeight < shortEdge * 0.25) {
    return { error: "This canvas is too short for a testimonial card once the safe area is removed. Pick a taller size." };
  }

  const pad = Math.round(shortEdge * 0.055);
  const innerWidth = cardWidth - pad * 2;

  const name = String(input.name || "").trim();
  const role = String(input.role || "").trim();
  const company = String(input.company || "").trim();
  const source = String(input.source || "").trim();
  const showRating = input.showRating !== false;

  const starSize = Math.round(shortEdge * 0.038);
  const starGap = Math.round(starSize * 0.35);
  const starRowHeight = showRating ? starSize + Math.round(shortEdge * 0.035) : 0;

  const avatarRadius = Math.round(shortEdge * 0.045);
  const identityHeight = avatarRadius * 2 + Math.round(shortEdge * 0.03);
  const sourceHeight = source ? Math.round(shortEdge * 0.05) : 0;

  const quoteBoxHeight = cardHeight - pad * 2 - starRowHeight - identityHeight - sourceHeight;
  if (quoteBoxHeight < shortEdge * 0.08) {
    return { error: "There is not enough room for the quote once the rating and the name row are placed. Turn the rating off or choose a taller canvas." };
  }

  const fit = fitTextBlock({
    text: `“${quote}”`,
    boxWidth: innerWidth,
    boxHeight: quoteBoxHeight,
    minFontSize: Math.round(shortEdge * MIN_FONT_RATIO),
    maxFontSize: Math.round(shortEdge * MAX_FONT_RATIO),
    measure: input.measure,
  });

  const contentTop = cardTop + pad;
  const starsY = contentTop + starSize / 2;
  const quoteTop = contentTop + starRowHeight;
  const identityTop = quoteTop + fit.blockHeight + Math.round(shortEdge * 0.03);

  const filledStars = showRating ? starFills(rating) : [];
  const stars = filledStars.map((fill, index) => ({
    fill,
    cx: cardX + pad + starSize / 2 + index * (starSize + starGap),
    cy: starsY,
    radius: starSize / 2,
  }));

  const credibility = CREDIBILITY_FIELDS.reduce(
    (acc, field) => {
      const present =
        field.key === "rating" ? showRating && rating !== null : Boolean(String(input[field.key] || "").trim());
      return {
        score: acc.score + (present ? field.weight : 0),
        total: acc.total + field.weight,
        missing: present ? acc.missing : [...acc.missing, field.label],
      };
    },
    { score: 0, total: 0, missing: [] },
  );

  const quoteContrast = contrastRatio(foreground, card);
  const cardContrast = contrastRatio(card, background);

  return {
    preset,
    width,
    height,
    background,
    card,
    foreground,
    accent,
    cardBox: { x: cardX, y: cardTop, width: cardWidth, height: cardHeight, radius: Math.round(shortEdge * 0.04) },
    pad,
    showRating,
    rating,
    stars,
    starSize,
    quote: {
      lines: fit.lines,
      fontSize: fit.fontSize,
      lineHeight: fit.lineHeight,
      x: cardX + pad,
      top: quoteTop,
      blockHeight: fit.blockHeight,
      overflow: fit.overflow,
    },
    identity: {
      name,
      role,
      company,
      initials: initialsFrom(name),
      avatarHue: hueFromName(name || quote),
      avatarRadius,
      avatarCx: cardX + pad + avatarRadius,
      avatarCy: identityTop + avatarRadius,
      textX: cardX + pad + avatarRadius * 2 + Math.round(shortEdge * 0.025),
      top: identityTop,
      nameSize: Math.round(shortEdge * 0.033),
      roleSize: Math.round(shortEdge * 0.026),
    },
    source: source ? { text: source, size: Math.round(shortEdge * 0.022), x: cardX + pad, y: cardTop + cardHeight - pad } : null,
    safeArea: isStory ? { top: STORY_SAFE_TOP_PX, bottom: STORY_SAFE_BOTTOM_PX } : null,
    credibility: {
      score: credibility.total > 0 ? Math.round((credibility.score / credibility.total) * 100) : 0,
      missing: credibility.missing,
    },
    contrast: {
      quote: Number.isFinite(quoteContrast) ? Math.round(quoteContrast * 100) / 100 : null,
      card: Number.isFinite(cardContrast) ? Math.round(cardContrast * 100) / 100 : null,
      verdict: contrastVerdict(quoteContrast),
    },
    stats: {
      characters: quote.length,
      words: quote.split(/\s+/).filter(Boolean).length,
      lineCount: fit.lines.length,
    },
  };
}
