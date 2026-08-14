/**
 * AltF Detour — site record schema and validator.
 *
 * The catalog is assembled from many hand-written data files. Nothing enforces
 * their shape at author time, so this module is the gate: `validateCatalog`
 * runs in the unit test and in the prebuild, and a bad record fails the build
 * rather than rendering a broken card in production.
 *
 * Every rule here exists because getting it wrong is silent. A bad category id
 * drops the entry off its landing page; a duplicate slug makes one of two
 * detail pages unreachable; a relative URL on an external site sends the
 * visitor to a 404 on our own domain.
 */

import {
  CATEGORY_IDS,
  DEVICES,
  TIME_BAND_IDS,
  VIBE_IDS,
} from "./taxonomy.js";

const CATEGORY_SET = new Set(CATEGORY_IDS);
const VIBE_SET = new Set(VIBE_IDS);
const TIME_SET = new Set(TIME_BAND_IDS);
const DEVICE_SET = new Set(DEVICES);

/** Origin decides whether a click leaves AltFTool. */
export const ORIGINS = Object.freeze(["web", "altf"]);
const ORIGIN_SET = new Set(ORIGINS);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Blurbs are the whole product. Too short and the card says nothing; too long
 * and the grid breaks rhythm. These bounds are what the card layout was
 * designed against.
 */
const BLURB_MIN = 40;
const BLURB_MAX = 190;

export function slugifyName(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * Validates one record. Returns an array of human-readable problems, empty when
 * the record is good. Never throws — the caller aggregates across the catalog
 * so one bad file reports every problem at once rather than the first.
 */
export function validateSite(site, index = 0) {
  const errors = [];
  const at = site?.slug || site?.name || `#${index}`;
  const fail = (message) => errors.push(`[${at}] ${message}`);

  if (!site || typeof site !== "object") {
    return [`[#${index}] record is not an object`];
  }

  if (typeof site.name !== "string" || site.name.trim().length < 2) {
    fail("name must be a non-empty string");
  }

  if (typeof site.slug !== "string" || !SLUG_RE.test(site.slug)) {
    fail(`slug "${site.slug}" must be lowercase kebab-case`);
  }

  if (typeof site.url !== "string" || site.url.length === 0) {
    fail("url is required");
  } else if (site.origin === "altf") {
    // Internal destinations are Next routes, so they must be root-relative —
    // an absolute URL here would bypass client routing and hit the network.
    if (!site.url.startsWith("/")) {
      fail(`altf origin requires a root-relative url, got "${site.url}"`);
    }
  } else if (!/^https?:\/\/.+\..+/.test(site.url)) {
    fail(`url "${site.url}" must be an absolute http(s) URL`);
  }

  if (!CATEGORY_SET.has(site.category)) {
    fail(`unknown category "${site.category}"`);
  }

  if (!Array.isArray(site.vibes) || site.vibes.length === 0) {
    fail("vibes must be a non-empty array");
  } else {
    if (site.vibes.length > 3) fail(`carries ${site.vibes.length} vibes, max 3`);
    site.vibes.forEach((vibe) => {
      if (!VIBE_SET.has(vibe)) fail(`unknown vibe "${vibe}"`);
    });
    if (new Set(site.vibes).size !== site.vibes.length) {
      fail("vibes contains duplicates");
    }
  }

  if (!TIME_SET.has(site.timeToJoy)) {
    fail(`unknown timeToJoy "${site.timeToJoy}"`);
  }

  if (typeof site.blurb !== "string") {
    fail("blurb is required");
  } else if (site.blurb.length < BLURB_MIN || site.blurb.length > BLURB_MAX) {
    fail(
      `blurb is ${site.blurb.length} chars, must be ${BLURB_MIN}-${BLURB_MAX}`,
    );
  }

  if (!DEVICE_SET.has(site.bestOn)) {
    fail(`unknown bestOn "${site.bestOn}"`);
  }

  if (site.origin !== undefined && !ORIGIN_SET.has(site.origin)) {
    fail(`unknown origin "${site.origin}"`);
  }

  ["sfw", "needsSound", "free", "needsAccount"].forEach((flag) => {
    if (typeof site[flag] !== "boolean") {
      fail(`${flag} must be a boolean`);
    }
  });

  if (site.year !== undefined) {
    if (
      typeof site.year !== "number" ||
      !Number.isInteger(site.year) ||
      site.year < 1990 ||
      site.year > 2026
    ) {
      fail(`year "${site.year}" must be an integer between 1990 and 2026`);
    }
  }

  if (site.acclaimed !== undefined && typeof site.acclaimed !== "boolean") {
    fail("acclaimed must be a boolean when present");
  }

  return errors;
}

/** Fills the optional fields so downstream code never has to null-check. */
export function normaliseSite(site) {
  return {
    ...site,
    origin: site.origin ?? "web",
    acclaimed: site.acclaimed ?? false,
    vibes: Object.freeze([...site.vibes]),
  };
}

/**
 * Validates the whole catalog and reports cross-record problems that a
 * per-record check cannot see: duplicate slugs, duplicate URLs, and categories
 * left with too few entries to justify a landing page.
 */
export function validateCatalog(sites, { minPerCategory = 4 } = {}) {
  const errors = [];
  const slugs = new Map();
  const urls = new Map();
  const perCategory = new Map();

  sites.forEach((site, index) => {
    errors.push(...validateSite(site, index));

    if (site?.slug) {
      if (slugs.has(site.slug)) {
        errors.push(
          `duplicate slug "${site.slug}" (also used by "${slugs.get(site.slug)}")`,
        );
      } else {
        slugs.set(site.slug, site.name);
      }
    }

    if (site?.url) {
      const key = site.url.replace(/\/+$/, "").toLowerCase();
      if (urls.has(key)) {
        errors.push(
          `duplicate url "${site.url}" on "${site.slug}" and "${urls.get(key)}"`,
        );
      } else {
        urls.set(key, site.slug);
      }
    }

    if (site?.category) {
      perCategory.set(site.category, (perCategory.get(site.category) ?? 0) + 1);
    }
  });

  // An empty category page is worse than no category page — it ranks for a
  // term and then disappoints. Surfaced as an error so it is fixed, not shipped.
  CATEGORY_IDS.forEach((id) => {
    const count = perCategory.get(id) ?? 0;
    if (count < minPerCategory) {
      errors.push(
        `category "${id}" has ${count} sites, needs at least ${minPerCategory}`,
      );
    }
  });

  return errors;
}

export const SCHEMA_DOC = Object.freeze({
  blurbMin: BLURB_MIN,
  blurbMax: BLURB_MAX,
  maxVibes: 3,
});
