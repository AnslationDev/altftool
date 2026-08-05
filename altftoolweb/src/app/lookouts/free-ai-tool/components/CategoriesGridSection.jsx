"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ToolLogo from "./ToolLogo";

const EASE = [0.22, 1, 0.36, 1];

// Cycled per card index so neighbors don't fly in from the exact same
// corner — alternating top-left / top-right plus two steeper variants for
// a bit more variety. Only x/y (-> transform) and opacity are animated, so
// this stays GPU-friendly and never touches layout.
const DIRECTIONS = [
  { x: -56, y: -40 },
  { x: 56, y: -40 },
  { x: -34, y: -56 },
  { x: 34, y: -56 },
];

/** True below the `sm` breakpoint, so entrance offsets/stagger can shrink
 *  enough that cards never fly in from off-screen on narrow viewports. */
function useIsCompactViewport() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return compact;
}

/**
 * `startDelay` (seconds) lets the caller schedule this grid's entrance to
 * begin right after some other animation (e.g. the hero's typewriter +
 * subheading sequence) finishes, instead of guessing a fixed delay.
 */
export default function CategoriesGridSection({ categories, startDelay = 0 }) {
  const shouldReduceMotion = useReducedMotion();
  const isCompact = useIsCompactViewport();
  const offsetScale = isCompact ? 0.4 : 1;
  const stagger = isCompact ? 0.04 : 0.06;

  return (
    <section id="categories" className="relative px-4 pt-2 pb-10 sm:pb-14">
      <div className="mx-auto max-w-7xl">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category, idx) => {
            const brandTool = category.tools?.[0];
            const dir = DIRECTIONS[idx % DIRECTIONS.length];
            return (
              <motion.li
                key={category.id}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, x: dir.x * offsetScale, y: dir.y * offsetScale }
                }
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.55, delay: startDelay + idx * stagger, ease: EASE }}
              >
                <a
                  href={`#${category.id}`}
                  className="group flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-[0_2px_10px_rgba(10,5,35,0.04)] ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_28px_rgba(124,58,237,0.16)] hover:ring-violet-200"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <ToolLogo name={brandTool.name} domain={brandTool.domain} size={24} />
                  </span>
                  <span className="text-center text-sm font-semibold text-[#0A0523]/80 transition-colors group-hover:text-violet-700">
                    {category.label}
                  </span>
                </a>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
