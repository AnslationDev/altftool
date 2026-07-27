/**
 * Zoom Virtual Background Maker — pure geometry, contrast and legibility maths.
 * No React, no DOM. The page component paints the returned plan onto a canvas.
 */

/**
 * Zoom virtual background image requirements.
 * Zoom asks for an image matching your camera's aspect ratio — 16:9 for almost
 * every webcam — recommends 1920x1080, accepts a minimum of 1280x720, and caps
 * the uploaded image at 15 MB in GIF, JPG or PNG.
 */
export const ZOOM_BACKGROUND_SPEC = {
  aspectW: 16,
  aspectH: 9,
  recommended: { width: 1920, height: 1080 },
  minimum: { width: 1280, height: 720 },
  maxUploadBytes: 15 * 1024 * 1024,
};

export const EXPORT_PRESETS = [
  { id: "hd", name: "1920 x 1080 (Zoom recommended)", width: 1920, height: 1080 },
  { id: "hd720", name: "1280 x 720 (Zoom minimum)", width: 1280, height: 720 },
  { id: "qhd", name: "2560 x 1440 (4K-ready webcams)", width: 2560, height: 1440 },
  { id: "uhd", name: "3840 x 2160 (retina screen share)", width: 3840, height: 2160 },
];

/**
 * Head-and-shoulders footprint as a share of the frame, measured from typical
 * webcam framing at the three common distances. The presenter is composited on
 * top of the background, so anything inside this rectangle gets covered.
 */
export const FRAMING_PROFILES = [
  { id: "closeup", name: "Close-up (head and shoulders)", widthShare: 0.52, topShare: 0.06 },
  { id: "medium", name: "Medium (chest up)", widthShare: 0.42, topShare: 0.12 },
  { id: "wide", name: "Wide (desk visible)", widthShare: 0.34, topShare: 0.2 },
];

export const FACE_SIDES = [
  { id: "center", name: "Centred in frame", centerShare: 0.5 },
  { id: "left", name: "Sitting left of centre", centerShare: 0.34 },
  { id: "right", name: "Sitting right of centre", centerShare: 0.66 },
];

export const PANEL_POSITIONS = [
  { id: "top-left", name: "Top left", xShare: 0, yShare: 0 },
  { id: "top-right", name: "Top right", xShare: 1, yShare: 0 },
  { id: "bottom-left", name: "Bottom left", xShare: 0, yShare: 1 },
  { id: "bottom-right", name: "Bottom right", xShare: 1, yShare: 1 },
];

/**
 * Zoom gallery view shrinks each participant to a small tile. 320 px wide is a
 * realistic tile on a 13-inch laptop with 9 participants, and 11 px is the
 * smallest comfortable UI text size, so anything smaller stops being readable.
 */
export const GALLERY_TILE_WIDTH_PX = 320;
export const MIN_READABLE_TILE_PX = 11;

/** WCAG 2.1: 3:1 for large text (>= 24 px regular or 18.66 px bold), 4.5:1 otherwise. */
export const WCAG_LARGE_TEXT_RATIO = 3;
export const WCAG_NORMAL_TEXT_RATIO = 4.5;

/** Safe margin: Zoom can letterbox or slightly crop mismatched cameras. 5% is the usual allowance. */
export const EDGE_SAFE_MARGIN_SHARE = 0.05;

export const THEMES = [
  { id: "slate", name: "Slate", from: { h: 218, s: 34, l: 16 }, to: { h: 222, s: 30, l: 28 }, ink: { h: 0, s: 0, l: 100 } },
  { id: "teal", name: "Teal", from: { h: 178, s: 62, l: 18 }, to: { h: 172, s: 58, l: 34 }, ink: { h: 0, s: 0, l: 100 } },
  { id: "linen", name: "Linen", from: { h: 38, s: 40, l: 94 }, to: { h: 32, s: 34, l: 84 }, ink: { h: 24, s: 24, l: 14 } },
  { id: "plum", name: "Plum", from: { h: 288, s: 44, l: 18 }, to: { h: 320, s: 48, l: 34 }, ink: { h: 0, s: 0, l: 100 } },
  { id: "studio", name: "Studio grey", from: { h: 0, s: 0, l: 22 }, to: { h: 0, s: 0, l: 42 }, ink: { h: 0, s: 0, l: 100 } },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** HSL -> [r, g, b] 0-255. */
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

/** CSS hsl() string for canvas fillStyle. */
export function hslCss({ h, s, l }, alpha = 1) {
  const a = clamp(Number(alpha), 0, 1);
  const base = `hsl(${((Number(h) % 360) + 360) % 360} ${clamp(Number(s), 0, 100)}% ${clamp(Number(l), 0, 100)}%`;
  return a >= 1 ? `${base})` : `${base} / ${a})`;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance([r, g, b]) {
  const lin = [r, g, b].map((raw) => {
    const c = clamp(Number(raw), 0, 255) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** WCAG 2.1 contrast ratio (L1 + 0.05) / (L2 + 0.05). */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Overlapping area of two axis-aligned rectangles, in square pixels. */
export function rectOverlapArea(a, b) {
  if (!a || !b) return 0;
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

/**
 * The rectangle the presenter's body is expected to occupy.
 * Runs from the top of the head down to the bottom edge of the frame.
 */
export function computeFaceSafeZone({ width, height, framing = "medium", side = "center" }) {
  const w = Number(width);
  const h = Number(height);
  if (!(w > 0) || !(h > 0)) return { error: "Background dimensions must be greater than zero." };

  const profile = FRAMING_PROFILES.find((entry) => entry.id === framing) ?? FRAMING_PROFILES[1];
  const anchor = FACE_SIDES.find((entry) => entry.id === side) ?? FACE_SIDES[0];

  const zoneWidth = w * profile.widthShare;
  const centerX = w * anchor.centerShare;
  const x = clamp(centerX - zoneWidth / 2, 0, Math.max(0, w - zoneWidth));
  const y = h * profile.topShare;

  return {
    x,
    y,
    width: zoneWidth,
    height: h - y,
    profile,
    anchor,
    areaShare: (zoneWidth * (h - y)) / (w * h),
  };
}

/**
 * Smallest font size, in export pixels, that still reads at gallery-tile scale.
 * A tile shows the background at tileWidth / backgroundWidth scale, so the
 * rendered size is fontPx * that scale; solve for fontPx at 11 px rendered.
 */
export function minLegibleFontPx(backgroundWidth, tileWidth = GALLERY_TILE_WIDTH_PX) {
  const w = Number(backgroundWidth);
  const tile = Number(tileWidth);
  if (!(w > 0) || !(tile > 0)) return { error: "Widths must be greater than zero." };
  return (MIN_READABLE_TILE_PX * w) / tile;
}

/**
 * Full layout plan: background, brand panel placement and every safety check.
 */
export function buildBackgroundPlan({
  width = ZOOM_BACKGROUND_SPEC.recommended.width,
  height = ZOOM_BACKGROUND_SPEC.recommended.height,
  name = "",
  role = "",
  handle = "",
  themeId = "slate",
  framing = "medium",
  side = "center",
  panelPosition = "bottom-left",
  nameScale = 1,
} = {}) {
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { error: "Enter a background width and height greater than zero." };
  }
  if (w < ZOOM_BACKGROUND_SPEC.minimum.width || h < ZOOM_BACKGROUND_SPEC.minimum.height) {
    return {
      error: `Zoom's minimum virtual background is ${ZOOM_BACKGROUND_SPEC.minimum.width}x${ZOOM_BACKGROUND_SPEC.minimum.height} px.`,
    };
  }
  if (!String(name).trim() && !String(role).trim() && !String(handle).trim()) {
    return { error: "Add a name, role or handle so there is something to place on the background." };
  }

  const theme = THEMES.find((entry) => entry.id === themeId) ?? THEMES[0];
  const zone = computeFaceSafeZone({ width: w, height: h, framing, side });
  if (zone.error) return { error: zone.error };

  const margin = Math.round(Math.min(w, h) * EDGE_SAFE_MARGIN_SHARE);
  const minFont = minLegibleFontPx(w);
  const scale = clamp(Number(nameScale) || 1, 0.6, 2);

  // Name is set at 4.4% of the frame height by default, scaled by the user, then
  // floored at the gallery-legible minimum. Secondary lines stay proportional to
  // the name so the hierarchy survives; each line reports whether it clears the floor.
  const requestedNameFont = Math.round(h * 0.044 * scale);
  const nameFont = Math.max(minFont, requestedNameFont);
  const roleFont = Math.round(nameFont * 0.52);
  const handleFont = Math.round(nameFont * 0.42);

  const lines = [
    String(name).trim() ? { text: String(name).trim(), font: nameFont, weight: 800, alpha: 1 } : null,
    String(role).trim() ? { text: String(role).trim(), font: roleFont, weight: 600, alpha: 0.86 } : null,
    String(handle).trim() ? { text: String(handle).trim(), font: handleFont, weight: 600, alpha: 0.7 } : null,
  ]
    .filter(Boolean)
    .map((line) => ({ ...line, readableInGallery: line.font >= minFont }));

  const lineGap = Math.round(nameFont * 0.34);
  const panelPadding = Math.round(nameFont * 0.6);
  const textHeight = lines.reduce((sum, line) => sum + line.font, 0) + lineGap * Math.max(0, lines.length - 1);
  const longest = lines.reduce((max, line) => Math.max(max, line.text.length * line.font * 0.52), 0);
  const panelWidth = Math.min(w - margin * 2, Math.round(longest + panelPadding * 2));
  const panelHeight = Math.round(textHeight + panelPadding * 2);

  const anchorPos = PANEL_POSITIONS.find((entry) => entry.id === panelPosition) ?? PANEL_POSITIONS[2];
  const panel = {
    x: Math.round(anchorPos.xShare === 0 ? margin : w - margin - panelWidth),
    y: Math.round(anchorPos.yShare === 0 ? margin : h - margin - panelHeight),
    width: panelWidth,
    height: panelHeight,
    padding: panelPadding,
    lineGap,
  };

  const overlap = rectOverlapArea(panel, zone);
  const overlapShare = panel.width * panel.height > 0 ? overlap / (panel.width * panel.height) : 0;
  const contrast = contrastRatio(hslToRgb(theme.ink), hslToRgb(theme.from));

  const warnings = [];
  const notes = [];
  if (overlapShare > 0.02) {
    warnings.push(
      `${Math.round(overlapShare * 100)}% of the brand panel sits behind you at this framing — move it to the other corner or sit further from centre.`,
    );
  }
  if (contrast < WCAG_LARGE_TEXT_RATIO) {
    warnings.push(
      `Text contrast is ${contrast.toFixed(2)}:1; WCAG asks for ${WCAG_LARGE_TEXT_RATIO}:1 on large text. Choose a darker or lighter theme.`,
    );
  }
  if (Math.abs(w / h - ZOOM_BACKGROUND_SPEC.aspectW / ZOOM_BACKGROUND_SPEC.aspectH) > 0.01) {
    warnings.push("Aspect ratio is not 16:9, so Zoom will crop or letterbox the image on most webcams.");
  }
  if (requestedNameFont < minFont) {
    notes.push(
      `Name raised from ${requestedNameFont} px to the ${Math.round(minFont)} px floor that stays readable in a ${GALLERY_TILE_WIDTH_PX} px gallery tile.`,
    );
  }
  const unreadable = lines.filter((line) => !line.readableInGallery).length;
  if (unreadable > 0) {
    notes.push(
      `${unreadable} secondary line${unreadable > 1 ? "s sit" : " sits"} below ${Math.round(minFont)} px — readable in speaker view, not in a small gallery tile.`,
    );
  }

  return {
    width: w,
    height: h,
    theme,
    zone,
    panel,
    lines,
    margin,
    minFont,
    nameFont,
    contrast,
    contrastPass: contrast >= WCAG_LARGE_TEXT_RATIO,
    overlapShare,
    aspect: `${(w / h).toFixed(2)}:1`,
    warnings,
    notes,
  };
}

/** Check an exported file against Zoom's upload limits. */
export function checkUpload({ width, height, bytes }) {
  const w = Number(width);
  const h = Number(height);
  const size = Number(bytes);
  if (!(w > 0) || !(h > 0)) return { error: "Export dimensions must be positive." };
  if (!(size >= 0)) return { error: "File size must be zero or more." };
  const checks = [
    {
      label: `At least ${ZOOM_BACKGROUND_SPEC.minimum.width}x${ZOOM_BACKGROUND_SPEC.minimum.height} px`,
      pass: w >= ZOOM_BACKGROUND_SPEC.minimum.width && h >= ZOOM_BACKGROUND_SPEC.minimum.height,
    },
    {
      label: "16:9 aspect ratio",
      pass: Math.abs(w / h - ZOOM_BACKGROUND_SPEC.aspectW / ZOOM_BACKGROUND_SPEC.aspectH) < 0.01,
    },
    {
      label: `Under the ${Math.round(ZOOM_BACKGROUND_SPEC.maxUploadBytes / (1024 * 1024))} MB image limit`,
      pass: size <= ZOOM_BACKGROUND_SPEC.maxUploadBytes,
    },
  ];
  return { checks, ready: checks.every((check) => check.pass) };
}
