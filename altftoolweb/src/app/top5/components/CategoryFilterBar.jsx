"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

const FILTERS = ["Show all", "Trending", "Latest", "Most viewed", "Most saved"];

export default function CategoryFilterBar({
  active: activeProp,
  onChange,
  topics = [],
  activeTopic = "All topics",
  onTopicChange,
}) {
  // Works controlled (from CategoryExplorer) or standalone.
  const [activeLocal, setActiveLocal] = useState("Show all");
  const active = activeProp ?? activeLocal;
  const setActive = (filter) => {
    setActiveLocal(filter);
    onChange?.(filter);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const hasTopics = topics.length > 1;

  return (
    <div className="flex flex-col gap-4 border-b border-black/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`relative whitespace-nowrap pb-2 text-xs font-semibold uppercase tracking-widest transition-colors sm:text-sm ${
              active === filter
                ? "text-[#0b1120]"
                : "text-[#9ca3af] hover:text-[#4b5563]"
            }`}
          >
            {filter}
            {active === filter ? (
              <motion.span
                layoutId="top5-filter-underline"
                className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-[#0b1120]"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => hasTopics && setMenuOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#9ca3af] transition-colors hover:text-[#4b5563] sm:text-sm"
        >
          Topic: <span className="text-[#0b1120]">{activeTopic}</span>
          <motion.span
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex"
          >
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {menuOpen ? (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 z-30 mt-3 w-56 origin-top-right overflow-hidden rounded-xl border border-black/10 bg-white py-1.5 shadow-xl shadow-black/10"
            >
              {topics.map((topic) => {
                const selected = topic === activeTopic;
                return (
                  <li key={topic}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onTopicChange?.(topic);
                        setMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        selected
                          ? "font-semibold text-[#0b1120] bg-[#f7f8fa]"
                          : "text-[#4b5563] hover:bg-[#f7f8fa] hover:text-[#0b1120]"
                      }`}
                    >
                      <span className="truncate">{topic}</span>
                      {selected ? <Check size={14} className="shrink-0 text-[#10b981]" /> : null}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
