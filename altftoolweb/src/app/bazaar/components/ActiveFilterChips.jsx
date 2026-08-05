"use client";

import { X } from "lucide-react";

import { useLocale } from "../i18n/useLocale";

/**
 * One removable chip per active filter *value*, plus "Clear all".
 *
 * Each chip carries the exact param patch that removes it, so removing a chip
 * is a URL edit and not a state edit — which keeps the chip row and the results
 * honest about each other. Three shapes of patch show up here:
 *
 *   `{ city: null }`                      drop a single-valued filter
 *   `{ city: null, locality: null }`      drop a filter plus the one that only
 *                                         means anything inside it
 *   `{ brand: "Hyundai,Tata" }`           drop *one value* of a multi-select by
 *                                         re-serialising the ones that remain
 *
 * That third shape is why the row is built per value rather than per key: with
 * "Brand: Mahindra", "Brand: Tata" and "Brand: Hyundai" as separate chips, a
 * buyer who has gone cold on Tata removes Tata. A single combined chip would
 * make the only available action "throw away all three brands".
 *
 * The caller (`buildChips` in BrowseView) owns the labels and the patches; this
 * component owns nothing but the rendering, so the chip row cannot disagree with
 * the matcher about what is active.
 */
export default function ActiveFilterChips({ chips = [], onRemove, onClearAll }) {
  const { t } = useLocale();
  if (chips.length === 0) return null;

  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t("filter.activeAria", { count: chips.length })}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className="bzr-chip"
          onClick={() => onRemove(chip.patch)}
          aria-label={t("filter.remove", { label: chip.label })}
        >
          <span className="max-w-[16rem] truncate">{chip.label}</span>
          <X className="h-3 w-3 opacity-70" aria-hidden="true" />
        </button>
      ))}

      {/* `--primary-text`, not `--primary`. Measured light theme, 12px/600:
          --primary rgb(13,148,136) gives 3.53:1 on the page background and
          3.41:1 on the `--bzr-shell` strip this row sits in, against the 4.5:1
          WCAG 1.4.3 needs. `--primary-text` rgb(15,118,110) measures 5.15:1.
          It is the same token `.bzr-section-link` already uses, and in dark
          theme it resolves to `--primary` (10.45:1), so nothing changes there. */}
      <button
        type="button"
        className="text-xs font-semibold text-(--primary-text) underline underline-offset-2"
        onClick={onClearAll}
      >
        {t("filter.clearAll")}
      </button>
    </div>
  );
}
