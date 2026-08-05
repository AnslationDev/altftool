"use client";

import { SlidersHorizontal } from "lucide-react";

import { useLocale } from "../i18n/useLocale";

/**
 * The strip above the results grid: how many ads matched, the sort control,
 * and the button that opens the filter sheet on small screens.
 *
 * The sort is a plain <select> that pushes `?sort=` rather than reordering in
 * place, so a sorted view is a URL like every other view here.
 *
 * The result count resolves through the catalogue with a literal `{range}`
 * token left in the string; the component splits on it and renders the bold
 * `first–last` span at that position. English puts the numbers first
 * ("1–24 of 720 ads"), Hindi puts the total first ("720 विज्ञापनों में से
 * 1–24") — one template per language, same emphasised markup in both.
 */
export default function BrowseToolbar({
  total = 0,
  page = 1,
  perPage = 24,
  sort = "relevance",
  sortOptions = [],
  activeCount = 0,
  onSortChange,
  onOpenFilters,
  // Rendered node rather than a hard import, so the toolbar stays presentational
  // and does not need the category/city data the save control reads.
  saveSearch = null,
}) {
  const { t } = useLocale();
  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(total, page * perPage);

  const countTemplate = t(total === 1 ? "results.rangeOne" : "results.range", {
    total: total.toLocaleString("en-IN"),
  });
  const [beforeRange, afterRange = ""] = countTemplate.split("{range}");

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-(--border) pb-3">
      {/* At 360px the count gets its own row; from `sm` up it shares the strip
          with the sort control and pushes it to the right. */}
      <p
        className="order-1 w-full whitespace-nowrap text-sm text-(--muted-foreground) sm:min-w-0 sm:flex-1"
        aria-live="polite"
      >
        {total === 0 ? (
          t("results.none")
        ) : (
          <>
            {beforeRange}
            <span className="font-semibold text-(--foreground)">
              {first.toLocaleString("en-IN")}–{last.toLocaleString("en-IN")}
            </span>
            {afterRange}
          </>
        )}
      </p>

      {/* The `lg:hidden` lives on the wrapper, not on the button: bazaar.css is
          imported unlayered, so its `.bzr-btn { display: inline-flex }` beats
          any Tailwind display utility (layered CSS always loses to unlayered,
          specificity notwithstanding). The wrapper carries no bzr- class, so
          the utility applies there. */}
      <span className="order-2 lg:hidden">
        <button type="button" className="bzr-btn bzr-btn-secondary" onClick={onOpenFilters}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {t("filter.open")}
          {activeCount > 0 ? (
            <span className="ms-1 rounded-full bg-(--primary) px-1.5 text-xs text-(--primary-foreground)">
              {activeCount}
            </span>
          ) : null}
        </button>
      </span>

      {saveSearch ? <span className="order-2">{saveSearch}</span> : null}

      <label className="order-3 ms-auto flex items-center gap-2 text-sm text-(--muted-foreground)">
        <span className="hidden sm:inline">{t("sort.label")}</span>
        <select
          className="rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--background) px-2 py-1.5 text-sm text-(--foreground)"
          aria-label={t("sort.aria")}
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {/* Catalogue ids mirror the SORTS values, so the option's own label
              is the fallback and an unknown sort value degrades to English. */}
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(`sort.${option.value}`, option.label)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
