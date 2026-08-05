"use client";

import { motion } from "framer-motion";
import { getPopularTools } from "../../data/tools";

const SLOTS = [
  { top: "22%", left: "60%", delay: 0.05 },
  { top: "38%", left: "28%", delay: 1.2 },
  { top: "58%", left: "74%", delay: 2.1 },
  { top: "70%", left: "38%", delay: 3.0 },
  { top: "48%", left: "50%", delay: 3.7 },
];

const RINGS = ["12%", "30%", "48%", "66%"];

function getTopFreePopularTools(limit = 5) {
  return getPopularTools(30)
    .filter((tool) => tool.pricing !== "PAID")
    .slice(0, limit);
}

/** Right-side hero visual: an animated radar sweep pinging the top popular free AI tools. */
export default function HeroRadar() {
  const blips = getTopFreePopularTools(SLOTS.length).map((tool, index) => ({ ...tool, ...SLOTS[index] }));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[560px]">
      <div className="absolute inset-0 overflow-hidden rounded-full border border-white/15 bg-[#0a1c16] bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--aib-primary)_16%,transparent),transparent_70%)] shadow-2xl shadow-black/30">
        {RINGS.map((inset) => (
          <div key={inset} className="absolute rounded-full border border-white/10" style={{ inset }} aria-hidden="true" />
        ))}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden="true" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" aria-hidden="true" />

        <div className="aib-radar-sweep absolute inset-0 rounded-full" aria-hidden="true" />

        {blips.map((blip) => (
          <div
            key={`${blip.name}-${blip.domain}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ top: blip.top, left: blip.left }}
          >
            <span
              className="aib-radar-blip-dot mx-auto block h-2.5 w-2.5 rounded-full bg-[var(--aib-primary)]"
              style={{ animationDelay: `${blip.delay}s` }}
              aria-hidden="true"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: blip.delay }}
              className="mt-1.5 inline-block whitespace-nowrap rounded-md border border-white/15 bg-black/60 px-2 py-0.5 font-mono text-[11px] text-white"
            >
              {blip.name}
            </motion.span>
          </div>
        ))}

        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" aria-hidden="true" />
      </div>
    </div>
  );
}
