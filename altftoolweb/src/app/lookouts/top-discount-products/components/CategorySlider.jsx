"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { baloo2 } from "../lib/fonts";

export default function CategorySlider({ categories, activeCategory, onSelect }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return undefined;
    const handle = () => updateEdges();
    el.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("resize", handle);
    return () => {
      el.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);
    };
  }, [categories]);

  const scrollByAmount = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  };

  if (!categories.length) return null;

  return (
    <section className="border-y-[3px] border-[#171717] bg-[#ffffff] px-6 py-8">
      <ScrollReveal className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className={`${baloo2.className} text-sm font-bold uppercase tracking-wide text-[#171717]`}>
            Shop by category
          </h2>
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => scrollByAmount(-1)}
              disabled={atStart}
              aria-label="Scroll categories left"
              whileHover={atStart ? undefined : { scale: 1.08 }}
              whileTap={atStart ? undefined : { scale: 0.92 }}
              className="tdp-neo-card-sm flex h-8 w-8 items-center justify-center bg-[#ffffff] text-[#171717] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => scrollByAmount(1)}
              disabled={atEnd}
              aria-label="Scroll categories right"
              whileHover={atEnd ? undefined : { scale: 1.08 }}
              whileTap={atEnd ? undefined : { scale: 0.92 }}
              className="tdp-neo-card-sm flex h-8 w-8 items-center justify-center bg-[#ffffff] text-[#171717] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="tdp-rail mt-4 flex gap-2.5 overflow-x-auto scroll-smooth pb-1"
        >
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`tdp-neo-chip flex shrink-0 items-center gap-1.5 px-4 py-2 text-sm ${
              !activeCategory ? "bg-[#4CC9F0] text-[#171717]" : "bg-[#ffffff] text-[#171717]"
            }`}
          >
            <LayoutGrid size={14} />
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelect(cat.key)}
              className={`tdp-neo-chip shrink-0 px-4 py-2 text-sm ${
                activeCategory === cat.key ? "bg-[#4CC9F0] text-[#171717]" : "bg-[#ffffff] text-[#171717]"
              }`}
            >
              {cat.label}
              <span className="ml-1.5 opacity-60">{cat.count}</span>
            </button>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
