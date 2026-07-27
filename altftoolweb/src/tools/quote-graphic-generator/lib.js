/**
 * Quote graphic layout engine.
 *
 * Two pieces of real maths live here:
 *  1. Type fitting — greedy word wrap plus a downward search for the largest font size
 *     whose wrapped lines still fit the text box.
 *  2. Colour contrast — WCAG 2.1 relative luminance and contrast ratio, so the tool can
 *     tell you whether the quote is actually readable on the background you picked.
 */

/* ------------------------------------------------------------------ canvas sizes */

/**
 * Published pixel dimensions for each placement. Sources: Instagram feed accepts
 * 1080x1080 (1:1) and 1080x1350 (4:5, the tallest feed crop); stories and Reels are
 * 1080x1920 (9:16); X in-stream images render at 16:9; LinkedIn and Facebook link
 * images are 1200x627 and 1200x630; Pinterest recommends a 2:3 pin at 1000x1500.
 */
export const SOCIAL_PRESETS = [
  { id: "ig-square", label: "Instagram square", width: 1080, height: 1080, note: "1:1 feed post" },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, note: "4:5, the tallest feed crop" },
  { id: "story", label: "Story / Reel", width: 1080, height: 1920, note: "9:16 full screen" },
  { id: "x-post", label: "X post", width: 1600, height: 900, note: "16:9 in-stream" },
  { id: "linkedin", label: "LinkedIn", width: 1200, height: 627, note: "1.91:1 link image" },
  { id: "facebook", label: "Facebook", width: 1200, height: 630, note: "1.91:1 link image" },
  { id: "pinterest", label: "Pinterest pin", width: 1000, height: 1500, note: "2:3 standard pin" },
];

/**
 * Instagram overlays its own UI on stories: roughly the top 250px and bottom 420px of a
 * 1080x1920 canvas. Keep type inside the middle band or the app will cover it.
 */
export const STORY_SAFE_TOP_PX = 250;
export const STORY_SAFE_BOTTOM_PX = 420;

/** Outer margin as a fraction of the shorter canvas edge. 8% reads as a deliberate frame. */
export const MARGIN_RATIO = 0.08;

/** Line height as a multiple of font size for display-sized quote type. */
export const QUOTE_LINE_HEIGHT_RATIO = 1.28;

/** Font-size search bounds, expressed as a fraction of the shorter canvas edge. */
export const MAX_FONT_RATIO = 0.115;
export const MIN_FONT_RATIO = 0.028;

/** Mean glyph advance for a humanist sans at mixed case, as a fraction of font size. */
export const AVG_GLYPH_WIDTH_RATIO = 0.52;

/** A quote longer than this stops working as a graphic and belongs in the caption. */
export const MAX_QUOTE_CHARS = 300;

/* ------------------------------------------------------------------ colour */

/** Preset palettes as HSL triples so no colour is hard-coded as an opaque hex string. */
export const PALETTES = [
  { id: "ink", label: "Ink", bg: { h: 222, s: 47, l: 11 }, fg: { h: 210, s: 40, l: 98 }, accent: { h: 174, s: 80, l: 45 } },
  { id: "teal", label: "Teal", bg: { h: 174, s: 80, l: 32 }, fg: { h: 180, s: 60, l: 98 }, accent: { h: 187, s: 92, l: 69 } },
  { id: "paper", label: "Paper", bg: { h: 40, s: 38, l: 95 }, fg: { h: 25, s: 30, l: 16 }, accent: { h: 18, s: 78, l: 48 } },
  { id: "plum", label: "Plum", bg: { h: 280, s: 46, l: 22 }, fg: { h: 300, s: 30, l: 97 }, accent: { h: 322, s: 84, l: 66 } },
  { id: "sky", label: "Sky", bg: { h: 205, s: 90, l: 42 }, fg: { h: 200, s: 60, l: 99 }, accent: { h: 45, s: 96, l: 62 } },
  { id: "forest", label: "Forest", bg: { h: 152, s: 40, l: 18 }, fg: { h: 140, s: 30, l: 96 }, accent: { h: 88, s: 62, l: 60 } },
];

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));

const toHexPair = (value) => {
  const byte = clampNumber(Math.round(value), 0, 255);
  return byte.toString(16).padStart(2, "0");
};

/** HSL (h in degrees, s and l in percent) to a CSS hex string. */
export function hslToHex({ h, s, l }) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clampNumber(Number(s), 0, 100) / 100;
  const light = clampNumber(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  const sextant = Math.floor(hue / 60) % 6;
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = table[sextant];
  return `#${toHexPair((r + m) * 255)}${toHexPair((g + m) * 255)}${toHexPair((b + m) * 255)}`;
}

/** Parse #rgb or #rrggbb into channel values 0-255. Returns null when unparseable. */
export function parseHex(value) {
  const raw = String(value || "").trim().replace(/^#/, "");
  if (raw.length === 3) {
    const [r, g, b] = raw.split("");
    if (!/^[0-9a-f]{3}$/i.test(raw)) return null;
    return { r: parseInt(r + r, 16), g: parseInt(g + g, 16), b: parseInt(b + b, 16) };
  }
  if (raw.length === 6 && /^[0-9a-f]{6}$/i.test(raw)) {
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
    };
  }
  return null;
}

/** WCAG 2.1 relative luminance. Channel is linearised at the 0.03928 breakpoint. */
export function relativeLuminance(colour) {
  const rgb = parseHex(colour);
  if (!rgb) return null;
  const channel = (raw) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** WCAG 2.1 contrast ratio: (Llighter + 0.05) / (Ldarker + 0.05). Range 1 to 21. */
export function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  if (a === null || b === null) return null;
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA thresholds: 4.5:1 for body text, 3:1 for large text (>=24px or >=18.66px bold). */
export const AA_NORMAL_RATIO = 4.5;
export const AA_LARGE_RATIO = 3;

export function contrastVerdict(ratio) {
  if (!Number.isFinite(ratio)) return { level: "unknown", label: "Contrast unknown" };
  if (ratio >= 7) return { level: "aaa", label: "Passes AAA (7:1)" };
  if (ratio >= AA_NORMAL_RATIO) return { level: "aa", label: "Passes AA (4.5:1)" };
  if (ratio >= AA_LARGE_RATIO) return { level: "aa-large", label: "Passes AA for large text only (3:1)" };
  return { level: "fail", label: "Fails AA — text will be hard to read" };
}

/* ------------------------------------------------------------------ type fitting */

/** Width estimate with no DOM, used as the default measurer and in tests. */
export function estimateWidth(text, fontSize) {
  return String(text).length * fontSize * AVG_GLYPH_WIDTH_RATIO;
}

/**
 * Greedy word wrap.
 * @param {string} text
 * @param {number} maxWidth in px
 * @param {(chunk: string) => number} measure width of a chunk at the target font size
 */
export function wrapText(text, maxWidth, measure) {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0 || !(maxWidth > 0)) return [];
  const lines = [];
  let current = "";

  const pushWordChunks = (word) => {
    // A single word wider than the box: break it by characters so nothing overflows.
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
      continue;
    }
    if (current) lines.push(current);
    if (measure(word) > maxWidth) {
      current = pushWordChunks(word);
    } else {
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Find the largest font size in [minFontSize, maxFontSize] whose wrapped lines fit
 * inside boxWidth x boxHeight. Steps down 1px at a time, which is exact and cheap
 * for the ~100 candidate sizes involved.
 */
export function fitTextBlock({
  text,
  boxWidth,
  boxHeight,
  minFontSize,
  maxFontSize,
  lineHeightRatio = QUOTE_LINE_HEIGHT_RATIO,
  measure = estimateWidth,
}) {
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
    if (blockHeight <= height) {
      return { fontSize: size, lines, lineHeight, blockHeight, overflow: false };
    }
  }

  const lines = wrapText(body, width, (chunk) => measure(chunk, min));
  const lineHeight = min * lineHeightRatio;
  return { fontSize: min, lines, lineHeight, blockHeight: lines.length * lineHeight, overflow: true };
}

/* ------------------------------------------------------------------ the graphic */

export function findPreset(id) {
  return SOCIAL_PRESETS.find((preset) => preset.id === id) || SOCIAL_PRESETS[0];
}

export function findPalette(id) {
  return PALETTES.find((palette) => palette.id === id) || PALETTES[0];
}

/**
 * Produce the full drawing spec for a quote graphic.
 *
 * @param {object} input
 * @param {string} input.quote
 * @param {string} [input.author]
 * @param {string} [input.handle]
 * @param {string} input.presetId
 * @param {string} [input.background] hex, overrides the palette
 * @param {string} [input.foreground] hex, overrides the palette
 * @param {string} [input.accent] hex, overrides the palette
 * @param {boolean} [input.showQuoteMark]
 * @param {"left"|"center"} [input.align]
 * @param {(chunk: string, fontSize: number) => number} [input.measure]
 * @returns {object} drawing spec, or { error } for input that cannot be laid out.
 */
export function buildQuoteGraphic(input = {}) {
  const quote = String(input.quote || "").trim();
  if (!quote) return { error: "Type a quote to see the graphic." };
  if (quote.length > MAX_QUOTE_CHARS) {
    return {
      error: `That quote is ${quote.length} characters. Over ${MAX_QUOTE_CHARS} it cannot be set large enough to read on a phone — trim it or move it to the caption.`,
    };
  }

  const preset = findPreset(input.presetId);
  const palette = findPalette(input.paletteId);
  const background = parseHex(input.background) ? input.background : hslToHex(palette.bg);
  const foreground = parseHex(input.foreground) ? input.foreground : hslToHex(palette.fg);
  const accent = parseHex(input.accent) ? input.accent : hslToHex(palette.accent);

  const { width, height } = preset;
  const shortEdge = Math.min(width, height);
  const margin = Math.round(shortEdge * MARGIN_RATIO);

  const isStory = preset.id === "story";
  const topBound = isStory ? Math.max(margin, STORY_SAFE_TOP_PX) : margin;
  const bottomBound = isStory ? Math.max(margin, STORY_SAFE_BOTTOM_PX) : margin;

  const boxX = margin;
  const boxWidth = width - margin * 2;
  const contentTop = topBound;
  const contentHeight = height - topBound - bottomBound;

  const author = String(input.author || "").trim();
  const handle = String(input.handle || "").trim();
  const align = input.align === "center" ? "center" : "left";
  const showQuoteMark = input.showQuoteMark !== false;

  // Vertical budget: quote mark, then the quote, then the attribution block.
  const quoteMarkSize = showQuoteMark ? Math.round(shortEdge * 0.13) : 0;
  const quoteMarkGap = showQuoteMark ? Math.round(shortEdge * 0.02) : 0;
  const attributionSize = Math.round(shortEdge * 0.032);
  const attributionLines = (author ? 1 : 0) + (handle ? 1 : 0);
  const attributionBlock = attributionLines > 0 ? attributionLines * attributionSize * 1.45 + Math.round(shortEdge * 0.045) : 0;

  const quoteBoxHeight = contentHeight - quoteMarkSize - quoteMarkGap - attributionBlock;
  if (quoteBoxHeight < shortEdge * 0.1) {
    return { error: "There is not enough room on this canvas for the quote plus attribution. Turn the quote mark off or pick a taller size." };
  }

  const fit = fitTextBlock({
    text: quote,
    boxWidth,
    boxHeight: quoteBoxHeight,
    minFontSize: Math.round(shortEdge * MIN_FONT_RATIO),
    maxFontSize: Math.round(shortEdge * MAX_FONT_RATIO),
    lineHeightRatio: QUOTE_LINE_HEIGHT_RATIO,
    measure: input.measure,
  });

  const quoteTop = contentTop + quoteMarkSize + quoteMarkGap;
  const ratio = contrastRatio(foreground, background);
  const accentRatio = contrastRatio(accent, background);

  return {
    preset,
    width,
    height,
    margin,
    background,
    foreground,
    accent,
    align,
    showQuoteMark,
    quoteMark: { size: quoteMarkSize, x: align === "center" ? width / 2 : boxX, y: contentTop + quoteMarkSize * 0.78 },
    quote: {
      lines: fit.lines,
      fontSize: fit.fontSize,
      lineHeight: fit.lineHeight,
      x: align === "center" ? width / 2 : boxX,
      top: quoteTop,
      blockHeight: fit.blockHeight,
      overflow: fit.overflow,
    },
    attribution: {
      author,
      handle,
      fontSize: attributionSize,
      x: align === "center" ? width / 2 : boxX,
      top: quoteTop + fit.blockHeight + Math.round(shortEdge * 0.045),
    },
    rule: {
      x: align === "center" ? width / 2 - Math.round(shortEdge * 0.05) : boxX,
      y: quoteTop + fit.blockHeight + Math.round(shortEdge * 0.022),
      width: Math.round(shortEdge * 0.1),
      height: Math.max(3, Math.round(shortEdge * 0.006)),
    },
    safeArea: isStory ? { top: STORY_SAFE_TOP_PX, bottom: STORY_SAFE_BOTTOM_PX } : null,
    contrast: {
      ratio: Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : null,
      accentRatio: Number.isFinite(accentRatio) ? Math.round(accentRatio * 100) / 100 : null,
      verdict: contrastVerdict(ratio),
    },
    stats: {
      characters: quote.length,
      words: quote.split(/\s+/).filter(Boolean).length,
      lineCount: fit.lines.length,
      megapixels: Math.round(((width * height) / 1_000_000) * 100) / 100,
    },
  };
}
