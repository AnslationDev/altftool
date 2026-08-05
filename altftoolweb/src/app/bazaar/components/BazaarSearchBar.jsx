"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";

import SearchSuggestions, { useSearchSuggestions } from "./SearchSuggestions";
import { getAllCities, getPopularCities } from "../data/cities";
import { getMarket } from "../data/market";
import { SUGGESTION_KINDS } from "../data/search";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

/**
 * Search + location control.
 *
 * Submitting navigates to /bazaar/search rather than filtering in place, so a
 * search result is a real URL that can be linked, shared and crawled.
 *
 * ---------------------------------------------------------------------------
 * Where the suggestion popup lives in the DOM, and why
 * ---------------------------------------------------------------------------
 * It is a sibling of the `<form>`, not a child. `.bzr-searchbar` sets
 * `overflow: hidden` (it needs it to clip the rounded corners of the submit
 * button), and `overflow: hidden` clips absolutely positioned descendants no
 * matter which ancestor is their containing block. Anything positioned inside
 * that form is therefore invisible below the first row of pixels. Rendering the
 * popup outside the form and positioning it against a wrapper avoids that
 * entirely, and has the side benefit that a click inside the popup can never be
 * interpreted as a form submission.
 *
 * ---------------------------------------------------------------------------
 * Keyboard contract
 * ---------------------------------------------------------------------------
 *   ↓ / ↑   move through the options; opens the popup if it is closed, and
 *           cycles through index -1, which means "no option, the text I typed"
 *   Enter   accept the highlighted option; with nothing highlighted the form
 *           submits exactly as it did before this file grew a dropdown
 *   Escape  dismiss. The typed text is untouched because it is never
 *           overwritten in the first place: highlighting a row moves
 *           `aria-activedescendant` and nothing else, deliberately, so there is
 *           no inline-autocomplete state that could strand a half-accepted
 *           suggestion in the field.
 *   Tab     close and let focus move on. Tab never accepts a suggestion —
 *           people tab towards the Sell button, not to commit a search.
 */

const LISTBOX_ID = "bazaar-search-suggestions";

export default function BazaarSearchBar({ defaultQuery = "", autoFocus = false }) {
  const { t } = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();
  const citySlug = useBazaarStore((s) => s.citySlug);
  const setCity = useBazaarStore((s) => s.setCity);
  const addRecentSearch = useBazaarStore((s) => s.addRecentSearch);

  const [query, setQuery] = useState(defaultQuery);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [rawActiveIndex, setActiveIndex] = useState(-1);
  const pickerRef = useRef(null);
  const comboRef = useRef(null);

  const { groups, options } = useSearchSuggestions({ query, open: suggestOpen });

  const cities = getAllCities();
  // Until hydration the stored city is unknown, so show the neutral label
  // rather than a city the visitor did not choose.
  const activeCity = hydrated ? cities.find((c) => c.slug === citySlug) : null;

  const closeSuggestions = useCallback(() => {
    setSuggestOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!pickerOpen) return undefined;
    function onPointerDown(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerOpen(false);
      }
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setPickerOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (!suggestOpen) return undefined;
    function onPointerDown(event) {
      if (comboRef.current && !comboRef.current.contains(event.target)) {
        closeSuggestions();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [suggestOpen, closeSuggestions]);

  /**
   * The highlighted row must exist. Re-typing shortens the list, so the raw
   * index can outlive the option it pointed at — and a stale
   * `aria-activedescendant` names an id that is no longer in the DOM, which
   * screen readers report as nothing at all.
   *
   * Derived rather than corrected in an effect: an effect that clamps state
   * renders once with the bad value first, which is exactly the frame the
   * assistive technology reads.
   */
  const activeIndex = rawActiveIndex < options.length ? rawActiveIndex : -1;

  /** The one place a text search turns into a URL. */
  const runSearch = useCallback(
    (term) => {
      const clean = String(term || "").trim();
      if (clean) addRecentSearch(clean);
      const params = new URLSearchParams();
      if (clean) params.set("q", clean);
      if (hydrated && citySlug) params.set("city", citySlug);
      closeSuggestions();
      router.push(`/bazaar/search${params.size ? `?${params}` : ""}`);
    },
    [addRecentSearch, citySlug, closeSuggestions, hydrated, router],
  );

  function onSubmit(event) {
    event.preventDefault();
    runSearch(query);
  }

  const selectOption = useCallback(
    (option) => {
      if (!option) return;
      // A "Search for …" row has to produce the same URL the submit button
      // does, city filter included, or accepting the first suggestion would
      // quietly search all of India.
      if (option.kind === SUGGESTION_KINDS.QUERY) {
        setQuery(option.searchTerm || option.label);
        runSearch(option.searchTerm || option.label);
        return;
      }
      closeSuggestions();
      router.push(option.href);
    },
    [closeSuggestions, router, runSearch],
  );

  function onKeyDown(event) {
    if (event.key === "Escape") {
      if (suggestOpen) {
        // `type="search"` clears itself on Escape in WebKit; the popup is the
        // thing being dismissed here, not the query.
        event.preventDefault();
        closeSuggestions();
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!suggestOpen) {
        event.preventDefault();
        setSuggestOpen(true);
        setActiveIndex(-1);
        return;
      }
      if (options.length === 0) return;
      event.preventDefault();
      // Cycles through -1, which means "no option — the text I typed". That is
      // what lets someone arrow past the end of the list and get their own
      // query back instead of wrapping straight onto row 1.
      //
      // The updater form, and it re-applies the clamp: two arrow presses inside
      // one React batch (a key repeat, or a test dispatching events in a single
      // tick) would otherwise both compute from the same stale index and move
      // one row between them.
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const from = current >= options.length ? -1 : current;
        const next = from + delta;
        if (next < -1) return options.length - 1;
        if (next >= options.length) return -1;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      const option = suggestOpen && activeIndex >= 0 ? options[activeIndex] : null;
      if (option) {
        event.preventDefault();
        selectOption(option);
      }
      // Otherwise: do nothing, and let the form submit handler run.
      return;
    }

    if (event.key === "Tab") closeSuggestions();
  }

  const needle = cityFilter.trim().toLowerCase();
  const shown = needle
    ? cities.filter((c) => c.name.toLowerCase().includes(needle))
    : getPopularCities(14);

  const activeOption = activeIndex >= 0 ? options[activeIndex] : null;
  const optionIdFor = (option) => `${LISTBOX_ID}-${option.id}`;

  return (
    <div
      className="relative"
      // Both popups anchor here and both need outside-click detection, so one
      // node serves both refs. The cross case — clicking the city trigger
      // while suggestions are open, or vice versa — is handled explicitly by
      // the triggers themselves rather than by these handlers.
      ref={(node) => {
        pickerRef.current = node;
        comboRef.current = node;
      }}
    >
      <form className="bzr-searchbar" role="search" onSubmit={onSubmit}>
        {/* The wrapper is the flex item, so the narrow-screen full-width rule
            lives on it. The panel itself is NOT in here — see below. */}
        <div className="bzr-searchbar-locwrap relative">
          <button
            type="button"
            className="bzr-searchbar-location"
            aria-expanded={pickerOpen}
            aria-haspopup="listbox"
            onClick={() => {
              // Two popups anchored to the same bar; only one may be open.
              closeSuggestions();
              setPickerOpen((open) => !open);
            }}
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {activeCity ? activeCity.name : t("filter.allCountry", { country: getMarket().countryName })}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
          </button>

        </div>

        <input
          type="search"
          className="bzr-searchbar-field"
          placeholder={t("shell.searchPlaceholder")}
          aria-label={t("shell.searchAria")}
          value={query}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={suggestOpen}
          // Only reference the listbox while it exists — with the popup
          // closed the id is not in the DOM, and a dangling IDREF was the one
          // ARIA error the vertical's audit found (§4.7). ARIA 1.2 makes
          // aria-controls optional on a closed combobox.
          aria-controls={suggestOpen ? LISTBOX_ID : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? optionIdFor(activeOption) : undefined}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setSuggestOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setSuggestOpen(true)}
          onKeyDown={onKeyDown}
        />

        <button type="submit" className="bzr-searchbar-submit" aria-label={t("shell.searchSubmit")}>
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {/* The city panel lives OUTSIDE the <form>.
          `.bzr-searchbar` sets `overflow: hidden` — it needs it to clip the
          submit button's corners against the rounded container — and
          `overflow: hidden` clips absolutely positioned descendants whatever
          their containing block is. With the panel inside, a ~320px dropdown
          was cropped to the 46px height of the bar: the control opened, the
          options were focusable and clickable, and almost none of it was
          visible. Rendering it as a sibling of the form, anchored to the same
          wrapper, sidesteps the clip entirely — and a click inside it can
          never be read as a form submission. */}
        {pickerOpen ? (
          <div
            className="absolute start-0 top-full z-50 mt-1 w-[min(18rem,calc(100vw-1.5rem))] rounded-lg border border-(--border) bg-(--card) p-2 shadow-lg"
            role="dialog"
            aria-label={t("shell.cityAria")}
          >
            <input
              type="text"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder={t("shell.citySearchPlaceholder")}
              aria-label={t("shell.citySearchPlaceholder")}
              className="mb-2 w-full rounded-md border border-(--border) bg-(--background) px-2.5 py-1.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
            />
            <ul className="max-h-64 overflow-y-auto" role="listbox">
              {shown.map((city) => (
                <li key={city.slug}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={city.slug === citySlug}
                    className={`w-full rounded-md px-2.5 py-1.5 text-start text-sm hover:bg-(--secondary-bg) ${
                      city.slug === citySlug
                        ? "font-semibold text-(--primary-text)"
                        : "text-(--foreground)"
                    }`}
                    onClick={() => {
                      setCity(city.slug);
                      setPickerOpen(false);
                      setCityFilter("");
                    }}
                  >
                    {city.name}
                    {city.stateName ? (
                      <span className="ms-1 text-xs text-(--muted-foreground)">
                        {city.stateName}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
              {shown.length === 0 ? (
                <li className="px-2.5 py-2 text-sm text-(--muted-foreground)">
                  {t("search.noCityMatch")}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

      {suggestOpen ? (
        <SearchSuggestions
          listboxId={LISTBOX_ID}
          optionIdFor={optionIdFor}
          groups={groups}
          activeIndex={activeIndex}
          onSelect={selectOption}
          onHover={setActiveIndex}
        />
      ) : null}
    </div>
  );
}
