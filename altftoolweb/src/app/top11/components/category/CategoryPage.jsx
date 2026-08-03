"use client";

import { ArrowRight, ChevronDown, Compass, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { rankings } from "../../data/mock-data";
import FilterButton from "../ui/FilterButton";
import TrendingCard from "../TrendingCard";
import { useTop11Search } from "../SearchContext";

const FILTERS = ["Trending", "Latest", "Most viewed", "Most saved"];

export default function CategoryPage({ title, count }) {
  const { openSearch } = useTop11Search();
  const [filter, setFilter] = useState("Trending");

  return (
    <main className="pb-24">
      {/* ─── Hero ─── */}
      <section className="border-b border-slate-200 bg-[#f3f6fb] px-5 py-20 md:px-10 md:py-28 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            <Compass className="h-4 w-4" /> Top11 category index
          </p>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-slate-950 md:text-8xl">
                The best of {title.toLowerCase()}.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Independent rankings for the products, people, companies, and ideas moving this field forward.
              </p>
            </div>
            <button
              type="button"
              onClick={openSearch}
              className="flex min-h-16 items-center gap-3 rounded-2xl bg-white px-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-400"
            >
              <Search className="h-5 w-5 text-blue-600" />
              <span className="flex-1 text-sm text-slate-400">Search within {title}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-14 flex items-center gap-8 border-t border-slate-300 pt-6 text-sm">
            <span>
              <strong className="text-slate-950">{count}</strong> rankings
            </span>
            <span className="text-slate-500">Updated daily</span>
            <span className="hidden text-slate-500 sm:inline">Global coverage</span>
          </div>
        </div>
      </section>

      {/* ─── Filters + Grid ─── */}
      <section className="px-5 py-12 md:px-10 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          {/* Filter bar. `top-0` rather than `top-20`: AltFTool's global header
              is hidden for this section, so the only sticky element above is
              Top11's own header, which is not sticky on this route. */}
          <div className="sticky top-0 z-30 -mx-5 mb-14 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10 xl:-mx-16 xl:px-16">
            <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 overflow-auto [scrollbar-width:none]">
              <div className="flex gap-2">
                {FILTERS.map((item) => (
                  <FilterButton key={item} active={filter === item} onClick={() => setFilter(item)}>
                    {item}
                  </FilterButton>
                ))}
              </div>
              <span className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold">
                <span className="text-slate-400">Topic:</span> All topics
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">{filter} rankings</h2>
            <span className="text-sm text-slate-400">Showing {rankings.length} rankings</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {rankings.map((ranking, index) => (
                <TrendingCard key={ranking.slug} ranking={ranking} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
