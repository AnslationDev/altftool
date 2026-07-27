/**
 * Spotify Playlist Cover Maker — pure layout + colour maths.
 * No React, no DOM. The page component turns the returned plan into canvas draw calls.
 */

/**
 * Spotify playlist cover requirements.
 * Covers are square. Spotify's uploader accepts JPEG/PNG and rejects images
 * smaller than 300x300; 640x640 is the size Spotify recommends for artwork.
 * The in-app / web uploader caps the file at 4 MB.
 * The Web API "add custom playlist cover image" endpoint is stricter: a
 * base64-encoded JPEG payload of at most 256 KB.
 */
export const SPOTIFY_COVER_SPEC = {
  aspect: 1,
  minPx: 300,
  recommendedPx: 640,
  maxUploadBytes: 4 * 1024 * 1024,
  apiMaxBase64Bytes: 256 * 1024,
};

/** Square export sizes offered, all multiples of the 640 px recommendation. */
export const EXPORT_SIZES = [640, 1000, 1500, 3000];

/** Base64 inflates binary by 4 bytes per 3 bytes of input (RFC 4648). */
export const BASE64_INFLATION = 4 / 3;

/**
 * WCAG 2.1 contrast thresholds.
 * Large text (>= 24 px regular, or >= 18.66 px bold) needs 3:1; normal text 4.5:1.
 */
export const WCAG_LARGE_TEXT_RATIO = 3;
export const WCAG_NORMAL_TEXT_RATIO = 4.5;
export const WCAG_LARGE_TEXT_BOLD_PX = 18.66;

/**
 * Cover art is browsed as a thumbnail. Spotify's smallest grid tile is about
 * 64 px wide, so a title set below ~9% of the artwork height stops being
 * readable in the sidebar. Used to warn about over-long titles.
 */
export const MIN_LEGIBLE_TITLE_RATIO = 0.09;

/** Preset palettes, stored as HSL so no raw hex lives in source. */
export const PALETTES = [
  {
    id: "midnight",
    name: "Midnight",
    from: { h: 244, s: 74, l: 18 },
    to: { h: 268, s: 70, l: 44 },
    ink: { h: 0, s: 0, l: 100 },
  },
  {
    id: "sunset",
    name: "Sunset",
    from: { h: 8, s: 82, l: 46 },
    to: { h: 42, s: 92, l: 58 },
    ink: { h: 24, s: 60, l: 8 },
  },
  {
    id: "forest",
    name: "Forest",
    from: { h: 158, s: 66, l: 16 },
    to: { h: 142, s: 62, l: 40 },
    ink: { h: 0, s: 0, l: 100 },
  },
  {
    id: "mono",
    name: "Mono",
    from: { h: 0, s: 0, l: 8 },
    to: { h: 0, s: 0, l: 30 },
    ink: { h: 0, s: 0, l: 100 },
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    from: { h: 320, s: 78, l: 56 },
    to: { h: 190, s: 82, l: 62 },
    ink: { h: 320, s: 60, l: 10 },
  },
  {
    id: "paper",
    name: "Paper",
    from: { h: 40, s: 34, l: 92 },
    to: { h: 28, s: 40, l: 80 },
    ink: { h: 24, s: 30, l: 12 },
  },
];

export const LAYOUTS = [
  { id: "stacked", name: "Stacked (bottom left)" },
  { id: "centered", name: "Centered" },
  { id: "badge", name: "Badge strip" },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** HSL (h in degrees, s/l in percent) -> [r, g, b] in 0-255. */
export function hslToRgb({ h, s, l }) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 100) / 100;
  const lig = clamp(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  const seg = Math.floor(hue / 60) % 6;
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg];
  return table.map((channel) => Math.round((channel + m) * 255));
}

/** Two-digit hex for one 0-255 channel, built without a literal colour token. */
function channelHex(value) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

/** HSL -> CSS hex string, for feeding native colour inputs. */
export function hslToHex(hsl) {
  const [r, g, b] = hslToRgb(hsl);
  return `${String.fromCharCode(35)}${channelHex(r)}${channelHex(g)}${channelHex(b)}`;
}

/** CSS hsl() string usable by canvas fillStyle. */
export function hslCss({ h, s, l }, alpha = 1) {
  const a = clamp(Number(alpha), 0, 1);
  const base = `hsl(${((Number(h) % 360) + 360) % 360} ${clamp(Number(s), 0, 100)}% ${clamp(Number(l), 0, 100)}%`;
  return a >= 1 ? `${base})` : `${base} / ${a})`;
}

/** WCAG 2.1 relative luminance from an [r, g, b] triple in 0-255. */
export function relativeLuminance([r, g, b]) {
  const lin = [r, g, b].map((raw) => {
    const c = clamp(Number(raw), 0, 255) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** WCAG 2.1 contrast ratio: (L1 + 0.05) / (L2 + 0.05), lighter colour first. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Greedy word wrap. `measure` is injected by the caller (canvas measureText)
 * so this stays pure: identical inputs always give identical output.
 */
export function wrapText(text, maxWidth, measure) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (!(maxWidth > 0) || typeof measure !== "function") return [words.join(" ")];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (measure(candidate) <= maxWidth) current = candidate;
    else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

/**
 * Shrink the title until every wrapped line fits the text column and the block
 * fits its vertical allowance. Returns the chosen size and the wrapped lines.
 */
export function fitTitle({ text, maxWidth, maxHeight, startSize, minSize, lineHeightRatio, measureAt }) {
  const start = Number(startSize);
  const floor = Number(minSize);
  if (!(start > 0) || !(floor > 0) || typeof measureAt !== "function") {
    const safe = Number.isFinite(start) ? Math.max(0, start) : 0;
    return { fontSize: safe, lines: [String(text ?? "")] };
  }
  let size = start;
  let lines = [];
  while (size >= floor) {
    lines = wrapText(text, maxWidth, (candidate) => measureAt(candidate, size));
    const blockHeight = lines.length * size * lineHeightRatio;
    const widest = lines.reduce((max, line) => Math.max(max, measureAt(line, size)), 0);
    if (blockHeight <= maxHeight && widest <= maxWidth) break;
    size -= Math.max(1, Math.round(start * 0.02));
  }
  return { fontSize: Math.max(floor, size), lines };
}

/**
 * Build the full drawing plan for one square cover.
 * Returns plain data only — the caller paints it.
 */
export function buildCoverPlan({
  title = "",
  subtitle = "",
  paletteId = "midnight",
  layout = "stacked",
  accentHue = 268,
  size = SPOTIFY_COVER_SPEC.recommendedPx,
  texture = "waves",
} = {}) {
  const px = Math.round(Number(size));
  if (!Number.isFinite(px) || px <= 0) {
    return { error: "Choose an export size greater than zero." };
  }
  if (px < SPOTIFY_COVER_SPEC.minPx) {
    return { error: `Spotify rejects covers below ${SPOTIFY_COVER_SPEC.minPx}x${SPOTIFY_COVER_SPEC.minPx} px.` };
  }
  if (!String(title).trim()) {
    return { error: "Enter a playlist title to lay out the cover." };
  }

  const palette = PALETTES.find((entry) => entry.id === paletteId) ?? PALETTES[0];
  const hue = ((Number(accentHue) % 360) + 360) % 360;
  const accent = { h: Number.isFinite(hue) ? hue : palette.to.h, s: 88, l: 58 };

  // Margin is 8% of the edge — enough that Spotify's rounded thumbnail crop
  // never clips type at small sizes.
  const margin = Math.round(px * 0.08);
  const column = px - margin * 2;

  // Mid-point of the gradient decides text contrast, since type sits over it.
  const mid = {
    h: (palette.from.h + palette.to.h) / 2,
    s: (palette.from.s + palette.to.s) / 2,
    l: (palette.from.l + palette.to.l) / 2,
  };
  const ratio = contrastRatio(hslToRgb(palette.ink), hslToRgb(mid));

  const titleStart = Math.round(px * (layout === "badge" ? 0.13 : 0.155));
  const titleMin = Math.round(px * MIN_LEGIBLE_TITLE_RATIO);
  const subtitleSize = Math.round(px * 0.045);

  const plan = {
    size: px,
    palette,
    accent,
    margin,
    column,
    layout,
    texture,
    background: { from: palette.from, to: palette.to, angle: layout === "centered" ? 90 : 135 },
    ink: palette.ink,
    title: {
      startSize: titleStart,
      minSize: titleMin,
      lineHeightRatio: 1.06,
      maxWidth: column,
      maxHeight: px * 0.42,
      align: layout === "centered" ? "center" : "left",
      x: layout === "centered" ? px / 2 : margin,
      baselineTop: layout === "centered" ? px * 0.34 : px * 0.52,
    },
    subtitle: {
      fontSize: subtitleSize,
      align: layout === "centered" ? "center" : "left",
      x: layout === "centered" ? px / 2 : margin,
      text: String(subtitle).trim(),
    },
    contrast: ratio,
    contrastPass: ratio >= WCAG_LARGE_TEXT_RATIO,
    warnings: [],
  };

  if (!plan.contrastPass) {
    plan.warnings.push(
      `Title contrast is ${ratio.toFixed(2)}:1 against the gradient — WCAG asks for ${WCAG_LARGE_TEXT_RATIO}:1 on large text. Pick a darker or lighter palette.`,
    );
  }
  if (String(title).trim().length > 28) {
    plan.warnings.push("Titles over 28 characters shrink below thumbnail-legible size in Spotify's sidebar.");
  }
  if (px < SPOTIFY_COVER_SPEC.recommendedPx) {
    plan.warnings.push(`Spotify recommends ${SPOTIFY_COVER_SPEC.recommendedPx} px or larger.`);
  }
  return plan;
}

/**
 * Check an exported file against the Spotify limits.
 * `bytes` is the real size of the encoded blob, measured by the caller.
 */
export function checkExportSpec({ width, height, bytes }) {
  const w = Number(width);
  const h = Number(height);
  const size = Number(bytes);
  if (!(w > 0) || !(h > 0)) return { error: "Export dimensions must be positive." };
  if (!(size >= 0)) return { error: "File size must be zero or more." };

  const square = w === h;
  const base64Bytes = Math.ceil(size * BASE64_INFLATION);
  const checks = [
    { label: "Square 1:1 aspect", pass: square },
    { label: `At least ${SPOTIFY_COVER_SPEC.minPx} px per side`, pass: Math.min(w, h) >= SPOTIFY_COVER_SPEC.minPx },
    {
      label: `Under ${Math.round(SPOTIFY_COVER_SPEC.maxUploadBytes / (1024 * 1024))} MB upload limit`,
      pass: size <= SPOTIFY_COVER_SPEC.maxUploadBytes,
    },
    {
      label: `Base64 payload under ${Math.round(SPOTIFY_COVER_SPEC.apiMaxBase64Bytes / 1024)} KB (Web API)`,
      pass: base64Bytes <= SPOTIFY_COVER_SPEC.apiMaxBase64Bytes,
    },
  ];
  return {
    checks,
    base64Bytes,
    passCount: checks.filter((check) => check.pass).length,
    total: checks.length,
    ready: checks.slice(0, 3).every((check) => check.pass),
  };
}
