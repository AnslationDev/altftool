"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, PetalBurst, AnimatedCounter } from "./motion";

/**
 * Premium hero for the categories directory: living aurora background,
 * word-by-word masked headline reveal with a serif-italic accent, and an
 * animated stats band. Pure framer-motion — nothing global.
 */
const line1 = ["Every", "category,"];
const line2 = ["one", "place."];

function MaskedWord({ word, index, accent = false, reduceMotion = false }) {
  return (
    <span className="inline-block overflow-hidden pb-1 align-bottom">
      <motion.span
        initial={reduceMotion ? false : { y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, delay: 0.15 + index * 0.09, ease: EASE }}
        className={
          accent
            ? "inline-block italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary"
            : "inline-block"
        }
        style={accent ? { fontFamily: "var(--font-top5-display, serif)" } : undefined}
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function CategoriesHero({
  fieldsCount,
  publishedRankingsCount,
  rankedEntriesCount,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-footer text-on-media">
      {/* Living aurora: two blobs slowly breathe and drift. */}
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: [0, 60, -20, 0], y: [0, 30, 60, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-32 h-[460px] w-[460px] rounded-full bg-primary/25 blur-[120px]"
      />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: [0, -70, 30, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.2, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-10 right-[-120px] h-[420px] w-[420px] rounded-full bg-secondary/20 blur-[120px]"
      />

      {/* Faint blueprint grid, fading toward the bottom. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--on-media) 1px, transparent 1px), linear-gradient(to bottom, var(--on-media) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.25em] text-secondary"
        >
          <span className="inline-block h-px w-7 bg-secondary" aria-hidden="true" />
          THE FULL INDEX
        </motion.p>

        <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.04]">
          <span className="block">
            {line1.map((word, index) => (
              <span key={word} className="mr-[0.28em] last:mr-0 inline-block">
                <MaskedWord word={word} index={index} reduceMotion={reduceMotion} />
              </span>
            ))}
          </span>
          <span className="block">
            {line2.map((word, index) => (
              <span key={word} className="mr-[0.28em] last:mr-0 inline-block">
                <MaskedWord
                  word={word}
                  index={line1.length + index}
                  accent
                  reduceMotion={reduceMotion}
                />
              </span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
          className="mt-5 max-w-xl text-sm sm:text-base text-on-media/70 leading-relaxed"
        >
          Browse {fieldsCount} listed fields and {publishedRankingsCount} published
          Top5 rankings, with new coverage added as each list is authored.
        </motion.p>

        {/* Animated stats band. */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-on-media/10 pt-7"
        >
          <div>
            <p className="text-2xl sm:text-3xl font-black text-on-media">
              <AnimatedCounter value={String(fieldsCount)} />
            </p>
            <p className="mt-0.5 text-xs font-semibold tracking-widest text-on-media/50">
              FIELDS LISTED
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-on-media">
              <AnimatedCounter value={String(publishedRankingsCount)} />
            </p>
            <p className="mt-0.5 text-xs font-semibold tracking-widest text-on-media/50">
              PUBLISHED RANKINGS
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-on-media">
              <AnimatedCounter value={String(rankedEntriesCount)} />
            </p>
            <p className="mt-0.5 text-xs font-semibold tracking-widest text-on-media/50">
              RANKED ENTRIES
            </p>
          </div>

          <div className="ml-auto hidden sm:block" aria-hidden="true">
            <PetalBurst className="h-12 w-12 text-primary-text/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
