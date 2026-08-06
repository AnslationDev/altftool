// node --test packages/core/src/rabbithole/catalog.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALTF_MATCHES,
  CATALOG_NOTES,
  SITES,
  STATS,
  countByCategory,
  getCollectionSites,
  getRelatedSites,
  getSite,
  pickRotating,
  urlIdentity,
} from "./catalog.js";
import {
  CATEGORIES,
  CATEGORY_IDS,
  COLLECTIONS,
  TIME_BAND_IDS,
  VIBE_IDS,
} from "./taxonomy.js";

// The catalog module validates and throws on import, so simply getting here
// means every record passed the schema. These tests cover the things a schema
// check cannot: editorial coverage, link hygiene, and the derived views.

test("catalog imported without dropping entries", () => {
  assert.ok(SITES.length > 0, "catalog is empty");
  // Duplicates are recoverable and therefore not fatal, but they always mean
  // two curators claimed the same site — worth surfacing rather than hiding.
  assert.deepEqual(
    CATALOG_NOTES,
    [],
    `catalog collisions need resolving:\n${CATALOG_NOTES.join("\n")}`,
  );
});

test("every category has enough entries to justify its own page", () => {
  const counts = countByCategory();
  const thin = CATEGORIES.filter((category) => counts[category.id] < 8);
  assert.deepEqual(
    thin.map((category) => `${category.id} (${counts[category.id]})`),
    [],
    "categories with fewer than 8 sites read as thin content",
  );
});

test("slugs are unique and url-safe", () => {
  const slugs = SITES.map((site) => site.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `bad slug: ${slug}`);
  }
});

test("urls are absolute, https, and free of tracking parameters", () => {
  for (const site of SITES) {
    const url = new URL(site.url);
    assert.equal(url.protocol, "https:", `${site.slug} is not https`);
    for (const key of url.searchParams.keys()) {
      assert.ok(
        !key.toLowerCase().startsWith("utm_"),
        `${site.slug} carries a tracking parameter: ${key}`,
      );
    }
  }
});

test("no two entries point at the same host and path", () => {
  const seen = new Map();
  for (const site of SITES) {
    const url = new URL(site.url);
    const key = `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/+$/, "")}`;
    assert.ok(
      !seen.has(key),
      `${site.slug} duplicates ${seen.get(key)} at ${key}`,
    );
    seen.set(key, site.slug);
  }
});

test("URL identity normalises hosts without collapsing case-sensitive paths or queries", () => {
  assert.equal(
    urlIdentity("https://WWW.Example.com/Path/?b=Two&a=One"),
    "example.com/Path?a=One&b=Two",
  );
  assert.notEqual(
    urlIdentity("https://example.com/Path?id=Alpha"),
    urlIdentity("https://example.com/path?id=alpha"),
  );
});

test("taxonomy fields are all in range", () => {
  for (const site of SITES) {
    assert.ok(CATEGORY_IDS.includes(site.category), site.slug);
    assert.ok(TIME_BAND_IDS.includes(site.timeToJoy), site.slug);
    assert.ok(site.vibes.every((vibe) => VIBE_IDS.includes(vibe)), site.slug);
    assert.ok(site.vibes.length >= 1 && site.vibes.length <= 3, site.slug);
  }
});

test("copy stays within the lengths the cards are designed for", () => {
  for (const site of SITES) {
    assert.ok(site.blurb.length <= 90, `${site.slug} blurb too long`);
    assert.ok(
      site.description.length >= 80,
      `${site.slug} description too short to be worth indexing`,
    );
    assert.ok(site.whyItsGood.length >= 20, `${site.slug} whyItsGood too thin`);
  }
});

test("blurbs are not duplicated across entries", () => {
  const seen = new Map();
  for (const site of SITES) {
    const key = site.blurb.trim().toLowerCase();
    assert.ok(!seen.has(key), `${site.slug} reuses the blurb of ${seen.get(key)}`);
    seen.set(key, site.slug);
  }
});

test("every collection resolves to a usable page", () => {
  for (const collection of COLLECTIONS) {
    const sites = getCollectionSites(collection.id);
    assert.ok(
      sites.length >= 6,
      `collection ${collection.id} only matched ${sites.length} sites`,
    );
  }
});

test("related sites never include the site itself", () => {
  for (const site of SITES.slice(0, 40)) {
    const related = getRelatedSites(site, 6);
    assert.ok(
      related.every((item) => item.slug !== site.slug),
      `${site.slug} is related to itself`,
    );
  }
});

test("every site produces at least one related entry", () => {
  const orphans = SITES.filter((site) => getRelatedSites(site, 1).length === 0);
  assert.deepEqual(
    orphans.map((site) => site.slug),
    [],
    "orphan detail pages have no internal links out",
  );
});

test("pickRotating is deterministic and respects the count", () => {
  const first = pickRotating(SITES, 8, "seed-a").map((site) => site.slug);
  const second = pickRotating(SITES, 8, "seed-a").map((site) => site.slug);
  const other = pickRotating(SITES, 8, "seed-b").map((site) => site.slug);

  assert.deepEqual(first, second, "same seed must give the same pick");
  assert.equal(first.length, 8);
  assert.notDeepEqual(first, other, "different seeds should differ");
});

test("altfAlternative values point at real experiences", async () => {
  const { EXPERIENCE_CATALOG } = await import("../experienceCatalog.js");
  const known = new Set(EXPERIENCE_CATALOG.map((item) => item.slug));

  for (const site of ALTF_MATCHES) {
    assert.ok(
      known.has(site.altfAlternative),
      `${site.slug} points at unknown experience "${site.altfAlternative}"`,
    );
  }
});

test("getSite round-trips and misses cleanly", () => {
  assert.equal(getSite(SITES[0].slug).name, SITES[0].name);
  assert.equal(getSite("definitely-not-a-real-slug"), null);
});

test("stats agree with the catalog", () => {
  assert.equal(STATS.total, SITES.length);
  assert.equal(STATS.categories, CATEGORY_IDS.length);
  assert.equal(
    STATS.free,
    SITES.filter((site) => site.free && !site.needsAccount).length,
  );
  assert.equal(STATS.altfBuilds, ALTF_MATCHES.length);
});
