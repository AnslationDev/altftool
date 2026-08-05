"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import { Reveal, EASE } from "./motion";

// The hero promises "five at a time" — this section is where that promise
// plays out as motion: a countdown through one flagship ranking's five
// entries, staged as the video reference's overlapping "latest projects"
// card pair, re-purposed as a rank-5-to-rank-1 reveal. Mock data only —
// same rankings.js used by TrendingSection/PopularSection elsewhere.
const AUTOPLAY_MS = 4200;

// Deterministic scalloped "seal" outline for the CTA badge, echoing the
// reference's stamp-style buttons. Pure trig, no randomness — same path
// every render.
function sealPath(r = 56, bumps = 14, amplitude = 3) {
  const points = [];
  const steps = bumps * 8;
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const wobble = Math.sin(angle * bumps) * amplitude;
    const radius = r + wobble;
    const x = 60 + radius * Math.cos(angle);
    const y = 60 + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${points.join(" L")}Z`;
}

const SEAL_PATH = sealPath();

function SealLink({ href, children, reduceMotion = false }) {
  return (
    <Link href={href} className="group relative block h-28 w-28 shrink-0 sm:h-32 sm:w-32">
      <motion.svg
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <path d={SEAL_PATH} className="fill-white transition-colors group-hover:fill-[#10b981]" />
      </motion.svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center text-xs font-bold leading-tight text-[#0b1120] transition-colors group-hover:text-white">
        {children}
      </span>
    </Link>
  );
}

// `ranking` (slim fields + items) comes from the server page — the full
// rankings dataset stays out of the client bundle.
export default function Top5Showcase({ ranking }) {
  const countdown = ranking?.items ? [...ranking.items].reverse() : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || paused || countdown.length < 2) return undefined;
    const id = setInterval(() => {
      setActiveIndex((current) => (current + 1) % countdown.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduceMotion, paused, countdown.length]);

  if (!ranking) return null;

  const active = countdown[activeIndex];
  const next = countdown[(activeIndex + 1) % countdown.length];
  const isChampion = active.rank === 1;

  const step = (direction) => {
    setActiveIndex((current) => {
      const total = countdown.length;
      return (current + (direction === "next" ? 1 : -1) + total) % total;
    });
  };

  return (
    <section
      className="relative overflow-hidden bg-[#0b0f1a] py-20 sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 text-[9rem] font-black tracking-tighter text-white/[0.03] sm:text-[13rem] whitespace-nowrap"
      >
        TOP5
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-[#67e8b8]">
              THE COUNTDOWN &middot; {ranking.category.toUpperCase()}
            </p>
            <h2 className="mt-4 max-w-xl font-[family-name:var(--font-top5-display)] text-4xl italic leading-[1.1] text-white sm:text-6xl">
              {ranking.shortLabel}
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <SealLink href={`/top5/item/${ranking.slug}`} reduceMotion={reduceMotion}>
              See full
              <br />
              ranking
              <ArrowRight size={14} className="mx-auto mt-1" />
            </SealLink>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
          {/* Countdown rail */}
          <Reveal delay={0.15} className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
            {countdown.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.rank}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group flex shrink-0 items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors lg:w-full ${
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`font-[family-name:var(--font-top5-display)] text-3xl italic transition-colors ${
                      isActive ? "text-[#67e8b8]" : "text-white/30 group-hover:text-white/60"
                    }`}
                  >
                    {String(item.rank).padStart(2, "0")}
                  </span>
                  <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/50"}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </Reveal>

          {/* Stacked-card reveal */}
          <div className="relative">
            <div className="relative h-[420px] sm:h-[480px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`next-${next.rank}`}
                  initial={{ opacity: 0, rotate: 6, x: 40 }}
                  animate={{ opacity: 0.55, rotate: 6, x: 40, y: 24 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 overflow-hidden rounded-3xl"
                  style={{ transformOrigin: "bottom right" }}
                >
                  <ManagedImage
                    src={next.cardImage || ranking.cardImage}
                    alt={next.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#0b0f1a]/50" />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.rank}
                  initial={{ opacity: 0, rotate: -4, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, rotate: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 4, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="absolute inset-0 overflow-hidden rounded-3xl shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)]"
                >
                  <ManagedImage
                    src={active.cardImage || ranking.cardImage}
                    alt={active.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                      <span className="font-[family-name:var(--font-top5-display)] text-5xl italic text-[#67e8b8] sm:text-6xl">
                        #{active.rank}
                      </span>
                      {isChampion ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-full bg-[#67e8b8] px-3 py-1 text-xs font-bold text-[#0b1120]"
                        >
                          THIS WEEK'S #1
                        </motion.span>
                      ) : null}
                    </div>

                    <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{active.name}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
                      {active.blurb}
                    </p>

                    <div className="mt-5 flex items-center gap-4">
                      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: active.score / 10 }}
                          transition={{ duration: 0.9, ease: EASE }}
                          style={{ transformOrigin: "left" }}
                          className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#5ea8ff,#a78bfa)]"
                        />
                      </div>
                      <span className="text-sm font-semibold text-white">{active.score}/10</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link
                href={`/top5/item/${ranking.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#0b1120]"
              >
                See details
                <ArrowRight size={14} />
              </Link>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => step("prev")}
                  aria-label="Previous rank"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => step("next")}
                  aria-label="Next rank"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
