"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import { ArrowUpRight } from "lucide-react";
import { EASE } from "./motion";

/**
 * `state` drives the grid's spotlight treatment (managed by
 * CategoryExplorer): while one card is being looked at ("active") its
 * siblings ("dim") gently fade, desaturate, and recede so attention lands
 * on the hovered ranking. Standalone usage without `state` keeps a local
 * hover treatment.
 *
 * Premium dressing: rounded frame with ring + layered shadows, glass
 * category chip, sheen sweep, springy "No." medallion, and a meta row
 * with a self-drawing underline + READ cta on the spotlighted card.
 */
const CARD_STATES = {
  idle: { opacity: 1, scale: 1, y: 0, filter: "saturate(1) brightness(1)" },
  active: { opacity: 1, scale: 1.04, y: -8, filter: "saturate(1.08) brightness(1.04)" },
  dim: { opacity: 0.62, scale: 0.975, y: 0, filter: "saturate(0.45) brightness(0.96)" },
};

const IMAGE_STATES = {
  idle: { scale: 1 },
  active: { scale: 1.09 },
  dim: { scale: 1 },
};

export default function RankingCard({ ranking, index, state = "idle" }) {
  const active = state === "active";

  return (
    <motion.div
      animate={CARD_STATES[state] || CARD_STATES.idle}
      whileHover={state === "idle" ? { y: -6 } : undefined}
      transition={{ duration: 0.45, ease: EASE }}
      className={`rounded-2xl transition-shadow duration-500 ${
        active
          ? "shadow-lg"
          : "shadow-sm"
      }`}
    >
      <Link href={`/top5/item/${ranking.slug}`} className="group block">
        <div
          className={`relative aspect-[3/2] overflow-hidden rounded-2xl bg-footer ring-1 transition-all duration-500 ${
            active ? "ring-primary/40" : "ring-border"
          }`}
        >
          <motion.div
            animate={IMAGE_STATES[state] || IMAGE_STATES.idle}
            whileHover={state === "idle" ? { scale: 1.07 } : undefined}
            transition={{ duration: 0.7, ease: EASE }}
            className="h-full w-full"
          >
            <ManagedImage
              src={ranking.cardImage}
              alt={ranking.title}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Legibility gradient — deepens on the spotlighted card. */}
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
              active
                ? "from-footer/85 via-footer/15 to-footer/10 opacity-100"
                : "from-footer/70 via-footer/5 to-transparent opacity-100"
            }`}
          />

          {/* Soft sheen that sweeps across the photo of the spotlighted card. */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={
              active
                ? { x: ["-120%", "130%"], opacity: [0, 0.5, 0] }
                : { x: "-120%", opacity: 0 }
            }
            transition={active ? { duration: 0.9, ease: "easeInOut" } : { duration: 0 }}
            className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-on-media/40 to-transparent"
          />

          {/* Hairline inner frame on the spotlighted card. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-2 rounded-xl border border-on-media/15 transition-opacity duration-500 ${
              active ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Glass category chip. */}
          <span className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-on-media/20 bg-footer/25 px-3 py-1.5 text-[10px] sm:text-xs font-semibold tracking-wider text-on-media backdrop-blur-md">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                active ? "bg-primary" : "bg-on-media/50"
              }`}
              aria-hidden="true"
            />
            {ranking.category}
          </span>

          {/* Springy "No." medallion. */}
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <motion.span
              initial={false}
              animate={active ? { scale: [0.6, 1.08, 1], rotate: [-8, 2, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-on-media/15 text-[10px] font-semibold uppercase tracking-wide text-on-media ring-1 ring-on-media/40 backdrop-blur-md shadow-lg sm:h-16 sm:w-16 sm:text-[11px]"
            >
              No. {String(index + 1).padStart(2, "0")}
            </motion.span>
          </div>

          {/* Meta block. */}
          <motion.div
            initial={false}
            animate={active ? { y: -4 } : { y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5"
          >
            <p className="text-[11px] font-medium text-on-media/65 sm:text-xs">
              {ranking.updatedLabel}
            </p>
            <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-on-media sm:text-2xl">
              {ranking.shortLabel}
            </h3>

            {/* Underline draws, then READ row unfolds on the active card. */}
            <span
              className={`block h-[2px] rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ${
                active ? "mt-2.5 w-14" : "mt-0 w-0"
              }`}
              aria-hidden="true"
            />
            <div
              className={`grid transition-all duration-500 ease-out ${
                active ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr] mt-0"
              }`}
            >
              <div className="overflow-hidden">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold tracking-widest text-on-media">
                  READ THE RANKING
                  <ArrowUpRight size={13} className="text-primary" />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
