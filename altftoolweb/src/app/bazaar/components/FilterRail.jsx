"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import { toNumberOrNull, toggleSelectValue } from "../data/filters";
import { getMarket } from "../data/market";
import { useLocale } from "../i18n/useLocale";

/**
 * The filter rail.
 *
 * ---------------------------------------------------------------------------
 * It still holds no filter state
 * ---------------------------------------------------------------------------
 * Every control reads its value out of the parsed `state` (which came from the
 * query string) and reports changes back through `onChange` / `onAttributeRange`
 * / `onAttributeSelect`, which push a new URL. The only local state in this file
 * is presentational — which groups are collapsed, how many options are showing,
 * and what is typed in a group's option-search box. None of it changes what is
 * being filtered, so none of it belongs in the URL.
 *
 * The two number inputs inside a range group are the one exception that touches
 * a filter value: they keep a keystroke buffer so we do not push a URL per digit,
 * and they are remounted via `key` whenever the committed value changes, which
 * keeps them in sync without a state-syncing effect.
 *
 * ---------------------------------------------------------------------------
 * Select attributes are multi-select
 * ---------------------------------------------------------------------------
 * A buyer open to "Maruti Suzuki or Hyundai or Tata" used to have to run three
 * searches, because each `select` attribute was a radio group. They are now
 * checkbox groups writing a comma-separated param (`?brand=Hyundai,Maruti
 * Suzuki,Tata`), and a single ticked box produces exactly the URL — and exactly
 * the results — that the old radio produced. The codec lives in `data/filters.js`
 * so the rail, the chip row and the matcher cannot drift apart.
 *
 * Category stays single-select: the attribute params below it only mean anything
 * inside one category, so two categories at once has nothing to render.
 *
 * ---------------------------------------------------------------------------
 * Per-option counts
 * ---------------------------------------------------------------------------
 * `facets[attrKey][option]` is how many ads would match if that option were
 * added to the current selection (see `computeFacetCounts`). A zero-count option
 * is `disabled`, because offering a click that can only lead to an empty page is
 * worse than showing nothing. An option that is *already ticked* is never
 * disabled even at zero — otherwise a visitor who over-filtered could not untick
 * their way back out.
 *
 * `facets` is null on `/bazaar/search`, which filters server-side and holds only
 * one page of results; the rail then renders without numbers rather than with
 * invented ones.
 *
 * Attribute groups are generated from the category's own `attributes` array —
 * that is the whole point of the taxonomy carrying them. Adding a filter to Cars
 * means editing `data/categories.js`, not this file.
 */

/** Options shown before "Show all N" is clicked. */
const VISIBLE_LIMIT = 6;
/** Above this many options a group gets its own inline search box. */
const SEARCH_THRESHOLD = 10;
/** Stable empty selection, so an unfiltered group does not re-derive its memos. */
const NO_VALUES = [];

/**
 * Which groups the visitor has collapsed, keyed by `${idPrefix}:${group}`.
 *
 * Module scope rather than component state, on purpose. Applying a filter pushes
 * a new URL, and closing the mobile drawer unmounts the whole rail; in both cases
 * a `useState` here would silently spring every group back open, which is
 * infuriating precisely when a visitor is iterating on filters. Keeping the map
 * outside the component makes the choice survive both.
 *
 * It is written only from a click handler, so it is always empty during server
 * rendering and during the first client render — the prerendered HTML and the
 * hydrated tree agree.
 */
const collapsedGroups = new Map();

function useCollapsible(storeKey) {
  const [collapsed, setCollapsed] = useState(() => collapsedGroups.get(storeKey) === true);

  const toggle = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      collapsedGroups.set(storeKey, next);
      return next;
    });
  }, [storeKey]);

  return [collapsed, toggle];
}

/* ------------------------------------------------------------------
 * Group shell
 * ---------------------------------------------------------------- */

/**
 * A collapsible `fieldset`. The legend is a real `<button aria-expanded>` so the
 * group can be opened from the keyboard and announced correctly; the body is
 * hidden with the `hidden` attribute rather than unmounted, so a half-typed
 * option search survives a collapse.
 */
function FilterGroup({ id, legend, unit, collapseKey, badge, children }) {
  const [collapsed, toggle] = useCollapsible(collapseKey);
  const bodyId = `${id}-body`;

  return (
    <fieldset className="bzr-filter-group">
      <legend className="bzr-filter-legend w-full">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          className="flex w-full items-center justify-between gap-2 text-start text-[0.78rem] font-bold tracking-[0.05em] text-(--muted-foreground) uppercase"
        >
          <span className="min-w-0 truncate">
            {legend}
            {unit ? <span className="ms-1 normal-case opacity-80">({unit})</span> : null}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {badge ? (
              <span className="rounded-full bg-(--primary) px-1.5 text-[0.68rem] leading-4 font-bold text-(--primary-foreground)">
                {badge}
              </span>
            ) : null}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${collapsed ? "" : "rotate-180"}`}
              aria-hidden="true"
            />
          </span>
        </button>
      </legend>
      <div id={bodyId} hidden={collapsed}>
        {children}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------
 * Range group
 * ---------------------------------------------------------------- */

/** Two number inputs with an optional unit. Commits on blur or Enter. */
function RangeGroup({ id, legend, unit, bounds, initialMin, initialMax, collapseKey, onCommit }) {
  const { t } = useLocale();
  const [min, setMin] = useState(initialMin === null ? "" : String(initialMin));
  const [max, setMax] = useState(initialMax === null ? "" : String(initialMax));

  function commit() {
    onCommit(toNumberOrNull(min), toNumberOrNull(max));
  }

  function onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
  }

  const inputClass =
    "w-full min-w-0 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--background) px-2 py-1.5 text-sm text-(--foreground)";

  return (
    <FilterGroup
      id={id}
      legend={legend}
      unit={unit}
      collapseKey={collapseKey}
      badge={initialMin !== null || initialMax !== null ? "1" : null}
    >
      <div className="flex items-center gap-2">
        <input
          id={`${id}-min`}
          type="number"
          inputMode="numeric"
          className={inputClass}
          placeholder={bounds?.[0] !== undefined ? String(bounds[0]) : t("filter.min")}
          aria-label={t("filter.minAria", { legend })}
          value={min}
          onChange={(event) => setMin(event.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
        <span aria-hidden="true" className="text-(--muted-foreground)">
          –
        </span>
        <input
          id={`${id}-max`}
          type="number"
          inputMode="numeric"
          className={inputClass}
          placeholder={bounds?.[1] !== undefined ? String(bounds[1]) : t("filter.max")}
          aria-label={t("filter.maxAria", { legend })}
          value={max}
          onChange={(event) => setMax(event.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </div>
    </FilterGroup>
  );
}

/* ------------------------------------------------------------------
 * Option group — checkboxes (multi) or radios (single)
 * ---------------------------------------------------------------- */

/**
 * A checkbox or a radio, written out twice rather than with a computed `type`.
 *
 * Two reasons for the duplication. `jsx-a11y` can only resolve an input's
 * implicit role from a *literal* `type`; a computed one reads as a textbox and
 * the rule then rejects `aria-checked`. And `aria-checked` is spelled out even
 * though a native input already conveys checkedness, so the two can never
 * disagree — they are driven from the same `checked` prop.
 *
 * `multiple` is fixed per group, so this never swaps type under React.
 */
function ChoiceInput({ multiple, name, checked, disabled, onChange }) {
  if (multiple) {
    return (
      <input
        type="checkbox"
        checked={checked}
        aria-checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  return (
    <input
      type="radio"
      name={name}
      checked={checked}
      aria-checked={checked}
      disabled={disabled}
      onChange={onChange}
    />
  );
}

function OptionRow({ name, multiple, label, count, checked, disabled, onToggle }) {
  const { t } = useLocale();
  return (
    <label
      className={`bzr-filter-option${disabled ? " cursor-not-allowed opacity-45" : ""}`}
      title={disabled ? t("filter.noMatchTitle", { label }) : undefined}
    >
      <ChoiceInput
        multiple={multiple}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? (
        <span className="shrink-0 text-xs tabular-nums text-(--muted-foreground)">
          {count.toLocaleString("en-IN")}
        </span>
      ) : null}
    </label>
  );
}

/**
 * One attribute's options.
 *
 * `counts` is `{ [option]: number }` or null. `selected` is always an array — a
 * single-select group is just the array capped at one, which keeps one code path
 * for the "Any" affordance, the counts, the collapse state and the show-all
 * behaviour instead of two that drift.
 */
function OptionGroup({
  id,
  legend,
  collapseKey,
  options,
  selected = NO_VALUES,
  counts = null,
  multiple = true,
  anyLabel = null,
  onToggleValue,
  onClear,
}) {
  const { t } = useLocale();
  const [showAll, setShowAll] = useState(false);
  const [needle, setNeedle] = useState("");

  // Callers that want a specific escape-hatch label ("All categories") pass it
  // already translated; everyone else gets the locale's "Any".
  const anyText = anyLabel ?? t("filter.any");

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const searchable = options.length > SEARCH_THRESHOLD;
  const trimmed = needle.trim().toLowerCase();

  /**
   * While searching, show matches only. Otherwise show the first
   * `VISIBLE_LIMIT` — plus anything already ticked, however far down the list it
   * sits, because a filter you cannot see is a filter you cannot remove.
   */
  const visible = useMemo(() => {
    if (trimmed) {
      return options.filter((option) => option.label.toLowerCase().includes(trimmed));
    }
    if (showAll) return options;
    return options.filter((option, index) => index < VISIBLE_LIMIT || selectedSet.has(option.value));
  }, [options, trimmed, showAll, selectedSet]);

  const expandable = !trimmed && options.length > VISIBLE_LIMIT;

  return (
    <FilterGroup
      id={id}
      legend={legend}
      collapseKey={collapseKey}
      badge={selected.length > 0 ? String(selected.length) : null}
    >
      {searchable ? (
        <div className="relative mb-1.5">
          <Search
            className="pointer-events-none absolute top-1/2 start-2 h-3.5 w-3.5 -translate-y-1/2 text-(--muted-foreground)"
            aria-hidden="true"
          />
          <input
            id={`${id}-search`}
            type="search"
            className="w-full rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--background) py-1.5 pe-2 ps-7 text-sm text-(--foreground)"
            // `toLowerCase()` is a no-op on Devanagari, so one template serves
            // both scripts; the legend arrives already translated.
            placeholder={t("filter.searchOptions", { legend: String(legend).toLowerCase() })}
            aria-label={t("filter.searchOptionsAria", { legend })}
            value={needle}
            onChange={(event) => setNeedle(event.target.value)}
          />
        </div>
      ) : null}

      {/*
        The explicit "Any" escape hatch. It is ticked exactly when nothing else
        is, and clicking it clears the key — so "no filter" is a state a visitor
        can choose rather than one they have to reconstruct by unticking boxes
        one at a time.
      */}
      <label className="bzr-filter-option">
        <ChoiceInput
          multiple={multiple}
          name={id}
          checked={selected.length === 0}
          onChange={onClear}
        />
        <span>{anyText}</span>
      </label>

      {visible.map((option) => {
        const checked = selectedSet.has(option.value);
        const count = counts ? (counts[option.value] ?? 0) : null;
        return (
          <OptionRow
            key={option.value}
            name={id}
            multiple={multiple}
            label={option.label}
            count={count}
            checked={checked}
            // Zero results is a dead end, but never take away the control that
            // undoes an over-narrow selection.
            disabled={count === 0 && !checked}
            onToggle={() => onToggleValue(option.value, checked)}
          />
        );
      })}

      {trimmed && visible.length === 0 ? (
        <p className="py-1 text-xs text-(--muted-foreground)">
          {t("filter.noOptions", { needle: needle.trim() })}
        </p>
      ) : null}

      {expandable ? (
        <button
          type="button"
          // `--primary-text` (rgb(15,118,110), 5.15:1) rather than `--primary`
          // (rgb(13,148,136), 3.53:1) — 12px text needs 4.5:1. Dark theme
          // resolves both to the same colour, so only light changes.
          className="mt-1 text-xs font-semibold text-(--primary-text) underline underline-offset-2"
          aria-expanded={showAll}
          onClick={() => setShowAll((previous) => !previous)}
        >
          {showAll ? t("filter.showLess") : t("filter.showAll", { count: options.length })}
          <span className="sr-only"> {legend}</span>
        </button>
      ) : null}
    </FilterGroup>
  );
}

/* ------------------------------------------------------------------
 * Rail
 * ---------------------------------------------------------------- */

export default function FilterRail({
  idPrefix = "rail",
  state,
  attributes = [],
  priceBand = null,
  cities = [],
  categoryOptions = null,
  facets = null,
  onChange,
  onAttributeRange,
  onAttributeSelect,
}) {
  // Interface labels only. Attribute OPTION VALUES ("Diesel", "Semi-furnished")
  // are deliberately NOT translated: the value string doubles as the URL param
  // and the match key (`?fuel=Diesel`), so a translated display copy would need
  // a per-option reverse map to stay honest. Display label === value keeps the
  // codec trivial; the scope note in the shell covers the mixed script.
  const { t, categoryName, attributeLabel } = useLocale();

  const selectClass =
    "w-full rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--background) px-2 py-1.5 text-sm text-(--foreground)";

  const activeCity = cities.find((city) => city.slug === state.city) || null;

  // Switching or clearing the category invalidates the previous category's
  // attribute params, so they go in the same push.
  const clearedAttributes = useMemo(
    () => attributes.map((attr) => [attr.key, null]),
    [attributes],
  );
  const commitCategory = useCallback(
    (value) => onChange(Object.fromEntries([["category", value], ...clearedAttributes])),
    [onChange, clearedAttributes],
  );

  return (
    <div className="bzr-filters">
      {categoryOptions ? (
        <OptionGroup
          id={`${idPrefix}-category`}
          legend={t("filter.category")}
          collapseKey={`${idPrefix}:category`}
          anyLabel={t("filter.allCategories")}
          multiple={false}
          selected={state.categorySlug ? [state.categorySlug] : []}
          options={categoryOptions.map((category) => ({
            // Value stays the slug (it is the URL param); only the display
            // label localises, which is why this is safe where attribute
            // options are not.
            value: category.slug,
            label: categoryName(category.slug, category.name),
          }))}
          counts={Object.fromEntries(
            categoryOptions.map((category) => [category.slug, category.count]),
          )}
          onToggleValue={(value, checked) => commitCategory(checked ? null : value)}
          onClear={() => commitCategory(null)}
        />
      ) : null}

      <RangeGroup
        key={`${idPrefix}-price-${state.min ?? ""}-${state.max ?? ""}`}
        id={`${idPrefix}-price`}
        legend={t("filter.price")}
        unit={getMarket().currencySymbol}
        collapseKey={`${idPrefix}:price`}
        bounds={priceBand}
        initialMin={state.min}
        initialMax={state.max}
        onCommit={(min, max) => onChange({ min, max })}
      />

      <FilterGroup
        id={`${idPrefix}-city-group`}
        legend={t("filter.city")}
        collapseKey={`${idPrefix}:city`}
      >
        <select
          id={`${idPrefix}-city`}
          className={selectClass}
          aria-label={t("filter.city")}
          value={state.city}
          onChange={(event) =>
            // A locality belongs to exactly one city; changing city must drop it.
            onChange({ city: event.target.value || null, locality: null })
          }
        >
          <option value="">{t("filter.allCountry", { country: getMarket().countryName })}</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      {activeCity ? (
        <FilterGroup
          id={`${idPrefix}-locality-group`}
          legend={t("filter.locality")}
          collapseKey={`${idPrefix}:locality`}
        >
          <select
            id={`${idPrefix}-locality`}
            className={selectClass}
            aria-label={t("filter.locality")}
            value={state.locality}
            onChange={(event) => onChange({ locality: event.target.value || null })}
          >
            <option value="">{t("filter.allOfCity", { city: activeCity.name })}</option>
            {(activeCity.localities || []).map((locality) => (
              <option key={locality} value={locality}>
                {locality}
              </option>
            ))}
          </select>
        </FilterGroup>
      ) : null}

      {attributes.map((attr) => {
        const filter = state.attrs[attr.key];
        const id = `${idPrefix}-${attr.key}`;
        const collapseKey = `${idPrefix}:${attr.key}`;
        const legend = attributeLabel(attr.key, attr.label);

        if (attr.type === "range") {
          return (
            <RangeGroup
              key={`${id}-${filter?.min ?? ""}-${filter?.max ?? ""}`}
              id={id}
              legend={legend}
              unit={attr.unit}
              collapseKey={collapseKey}
              bounds={[attr.min, attr.max]}
              initialMin={filter?.min ?? null}
              initialMax={filter?.max ?? null}
              onCommit={(min, max) => onAttributeRange(attr.key, min, max)}
            />
          );
        }

        if (attr.type === "toggle") {
          const count = facets?.[attr.key]?.true;
          const checked = Boolean(filter);
          return (
            <fieldset key={id} className="bzr-filter-group">
              <label
                className={`bzr-filter-option${count === 0 && !checked ? " cursor-not-allowed opacity-45" : ""}`}
                htmlFor={id}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  aria-checked={checked}
                  disabled={count === 0 && !checked}
                  onChange={(event) =>
                    onChange({ [attr.key]: event.target.checked ? "true" : null })
                  }
                />
                <span className="min-w-0 flex-1 truncate">{legend}</span>
                {typeof count === "number" ? (
                  <span className="shrink-0 text-xs tabular-nums text-(--muted-foreground)">
                    {count.toLocaleString("en-IN")}
                  </span>
                ) : null}
              </label>
            </fieldset>
          );
        }

        if (!Array.isArray(attr.options) || attr.options.length === 0) return null;

        const selected = filter?.values || NO_VALUES;

        return (
          <OptionGroup
            key={id}
            id={id}
            legend={legend}
            collapseKey={collapseKey}
            selected={selected}
            counts={facets?.[attr.key] || null}
            options={attr.options.map((option) => ({ value: option, label: option }))}
            onToggleValue={(value) =>
              onAttributeSelect(attr.key, toggleSelectValue(selected, value))
            }
            onClear={() => onAttributeSelect(attr.key, [])}
          />
        );
      })}
    </div>
  );
}
