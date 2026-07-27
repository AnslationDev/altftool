/**
 * Luxury Vibe Font Pairing — pair table, optical tracking and hairline-stroke
 * rendering maths. Pure module: no React, no DOM, no clock.
 *
 * The two ideas that make luxury typography work are optical size compensation
 * (large type needs tighter letter-spacing, small type needs looser) and
 * stroke contrast (a Didone hairline can fall below one device pixel and grey
 * out). Both are computed here rather than eyeballed.
 */

const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif';
const SERIF_FALLBACK = 'Georgia, "Times New Roman", "Iowan Old Style", serif';

/**
 * `contrast` is the approximate stem-to-hairline thickness ratio of the
 * heading face: Didone/modern faces sit near 8:1, transitional faces near 4:1,
 * old-style and humanist faces near 2.5:1.
 */
export const PAIRS = [
  {
    id: "playfair-lato",
    name: "Playfair Display + Lato",
    heading: { family: "Playfair Display", weight: 500, contrast: 6, stack: `"Playfair Display", ${SERIF_FALLBACK}` },
    body: { family: "Lato", weight: 400, stack: `"Lato", ${SANS_FALLBACK}` },
    why: "A transitional-to-modern serif with strong vertical stress over a humanist sans — the default premium editorial pairing for a reason.",
  },
  {
    id: "cormorant-montserrat",
    name: "Cormorant Garamond + Montserrat",
    heading: { family: "Cormorant Garamond", weight: 600, contrast: 5, stack: `"Cormorant Garamond", ${SERIF_FALLBACK}` },
    body: { family: "Montserrat", weight: 400, stack: `"Montserrat", ${SANS_FALLBACK}` },
    why: "Cormorant is drawn for display sizes; its small x-height needs size and air, which is exactly what a hero headline gives it.",
  },
  {
    id: "bodoni-jost",
    name: "Bodoni Moda + Jost",
    heading: { family: "Bodoni Moda", weight: 500, contrast: 8, stack: `"Bodoni Moda", ${SERIF_FALLBACK}` },
    body: { family: "Jost", weight: 300, stack: `"Jost", ${SANS_FALLBACK}` },
    why: "A true Didone against a geometric sans. The most fashion-adjacent pairing here, and the most fragile at small sizes.",
  },
  {
    id: "marcellus-karla",
    name: "Marcellus + Karla",
    heading: { family: "Marcellus", weight: 400, contrast: 3, stack: `"Marcellus", ${SERIF_FALLBACK}` },
    body: { family: "Karla", weight: 400, stack: `"Karla", ${SANS_FALLBACK}` },
    why: "Marcellus takes its proportions from Roman inscriptional capitals, so it holds up in all caps for hotel and spa branding.",
  },
  {
    id: "baskerville-source",
    name: "Libre Baskerville + Source Sans 3",
    heading: { family: "Libre Baskerville", weight: 400, contrast: 4, stack: `"Libre Baskerville", ${SERIF_FALLBACK}` },
    body: { family: "Source Sans 3", weight: 300, stack: `"Source Sans 3", ${SANS_FALLBACK}` },
    why: "The most durable option: Libre Baskerville was drawn for screen body text, so it survives small sizes better than a display Didone.",
  },
  {
    id: "italiana-lato",
    name: "Italiana + Lato",
    heading: { family: "Italiana", weight: 400, contrast: 7, stack: `"Italiana", ${SERIF_FALLBACK}` },
    body: { family: "Lato", weight: 300, stack: `"Lato", ${SANS_FALLBACK}` },
    why: "Extremely delicate capitals for a wordmark or a single hero line. Never use it below display size.",
  },
];

/**
 * Optical tracking. Type set large needs its letter-spacing pulled in, type set
 * small needs it opened up; the pivot is the 16 px reference size at which most
 * text faces are drawn to look correct with no tracking at all.
 */
export const TRACKING_PIVOT_PX = 16;
export const TRACKING_TIGHTEN_PER_PX = 0.0005; // em removed for each px above the pivot
export const TRACKING_LOOSEN_PER_PX = 0.0025; // em added for each px below the pivot
export const TRACKING_LIMIT_EM = 0.03;
/** All-caps settings lose the word-shape cue, so they need extra letter-space. */
export const CAPS_EXTRA_EM = 0.08;

const isPositive = (value) => Number.isFinite(value) && value > 0;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function recommendTracking({ fontSizePx, allCaps = false }) {
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  const raw =
    fontSizePx >= TRACKING_PIVOT_PX
      ? -(fontSizePx - TRACKING_PIVOT_PX) * TRACKING_TIGHTEN_PER_PX
      : (TRACKING_PIVOT_PX - fontSizePx) * TRACKING_LOOSEN_PER_PX;
  const em = clamp(raw, -TRACKING_LIMIT_EM, TRACKING_LIMIT_EM) + (allCaps ? CAPS_EXTRA_EM : 0);
  return {
    em: Math.round(em * 10000) / 10000,
    px: Math.round(em * fontSizePx * 100) / 100,
    css: `${Math.round(em * 10000) / 10000}em`,
  };
}

/**
 * Hairline check. In a regular weight the stem of a Latin letter is close to
 * 8% of the em; the thin stroke is that divided by the face's stroke contrast.
 * A stroke thinner than half a device pixel is rendered as pale grey antialias
 * rather than a solid line, which is what makes a Didone look washed out on
 * screen at body sizes.
 */
export const STEM_RATIO_EM = 0.08;
export const MIN_DEVICE_PX = 0.5;

export function hairlineCheck({ fontSizePx, contrast, devicePixelRatio = 2 }) {
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(contrast)) return { error: "Stroke contrast must be greater than zero." };
  const dpr = isPositive(devicePixelRatio) ? devicePixelRatio : 1;

  const stemPx = fontSizePx * STEM_RATIO_EM;
  const hairlineCssPx = stemPx / contrast;
  const hairlineDevicePx = hairlineCssPx * dpr;
  const minSizePx = (MIN_DEVICE_PX * contrast) / (STEM_RATIO_EM * dpr);

  return {
    stemPx: Math.round(stemPx * 100) / 100,
    hairlineCssPx: Math.round(hairlineCssPx * 1000) / 1000,
    hairlineDevicePx: Math.round(hairlineDevicePx * 1000) / 1000,
    minSizePx: Math.round(minSizePx * 10) / 10,
    solid: hairlineDevicePx >= MIN_DEVICE_PX,
    note:
      hairlineDevicePx >= MIN_DEVICE_PX
        ? `Hairlines land on ${(Math.round(hairlineDevicePx * 100) / 100).toFixed(2)} device pixels — they stay visible.`
        : `Hairlines land on only ${(Math.round(hairlineDevicePx * 100) / 100).toFixed(2)} device pixels and will grey out. Use this face at ${Math.round(minSizePx)} px or larger, or pick a lower-contrast serif.`,
  };
}

/** Modular scale, same construction as any type system. */
export const ROOT_FONT_SIZE_PX = 16;
export const RATIOS = [
  { id: "major-third", label: "Major third", value: 1.25 },
  { id: "perfect-fourth", label: "Perfect fourth", value: 1.333 },
  { id: "augmented-fourth", label: "Augmented fourth", value: 1.414 },
  { id: "perfect-fifth", label: "Perfect fifth", value: 1.5 },
  { id: "golden", label: "Golden ratio", value: 1.618 },
];

export function buildTypeScale({ base, ratio, stepsUp = 5, stepsDown = 1 }) {
  if (!isPositive(base)) return { error: "Base font size must be greater than zero." };
  if (!isPositive(ratio) || ratio < 1 || ratio > 3) {
    return { error: "Scale ratio should be between 1 and 3." };
  }
  const steps = [];
  for (let i = -Math.round(stepsDown); i <= Math.round(stepsUp); i += 1) {
    const px = base * Math.pow(ratio, i);
    steps.push({
      step: i,
      px: Math.round(px * 100) / 100,
      rem: Math.round((px / ROOT_FONT_SIZE_PX) * 1000) / 1000,
    });
  }
  return { steps, base, ratio };
}

export function buildFontUrl(pair) {
  if (!pair || !pair.heading || !pair.body) return { error: "Pick a font pair first." };
  const families = [
    `${pair.heading.family.replace(/ /g, "+")}:wght@${pair.heading.weight}`,
    `${pair.body.family.replace(/ /g, "+")}:wght@${pair.body.weight}`,
  ];
  return { url: `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap` };
}

/** Full report for the page. */
export function buildLuxuryReport({ pairId, base, ratio, displaySizePx, allCaps = false, devicePixelRatio = 2 }) {
  const pair = PAIRS.find((item) => item.id === pairId);
  if (!pair) return { error: "Pick one of the luxury font pairs." };
  if (!isPositive(base) || base < 13 || base > 28) {
    return { error: "Body size should be between 13 px and 28 px." };
  }
  if (!isPositive(displaySizePx) || displaySizePx > 400) {
    return { error: "Display size should be a positive value up to 400 px." };
  }

  const scale = buildTypeScale({ base, ratio });
  if (scale.error) return scale;

  const displayTracking = recommendTracking({ fontSizePx: displaySizePx, allCaps });
  if (displayTracking.error) return displayTracking;
  const bodyTracking = recommendTracking({ fontSizePx: base });
  if (bodyTracking.error) return bodyTracking;

  const displayHairline = hairlineCheck({ fontSizePx: displaySizePx, contrast: pair.heading.contrast, devicePixelRatio });
  if (displayHairline.error) return displayHairline;
  const smallHairline = hairlineCheck({ fontSizePx: base, contrast: pair.heading.contrast, devicePixelRatio });
  if (smallHairline.error) return smallHairline;

  const css = `:root {
  --font-display: ${pair.heading.stack};
  --font-body: ${pair.body.stack};
}

.display {
  font-family: var(--font-display);
  font-weight: ${pair.heading.weight};
  font-size: ${Math.round((displaySizePx / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
  line-height: 1.08;
  letter-spacing: ${displayTracking.css};${allCaps ? "\n  text-transform: uppercase;" : ""}
}

body {
  font-family: var(--font-body);
  font-weight: ${pair.body.weight};
  font-size: ${Math.round((base / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
  line-height: 1.65;
  letter-spacing: ${bodyTracking.css};
}`;

  const fontUrl = buildFontUrl(pair);

  return {
    pair,
    scale,
    displayTracking,
    bodyTracking,
    displayHairline,
    smallHairline,
    css,
    fontUrl: fontUrl.url,
  };
}
