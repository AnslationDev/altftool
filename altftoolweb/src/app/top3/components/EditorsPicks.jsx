"use client";

import { motion } from "framer-motion";
import { Container, Reveal, Kicker, Button } from "./ui";
import { rankings, editorsPickIds } from "../data/content";
import { toCatalog, toRanking } from "../router";

export function EditorsPicks() {
  const picks = editorsPickIds
    .map((id) => rankings.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Left column — editorial intro */}
          <div className="md:col-span-4 md:sticky md:top-28 self-start">
            <Reveal>
              <Kicker>Editor's Picks · March 2026</Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,4.2vw,56px)] font-light leading-[1.02] tracking-[-0.02em]">
                The four we kept coming back to this month.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 text-[15px] leading-[1.7] text-ink-soft">
                Each month the editors nominate the rankings that surprised us — because
                a winner changed, a category shifted, or a newcomer earned its spot on
                merit. These four made the cut.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["NO", "SK", "HT", "LM"].map((i, k) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-paper bg-ink text-[10px] font-medium text-paper"
                      style={{ zIndex: 4 - k }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-mute">
                  4 editors
                  <br />· 4 picks
                </div>
              </div>
            </Reveal>
            <Reveal delay={4}>
              <Button href={toCatalog()} variant="ghost" className="mt-8">See the full archive</Button>
            </Reveal>
          </div>

          {/* Right column — stacked editorial cards */}
          <div className="md:col-span-8 space-y-10">
            {picks.map((r, i) => (
              <Reveal key={r.id} delay={i}>
                <motion.a
                  href={toRanking(r.slug)}
                  whileHover="hover"
                  className="group block"
                >
                  <article className={`grid gap-6 md:gap-10 ${i % 2 === 0 ? "md:grid-cols-[1.1fr_1fr]" : "md:grid-cols-[1fr_1.1fr]"}`}>
                    <div className={`${i % 2 === 1 ? "md:order-2" : ""} relative aspect-[4/3] overflow-hidden rounded-sm bg-paper-soft img-shine`}>
                      {r.products[0].image ? (
                        <motion.img
                          src={r.products[0].image}
                          alt={r.title}
                          loading="lazy"
                          variants={{ hover: { scale: 1.06 } }}
                          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-ink to-ink-soft" />
                      )}
                      <div className="absolute top-4 left-4 display text-5xl font-light italic text-paper drop-shadow-md">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-accent">
                        {r.category}
                      </div>
                      <h3 className="display mt-3 text-[clamp(24px,2.8vw,40px)] font-light leading-[1.1] tracking-[-0.01em] transition-colors group-hover:text-accent">
                        {r.title}
                      </h3>
                      <p className="mt-4 text-[15px] leading-[1.65] text-ink-soft">
                        {r.summary}
                      </p>
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-mute">
                        <span>Winner · <span className="text-ink">{r.products[0].name}</span></span>
                        <span className="h-3 w-px bg-ink/20" />
                        <span>{r.tested} products tested</span>
                        <span className="h-3 w-px bg-ink/20" />
                        <span>{r.readingTime} min</span>
                      </div>
                    </div>
                  </article>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
