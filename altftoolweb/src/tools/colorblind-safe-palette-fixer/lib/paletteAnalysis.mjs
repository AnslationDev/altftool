export const MAX_PALETTE_COLORS = 12;

export const PALETTE_ROLES = Object.freeze([
  "accent",
  "data",
  "status",
  "text",
  "background",
]);

export const SCREENING_CUE_LIMITS = Object.freeze({
  veryClose: 5,
  close: 12,
});

export const SIMULATION_MODES = Object.freeze([
  "normal",
  "protanopia",
  "deuteranopia",
  "tritanopia",
]);

// Fixed severity-1 endpoints from the Machado, Oliveira & Fernandes model.
// Apply to linear-light sRGB. The paper treats the tritan endpoint as an
// approximation; none of these matrices predicts one person's perception.
export const CVD_MATRICES = Object.freeze({
  protanopia: Object.freeze([
    Object.freeze([0.152286, 1.052583, -0.204868]),
    Object.freeze([0.114503, 0.786281, 0.099216]),
    Object.freeze([-0.003882, -0.048116, 1.051998]),
  ]),
  deuteranopia: Object.freeze([
    Object.freeze([0.367322, 0.860646, -0.227968]),
    Object.freeze([0.280085, 0.672501, 0.047413]),
    Object.freeze([-0.01182, 0.04294, 0.968881]),
  ]),
  tritanopia: Object.freeze([
    Object.freeze([1.255528, -0.076749, -0.178779]),
    Object.freeze([-0.078411, 0.930809, 0.147602]),
    Object.freeze([0.004733, 0.691367, 0.3039]),
  ]),
});

const HUE_SHIFTS = Object.freeze([
  0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180,
]);
const LIGHTNESS_SHIFTS = Object.freeze([
  0, 0.04, -0.04, 0.08, -0.08, 0.12, -0.12, 0.18, -0.18, 0.24, -0.24,
]);
const CHROMA_FACTORS = Object.freeze([1, 0.85, 1.15, 0.65, 1.3, 0.45]);

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function cleanLabel(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function normalizeHex(value) {
  const candidate = String(value || "").trim();
  return /^#[\da-f]{6}$/iu.test(candidate)
    ? candidate.toLocaleUpperCase("en-US")
    : null;
}

function parseHex(value) {
  const normalized = normalizeHex(value);
  if (!normalized) {
    throw new TypeError("Expected an opaque color in exact #RRGGBB format.");
  }
  return [
    Number.parseInt(normalized.slice(1, 3), 16) / 255,
    Number.parseInt(normalized.slice(3, 5), 16) / 255,
    Number.parseInt(normalized.slice(5, 7), 16) / 255,
  ];
}

function encodedChannelToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearChannelToEncoded(value) {
  const bounded = clamp(value);
  return bounded <= 0.0031308
    ? bounded * 12.92
    : 1.055 * bounded ** (1 / 2.4) - 0.055;
}

function channelToByte(value) {
  return Math.round(clamp(value) * 255);
}

function rgbToHex(rgb) {
  return `#${rgb
    .map((channel) => channelToByte(channel).toString(16).padStart(2, "0"))
    .join("")
    .toLocaleUpperCase("en-US")}`;
}

function multiplyMatrix(matrix, vector) {
  return matrix.map(
    (row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2],
  );
}

export function simulateColor(value, mode) {
  const normalized = normalizeHex(value);
  if (!normalized) {
    throw new TypeError("Expected an opaque color in exact #RRGGBB format.");
  }
  if (mode === "normal") return normalized;
  const matrix = CVD_MATRICES[mode];
  if (!matrix) {
    throw new TypeError(`Unsupported simulation mode: ${String(mode)}`);
  }
  const linear = parseHex(normalized).map(encodedChannelToLinear);
  return rgbToHex(multiplyMatrix(matrix, linear).map(linearChannelToEncoded));
}

function linearRgbToOklab([red, green, blue]) {
  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  return {
    l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  };
}

function hexToOklab(value) {
  return linearRgbToOklab(parseHex(value).map(encodedChannelToLinear));
}

function oklabToLinearRgb({ l: lightness, a, b }) {
  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function oklabToOklch({ l, a, b }) {
  const chroma = Math.hypot(a, b);
  const hue =
    chroma < 0.000001 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return { l, c: chroma, h: hue };
}

function oklchToHex({ l, c, h }) {
  const radians = (h * Math.PI) / 180;
  const linear = oklabToLinearRgb({
    l,
    a: c * Math.cos(radians),
    b: c * Math.sin(radians),
  });
  if (linear.some((channel) => channel < -0.000001 || channel > 1.000001)) {
    return null;
  }
  return rgbToHex(linear.map(linearChannelToEncoded));
}

export function oklabScreeningDistance(first, second) {
  const left = hexToOklab(first);
  const right = hexToOklab(second);
  return Number(
    (
      Math.hypot(left.l - right.l, left.a - right.a, left.b - right.b) * 100
    ).toFixed(2),
  );
}

export function relativeLuminance(value) {
  const [red, green, blue] = parseHex(value).map(encodedChannelToLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

export function validatePaletteRows(rows) {
  const source = Array.isArray(rows) ? rows : [];
  const issues = [];
  if (!Array.isArray(rows)) {
    issues.push({
      id: "palette-not-array",
      message: "Palette data is not a list.",
    });
  }
  if (source.length > MAX_PALETTE_COLORS) {
    issues.push({
      id: "palette-too-large",
      message: `Use at most ${MAX_PALETTE_COLORS} colors per review.`,
    });
  }
  const colors = source.slice(0, MAX_PALETTE_COLORS).flatMap((row, index) => {
    const hex = normalizeHex(row?.hex);
    if (!hex) {
      issues.push({
        id: `invalid-hex-${index}`,
        rowIndex: index,
        message: `Color ${index + 1} must use exact #RRGGBB format without alpha.`,
      });
      return [];
    }
    return [
      {
        id: String(row?.id ?? index + 1).slice(0, 80),
        sourceIndex: index,
        hex,
        label: cleanLabel(row?.label),
        role: PALETTE_ROLES.includes(row?.role) ? row.role : "accent",
      },
    ];
  });
  if (colors.length < 2) {
    issues.push({
      id: "too-few-valid-colors",
      message: "Enter at least two valid opaque colors.",
    });
  }
  return { colors, issues, valid: issues.length === 0 };
}

function colorViews(hex) {
  return Object.fromEntries(
    SIMULATION_MODES.map((mode) => [mode, simulateColor(hex, mode)]),
  );
}

function screeningCue(distance) {
  if (distance < SCREENING_CUE_LIMITS.veryClose) return "very-close";
  if (distance < SCREENING_CUE_LIMITS.close) return "close";
  return "separated";
}

function analyzePair(left, right) {
  const distances = Object.fromEntries(
    SIMULATION_MODES.map((mode) => [
      mode,
      oklabScreeningDistance(left.views[mode], right.views[mode]),
    ]),
  );
  const minimumDistance = Math.min(...Object.values(distances));
  const minimumMode =
    SIMULATION_MODES.find((mode) => distances[mode] === minimumDistance) ||
    "normal";
  return {
    leftId: left.id,
    rightId: right.id,
    leftIndex: left.sourceIndex,
    rightIndex: right.sourceIndex,
    distances,
    minimumDistance,
    minimumMode,
    cue: screeningCue(minimumDistance),
    duplicate: left.hex === right.hex,
  };
}

function getRelevantContrastPartners(item, colors) {
  if (item.role === "text") {
    return colors.filter((candidate) => candidate.role === "background");
  }
  if (item.role === "background") {
    return colors.filter((candidate) => candidate.role === "text");
  }
  return [];
}

function relevantContrastRatios(hex, item, colors) {
  return getRelevantContrastPartners(item, colors).map((partner) =>
    contrastRatio(hex, partner.hex),
  );
}

function minimumDistanceFromOthers(hex, item, colors) {
  const views = colorViews(hex);
  let minimum = Number.POSITIVE_INFINITY;
  for (const other of colors) {
    if (other.id === item.id && other.sourceIndex === item.sourceIndex)
      continue;
    for (const mode of SIMULATION_MODES) {
      minimum = Math.min(
        minimum,
        oklabScreeningDistance(views[mode], other.views[mode]),
      );
    }
  }
  return Number.isFinite(minimum) ? minimum : 0;
}

function boundedCandidateHexes(hex) {
  const origin = oklabToOklch(hexToOklab(hex));
  const chromas =
    origin.c < 0.01
      ? [0, 0.04, 0.08, 0.12]
      : CHROMA_FACTORS.map((factor) => origin.c * factor);
  const candidates = new Set();
  for (const lightnessShift of LIGHTNESS_SHIFTS) {
    const lightness = clamp(origin.l + lightnessShift, 0, 1);
    for (const hueShift of HUE_SHIFTS) {
      const hue = (origin.h + hueShift + 360) % 360;
      for (const chroma of chromas) {
        const candidate = oklchToHex({ l: lightness, c: chroma, h: hue });
        if (candidate && candidate !== hex) candidates.add(candidate);
      }
    }
  }
  return [...candidates];
}

function buildSuggestion(item, colors) {
  const beforeDistance = minimumDistanceFromOthers(item.hex, item, colors);
  if (beforeDistance >= SCREENING_CUE_LIMITS.close) return null;
  const currentRatios = relevantContrastRatios(item.hex, item, colors);
  let best = null;

  for (const candidateHex of boundedCandidateHexes(item.hex)) {
    const candidateRatios = relevantContrastRatios(candidateHex, item, colors);
    const contrastPreserved = candidateRatios.every(
      (ratio, index) => ratio + 1e-10 >= currentRatios[index],
    );
    if (!contrastPreserved) continue;
    const afterDistance = minimumDistanceFromOthers(candidateHex, item, colors);
    if (afterDistance < beforeDistance + 1.5) continue;
    const changeDistance = oklabScreeningDistance(item.hex, candidateHex);
    const minimumContrastBefore = currentRatios.length
      ? Math.min(...currentRatios)
      : null;
    const minimumContrastAfter = candidateRatios.length
      ? Math.min(...candidateRatios)
      : null;
    const candidate = {
      id: item.id,
      sourceIndex: item.sourceIndex,
      originalHex: item.hex,
      candidateHex,
      beforeDistance,
      afterDistance,
      changeDistance,
      minimumContrastBefore,
      minimumContrastAfter,
      relevantContrastPairs: currentRatios.length,
      contrastPreserved: true,
    };
    if (
      !best ||
      candidate.afterDistance > best.afterDistance + 0.001 ||
      (Math.abs(candidate.afterDistance - best.afterDistance) <= 0.001 &&
        candidate.changeDistance < best.changeDistance - 0.001) ||
      (Math.abs(candidate.afterDistance - best.afterDistance) <= 0.001 &&
        Math.abs(candidate.changeDistance - best.changeDistance) <= 0.001 &&
        candidate.candidateHex.localeCompare(best.candidateHex) < 0)
    ) {
      best = candidate;
    }
  }
  return best;
}

function makeContrastPairs(colors) {
  const textColors = colors.filter((color) => color.role === "text");
  const backgroundColors = colors.filter(
    (color) => color.role === "background",
  );
  return textColors.flatMap((textColor) =>
    backgroundColors.map((backgroundColor) => {
      const ratio = contrastRatio(textColor.hex, backgroundColor.hex);
      return {
        textId: textColor.id,
        textIndex: textColor.sourceIndex,
        backgroundId: backgroundColor.id,
        backgroundIndex: backgroundColor.sourceIndex,
        ratio,
        normalTextMeets45: ratio >= 4.5,
        largeTextMeets3: ratio >= 3,
      };
    }),
  );
}

export function analyzePalette(rows) {
  const validation = validatePaletteRows(rows);
  if (!validation.valid) {
    const error = new Error(
      validation.issues.map((issue) => issue.message).join(" "),
    );
    error.issues = validation.issues;
    throw error;
  }
  const colors = validation.colors.map((color) => ({
    ...color,
    views: colorViews(color.hex),
  }));
  const pairs = [];
  for (let leftIndex = 0; leftIndex < colors.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < colors.length;
      rightIndex += 1
    ) {
      pairs.push(analyzePair(colors[leftIndex], colors[rightIndex]));
    }
  }
  pairs.sort(
    (left, right) =>
      left.minimumDistance - right.minimumDistance ||
      left.leftIndex - right.leftIndex ||
      left.rightIndex - right.rightIndex,
  );
  const suggestions = colors
    .map((color) => buildSuggestion(color, colors))
    .filter(Boolean);
  const contrastPairs = makeContrastPairs(colors);
  return {
    colors,
    pairs,
    contrastPairs,
    suggestions,
    counts: {
      colors: colors.length,
      pairs: pairs.length,
      veryClose: pairs.filter((pair) => pair.cue === "very-close").length,
      close: pairs.filter((pair) => pair.cue === "close").length,
      separated: pairs.filter((pair) => pair.cue === "separated").length,
      duplicates: pairs.filter((pair) => pair.duplicate).length,
      contrastPairs: contrastPairs.length,
      contrastBelow45: contrastPairs.filter((pair) => !pair.normalTextMeets45)
        .length,
      suggestions: suggestions.length,
    },
  };
}

export function buildPrivacySafeCountsReport(analysis) {
  const ratios = analysis.contrastPairs.map((pair) => pair.ratio);
  return {
    schemaVersion: 1,
    tool: "colorblind-safe-palette-fixer",
    scope:
      "Counts only. User labels, roles, color values, pair identities, and suggested values are excluded.",
    model:
      "Fixed Machado-Oliveira-Fernandes severity-1 matrices in linear-light sRGB; screening preview only.",
    colorCount: analysis.counts.colors,
    pairCount: analysis.counts.pairs,
    cueCounts: {
      veryClose: analysis.counts.veryClose,
      close: analysis.counts.close,
      separated: analysis.counts.separated,
      exactDuplicates: analysis.counts.duplicates,
    },
    contrast: {
      roleBasedPairCount: analysis.counts.contrastPairs,
      below45Count: analysis.counts.contrastBelow45,
      minimumRatioBand: ratios.length
        ? Math.min(...ratios) < 3
          ? "below-3"
          : Math.min(...ratios) < 4.5
            ? "3-to-below-4.5"
            : "4.5-or-higher"
        : "not-applicable",
    },
    suggestionCount: analysis.counts.suggestions,
    limitations: [
      "Distance bands are editorial screening cues, not accessibility thresholds.",
      "Simulations do not diagnose color vision or guarantee one person's perception.",
      "Contrast calculations do not establish page-level WCAG conformance.",
      "Use visible text, icons, patterns, shape, or position in addition to color and test with users.",
    ],
  };
}
