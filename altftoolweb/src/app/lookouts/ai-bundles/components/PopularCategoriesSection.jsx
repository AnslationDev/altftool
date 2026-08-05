"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Heart, SearchX, X } from "lucide-react";
import { TOOL_CATEGORIES, searchTools } from "../data/tools";
import { useEngagement } from "../providers/EngagementProvider";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ToolCard from "./ToolCard";
import ToolLogo from "./ToolLogo";

const PRICING_FILTERS = [
  { id: "all", label: "All pricing" },
  { id: "FREE", label: "Free" },
  { id: "FREE + PAID", label: "Free + Paid" },
  { id: "PAID", label: "Paid" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Most popular" },
  { id: "rating", label: "Highest rated" },
  { id: "name", label: "Name (A–Z)" },
];

function CategoryCard({ category, isActive, onSelect }) {
  const Icon = category.icon;
  const preview = category.tools.slice(0, 3);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={`aib-card group flex flex-col items-start gap-3 rounded-2xl p-4 text-left ${
        isActive ? "ring-2 ring-teal-500/60" : ""
      }`}
    >
      <span
        className="aib-tile flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
        style={{ "--aib-tile-a": `${category.hue[0]}1a`, "--aib-tile-b": `${category.hue[1]}0f` }}
      >
        <Icon className="h-5 w-5" style={{ color: category.hue[0] }} aria-hidden="true" />
      </span>
      <span className="text-sm font-bold leading-tight text-slate-900">{category.label}</span>
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex -space-x-2">
          {preview.map((tool) => (
            <span key={tool.domain} className="rounded-full ring-2 ring-white">
              <ToolLogo name={tool.name} domain={tool.domain} hue={category.hue} size={22} />
            </span>
          ))}
        </div>
        <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
          {category.tools.length} tools
        </span>
      </div>
    </motion.button>
  );
}

/** Section 3 — interactive category grid + filterable results explorer. */
export default function PopularCategoriesSection({ activeId, onSelectCategory, query, onClearQuery, sectionRef }) {
  const { favorites } = useEngagement();
  const [pricingFilter, setPricingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const searchMode = query.trim().length >= 2;
  const activeCategory = TOOL_CATEGORIES.find((category) => category.id === activeId) || TOOL_CATEGORIES[0];

  const baseTools = useMemo(() => {
    if (favoritesOnly) return favorites;
    if (searchMode) return searchTools(query);
    return activeCategory.tools.map((item) => ({
      ...item,
      categoryId: activeCategory.id,
      categoryLabel: activeCategory.label,
      hue: activeCategory.hue,
    }));
  }, [favoritesOnly, favorites, searchMode, query, activeCategory]);

  const visibleTools = useMemo(() => {
    let list = baseTools;
    if (pricingFilter !== "all") list = list.filter((item) => item.pricing === pricingFilter);

    list = [...list];
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating);

    return list;
  }, [baseTools, pricingFilter, sortBy]);

  const selectCategory = (id) => {
    setFavoritesOnly(false);
    if (id === activeId && !searchMode) return;
    if (searchMode) onClearQuery();
    onSelectCategory(id);
  };

  const heading = favoritesOnly
    ? `${visibleTools.length} favorite${visibleTools.length === 1 ? "" : "s"}`
    : searchMode
      ? `${visibleTools.length} result${visibleTools.length === 1 ? "" : "s"} for "${query.trim()}"`
      : activeCategory.label;

  return (
    <section ref={sectionRef} id="explore" aria-label="Browse AI tools by category" className="relative scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="AI tool library"
            title="Popular categories"
            subtitle={`${TOOL_CATEGORIES.length} curated categories — pick one below, search from the top, or filter by pricing and favorites.`}
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          {TOOL_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} isActive={!searchMode && !favoritesOnly && category.id === activeId} onSelect={selectCategory} />
          ))}
        </Reveal>

        <div className="aib-glass sticky top-20 z-20 mt-10 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex flex-wrap gap-1.5">
            {PRICING_FILTERS.map((filter) => (
              <motion.button
                key={filter.id}
                type="button"
                onClick={() => setPricingFilter(filter.id)}
                whileTap={{ scale: 0.92 }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  pricingFilter === filter.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:text-slate-900"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>

          <span className="h-6 w-px bg-slate-200" aria-hidden="true" />

          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort tools"
              className="appearance-none rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-7 text-xs font-semibold text-slate-600 transition-colors hover:border-teal-300"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          </div>

          <motion.button
            type="button"
            onClick={() => setFavoritesOnly((prev) => !prev)}
            aria-pressed={favoritesOnly}
            whileTap={{ scale: 0.94 }}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              favoritesOnly ? "bg-rose-500 text-white" : "bg-white text-slate-600 hover:text-rose-500"
            }`}
          >
            <Heart className="h-3.5 w-3.5" fill={favoritesOnly ? "currentColor" : "none"} aria-hidden="true" />
            Favorites ({favorites.length})
          </motion.button>
        </div>

        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{heading}</h3>
              {!searchMode && !favoritesOnly ? <p className="mt-0.5 text-sm text-slate-500">{activeCategory.blurb}</p> : null}
            </div>
            {searchMode ? (
              <motion.button
                type="button"
                onClick={onClearQuery}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear search
              </motion.button>
            ) : null}
          </div>

          {visibleTools.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="aib-glass flex flex-col items-center rounded-3xl px-6 py-16 text-center">
              <SearchX className="h-10 w-10 text-slate-400" aria-hidden="true" />
              <p className="mt-4 text-lg font-bold text-slate-900">{favoritesOnly ? "No favorites yet" : "No tools found"}</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {favoritesOnly
                  ? "Tap the heart on any tool card to save it here for quick access."
                  : `Nothing matches "${query.trim()}". Try a broader term like "image", "voice", or "writing".`}
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTools.map((item) => (
                <ToolCard key={`${item.categoryId ?? "fav"}-${item.name}-${item.domain}`} tool={item} showCategory={searchMode || favoritesOnly} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
