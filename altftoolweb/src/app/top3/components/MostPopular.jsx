"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container, Reveal, Kicker, ScoreBar } from "./ui";
import { rankings } from "../data/content";
import { toRanking } from "../router";

const PAGE_SIZE = 20;

export function MostPopular() {
  const sorted = [...rankings].sort((a, b) => b.popularity - a.popularity);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = sorted.slice(0, visible);

  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Left column — sticks while the list scrolls, like Editor's Picks */}
          <div className="md:col-span-4 md:sticky md:top-28 self-start">
            <Reveal>
              <Kicker>Most Popular</Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,4.2vw,56px)] font-light leading-[1.02] tracking-[-0.02em]">
                Read by <em className="italic">more than a million</em> people this year.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 text-[15px] leading-[1.7] text-ink-soft">
                Popularity here means sustained readership, not clicks. These rankings
                have held attention for more than 30 days — the strongest signal we
                track for lasting usefulness.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 text-[11px] font-mono uppercase tracking-[0.16em] text-ink-mute">
                Showing {shown.length} of {sorted.length} rankings
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            <div className="border-t border-ink/15">
              {shown.map((r, i) => (
                <Reveal key={r.id} delay={(i % PAGE_SIZE) * 0.4}>
                  <motion.a
                    href={toRanking(r.slug)}
                    whileHover="hover"
                    className="group grid grid-cols-12 items-center gap-4 border-b border-ink/15 py-5"
                  >
                    <div className="col-span-1 display text-2xl font-light italic text-ink-mute num-tabular">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="col-span-11 md:col-span-6">
                      <div className="display text-xl md:text-2xl font-light leading-tight transition-colors group-hover:text-accent">
                        {r.title}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.16em] text-ink-mute">
                        <span>{r.category}</span>
                        <span>·</span>
                        <span>{r.tested} tested</span>
                        <span>·</span>
                        <span>{r.readingTime} min</span>
                      </div>
                    </div>
                    <div className="hidden md:block md:col-span-3">
                      <ScoreBar score={r.products[0].score} />
                      <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.14em] text-ink-mute">
                        Winner score
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-2 md:text-right">
                      <motion.span
                        variants={{ hover: { x: 6 } }}
                        transition={{ duration: 0.3 }}
                        className="inline-flex items-center gap-1 text-[12px] text-ink-soft"
                      >
                        Read <span>→</span>
                      </motion.span>
                    </div>
                  </motion.a>
                </Reveal>
              ))}
            </div>

            {visible < sorted.length && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="group inline-flex items-center gap-2 rounded-full border border-ink/40 px-6 py-2.5 text-[13px] font-medium text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <span>Show more</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                </button>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink-mute">
                  {Math.min(PAGE_SIZE, sorted.length - visible)} more of {sorted.length - visible} remaining
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
