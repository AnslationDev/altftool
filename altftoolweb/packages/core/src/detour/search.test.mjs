import assert from "node:assert/strict";
import test from "node:test";

import { normalise, searchSites, suggestedSearches } from "./search.js";
import { ALL_SITES } from "./catalog.js";
import { CATEGORIES } from "./taxonomy.js";

const categoryNames = new Map(CATEGORIES.map((c) => [c.id, c.name]));
const find = (query, options = {}) =>
  searchSites(ALL_SITES, query, { categoryNames, ...options });

test("normalise strips case, punctuation and accents", () => {
  assert.equal(normalise("The Useless Web!"), "the useless web");
  assert.equal(normalise("archive.today"), "archive today");
  assert.equal(normalise("  MULTIPLE   spaces "), "multiple spaces");
  assert.equal(normalise(null), "");
});

test("an empty query returns nothing rather than everything", () => {
  assert.deepEqual(find(""), []);
  assert.deepEqual(find("   "), []);
  assert.deepEqual(find(null), []);
});

test("an exact name match ranks first", () => {
  const results = find("wayback machine");
  assert.ok(results.length > 0);
  assert.match(results[0].name, /wayback/i);
});

test("a partial word finds the site", () => {
  const results = find("bubble");
  assert.ok(
    results.some((site) => /bubble/i.test(site.name)),
    "expected a bubble-named site",
  );
});

test("name hits outrank blurb hits", () => {
  // Whatever the catalog holds, a site with the term in its name must come
  // before one that only mentions it in prose.
  const results = find("radio");
  const firstNameHit = results.findIndex((s) => /radio/i.test(s.name));
  const firstBlurbOnly = results.findIndex(
    (s) => !/radio/i.test(s.name) && /radio/i.test(s.blurb),
  );

  if (firstNameHit !== -1 && firstBlurbOnly !== -1) {
    assert.ok(
      firstNameHit < firstBlurbOnly,
      "a name match should outrank a blurb-only match",
    );
  }
});

test("multi-word queries are AND-ed, not OR-ed", () => {
  const both = find("retro games");
  const retro = find("retro");
  const games = find("games");

  assert.ok(
    both.length <= Math.min(retro.length, games.length),
    "an AND query cannot return more than either term alone",
  );
  // And every result really does match both terms somewhere.
  both.forEach((site) => {
    const haystack = normalise(
      `${site.name} ${site.blurb} ${categoryNames.get(site.category) ?? ""} ${site.vibes.join(" ")}`,
    );
    assert.ok(haystack.includes("retro"), `${site.name} missing "retro"`);
    assert.ok(haystack.includes("game"), `${site.name} missing "game"`);
  });
});

test("category names are searchable", () => {
  const results = find("optical illusions");
  assert.ok(
    results.some((site) => site.category === "optical-illusions"),
    "searching a category name should surface its sites",
  );
});

test("a query that matches nothing returns an empty array", () => {
  assert.deepEqual(find("zzzzqqqxwv"), []);
});

test("punctuation in the query does not break matching", () => {
  const plain = find("archive today");
  const punctuated = find("archive.today!");
  assert.deepEqual(
    plain.map((s) => s.slug),
    punctuated.map((s) => s.slug),
  );
});

test("results are stable for equal scores", () => {
  const first = find("game").map((s) => s.slug);
  const second = find("game").map((s) => s.slug);
  assert.deepEqual(first, second);
});

test("limit truncates without changing the order", () => {
  const all = find("web");
  const limited = find("web", { limit: 5 });
  assert.equal(limited.length, Math.min(5, all.length));
  assert.deepEqual(
    limited.map((s) => s.slug),
    all.slice(0, 5).map((s) => s.slug),
  );
});

test("search never returns a site twice", () => {
  const results = find("the");
  const slugs = results.map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("suggested searches are real catalog entries", () => {
  const names = new Set(ALL_SITES.map((s) => s.name));
  const suggestions = suggestedSearches(ALL_SITES, 6);
  assert.equal(suggestions.length, 6);
  suggestions.forEach((name) => assert.ok(names.has(name), `${name} not in catalog`));
  assert.equal(new Set(suggestions).size, suggestions.length);
});

test("every suggested search actually finds something", () => {
  suggestedSearches(ALL_SITES, 6).forEach((name) => {
    assert.ok(find(name).length > 0, `"${name}" returns no results`);
  });
});
