"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Cpu,
  Bot,
  Building2,
  CircleDollarSign,
  GraduationCap,
  Clapperboard,
  Music,
  BookOpen,
  Landmark,
  UtensilsCrossed,
  Sparkles,
  Car,
  TrendingUp,
  Rocket,
  Shirt,
  ArrowUpRight,
  Search,
  X,
  SearchX,
  Flame,
  ArrowDownAZ,
} from "lucide-react";
import { Reveal, EASE } from "./motion";

// Icon registry for categories. Any NEW category added to
// data/categories.js whose `icon` name isn't registered here simply falls
// back to Sparkles — nothing breaks. To give it its own icon, import the
// lucide icon above and add it to this map.
const ICONS = {
  Cpu,
  Bot,
  Building2,
  CircleDollarSign,
  GraduationCap,
  Clapperboard,
  Music,
  BookOpen,
  Landmark,
  UtensilsCrossed,
  Sparkles,
  Car,
  TrendingUp,
  Rocket,
  Shirt,
};

const SORTS = [
  { key: "popular", label: "Popular", icon: Flame },
  { key: "az", label: "A–Z", icon: ArrowDownAZ },
];

/**
 * Premium, self-serve directory: type-to-filter search and Popular/A–Z
 * sorting mean nobody has to scroll a long grid to find their field — and
 * the section keeps working unchanged as more categories are added to
 * data/categories.js. Cards keep the 3D-tilt / glow / shine treatment.
 */
function CategoryCard({ category, index, dimmed, onHover }) {
  const Icon = ICONS[category.icon] || Sparkles;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 180, damping: 18 });
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 180, damping: 18 });

  const onMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const onMouseLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: dimmed ? 0.45 : 1,
        y: 0,
        scale: dimmed ? 0.97 : 1,
        filter: dimmed ? "saturate(0.6)" : "saturate(1)",
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.22, ease: EASE } }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.04, 0.4), ease: EASE }}
      onMouseEnter={() => onHover(category.slug)}
      style={{ perspective: 800 }}
      className="h-full"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="h-full"
      >
        <Link
          href={`/top5/category/${category.slug}`}
          className="group relative flex h-full flex-col items-start justify-between gap-7 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-6 sm:px-6 sm:py-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-lg"
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-500 ease-out group-hover:scale-x-100"
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-on-media/70 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:left-[120%] group-hover:opacity-100"
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-4 -right-1 select-none text-[64px] font-black leading-none tracking-tighter text-primary-text/[0.13] transition-all duration-500 group-hover:-translate-y-2 group-hover:text-primary-text/40"
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-footer text-on-media opacity-0 -translate-y-1.5 translate-x-1.5 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 group-hover:scale-100">
            <ArrowUpRight size={13} />
          </span>

          <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-soft text-muted-foreground ring-1 ring-border transition-all duration-400 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-hover group-hover:text-primary-foreground group-hover:ring-transparent group-hover:shadow-lg">
            <Icon size={21} className="transition-transform duration-400 group-hover:scale-110" />
          </span>

          <span className="relative z-10 w-full">
            <span className="block font-bold text-foreground">{category.name}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              {category.publishedCount > 0
                ? `${category.publishedCount} published ranking${category.publishedCount === 1 ? "" : "s"}`
                : "Coverage in progress"}
            </span>
            <span className="block max-h-0 overflow-hidden opacity-0 transition-all duration-400 ease-out group-hover:max-h-8 group-hover:opacity-100">
              <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary-text">
                EXPLORE
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </span>
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function CategoriesDirectory({ categories, initialQuery = "" }) {
  const [hoveredSlug, setHoveredSlug] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("popular");

  const visible = useMemo(() => {
    let list = [...categories];
    if (sort === "popular") {
      list.sort(
        (a, b) =>
          b.publishedCount - a.publishedCount || a.name.localeCompare(b.name),
      );
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((category) => category.name.toLowerCase().includes(q));
    return list;
  }, [categories, query, sort]);

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 scroll-mt-20">
      <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Categories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            Showing {visible.length} of {categories.length} fields
          </p>
        </div>

        {/* Finder controls: type-to-filter + sort, so nobody scrolls. */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-4 pr-1.5 shadow-sm transition-shadow focus-within:border-border-strong focus-within:shadow-md sm:w-[280px]">
            <Search size={15} className="shrink-0 text-primary-text" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a field…"
              aria-label="Search Top5 categories"
              className="w-full min-w-0 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <AnimatePresence>
              {query ? (
                <motion.button
                  key="clear"
                  type="button"
                  aria-label="Clear search"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.16 }}
                  onClick={() => setQuery("")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground"
                >
                  <X size={13} />
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-sm w-fit">
            {SORTS.map((option) => {
              const OptionIcon = option.icon;
              const active = sort === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSort(option.key)}
                  aria-pressed={active}
                  className={`relative flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "text-on-media" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="top5-cat-sort-pill"
                      transition={{ duration: 0.3, ease: EASE }}
                      className="absolute inset-0 rounded-full bg-footer"
                    />
                  ) : null}
                  <OptionIcon size={13} className="relative z-10" />
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      <motion.div
        layout
        onMouseLeave={() => setHoveredSlug(null)}
        className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((category, index) => (
            <CategoryCard
              key={category.slug}
              category={category}
              index={index}
              dimmed={hoveredSlug !== null && hoveredSlug !== category.slug}
              onHover={setHoveredSlug}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-page px-6 py-14 text-center"
          >
            <SearchX size={26} className="text-muted-foreground" />
            <p className="mt-3 font-semibold text-foreground">
              No field matches &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a shorter keyword — e.g. &ldquo;tech&rdquo; or &ldquo;fin&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-5 min-h-11 rounded-full bg-footer px-5 py-2.5 text-sm font-semibold text-on-media transition-transform hover:scale-[1.03] active:scale-95"
            >
              Clear search
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
