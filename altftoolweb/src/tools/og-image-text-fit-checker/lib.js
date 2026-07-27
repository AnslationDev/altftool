/**
 * Open Graph / social share card text fitting.
 *
 * Text width is estimated from the published Helvetica AFM advance widths, expressed in units per
 * 1000 of the em square. Arial is metrically compatible with Helvetica, and Inter, Roboto and the
 * common system UI stacks sit within a few percent of them at these sizes, so the estimate is a
 * good proxy for any neutral grotesque. It is an estimate, not a substitute for rendering the
 * real font: scripts with complex shaping, condensed faces and heavy tracking will differ.
 *
 *   width(px) = sum(advance units) / 1000 x font size(px)
 */

/** Helvetica (Arial-compatible) regular advance widths, units per 1000 em. */
export const ADVANCE_REGULAR = {
  " ": 278, "!": 278, '"': 355, "#": 556, $: 556, "%": 889, "&": 667, "'": 191,
  "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556,
  ":": 278, ";": 278, "<": 584, "=": 584, ">": 584, "?": 556, "@": 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500,
  K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611,
  U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  "[": 278, "\\": 278, "]": 278, "^": 469, _: 556, "`": 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222,
  k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278,
  u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  "{": 334, "|": 260, "}": 334, "~": 584,
};

/** Helvetica-Bold advance widths, units per 1000 em. */
export const ADVANCE_BOLD = {
  " ": 278, "!": 333, '"': 474, "#": 556, $: 556, "%": 889, "&": 722, "'": 238,
  "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556,
  ":": 333, ";": 333, "<": 584, "=": 584, ">": 584, "?": 611, "@": 975,
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556,
  K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611,
  U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  "[": 333, "\\": 278, "]": 333, "^": 584, _: 556, "`": 333,
  a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278,
  k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333,
  u: 611, v: 556, w: 778, x: 556, y: 556, z: 500,
  "{": 389, "|": 280, "}": 389, "~": 584,
};

/** Fallback advance for characters outside the table (accented letters, CJK punctuation, emoji). */
export const FALLBACK_ADVANCE_REGULAR = 556;
export const FALLBACK_ADVANCE_BOLD = 611;

export const WEIGHTS = [
  { value: "regular", label: "Regular / medium" },
  { value: "bold", label: "Bold / semibold" },
];

/**
 * Practical legibility floor for rendered text in a feed. There is no WCAG minimum font size;
 * 12 CSS pixels is the point below which UI copy is widely considered uncomfortable to read.
 */
export const MIN_LEGIBLE_PX = 12;

/** Comfortable floor — text at or above this reads cleanly even on a phone in a busy feed. */
export const COMFORTABLE_PX = 16;

/**
 * Card sizes and the width each platform typically renders the unfurled card at in a feed.
 * Render widths are approximate and change with layout, window size and device.
 */
export const PLATFORM_PRESETS = [
  { id: "og", label: "Open Graph / Facebook", width: 1200, height: 630, renderWidth: 470 },
  { id: "x", label: "X summary_large_image", width: 1200, height: 628, renderWidth: 504 },
  { id: "linkedin", label: "LinkedIn share", width: 1200, height: 627, renderWidth: 552 },
  { id: "slack", label: "Slack unfurl", width: 1200, height: 630, renderWidth: 360 },
  { id: "chat", label: "WhatsApp / iMessage bubble", width: 1200, height: 630, renderWidth: 300 },
];

/**
 * Aspect ratios different surfaces centre-crop a share card to. The intersection of all of them
 * is the region guaranteed to survive everywhere, so headline text should stay inside it.
 */
export const CROP_RATIOS = [
  { label: "1.91:1 (Open Graph)", ratio: 1.91 },
  { label: "2:1 (X large card)", ratio: 2 },
  { label: "1.5:1 (some feeds)", ratio: 1.5 },
  { label: "1:1 (square thumbnail)", ratio: 1 },
];

/** Helvetica AFM CapHeight is 718 units per 1000 em; used to place baselines optically. */
export const CAP_HEIGHT = 0.718;

export const CARD_MIN = 200;
export const CARD_MAX = 4000;
export const FONT_MIN = 8;
export const FONT_MAX = 400;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Advance width of a single character in units per 1000 em. */
export function advanceOf(char, weight = "regular") {
  const table = weight === "bold" ? ADVANCE_BOLD : ADVANCE_REGULAR;
  const fallback = weight === "bold" ? FALLBACK_ADVANCE_BOLD : FALLBACK_ADVANCE_REGULAR;
  const width = table[char];
  return typeof width === "number" ? width : fallback;
}

/** Estimated rendered width of a string, in pixels. */
export function measureText(text, fontSizePx, weight = "regular") {
  if (typeof text !== "string" || text.length === 0) return 0;
  if (!Number.isFinite(fontSizePx) || fontSizePx <= 0) return 0;
  let units = 0;
  for (const char of text) units += advanceOf(char, weight);
  return (units / 1000) * fontSizePx;
}

/** Greedy word wrap. Words wider than the box are hard-broken so nothing overflows silently. */
export function wrapText(text, maxWidthPx, fontSizePx, weight = "regular") {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean === "") return [];
  if (!(maxWidthPx > 0) || !(fontSizePx > 0)) return [clean];

  const lines = [];
  let current = "";

  const pushWord = (word) => {
    if (measureText(word, fontSizePx, weight) <= maxWidthPx) {
      const candidate = current === "" ? word : `${current} ${word}`;
      if (measureText(candidate, fontSizePx, weight) <= maxWidthPx) {
        current = candidate;
      } else {
        if (current !== "") lines.push(current);
        current = word;
      }
      return;
    }
    // Word alone is wider than the box: break it character by character.
    if (current !== "") {
      lines.push(current);
      current = "";
    }
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (chunk !== "" && measureText(next, fontSizePx, weight) > maxWidthPx) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    current = chunk;
  };

  for (const word of clean.split(" ")) pushWord(word);
  if (current !== "") lines.push(current);
  return lines;
}

/** Centre-cropped box for a given target aspect ratio. */
export function centreCrop(width, height, ratio) {
  if (!(width > 0) || !(height > 0) || !(ratio > 0)) return { width: 0, height: 0 };
  if (width / height > ratio) return { width: height * ratio, height };
  return { width, height: width / ratio };
}

/**
 * Full check for a share card headline.
 * @returns metrics object, or { error } for input that cannot be evaluated.
 */
export function checkOgText(options = {}) {
  const {
    width = 1200,
    height = 630,
    headline = "",
    subtext = "",
    fontSize = 64,
    subFontSize = 32,
    weight = "bold",
    lineHeight = 1.2,
    paddingX = 80,
    paddingY = 72,
    maxLines = 3,
    renderWidth = 470,
  } = options;

  const nums = { width, height, fontSize, subFontSize, lineHeight, paddingX, paddingY, maxLines, renderWidth };
  for (const [key, value] of Object.entries(nums)) {
    if (!Number.isFinite(Number(value))) return { error: `Enter a valid number for ${key}.` };
  }

  const w = Number(width);
  const h = Number(height);
  if (w < CARD_MIN || w > CARD_MAX || h < CARD_MIN || h > CARD_MAX) {
    return { error: `Card width and height must be between ${CARD_MIN} and ${CARD_MAX} pixels.` };
  }

  const fs = Number(fontSize);
  const sfs = Number(subFontSize);
  if (fs < FONT_MIN || fs > FONT_MAX) {
    return { error: `Headline size must be between ${FONT_MIN} and ${FONT_MAX} pixels.` };
  }
  if (sfs < 0 || sfs > FONT_MAX) {
    return { error: `Sub-headline size must be between 0 and ${FONT_MAX} pixels.` };
  }

  const lh = Number(lineHeight);
  if (lh < 0.8 || lh > 3) return { error: "Line height should be between 0.8 and 3." };

  const px = Number(paddingX);
  const py = Number(paddingY);
  if (px < 0 || py < 0) return { error: "Padding cannot be negative." };
  if (px * 2 >= w || py * 2 >= h) {
    return { error: "Padding leaves no room for text — reduce it or make the card larger." };
  }

  const limit = Math.round(Number(maxLines));
  if (limit < 1 || limit > 12) return { error: "Maximum lines should be between 1 and 12." };

  const rw = Number(renderWidth);
  if (rw < 80 || rw > 2000) return { error: "Rendered feed width should be between 80 and 2000 pixels." };

  const text = String(headline ?? "").replace(/\s+/g, " ").trim();
  if (text === "") return { error: "Enter the headline that will appear on the card." };

  const face = weight === "bold" ? "bold" : "regular";
  const contentWidth = w - px * 2;
  const contentHeight = h - py * 2;

  const lines = wrapText(text, contentWidth, fs, face);
  const lineWidths = lines.map((line) => round(measureText(line, fs, face), 1));
  const widestLine = lineWidths.length > 0 ? Math.max(...lineWidths) : 0;
  const headlineHeight = lines.length * fs * lh;

  const subLines = sfs > 0 ? wrapText(subtext, contentWidth, sfs, "regular") : [];
  const subHeight = subLines.length * sfs * lh;
  const gap = subLines.length > 0 ? fs * 0.5 : 0;
  const blockHeight = headlineHeight + gap + subHeight;

  // Largest whole-pixel headline size that still fits the line limit and the content box.
  let bestFontSize = 0;
  for (let size = FONT_MIN; size <= Math.min(FONT_MAX, contentHeight); size += 1) {
    const trial = wrapText(text, contentWidth, size, face);
    const trialSub = sfs > 0 ? wrapText(subtext, contentWidth, sfs, "regular") : [];
    const trialGap = trialSub.length > 0 ? size * 0.5 : 0;
    const trialHeight = trial.length * size * lh + trialGap + trialSub.length * sfs * lh;
    if (trial.length <= limit && trialHeight <= contentHeight) bestFontSize = size;
  }

  const scale = rw / w;
  const renderedHeadlinePx = fs * scale;
  const renderedSubPx = sfs * scale;

  const crops = CROP_RATIOS.map((crop) => {
    const box = centreCrop(w, h, crop.ratio);
    return {
      label: crop.label,
      ratio: crop.ratio,
      width: round(box.width, 1),
      height: round(box.height, 1),
      fitsWidth: widestLine <= box.width,
      fitsHeight: blockHeight <= box.height,
    };
  });
  const safeWidth = Math.min(...crops.map((crop) => crop.width));
  const safeHeight = Math.min(...crops.map((crop) => crop.height));

  const issues = [];
  if (lines.length > limit) {
    issues.push(
      `The headline wraps onto ${lines.length} lines but you allowed ${limit}. Drop to ${bestFontSize || FONT_MIN} px, shorten the copy, or raise the line limit.`,
    );
  }
  if (blockHeight > contentHeight) {
    issues.push(
      `The text block is ${round(blockHeight)} px tall inside a ${round(contentHeight)} px content area, so it overflows the card.`,
    );
  }
  if (renderedHeadlinePx < MIN_LEGIBLE_PX) {
    issues.push(
      `At a ${round(rw)} px feed width the headline renders at about ${round(renderedHeadlinePx, 1)} px, below the ${MIN_LEGIBLE_PX} px practical floor. Increase the headline size or use fewer words.`,
    );
  } else if (renderedHeadlinePx < COMFORTABLE_PX) {
    issues.push(
      `The headline renders at about ${round(renderedHeadlinePx, 1)} px in the feed — readable but tight. Aim for ${COMFORTABLE_PX} px or more.`,
    );
  }
  if (sfs > 0 && subLines.length > 0 && renderedSubPx < MIN_LEGIBLE_PX) {
    issues.push(
      `The sub-headline renders at about ${round(renderedSubPx, 1)} px in the feed, which most people will not read. Consider dropping it entirely.`,
    );
  }
  if (widestLine > safeWidth || blockHeight > safeHeight) {
    issues.push(
      `Text extends outside the ${round(safeWidth)} x ${round(safeHeight)} px area that survives every common centre-crop. Pull the copy further in if square thumbnails matter.`,
    );
  }

  // Text block is left-aligned at the padding edge and optically centred in the content box.
  const blockTop = py + (contentHeight - blockHeight) / 2;
  const headlineLayout = lines.map((line, index) => ({
    text: line,
    x: round(px, 1),
    y: round(blockTop + index * fs * lh + (fs * lh + fs * CAP_HEIGHT) / 2, 1),
  }));
  const subTop = blockTop + headlineHeight + gap;
  const subLayout = subLines.map((line, index) => ({
    text: line,
    x: round(px, 1),
    y: round(subTop + index * sfs * lh + (sfs * lh + sfs * CAP_HEIGHT) / 2, 1),
  }));

  return {
    width: w,
    height: h,
    aspectRatio: round(w / h, 3),
    layout: {
      headline: headlineLayout,
      sub: subLayout,
      contentBox: { x: round(px, 1), y: round(py, 1), width: round(contentWidth, 1), height: round(contentHeight, 1) },
      safeBox: {
        x: round((w - safeWidth) / 2, 1),
        y: round((h - safeHeight) / 2, 1),
        width: round(safeWidth, 1),
        height: round(safeHeight, 1),
      },
      headlineFontSize: round(fs, 2),
      subFontSize: round(sfs, 2),
      weight: face,
    },
    contentWidth: round(contentWidth, 1),
    contentHeight: round(contentHeight, 1),
    lines,
    lineWidths,
    lineCount: lines.length,
    maxLines: limit,
    widestLine: round(widestLine, 1),
    fillShare: round(widestLine / contentWidth, 4),
    headlineHeight: round(headlineHeight, 1),
    subLines,
    subHeight: round(subHeight, 1),
    blockHeight: round(blockHeight, 1),
    bestFontSize,
    renderWidth: rw,
    renderScale: round(scale, 4),
    renderedHeadlinePx: round(renderedHeadlinePx, 1),
    renderedSubPx: round(renderedSubPx, 1),
    crops,
    safeWidth: round(safeWidth, 1),
    safeHeight: round(safeHeight, 1),
    fits: lines.length <= limit && blockHeight <= contentHeight,
    legible: renderedHeadlinePx >= MIN_LEGIBLE_PX,
    issues,
    verdict:
      lines.length <= limit && blockHeight <= contentHeight && renderedHeadlinePx >= COMFORTABLE_PX
        ? "pass"
        : "review",
  };
}

/** Plain-text summary for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "OG image text fit check",
    `Card: ${result.width} x ${result.height} px (${result.aspectRatio}:1)`,
    `Headline wraps to ${result.lineCount} line(s); limit ${result.maxLines}`,
    `Widest line: ${result.widestLine} px of ${result.contentWidth} px available`,
    `Text block height: ${result.blockHeight} px of ${result.contentHeight} px available`,
    `Rendered at ${result.renderWidth} px feed width: headline about ${result.renderedHeadlinePx} px`,
    `Largest headline size that still fits: ${result.bestFontSize} px`,
    `Safe area across all crops: ${result.safeWidth} x ${result.safeHeight} px`,
  ];
  result.lines.forEach((line, index) => lines.push(`  ${index + 1}. ${line}`));
  for (const issue of result.issues) lines.push(`- ${issue}`);
  return lines.join("\n");
}
