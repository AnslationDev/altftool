"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, UserCheck, Clock3, ListOrdered } from "lucide-react";
import RankingActions from "./RankingActions";
import { EASE } from "./motion";

/**
 * Premium header for a ranking page: eyebrow with pulsing marker,
 * word-by-word masked title reveal (the numeral gets the serif-italic
 * gradient accent), description + actions easing in from the right, and a
 * staggered stats band with icons. The ranking list below is untouched.
 */
function MaskedWord({ word, index, reduceMotion = false }) {
  const isNumeral = /^\d+$/.test(word);
  return (
    <span className="inline-block overflow-hidden pb-[0.08em] align-bottom mr-[0.26em] last:mr-0">
      <motion.span
        initial={reduceMotion ? false : { y: "112%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.12 + index * 0.055, ease: EASE }}
        className={
          isNumeral
            ? "inline-block italic text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-hover pr-[0.06em]"
            : "inline-block"
        }
        style={isNumeral ? { fontFamily: "var(--font-top5-display, serif)" } : undefined}
      >
        {word}
      </motion.span>
    </span>
  );
}

const STATS_ICONS = [CalendarDays, UserCheck, Clock3, ListOrdered];

export default function RankingHeader({ ranking }) {
  const reduceMotion = useReducedMotion();
  const words = ranking.title.split(" ");
  const stats = [
    { label: "Updated", value: ranking.updated },
    { label: "Reviewed by", value: ranking.reviewedBy },
    { label: "Read time", value: ranking.readTime },
    { label: "Entries", value: String(ranking.entriesCount) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.22em] text-primary-text"
      >
        <motion.span
          animate={reduceMotion ? undefined : { opacity: [1, 0.3, 1] }}
          transition={reduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
        {ranking.category.toUpperCase()}
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground-soft">DEFINITIVE RANKING</span>
      </motion.p>

      <div className="mt-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.06]">
            {words.map((word, index) => (
              <MaskedWord
                key={`${word}-${index}`}
                word={word}
                index={index}
                reduceMotion={reduceMotion}
              />
            ))}
          </h1>

          {/* Underline stroke draws itself once the title has landed. */}
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.35 + words.length * 0.055, ease: EASE }}
            style={{ transformOrigin: "left" }}
            className="mt-5 block h-[3px] w-24 rounded-full bg-gradient-to-r from-primary to-secondary"
            aria-hidden="true"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="lg:w-[340px] shrink-0 lg:border-l lg:border-border lg:pl-7"
        >
          <p className="text-foreground-soft leading-relaxed">{ranking.description}</p>
          <RankingActions
            slug={ranking.slug}
            title={ranking.title}
            description={ranking.description}
          />
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.45 } } }}
        className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-border py-6"
      >
        {stats.map((stat, index) => {
          const Icon = STATS_ICONS[index];
          return (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
              }}
              whileHover={{ y: -3 }}
              className="group"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground">
                <Icon size={13} className="text-primary-text/70 transition-transform duration-300 group-hover:scale-125" />
                {stat.label}
              </p>
              <p className="mt-1 font-semibold text-foreground">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
