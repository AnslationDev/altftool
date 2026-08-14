import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  ALL_SITES,
  ALTF_ORIGINALS,
  FACETS,
  STATS,
  getRelatedSites,
  getSite,
  getSitesByCategory,
} from "./catalog.js";
import { validateCatalog } from "./schema.js";
import {
  CATEGORIES,
  CATEGORY_IDS,
  COLLECTIONS,
  FAMILIES,
  FAMILY_IDS,
  TIME_BANDS,
  VIBES,
} from "./taxonomy.js";
import {
  filterSites,
  pickDetour,
  pickRandom,
  rememberPick,
} from "./randomiser.js";

// packages/core/src/detour → the Next app root four levels up.
const webRoot = path.resolve(import.meta.dirname, "../../../..");

// --------------------------------------------------------------- taxonomy ---

test("taxonomy ids are unique across every dimension", () => {
  const check = (label, ids) =>
    assert.equal(
      new Set(ids).size,
      ids.length,
      `${label} contains duplicate ids`,
    );

  check("families", FAMILY_IDS);
  check("categories", CATEGORY_IDS);
  check(
    "vibes",
    VIBES.map((v) => v.id),
  );
  check(
    "time bands",
    TIME_BANDS.map((b) => b.id),
  );
  check(
    "collections",
    COLLECTIONS.map((c) => c.id),
  );
});

test("every category belongs to a real family", () => {
  const families = new Set(FAMILY_IDS);
  CATEGORIES.forEach((category) => {
    assert.ok(
      families.has(category.family),
      `category "${category.id}" has unknown family "${category.family}"`,
    );
  });
});

test("every category carries the copy its landing page needs", () => {
  CATEGORIES.forEach((category) => {
    assert.ok(category.name?.length > 2, `${category.id} has no name`);
    assert.ok(category.blurb?.length > 10, `${category.id} has no blurb`);
    assert.ok(category.intro?.length > 40, `${category.id} has a thin intro`);
    // Google truncates around 160; over 175 is certainly being cut off.
    assert.ok(
      category.metaDescription?.length > 50 &&
        category.metaDescription.length <= 175,
      `${category.id} metaDescription is ${category.metaDescription?.length} chars`,
    );
  });
});

test("every icon name resolves in lucide-react", async () => {
  // Guards the failure mode that motivated the Icon fallback: an unknown name
  // renders nothing at all, with no error anywhere.
  const lucide = await import("lucide-react");
  const names = [
    ...FAMILIES.map((f) => f.icon),
    ...CATEGORIES.map((c) => c.icon),
    ...COLLECTIONS.map((c) => c.icon),
  ];

  names.forEach((name) => {
    assert.ok(
      typeof lucide[name] === "function" || typeof lucide[name] === "object",
      `"${name}" is not exported by lucide-react`,
    );
  });
});

// ---------------------------------------------------------------- catalog ---

test("the catalog validates against the schema", () => {
  const errors = validateCatalog(ALL_SITES);
  assert.deepEqual(
    errors,
    [],
    `catalog has ${errors.length} problems:\n${errors.slice(0, 25).join("\n")}`,
  );
});

test("the catalog beats the reference directory it was built against", () => {
  // bored.com carries roughly 900 links across 68 categories. Being smaller
  // than the thing we set out to improve on would make the whole section
  // pointless, so it is asserted rather than assumed.
  assert.ok(
    ALL_SITES.length >= 900,
    `catalog has ${ALL_SITES.length} sites, expected at least 900`,
  );
  assert.ok(
    CATEGORIES.length >= 68,
    `catalog has ${CATEGORIES.length} categories, expected at least 68`,
  );
});

test("slugs and urls are unique", () => {
  const slugs = new Set();
  const urls = new Set();

  ALL_SITES.forEach((site) => {
    assert.ok(!slugs.has(site.slug), `duplicate slug "${site.slug}"`);
    slugs.add(site.slug);

    const key = site.url.replace(/\/+$/, "").toLowerCase();
    assert.ok(!urls.has(key), `duplicate url "${site.url}"`);
    urls.add(key);
  });
});

test("no two entries point at the same destination", () => {
  // Stricter than the schema's exact-string check: independent authors reach
  // one site by several spellings of its address, and www-vs-not or a trailing
  // slash was enough to list the same website twice.
  const seen = new Map();
  ALL_SITES.forEach((site) => {
    const key = site.url
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "");
    assert.ok(
      !seen.has(key),
      `"${site.name}" and "${seen.get(key)}" both resolve to ${key}`,
    );
    seen.set(key, site.name);
  });
});

test("no two entries of the same origin share a display name", () => {
  // A list showing "Level Devil" twice looks broken even when the URLs differ.
  // Cross-origin duplicates are allowed on purpose: an AltF build and the
  // classic that inspired it are two real destinations, so they are renamed
  // rather than collapsed.
  const seen = new Map();
  ALL_SITES.forEach((site) => {
    const key = `${site.origin}::${site.name.trim().toLowerCase()}`;
    assert.ok(!seen.has(key), `duplicate name "${site.name}" (${site.origin})`);
    seen.set(key, site.slug);
  });
});

test("facet counts add up to the catalog", () => {
  const byCategory = Object.values(FACETS.category).reduce((a, b) => a + b, 0);
  assert.equal(byCategory, ALL_SITES.length);

  const byTime = Object.values(FACETS.timeToJoy).reduce((a, b) => a + b, 0);
  assert.equal(byTime, ALL_SITES.length);

  assert.equal(STATS.sites, ALL_SITES.length);
  assert.equal(STATS.originals + STATS.external, ALL_SITES.length);
});

test("every category has enough entries to justify a landing page", () => {
  CATEGORY_IDS.forEach((id) => {
    assert.ok(
      getSitesByCategory(id).length >= 8,
      `category "${id}" has ${getSitesByCategory(id).length} sites`,
    );
  });
});

test("no category outgrows a single listing page", () => {
  /*
   * The category route drops `searchParams` so all 91 pages can render
   * statically, which means it has no pagination. SiteListing still slices to
   * 48, so a category that grew past that would silently stop showing its tail
   * with nothing to indicate it. This is the guard the route comment points at.
   */
  const PER_PAGE = 48;
  CATEGORY_IDS.forEach((id) => {
    const count = getSitesByCategory(id).length;
    assert.ok(
      count <= PER_PAGE,
      `category "${id}" has ${count} sites, above the ${PER_PAGE} shown on its unpaginated page — either split it or restore searchParams there`,
    );
  });
});

test("every collection matches at least one site", () => {
  COLLECTIONS.forEach((collection) => {
    assert.ok(
      FACETS.collection[collection.id] > 0,
      `collection "${collection.id}" is empty`,
    );
  });
});

// -------------------------------------------------------------- originals ---

test("every AltF original points at a route that exists", () => {
  // The random button can serve these, so a broken internal link is a 404 on
  // our own domain — the one failure mode this section cannot afford.
  ALTF_ORIGINALS.forEach((site) => {
    assert.ok(site.url.startsWith("/"), `${site.slug} is not root-relative`);

    const segments = site.url.split("/").filter(Boolean);
    const isToy = site.url.startsWith("/detour/play/");

    const routeDir = isToy
      ? path.join(webRoot, "src/app/detour/play/[slug]")
      : path.join(webRoot, "src/app", ...segments);

    const hasPage =
      existsSync(path.join(routeDir, "page.jsx")) ||
      existsSync(path.join(routeDir, "page.js")) ||
      existsSync(path.join(routeDir, "page.tsx"));

    assert.ok(hasPage, `${site.slug} → ${site.url} has no page component`);
  });
});

test("toy registry and catalog entries stay in step", async () => {
  const { TOY_SLUGS } = await import(
    path.join(webRoot, "src/app/detour/play/_toys/registry.js")
  );

  const catalogued = ALTF_ORIGINALS.filter((site) =>
    site.url.startsWith("/detour/play/"),
  ).map((site) => site.url.replace("/detour/play/", ""));

  assert.deepEqual(
    [...catalogued].sort(),
    [...TOY_SLUGS].sort(),
    "toys in the registry and toys in the catalog do not match",
  );
});

// ------------------------------------------------------------- randomiser ---

test("filters narrow the catalog correctly", () => {
  const instant = filterSites(ALL_SITES, { timeToJoy: "instant" });
  assert.ok(instant.length > 0);
  assert.ok(instant.every((site) => site.timeToJoy === "instant"));

  const safe = filterSites(ALL_SITES, { sfwOnly: true, silentOnly: true });
  assert.ok(safe.every((site) => site.sfw && !site.needsSound));

  const funny = filterSites(ALL_SITES, { vibes: ["funny"] });
  assert.ok(funny.every((site) => site.vibes.includes("funny")));

  const originals = filterSites(ALL_SITES, { originalsOnly: true });
  assert.equal(originals.length, ALTF_ORIGINALS.length);
});

test("an impossible filter combination returns nothing rather than throwing", () => {
  const none = filterSites(ALL_SITES, {
    categories: ["not-a-real-category"],
  });
  assert.equal(none.length, 0);
  assert.equal(pickRandom(none), null);
});

test("the picker is deterministic given a fixed random source", () => {
  const first = pickRandom(ALL_SITES, { random: () => 0 });
  const again = pickRandom(ALL_SITES, { random: () => 0 });
  assert.equal(first.slug, again.slug);
});

test("the picker respects the exclusion set", () => {
  const pool = ALL_SITES.slice(0, 5);
  const exclude = new Set(pool.slice(0, 4).map((site) => site.slug));
  const picked = pickRandom(pool, { exclude, random: () => 0.5 });
  assert.equal(picked.slug, pool[4].slug);
});

test("exclusion is dropped rather than returning nothing", () => {
  const pool = ALL_SITES.slice(0, 3);
  const exclude = new Set(pool.map((site) => site.slug));
  assert.ok(pickRandom(pool, { exclude }) !== null);
});

test("originals are weighted up but do not dominate", () => {
  // 4000 draws off a fixed sequence: enough to be stable, and asserting a band
  // rather than an exact figure so the test does not break on a small
  // catalog change.
  // Integer-state LCG. A float-state one converges to a fixed point within a
  // few iterations and then returns the same value forever, which silently
  // turns 4000 draws into one.
  let seed = 123456789;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  let originals = 0;
  const draws = 4000;
  for (let index = 0; index < draws; index += 1) {
    if (pickDetour(ALL_SITES, { random })?.origin === "altf") originals += 1;
  }

  const share = originals / draws;
  const naturalShare = ALTF_ORIGINALS.length / ALL_SITES.length;

  assert.ok(
    share > naturalShare,
    `originals share ${share.toFixed(3)} should exceed natural ${naturalShare.toFixed(3)}`,
  );
  assert.ok(
    share < 0.35,
    `originals share ${share.toFixed(3)} is too high — the external web should dominate`,
  );
});

test("history is bounded and de-duplicates", () => {
  let history = [];
  history = rememberPick(history, "a", 3);
  history = rememberPick(history, "b", 3);
  history = rememberPick(history, "a", 3);
  assert.deepEqual(history, ["a", "b"]);

  history = rememberPick(history, "c", 3);
  history = rememberPick(history, "d", 3);
  assert.equal(history.length, 3);
  assert.equal(history[0], "d");
});

// ----------------------------------------------------------------- lookups ---

test("related sites never include the site itself and never repeat", () => {
  const sample = [ALL_SITES[0], ALL_SITES[50], ALL_SITES[200]].filter(Boolean);

  sample.forEach((site) => {
    const related = getRelatedSites(site, 8);
    assert.ok(related.length > 0, `${site.slug} has no related sites`);
    assert.ok(!related.some((item) => item.slug === site.slug));
    assert.equal(new Set(related.map((r) => r.slug)).size, related.length);
  });
});

test("getSite round-trips every slug", () => {
  ALL_SITES.forEach((site) => {
    assert.equal(getSite(site.slug)?.slug, site.slug);
  });
  assert.equal(getSite("definitely-not-a-slug"), null);
});
