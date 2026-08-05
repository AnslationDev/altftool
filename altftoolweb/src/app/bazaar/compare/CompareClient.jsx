"use client";

/**
 * Side-by-side comparison.
 *
 * The store holds ids only, so each one is resolved against the listing corpus
 * at render time and ids that no longer resolve are dropped — a stale id is
 * not a listing with no data.
 *
 * Three judgement calls are baked in here, and each is stated in the UI rather
 * than left implicit:
 *
 * 1. **Only objectively-ordered rows get a highlight.** A lower price, fewer
 *    kilometres, a newer model year and a longer warranty are better for every
 *    buyer. Colour, facing, brand and fuel type are preferences, not rankings,
 *    so nothing is marked on those rows. Highlighting a brand would read as an
 *    endorsement, which we have no basis for.
 * 2. **A row where every ad agrees is dimmed, and can be hidden entirely.** The
 *    value of this page is the differences; identical rows are padding.
 * 3. **Mixing categories is flagged, not silently rendered.** Two ads from
 *    different categories share almost no attributes, so the matrix would be
 *    mostly em-dashes. Better to say so.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Info, ShieldCheck, X } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import { EmptyState, Note } from "../components/primitives";
import { getCategoryAttribute } from "../data/categories";
import { getListingById } from "../data/listings";
import { getMarket } from "../data/market";
import { getSeller } from "../data/sellers";
import { useCompareHydrated, useCompareStore } from "../hooks/useCompareStore";
import { useLocale } from "../i18n/useLocale";

/**
 * The only attributes with a defensible direction. Anything not listed here is
 * rendered plainly, with no winner.
 */
const BEST_RULES = {
  kmDriven: { direction: "lower", note: "fewest kilometres" },
  ageYears: { direction: "lower", note: "youngest" },
  usageHours: { direction: "lower", note: "least use" },
  usageCount: { direction: "lower", note: "least use" },
  year: { direction: "higher", note: "newest model year" },
  warrantyMonths: { direction: "higher", note: "longest warranty" },
};

const DIRECTION_LABEL = {
  lower: "lower is better",
  higher: "higher is better",
};

function humanizeKey(key) {
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Mirrors the detail page's formatter so the same ad reads the same in both. */
function formatAttributeValue(value, attribute) {
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") {
    // A model year is a label, not a quantity — "2,018" would be nonsense.
    if (attribute?.key === "year") return String(value);

    const market = getMarket();
    const formatted = value.toLocaleString(market.numberLocale);
    if (!attribute?.unit) return formatted;
    // The currency is the one unit that may lead rather than trail; which
    // side it takes is the market's `currencyDisplay`.
    if (attribute.unit !== market.currencySymbol) return `${formatted} ${attribute.unit}`;
    return market.currencyDisplay === "symbol-first"
      ? `${market.currencySymbol}${formatted}`
      : `${formatted}${market.currencySymbol}`;
  }

  return String(value);
}

/** Mark the winning cells, but only when the comparison is meaningful. */
function applyBest(cells, rule) {
  if (!rule || cells.length < 2) return cells;

  const numbers = cells
    .filter((c) => c.present && typeof c.numeric === "number")
    .map((c) => c.numeric);

  // One number is not a comparison, and if every ad agrees there is no winner.
  if (numbers.length < 2) return cells;
  const best = rule.direction === "lower" ? Math.min(...numbers) : Math.max(...numbers);
  const worst = rule.direction === "lower" ? Math.max(...numbers) : Math.min(...numbers);
  if (best === worst) return cells;

  return cells.map((c) => (c.present && c.numeric === best ? { ...c, best: true } : c));
}

function buildRows(items) {
  const rows = [];

  // Price is not a category attribute, but it is the row everyone reads first.
  // It is only ranked when every ad is quoted on the same basis: a monthly rent
  // and an outright sale price are not comparable numbers, and neither are a
  // tablet and a hatchback — "cheapest" across categories is a category
  // difference wearing a winner's badge.
  const periods = new Set(items.map((i) => i.pricePeriod || ""));
  const categories = new Set(items.map((i) => i.categorySlug));
  const priceComparable = periods.size === 1 && categories.size === 1;
  const priceCells = items.map((i) => ({
    present: true,
    display: `${i.priceLabel}${i.pricePeriod || ""}`,
    numeric: i.price,
  }));
  rows.push({
    key: "__price",
    label: "Price",
    rule: priceComparable ? { direction: "lower", note: "lowest price" } : null,
    cells: applyBest(priceCells, priceComparable ? { direction: "lower" } : null),
  });

  // Union of attribute keys, in the order they first appear.
  const keys = [];
  for (const item of items) {
    for (const key of Object.keys(item.attributes || {})) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  for (const key of keys) {
    const label =
      items.map((i) => getCategoryAttribute(i.categorySlug, key)).find(Boolean)?.label ||
      humanizeKey(key);

    const cells = items.map((item) => {
      const value = item.attributes?.[key];
      if (value === undefined || value === null || value === "") {
        return { present: false, display: "—", numeric: null };
      }
      const definition = getCategoryAttribute(item.categorySlug, key);
      return {
        present: true,
        display: formatAttributeValue(value, definition || { key }),
        numeric: typeof value === "number" ? value : null,
      };
    });

    const rule = BEST_RULES[key] || null;
    rows.push({ key, label, rule, cells: applyBest(cells, rule) });
  }

  return rows.map((row) => ({
    ...row,
    identical:
      row.cells.length > 1 &&
      row.cells.every((c) => c.present) &&
      new Set(row.cells.map((c) => c.display)).size === 1,
  }));
}

export default function CompareClient() {
  const { t } = useLocale();
  const hydrated = useCompareHydrated();
  const ids = useCompareStore((s) => s.ids);
  const removeCompare = useCompareStore((s) => s.removeCompare);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const [hideIdentical, setHideIdentical] = useState(false);

  const items = useMemo(() => ids.map((id) => getListingById(id)).filter(Boolean), [ids]);
  const rows = useMemo(() => (items.length ? buildRows(items) : []), [items]);

  const categories = useMemo(() => {
    const map = new Map();
    for (const item of items) map.set(item.categorySlug, item.categoryName);
    return [...map.values()];
  }, [items]);

  if (!hydrated) {
    return (
      <div className="bzr-section" aria-busy="true">
        <p className="text-sm text-(--muted-foreground)">Loading your comparison…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bzr-section">
        <EmptyState
          title={t("empty.compare.title")}
          message={t("empty.compare.message")}
          action={
            <Link href="/bazaar" className="bzr-btn">
              {t("empty.browse")}
            </Link>
          }
        />
      </div>
    );
  }

  const identicalCount = rows.filter((r) => r.identical).length;
  const visibleRows = hideIdentical ? rows.filter((r) => !r.identical) : rows;
  const crossCategory = categories.length > 1;

  return (
    <div className="bzr-section">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-(--muted-foreground)">
          Comparing {items.length} ad{items.length === 1 ? "" : "s"}
          {categories.length === 1 ? ` in ${categories[0]}` : ""}.
        </p>
        <button type="button" className="bzr-chip" onClick={clearCompare}>
          Clear comparison
        </button>
      </div>

      {items.length === 1 ? (
        <div className="mt-3">
          <Note icon={Info}>
            One ad is not a comparison. Add at least one more from{" "}
            <Link href="/bazaar" className="underline underline-offset-2">
              any listing page
            </Link>{" "}
            to see the differences.
          </Note>
        </div>
      ) : null}

      {crossCategory ? (
        <div className="mt-3">
          <Note icon={AlertTriangle}>
            You have picked ads from {categories.length} different categories (
            {categories.join(", ")}). Categories declare their own specs, so these ads share
            almost no attributes and most rows below will be blank. Comparing within one
            category is far more useful.
          </Note>
        </div>
      ) : null}

      {identicalCount > 0 ? (
        <div className="mt-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-(--foreground)">
            <input
              type="checkbox"
              checked={hideIdentical}
              onChange={(e) => setHideIdentical(e.target.checked)}
              className="h-4 w-4 accent-(--primary)"
            />
            Hide the {identicalCount} row{identicalCount === 1 ? "" : "s"} where every ad is
            the same
          </label>
        </div>
      ) : null}

      <p className="mt-3 flex items-start gap-2 text-xs text-(--muted-foreground)">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          A highlighted cell means only that the number is objectively better for a buyer —
          a lower price, fewer kilometres driven, a newer year, a longer warranty. Rows
          where &quot;better&quot; is a matter of taste (brand, colour, fuel, facing) are
          never marked, and a highlight is not a recommendation.
        </span>
      </p>

      {/* The table scrolls inside this container so the page body never
          scrolls sideways at 360px. */}
      <div className="mt-4 overflow-x-auto rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border)">
        {/* border-separate, not border-collapse: Chrome refuses to honour
            `position: sticky` on a cell inside a collapsed-border table, and the
            pinned first column is the whole reason this table is usable at
            360px. Every border below is declared on one side of one cell, so
            nothing doubles up without collapsing. */}
        <table className="w-full border-separate border-spacing-0 bg-(--card) text-start text-sm">
          <caption className="sr-only">
            Side-by-side comparison of {items.length} AltF Bazaar ads
          </caption>

          <thead>
            <tr>
              <th
                scope="col"
                className="sticky start-0 z-[1] w-32 min-w-32 border-b border-(--border) bg-(--card) px-3 py-3 align-bottom text-xs font-semibold tracking-wide text-(--muted-foreground) uppercase"
              >
                Spec
              </th>
              {items.map((item) => {
                const seller = getSeller(item.sellerId);
                const cover = item.images?.[0];
                return (
                  <th
                    key={item.id}
                    scope="col"
                    className="min-w-[11rem] border-b border-s border-(--border) px-3 py-3 align-top font-normal"
                  >
                    <div className="flex items-start justify-between gap-2">
                      {cover ? (
                        <ManagedImage
                          src={cover.src}
                          alt={cover.alt}
                          width={160}
                          height={120}
                          className="h-20 w-full max-w-[10rem] rounded-md object-cover"
                        />
                      ) : (
                        <span className="block h-20 w-full max-w-[10rem] rounded-md bg-(--muted)" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeCompare(item.id)}
                        aria-label={`Remove ${item.title} from the comparison`}
                        className="shrink-0 rounded-full border border-(--border) p-1 text-(--muted-foreground) hover:text-(--destructive) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <p className="mt-2 text-base font-extrabold tracking-tight text-(--bzr-price)">
                      {item.priceLabel}
                      {item.pricePeriod ? (
                        <span className="text-xs font-medium text-(--muted-foreground)">
                          {item.pricePeriod}
                        </span>
                      ) : null}
                    </p>

                    <Link
                      href={`/bazaar/item/${item.slug}`}
                      className="mt-1 block text-sm font-semibold text-(--foreground) underline-offset-2 hover:underline"
                    >
                      {item.title}
                    </Link>

                    <p className="mt-1 text-xs text-(--muted-foreground)">
                      {item.locality}, {item.cityName}
                    </p>
                    <p className="text-xs text-(--muted-foreground)">
                      {seller ? (
                        <Link
                          href={`/bazaar/seller/${seller.slug}`}
                          className="underline-offset-2 hover:underline"
                        >
                          {seller.name}
                          {seller.verified ? " · Verified" : ""}
                        </Link>
                      ) : (
                        "Seller unavailable"
                      )}
                    </p>
                    <p className="text-xs text-(--muted-foreground)">{item.categoryName}</p>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.key}
                className={row.identical ? "opacity-60" : undefined}
                data-identical={row.identical ? "true" : undefined}
              >
                <th
                  scope="row"
                  className="sticky start-0 z-[1] w-32 min-w-32 border-b border-(--border) bg-(--card) px-3 py-2.5 align-top text-xs font-semibold text-(--foreground)"
                >
                  {row.label}
                  {row.rule ? (
                    <span className="block text-[11px] font-normal text-(--muted-foreground)">
                      {DIRECTION_LABEL[row.rule.direction]}
                    </span>
                  ) : null}
                </th>

                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${items[index].id}`}
                    className={[
                      "border-b border-s border-(--border) px-3 py-2.5 align-top",
                      cell.best
                        ? "bg-(--primary)/12 font-semibold text-(--foreground)"
                        : cell.present
                          ? "text-(--foreground)"
                          : "text-(--muted-foreground)",
                    ].join(" ")}
                  >
                    {cell.display}
                    {cell.best ? (
                      <span className="ms-1.5 inline-block rounded-full border border-(--primary) px-1.5 text-[10px] font-bold text-(--primary) align-middle">
                        Best
                        <span className="sr-only">: {row.rule?.note}</span>
                      </span>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hideIdentical && visibleRows.length === 0 ? (
        <p className="mt-4 text-sm text-(--muted-foreground)">
          Every row is identical across these ads — untick the box above to see them.
        </p>
      ) : null}

      <p className="mt-6 text-sm text-(--muted-foreground)">
        Your comparison is kept in this browser only — it is not synced to an account.
      </p>
    </div>
  );
}
