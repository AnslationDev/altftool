/**
 * Canva AI prompt builder — pure logic.
 *
 * Two things happen here:
 *  1. Canvas geometry. Every format below is a real Canva preset size in pixels.
 *     Aspect ratio is reduced with the Euclidean greatest common divisor, and print
 *     formats are converted to physical millimetres at their print resolution.
 *  2. A copy budget. Rather than guessing "keep it short", the character limits for
 *     headline, subheadline and call to action are derived from a legibility rule
 *     (see LEGIBILITY notes below) using the smallest size at which the finished
 *     design is normally seen.
 *
 * No React, no DOM, no clock reads — same input always gives the same output.
 */

/** Standard press resolution for artwork sent to a commercial printer. */
export const PRINT_DPI = 300;

/** Exact inch-to-millimetre conversion (international inch, 1959). */
export const MM_PER_INCH = 25.4;

/**
 * CSS reference pixel density. One CSS inch is defined as 96 CSS pixels in the
 * CSS Values and Units specification, so a printed piece held at reading distance
 * is treated as if it were shown at 96 px per inch on screen.
 */
export const CSS_PX_PER_INCH = 96;

/**
 * LEGIBILITY — the three constants the copy budget is built from.
 *
 * MIN_RENDERED_TEXT_PX: 16 px is the long-standing floor for comfortable body text
 * on screen; supporting copy that renders smaller than this in the feed is unreadable.
 * A headline is given twice that so it still reads as a headline at the smallest size.
 *
 * AVG_GLYPH_ADVANCE_EM: for a bold humanist sans (Canva's default families, e.g.
 * Canva Sans / Open Sans), the average advance width across mixed-case English text
 * is close to half the type size, so 0.5 em is used as the per-character width.
 *
 * SAFE_MARGIN_FRACTION: Canva's own print bleed and social "safe area" guidance keeps
 * content roughly 7% in from each edge, leaving 86% of the width usable for text.
 */
export const MIN_RENDERED_TEXT_PX = 16;
export const HEADLINE_RENDER_MULTIPLIER = 2;
export const AVG_GLYPH_ADVANCE_EM = 0.5;
export const SAFE_MARGIN_FRACTION = 0.07;

/** A headline is allowed two lines; supporting copy is allowed three. */
export const HEADLINE_MAX_LINES = 2;
export const SUBHEAD_MAX_LINES = 3;

/**
 * Call to action ceiling. Button labels are conventionally two to four words; 25
 * characters is the point at which a Canva button label starts wrapping or shrinking
 * on a mobile-sized render, so it is used as a hard cap independent of canvas size.
 */
export const CTA_MAX_CHARS = 25;

/**
 * Canva preset canvases.
 *
 * `minRenderWidth` is the smallest width, in CSS pixels, at which the finished design
 * is normally seen by its audience — a YouTube thumbnail in a grid is about 210 px
 * wide, an Instagram feed post about 470 px, a slide shared in a video call about
 * 640 px. Print formats leave it out; it is derived from the physical size instead.
 */
export const CANVA_FORMATS = [
  {
    id: "instagram-post",
    label: "Instagram Post (square)",
    width: 1080,
    height: 1080,
    medium: "screen",
    minRenderWidth: 470,
  },
  {
    id: "instagram-story",
    label: "Instagram Story / Reel cover",
    width: 1080,
    height: 1920,
    medium: "screen",
    minRenderWidth: 390,
  },
  {
    id: "youtube-thumbnail",
    label: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    medium: "screen",
    minRenderWidth: 210,
  },
  {
    id: "presentation-16-9",
    label: "Presentation (16:9)",
    width: 1920,
    height: 1080,
    medium: "screen",
    minRenderWidth: 640,
  },
  {
    id: "linkedin-post",
    label: "LinkedIn Post (square)",
    width: 1200,
    height: 1200,
    medium: "screen",
    minRenderWidth: 552,
  },
  {
    id: "pinterest-pin",
    label: "Pinterest Pin",
    width: 1000,
    height: 1500,
    medium: "screen",
    minRenderWidth: 236,
  },
  {
    id: "facebook-cover",
    label: "Facebook Cover",
    width: 1640,
    height: 924,
    medium: "screen",
    minRenderWidth: 640,
  },
  {
    id: "logo",
    label: "Logo",
    width: 500,
    height: 500,
    medium: "screen",
    minRenderWidth: 120,
  },
  {
    id: "poster-a4",
    label: "Poster A4 portrait (210 x 297 mm)",
    width: 2480,
    height: 3508,
    medium: "print",
    dpi: PRINT_DPI,
  },
  {
    id: "flyer-a5",
    label: "Flyer A5 portrait (148 x 210 mm)",
    width: 1748,
    height: 2480,
    medium: "print",
    dpi: PRINT_DPI,
  },
  {
    id: "business-card-us",
    label: "Business Card (3.5 x 2 in)",
    width: 1050,
    height: 600,
    medium: "print",
    dpi: PRINT_DPI,
  },
];

/** Visual directions Canva's generators respond to reliably. */
export const STYLE_PRESETS = [
  { id: "clean-minimal", label: "Clean minimal", cue: "generous white space, one accent colour, thin rules, no gradients" },
  { id: "bold-editorial", label: "Bold editorial", cue: "oversized display type, tight leading, high-contrast duotone imagery" },
  { id: "soft-organic", label: "Soft organic", cue: "rounded shapes, muted pastels, hand-drawn blobs, subtle grain" },
  { id: "corporate-clear", label: "Corporate clear", cue: "grid-aligned layout, restrained palette, data-friendly, plenty of contrast" },
  { id: "retro-print", label: "Retro print", cue: "halftone texture, limited spot-colour palette, condensed grotesque type" },
  { id: "photo-led", label: "Photo led", cue: "full-bleed photograph, dark scrim behind text, minimal graphic furniture" },
];

/** Tone-of-voice options applied to the copy instructions in the prompt. */
export const TONE_PRESETS = [
  "Confident and direct",
  "Warm and conversational",
  "Playful",
  "Expert and factual",
  "Urgent and promotional",
  "Calm and reassuring",
];

/** Euclidean greatest common divisor, used to reduce the aspect ratio. */
export function greatestCommonDivisor(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y > 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/**
 * Reduce a pixel size to its simplest whole-number aspect ratio, e.g. 1920x1080 -> "16:9".
 * Returns null when either side is not a usable positive number.
 */
export function aspectRatio(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  const divisor = greatestCommonDivisor(width, height) || 1;
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

/** Physical size of a pixel canvas at a given resolution, in millimetres. */
export function physicalSizeMm(width, height, dpi) {
  if (!Number.isFinite(dpi) || dpi <= 0) return null;
  return {
    widthMm: Math.round((width / dpi) * MM_PER_INCH * 10) / 10,
    heightMm: Math.round((height / dpi) * MM_PER_INCH * 10) / 10,
  };
}

/**
 * The smallest width in CSS pixels at which the design is normally read.
 * Screen formats state it; print formats derive it from their physical width.
 */
export function effectiveRenderWidth(format) {
  if (format.medium === "print") {
    return Math.round((format.width / (format.dpi || PRINT_DPI)) * CSS_PX_PER_INCH);
  }
  return format.minRenderWidth;
}

/**
 * Derive how many characters of headline, subheadline and body copy actually fit.
 *
 * scale            = renderWidth / canvasWidth
 * headline type    = (16 px x 2) / scale, so it lands at 32 px once rendered
 * character width  = 0.5 em of that type size
 * usable width     = canvas width less a 7% safe margin on each side
 * characters/line  = usable width / character width, then multiplied by the line allowance
 *
 * Supporting copy is set at half the headline size, so it fits twice as many characters
 * per line, over three lines instead of two.
 */
export function copyBudget(format) {
  const renderWidth = effectiveRenderWidth(format);
  if (!Number.isFinite(renderWidth) || renderWidth <= 0) return null;

  const scale = renderWidth / format.width;
  const headlineTypePx = (MIN_RENDERED_TEXT_PX * HEADLINE_RENDER_MULTIPLIER) / scale;
  const usableWidth = format.width * (1 - 2 * SAFE_MARGIN_FRACTION);

  const headlineCharsPerLine = usableWidth / (headlineTypePx * AVG_GLYPH_ADVANCE_EM);
  const subheadCharsPerLine = usableWidth / (headlineTypePx * 0.5 * AVG_GLYPH_ADVANCE_EM);

  return {
    renderWidth,
    headlineTypePx: Math.round(headlineTypePx),
    subheadTypePx: Math.round(headlineTypePx / 2),
    headlineMax: Math.max(12, Math.floor(headlineCharsPerLine * HEADLINE_MAX_LINES)),
    subheadMax: Math.max(24, Math.floor(subheadCharsPerLine * SUBHEAD_MAX_LINES)),
    ctaMax: CTA_MAX_CHARS,
  };
}

/** Look a format up by id, falling back to the first entry. */
export function findFormat(id) {
  return CANVA_FORMATS.find((f) => f.id === id) || CANVA_FORMATS[0];
}

/** Split a comma or newline separated list into clean unique entries. */
export function splitList(value) {
  if (typeof value !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const raw of value.split(/[,\n]/)) {
    const item = raw.trim().replace(/\s+/g, " ");
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export const clean = (value) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

/**
 * Compose a Canva design prompt.
 *
 * @param {object} input
 * @param {string} input.formatId    id from CANVA_FORMATS
 * @param {string} input.subject     what the design is for — required
 * @param {string} [input.audience]  who it speaks to
 * @param {string} [input.brandName]
 * @param {string} [input.brandColors] comma separated colour names
 * @param {string} [input.brandFonts]  comma separated font names
 * @param {string} [input.headline]
 * @param {string} [input.subheadline]
 * @param {string} [input.cta]
 * @param {string} [input.styleId]   id from STYLE_PRESETS
 * @param {string} [input.tone]      one of TONE_PRESETS, or any free text
 * @param {string} [input.mustInclude] comma separated elements that must appear
 * @param {string} [input.avoid]       comma separated things to leave out
 * @param {number} [input.variations]  how many options to ask for, 1 to 10
 * @returns {object} { prompt, format, ... } or { error }
 */
export function buildCanvaPrompt({
  formatId,
  subject,
  audience = "",
  brandName = "",
  brandColors = "",
  brandFonts = "",
  headline = "",
  subheadline = "",
  cta = "",
  styleId,
  tone = "",
  mustInclude = "",
  avoid = "",
  variations = 3,
} = {}) {
  const topic = clean(subject);
  if (!topic) {
    return { error: "Describe what the design is for — that is the one thing the prompt cannot be built without." };
  }

  const format = findFormat(formatId);
  const ratio = aspectRatio(format.width, format.height);
  const budget = copyBudget(format);
  if (!ratio || !budget) {
    return { error: "That canvas size is not valid. Pick a format from the list." };
  }

  const variantCount = Number(variations);
  const safeVariants = Number.isFinite(variantCount)
    ? Math.min(10, Math.max(1, Math.round(variantCount)))
    : 3;
  const variantsClamped = Number.isFinite(variantCount) && safeVariants !== variantCount;

  const style = STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];
  const colours = splitList(brandColors);
  const fonts = splitList(brandFonts);
  const musts = splitList(mustInclude);
  const avoids = splitList(avoid);

  const head = clean(headline);
  const sub = clean(subheadline);
  const button = clean(cta);

  const physical = format.medium === "print" ? physicalSizeMm(format.width, format.height, format.dpi) : null;

  const warnings = [];
  if (variantsClamped) {
    warnings.push(
      `${variantCount} option${variantCount === 1 ? "" : "s"} requested, but Canva prompts only support 1 to 10 — using ${safeVariants} instead.`,
    );
  }
  if (head && head.length > budget.headlineMax) {
    warnings.push(
      `Headline is ${head.length} characters. On a ${format.label} seen at ${budget.renderWidth} px wide, anything past about ${budget.headlineMax} characters drops below a readable size.`,
    );
  }
  if (sub && sub.length > budget.subheadMax) {
    warnings.push(
      `Supporting line is ${sub.length} characters against a budget of about ${budget.subheadMax}. Split it or move it into the caption.`,
    );
  }
  if (button && button.length > budget.ctaMax) {
    warnings.push(`Call to action is ${button.length} characters. Button labels read best at ${budget.ctaMax} or fewer.`);
  }
  if (colours.length === 0) {
    warnings.push("No brand colours given, so the generator will invent a palette. Name two or three to keep output on brand.");
  }
  if (colours.length > 5) {
    warnings.push(`${colours.length} colours listed. Design systems normally hold to three or four; extra colours make the output inconsistent.`);
  }
  if (fonts.length > 2) {
    warnings.push(`${fonts.length} fonts listed. Two — one display, one text — is the usual limit before a layout looks noisy.`);
  }

  const lines = [];
  lines.push(`Create ${safeVariants} design option${safeVariants === 1 ? "" : "s"} in Canva.`);
  lines.push("");

  lines.push("FORMAT");
  lines.push(`- Canva preset: ${format.label}`);
  lines.push(`- Canvas: ${format.width} x ${format.height} px (${ratio})`);
  if (physical) {
    lines.push(`- Print size: ${physical.widthMm} x ${physical.heightMm} mm at ${format.dpi} DPI, CMYK, 3 mm bleed`);
  }
  lines.push(`- Keep all text and the logo inside a ${Math.round(SAFE_MARGIN_FRACTION * 100)}% safe margin on every edge.`);
  lines.push("");

  lines.push("BRIEF");
  lines.push(`- Subject: ${topic}`);
  if (audience) lines.push(`- Audience: ${clean(audience)}`);
  if (brandName) lines.push(`- Brand: ${clean(brandName)}`);
  lines.push("");

  lines.push("BRAND");
  lines.push(colours.length ? `- Palette: ${colours.join(", ")} — use the first as the dominant colour.` : "- Palette: not fixed, choose a restrained three-colour palette and reuse it across all options.");
  if (fonts.length >= 2) {
    lines.push(`- Type: ${fonts[0]} for display, ${fonts.slice(1).join(" and ")} for body text — no other families.`);
  } else if (fonts.length === 1) {
    lines.push(`- Type: ${fonts[0]} only, using weight and size for hierarchy.`);
  } else {
    lines.push("- Type: one display face and one text face, no more.");
  }
  lines.push("");

  if (head || sub || button) {
    lines.push("COPY — set this text exactly as written, do not reword or translate it");
    if (head) lines.push(`- Headline (${head.length} chars): ${head}`);
    if (sub) lines.push(`- Supporting line (${sub.length} chars): ${sub}`);
    if (button) lines.push(`- Call to action: ${button}`);
    lines.push("");
  } else {
    lines.push("COPY");
    lines.push(`- Write a headline of at most ${budget.headlineMax} characters and a supporting line of at most ${budget.subheadMax} characters.`);
    lines.push("");
  }

  lines.push("STYLE");
  lines.push(`- Visual direction: ${style.label} — ${style.cue}.`);
  if (tone) lines.push(`- Tone of voice: ${clean(tone)}.`);
  lines.push(`- Headline type size around ${budget.headlineTypePx} px on this canvas, supporting text around ${budget.subheadTypePx} px, so it still reads at ${budget.renderWidth} px wide.`);
  lines.push("");

  if (musts.length) {
    lines.push("MUST INCLUDE");
    for (const item of musts) lines.push(`- ${item}`);
    lines.push("");
  }

  if (avoids.length) {
    lines.push("DO NOT");
    for (const item of avoids) lines.push(`- ${item}`);
    lines.push("");
  }

  lines.push("OUTPUT");
  lines.push(`- ${safeVariants} distinct layout${safeVariants === 1 ? "" : "s"}, not colour swaps of one idea.`);
  lines.push("- Editable text layers, no text baked into an image.");
  lines.push("- Label each option with a one-line note on why the layout works.");

  const prompt = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return {
    prompt,
    format,
    aspectRatio: ratio,
    physical,
    budget,
    warnings,
    variations: safeVariants,
    promptChars: prompt.length,
    promptWords: prompt.split(/\s+/).filter(Boolean).length,
  };
}
