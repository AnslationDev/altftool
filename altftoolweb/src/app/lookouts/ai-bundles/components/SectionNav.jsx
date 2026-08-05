"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Top" },
  { id: "trending", label: "Trending" },
  { id: "explore", label: "Categories" },
  { id: "deals", label: "Free Deals" },
  { id: "collections", label: "Collections" },
  { id: "community", label: "Community" },
  { id: "resources", label: "Resources" },
  { id: "newsletter", label: "Subscribe" },
];

/** Floating desktop-only dot rail — tracks scroll position and jumps between sections. */
export default function SectionNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));

    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.nav
      aria-label="Jump to section"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-2.5 xl:flex"
    >
      {SECTIONS.map((section) => {
        const isActive = activeId === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Jump to ${section.label}`}
            className="group flex items-center gap-2.5"
          >
            <span className="pointer-events-none rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              {section.label}
            </span>
            <motion.span
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.9 }}
              className={`block rounded-full transition-colors duration-300 ${
                isActive
                  ? "h-2.5 w-2.5 bg-gradient-to-r from-teal-600 to-emerald-500 shadow-[0_0_0_4px_rgba(13,148,136,0.16)]"
                  : "h-2 w-2 bg-slate-300 group-hover:bg-slate-400"
              }`}
            />
          </button>
        );
      })}
    </motion.nav>
  );
}
