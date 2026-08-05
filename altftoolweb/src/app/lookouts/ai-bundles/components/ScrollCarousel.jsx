"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

/** Horizontal snap-scroll row with circular arrow buttons that track real scroll position. */
export default function ScrollCarousel({ eyebrow, title, subtitle, children, id, headerExtra }) {
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
  }, [children]);

  const scrollByAmount = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" className="max-w-xl" />
        <div className="flex shrink-0 items-center gap-3">
          {headerExtra}
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => scrollByAmount(-1)}
              disabled={atStart}
              aria-label="Scroll left"
              whileHover={atStart ? undefined : { scale: 1.1 }}
              whileTap={atStart ? undefined : { scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors duration-200 hover:border-teal-300 hover:text-teal-600 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => scrollByAmount(1)}
              disabled={atEnd}
              aria-label="Scroll right"
              whileHover={atEnd ? undefined : { scale: 1.1 }}
              whileTap={atEnd ? undefined : { scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors duration-200 hover:border-teal-300 hover:text-teal-600 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>

      <div ref={trackRef} className="aib-no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4">
        {children}
      </div>
    </div>
  );
}
