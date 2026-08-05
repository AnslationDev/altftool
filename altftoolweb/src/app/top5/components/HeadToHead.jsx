"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Swords, Crown } from "lucide-react";
import { EASE } from "./motion";

/**
 * Interactive head-to-head compare: the reader picks any two entries from
 * the ranking (chips below), and the panel re-stages the duel with
 * animated score bars, metric-by-metric winners, and the verdict chip.
 * Selection is FIFO — picking a third entry swaps out the older pick.
 */
const panelStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const panelRow = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

function MetricBars({ label, left, right, max = 10, format = (v) => v }) {
  const leftWins = left > right;
  const rightWins = right > left;
  return (
    <motion.div variants={panelRow}>
      <p className="text-center text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-10 shrink-0 text-right text-sm font-bold ${leftWins ? "text-primary-text" : "text-foreground"}`}>
            {format(left)}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border" style={{ transform: "scaleX(-1)" }}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: left / max }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ transformOrigin: "left" }}
              className={`h-full rounded-full ${leftWins ? "bg-gradient-to-r from-primary to-secondary" : "bg-border-strong"}`}
            />
          </div>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground">VS</span>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: right / max }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ transformOrigin: "left" }}
              className={`h-full rounded-full ${rightWins ? "bg-gradient-to-r from-primary to-secondary" : "bg-border-strong"}`}
            />
          </div>
          <span className={`w-10 shrink-0 text-sm font-bold ${rightWins ? "text-primary-text" : "text-foreground"}`}>
            {format(right)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function TraitColumn({ title, traits, icon: Icon, tone }) {
  return (
    <div>
      <p className={`text-[10px] font-semibold tracking-widest ${tone === "good" ? "text-primary-text" : "text-danger-text"}`}>
        {title}
      </p>
      <ul className="mt-1.5 space-y-1.5">
        {traits.map((trait) => (
          <li key={trait} className="flex items-start gap-1.5 text-xs sm:text-sm text-foreground-soft">
            <Icon size={13} className={`mt-0.5 shrink-0 ${tone === "good" ? "text-primary-text" : "text-danger-text"}`} />
            {trait}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HeadToHead({ items }) {
  // FIFO pair selection, defaulting to the #1 vs #2 duel.
  const [picks, setPicks] = useState(() =>
    items.slice(0, 2).map((item) => item.rank),
  );

  const toggle = (rank) => {
    setPicks((current) => {
      if (current.includes(rank)) return current; // keep a valid pair
      return [current[1], rank];
    });
  };

  const [a, b] = picks
    .map((rank) => items.find((item) => item.rank === rank))
    .filter(Boolean);

  if (!a || !b) return null;

  const leader = a.score === b.score ? null : a.score > b.score ? a : b;
  const duelKey = `${a.rank}-vs-${b.rank}`;

  return (
    <div className="mt-10">
      {/* Entry picker chips. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground">
          <Swords size={13} className="text-primary-text" />
          PICK ANY TWO
        </span>
        {items.map((item) => {
          const selected = picks.includes(item.rank);
          return (
            <motion.button
              key={item.rank}
              type="button"
              onClick={() => toggle(item.rank)}
              whileTap={{ scale: 0.94 }}
              aria-pressed={selected}
              className={`min-h-11 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                selected
                  ? "border-transparent bg-footer text-on-media shadow-md"
                  : "border-border bg-surface text-foreground-soft hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span className={selected ? "text-secondary" : "text-muted-foreground"}>
                #{item.rank}
              </span>{" "}
              {item.name}
            </motion.button>
          );
        })}
      </div>

      {/* Duel panel. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={duelKey}
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.985, transition: { duration: 0.22, ease: EASE } }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-6 overflow-hidden rounded-3xl border border-border bg-page p-5 sm:p-8"
        >
          {/* Names + VS medallion. */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">#{a.rank}</p>
              <h3 className="mt-0.5 text-lg sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                {a.name}
              </h3>
              <p className="mt-1 hidden sm:block text-xs text-muted-foreground capitalize">
                best for {a.bestFor}
              </p>
            </div>

            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs sm:text-sm font-black italic text-primary-foreground shadow-lg"
              style={{ fontFamily: "var(--font-top5-display, serif)" }}
              aria-hidden="true"
            >
              VS
            </motion.span>

            <div>
              <p className="text-xs font-semibold text-muted-foreground">#{b.rank}</p>
              <h3 className="mt-0.5 text-lg sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                {b.name}
              </h3>
              <p className="mt-1 hidden sm:block text-xs text-muted-foreground capitalize">
                best for {b.bestFor}
              </p>
            </div>
          </div>

          {/* Verdict chip. */}
          {leader ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35, ease: EASE }}
              className="mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary-text"
            >
              <Crown size={13} />
              {leader.name} leads on editorial score
            </motion.p>
          ) : null}

          {/* Metrics. */}
          <motion.div
            variants={panelStagger}
            initial="hidden"
            animate="show"
            className="mt-6 space-y-5 border-t border-border pt-6"
          >
            <MetricBars
              label="TOP5 SCORE"
              left={a.score}
              right={b.score}
              max={10}
              format={(v) => `${v}`}
            />
            <MetricBars
              label="GLOBAL REACH"
              left={a.globalReach}
              right={b.globalReach}
              max={100}
              format={(v) => `${v}%`}
            />

            {/* Strengths & tradeoffs, side by side. */}
            <motion.div variants={panelRow} className="grid grid-cols-2 gap-4 sm:gap-8 border-t border-border pt-5">
              <div className="space-y-4">
                <TraitColumn title="STRENGTHS" traits={a.strengths} icon={Check} tone="good" />
                <TraitColumn title="TRADEOFFS" traits={a.tradeoffs} icon={X} tone="bad" />
              </div>
              <div className="space-y-4">
                <TraitColumn title="STRENGTHS" traits={b.strengths} icon={Check} tone="good" />
                <TraitColumn title="TRADEOFFS" traits={b.tradeoffs} icon={X} tone="bad" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
