/**
 * Bazaar filter codec — the URL contract for multi-select, ranges and toggles,
 * plus the invariant the whole format rests on (no option ever contains a
 * comma).
 *
 * These exact numbers are the determinism gate. If you changed the generator
 * deliberately, update them; if they changed by themselves, that is the bug
 * this suite exists to catch. Saved-search ids are derived from serialised
 * query strings, so ordering and spelling here are a persisted public
 * contract, not an implementation detail.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register(new URL("./test-helpers/aliasLoader.mjs", import.meta.url));

const {
  MULTI_SEPARATOR,
  computeFacetCounts,
  matchesAttributeFilter,
  parseRangeParam,
  parseSelectValues,
  prettifyQuery,
  readAttributeFilters,
  serializeRange,
  serializeSelectValues,
  toggleSelectValue,
} = await import("./filters.js");
const { CATEGORIES, getCategory } = await import("./categories.js");
const { getListings, queryListings } = await import("./listings.js");

const CARS = getCategory("cars");

test("select params: parse/serialise round-trip, sorted and de-duplicated", () => {
  assert.equal(MULTI_SEPARATOR, ",");

  assert.deepEqual(parseSelectValues("Mahindra,Tata"), ["Mahindra", "Tata"]);
  assert.deepEqual(parseSelectValues("Tata,Mahindra"), ["Mahindra", "Tata"]);
  assert.deepEqual(parseSelectValues("Tata,Tata"), ["Tata"]);
  // Repeated params (?brand=A&brand=B,C) degrade to the same selection.
  assert.deepEqual(parseSelectValues(["Mahindra", "Tata,Hyundai"]), [
    "Hyundai", "Mahindra", "Tata",
  ]);
  assert.deepEqual(parseSelectValues(""), []);
  assert.deepEqual(parseSelectValues(null), []);

  // One set of ticked boxes -> one string, whichever order they were ticked.
  assert.equal(serializeSelectValues(["Tata", "Mahindra"]), "Mahindra,Tata");
  assert.equal(serializeSelectValues(["Mahindra", "Tata"]), "Mahindra,Tata");
  // A single value stays bare — old saved searches must keep their spelling.
  assert.equal(serializeSelectValues(["Mahindra"]), "Mahindra");
  assert.equal(serializeSelectValues([]), "");

  // Full round-trip in both directions.
  assert.equal(serializeSelectValues(parseSelectValues("Tata,Mahindra")), "Mahindra,Tata");
  assert.deepEqual(parseSelectValues(serializeSelectValues(["Tata", "Mahindra"])), [
    "Mahindra", "Tata",
  ]);
});

test("range params: closed, open-ended and junk inputs", () => {
  assert.deepEqual(parseRangeParam("2015-2020"), { min: 2015, max: 2020 });
  assert.deepEqual(parseRangeParam("2015-"), { min: 2015, max: null });
  assert.deepEqual(parseRangeParam("-2020"), { min: null, max: 2020 });
  assert.deepEqual(parseRangeParam("abc-def"), { min: null, max: null });
  assert.deepEqual(parseRangeParam(""), { min: null, max: null });

  assert.equal(serializeRange(2015, 2020), "2015-2020");
  assert.equal(serializeRange(2015, null), "2015-");
  assert.equal(serializeRange(null, 2020), "-2020");
  assert.equal(serializeRange(null, null), "");
  for (const raw of ["2015-2020", "2015-", "-2020"]) {
    const { min, max } = parseRangeParam(raw);
    assert.equal(serializeRange(min, max), raw, `round-trip ${raw}`);
  }
});

test("toggleSelectValue adds or removes, always returning a sorted array", () => {
  assert.deepEqual(toggleSelectValue(["Tata"], "Mahindra"), ["Mahindra", "Tata"]);
  assert.deepEqual(toggleSelectValue(["Mahindra", "Tata"], "Tata"), ["Mahindra"]);
  assert.deepEqual(toggleSelectValue([], "Tata"), ["Tata"]);
});

test("prettifyQuery restores the human comma", () => {
  assert.equal(prettifyQuery("brand=Mahindra%2CTata"), "brand=Mahindra,Tata");
  assert.equal(prettifyQuery(""), "");
});

test("readAttributeFilters reads a representative URL against the cars taxonomy", () => {
  const bag = {
    brand: "Mahindra,Tata",
    year: "2015-2020",
    kmDriven: "-50000",
    insurance: "true",
    inspected: "false", // only the literal "true" activates a toggle
    fuel: "",
    bhk: "2 BHK", // stale key from another category: never read
  };
  const filters = readAttributeFilters((key) => bag[key], CARS.attributes);
  assert.deepEqual(filters, {
    brand: { type: "select", values: ["Mahindra", "Tata"] },
    year: { type: "range", min: 2015, max: 2020 },
    kmDriven: { type: "range", min: null, max: 50000 },
    insurance: { type: "toggle", value: true },
  });
});

test("multi-select union: Mahindra,Tata equals Mahindra plus Tata", () => {
  const carsListings = getListings().filter((l) => l.categorySlug === "cars");
  const union = carsListings.filter((l) =>
    matchesAttributeFilter(l, "brand", {
      type: "select",
      values: ["Mahindra", "Tata"],
    }),
  ).length;
  const mahindra = queryListings({ category: "cars", attributes: { brand: "Mahindra" } }).total;
  const tata = queryListings({ category: "cars", attributes: { brand: "Tata" } }).total;

  // 7/18 before the orphan-subcategory name pools landed.
  assert.equal(mahindra, 3);
  assert.equal(tata, 12);
  assert.equal(union, mahindra + tata);
});

test("computeFacetCounts: own key excluded, zeros explicit, null for no pool", () => {
  const pool = getListings().filter((l) => l.categorySlug === "cars");
  const state = { city: null, locality: null, min: null, max: null, q: "", attrs: {} };
  const dieselState = {
    ...state,
    attrs: { fuel: { type: "select", values: ["Diesel"] } },
  };

  const facets = computeFacetCounts({ pool, attributes: CARS.attributes, state: dieselState });
  // Selects and toggles get facets; ranges never do.
  assert.deepEqual(Object.keys(facets), [
    "brand", "fuel", "transmission", "owners", "insurance", "inspected",
  ]);

  // The active fuel filter must not zero its own group…
  const unfiltered = computeFacetCounts({ pool, attributes: CARS.attributes, state });
  assert.deepEqual(facets.fuel, unfiltered.fuel);
  // …and with no other filters active, its counts partition the 74 cars.
  // (Tallies are null-prototype objects; spread before the strict compare.)
  assert.deepEqual({ ...facets.fuel }, {
    // Re-locked after the orphan-subcategory name pools (fuel draws shifted
    // for ~20 cars listings; still partitions 74, Electric unchanged).
    Petrol: 20, Diesel: 4, CNG: 12, Electric: 19, Hybrid: 10, LPG: 9,
  });
  assert.equal(Object.values(facets.fuel).reduce((a, b) => a + b, 0), pool.length);

  // Other groups DO respect the fuel filter: brand tallies cannot exceed the
  // number of diesels, and every declared option appears even at zero.
  const brandSum = Object.values(facets.brand).reduce((a, b) => a + b, 0);
  assert.ok(brandSum <= facets.fuel.Diesel);
  const brandOptions = CARS.attributes.find((a) => a.key === "brand").options;
  assert.deepEqual(Object.keys(facets.brand), brandOptions.map(String));
  assert.ok(Object.values(facets.brand).some((count) => count === 0));

  assert.equal(computeFacetCounts({ pool: [], attributes: CARS.attributes, state }), null);
  assert.equal(computeFacetCounts({ pool, attributes: [], state }), null);
});

test("comma-safety: no option string in any category contains the separator", () => {
  let groups = 0;
  for (const category of CATEGORIES) {
    for (const attr of category.attributes) {
      if (!Array.isArray(attr.options)) continue;
      groups += 1;
      for (const option of attr.options) {
        assert.ok(
          !String(option).includes(MULTI_SEPARATOR),
          `${category.slug}.${attr.key} option "${option}" contains "${MULTI_SEPARATOR}"`,
        );
      }
    }
  }
  // The header of filters.js documents 53 audited select groups; hold it to that.
  assert.equal(groups, 53);
});
