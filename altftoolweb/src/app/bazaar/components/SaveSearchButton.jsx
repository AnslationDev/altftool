"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BellPlus, Check } from "lucide-react";

import { getMarket } from "../data/market";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

/**
 * "Save this search" — the second half of the return-visit story.
 *
 * It reads the live filter state out of `useSearchParams()` rather than being
 * handed it, because the URL is already the single source of truth for every
 * filter on this page (see the header comment in BrowseView). Anything else
 * would risk saving a set of filters that differs from the one on screen.
 *
 * Callers must render this inside the same `<Suspense>` boundary the browse
 * surface already uses — `useSearchParams()` opts a route out of static
 * rendering otherwise. BrowseView is inside that boundary on every page that
 * mounts it, so passing this through BrowseToolbar needs no new boundary.
 */

/* ------------------------------------------------------------------
 * Query normalisation
 * ---------------------------------------------------------------- */

/**
 * `page` is paging, not a filter: "page 3 of used cars in Pune" is the same
 * saved search as page 1, and storing it would drop the visitor back into the
 * middle of a result set that may have changed size.
 */
const IGNORED_PARAMS = new Set(["page"]);

/**
 * Sorted so that `?city=pune&brand=Honda` and `?brand=Honda&city=pune` produce
 * one saved search rather than two identical-looking rows. The sort makes the
 * derived id stable, which is what lets "already saved" be an exact check.
 */
function normalizeQuery(searchParams) {
  const entries = [...searchParams.entries()]
    .filter(([key, value]) => !IGNORED_PARAMS.has(key) && value !== "")
    .sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  return new URLSearchParams(entries).toString();
}

/**
 * Money label for the saved-search sentence. Mirrors BrowseView's
 * `formatMoney`: reads symbol, grouping locale and symbol position from
 * `data/market.js` instead of importing the corpus-heavy `data/listings`.
 */
function formatMoney(value) {
  const market = getMarket();
  const digits = Number(value).toLocaleString(market.numberLocale);
  return market.currencyDisplay === "symbol-first"
    ? `${market.currencySymbol}${digits}`
    : `${digits}${market.currencySymbol}`;
}

function toNumberOrNull(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** "2015-2020" | "2015-" | "-2020" -> { min, max }. Mirrors BrowseView's codec. */
function parseRangeParam(raw) {
  if (!raw) return { min: null, max: null };
  const text = String(raw);
  const split = text.indexOf("-");
  if (split < 0) return { min: toNumberOrNull(text), max: null };
  return {
    min: toNumberOrNull(text.slice(0, split)),
    max: toNumberOrNull(text.slice(split + 1)),
  };
}

/* ------------------------------------------------------------------
 * The human label
 * ---------------------------------------------------------------- */

/**
 * Turn the active filters into something a person recognises a week later —
 * "Mahindra cars in Pune under ₹5,00,000", not
 * "category=cars&brand=Mahindra&city=pune&max=500000".
 *
 * Brand leads because that is how people name what they are hunting for. Price
 * reads as a bound ("under", "over") rather than a range whenever only one side
 * is set. Everything else the taxonomy declares becomes a trailing clause, so
 * the sentence stays readable however many attributes are active.
 *
 * Returns `{ label, chips }` — the chips are stored alongside the label so the
 * saved-searches page can show the filter breakdown without importing the whole
 * 24-category taxonomy into its own bundle to re-derive it.
 */
export function describeSearch({ searchParams, category, cities = [], categoryOptions = null }) {
  const attributes = category?.attributes || [];
  const chips = [];

  const q = (searchParams.get("q") || "").trim();
  const citySlug = searchParams.get("city") || "";
  const locality = searchParams.get("locality") || "";
  const min = toNumberOrNull(searchParams.get("min"));
  const max = toNumberOrNull(searchParams.get("max"));

  const cityName = citySlug ? cities.find((c) => c.slug === citySlug)?.name || citySlug : "";

  // The category comes from the route on /bazaar/c/*, and from `?category=` on
  // /bazaar/search. Either way the label wants its display name.
  const categoryName =
    category?.name ||
    (categoryOptions
      ? categoryOptions.find((c) => c.slug === searchParams.get("category"))?.name
      : "") ||
    "";

  let brand = "";
  const trailing = [];

  for (const attr of attributes) {
    const raw = searchParams.get(attr.key);
    if (!raw) continue;

    if (attr.type === "range") {
      const range = parseRangeParam(raw);
      if (range.min === null && range.max === null) continue;
      const unit = attr.unit ? ` ${attr.unit}` : "";
      const low = range.min === null ? "Any" : range.min.toLocaleString("en-IN");
      const high = range.max === null ? "Any" : range.max.toLocaleString("en-IN");
      chips.push(`${attr.label}: ${low}–${high}${unit}`);
      trailing.push(`${attr.label.toLowerCase()} ${low}–${high}${unit}`.trim());
    } else if (attr.type === "toggle") {
      if (raw !== "true") continue;
      chips.push(attr.label);
      trailing.push(attr.label.toLowerCase());
    } else {
      chips.push(`${attr.label}: ${raw}`);
      if (attr.key === "brand" && !brand) brand = raw;
      else trailing.push(raw.toLowerCase());
    }
  }

  // --- head: what is being looked for -------------------------------------
  const noun = categoryName ? categoryName.toLowerCase() : "ads";
  // "mobiles matching “iphone” in Mumbai", not "“iphone” in mobiles in Mumbai":
  // the place clause already starts with "in", and two of them in a row reads
  // as a mistake.
  const subject = brand ? `${brand} ${noun}` : noun;
  const head = q ? `${subject} matching “${q}”` : subject;

  // --- place ---------------------------------------------------------------
  let place = "";
  if (locality && cityName) place = ` in ${locality}, ${cityName}`;
  else if (locality) place = ` in ${locality}`;
  else if (cityName) place = ` in ${cityName}`;

  // --- price ---------------------------------------------------------------
  let price = "";
  if (min !== null && max !== null) price = ` from ${formatMoney(min)} to ${formatMoney(max)}`;
  else if (max !== null) price = ` under ${formatMoney(max)}`;
  else if (min !== null) price = ` over ${formatMoney(min)}`;

  const tail = trailing.length > 0 ? ` · ${trailing.join(" · ")}` : "";
  const sentence = `${head}${place}${price}${tail}`;
  const label = sentence.charAt(0).toUpperCase() + sentence.slice(1);

  // Chips are ordered the way the label reads them.
  const leading = [];
  if (q) leading.push(`Search: ${q}`);
  if (categoryName) leading.push(categoryName);
  if (cityName) leading.push(cityName);
  if (locality) leading.push(locality);
  if (min !== null || max !== null) {
    leading.push(
      `Price: ${min === null ? "Any" : formatMoney(min)} – ${max === null ? "Any" : formatMoney(max)}`,
    );
  }

  return { label, chips: [...leading, ...chips] };
}

/* ------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------- */

export default function SaveSearchButton({ category = null, cities = [], categoryOptions = null }) {
  const { t } = useLocale();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const savedSearches = useBazaarStore((s) => s.savedSearches);
  const addSavedSearch = useBazaarStore((s) => s.addSavedSearch);
  const removeSavedSearch = useBazaarStore((s) => s.removeSavedSearch);

  const search = useMemo(() => {
    const query = normalizeQuery(searchParams);
    const { label, chips } = describeSearch({ searchParams, category, cities, categoryOptions });
    return {
      // The URL *is* the identity of a search, so the id derives from it. No
      // counter and no timestamp: saving the same filters twice has to collide.
      id: query ? `${pathname}?${query}` : pathname,
      label,
      chips,
      query,
      path: pathname,
    };
  }, [searchParams, pathname, category, cities, categoryOptions]);

  // Until the store has hydrated we do not know whether this search is already
  // saved, so render the neutral (unsaved, inert) state — the same reason
  // AdCard's heart starts empty.
  const saved = hydrated && savedSearches.some((s) => s.id === search.id);

  return (
    <button
      type="button"
      className={`bzr-chip${saved ? " is-active" : ""}`}
      aria-pressed={saved}
      disabled={!hydrated}
      title={saved ? `Saved: ${search.label}` : `Save: ${search.label}`}
      onClick={() => (saved ? removeSavedSearch(search.id) : addSavedSearch(search))}
    >
      {saved ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <BellPlus className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {saved ? t("search.searchSaved") : t("search.saveSearch")}
    </button>
  );
}
