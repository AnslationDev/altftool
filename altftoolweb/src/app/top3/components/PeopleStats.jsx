"use client";

import { motion } from "framer-motion";
import { Container, Reveal, Kicker } from "./ui";
import { experts, stats } from "../data/content";

// ============================================================================
// Experts + Statistics — two layouts in one section.
// ============================================================================

export function PeopleStats() {
  return (
    <section id="experts" className="relative py-24 md:py-32">
      <Container>
        {/* Experts */}
        <div className="flex items-end justify-between gap-8">
          <div className="max-w-xl">
            <Reveal>
              <Kicker>Meet our experts</Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(32px,4.2vw,56px)] font-light leading-[1.02] tracking-[-0.02em]">
                Editors who <em className="italic">actually use</em> what they review.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2} className="hidden md:block text-right text-[13px] text-ink-soft max-w-xs">
            Every byline belongs to a person who has worked in the field they cover.
            No freelancers, no guest posts.
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((e, i) => (
            <Reveal key={e.name} delay={i}>
              <motion.article
                whileHover="hover"
                className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-ink/15 bg-paper p-7 transition-colors hover:border-ink/40"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-ink via-ink-soft to-accent">
                    <div className="absolute inset-0 flex items-center justify-center display text-lg text-paper">
                      {e.initials}
                    </div>
                  </div>
                  <div>
                    <div className="display text-lg font-light leading-tight">{e.name}</div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-accent">
                      {e.role}
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-[13px] leading-[1.6] text-ink-soft">{e.bio}</p>
                <div className="mt-6 border-t border-ink/10 pt-4 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.14em] text-ink-mute">
                  <span>{e.focus}</span>
                  <span className="num-tabular">{e.years} yrs</span>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>

        {/* Statistics band */}
        <div className="mt-28 border-y border-ink/15 py-16">
          <Reveal>
            <Kicker>By the numbers</Kicker>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-6">
            {[
              { n: stats.rankingsPublished, l: "Rankings published", sfx: "" },
              { n: stats.productsTested, l: "Products tested", sfx: "" },
              { n: stats.hoursOfTesting / 1000, l: "Thousand testing hours", sfx: "k" },
              { n: stats.categoriesCovered, l: "Categories", sfx: "" },
              { n: stats.yearsRunning, l: "Years independent", sfx: "" },
              { n: stats.readerSurveys, l: "Reader surveys", sfx: "" },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i}>
                <CountUp target={s.n} suffix={s.sfx} />
                <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.14em] text-ink-mute">
                  {s.l}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function CountUp({ target, suffix = "" }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="display block text-[clamp(36px,5vw,64px)] font-light leading-none num-tabular"
    >
      <motion.span
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {typeof target === "number" && target % 1 !== 0
          ? target.toFixed(1)
          : target.toLocaleString()}
        {suffix}
      </motion.span>
    </motion.span>
  );
}
