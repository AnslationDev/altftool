/**
 * Thumbnail layout planner — geometry and legibility rules for YouTube thumbnails.
 *
 * All element coordinates are percentages of the canvas (0-100), so a layout is
 * resolution independent; the checks below convert them to the real pixel grid.
 */

/** YouTube's recommended custom thumbnail resolution (YouTube Help: "Add video thumbnails"). */
export const THUMBNAIL_WIDTH = 1280;
export const THUMBNAIL_HEIGHT = 720;

/** YouTube requires 16:9 and rejects files over 2 MB. */
export const ASPECT_RATIO = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_FORMATS = ["JPG", "PNG", "GIF", "WEBP"];

/** Smallest place a thumbnail is shown: the mobile "up next" strip, ~168 px wide. */
export const SMALLEST_RENDER_WIDTH = 168;
/** Desktop search results render thumbnails at roughly 246 px wide. */
export const SEARCH_RENDER_WIDTH = 246;

/** Text smaller than ~10 px on screen stops being reliably readable at a glance. */
export const MIN_LEGIBLE_TEXT_PX = 10;

/** Keep key content 5% in from every edge so rounded corners and crops never eat it. */
export const SAFE_MARGIN_PERCENT = 5;

/** The duration pill sits in the bottom-right corner, about 14% wide and 12% tall. */
export const DURATION_BADGE = { x: 86, y: 88, w: 14, h: 12 };

/** Thumbnail copy guidance: three to six words stay readable at 168 px. */
export const MAX_TEXT_WORDS = 6;

/** A single element covering more than this share of the canvas leaves no breathing room. */
export const MAX_SINGLE_COVERAGE_PERCENT = 85;
/** Below this, the layout reads as empty rather than deliberate. */
export const MIN_TOTAL_COVERAGE_PERCENT = 25;

export const ELEMENT_TYPES = ["text", "face", "product", "logo", "shape"];

/** Score starts at 100 and each issue costs a fixed number of points. */
export const PENALTIES = {
  offCanvas: 25,
  outsideSafeMargin: 8,
  durationBadgeClash: 15,
  textTooSmall: 20,
  heavyOverlap: 10,
  tooManyWords: 12,
  tooEmpty: 10,
  tooCrowded: 10,
};

export const ISSUE_LABELS = {
  offCanvas: "Runs off the canvas",
  outsideSafeMargin: `Breaks the ${SAFE_MARGIN_PERCENT}% edge margin`,
  durationBadgeClash: "Sits under the duration badge",
  textTooSmall: "Too small to read at 168 px",
  heavyOverlap: "Heavily overlaps another element",
};

/** Scale factor from the 1280 px master to the smallest place it is shown. */
export const SMALLEST_SCALE = SMALLEST_RENDER_WIDTH / THUMBNAIL_WIDTH;

/**
 * Minimum height, as a percentage of canvas height, for text to clear
 * MIN_LEGIBLE_TEXT_PX once the thumbnail is scaled down to SMALLEST_RENDER_WIDTH.
 */
export const MIN_TEXT_HEIGHT_PERCENT = Number(
  ((MIN_LEGIBLE_TEXT_PX / (THUMBNAIL_HEIGHT * SMALLEST_SCALE)) * 100).toFixed(2)
);

function rectsOverlapArea(a, b) {
  const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return x * y;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** Percent rect -> pixel rect on the 1280x720 master, rounded to whole pixels. */
export function toPixels(rect) {
  return {
    x: Math.round((rect.x / 100) * THUMBNAIL_WIDTH),
    y: Math.round((rect.y / 100) * THUMBNAIL_HEIGHT),
    w: Math.round((rect.w / 100) * THUMBNAIL_WIDTH),
    h: Math.round((rect.h / 100) * THUMBNAIL_HEIGHT),
  };
}

/** How tall an element appears in the mobile "up next" strip and in search. */
export function renderedHeights(heightPercent) {
  const masterPx = (heightPercent / 100) * THUMBNAIL_HEIGHT;
  return {
    masterPx: Number(masterPx.toFixed(1)),
    suggestedPx: Number((masterPx * SMALLEST_SCALE).toFixed(1)),
    searchPx: Number((masterPx * (SEARCH_RENDER_WIDTH / THUMBNAIL_WIDTH)).toFixed(1)),
  };
}

/** Exact union coverage using a 100 x 100 cell grid (1 cell = 1% x 1% of the canvas). */
export function coveragePercent(elements) {
  const grid = new Uint8Array(100 * 100);
  for (const element of elements) {
    const x0 = Math.max(0, Math.floor(element.x));
    const x1 = Math.min(100, Math.ceil(element.x + element.w));
    const y0 = Math.max(0, Math.floor(element.y));
    const y1 = Math.min(100, Math.ceil(element.y + element.h));
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) grid[y * 100 + x] = 1;
    }
  }
  let filled = 0;
  for (let i = 0; i < grid.length; i += 1) filled += grid[i];
  return Number(((filled / grid.length) * 100).toFixed(1));
}

function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Check a whole layout.
 * @param {{elements:Array, headline?:string}} input
 * @returns {{score:number, verdict:string, coverage:number, items:Array,
 *            warnings:string[], headlineWords:number, canvas:object}|{error:string}}
 */
export function planThumbnail({ elements = [], headline = "" } = {}) {
  if (!Array.isArray(elements)) {
    return { error: "Elements must be a list." };
  }
  if (elements.length === 0) {
    return { error: "Add at least one element to plan a layout." };
  }

  const normalised = [];
  for (const element of elements) {
    const { id, label = "", type = "shape" } = element || {};
    const x = Number(element?.x);
    const y = Number(element?.y);
    const w = Number(element?.w);
    const h = Number(element?.h);
    if (![x, y, w, h].every(isFiniteNumber)) {
      return { error: `Element "${label || id || "?"}" has a non-numeric position or size.` };
    }
    if (w <= 0 || h <= 0) {
      return { error: `Element "${label || id || "?"}" must have a width and height above zero.` };
    }
    normalised.push({ id: id ?? label, label, type, x, y, w, h });
  }

  const items = normalised.map((element) => {
    const issues = [];

    if (element.x < 0 || element.y < 0 || element.x + element.w > 100 || element.y + element.h > 100) {
      issues.push("offCanvas");
    } else if (
      element.x < SAFE_MARGIN_PERCENT ||
      element.y < SAFE_MARGIN_PERCENT ||
      element.x + element.w > 100 - SAFE_MARGIN_PERCENT ||
      element.y + element.h > 100 - SAFE_MARGIN_PERCENT
    ) {
      issues.push("outsideSafeMargin");
    }

    if (rectsOverlapArea(element, DURATION_BADGE) > 0) {
      issues.push("durationBadgeClash");
    }

    if (element.type === "text" && element.h < MIN_TEXT_HEIGHT_PERCENT) {
      issues.push("textTooSmall");
    }

    const ownArea = element.w * element.h;
    const worstOverlap = normalised
      .filter((other) => other !== element)
      .reduce((max, other) => Math.max(max, rectsOverlapArea(element, other)), 0);
    // "Heavy" = more than half of this element is buried under another one.
    if (ownArea > 0 && worstOverlap / ownArea > 0.5) {
      issues.push("heavyOverlap");
    }

    return {
      ...element,
      px: toPixels(element),
      rendered: renderedHeights(element.h),
      overlapPercent: ownArea > 0 ? Number(((worstOverlap / ownArea) * 100).toFixed(1)) : 0,
      issues,
    };
  });

  const coverage = coveragePercent(normalised);
  const headlineWords = countWords(headline);

  const warnings = [];
  let score = 100;

  for (const item of items) {
    for (const issue of item.issues) {
      score -= PENALTIES[issue] ?? 0;
      warnings.push(`${item.label || item.type}: ${ISSUE_LABELS[issue]}`);
    }
  }

  if (headlineWords > MAX_TEXT_WORDS) {
    score -= PENALTIES.tooManyWords;
    warnings.push(
      `Headline is ${headlineWords} words — trim to ${MAX_TEXT_WORDS} or fewer so it survives 168 px.`
    );
  }
  if (coverage < MIN_TOTAL_COVERAGE_PERCENT) {
    score -= PENALTIES.tooEmpty;
    warnings.push(`Only ${coverage}% of the frame is used — the layout will read as unfinished.`);
  }
  if (coverage > MAX_SINGLE_COVERAGE_PERCENT) {
    score -= PENALTIES.tooCrowded;
    warnings.push(`${coverage}% of the frame is covered — leave some negative space.`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let verdict = "Needs work";
  if (score >= 85) verdict = "Ready to design";
  else if (score >= 65) verdict = "Close — fix the flagged items";

  return {
    score,
    verdict,
    coverage,
    headlineWords,
    items,
    warnings,
    canvas: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      aspect: "16:9",
      maxFileBytes: MAX_FILE_BYTES,
      formats: ALLOWED_FORMATS,
    },
  };
}

/** Markdown creative brief for handing the layout to a designer. */
export function buildBrief({ videoTitle = "", headline = "", branding = "", plan } = {}) {
  if (!plan || plan.error) {
    return { error: plan?.error || "Nothing to export yet." };
  }

  const lines = [
    `# Thumbnail brief — ${videoTitle || "Untitled video"}`,
    "",
    `- Canvas: ${THUMBNAIL_WIDTH} x ${THUMBNAIL_HEIGHT} px (16:9), max ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)} MB, ${ALLOWED_FORMATS.join("/")}`,
    `- Headline: ${headline || "(none)"} — ${plan.headlineWords} word(s)`,
    `- Layout score: ${plan.score}/100 (${plan.verdict})`,
    `- Frame coverage: ${plan.coverage}%`,
    "",
    "## Elements",
    "",
    "| Element | Type | Position (px) | Size (px) | At 168 px |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const item of plan.items) {
    lines.push(
      `| ${item.label || "(unnamed)"} | ${item.type} | ${item.px.x}, ${item.px.y} | ${item.px.w} x ${item.px.h} | ${item.rendered.suggestedPx} px tall |`
    );
  }

  lines.push("", "## Checks", "");
  if (plan.warnings.length === 0) {
    lines.push("- No issues flagged.");
  } else {
    for (const warning of plan.warnings) lines.push(`- ${warning}`);
  }

  lines.push("", "## Branding notes", "", branding || "(none)");

  return { markdown: lines.join("\n") };
}
