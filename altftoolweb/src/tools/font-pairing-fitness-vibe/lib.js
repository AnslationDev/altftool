/**
 * Fitness Brand Font Pairing — pair table plus headline fitting maths.
 * Pure module: no React, no DOM, no clock.
 *
 * Condensed display faces exist to fit more characters into a fixed width, so
 * the useful calculation is the inverse of a type scale: given a container and
 * a headline, what is the largest size that still fits on one line, and how
 * many characters can you afford before it has to wrap?
 */

const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif';
const CONDENSED_FALLBACK = '"Arial Narrow", "Helvetica Neue Condensed", Impact, sans-serif';

/**
 * `avgCharEm` is the average advance width of upper-case display text as a
 * share of the em. Condensed faces sit near 0.40-0.45; normal-width grotesques
 * near 0.55-0.60; heavy faces wider still.
 */
export const PAIRS = [
  {
    id: "oswald-roboto",
    name: "Oswald + Roboto",
    heading: { family: "Oswald", weight: 600, avgCharEm: 0.44, stack: `"Oswald", ${CONDENSED_FALLBACK}` },
    body: { family: "Roboto", weight: 400, avgCharEm: 0.5, stack: `"Roboto", ${SANS_FALLBACK}` },
    why: "The default gym pairing. Oswald is condensed enough for a two-word headline on a phone; Roboto keeps class schedules dense and readable.",
  },
  {
    id: "anton-inter",
    name: "Anton + Inter",
    heading: { family: "Anton", weight: 400, avgCharEm: 0.46, stack: `"Anton", ${CONDENSED_FALLBACK}` },
    body: { family: "Inter", weight: 400, avgCharEm: 0.5, stack: `"Inter", ${SANS_FALLBACK}` },
    why: "Anton is a single ultra-bold weight — maximum shout per pixel, but it has no lighter cut, so all hierarchy has to come from size.",
  },
  {
    id: "barlow-pair",
    name: "Barlow Condensed + Barlow",
    heading: { family: "Barlow Condensed", weight: 700, avgCharEm: 0.42, stack: `"Barlow Condensed", ${CONDENSED_FALLBACK}` },
    body: { family: "Barlow", weight: 400, avgCharEm: 0.49, stack: `"Barlow", ${SANS_FALLBACK}` },
    why: "One superfamily, two widths. The safest choice when the same brand has to cover an app, signage and print.",
  },
  {
    id: "teko-rubik",
    name: "Teko + Rubik",
    heading: { family: "Teko", weight: 600, avgCharEm: 0.4, stack: `"Teko", ${CONDENSED_FALLBACK}` },
    body: { family: "Rubik", weight: 400, avgCharEm: 0.52, stack: `"Rubik", ${SANS_FALLBACK}` },
    why: "Teko is the narrowest option here and covers Devanagari, which makes it practical for Indian gym and sports brands.",
  },
  {
    id: "bebas-opensans",
    name: "Bebas Neue + Open Sans",
    heading: { family: "Bebas Neue", weight: 400, avgCharEm: 0.42, stack: `"Bebas Neue", ${CONDENSED_FALLBACK}` },
    body: { family: "Open Sans", weight: 400, avgCharEm: 0.5, stack: `"Open Sans", ${SANS_FALLBACK}` },
    why: "Caps-only by design, so it never fights with sentence-case body text. Ideal for supplement labels and class names.",
  },
  {
    id: "archivo-black",
    name: "Archivo Black + Archivo",
    heading: { family: "Archivo Black", weight: 400, avgCharEm: 0.62, stack: `"Archivo Black", ${SANS_FALLBACK}` },
    body: { family: "Archivo", weight: 400, avgCharEm: 0.5, stack: `"Archivo", ${SANS_FALLBACK}` },
    why: "Wide and heavy rather than tall and narrow — use it when the headline is short and you want mass instead of height.",
  },
];

/** Common container widths in CSS pixels. */
export const CONTAINERS = [
  { id: "phone", label: "Phone hero (375 px)", widthPx: 343 },
  { id: "story", label: "Story / Reel (1080 px)", widthPx: 1000 },
  { id: "square", label: "Square post (1080 px)", widthPx: 1000 },
  { id: "desktop", label: "Desktop hero (1440 px)", widthPx: 1200 },
  { id: "banner", label: "Gym banner (3000 px)", widthPx: 2800 },
];

/** Practical size limits for a single-line display headline. */
export const MIN_DISPLAY_PX = 16;
export const MAX_DISPLAY_PX = 400;

const isPositive = (value) => Number.isFinite(value) && value > 0;

/** Estimated rendered width of a string at a given size. */
export function estimateTextWidth({ text, fontSizePx, avgCharEm }) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Enter the headline text." };
  }
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(avgCharEm) || avgCharEm > 2) {
    return { error: "Average character width should be between 0 and 2 em." };
  }
  const chars = text.trim().length;
  return { chars, widthPx: chars * avgCharEm * fontSizePx };
}

/**
 * Largest whole-pixel size at which the headline still fits on one line inside
 * the container. Returns { error } when even the minimum size overflows.
 */
export function fitHeadline({ text, containerWidthPx, avgCharEm, maxSizePx = MAX_DISPLAY_PX }) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Enter the headline text." };
  }
  if (!isPositive(containerWidthPx)) return { error: "Container width must be greater than zero." };
  if (!isPositive(avgCharEm) || avgCharEm > 2) {
    return { error: "Average character width should be between 0 and 2 em." };
  }
  const cap = isPositive(maxSizePx) ? Math.min(maxSizePx, MAX_DISPLAY_PX) : MAX_DISPLAY_PX;

  const chars = text.trim().length;
  const exact = containerWidthPx / (chars * avgCharEm);
  const fitted = Math.floor(Math.min(exact, cap));

  if (fitted < MIN_DISPLAY_PX) {
    return {
      error: `"${text.trim()}" needs ${chars} characters of width. At ${containerWidthPx} px it would have to drop below ${MIN_DISPLAY_PX} px — shorten the headline or let it wrap onto two lines.`,
    };
  }

  const usedPx = chars * avgCharEm * fitted;
  return {
    chars,
    exactPx: Math.round(exact * 100) / 100,
    fittedPx: fitted,
    cappedByMax: exact > cap,
    usedPx: Math.round(usedPx * 100) / 100,
    slackPx: Math.round((containerWidthPx - usedPx) * 100) / 100,
  };
}

/** How many characters fit on one line at a fixed size? */
export function charsThatFit({ containerWidthPx, fontSizePx, avgCharEm }) {
  if (!isPositive(containerWidthPx)) return { error: "Container width must be greater than zero." };
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(avgCharEm) || avgCharEm > 2) {
    return { error: "Average character width should be between 0 and 2 em." };
  }
  return { chars: Math.floor(containerWidthPx / (fontSizePx * avgCharEm)) };
}

/**
 * Split a headline into balanced lines without breaking words — the standard
 * greedy fill used by layout engines, applied to the character budget.
 */
export function wrapHeadline({ text, containerWidthPx, fontSizePx, avgCharEm }) {
  const budget = charsThatFit({ containerWidthPx, fontSizePx, avgCharEm });
  if (budget.error) return budget;
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Enter the headline text." };
  }
  if (budget.chars < 1) return { error: "At this size not even one character fits — reduce the size." };

  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= budget.chars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return { lines, perLine: budget.chars, longest: Math.max(...lines.map((line) => line.length)) };
}

/** Condensed display type set in caps needs a little tracking to stop crowding. */
export const CAPS_TRACKING_EM = 0.02;

export function buildFontUrl(pair) {
  if (!pair || !pair.heading || !pair.body) return { error: "Pick a font pair first." };
  const families = [
    `${pair.heading.family.replace(/ /g, "+")}:wght@${pair.heading.weight}`,
    `${pair.body.family.replace(/ /g, "+")}:wght@${pair.body.weight}`,
  ];
  return { url: `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap` };
}

export const ROOT_FONT_SIZE_PX = 16;

/** Everything the page needs. */
export function buildFitnessReport({ pairId, headline, containerId, customWidthPx, bodySizePx = 16, allCaps = true }) {
  const pair = PAIRS.find((item) => item.id === pairId);
  if (!pair) return { error: "Pick one of the fitness font pairs." };

  const container = CONTAINERS.find((item) => item.id === containerId);
  const widthPx = isPositive(customWidthPx) ? customWidthPx : container ? container.widthPx : NaN;
  if (!isPositive(widthPx) || widthPx > 10000) {
    return { error: "Container width should be a positive value up to 10000 px." };
  }
  if (!isPositive(bodySizePx) || bodySizePx < 10 || bodySizePx > 48) {
    return { error: "Body size should be between 10 px and 48 px." };
  }

  const fit = fitHeadline({ text: headline, containerWidthPx: widthPx, avgCharEm: pair.heading.avgCharEm });
  if (fit.error) return fit;

  const wrapped = wrapHeadline({
    text: headline,
    containerWidthPx: widthPx,
    fontSizePx: fit.fittedPx,
    avgCharEm: pair.heading.avgCharEm,
  });

  const bodyBudget = charsThatFit({
    containerWidthPx: widthPx,
    fontSizePx: bodySizePx,
    avgCharEm: pair.body.avgCharEm,
  });

  const css = `:root {
  --font-display: ${pair.heading.stack};
  --font-body: ${pair.body.stack};
}

.hero-headline {
  font-family: var(--font-display);
  font-weight: ${pair.heading.weight};
  font-size: ${Math.round((fit.fittedPx / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
  line-height: 0.95;
  letter-spacing: ${allCaps ? CAPS_TRACKING_EM : 0}em;${allCaps ? "\n  text-transform: uppercase;" : ""}
}

body {
  font-family: var(--font-body);
  font-weight: ${pair.body.weight};
  font-size: ${Math.round((bodySizePx / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
  line-height: 1.55;
}`;

  const fontUrl = buildFontUrl(pair);

  return {
    pair,
    widthPx,
    fit,
    wrapped: wrapped.error ? null : wrapped,
    bodyBudget: bodyBudget.error ? null : bodyBudget,
    allCaps,
    css,
    fontUrl: fontUrl.url,
  };
}
