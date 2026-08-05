"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import { EASE } from "./motion";

/**
 * `state` drives the grid's spotlight treatment (managed by
 * CategoryExplorer): while one card is being looked at ("active") its
 * siblings ("dim") gently fade, desaturate, and recede so attention lands
 * on the hovered ranking — the card-slider effect from the reference.
 * Standalone usage without `state` keeps the original hover-lift behavior.
 */
const CARD_STATES = {
  idle: { opacity: 1, scale: 1, y: 0, filter: "saturate(1) brightness(1)" },
  active: { opacity: 1, scale: 1.04, y: -8, filter: "saturate(1.08) brightness(1.04)" },
  dim: { opacity: 0.45, scale: 0.96, y: 0, filter: "saturate(0.35) brightness(0.92)" },
};

const IMAGE_STATES = {
  idle: { scale: 1 },
  active: { scale: 1.08 },
  dim: { scale: 1 },
};

export default function RankingCard({ ranking, index, state = "idle" }) {
  return (
    <motion.div
      animate={CARD_STATES[state] || CARD_STATES.idle}
      whileHover={state === "idle" ? { y: -4 } : undefined}
      transition={{ duration: 0.45, ease: EASE }}
      className={`transition-shadow duration-500 ${
        state === "active" ? "shadow-2xl shadow-black/25" : "shadow-none"
      }`}
    >
      <Link href={`/top5/item/${ranking.slug}`} className="group block">
        <div className="relative aspect-[3/2] overflow-hidden bg-[#0b1120]">
          <motion.div
            animate={IMAGE_STATES[state] || IMAGE_STATES.idle}
            whileHover={state === "idle" ? { scale: 1.06 } : undefined}
            transition={{ duration: 0.7, ease: EASE }}
            className="h-full w-full"
          >
            <ManagedImage
              src={ranking.cardImage}
              alt={ranking.title}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Text sits directly on the photo, so this gradient keeps it
              legible without hiding the image behind a solid panel. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

          {/* Soft sheen that sweeps across the photo of the spotlighted card. */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={
              state === "active"
                ? { x: ["-120%", "130%"], opacity: [0, 0.5, 0] }
                : { x: "-120%", opacity: 0 }
            }
            transition={
              state === "active"
                ? { duration: 0.9, ease: "easeInOut" }
                : { duration: 0 }
            }
            className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          <span className="absolute top-4 left-4 text-sm font-semibold text-white sm:top-5 sm:left-5 sm:text-base">
            {ranking.category}
          </span>

          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              state === "active" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <motion.span
              initial={false}
              animate={state === "active" ? { scale: [0.7, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[10px] font-semibold uppercase tracking-wide text-[#0b1120] backdrop-blur-sm sm:h-16 sm:w-16 sm:text-[11px]"
            >
              No. {String(index + 1).padStart(2, "0")}
            </motion.span>
          </div>

          <motion.div
            initial={false}
            animate={state === "active" ? { y: -4 } : { y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-x-0 bottom-0 p-4 sm:p-5"
          >
            <p className="text-[11px] font-medium text-white/60 sm:text-xs">
              {ranking.updatedLabel}
            </p>
            <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-white sm:text-2xl">
              {ranking.shortLabel}
            </h3>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
