export const FONT_PRESETS = {
  system: {
    label: "System UI sans",
    stack: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  humanist: {
    label: "Humanist sans fallback",
    stack: "Verdana, Tahoma, Arial, sans-serif",
  },
  neutral: {
    label: "Neutral sans fallback",
    stack: "Arial, Helvetica, sans-serif",
  },
  serif: {
    label: "Reading serif fallback",
    stack: "Georgia, 'Times New Roman', serif",
  },
  mono: {
    label: "Monospace fallback",
    stack: "ui-monospace, 'Courier New', monospace",
  },
};

export const TYPOGRAPHY_LIMITS = {
  textCharacters: 20_000,
  fontSize: [12, 48],
  lineHeight: [1, 2.5],
  letterSpacing: [-0.02, 0.3],
  wordSpacing: [0, 0.4],
  measure: [28, 100],
};

export const DEFAULT_TYPOGRAPHY = {
  preset: "system",
  fontSize: 18,
  lineHeight: 1.5,
  letterSpacing: 0,
  wordSpacing: 0,
  measure: 65,
  weight: 400,
  paragraphSpacing: 1,
};

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, [minimum, maximum]) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeTypographySettings(input = {}) {
  const weight = [400, 500, 600, 700].includes(Number(input.weight))
    ? Number(input.weight)
    : DEFAULT_TYPOGRAPHY.weight;
  return {
    preset: Object.hasOwn(FONT_PRESETS, input.preset)
      ? input.preset
      : DEFAULT_TYPOGRAPHY.preset,
    fontSize: clamp(
      finite(input.fontSize, DEFAULT_TYPOGRAPHY.fontSize),
      TYPOGRAPHY_LIMITS.fontSize,
    ),
    lineHeight: clamp(
      finite(input.lineHeight, DEFAULT_TYPOGRAPHY.lineHeight),
      TYPOGRAPHY_LIMITS.lineHeight,
    ),
    letterSpacing: clamp(
      finite(input.letterSpacing, DEFAULT_TYPOGRAPHY.letterSpacing),
      TYPOGRAPHY_LIMITS.letterSpacing,
    ),
    wordSpacing: clamp(
      finite(input.wordSpacing, DEFAULT_TYPOGRAPHY.wordSpacing),
      TYPOGRAPHY_LIMITS.wordSpacing,
    ),
    measure: clamp(
      finite(input.measure, DEFAULT_TYPOGRAPHY.measure),
      TYPOGRAPHY_LIMITS.measure,
    ),
    weight,
    paragraphSpacing: clamp(
      finite(input.paragraphSpacing, DEFAULT_TYPOGRAPHY.paragraphSpacing),
      [0, 3],
    ),
  };
}

export function buildPreviewStyle(input) {
  const settings = normalizeTypographySettings(input);
  return {
    fontFamily: FONT_PRESETS[settings.preset].stack,
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    letterSpacing: `${settings.letterSpacing}em`,
    wordSpacing: `${settings.wordSpacing}em`,
    maxWidth: `${settings.measure}ch`,
    fontWeight: settings.weight,
  };
}

export function applyTextSpacingStress(input = {}) {
  return normalizeTypographySettings({
    ...input,
    lineHeight: Math.max(1.5, finite(input.lineHeight, 1.5)),
    letterSpacing: Math.max(0.12, finite(input.letterSpacing, 0.12)),
    wordSpacing: Math.max(0.16, finite(input.wordSpacing, 0.16)),
    paragraphSpacing: Math.max(2, finite(input.paragraphSpacing, 2)),
  });
}

export function summarizeText(value) {
  const text = String(value || "").slice(0, TYPOGRAPHY_LIMITS.textCharacters);
  const words = text.match(/[\p{L}\p{N}]+/gu) || [];
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const scripts = {
    latin: /\p{Script=Latin}/u.test(text),
    devanagari: /\p{Script=Devanagari}/u.test(text),
    arabic: /\p{Script=Arabic}/u.test(text),
    han: /\p{Script=Han}/u.test(text),
  };
  return {
    characters: [...text].length,
    words: words.length,
    paragraphs: paragraphs.length,
    scriptCount: Object.values(scripts).filter(Boolean).length,
    scripts,
    truncated: String(value || "").length > TYPOGRAPHY_LIMITS.textCharacters,
  };
}

export function buildTypographyReport({ text, left, right } = {}) {
  const summary = summarizeText(text);
  const normalizedLeft = normalizeTypographySettings(left);
  const normalizedRight = normalizeTypographySettings(right);
  return {
    schema: "altftool.font-legibility-comparison.v1",
    createdAt: new Date().toISOString(),
    textCounts: {
      characters: summary.characters,
      words: summary.words,
      paragraphs: summary.paragraphs,
      scriptCount: summary.scriptCount,
      truncated: summary.truncated,
    },
    left: normalizedLeft,
    right: normalizedRight,
    deltas: {
      fontSize: normalizedRight.fontSize - normalizedLeft.fontSize,
      lineHeight: Number(
        (normalizedRight.lineHeight - normalizedLeft.lineHeight).toFixed(2),
      ),
      letterSpacing: Number(
        (normalizedRight.letterSpacing - normalizedLeft.letterSpacing).toFixed(
          2,
        ),
      ),
      wordSpacing: Number(
        (normalizedRight.wordSpacing - normalizedLeft.wordSpacing).toFixed(2),
      ),
      measure: normalizedRight.measure - normalizedLeft.measure,
    },
    scope: {
      textIncluded: false,
      externalFontsLoaded: false,
      fontFilesInspected: false,
      readabilityWinnerDeclared: false,
      wcagConformanceEstablished: false,
    },
  };
}
