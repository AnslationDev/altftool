"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Reveal, Kicker } from "../components/ui";
import { getAllCategories, getAllRankings, searchRankings, formatShortDate } from "../data/queries";
import { toCategory, toRanking } from "../router";

export function CatalogPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("popular");

  const categories = getAllCategories();
  const all = getAllRankings();

  const results = useMemo(() => {
    const found = searchRankings(query, activeCategory);
    const sorted = [...found];
    if (sort === "popular") sorted.sort((a, b) => b.popularity - a.popularity);
    if (sort === "recent")
      sorted.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [query, activeCategory, sort]);

  return (
    <div>
      <header className="pt-28 pb-12 md:pt-36 md:pb-16 paper-grain">
        <Container>
          <Reveal>
            <Kicker>The complete catalog</Kicker>
          </Reveal>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
            className="display mt-5 max-w-3xl text-[clamp(40px,7vw,92px)] font-light leading-[0.98] tracking-[-0.03em]"
          >
            Every ranking we publish.
          </motion.h1>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.65] text-ink-soft">
            {all.length} rankings across {categories.length} categories. Each one is
            re-verified at least annually, and every pick links to the full review.
          </p>
        </Container>
      </header>

      {/* Controls */}
      <div className="sticky top-16 z-30 border-y border-ink/15 bg-paper/85 backdrop-blur-xl">
        <Container className="flex flex-wrap items-center gap-4 py-4">
          <label className="relative flex min-w-[220px] flex-1 items-center">
            <svg
              className="pointer-events-none absolute left-3 text-ink-mute"
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rankings, brands, or products…"
              className="w-full rounded-full border border-ink/20 bg-paper py-2 pl-9 pr-4 text-[13px] placeholder:text-ink-mute/70 focus:border-ink focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-1 rounded-full border border-ink/20 p-1">
            {[
              { k: "popular", l: "Popular" },
              { k: "recent", l: "Recent" },
              { k: "az", l: "A–Z" },
            ].map((s) => (
              <button
                key={s.k}
                onClick={() => setSort(s.k)}
                className={`rounded-full px-3 py-1 text-[12px] transition ${
                  sort === s.k ? "bg-ink text-paper" : "text-ink-mute hover:text-ink"
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>

          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute num-tabular">
            {results.length} result{results.length === 1 ? "" : "s"}
          </div>
        </Container>

        <Container className="pb-4">
          <div className="flex flex-wrap gap-2" data-lenis-prevent>
            {["All", ...categories.map((c) => c.name)].map((name) => (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                  activeCategory === name
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 text-ink-soft hover:border-ink/50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Grid */}
      <section className="py-14 md:py-20">
        <Container>
          {results.length === 0 ? (
            <div className="py-24 text-center">
              <div className="display text-4xl font-light italic text-ink/30">
                Nothing matched.
              </div>
              <p className="mt-4 text-[14px] text-ink-soft">
                Try a broader search, or clear the category filter.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveCategory("All");
                }}
                className="mt-6 rounded-full bg-ink px-5 py-2.5 text-[13px] text-paper transition hover:bg-accent"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {results.map((r) => (
                  <motion.a
                    key={r.id}
                    href={toRanking(r.slug)}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                    className="group flex h-full flex-col overflow-hidden rounded-sm border border-ink/15 transition-colors hover:border-ink/40"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-paper-soft">
                      {r.products[0].image ? (
                        <img
                          src={r.products[0].image}
                          alt={r.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                            r.coverGradient || "from-ink to-ink-soft"
                          }`}
                        >
                          <span className="display text-6xl font-light italic text-paper/30">3</span>
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em]">
                        {r.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="display text-xl font-light leading-tight group-hover:text-accent">
                        {r.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-ink-soft">
                        {r.summary}
                      </p>
                      <div className="mt-4 space-y-1">
                        {r.products.map((p) => (
                          <div key={p.id} className="flex items-baseline gap-2 text-[12px]">
                            <span className="display italic text-accent">{p.rank}</span>
                            <span className="truncate text-ink">{p.name}</span>
                            <span className="ml-auto font-mono text-[10px] text-ink-mute num-tabular">
                              {p.score.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                        <span>{formatShortDate(r.updatedAt)}</span>
                        <span>{r.readingTime} min</span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Container>
      </section>

      {/* Category shortcuts */}
      <section className="border-t border-ink/15 bg-paper-soft py-14">
        <Container>
          <Kicker>Jump to a category</Kicker>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <a
                key={c.id}
                href={toCategory(c.slug)}
                className="group flex items-center justify-between rounded-sm border border-ink/15 bg-paper px-4 py-3 transition-colors hover:border-ink/40"
              >
                <span className="flex items-center gap-3">
                  <span className="display text-xl italic text-accent">{c.symbol}</span>
                  <span className="text-[14px] group-hover:text-accent">{c.name}</span>
                </span>
                <span className="font-mono text-[10px] text-ink-mute num-tabular">
                  {searchRankings("", c.name).length}
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
