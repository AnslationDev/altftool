import { hashString } from "@altftool/core/rabbithole/hash";
import { CATEGORIES, TIME_BANDS, VIBES } from "@altftool/core/rabbithole/taxonomy";

/**
 * Presentation helpers shared by server and client components.
 *
 * Deliberately imports only the taxonomy and the hash — never the catalog —
 * so a client component can use these without pulling 300 site records into
 * the browser bundle.
 */

const CATEGORY_TONE = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.tone]),
);

const CATEGORY_NAME = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.name]),
);

const TIME_LABEL = Object.fromEntries(
  TIME_BANDS.map((band) => [band.id, band.label]),
);

const VIBE_LABEL = Object.fromEntries(VIBES.map((vibe) => [vibe.id, vibe.label]));

export function toneVar(tone) {
  return `var(--rh-${tone || "stone"})`;
}

/** Inline style that arms every `--rh-hue`-derived token below `.rh-toned`. */
export function tonedStyle(tone) {
  return { "--rh-hue": toneVar(tone) };
}

export function categoryTone(categoryId) {
  return CATEGORY_TONE[categoryId] || "stone";
}

export function categoryName(categoryId) {
  return CATEGORY_NAME[categoryId] || "Uncategorised";
}

export function categoryStyle(categoryId) {
  return tonedStyle(categoryTone(categoryId));
}

export function timeLabel(bandId) {
  return TIME_LABEL[bandId] || bandId;
}

export function vibeLabel(vibeId) {
  return VIBE_LABEL[vibeId] || vibeId;
}

const LEADING_ARTICLE = /^(the|a|an)\s+/i;

/**
 * Monogram for the generated mark. Multi-word names collapse to initials so
 * "Every Noise at Once" reads EN; single words keep one letter. A leading
 * article is dropped first, otherwise half the catalog would be a wall of T.
 */
export function monogram(name = "") {
  const cleaned = name.replace(LEADING_ARTICLE, "").trim();
  if (!cleaned) return "?";

  const words = cleaned
    .split(/[\s._/-]+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);

  if (words.length === 0) return "?";

  if (words.length === 1) {
    const single = words[0];
    // Numeric names ("2048", "100000 Stars") read better with two digits.
    return /^\d/.test(single) ? single.slice(0, 2) : single.slice(0, 1);
  }

  return (words[0][0] + words[1][0]).slice(0, 2);
}

/**
 * Per-site variation for the mark's gradient. Derived from the slug so a site
 * looks the same on every page and across rebuilds.
 */
export function markStyle(slug = "", tone = "stone") {
  const hash = hashString(`mark:${slug}`);
  return {
    "--rh-hue": toneVar(tone),
    "--rh-mark-angle": `${hash % 360}deg`,
    "--rh-mark-x": `${18 + ((hash >>> 9) % 55)}%`,
    "--rh-mark-y": `${12 + ((hash >>> 17) % 50)}%`,
  };
}

export function deviceLabel(bestOn) {
  if (bestOn === "desktop") return "Best on desktop";
  if (bestOn === "mobile") return "Best on mobile";
  return "Works anywhere";
}

/** Short access summary used on cards and in the detail meta table. */
export function accessLabel(site) {
  if (!site.free) return "Paid";
  return site.needsAccount ? "Free, sign-up needed" : "Free, no sign-up";
}
