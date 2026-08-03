"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Flame, Compass } from "lucide-react";
import {
  Bitcoin,
  BookOpen,
  Bot,
  Cat as CatIcon,
  ChefHat,
  Dog as DogIcon,
  Globe2,
  Martini,
  Music4,
  MoreHorizontal,
  Plane,
  Tv,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import HeroCardCarousel from "./HeroCardCarousel";
import { CATEGORY_STRIP, POPULAR_SEARCHES, POPULAR_SEARCH_CATEGORY } from "../data/top10Data";
import { HERO_CARDS } from "../data/heroCarouselData";

// Only the icons CATEGORY_STRIP actually names. A chip with an icon that
// is not in this map still renders, falling back to MoreHorizontal.
const ICONS = {
  BookOpen,
  Music4,
  Bot,
  Plane,
  Tv,
  UtensilsCrossed,
  ChefHat,
  Martini,
  Bitcoin,
  Dog: DogIcon,
  Cat: CatIcon,
  Globe2,
  Zap,
  Users,
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export default function Hero({ onCategorySelect = () => {}, onSearchSubmit = () => {} }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const activeCard = HERO_CARDS[activeIndex] || HERO_CARDS[0];

  const submitSearch = (value) => {
    const trimmed = value.trim().slice(0, 120);
    if (!trimmed) return;
    onSearchSubmit(trimmed);
    setQuery("");
  };

  return (
    <section className="section relative overflow-hidden">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-8">
        {/* LEFT — headline, search, chips */}
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="min-w-0 text-center lg:col-span-2 lg:text-left"
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 text-xs font-bold tracking-widest text-(--primary-text) font-secondary uppercase"
          >
            Discover. Compare. Rank.
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-primary text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl"
          >
            {/* Static first line, so the one h1 on /top10 always carries
                the page's actual subject in server-rendered HTML — the
                second line rotates with the carousel on the client. */}
            <span className="block text-(--foreground)">The World&rsquo;s Top 10</span>
            <span className="block">
              <motion.span
                key={activeCard.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                className="inline-block overflow-visible pr-2 font-display underline decoration-2 underline-offset-8"
                style={{
                  backgroundImage: "var(--anslation-ds-cta-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {activeCard.productName}
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            key={activeCard.id + "-sub"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : 0.05 }}
            className="mx-auto max-w-xl text-base text-(--muted-foreground) font-secondary"
          >
            {activeCard.subheading}
          </motion.p>

          {activeCard.tagline && (
            <motion.p
              key={activeCard.id + "-tagline"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : 0.05 }}
              className="mx-auto max-w-xl text-lg text-(--muted-foreground) font-secondary italic lg:mx-0"
            >
              {activeCard.tagline}
            </motion.p>
          )}

          {/* Thin gradient "ring" instead of a flat border — a 1px padded
              wrapper painted with the site's own primary→secondary
              gradient, plus a small, constant two-tone gradient shadow
              (sm-sized, not a big glow) — no separate hover/focus border
              or shadow growth, just the one subtle shadow at all times. */}
          <motion.form
            variants={fadeUp}
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
            className="relative mx-auto mt-8 max-w-xl rounded-full bg-gradient-to-r from-(--primary) via-(--secondary) to-(--primary) p-px shadow-sm focus-within:shadow-[var(--anslation-ds-focus-ring)] lg:mx-0"
          >
            <div className="flex items-center gap-2 rounded-full bg-(--card) p-1.5">
              <Search className="ml-3 h-4 w-4 shrink-0 text-(--muted-foreground)" />
              <label htmlFor="top10-search" className="sr-only">
                Search Top 10 lists
              </label>
              <input
                id="top10-search"
                name="top10-search"
                type="search"
                maxLength={120}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={activeCard.searchPlaceholder}
                aria-label="Search Top 10 lists"
                className="top10-hero-search-input w-full py-2 text-xs font-secondary outline-none placeholder:text-(--muted-foreground)"
              />
              <motion.button
                type="submit"
                className="flex h-11 w-11 shrink-0 animate-pulse items-center justify-center rounded-full bg-(--primary) text-(--primary-foreground) transition-colors hover:bg-(--primary-hover) motion-reduce:animate-none cursor-pointer focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.form>

          <motion.div
            variants={fadeUp}
            className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-secondary lg:justify-start"
          >
            <span className="inline-flex items-center gap-1 font-semibold text-(--primary-text)">
              <Flame className="h-3.5 w-3.5" />
              Popular:
            </span>
            {POPULAR_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  // A "Popular:" tag names a real category — jump straight
                  // there (same as a Browse Categories chip) instead of
                  // running it through the generic search, whose live
                  // search APIs often don't match a phrase like "Best AI
                  // Tools" verbatim and would surface the wrong category.
                  const categoryId = POPULAR_SEARCH_CATEGORY[tag];
                  if (categoryId) {
                    onCategorySelect(categoryId);
                    return;
                  }
                  setQuery(tag);
                  submitSearch(tag);
                }}
                className="min-h-11 rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-(--foreground) transition-colors hover:border-(--primary)/40 hover:text-(--primary-text) cursor-pointer focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — floating 3D card carousel */}
        <div className="relative lg:col-span-3">
          <HeroCardCarousel cards={HERO_CARDS} onActiveChange={setActiveIndex} />
        </div>
      </div>

      {/* Category strip — its own full-width, keyboard-scrollable row below
          both columns. It stays still so every control remains reachable. */}
      <motion.div variants={fadeUp} className="mt-8 border-t border-(--border) pt-5">
        <span className="mb-3 flex items-center justify-center gap-1.5 text-lg font-semibold text-(--primary-text) font-secondary uppercase tracking-wide lg:justify-start">
          <Compass className="h-5 w-5" />
          Browse Categories
        </span>

        <div className="overflow-x-auto py-2 no-scrollbar">
          <div className="flex w-max items-center gap-2">
            {CATEGORY_STRIP.map((cat) => {
              const Icon = ICONS[cat.icon] || MoreHorizontal;
              const isActive = cat.id === activeCard.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategorySelect(cat.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium font-secondary transition-all duration-150 hover:z-10 hover:scale-105 hover:shadow-md motion-reduce:hover:scale-100 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] ${
                    isActive
                      ? "border-(--primary)/50 bg-(--primary)/15 text-(--primary-text)"
                      : "border-(--border) bg-(--card) text-(--foreground) hover:border-(--primary)/40 hover:text-(--primary-text)"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
