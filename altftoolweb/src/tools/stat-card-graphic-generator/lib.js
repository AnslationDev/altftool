/**
 * Stat card layout and number engine.
 *
 * The maths that matters here is the change calculation, because the two ways of
 * expressing it are routinely confused:
 *   relative change  = (current - previous) / |previous| * 100   -> "up 50%"
 *   percentage-point = current - previous                        -> "up 2 points"
 * A conversion rate moving from 4% to 6% is +2 percentage points and +50% relative.
 * Quoting the wrong one is the single most common error on a stat graphic, so this
 * module computes both and refuses to divide by a zero baseline.
 */

/* ------------------------------------------------------------------ canvas sizes */

export const CARD_PRESETS = [
  { id: "ig-square", label: "Instagram square", width: 1080, height: 1080, note: "1:1 carousel slide" },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, note: "4:5 feed post" },
  { id: "story", label: "Story / Reel", width: 1080, height: 1920, note: "9:16 full screen" },
  { id: "x-post", label: "X post", width: 1600, height: 900, note: "16:9 in-stream" },
  { id: "linkedin", label: "LinkedIn", width: 1200, height: 627, note: "1.91:1 link image" },
  { id: "wide-slide", label: "Deck slide", width: 1920, height: 1080, note: "16:9 presentation" },
];

export const STORY_SAFE_TOP_PX = 250;
export const STORY_SAFE_BOTTOM_PX = 420;

export const MARGIN_RATIO = 0.07;
export const MAX_STATS = 4;

/** Alpha the caption/label text is actually painted at (see pages/index.jsx canvas draw). */
export const LABEL_TEXT_OPACITY = 0.72;
/** Alpha the source line is actually painted at (see pages/index.jsx canvas draw). */
export const SOURCE_TEXT_OPACITY = 0.6;

/** Digits are near-monospaced in most UI sans faces: roughly 0.58em each. */
export const DIGIT_WIDTH_RATIO = 0.58;

/** A grid is laid out in columns when the cell area is at least this wide relative to tall. */
export const COLUMN_LAYOUT_ASPECT = 1.2;

/* ------------------------------------------------------------------ numbers */

/** Strip thousands separators before parsing, so "1,240,000" reads as a number. */
function parseNumericInput(value) {
  return Number(String(value ?? "").replace(/,/g, "").trim());
}

export const VALUE_FORMATS = [
  { id: "number", label: "Plain number" },
  { id: "compact", label: "Compact (1.2M)" },
  { id: "currency", label: "Currency" },
  { id: "percent", label: "Percentage" },
  { id: "text", label: "Free text" },
];

/**
 * Format a stat value.
 * @returns {{ text: string, error?: string }}
 */
export function formatStatValue({ value, format = "number", decimals = 0, currency = "USD", locale = "en-US", prefix = "", suffix = "" }) {
  const dp = Math.min(4, Math.max(0, Math.round(Number(decimals) || 0)));

  if (format === "text") {
    const text = String(value ?? "").trim();
    return { text: `${prefix}${text}${suffix}` };
  }

  const numeric = parseNumericInput(value);
  if (!Number.isFinite(numeric)) return { text: "", error: "That value is not a number." };

  let body;
  try {
    if (format === "compact") {
      body = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: Math.max(1, dp) }).format(numeric);
    } else if (format === "currency") {
      body = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: dp, minimumFractionDigits: dp }).format(numeric);
    } else if (format === "percent") {
      body = `${new Intl.NumberFormat(locale, { maximumFractionDigits: dp, minimumFractionDigits: dp }).format(numeric)}%`;
    } else {
      body = new Intl.NumberFormat(locale, { maximumFractionDigits: dp, minimumFractionDigits: dp }).format(numeric);
    }
  } catch {
    // Intl.NumberFormat throws a RangeError for a currency code that is not a
    // real ISO 4217 code (e.g. "US" typed while editing towards "USD"). Turn
    // that into the same friendly { error } path every other invalid input
    // already uses, instead of letting it crash the render.
    return {
      text: "",
      error:
        format === "currency"
          ? `"${currency}" is not a valid 3-letter currency code, e.g. USD, EUR, INR.`
          : "That value could not be formatted.",
    };
  }
  return { text: `${prefix}${body}${suffix}` };
}

/**
 * Relative change between two values, in percent.
 * @returns {{ percent: number|null, direction: "up"|"down"|"flat", note?: string }}
 */
export function relativeChange(previous, current) {
  const from = parseNumericInput(previous);
  const to = parseNumericInput(current);
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return { percent: null, direction: "flat", note: "Enter two numbers to compare." };
  }
  if (from === 0) {
    return {
      percent: null,
      direction: to > 0 ? "up" : to < 0 ? "down" : "flat",
      note: "A baseline of zero has no percentage change — quote the absolute figure instead.",
    };
  }
  const percent = ((to - from) / Math.abs(from)) * 100;
  return {
    percent,
    direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
    note: from < 0 ? "The baseline is negative, so the sign of the change can be misleading." : undefined,
  };
}

/** Difference in percentage points. Only meaningful when both figures are already percentages. */
export function percentagePointChange(previous, current) {
  const from = parseNumericInput(previous);
  const to = parseNumericInput(current);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return to - from;
}

/* ------------------------------------------------------------------ grid layout */

/**
 * Split a content box into `count` equal cells.
 * Four stats always go 2x2; two or three follow the aspect ratio of the box.
 * @returns {{ cells: {x:number,y:number,width:number,height:number}[], columns:number, rows:number }}
 */
export function gridLayout({ x, y, width, height, count, gap }) {
  const total = Math.min(MAX_STATS, Math.max(1, Math.round(count) || 1));
  const g = Math.max(0, Number(gap) || 0);

  let columns = 1;
  let rows = total;
  if (total === 4) {
    columns = 2;
    rows = 2;
  } else if (total > 1) {
    const boxAspect = height > 0 ? width / height : 1;
    if (boxAspect >= COLUMN_LAYOUT_ASPECT) {
      columns = total;
      rows = 1;
    }
  }

  const cellWidth = (width - g * (columns - 1)) / columns;
  const cellHeight = (height - g * (rows - 1)) / rows;
  const cells = [];
  for (let index = 0; index < total; index += 1) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    cells.push({
      x: x + col * (cellWidth + g),
      y: y + row * (cellHeight + g),
      width: cellWidth,
      height: cellHeight,
    });
  }
  return { cells, columns, rows };
}

/**
 * Largest font size at which a numeral string fits a given width, using the digit
 * advance ratio. Capped so a two-character stat does not become absurdly large.
 */
export function fitNumberSize(text, boxWidth, maxSize, measure) {
  const chars = String(text).length;
  if (chars === 0 || !(boxWidth > 0)) return 0;
  const cap = Math.max(1, Math.floor(Number(maxSize) || 1));
  if (typeof measure === "function") {
    for (let size = cap; size >= 8; size -= 1) {
      if (measure(String(text), size) <= boxWidth) return size;
    }
    return 8;
  }
  const byWidth = Math.floor(boxWidth / (chars * DIGIT_WIDTH_RATIO));
  return Math.max(8, Math.min(cap, byWidth));
}

/* ------------------------------------------------------------------ colour */

export const PALETTES = [
  { id: "ink", label: "Ink", bg: { h: 222, s: 47, l: 11 }, fg: { h: 210, s: 40, l: 98 }, accent: { h: 174, s: 80, l: 45 }, positive: { h: 152, s: 62, l: 52 }, negative: { h: 0, s: 72, l: 62 } },
  { id: "paper", label: "Paper", bg: { h: 40, s: 38, l: 95 }, fg: { h: 25, s: 30, l: 16 }, accent: { h: 18, s: 78, l: 48 }, positive: { h: 152, s: 55, l: 32 }, negative: { h: 0, s: 66, l: 44 } },
  { id: "teal", label: "Teal", bg: { h: 174, s: 78, l: 30 }, fg: { h: 180, s: 60, l: 98 }, accent: { h: 45, s: 96, l: 62 }, positive: { h: 88, s: 62, l: 68 }, negative: { h: 12, s: 84, l: 68 } },
  { id: "slate", label: "Slate", bg: { h: 215, s: 20, l: 94 }, fg: { h: 215, s: 30, l: 18 }, accent: { h: 221, s: 83, l: 53 }, positive: { h: 152, s: 55, l: 32 }, negative: { h: 0, s: 66, l: 44 } },
  { id: "midnight", label: "Midnight", bg: { h: 245, s: 40, l: 14 }, fg: { h: 250, s: 30, l: 97 }, accent: { h: 262, s: 84, l: 68 }, positive: { h: 160, s: 62, l: 56 }, negative: { h: 350, s: 76, l: 66 } },
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

/**
 * Alpha-composite `foreground` over `background` in sRGB space — the same
 * maths a canvas 2D context uses for `ctx.globalAlpha` — so contrast can be
 * checked against what is actually painted, not the full-opacity colour.
 */
export function blendHex(foreground, background, alpha) {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return foreground;
  const a = clampNumber(Number(alpha), 0, 1);
  const mix = (channel) => a * fg[channel] + (1 - a) * bg[channel];
  return `#${toHexPair(mix("r"))}${toHexPair(mix("g"))}${toHexPair(mix("b"))}`;
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

/* ------------------------------------------------------------------ the card */

export function findPreset(id) {
  return CARD_PRESETS.find((preset) => preset.id === id) || CARD_PRESETS[0];
}

export function findPalette(id) {
  return PALETTES.find((palette) => palette.id === id) || PALETTES[0];
}

/**
 * Build the stat card spec.
 *
 * @param {object} input
 * @param {Array} input.stats up to 4 of { value, format, decimals, currency, prefix, suffix, label, previous, isPercentMetric }
 * @returns {object} spec, or { error }
 */
export function buildStatCard(input = {}) {
  const rawStats = Array.isArray(input.stats) ? input.stats.slice(0, MAX_STATS) : [];
  const usable = rawStats.filter((stat) => String(stat.value ?? "").trim() !== "");
  if (usable.length === 0) return { error: "Enter at least one stat value." };

  const preset = findPreset(input.presetId);
  const palette = findPalette(input.paletteId);
  const background = parseHex(input.background) ? input.background : hslToHex(palette.bg);
  const foreground = parseHex(input.foreground) ? input.foreground : hslToHex(palette.fg);
  const accent = parseHex(input.accent) ? input.accent : hslToHex(palette.accent);
  const positive = hslToHex(palette.positive);
  const negative = hslToHex(palette.negative);

  const { width, height } = preset;
  const shortEdge = Math.min(width, height);
  const margin = Math.round(shortEdge * MARGIN_RATIO);
  const isStory = preset.id === "story";

  const headline = String(input.headline || "").trim();
  const source = String(input.source || "").trim();

  const topBound = isStory ? Math.max(margin, STORY_SAFE_TOP_PX) : margin;
  const bottomBound = isStory ? Math.max(margin, STORY_SAFE_BOTTOM_PX) : margin;

  const headlineSize = Math.round(shortEdge * 0.036);
  const headlineBlock = headline ? headlineSize * 1.6 : 0;
  const sourceSize = Math.round(shortEdge * 0.022);
  const sourceBlock = source ? sourceSize * 2.2 : 0;

  const gridY = topBound + headlineBlock;
  const gridHeight = height - topBound - bottomBound - headlineBlock - sourceBlock;
  if (gridHeight < shortEdge * 0.15) {
    return { error: "There is no room left for the stats on this canvas. Remove the headline or pick a taller size." };
  }

  const gap = Math.round(shortEdge * 0.04);
  const { cells, columns, rows } = gridLayout({
    x: margin,
    y: gridY,
    width: width - margin * 2,
    height: gridHeight,
    count: usable.length,
    gap,
  });

  const measure = input.measure;
  const items = [];
  let failedFormat = null;

  usable.forEach((stat, index) => {
    const cell = cells[index];
    const formatted = formatStatValue({
      value: stat.value,
      format: stat.format || "number",
      decimals: stat.decimals,
      currency: stat.currency,
      prefix: stat.prefix,
      suffix: stat.suffix,
      locale: input.locale,
    });
    if (formatted.error && !failedFormat) failedFormat = `Stat ${index + 1}: ${formatted.error}`;

    const label = String(stat.label || "").trim();
    const labelSize = Math.round(shortEdge * (usable.length > 2 ? 0.024 : 0.03));
    const deltaSize = Math.round(shortEdge * (usable.length > 2 ? 0.022 : 0.028));

    const hasPrevious = String(stat.previous ?? "").trim() !== "";
    const change = hasPrevious ? relativeChange(stat.previous, stat.value) : null;
    const points = hasPrevious && stat.isPercentMetric ? percentagePointChange(stat.previous, stat.value) : null;

    const maxNumberSize = Math.round(Math.min(cell.height * 0.55, shortEdge * (usable.length === 1 ? 0.26 : 0.16)));
    const numberSize = fitNumberSize(formatted.text, cell.width, maxNumberSize, measure);

    const blockHeight = numberSize * 1.05 + (label ? labelSize * 1.6 : 0) + (change ? deltaSize * 1.8 : 0);
    const blockTop = cell.y + Math.max(0, (cell.height - blockHeight) / 2);

    let deltaText = "";
    if (change) {
      if (change.percent === null) {
        deltaText = "no baseline";
      } else {
        const arrow = change.direction === "up" ? "▲" : change.direction === "down" ? "▼" : "■";
        const magnitude = Math.abs(change.percent);
        deltaText = `${arrow} ${magnitude.toFixed(magnitude >= 100 ? 0 : 1)}%`;
        if (points !== null) deltaText += ` (${points >= 0 ? "+" : "−"}${Math.abs(points).toFixed(1)} pts)`;
      }
    }

    items.push({
      cell,
      valueText: formatted.text,
      numberSize,
      label,
      labelSize,
      deltaText,
      deltaSize,
      // A flat/zero change is neither growth nor decline, so it is painted in
      // the (already contrast-checked) foreground colour rather than the
      // "positive" green — a stalled metric should not read as good news.
      deltaColour: !change
        ? positive
        : change.direction === "down"
          ? negative
          : change.direction === "flat"
            ? foreground
            : positive,
      change,
      points,
      numberY: blockTop + numberSize,
      labelY: blockTop + numberSize + labelSize * 1.3,
      deltaY: blockTop + numberSize + (label ? labelSize * 1.6 : 0) + deltaSize * 1.3,
      centreX: cell.x + cell.width / 2,
    });
  });

  if (failedFormat) return { error: failedFormat };

  const ratio = contrastRatio(foreground, background);
  const accentRatio = contrastRatio(accent, background);
  // The label and source line are painted at reduced opacity (see
  // LABEL_TEXT_OPACITY / SOURCE_TEXT_OPACITY), which lowers their real
  // contrast against the background — check the alpha-blended colour that is
  // actually rendered, not the full-opacity foreground.
  const labelRatio = contrastRatio(blendHex(foreground, background, LABEL_TEXT_OPACITY), background);
  const sourceRatio = contrastRatio(blendHex(foreground, background, SOURCE_TEXT_OPACITY), background);
  // The trend colours are painted at full opacity but were never checked
  // against the background at all.
  const positiveRatio = contrastRatio(positive, background);
  const negativeRatio = contrastRatio(negative, background);

  return {
    preset,
    width,
    height,
    margin,
    background,
    foreground,
    accent,
    positive,
    negative,
    headline: headline ? { text: headline, size: headlineSize, x: width / 2, y: topBound + headlineSize } : null,
    source: source ? { text: source, size: sourceSize, x: width / 2, y: height - bottomBound } : null,
    items,
    columns,
    rows,
    safeArea: isStory ? { top: STORY_SAFE_TOP_PX, bottom: STORY_SAFE_BOTTOM_PX } : null,
    contrast: {
      ratio: Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : null,
      accentRatio: Number.isFinite(accentRatio) ? Math.round(accentRatio * 100) / 100 : null,
      verdict: contrastVerdict(ratio),
      labelRatio: Number.isFinite(labelRatio) ? Math.round(labelRatio * 100) / 100 : null,
      labelVerdict: contrastVerdict(labelRatio),
      sourceRatio: Number.isFinite(sourceRatio) ? Math.round(sourceRatio * 100) / 100 : null,
      sourceVerdict: contrastVerdict(sourceRatio),
      positiveRatio: Number.isFinite(positiveRatio) ? Math.round(positiveRatio * 100) / 100 : null,
      positiveVerdict: contrastVerdict(positiveRatio),
      negativeRatio: Number.isFinite(negativeRatio) ? Math.round(negativeRatio * 100) / 100 : null,
      negativeVerdict: contrastVerdict(negativeRatio),
    },
    stats: { count: usable.length, largestNumberSize: items.reduce((max, item) => Math.max(max, item.numberSize), 0) },
  };
}
