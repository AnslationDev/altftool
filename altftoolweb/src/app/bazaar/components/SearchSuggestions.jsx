"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, CornerDownLeft, MapPin, Search, Tag } from "lucide-react";

import {
  SUGGESTION_KINDS,
  popularCategorySuggestions,
  suggest,
} from "../data/search";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";

/**
 * The search-bar suggestion dropdown.
 *
 * ---------------------------------------------------------------------------
 * Why the options are `<li role="option">` and not links
 * ---------------------------------------------------------------------------
 * Every option carries a real `href`, and the natural instinct is to render an
 * `<a>`. ARIA forbids it: a `listbox` may only contain `option`s, and an
 * `option` may only contain text — a focusable anchor inside one puts two
 * competing focus models on the same row and screen readers announce it as
 * neither a link nor an option. So the rows are `role="option"` elements, the
 * input keeps focus for the whole interaction, and selection navigates through
 * the router. Nothing is lost for crawlers: this popup only exists after
 * hydration, and the destinations it offers (`/bazaar/c/…`, `/bazaar/in/…`) are
 * linked from the category and city directories, which ARE crawlable.
 *
 * `onMouseDown` is prevented on the list so a click does not blur the input
 * before the click handler runs — the classic combobox bug where clicking an
 * option closes the popup and does nothing else.
 *
 * ---------------------------------------------------------------------------
 * Two states
 * ---------------------------------------------------------------------------
 * Empty box: recent searches (only after `useHydrated()`, because they live in
 * localStorage and rendering them earlier makes the server HTML and the first
 * client render disagree) plus a shelf of popular categories.
 * Typed: grouped matches from `data/search.js`.
 */

/**
 * Long enough that a fast typist does not recompute on every keystroke, short
 * enough that the list feels attached to the keyboard. Matching is synchronous
 * and local, so this is about render churn, not network latency.
 */
const DEBOUNCE_MS = 120;

const EMPTY_RESULT = { groups: [], options: [] };

const KIND_ICON = {
  [SUGGESTION_KINDS.CATEGORY]: Tag,
  [SUGGESTION_KINDS.SUBCATEGORY]: Tag,
  [SUGGESTION_KINDS.CITY]: MapPin,
  [SUGGESTION_KINDS.BRAND]: Tag,
  [SUGGESTION_KINDS.QUERY]: Search,
  recent: Clock,
};

/**
 * The idle panel: what to offer someone who has focused the box and typed
 * nothing. Built into the same `{ groups, options }` shape the typed path
 * returns, so the keyboard handler upstream never has to know which state it
 * is driving.
 */
function buildIdleSuggestions({ recentSearches, hydrated }) {
  const groups = [];
  const options = [];

  function pushGroup(id, label, entries) {
    if (entries.length === 0) return;
    const withIds = entries.map((entry, position) => ({
      ...entry,
      id: `${id}-${position}`,
      group: id,
      index: options.length + position,
    }));
    options.push(...withIds);
    groups.push({ id, label, options: withIds });
  }

  if (hydrated && recentSearches.length > 0) {
    pushGroup(
      "recent",
      "Recent searches",
      recentSearches.slice(0, 5).map((term) => ({
        kind: SUGGESTION_KINDS.QUERY,
        icon: "recent",
        label: term,
        sublabel: null,
        href: `/bazaar/search?q=${encodeURIComponent(term)}`,
        searchTerm: term,
      })),
    );
  }

  pushGroup(
    "popular",
    "Popular categories",
    popularCategorySuggestions(6).map((entry) => ({
      kind: entry.kind,
      label: entry.label,
      sublabel: null,
      href: entry.href,
      searchTerm: null,
    })),
  );

  return { groups, options };
}

/**
 * Debounced suggestions for the current input value.
 *
 * @param {{ query: string, open: boolean }} params
 * @returns {{ groups: object[], options: object[] }} `options` is every row in
 *   render order, each carrying its own `index`. The keyboard handler and the
 *   rendered list therefore agree by construction about what row 3 is.
 */
export function useSearchSuggestions({ query, open }) {
  const hydrated = useHydrated();
  const recentSearches = useBazaarStore((state) => state.recentSearches);
  const [settled, setSettled] = useState(query);

  useEffect(() => {
    if (query === settled) return undefined;
    const timer = setTimeout(() => setSettled(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, settled]);

  return useMemo(() => {
    if (!open) return EMPTY_RESULT;
    const trimmed = settled.trim();
    if (!trimmed) return buildIdleSuggestions({ recentSearches, hydrated });
    return suggest(trimmed);
  }, [open, settled, recentSearches, hydrated]);
}

/**
 * @param {object} props
 * @param {string} props.listboxId          must match the input's aria-controls
 * @param {(option: object) => string} props.optionIdFor
 * @param {object[]} props.groups
 * @param {number} props.activeIndex        -1 means "the typed text itself"
 * @param {(option: object) => void} props.onSelect
 * @param {(index: number) => void} props.onHover
 */
export default function SearchSuggestions({
  listboxId,
  optionIdFor,
  groups,
  activeIndex,
  onSelect,
  onHover,
}) {
  const hasOptions = groups.some((group) => group.options.length > 0);

  return (
    <div
      className="absolute inset-x-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto overscroll-contain rounded-lg border border-(--border) bg-(--card) py-1 shadow-lg"
      // A click must not steal focus from the input: the input owns
      // aria-activedescendant, and losing focus mid-click closes the popup
      // before onClick can fire.
      onMouseDown={(event) => event.preventDefault()}
    >
      <ul id={listboxId} role="listbox" aria-label="Search suggestions">
        {groups.map((group) => (
          <li key={group.id} role="presentation">
            {group.label ? (
              <p
                className="px-3 pb-1 pt-2 text-[0.68rem] font-bold uppercase tracking-wide text-(--muted-foreground)"
                // The heading is decoration inside the listbox; announcing it
                // as an option would add rows the arrow keys cannot reach.
                aria-hidden="true"
              >
                {group.label}
              </p>
            ) : null}

            <ul role="presentation">
              {group.options.map((option) => {
                const Icon = KIND_ICON[option.icon || option.kind] || Search;
                const active = option.index === activeIndex;
                return (
                  <li
                    key={option.id}
                    id={optionIdFor(option)}
                    role="option"
                    aria-selected={active}
                    className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm ${
                      active ? "bg-(--secondary-bg)" : ""
                    }`}
                    onClick={() => onSelect(option)}
                    onMouseEnter={() => onHover(option.index)}
                  >
                    <Icon
                      className="h-3.5 w-3.5 shrink-0 text-(--muted-foreground)"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-(--foreground)">
                      {option.kind === SUGGESTION_KINDS.QUERY && option.group === "queries" ? (
                        <>
                          Search for <span className="font-semibold">{option.label}</span>
                        </>
                      ) : (
                        option.label
                      )}
                    </span>
                    {option.sublabel ? (
                      <span className="shrink-0 truncate text-xs text-(--muted-foreground)">
                        {option.sublabel}
                      </span>
                    ) : null}
                    {active ? (
                      <CornerDownLeft
                        className="h-3.5 w-3.5 shrink-0 text-(--muted-foreground)"
                        aria-hidden="true"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}

        {hasOptions ? null : (
          <li role="presentation" className="px-3 py-3 text-sm text-(--muted-foreground)">
            No category or city matches that. Press Enter to search every ad.
          </li>
        )}
      </ul>
    </div>
  );
}
