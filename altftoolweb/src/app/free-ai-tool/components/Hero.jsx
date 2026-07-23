"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { TOOL_CATEGORIES, TOTAL_TOOLS, searchTools } from "../data/tools";
import HeroSearchPreview from "./HeroSearchPreview";
import ToolLogo from "./ToolLogo";

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// A loose floating arc of real tool logos (desktop only) — decoration built
// from the actual directory below, not stock art.
const LOGO_ARC = [
  { name: "ChatGPT", domain: "chatgpt.com", size: 56, style: { left: "2%", top: "56%" } },
  { name: "Claude", domain: "claude.ai", size: 78, style: { left: "15%", top: "12%" } },
  { name: "Suno", domain: "suno.com", size: 90, style: { left: "32%", top: "-6%" } },
  { name: "Cursor", domain: "cursor.com", size: 72, style: { left: "40%", top: "54%" } },
  { name: "Gamma", domain: "gamma.app", size: 66, style: { left: "54%", top: "10%" } },
  { name: "Ideogram", domain: "ideogram.ai", size: 58, style: { left: "62%", top: "58%" } },
  { name: "Perplexity", domain: "perplexity.ai", size: 64, style: { left: "76%", top: "30%" } },
  { name: "ElevenLabs", domain: "elevenlabs.io", size: 72, style: { left: "88%", top: "-2%" } },
  { name: "Canva AI", domain: "canva.com", size: 52, style: { left: "93%", top: "48%" } },
];

export default function Hero({ query, onQueryChange, onExplore, onSelectCategory }) {
  const inputRef = useRef(null);
  const searchWrapRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const trimmedQuery = query.trim();
  const showPreview = previewOpen && trimmedQuery.length >= 2;
  const previewResults = showPreview ? searchTools(trimmedQuery) : [];

  // "/" focuses search from anywhere on the page; Escape closes the live preview.
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

  // Click outside the search box closes the live preview dropdown.
  useEffect(() => {
    if (!previewOpen) return undefined;
    const handleClick = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setPreviewOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [previewOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPreviewOpen(false);
    onExplore();
  };

  const handleCategoryClick = (id) => {
    setPreviewOpen(false);
    onSelectCategory(id);
  };

  return (
    <section id="hero" className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      {/* Simple solid + gradient wash — no grid/box texture on top */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="fat-hero-wash absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-10">
          {/* Left: headline, subtext, search */}
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl"
            >
              Discover the Best
              <br />
              <span className="fat-gradient-text">Free AI Tools</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mx-auto mt-4 max-w-md text-lg text-slate-500 lg:mx-0">
              A growing directory of {TOTAL_TOOLS}+ free AI tools, weekly updated for the community.
            </motion.p>

            <motion.form
              variants={itemVariants}
              onSubmit={submitSearch}
              role="search"
              aria-label="Search free AI tools"
              className="relative z-20 mx-auto mt-7 max-w-md lg:mx-0"
              ref={searchWrapRef}
            >
              <div className="fat-glass flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm transition-shadow duration-300 focus-within:shadow-md sm:gap-3 sm:px-5">
                <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
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
                  placeholder="Search AI Tools..."
                  aria-label="Search AI tools"
                  autoComplete="off"
                  spellCheck="false"
                  className="h-11 w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:h-12"
                />
                <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-400 sm:block">
                  /
                </kbd>
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
          </motion.div>

          {/* Right: floating logo cluster (desktop only) */}
          <div className="relative hidden h-72 lg:block" aria-hidden="true">
            {LOGO_ARC.map(({ name, domain, size, style }, index) => (
              <motion.span
                key={name}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.06, duration: 0.5, ease: "easeOut" }}
                className="fat-float absolute flex items-center justify-center rounded-full bg-white p-2 shadow-lg shadow-slate-300/50 ring-1 ring-slate-900/5"
                style={{ width: size, height: size, animationDelay: `${index * 0.4}s`, ...style }}
              >
                <ToolLogo name={name} domain={domain} size={size * 0.62} />
              </motion.span>
            ))}
          </div>
        </div>

        {/* Category grid — every category, one tap away */}
        <div
          id="categories"
          className="scroll-mt-24 mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
        >
          {TOOL_CATEGORIES.map((category) => {
            const spotlight = category.tools.find((item) => item.popular) || category.tools[0];
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className="fat-card group flex flex-col items-center gap-2.5 rounded-2xl px-3 py-6 text-center"
              >
                <span
                  className="fat-tile flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ "--fat-tile-a": `${category.hue[0]}1a`, "--fat-tile-b": `${category.hue[1]}0f` }}
                >
                  <ToolLogo name={spotlight.name} domain={spotlight.domain} hue={category.hue} size={28} />
                </span>
                <span className="text-sm font-semibold leading-tight text-slate-800">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
