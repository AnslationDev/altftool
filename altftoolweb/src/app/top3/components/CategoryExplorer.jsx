"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Container, Reveal, Kicker } from "./ui";
import { categories } from "../data/content";
import { getRankingsByCategory } from "../data/queries";
import { toCategory, toCatalog } from "../router";

export function CategoryExplorer() {
  const [active, setActive] = useState(null);

  return (
    <section id="categories" className="relative bg-paper-soft py-24 md:py-32">
      <Container>
        <div className="flex items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <Kicker>Interactive Category Explorer</Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,5.5vw,72px)] font-light leading-[1.02] tracking-[-0.02em]">
                Nineteen fields. <em className="italic">One standard.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2} className="hidden md:block text-right text-[13px] text-ink-soft max-w-xs">
            Every category uses the same methodology framework: longlist → screen → test → live → rank → publish → revisit. Hover a tile to preview.
          </Reveal>
        </div>

        <Reveal delay={2}>
          <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
            {categories.map((c, i) => {
              const isActive = active === c.id;
              const topics = getRankingsByCategory(c.name);
              return (
                <motion.a
                  key={c.id}
                  href={toCategory(c.slug)}
                  onMouseEnter={() => setActive(c.id)}
                  onMouseLeave={() => setActive(null)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5% 0px" }}
                  transition={{ duration: 0.6, delay: i * 0.02, ease: [0.2, 0.7, 0.2, 1] }}
                  whileHover={{ y: -4 }}
                  className={`group relative aspect-[4/5] overflow-hidden rounded-sm border ${
                    isActive ? "border-ink" : "border-ink/15"
                  } bg-paper transition-colors`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.tone} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative flex h-full flex-col justify-between p-5 text-ink transition-colors duration-500 group-hover:text-paper">
                    <div className="flex items-start justify-between">
                      <span className="display text-4xl font-light italic opacity-80">{c.symbol}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-60 num-tabular">
                        {String(topics.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <div className="display text-xl font-light leading-tight">{c.name}</div>
                      <div className="mt-2 h-px w-6 bg-ink/30 transition-all duration-500 group-hover:w-full group-hover:bg-paper/60" />
                      <div className="mt-3 text-[11px] leading-snug opacity-70 line-clamp-2">
                        {c.tagline}
                      </div>
                      <div className="mt-3 max-h-0 overflow-hidden space-y-1 opacity-0 transition-all duration-500 group-hover:max-h-16 group-hover:opacity-100">
                        {topics.map((topic) => (
                          <div key={topic.id} className="truncate text-[10px] font-mono uppercase tracking-[0.08em] opacity-80">
                            {topic.title.replace("The 3 Best ", "")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </Reveal>

        {/* Footer row */}
        <div className="mt-10 flex items-center justify-between border-t border-ink/15 pt-6 text-[11px] font-mono uppercase tracking-[0.18em] text-ink-mute">
          <span>{categories.length} categories</span>
          <a href={toCatalog()} className="transition hover:text-ink">
            Browse the full catalog →
          </a>
          <span className="hidden sm:inline">Updated March 8, 2026</span>
        </div>
      </Container>
    </section>
  );
}
