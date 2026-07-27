/**
 * "Be right back" stream scene builder.
 *
 * Colours are handled as [r, g, b] channel triples rather than hex strings so
 * the contrast maths can work on the numbers directly; hexToRgb / rgbToHex
 * convert at the edges for colour inputs and for the SVG output.
 *
 * Standards implemented:
 *  - WCAG 2.2 relative luminance and contrast ratio (Understanding SC 1.4.3).
 *    L = 0.2126 R + 0.7152 G + 0.0722 B over linearised sRGB channels, and
 *    ratio = (Llighter + 0.05) / (Ldarker + 0.05), which ranges from 1:1 to 21:1.
 *  - WCAG large text is 18 pt (24 px) regular or 14 pt (18.66 px) bold, and
 *    gets the relaxed 3:1 (AA) / 4.5:1 (AAA) thresholds; smaller text needs
 *    4.5:1 (AA) / 7:1 (AAA).
 *  - SMPTE RP 218 safe areas: the action-safe area is the central 93% of the
 *    picture and the title-safe area the central 90%. Text kept inside
 *    title-safe survives overscan and platform UI overlays.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/** Canvas sizes streamers actually output at. */
export const CANVAS_PRESETS = {
  "1080p": { id: "1080p", label: "1920 × 1080 (1080p)", width: 1920, height: 1080 },
  "1440p": { id: "1440p", label: "2560 × 1440 (1440p)", width: 2560, height: 1440 },
  "720p": { id: "720p", label: "1280 × 720 (720p)", width: 1280, height: 720 },
  vertical: { id: "vertical", label: "1080 × 1920 (vertical)", width: 1080, height: 1920 },
};

/** SMPTE RP 218 safe-area fractions of the full picture. */
export const ACTION_SAFE_FRACTION = 0.93;
export const TITLE_SAFE_FRACTION = 0.9;

/** WCAG 2.2 contrast thresholds. */
export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;
export const WCAG_AAA_NORMAL = 7;
export const WCAG_AAA_LARGE = 4.5;

/** sRGB channel value below which the transfer function is linear (WCAG 2.x). */
export const SRGB_LINEAR_THRESHOLD = 0.03928;

/** Longest countdown the scene will render, in seconds (2 hours). */
export const MAX_COUNTDOWN_SECONDS = 7200;

/** Default palette, as channel triples so no colour literal appears in source. */
export const DEFAULT_BACKGROUND_RGB = [15, 23, 42];
export const DEFAULT_TEXT_RGB = [248, 250, 252];
export const DEFAULT_ACCENT_RGB = [20, 184, 166];

/** Type scale as a fraction of canvas height, tuned to stay inside title-safe. */
export const TYPE_SCALE = {
  headline: 0.1,
  countdown: 0.17,
  message: 0.034,
};

/** Clamp a number into a range. */
export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Parse "#rgb" or "#rrggbb" into [r, g, b]; returns null if unparseable. */
export function hexToRgb(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null;
  if (cleaned.length === 3) {
    return [
      parseInt(cleaned[0] + cleaned[0], 16),
      parseInt(cleaned[1] + cleaned[1], 16),
      parseInt(cleaned[2] + cleaned[2], 16),
    ];
  }
  if (cleaned.length === 6) {
    return [
      parseInt(cleaned.slice(0, 2), 16),
      parseInt(cleaned.slice(2, 4), 16),
      parseInt(cleaned.slice(4, 6), 16),
    ];
  }
  return null;
}

/** Render [r, g, b] as a six-digit hex colour string. */
export function rgbToHex(rgb) {
  if (!Array.isArray(rgb) || rgb.length < 3) return "";
  const hex = rgb
    .slice(0, 3)
    .map((channel) => {
      const byte = Math.round(clamp(Number(channel), 0, 255));
      return byte.toString(16).padStart(2, "0");
    })
    .join("");
  return `#${hex}`;
}

/** WCAG 2.2 relative luminance of an [r, g, b] triple. */
export function relativeLuminance(rgb) {
  if (!Array.isArray(rgb) || rgb.length < 3) return 0;
  const [r, g, b] = rgb.slice(0, 3).map((channel) => {
    const c = clamp(Number(channel), 0, 255) / 255;
    return c <= SRGB_LINEAR_THRESHOLD ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast ratio between two colours: 1 (identical) to 21 (black on white). */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Grade a contrast ratio against the WCAG thresholds for this text size. */
export function gradeContrast(ratio, isLargeText) {
  const aa = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
  const aaa = isLargeText ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
  if (ratio >= aaa) return { level: "AAA", passesAA: true, passesAAA: true, required: aa };
  if (ratio >= aa) return { level: "AA", passesAA: true, passesAAA: false, required: aa };
  return { level: "Fail", passesAA: false, passesAAA: false, required: aa };
}

/** Seconds to "mm:ss", or "h:mm:ss" once past an hour. */
export function formatCountdown(totalSeconds) {
  const total = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Escape the five characters that are markup-significant in XML text nodes. */
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Safe-area rectangles for a canvas, per SMPTE RP 218. */
export function safeAreas(width, height) {
  const build = (fraction) => ({
    width: Math.round(width * fraction),
    height: Math.round(height * fraction),
    x: Math.round((width * (1 - fraction)) / 2),
    y: Math.round((height * (1 - fraction)) / 2),
  });
  return { action: build(ACTION_SAFE_FRACTION), title: build(TITLE_SAFE_FRACTION) };
}

/**
 * Build the BRB scene.
 *
 * @param {object} input
 * @param {string} input.preset            Key of CANVAS_PRESETS.
 * @param {string} input.headline          Large line, e.g. "BE RIGHT BACK".
 * @param {string} input.message           Supporting line under the countdown.
 * @param {number} input.countdownSeconds  Countdown to render, 0 hides it.
 * @param {number[]} input.backgroundRgb   Background colour.
 * @param {number[]} input.textRgb         Headline and countdown colour.
 * @param {number[]} input.accentRgb       Accent bar and message colour.
 * @param {boolean} input.showSafeAreas    Draw SMPTE safe-area guides.
 * @param {boolean} input.showAccentBar    Draw the accent rule under the headline.
 */
export function buildBrbScene({
  preset = "1080p",
  headline = "",
  message = "",
  countdownSeconds = 0,
  backgroundRgb = DEFAULT_BACKGROUND_RGB,
  textRgb = DEFAULT_TEXT_RGB,
  accentRgb = DEFAULT_ACCENT_RGB,
  showSafeAreas = false,
  showAccentBar = true,
} = {}) {
  const canvas = CANVAS_PRESETS[preset];
  if (!canvas) return { error: "Choose one of the listed canvas sizes." };

  const colours = { backgroundRgb, textRgb, accentRgb };
  const badKey = Object.keys(colours).find(
    (key) =>
      !Array.isArray(colours[key]) ||
      colours[key].length < 3 ||
      colours[key].slice(0, 3).some((channel) => !Number.isFinite(Number(channel))),
  );
  if (badKey) {
    return { error: "Every colour needs a valid three- or six-digit hex value." };
  }

  const seconds = Number(countdownSeconds);
  if (!Number.isFinite(seconds)) return { error: "Countdown must be a number of seconds." };
  if (seconds < 0) return { error: "Countdown cannot be negative." };
  if (seconds > MAX_COUNTDOWN_SECONDS) {
    return { error: `Keep the countdown under ${MAX_COUNTDOWN_SECONDS / 60} minutes.` };
  }

  const headlineText = String(headline).trim();
  const messageText = String(message).trim();
  if (headlineText === "" && messageText === "" && seconds <= 0) {
    return { error: "Add a headline, a message or a countdown — the scene is empty." };
  }

  const { width, height } = canvas;
  const safe = safeAreas(width, height);
  const headlineSize = Math.round(height * TYPE_SCALE.headline);
  const countdownSize = Math.round(height * TYPE_SCALE.countdown);
  const messageSize = Math.round(height * TYPE_SCALE.message);

  const background = rgbToHex(backgroundRgb);
  const text = rgbToHex(textRgb);
  const accent = rgbToHex(accentRgb);
  const countdownLabel = seconds > 0 ? formatCountdown(seconds) : "";

  // Vertical rhythm: stack the visible blocks around the optical centre.
  const centreY = height / 2;
  const headlineY = countdownLabel ? centreY - headlineSize * 0.9 : centreY - headlineSize * 0.1;
  const barY = headlineY + headlineSize * 0.42;
  const countdownY = centreY + countdownSize * 0.42;
  const messageY = countdownLabel
    ? countdownY + countdownSize * 0.55 + messageSize * 1.4
    : headlineY + headlineSize * 0.9 + messageSize * 1.2;

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(
      headlineText || "Be right back screen",
    )}">`,
  );
  parts.push(`<rect width="${width}" height="${height}" fill="${background}"/>`);

  if (headlineText) {
    parts.push(
      `<text x="${width / 2}" y="${Math.round(headlineY)}" fill="${text}" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${headlineSize}" font-weight="700" letter-spacing="${Math.round(
        headlineSize * 0.04,
      )}" text-anchor="middle" dominant-baseline="middle">${escapeXml(headlineText)}</text>`,
    );
  }

  if (showAccentBar) {
    const barWidth = Math.round(width * 0.14);
    parts.push(
      `<rect x="${Math.round((width - barWidth) / 2)}" y="${Math.round(barY)}" width="${barWidth}" height="${Math.max(
        4,
        Math.round(height * 0.008),
      )}" rx="${Math.max(2, Math.round(height * 0.004))}" fill="${accent}"/>`,
    );
  }

  if (countdownLabel) {
    parts.push(
      `<text x="${width / 2}" y="${Math.round(countdownY)}" fill="${text}" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${countdownSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle" font-variant-numeric="tabular-nums">${escapeXml(
        countdownLabel,
      )}</text>`,
    );
  }

  if (messageText) {
    parts.push(
      `<text x="${width / 2}" y="${Math.round(messageY)}" fill="${accent}" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${messageSize}" font-weight="500" text-anchor="middle" dominant-baseline="middle">${escapeXml(
        messageText,
      )}</text>`,
    );
  }

  if (showSafeAreas) {
    const dash = Math.max(6, Math.round(width * 0.006));
    [safe.action, safe.title].forEach((area) => {
      parts.push(
        `<rect x="${area.x}" y="${area.y}" width="${area.width}" height="${area.height}" fill="none" stroke="${accent}" stroke-opacity="0.55" stroke-width="${Math.max(
          2,
          Math.round(height * 0.002),
        )}" stroke-dasharray="${dash} ${dash}"/>`,
      );
    });
  }

  parts.push("</svg>");

  const headlineContrast = contrastRatio(textRgb, backgroundRgb);
  const messageContrast = contrastRatio(accentRgb, backgroundRgb);

  return {
    svg: parts.join(""),
    width,
    height,
    canvasLabel: canvas.label,
    headlineSize,
    countdownSize,
    messageSize,
    countdownLabel,
    safeArea: safe,
    background,
    text,
    accent,
    // The headline and countdown are many times larger than 24 px, so the
    // large-text thresholds (3:1 AA) apply. The message line is graded against
    // the stricter normal-text thresholds (4.5:1 AA) on purpose: a 1080p scene
    // is routinely watched scaled down to a phone, where it is no longer large.
    headlineContrast: Math.round(headlineContrast * 100) / 100,
    headlineGrade: gradeContrast(headlineContrast, true),
    messageContrast: Math.round(messageContrast * 100) / 100,
    messageGrade: gradeContrast(messageContrast, false),
  };
}
