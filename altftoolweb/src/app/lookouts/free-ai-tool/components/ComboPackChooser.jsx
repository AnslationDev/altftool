"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { COMBO_FILTERS } from "../data/comboPacks";
import useHorizontalScroll from "../hooks/useHorizontalScroll";

/** Single-row, auto-scrolling "choose your path" strip — filter chips above, one scrollable line of pack cards below. */
export default function ComboPackChooser({ packs, activeId, onSelect, activeFilter, onFilterChange }) {
  const { trackRef, atStart, atEnd, scrollByAmount, recompute } = useHorizontalScroll();

  useEffect(() => {
    recompute();
  }, [packs, recompute]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="fat-no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {COMBO_FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                aria-pressed={isActive}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "border-violet-300 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-500 hover:text-slate-800"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={atStart}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-violet-300 hover:text-violet-600 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={atEnd}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-violet-300 hover:text-violet-600 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {packs.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No combo packs match this filter.</p>
      ) : (
        <div ref={trackRef} className="fat-no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
          {packs.map((pack) => {
            const Icon = pack.icon;
            const isActive = pack.id === activeId;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => onSelect(pack.id)}
                aria-current={isActive ? "true" : undefined}
                className="fat-card group relative flex w-64 shrink-0 snap-start flex-col gap-3 rounded-2xl p-5 text-left"
              >
                {isActive ? (
                  <motion.span
                    layoutId="fat-active-combo"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="pointer-events-none absolute inset-0 rounded-2xl border-2"
                    style={{
                      borderColor: `${pack.hue[0]}80`,
                      backgroundImage: `linear-gradient(120deg, ${pack.hue[0]}14, ${pack.hue[1]}0a)`,
                    }}
                    aria-hidden="true"
                  />
                ) : null}

                <div className="relative flex items-center justify-between">
                  <span
                    className="fat-tile flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ "--fat-tile-a": `${pack.hue[0]}22`, "--fat-tile-b": `${pack.hue[1]}14` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: pack.hue[0] }} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                    {pack.steps.length} steps
                  </span>
                </div>
                <div className="relative">
                  <h3 className="text-base font-bold text-slate-900">{pack.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{pack.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
