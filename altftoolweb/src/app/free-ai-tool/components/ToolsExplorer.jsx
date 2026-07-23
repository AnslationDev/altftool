"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, SearchX, SlidersHorizontal, X } from "lucide-react";
import { TOOL_CATEGORIES, searchTools } from "../data/tools";
import CategorySidebar from "./CategorySidebar";
import MobileCategoryDrawer from "./MobileCategoryDrawer";
import SectionHeading from "./SectionHeading";
import SkeletonCard from "./SkeletonCard";
import ToolCard from "./ToolCard";

const SKELETON_MS = 380;

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function ToolsExplorer({ activeId, onSelectCategory, query, onClearQuery, sectionRef }) {
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mountedRef = useRef(false);
  const resultsPanelRef = useRef(null);
  const [sidebarHeight, setSidebarHeight] = useState(null);

  const searchMode = query.trim().length >= 2;
  const activeCategory = TOOL_CATEGORIES.find((category) => category.id === activeId);

  // Keep the desktop sidebar's height locked to the results column next to
  // it — CSS grid stretch doesn't reliably size a `position: sticky` item
  // against its sibling, so this measures the real thing instead.
  useEffect(() => {
    const panel = resultsPanelRef.current;
    if (!panel || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height) setSidebarHeight(height);
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const selectCategory = (id) => {
    if (id === activeId && !searchMode) return;
    if (searchMode) onClearQuery();
    onSelectCategory(id);
  };

  // Brief skeleton pass whenever the active category changes — whether from
  // this component's own sidebar/drawer or an external trigger (the quick
  // category grid up in the hero section) — keeps the grid change readable.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setLoading(true);
  }, [activeId]);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = setTimeout(() => setLoading(false), SKELETON_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  const visibleTools = useMemo(() => {
    if (searchMode) return searchTools(query);
    return activeCategory.tools.map((item) => ({
      ...item,
      categoryId: activeCategory.id,
      categoryLabel: activeCategory.label,
      hue: activeCategory.hue,
    }));
  }, [searchMode, query, activeCategory]);

  const gridKey = searchMode ? `search:${query.trim().toLowerCase()}` : activeId;
  const ActiveIcon = activeCategory.icon;

  return (
    <section
      ref={sectionRef}
      id="explore"
      aria-label="Browse free AI tools by category"
      className="relative scroll-mt-24 px-4 pb-24 pt-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="AI tool library"
          title="Browse by category"
          subtitle={`${TOOL_CATEGORIES.length} curated categories, every tool free to try. Pick a lane on the left or search from the hero.`}
        />

        {/* Mobile category trigger */}
        <div className="sticky top-20 z-30 mt-8 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="fat-glass flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-lg shadow-slate-300/40"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundImage: `linear-gradient(135deg, ${activeCategory.hue[0]}22, ${activeCategory.hue[1]}14)`,
              }}
            >
              <ActiveIcon className="h-4 w-4" style={{ color: activeCategory.hue[0] }} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Category
              </span>
              <span className="block truncate text-sm font-bold text-slate-900">
                {searchMode ? "Search results" : activeCategory.label}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Change
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start lg:gap-8">
          {/* Desktop sidebar — height is locked to the measured results
              column height, with the category list scrolling inside rather
              than the sidebar growing taller or shorter than what's next to it. */}
          <div
            className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)]"
            style={sidebarHeight ? { height: `${sidebarHeight}px` } : undefined}
          >
            <CategorySidebar activeId={activeId} onSelect={selectCategory} muted={searchMode} />
          </div>

          {/* Results panel */}
          <div ref={resultsPanelRef} className="mt-6 lg:mt-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              {searchMode ? (
                <>
                  <h3 className="text-lg font-bold text-slate-900">
                    {visibleTools.length} result{visibleTools.length === 1 ? "" : "s"} for
                    <span className="fat-gradient-text"> “{query.trim()}”</span>
                  </h3>
                  <button
                    type="button"
                    onClick={onClearQuery}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:text-slate-900"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{activeCategory.label}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{activeCategory.blurb}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
                    {visibleTools.length} free tools
                  </span>
                </>
              )}
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : visibleTools.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="fat-glass flex flex-col items-center rounded-3xl px-6 py-16 text-center"
              >
                <SearchX className="h-10 w-10 text-slate-400" aria-hidden="true" />
                <p className="mt-4 text-lg font-bold text-slate-900">No tools found</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Nothing matches “{query.trim()}”. Try a broader term like “image”, “voice”, or
                  “writing”.
                </p>
                <button
                  type="button"
                  onClick={onClearQuery}
                  className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Browse all categories
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={gridKey}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {visibleTools.map((item) => (
                  <motion.div key={`${item.categoryId ?? "search"}-${item.name}-${item.domain}`} variants={cardVariants}>
                    <ToolCard tool={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <p className="mt-10 text-center text-sm text-slate-400">
              Every listing is free to use or offers a generous free tier — no credit card needed to
              start.
            </p>
          </div>
        </div>
      </div>

      <MobileCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeId={activeId}
        onSelect={selectCategory}
      />
    </section>
  );
}
