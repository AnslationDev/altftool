"use client";

import { ArrowUpRight, Compass, Globe2, Search, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchItems } from "../../data/mock-data";
import { useTop11Search } from "../SearchContext";

const TYPE_ICONS = {
  ranking: TrendingUp,
  country: Globe2,
  category: Compass,
};

function hrefFor(item) {
  return item.type === "ranking"
    ? `/top11/item/${item.slug}`
    : `/top11/category/${item.slug}`;
}

/**
 * The dialog body. Mounted only while the palette is open (see SearchDialog
 * below), so each open starts with a fresh query and selection — no effect
 * resetting state, which would cascade an extra render every time.
 */
function SearchPanel({ close }) {
  const { open } = useTop11Search();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return searchItems.slice(0, 6);
    const needle = query.toLowerCase();
    return searchItems
      .filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(needle))
      .slice(0, 7);
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const listener = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [close]);

  const select = (index) => {
    const item = results[index];
    if (!item) return;
    close();
    router.push(hrefFor(item));
  };

  return (
    <motion.div
      // Closes instantly rather than fading out. Selecting a result closes the
      // palette and pushes a route in the same tick; with an exit animation the
      // router transition orphans it, leaving this full-screen scrim mounted at
      // opacity 0 — invisible, but still swallowing every click and still
      // announcing an open dialog to screen readers. The entrance animation is
      // what's actually seen, and it is untouched. `pointer-events-none` is a
      // second guard in case anything ever delays the unmount.
      className={`fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/55 px-3 pt-[8vh] backdrop-blur-sm ${open ? "" : "pointer-events-none"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={close}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search Top11"
        initial={{ opacity: 0, y: -20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl"
      >
        {/* Search input */}
        <div className="flex items-center gap-4 border-b border-slate-200 px-5">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, results.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              }
              if (event.key === "Enter") select(active);
            }}
            placeholder="Search anything..."
            aria-label="Search rankings, categories, and countries"
            className="min-w-0 flex-1 bg-transparent py-5 text-lg font-medium text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="p-2">
          <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {query ? "Best matches" : "Popular searches"}
          </p>
          {results.length ? (
            results.map((item, index) => {
              const Icon = TYPE_ICONS[item.type] || Compass;
              return (
                <button
                  key={`${item.type}-${item.slug}`}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => select(index)}
                  className={`flex min-h-16 w-full items-center gap-3 rounded-xl px-3 text-left transition ${active === index ? "bg-blue-50" : "hover:bg-slate-50"}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${active === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{item.meta}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </button>
              );
            })
          ) : (
            <div className="px-5 py-14 text-center">
              <Search className="mx-auto mb-4 h-7 w-7 text-slate-300" />
              <p className="font-semibold text-slate-900">No ranking found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a broader topic, place, or category.
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-medium text-slate-400">
          <span>Search the Top11 index</span>
          <span>Use arrows to navigate</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Command-palette search over the section's rankings, categories and countries.
 * Selecting a result routes through the Next router, so the URL is real and
 * shareable. Open state comes from the section-wide SearchContext.
 */
export default function SearchDialog() {
  const { open, closeSearch } = useTop11Search();

  // No AnimatePresence: without an exit animation there is nothing to wait for,
  // so the palette unmounts synchronously the moment it closes.
  return open ? <SearchPanel close={closeSearch} /> : null;
}
