"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal, staggerContainer, staggerItem } from "./motion";

// Both lists are selected and slimmed on the server. This keeps authored
// ranking data out of the client bundle and avoids synthetic activity or
// engagement claims.
export default function LiveActivitySection({ updates = [], editorialPicks = [] }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-surface py-14 sm:py-20 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-primary-text">
              05 / EDITORIAL UPDATES
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Published context, clearly dated.
            </h2>
          </Reveal>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 space-y-6 sm:mt-10 sm:space-y-8"
          >
            {updates.map((update) => (
              <motion.li key={update.slug} variants={staggerItem} className="relative pl-6">
                <motion.span
                  aria-hidden="true"
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
                  }
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }
                  className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary"
                />
                <p className="text-xs font-semibold tracking-widest text-primary-text">
                  {update.updated}
                </p>
                <Link
                  href={`/top5/item/${update.slug}`}
                  className="mt-1 block font-bold text-foreground transition-colors hover:text-secondary"
                >
                  {update.shortLabel}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {update.category} · {update.entriesCount} ranked entries
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div>
          <Reveal delay={0.1}>
            <p className="text-xs font-semibold tracking-widest text-primary-text">
              06 / EDITORIAL SHORTLIST
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Four authored lists to explore next.
            </h2>
          </Reveal>

          <motion.ul
            id="editorial-picks"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 scroll-mt-20 divide-y divide-border sm:mt-10"
          >
            {editorialPicks.map((pick, index) => (
              <motion.li
                key={pick.slug}
                variants={staggerItem}
                whileHover={reduceMotion ? undefined : { x: 6 }}
              >
                <Link
                  href={`/top5/item/${pick.slug}`}
                  className="group flex min-h-16 items-center justify-between gap-4 py-5"
                >
                  <span className="flex min-w-0 items-start gap-4">
                    <span className="pt-0.5 text-sm text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-foreground transition-colors group-hover:text-secondary">
                        {pick.shortLabel}
                      </span>
                      <span className="block text-sm text-muted-foreground">{pick.category}</span>
                    </span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary-text"
                  />
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
