"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontally scrollable category filter chips with left/right arrow controls,
 * mirroring Toolify's Seedream filter row.
 */
export default function CategoryChips({ categories = [], active, onChange }) {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    // Recompute when the scroller's own size changes (grid hydration, scrollbar
    // appearing) — these don't fire window 'resize'.
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateArrows())
        : null;
    ro?.observe(el);
    // Re-measure once the web font swaps in and chip widths settle.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(updateArrows).catch(() => {});
    }
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      ro?.disconnect();
    };
  }, [updateArrows, categories.length]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(220, el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-2">
      <div
        ref={scrollerRef}
        className="sd-no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-1"
      >
        <style>{`.sd-no-scrollbar::-webkit-scrollbar{display:none;}.sd-no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
        <Chip label="All" active={active === "all"} onClick={() => onChange("all")} />
        {categories.map((cat) => (
          <Chip
            key={cat.slug}
            label={cat.name}
            active={active === cat.slug}
            onClick={() => onChange(cat.slug)}
          />
        ))}
      </div>

      {/* Arrows */}
      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        <ArrowBtn
          direction="left"
          disabled={!canLeft}
          onClick={() => scrollBy(-1)}
        />
        <ArrowBtn
          direction="right"
          disabled={!canRight}
          onClick={() => scrollBy(1)}
        />
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "border-(--color-primary) bg-(--color-primary) text-(--color-primary-foreground)"
          : "border-(--color-border) bg-(--color-card) text-(--color-foreground) hover:border-(--color-primary) hover:text-(--color-primary)"
      }`}
    >
      {label}
    </button>
  );
}

function ArrowBtn({ direction, disabled, onClick }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Scroll categories left" : "Scroll categories right"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-card) text-(--color-foreground) transition-all hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--color-border) disabled:hover:text-(--color-foreground)"
    >
      <Icon size={16} />
    </button>
  );
}
