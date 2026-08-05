/**
 * Bazaar search — regression gates for normalisation, typo correction,
 * variant folding, AND semantics and suggestion shape.
 *
 * These exact numbers are the determinism gate. If you changed the generator
 * deliberately, update them; if they changed by themselves, that is the bug
 * this suite exists to catch. The measured behaviours in the blueprint
 * ("ipone 0→6, moblie 0→80, refrigirator 0→18, cars stayed exactly 74") are
 * locked here so they cannot silently regress.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register(new URL("./test-helpers/aliasLoader.mjs", import.meta.url));

const { didYouMean, normalizeText, suggest } = await import("./search.js");
const { getListing, queryListings } = await import("./listings.js");

test("baseline totals: empty query is unfiltered, cars category is untouched", () => {
  assert.equal(queryListings({ q: "" }).total, 720);
  assert.equal(queryListings({ q: "   " }).total, 720);
  // The blueprint's own gate: adding typo tolerance must not move this number.
  assert.equal(queryListings({ category: "cars" }).total, 74);
});

test("typo correction: results and the visible correction, per query", () => {
  const table = [
    // query           total  correction shown
    ["ipone",          6,     "iPhone"],
    ["moblie",         80,    "Mobile"],
    ["refrigirator",   18,    "Fridge"],
    ["xyzzy",          0,     null],
    ["red honda",      0,     null], // AND semantics: no red Hondas, not every Honda
  ];
  for (const [q, total, correction] of table) {
    assert.equal(queryListings({ q }).total, total, `total for '${q}'`);
    const dym = didYouMean(q);
    if (correction === null) {
      assert.equal(dym, null, `no correction expected for '${q}'`);
    } else {
      assert.equal(dym.query, correction, `correction for '${q}'`);
      assert.ok(dym.corrections.length > 0);
    }
  }
});

test("normalizeText: digit splitting, ampersand, case folding", () => {
  assert.equal(normalizeText("2bhk"), "2 bhk");
  assert.equal(normalizeText("iphone15"), "iphone 15");
  assert.equal(normalizeText("Tables & Chairs"), "tables and chairs");
  assert.equal(normalizeText("IPHONE 15 Pro!"), "iphone 15 pro");
  // The 2-letter floor keeps model codes intact.
  assert.equal(normalizeText("4K"), "4k");
});

test("variant folding: scooty≡scooter and bangalore≡bengaluru", () => {
  const scooty = queryListings({ q: "scooty" }).total;
  const scooter = queryListings({ q: "scooter" }).total;
  assert.equal(scooty, scooter);
  assert.equal(scooty, 13);

  const bangalore = queryListings({ q: "bangalore" }).total;
  const bengaluru = queryListings({ q: "bengaluru" }).total;
  assert.equal(bangalore, bengaluru);
  assert.equal(bangalore, 32);
});

test("AND across tokens: adding a word can only narrow", () => {
  const honda = queryListings({ q: "honda" }).total;
  const hondaCity = queryListings({ q: "honda city" }).total;
  assert.ok(honda > 0);
  assert.ok(hondaCity > 0);
  assert.ok(hondaCity <= honda, `'honda city' (${hondaCity}) > 'honda' (${honda})`);
});

test("didYouMean stays quiet for words the corpus already spells that way", () => {
  assert.equal(didYouMean("honda"), null);
  assert.equal(didYouMean("iphone"), null);
  assert.equal(didYouMean("mobile"), null);
});

test("suggest(''): empty but well-formed; suggest('mah') surfaces Mahindra", () => {
  const empty = suggest("");
  assert.deepEqual(empty, { groups: [], options: [] });

  const mah = suggest("mah");
  const brands = mah.groups.find((g) => g.id === "brands");
  assert.ok(brands, "expected a brands group for 'mah'");
  assert.ok(
    brands.options.some((o) => o.label === "Mahindra"),
    `brand labels were ${JSON.stringify(brands.options.map((o) => o.label))}`,
  );
  // `options` is the flattened render order; indexes must be consecutive.
  mah.options.forEach((option, index) => assert.equal(option.index, index));
});

test("ranking sanity: every 'iphone' result really carries an iphone token", () => {
  const result = queryListings({ q: "iphone", perPage: 500 });
  assert.equal(result.total, 6);
  assert.equal(result.items.length, result.total);
  for (const item of result.items) {
    const full = getListing(item.slug);
    const haystack = normalizeText(
      [
        full.title,
        full.attributes?.brand,
        full.subcategoryName,
        full.categoryName,
        full.locality,
        full.cityName,
        full.stateName,
      ]
        .filter(Boolean)
        .join(" "),
    );
    assert.ok(haystack.includes("iphone"), `false positive: ${full.slug}`);
  }
});
