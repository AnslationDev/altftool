import assert from "node:assert/strict";
import test from "node:test";

import {
  COMPARE_MAX,
  ENTRIES,
  LIVE_ENTRIES,
  RETIRED_ENTRIES,
  TAG_PAGE_MIN_ENTRIES,
  entriesForUseCase,
  entriesInCategory,
  entriesInCollection,
  entriesWithTagSlug,
  getAtlasStats,
  getEntry,
  getFacetCounts,
  getIndexableTags,
  getLastCheckedDate,
  getPopulatedCategories,
  getTagBySlug,
  getTagCounts,
  relatedEntries,
  resolveComparison,
  searchEntries,
} from "./catalog.js";
import {
  ACCESS_IDS,
  CATEGORY_GROUPS,
  CATEGORY_SLUGS,
  COLLECTION_SLUGS,
  USE_CASE_SLUGS,
} from "./taxonomy.js";

/*
 * The catalog validator already throws on malformed entries at import time, so
 * simply importing this module is itself a test. These cover the things the
 * validator cannot: editorial rules, taxonomy coverage, and the selectors.
 */

test("catalog imports, meaning every entry passed validation", () => {
  assert.ok(ENTRIES.length > 0, "catalog is empty");
  assert.equal(ENTRIES.length, LIVE_ENTRIES.length + RETIRED_ENTRIES.length);
});

test("the catalog is larger than the classic lists it replaces", () => {
  // The source lists this product was built against had 96 and 101 entries.
  assert.ok(
    LIVE_ENTRIES.length >= 200,
    `expected 200+ live entries, found ${LIVE_ENTRIES.length}`,
  );
});

test("slugs are unique and URL-safe", () => {
  const seen = new Set();
  for (const entry of ENTRIES) {
    assert.match(
      entry.slug,
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      `${entry.slug} is not a clean kebab-case slug`,
    );
    assert.ok(!seen.has(entry.slug), `duplicate slug: ${entry.slug}`);
    seen.add(entry.slug);
  }
});

test("every entry carries an honest limitation", () => {
  for (const entry of ENTRIES) {
    assert.ok(entry.limits, `${entry.slug} has no limits sentence`);
    assert.ok(
      entry.limits.length >= 20,
      `${entry.slug} has a limits sentence too short to say anything: "${entry.limits}"`,
    );
    // "No limits" defeats the entire purpose of the field — the point is that
    // a directory where everything is excellent carries no information.
    assert.doesNotMatch(
      entry.limits,
      /^(?:none|no limits?|unlimited)\b/i,
      `${entry.slug} uses the limits field to avoid saying anything`,
    );
  }
});

test("taglines fit the card without wrapping to three lines", () => {
  for (const entry of ENTRIES) {
    assert.ok(
      entry.tagline.length <= 95,
      `${entry.slug} tagline is ${entry.tagline.length} chars`,
    );
    assert.doesNotMatch(
      entry.tagline,
      /\.$/,
      `${entry.slug} tagline ends with a full stop; the layout adds punctuation`,
    );
  }
});

test("every entry has a real description and audience", () => {
  for (const entry of ENTRIES) {
    assert.ok(
      (entry.what || "").length >= 80,
      `${entry.slug} has no substantive "what" text`,
    );
    assert.ok(
      Array.isArray(entry.bestFor) && entry.bestFor.length >= 1,
      `${entry.slug} has no bestFor entries`,
    );
  }
});

test("access and runtime use known ids", () => {
  for (const entry of ENTRIES) {
    assert.ok(
      ACCESS_IDS.includes(entry.access),
      `${entry.slug}: ${entry.access}`,
    );
    assert.ok(
      ["local", "hosted"].includes(entry.runtime),
      `${entry.slug}: ${entry.runtime}`,
    );
  }
});

test("retired entries point at a live successor", () => {
  for (const entry of RETIRED_ENTRIES) {
    const successor = getEntry(entry.successor);
    assert.ok(
      successor,
      `${entry.slug} successor "${entry.successor}" missing`,
    );
    assert.equal(
      successor.status,
      "live",
      `${entry.slug} points at another retired entry`,
    );
  }
});

test("internal tool links point at the tools directory", () => {
  for (const entry of ENTRIES) {
    if (!entry.altf) continue;
    assert.ok(entry.altf.label, `${entry.slug} altf link has no label`);
    assert.match(
      entry.altf.href,
      /^\/(?:tools|products|altf)[a-z0-9/-]*$/,
      `${entry.slug} altf href looks wrong: ${entry.altf.href}`,
    );
  }
});

test("every category in the taxonomy has entries", () => {
  const counts = getFacetCounts().category;
  for (const slug of CATEGORY_SLUGS) {
    assert.ok(counts[slug] > 0, `category "${slug}" has no live entries`);
  }
});

test("category groups cover every category exactly once", () => {
  const grouped = CATEGORY_GROUPS.flatMap((group) => group.slugs);
  assert.equal(
    grouped.length,
    new Set(grouped).size,
    "a category appears in more than one group",
  );
  assert.deepEqual([...grouped].sort(), [...CATEGORY_SLUGS].sort());
});

test("every use case and collection page will have entries", () => {
  for (const slug of USE_CASE_SLUGS) {
    assert.ok(
      entriesForUseCase(slug).length > 0,
      `use case "${slug}" would render an empty page`,
    );
  }
  for (const slug of COLLECTION_SLUGS) {
    assert.ok(
      entriesInCollection(slug).length > 0,
      `collection "${slug}" would render an empty page`,
    );
  }
});

test("entriesInCategory excludes retired entries unless asked", () => {
  for (const slug of CATEGORY_SLUGS) {
    assert.ok(
      entriesInCategory(slug).every((entry) => entry.status === "live"),
      `${slug} leaked a retired entry into the default listing`,
    );
  }
});

test("search ranks an exact name match first", () => {
  const target = LIVE_ENTRIES[0];
  const results = searchEntries(target.name);
  assert.ok(results.length > 0);
  assert.equal(results[0].slug, target.slug);
});

test("search ignores queries too short to be meaningful", () => {
  assert.deepEqual(searchEntries("a"), []);
  assert.deepEqual(searchEntries(""), []);
});

test("related entries never include the entry itself", () => {
  for (const entry of LIVE_ENTRIES.slice(0, 40)) {
    const related = relatedEntries(entry);
    assert.ok(
      related.every((item) => item.slug !== entry.slug),
      `${entry.slug} is related to itself`,
    );
  }
});

test("stats agree with the underlying arrays", () => {
  const stats = getAtlasStats();
  assert.equal(stats.total, ENTRIES.length);
  assert.equal(stats.live, LIVE_ENTRIES.length);
  assert.equal(stats.retired, RETIRED_ENTRIES.length);
  assert.equal(stats.categories, getPopulatedCategories().length);
  assert.equal(
    stats.open,
    LIVE_ENTRIES.filter((entry) => entry.access === "open").length,
  );
  assert.equal(
    stats.onDevice,
    LIVE_ENTRIES.filter((entry) => entry.runtime === "local").length,
  );
});

test("every entry records when it was last verified", () => {
  for (const entry of ENTRIES) {
    assert.match(
      entry.checked || "",
      /^\d{4}-\d{2}-\d{2}$/,
      `${entry.slug} has no usable checked date`,
    );
    assert.ok(
      !Number.isNaN(Date.parse(entry.checked)),
      `${entry.slug} checked date is not a real date: ${entry.checked}`,
    );
  }
  assert.match(getLastCheckedDate(), /^\d{4}-\d{2}-\d{2}$/);
});

test("tag slugs are URL-safe and resolve back to their entries", () => {
  for (const row of getIndexableTags()) {
    assert.match(
      row.slug,
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      `tag "${row.tag}" produced a bad slug "${row.slug}"`,
    );
    assert.equal(
      entriesWithTagSlug(row.slug).length,
      row.count,
      `tag "${row.tag}" count disagrees with what its page would render`,
    );
    assert.deepEqual(getTagBySlug(row.slug), row);
  }
});

test("only tags above the threshold get a page", () => {
  const counts = getTagCounts();
  const indexable = new Set(getIndexableTags().map((row) => row.tag));
  for (const [tag, count] of Object.entries(counts)) {
    if (count >= TAG_PAGE_MIN_ENTRIES) {
      assert.ok(indexable.has(tag), `"${tag}" (${count}) should be indexable`);
    } else {
      assert.ok(
        !indexable.has(tag),
        `"${tag}" (${count}) is below the threshold but has a page`,
      );
    }
  }
});

test("tag slugs do not collide", () => {
  const slugs = getIndexableTags().map((row) => row.slug);
  assert.equal(slugs.length, new Set(slugs).size, "two tags share a slug");
});

test("comparison resolves, dedupes, drops unknowns and caps at four", () => {
  const [a, b, c, d, e] = LIVE_ENTRIES;
  assert.deepEqual(
    resolveComparison([a.slug, b.slug]).map((entry) => entry.slug),
    [a.slug, b.slug],
  );
  // A user-editable query string must degrade, never throw.
  assert.deepEqual(
    resolveComparison([a.slug, "not-a-real-slug", b.slug]).map((x) => x.slug),
    [a.slug, b.slug],
  );
  assert.deepEqual(
    resolveComparison([a.slug, a.slug]).map((x) => x.slug),
    [a.slug],
  );
  assert.equal(
    resolveComparison([a, b, c, d, e].map((x) => x.slug)).length,
    COMPARE_MAX,
  );
  assert.deepEqual(resolveComparison([]), []);
  assert.deepEqual(resolveComparison(["nope"]), []);
});

test("live entries have a usable https url and a consistent display domain", () => {
  for (const entry of LIVE_ENTRIES) {
    assert.match(entry.url, /^https:\/\//, `${entry.slug} url is not https`);

    // `domain` is the host SHOWN on the card, so it is legitimately the
    // registrable domain even when the tool itself lives on a subdomain
    // (diagrams.net displayed, app.diagrams.net linked). What must not happen
    // is the two pointing at different sites, which is what this catches.
    const host = new URL(entry.url).hostname.replace(/^www\./, "");
    assert.ok(
      host === entry.domain || host.endsWith(`.${entry.domain}`),
      `${entry.slug}: domain "${entry.domain}" is not the url host "${host}" or a parent of it`,
    );
  }
});
