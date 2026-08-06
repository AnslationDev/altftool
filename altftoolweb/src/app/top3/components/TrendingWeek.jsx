"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Container, Reveal, Kicker } from "./ui";
import { trending, rankings } from "../data/content";
import { toCatalog, toRanking } from "../router";

export function TrendingWeek() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  const enriched = trending.map((t) => {
    const r = rankings.find((x) => x.slug === t.slug) || rankings[0];
    return { ...t, ranking: r };
  });

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink py-24 text-paper md:py-32">
      {/* Background huge text */}
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap"
      >
        <div className="display text-[22vw] font-light italic leading-none text-paper/[0.04]">
          trending · trending · trending ·
        </div>
      </motion.div>

      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <Reveal>
              <Kicker className="text-paper/60">
                <span className="inline-block h-px w-6 bg-paper/60" />
                Trending this week
              </Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,5.5vw,72px)] font-light leading-[1.02] tracking-[-0.02em]">
                What readers are <em className="italic text-accent-soft">actually</em>
                <br />opening twice.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2} className="hidden md:block">
            <a href={toCatalog()} className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-5 py-2.5 text-[13px] transition hover:border-paper hover:bg-paper hover:text-ink">
              Full trending list →
            </a>
          </Reveal>
        </div>

        {/* List */}
        <div className="mt-16 border-t border-paper/15">
          {enriched.map((t, i) => (
            <Reveal key={t.slug} delay={i * 0.5}>
              <motion.a
                href={toRanking(t.ranking.slug)}
                whileHover="hover"
                className="group grid grid-cols-12 items-center gap-4 border-b border-paper/15 py-6 md:py-8"
              >
                <div className="col-span-2 md:col-span-1">
                  <div className="display text-3xl md:text-4xl font-light italic text-accent-soft num-tabular">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="col-span-10 md:col-span-5">
                  <div className="display text-xl md:text-3xl font-light leading-tight transition-transform duration-500 group-hover:translate-x-2">
                    {t.ranking.title}
                  </div>
                  <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-paper/50">
                    {t.ranking.category} · updated {new Date(t.ranking.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div className="col-span-6 md:col-span-3 hidden md:block text-sm text-paper/70 line-clamp-2">
                  {t.ranking.summary.slice(0, 100)}…
                </div>
                <div className="col-span-4 md:col-span-2 text-right">
                  <div className="display text-xl font-light text-emerald-300 num-tabular">{t.delta}</div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-paper/50">{t.views} views</div>
                </div>
                <div className="col-span-2 md:col-span-1 text-right">
                  <motion.span
                    variants={{ hover: { x: 6 } }}
                    transition={{ duration: 0.3 }}
                    className="inline-block text-2xl"
                  >
                    →
                  </motion.span>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
