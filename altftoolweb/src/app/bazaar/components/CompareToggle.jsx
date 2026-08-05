"use client";

/**
 * "Compare" control — self-contained, drop it anywhere a listing is in scope.
 *
 * Two constraints shaped this component:
 *
 * 1. **It sits on top of a stretched link.** `.bzr-card-title a::after` covers
 *    the whole card at `z-index: 1` so the card is clickable. Anything
 *    interactive inside the card has to be positioned and lifted above that,
 *    which is exactly what `.bzr-save` does with `z-index: 3`. The wrapper
 *    below repeats that trick with utilities, because `bazaar.css` is owned by
 *    someone else right now.
 * 2. **A full tray must not produce a dead click.** When four ads are already
 *    selected, the fifth click renders a stated reason instead of nothing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Scale } from "lucide-react";

import { COMPARE_LIMIT, useCompareHydrated, useCompareStore } from "../hooks/useCompareStore";
import { useLocale } from "../i18n/useLocale";

const NOTICE_MS = 4000;

export default function CompareToggle({ listing, className = "" }) {
  const { t } = useLocale();
  const hydrated = useCompareHydrated();
  const ids = useCompareStore((s) => s.ids);
  const toggleCompare = useCompareStore((s) => s.toggleCompare);

  const [notice, setNotice] = useState("");
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const flash = useCallback((message) => {
    setNotice(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    // A reason that never goes away turns into permanent card furniture.
    timerRef.current = setTimeout(() => setNotice(""), NOTICE_MS);
  }, []);

  const id = listing?.id;
  const title = listing?.title || "this ad";

  // Before hydration the tray contents are unknown, so render the neutral
  // (unselected) state — otherwise server HTML and first client render differ.
  const selected = hydrated && !!id && ids.includes(id);
  const full = hydrated && ids.length >= COMPARE_LIMIT && !selected;

  function handleClick() {
    const result = toggleCompare(id);
    if (!result.ok) {
      flash(result.reason || "Could not add this ad to compare.");
      return;
    }
    setNotice("");
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    // z-[3] clears the card's stretched-link overlay (z-index: 1), the same
    // way .bzr-save does.
    <div className={`relative z-[3] flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={selected}
        aria-label={t(selected ? "compare.remove" : "compare.add", { title })}
        title={full ? t("compare.full", { limit: COMPARE_LIMIT }) : undefined}
        className={[
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
          "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)",
          selected
            ? "border-(--primary) bg-(--primary)/12 text-(--primary)"
            : full
              ? "border-(--border) text-(--muted-foreground) opacity-70"
              : "border-(--border) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)",
        ].join(" ")}
      >
        {selected ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Scale className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span>{selected ? t("compare.inCompare") : t("item.compare")}</span>
      </button>

      {notice ? (
        <span role="status" className="text-[11px] leading-tight text-(--destructive)">
          {notice}
        </span>
      ) : null}
    </div>
  );
}
