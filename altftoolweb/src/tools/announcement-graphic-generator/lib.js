/**
 * Announcement graphic layout engine.
 *
 * The typographic sizes are not picked by hand — they come off a modular scale, the
 * standard method for building a type hierarchy: each step is the previous size
 * multiplied by a fixed ratio. Ratios here are the musical intervals typographers
 * normally use (minor third 1.200, major third 1.250, perfect fourth 1.333) plus the
 * golden ratio 1.618. Headline sits at step 0, subhead one step down, eyebrow and CTA
 * two steps down, which guarantees a visible hierarchy at any canvas size.
 *
 * Date maths (the countdown line) is pure: it takes "today" as an argument rather than
 * reading the clock, so the same inputs always give the same output.
 */

/* ------------------------------------------------------------------ canvas sizes */

export const CANVAS_PRESETS = [
  { id: "ig-square", label: "Instagram square", width: 1080, height: 1080, note: "1:1 feed post" },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, note: "4:5 feed post" },
  { id: "story", label: "Story / Reel", width: 1080, height: 1920, note: "9:16 full screen" },
  { id: "x-post", label: "X post", width: 1600, height: 900, note: "16:9 in-stream" },
  { id: "linkedin", label: "LinkedIn", width: 1200, height: 627, note: "1.91:1 link image" },
  { id: "email-banner", label: "Email banner", width: 1200, height: 400, note: "3:1 header strip" },
];

export const STORY_SAFE_TOP_PX = 250;
export const STORY_SAFE_BOTTOM_PX = 420;

export const MARGIN_RATIO = 0.075;
export const AVG_GLYPH_WIDTH_RATIO = 0.52;
export const HEADLINE_LINE_HEIGHT_RATIO = 1.12;
export const BODY_LINE_HEIGHT_RATIO = 1.4;

/** A headline longer than this cannot be set large enough to work as an announcement. */
export const MAX_HEADLINE_CHARS = 90;

/* ------------------------------------------------------------------ type scale */

/** Classic modular-scale ratios. Perfect fourth is the safe default for display type. */
export const TYPE_SCALE_RATIOS = [
  { id: "minor-third", label: "Minor third (1.200)", ratio: 1.2 },
  { id: "major-third", label: "Major third (1.250)", ratio: 1.25 },
  { id: "perfect-fourth", label: "Perfect fourth (1.333)", ratio: 1.333 },
  { id: "golden", label: "Golden ratio (1.618)", ratio: 1.618 },
];

/** Below this headline-to-subhead ratio the two sizes read as a mistake, not a hierarchy. */
export const MIN_HIERARCHY_RATIO = 1.5;

export function findRatio(id) {
  return TYPE_SCALE_RATIOS.find((entry) => entry.id === id) || TYPE_SCALE_RATIOS[2];
}

/** Size at a given step of the scale. Step 0 is the base size; negative steps are smaller. */
export function scaleStep(baseSize, ratio, step) {
  const base = Number(baseSize);
  const r = Number(ratio);
  if (!Number.isFinite(base) || !(r > 0)) return 0;
  return base * Math.pow(r, Number(step) || 0);
}

/* ------------------------------------------------------------------ templates */

/**
 * Each template fixes the eyebrow wording and which supporting lines are shown, so a
 * set of announcements from one brand stays consistent.
 */
export const TEMPLATES = [
  { id: "launch", label: "Launch", eyebrow: "Now live", showDate: true, showCta: true, dateLabel: "Available from" },
  { id: "update", label: "Product update", eyebrow: "What's new", showDate: false, showCta: true, dateLabel: "Shipped" },
  { id: "event", label: "Event", eyebrow: "Save the date", showDate: true, showCta: true, dateLabel: "Starts" },
  { id: "hiring", label: "We're hiring", eyebrow: "Open role", showDate: true, showCta: true, dateLabel: "Applications close" },
  { id: "milestone", label: "Milestone", eyebrow: "Milestone", showDate: false, showCta: false, dateLabel: "Reached" },
  { id: "maintenance", label: "Maintenance", eyebrow: "Scheduled maintenance", showDate: true, showCta: false, dateLabel: "Window opens" },
];

export function findTemplate(id) {
  return TEMPLATES.find((template) => template.id === id) || TEMPLATES[0];
}

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO yyyy-mm-dd string as a UTC midnight timestamp. Returns null if invalid. */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const stamp = Date.UTC(y, m - 1, d);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return stamp;
}

/**
 * Whole days from `todayIso` to `targetIso`. Positive means the target is in the future.
 * Pure — the reference date is an argument, never the system clock.
 */
export function daysUntil(targetIso, todayIso) {
  const target = parseIsoDate(targetIso);
  const today = parseIsoDate(todayIso);
  if (target === null || today === null) return null;
  return Math.round((target - today) / MS_PER_DAY);
}

/** Human countdown line for a target date. */
export function countdownLine(targetIso, todayIso) {
  const days = daysUntil(targetIso, todayIso);
  if (days === null) return "";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/** Format an ISO date for display. Falls back to the raw string if it cannot be parsed. */
export function formatDate(value, locale = "en-GB") {
  const stamp = parseIsoDate(value);
  if (stamp === null) return String(value || "").trim();
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(stamp));
}

/* ------------------------------------------------------------------ colour */

export const PALETTES = [
  { id: "ink", label: "Ink", bg: { h: 222, s: 47, l: 11 }, fg: { h: 210, s: 40, l: 98 }, accent: { h: 174, s: 80, l: 45 } },
  { id: "teal", label: "Teal", bg: { h: 174, s: 78, l: 30 }, fg: { h: 180, s: 60, l: 98 }, accent: { h: 45, s: 96, l: 62 } },
  { id: "paper", label: "Paper", bg: { h: 40, s: 38, l: 95 }, fg: { h: 25, s: 30, l: 16 }, accent: { h: 18, s: 78, l: 48 } },
  { id: "midnight", label: "Midnight", bg: { h: 245, s: 40, l: 14 }, fg: { h: 250, s: 30, l: 97 }, accent: { h: 262, s: 84, l: 68 } },
  { id: "signal", label: "Signal", bg: { h: 12, s: 84, l: 45 }, fg: { h: 20, s: 60, l: 99 }, accent: { h: 45, s: 96, l: 66 } },
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

export function contrastVerdict(ratio) {
  if (!Number.isFinite(ratio)) return { level: "unknown", label: "Contrast unknown" };
  if (ratio >= 7) return { level: "aaa", label: "Passes AAA (7:1)" };
  if (ratio >= 4.5) return { level: "aa", label: "Passes AA (4.5:1)" };
  if (ratio >= 3) return { level: "aa-large", label: "Passes AA for large text only (3:1)" };
  return { level: "fail", label: "Fails AA — hard to read" };
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

export function fitTextBlock({ text, boxWidth, boxHeight, minFontSize, maxFontSize, lineHeightRatio, measure = estimateWidth }) {
  const width = Number(boxWidth);
  const height = Number(boxHeight);
  const min = Math.max(1, Math.floor(Number(minFontSize) || 1));
  const max = Math.max(min, Math.floor(Number(maxFontSize) || min));
  const body = String(text || "").trim();
  const lhr = Number(lineHeightRatio) > 0 ? Number(lineHeightRatio) : HEADLINE_LINE_HEIGHT_RATIO;
  if (!body || !(width > 0) || !(height > 0)) {
    return { fontSize: min, lines: [], lineHeight: min * lhr, blockHeight: 0, overflow: false };
  }
  for (let size = max; size >= min; size -= 1) {
    const lines = wrapText(body, width, (chunk) => measure(chunk, size));
    const blockHeight = lines.length * size * lhr;
    if (blockHeight <= height) return { fontSize: size, lines, lineHeight: size * lhr, blockHeight, overflow: false };
  }
  const lines = wrapText(body, width, (chunk) => measure(chunk, min));
  return { fontSize: min, lines, lineHeight: min * lhr, blockHeight: lines.length * min * lhr, overflow: true };
}

/* ------------------------------------------------------------------ the graphic */

export function findPreset(id) {
  return CANVAS_PRESETS.find((preset) => preset.id === id) || CANVAS_PRESETS[0];
}

export function findPalette(id) {
  return PALETTES.find((palette) => palette.id === id) || PALETTES[0];
}

/**
 * Build the announcement spec.
 *
 * @param {object} input
 * @param {string} input.headline
 * @param {string} [input.eyebrow] overrides the template eyebrow
 * @param {string} [input.subhead]
 * @param {string} [input.ctaLabel]
 * @param {string} [input.dateIso] yyyy-mm-dd
 * @param {string} [input.todayIso] yyyy-mm-dd, the reference date for the countdown
 * @returns {object} spec, or { error }
 */
export function buildAnnouncement(input = {}) {
  const headline = String(input.headline || "").trim();
  if (!headline) return { error: "Write the headline — it is the only line most people will read." };
  if (headline.length > MAX_HEADLINE_CHARS) {
    return {
      error: `The headline is ${headline.length} characters. Over ${MAX_HEADLINE_CHARS} it has to be set too small to work as an announcement — move the detail into the subhead.`,
    };
  }

  const template = findTemplate(input.templateId);
  const preset = findPreset(input.presetId);
  const palette = findPalette(input.paletteId);
  const scale = findRatio(input.scaleId);

  const background = parseHex(input.background) ? input.background : hslToHex(palette.bg);
  const foreground = parseHex(input.foreground) ? input.foreground : hslToHex(palette.fg);
  const accent = parseHex(input.accent) ? input.accent : hslToHex(palette.accent);

  const { width, height } = preset;
  const shortEdge = Math.min(width, height);
  const margin = Math.round(shortEdge * MARGIN_RATIO);
  const isStory = preset.id === "story";

  const topBound = isStory ? Math.max(margin, STORY_SAFE_TOP_PX) : margin;
  const bottomBound = isStory ? Math.max(margin, STORY_SAFE_BOTTOM_PX) : margin;
  const boxWidth = width - margin * 2;
  const contentHeight = height - topBound - bottomBound;
  if (contentHeight < shortEdge * 0.2) {
    return { error: "This canvas is too short once the safe area is removed. Pick a taller placement." };
  }

  const eyebrow = String(input.eyebrow ?? template.eyebrow).trim();
  const subhead = String(input.subhead || "").trim();
  const ctaLabel = template.showCta ? String(input.ctaLabel || "").trim() : "";
  const dateIso = template.showDate ? String(input.dateIso || "").trim() : "";
  const todayIso = String(input.todayIso || "").trim();

  const dateText = dateIso ? `${template.dateLabel} ${formatDate(dateIso, input.locale)}` : "";
  const countdown = dateIso && todayIso ? countdownLine(dateIso, todayIso) : "";

  // Reserve vertical space for the supporting lines before fitting the headline.
  const supportUnit = Math.round(shortEdge * 0.03);
  const eyebrowBlock = eyebrow ? supportUnit * 2.4 : 0;
  const subheadBlock = subhead ? supportUnit * 3.2 : 0;
  const metaBlock = (dateText ? supportUnit * 2 : 0) + (ctaLabel ? supportUnit * 3 : 0);

  const headlineBoxHeight = contentHeight - eyebrowBlock - subheadBlock - metaBlock;
  if (headlineBoxHeight < shortEdge * 0.08) {
    return { error: "There is no room left for the headline. Shorten the subhead or drop the call to action." };
  }

  const fit = fitTextBlock({
    text: headline,
    boxWidth,
    boxHeight: headlineBoxHeight,
    minFontSize: Math.round(shortEdge * 0.045),
    maxFontSize: Math.round(shortEdge * 0.16),
    lineHeightRatio: HEADLINE_LINE_HEIGHT_RATIO,
    measure: input.measure,
  });

  // Everything below the headline comes off the modular scale.
  const subheadSize = Math.round(scaleStep(fit.fontSize, scale.ratio, -1));
  const eyebrowSize = Math.round(scaleStep(fit.fontSize, scale.ratio, -2));
  const ctaSize = Math.round(scaleStep(fit.fontSize, scale.ratio, -2));
  const metaSize = Math.round(scaleStep(fit.fontSize, scale.ratio, -3));

  const subheadFit = subhead
    ? fitTextBlock({
        text: subhead,
        boxWidth,
        boxHeight: subheadBlock || shortEdge,
        minFontSize: Math.max(12, Math.round(subheadSize * 0.6)),
        maxFontSize: Math.max(12, subheadSize),
        lineHeightRatio: BODY_LINE_HEIGHT_RATIO,
        measure: input.measure,
      })
    : { fontSize: subheadSize, lines: [], lineHeight: subheadSize * BODY_LINE_HEIGHT_RATIO, blockHeight: 0, overflow: false };

  let cursor = topBound;
  const eyebrowY = eyebrow ? cursor + eyebrowSize : cursor;
  if (eyebrow) cursor += eyebrowBlock;

  const headlineTop = cursor;
  cursor += fit.blockHeight + Math.round(shortEdge * 0.02);

  const subheadTop = cursor;
  if (subhead) cursor += subheadFit.blockHeight + Math.round(shortEdge * 0.025);

  const dateY = dateText ? cursor + metaSize : cursor;
  if (dateText) cursor += metaSize * 2;

  const ctaHeight = Math.round(ctaSize * 2.4);
  const ctaWidth = ctaLabel ? Math.round(estimateWidth(ctaLabel, ctaSize) + ctaSize * 2.4) : 0;

  const hierarchyRatio = subheadFit.fontSize > 0 ? fit.fontSize / subheadFit.fontSize : null;
  const ratio = contrastRatio(foreground, background);
  const accentContrast = contrastRatio(accent, background);
  const ctaTextContrast = contrastRatio(background, accent);

  const warnings = [];
  if (hierarchyRatio !== null && hierarchyRatio < MIN_HIERARCHY_RATIO) {
    warnings.push(
      `The headline is only ${hierarchyRatio.toFixed(2)}x the subhead. Below ${MIN_HIERARCHY_RATIO}x the two sizes read as a mistake — shorten the subhead or choose a wider scale ratio.`,
    );
  }
  if (fit.overflow) warnings.push("The headline had to be set at the minimum size to fit. Cut some words.");
  if (Number.isFinite(ratio) && ratio < 4.5) warnings.push(`Text contrast is ${ratio.toFixed(2)}:1, under the 4.5:1 AA threshold.`);

  return {
    template,
    preset,
    scale,
    width,
    height,
    margin,
    background,
    foreground,
    accent,
    eyebrow: eyebrow ? { text: eyebrow.toUpperCase(), size: eyebrowSize, x: margin, y: eyebrowY } : null,
    headline: { lines: fit.lines, fontSize: fit.fontSize, lineHeight: fit.lineHeight, x: margin, top: headlineTop, overflow: fit.overflow },
    subhead: subhead ? { lines: subheadFit.lines, fontSize: subheadFit.fontSize, lineHeight: subheadFit.lineHeight, x: margin, top: subheadTop } : null,
    date: dateText ? { text: dateText, size: metaSize, x: margin, y: dateY } : null,
    countdown,
    cta: ctaLabel ? { text: ctaLabel, size: ctaSize, x: margin, y: cursor, width: ctaWidth, height: ctaHeight, radius: Math.round(ctaHeight / 2) } : null,
    safeArea: isStory ? { top: STORY_SAFE_TOP_PX, bottom: STORY_SAFE_BOTTOM_PX } : null,
    typeScale: {
      ratio: scale.ratio,
      headline: fit.fontSize,
      subhead: subheadFit.fontSize,
      eyebrow: eyebrowSize,
      meta: metaSize,
      hierarchyRatio: hierarchyRatio === null ? null : Math.round(hierarchyRatio * 100) / 100,
    },
    contrast: {
      ratio: Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : null,
      accent: Number.isFinite(accentContrast) ? Math.round(accentContrast * 100) / 100 : null,
      ctaText: Number.isFinite(ctaTextContrast) ? Math.round(ctaTextContrast * 100) / 100 : null,
      verdict: contrastVerdict(ratio),
    },
    warnings,
    stats: { headlineChars: headline.length, headlineLines: fit.lines.length },
  };
}
