/**
 * The browse-filter codec — one implementation, three consumers.
 *
 * ---------------------------------------------------------------------------
 * Why this file exists
 * ---------------------------------------------------------------------------
 * The filter rail writes filters into the query string, the chip row describes
 * them, and the matcher applies them. Those three used to carry three private
 * copies of the same parsing rules (plus a fourth in `SaveSearchButton`), which
 * is fine while a filter is one key with one value and stops being fine the
 * moment a key can hold several. Everything that reads or writes a filter param
 * now goes through here.
 *
 * This module is deliberately dependency-free and server-safe: it imports
 * nothing, so both the client rail and the server-rendered `/bazaar/search`
 * page can use it without dragging the 720-ad generator into a bundle.
 *
 * ---------------------------------------------------------------------------
 * The query-string contract
 * ---------------------------------------------------------------------------
 *   min,max        price bounds in rupees
 *   <range attr>   "lo-hi", either side optionally empty ("2015-", "-2020")
 *   <toggle attr>  the literal "true"
 *   <select attr>  ONE OR MORE option strings, comma separated:
 *                    ?brand=Mahindra              (unchanged, still valid)
 *                    ?brand=Mahindra,Tata,Hyundai (new: union / logical OR)
 *
 * Backwards compatibility is the point: a single value parses to a one-element
 * selection and matches exactly what it matched before, so saved searches and
 * links shared before this change keep working.
 *
 * **Why a comma is safe as the separator.** A separator is only safe if it can
 * never appear inside an option label. Every `options` array in the taxonomy was
 * checked — 53 select groups across the 24 categories — and none contains a
 * comma, so a comma can never be ambiguous. (`+`, the other obvious candidate,
 * would NOT have been safe: "4+ BHK", "5+ years" and "20+" all contain one.)
 * If a future option ever needs a comma, change `MULTI_SEPARATOR` here and
 * nowhere else — but prefer renaming the option, because the separator is part
 * of a public URL contract that saved searches have already persisted.
 *
 * Selections are **sorted** on the way out, so one set of ticked boxes always
 * produces one query string. That is load-bearing rather than tidy: a saved
 * search's id is derived from its query string, so `brand=Tata,Mahindra` and
 * `brand=Mahindra,Tata` must not be able to save twice.
 *
 * The sort uses a plain code-unit comparison, not `localeCompare()`, because
 * `localeCompare()` without an explicit locale depends on the host's ICU data —
 * server and browser could order the same two options differently and the
 * prerendered HTML would disagree with the first client render.
 */

import { matchListing, parseQuery } from "./search";

/** The separator for multi-valued `select` params. See the note above. */
export const MULTI_SEPARATOR = ",";

/* ------------------------------------------------------------------
 * Scalars
 * ---------------------------------------------------------------- */

export function toNumberOrNull(raw) {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** "2015-2020" | "2015-" | "-2020" -> { min, max }, NaN guarded to null. */
export function parseRangeParam(raw) {
  if (!raw) return { min: null, max: null };
  const text = String(raw);
  const split = text.indexOf("-");
  if (split < 0) return { min: toNumberOrNull(text), max: null };
  return {
    min: toNumberOrNull(text.slice(0, split)),
    max: toNumberOrNull(text.slice(split + 1)),
  };
}

export function serializeRange(min, max) {
  if (min === null && max === null) return "";
  return `${min === null ? "" : min}-${max === null ? "" : max}`;
}

/* ------------------------------------------------------------------
 * Multi-valued select params
 * ---------------------------------------------------------------- */

/** Deterministic, locale-independent ordering. See the header note. */
function compareValues(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Read a select param into a sorted, de-duplicated list of option strings.
 *
 * Accepts a string, an array of strings (so `?brand=A&brand=B` — a repeated
 * param, which is what a plain HTML form would submit — degrades to the same
 * selection rather than to the first value only), or nothing.
 */
export function parseSelectValues(raw) {
  if (raw === null || raw === undefined || raw === "") return [];
  const parts = (Array.isArray(raw) ? raw : [raw]).flatMap((entry) =>
    String(entry).split(MULTI_SEPARATOR),
  );
  const seen = new Set();
  for (const part of parts) {
    const value = part.trim();
    if (value !== "") seen.add(value);
  }
  return [...seen].sort(compareValues);
}

/**
 * The inverse. Returns `""` for an empty selection, which every `commit()` in
 * the browse surfaces treats as "delete this param" — so clearing a group
 * removes the key instead of leaving `?brand=` behind.
 */
export function serializeSelectValues(values) {
  if (!Array.isArray(values) || values.length === 0) return "";
  const seen = new Set();
  for (const value of values) {
    const text = String(value).trim();
    if (text !== "") seen.add(text);
  }
  return [...seen].sort(compareValues).join(MULTI_SEPARATOR);
}

/** Add `value` if absent, drop it if present. Returns a new sorted array. */
export function toggleSelectValue(values, value) {
  const current = Array.isArray(values) ? values : [];
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
  return next.slice().sort(compareValues);
}

/**
 * `URLSearchParams.toString()` percent-encodes a comma to `%2C`. It round-trips
 * either way, but `?brand=Mahindra,Tata` is what a person forwards on WhatsApp
 * and `?brand=Mahindra%2CTata` is what they don't. A bare comma is a legal
 * sub-delimiter in a query string, so decoding it back is safe — and it is done
 * for *every* URL the browse surfaces build, so the query string never flips
 * between the two spellings as the visitor sorts or pages.
 */
export function prettifyQuery(query) {
  return String(query || "").replace(/%2C/g, MULTI_SEPARATOR);
}

/* ------------------------------------------------------------------
 * Reading the attribute filters out of a param bag
 * ---------------------------------------------------------------- */

/**
 * `readParam(key)` returns the raw value(s) for a key — pass
 * `(key) => searchParams.getAll(key)` on the client, or
 * `(key) => searchParams[key]` for a Next `searchParams` object.
 *
 * An attribute param that does not belong to this category is never read, so a
 * stale link from another category degrades to the unfiltered view rather than
 * to an empty one.
 *
 * Shape of the result, keyed by attribute key:
 *   { type: "select", values: string[] }        // always ≥ 1 value
 *   { type: "range",  min: number|null, max }   // at least one side set
 *   { type: "toggle", value: true }
 */
export function readAttributeFilters(readParam, attributes = []) {
  const attrs = {};

  for (const attr of attributes) {
    const raw = readParam(attr.key);

    if (attr.type === "range") {
      const single = Array.isArray(raw) ? raw[0] : raw;
      if (!single) continue;
      const range = parseRangeParam(single);
      if (range.min !== null || range.max !== null) {
        attrs[attr.key] = { type: "range", ...range };
      }
    } else if (attr.type === "toggle") {
      const single = Array.isArray(raw) ? raw[0] : raw;
      if (single === "true") attrs[attr.key] = { type: "toggle", value: true };
    } else {
      const values = parseSelectValues(raw);
      if (values.length > 0) attrs[attr.key] = { type: "select", values };
    }
  }

  return attrs;
}

/* ------------------------------------------------------------------
 * Matching
 *
 * A local re-implementation of the filter semantics in `data/listings.js`
 * rather than an import of it: this module is loaded by client components, and
 * importing the corpus would ship the whole generator (plus the taxonomy, the
 * city registry and the name pools) to the browser. When the corpus becomes a
 * real API this code goes away, not the other way round.
 * ---------------------------------------------------------------- */

/**
 * Free-text matching delegates to the search engine so a category page and
 * /bazaar/search agree about the same query. Before this, the client path
 * here substring-matched while the search page ran the typo-tolerant
 * matcher — so `/bazaar/c/mobiles?q=ipone` returned 0 while
 * `/bazaar/search?q=ipone` returned 6. Same query, two answers, and the
 * saved-search "Run search" button could land on either surface.
 *
 * The parse is memoised on the raw string: `matchesBaseFilters` runs once
 * per listing per render, and re-parsing (tokenise + typo-correct against
 * a 1,391-term index) 96 times for the same string is waste.
 */
let lastParsedQ = null;
let lastParsed = null;

function parsedFor(q) {
  if (q !== lastParsedQ) {
    lastParsedQ = q;
    lastParsed = parseQuery(q);
  }
  return lastParsed;
}

/** Everything that is not a category attribute: place, price, free text. */
export function matchesBaseFilters(listing, state) {
  if (state.city && listing.citySlug !== state.city) return false;
  if (state.locality && listing.locality !== state.locality) return false;
  if (state.min !== null && state.min !== undefined && listing.price < state.min) return false;
  if (state.max !== null && state.max !== undefined && listing.price > state.max) return false;

  if (state.q && matchListing(listing, parsedFor(state.q)) === 0) return false;

  return true;
}

/**
 * One attribute filter against one listing.
 *
 * A multi-valued select is a union: the listing matches if its value is any of
 * the selected ones. A single-valued select is that same test with one member,
 * which is exactly the old `String(actual) !== String(value)` comparison — the
 * reason existing links keep returning existing results.
 */
export function matchesAttributeFilter(listing, key, filter) {
  const actual = listing.attributes?.[key];

  if (filter.type === "range") {
    const value = Number(actual);
    if (!Number.isFinite(value)) return false;
    if (filter.min !== null && value < filter.min) return false;
    if (filter.max !== null && value > filter.max) return false;
    return true;
  }

  if (filter.type === "toggle") {
    return Boolean(actual) === true;
  }

  if (actual === undefined || actual === null) return false;
  const text = String(actual);
  return filter.values.some((value) => String(value) === text);
}

export function matchesAttributeFilters(listing, attrs = {}, skipKey = null) {
  for (const [key, filter] of Object.entries(attrs)) {
    if (key === skipKey) continue;
    if (!matchesAttributeFilter(listing, key, filter)) return false;
  }
  return true;
}

/** The whole filter set. Used by the client-side query in `BrowseView`. */
export function matchesFilters(listing, state) {
  return matchesBaseFilters(listing, state) && matchesAttributeFilters(listing, state.attrs);
}

/* ------------------------------------------------------------------
 * Facet counts
 * ---------------------------------------------------------------- */

/**
 * "How many ads would I get if I ticked this box?"
 *
 * Standard facet-count semantics, which are not the obvious ones: for
 * attribute A, every *other* active filter is applied but A's own selection is
 * ignored. Applying A to its own counts would zero every option the visitor has
 * not already ticked, turning the numbers into a tautology; ignoring the other
 * filters would show numbers that do not survive the click.
 *
 * So with `?fuel=Diesel` active in Cars, the Brand column answers "Diesel
 * Mahindras: 0" (correctly — there are none), while the Fuel column still shows
 * all six fuels, because Diesel's own group must stay explorable.
 *
 * Every option the taxonomy declares gets an entry, including the ones with no
 * inventory: an explicit `0` is what lets the rail dim an option instead of
 * offering a click that leads to an empty page.
 *
 * Returns `null` when there is no pool to count — `/bazaar/search` filters on
 * the server and only ever holds one page of 24 results, and an invented number
 * would be worse than no number.
 *
 * Cost: `attributes × pool`, so ~8 × 96 comparisons for the largest category.
 * The caller memoises it on the pool and the filter state; the rail's own
 * option search box is local state and therefore cannot trigger a recount.
 */
export function computeFacetCounts({ pool, attributes = [], state }) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  if (!Array.isArray(attributes) || attributes.length === 0) return null;

  const base = pool.filter((listing) => matchesBaseFilters(listing, state));
  const attrs = state?.attrs || {};
  const facets = {};

  for (const attr of attributes) {
    // Ranges have no discrete options to count. Anything that is not a range
    // and not a toggle is a select, matching how the rail renders them.
    if (attr.type === "range") continue;
    const isToggle = attr.type === "toggle";
    if (!isToggle && (!Array.isArray(attr.options) || attr.options.length === 0)) continue;

    // Every other attribute filter applies; this one's own does not.
    const subset = base.filter((listing) => matchesAttributeFilters(listing, attrs, attr.key));

    if (isToggle) {
      facets[attr.key] = {
        true: subset.reduce(
          (sum, listing) => sum + (listing.attributes?.[attr.key] ? 1 : 0),
          0,
        ),
      };
      continue;
    }

    const tally = Object.create(null);
    for (const option of attr.options) tally[String(option)] = 0;
    for (const listing of subset) {
      const value = listing.attributes?.[attr.key];
      if (value === undefined || value === null) continue;
      const key = String(value);
      if (Object.hasOwn(tally, key)) tally[key] += 1;
    }
    facets[attr.key] = tally;
  }

  return facets;
}
