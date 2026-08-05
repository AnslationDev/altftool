"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { TOTAL_CATEGORIES, TOTAL_FREE_TOOLS, TOTAL_TOOLS, searchTools } from "../data/tools";
import CountUp from "./hero/CountUp";
import HeroRadar from "./hero/HeroRadar";
import useTypewriter from "./hero/useTypewriter";
import HeroSearchPreview from "./HeroSearchPreview";

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const ROTATING_PHRASES = ["priced honestly.", "verified weekly.", "compared fairly."];

const TRENDING_KEYWORDS = ["ChatGPT", "Midjourney", "GitHub Copilot", "Suno", "Notion AI"];

const STATS = [
  { label: "AI tools", value: `${TOTAL_TOOLS}+` },
  { label: "categories", value: `${TOTAL_CATEGORIES}+` },
  { label: "free to try", value: `${TOTAL_FREE_TOOLS}+` },
];

export default function Hero({ query, onQueryChange, onExplore, onViewDeals }) {
  const inputRef = useRef(null);
  const searchWrapRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const rotatingText = useTypewriter(ROTATING_PHRASES);

  const trimmedQuery = query.trim();
  const showPreview = previewOpen && trimmedQuery.length >= 2;
  const previewResults = showPreview ? searchTools(trimmedQuery) : [];

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
        return;
      }
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!previewOpen) return undefined;
    const handleClick = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) setPreviewOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [previewOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPreviewOpen(false);
    onExplore();
  };

  const handleKeywordClick = (keyword) => {
    onQueryChange(keyword);
    setPreviewOpen(true);
    inputRef.current?.focus();
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--aib-bg)] px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }} className="text-center lg:text-left">
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--aib-border)] bg-[var(--aib-surface)] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--aib-muted-fg)]"
            >
              <span className="aib-live-dot h-2 w-2 rounded-full bg-[var(--aib-primary)]" aria-hidden="true" />
              <CountUp value={`${TOTAL_TOOLS}`} /> tools · updated weekly
            </motion.span>

            <motion.h1 variants={itemVariants} className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--aib-fg)] sm:text-5xl lg:text-[3.4rem]">
              Every AI tool,
              <br />
              <span className="text-[var(--aib-primary)]">
                {rotatingText}
                <span className="aib-caret" aria-hidden="true">|</span>
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-[var(--aib-muted-fg)] lg:mx-0">
              Free plans, verified trials, student discounts and the subscriptions actually worth paying for — across{" "}
              {TOTAL_CATEGORIES} categories, checked every week.
            </motion.p>

            <motion.form
              variants={itemVariants}
              onSubmit={submitSearch}
              role="search"
              aria-label="Search AI tools"
              className="relative z-20 mx-auto mt-8 max-w-md lg:mx-0"
              ref={searchWrapRef}
            >
              <div className="flex items-center gap-2 rounded-full border border-[var(--aib-border)] bg-[var(--aib-surface)] px-4 py-2 ring-1 ring-transparent transition-all duration-300 focus-within:shadow-lg focus-within:ring-[var(--aib-primary)]/30 sm:gap-3 sm:px-5">
                <Search className="h-5 w-5 shrink-0 text-[var(--aib-muted-fg)]" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    onQueryChange(event.target.value);
                    setPreviewOpen(event.target.value.trim().length >= 2);
                  }}
                  onFocus={() => {
                    if (trimmedQuery.length >= 2) setPreviewOpen(true);
                  }}
                  placeholder="Search ChatGPT, Canva, DeepL..."
                  aria-label="Search AI tools"
                  autoComplete="off"
                  spellCheck="false"
                  className="h-11 w-full bg-transparent text-base text-[var(--aib-fg)] placeholder:text-[var(--aib-muted-fg)] focus:outline-none sm:h-12"
                />
                <kbd className="hidden shrink-0 rounded-md border border-[var(--aib-border)] bg-[var(--aib-muted)] px-2 py-1 font-mono text-xs text-[var(--aib-muted-fg)] sm:block">/</kbd>
              </div>

              <AnimatePresence>
                {showPreview ? (
                  <HeroSearchPreview
                    results={previewResults.slice(0, 5)}
                    totalCount={previewResults.length}
                    query={trimmedQuery}
                    onSelectResult={() => setPreviewOpen(false)}
                    onViewAll={() => {
                      setPreviewOpen(false);
                      onExplore();
                    }}
                  />
                ) : null}
              </AnimatePresence>
            </motion.form>

            <motion.div variants={itemVariants} className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-2 lg:mx-0 lg:justify-start">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--aib-muted-fg)]">Trending</span>
              {TRENDING_KEYWORDS.map((keyword) => (
                <motion.button
                  key={keyword}
                  type="button"
                  onClick={() => handleKeywordClick(keyword)}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  className="rounded-full border border-[var(--aib-border)] bg-[var(--aib-surface)] px-3 py-1 text-xs font-semibold text-[var(--aib-fg)] shadow-sm transition-colors duration-200 hover:border-[var(--aib-primary)] hover:text-[var(--aib-primary)]"
                >
                  {keyword}
                </motion.button>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-3 lg:mx-0 lg:justify-start">
              <motion.button
                type="button"
                onClick={onExplore}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="aib-sheen rounded-xl bg-[var(--aib-primary)] px-6 py-3 text-sm font-semibold text-[var(--aib-primary-fg)] shadow-lg shadow-[var(--aib-primary)]/20"
              >
                Browse all tools
              </motion.button>
              <motion.button
                type="button"
                onClick={onViewDeals}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-xl border border-[var(--aib-border)] bg-[var(--aib-surface)] px-6 py-3 text-sm font-semibold text-[var(--aib-fg)] transition-colors hover:border-[var(--aib-primary)] hover:text-[var(--aib-primary)]"
              >
                Show free plans only
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="mx-auto mt-10 flex max-w-md justify-center divide-x divide-[var(--aib-border)] lg:mx-0 lg:justify-start">
              {STATS.map(({ label, value }, index) => (
                <div key={label} className={index === 0 ? "pr-6" : "px-6"}>
                  <p className="text-2xl font-extrabold leading-none text-[var(--aib-fg)]">
                    <CountUp value={value} />
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--aib-muted-fg)]">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 96 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroRadar />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
