"use client";

import { motion } from "framer-motion";
import { Container, Reveal, Kicker, Button } from "./ui";
import { rankings } from "../data/content";
import { toCatalog, toRanking } from "../router";

export function FeaturedRankings() {
  const hero = rankings.slice(0, 3);

  return (
    <section id="featured" className="relative py-24 md:py-32">
      <Container>
        <div className="flex items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <Kicker>Featured Rankings</Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,5.5vw,72px)] font-light leading-[1.02] tracking-[-0.02em]">
                This week's most-
                <br />
                <em className="italic">considered</em> picks.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2} className="hidden md:block">
            <Button href={toCatalog()} variant="ghost">Browse the full catalog</Button>
          </Reveal>
        </div>

        {/* Three big cards, asymmetric grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-12 md:gap-8">
          {hero.map((r, i) => {
            const spanClass = ["md:col-span-7", "md:col-span-5", "md:col-span-12"][i];
            const aspect = ["aspect-[4/5]", "aspect-[4/5]", "aspect-[16/9]"][i];
            return (
              <Reveal
                key={r.id}
                delay={i}
                className={spanClass}
              >
                <motion.a
                  href={toRanking(r.slug)}
                  whileHover="hover"
                  className="group relative block overflow-hidden rounded-sm bg-paper-soft"
                >
                  <div className={`relative ${aspect} w-full overflow-hidden img-shine`}>
                    {r.products[0].image ? (
                      <motion.img
                        src={r.products[0].image}
                        alt={r.title}
                        loading="lazy"
                        variants={{ hover: { scale: 1.05 } }}
                        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${r.coverGradient || "from-ink to-ink-soft"}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      <span className="rounded-full bg-paper/95 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
                        {r.category}
                      </span>
                      <span className="rounded-full bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper">
                        № {String(r.popularity).padStart(2, "0")}
                      </span>
                    </div>
                    {i === 2 && (
                      <div className="absolute bottom-6 right-6">
                        <div className="display text-[120px] md:text-[180px] font-light italic text-paper/30 leading-none">3</div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="display text-[clamp(22px,2.4vw,34px)] font-light leading-[1.1] tracking-[-0.01em]">
                        {r.title}
                      </h3>
                      <span className="hidden md:inline font-mono text-[11px] text-ink-mute num-tabular whitespace-nowrap">
                        {r.tested} tested
                      </span>
                    </div>
                    <p className="mt-3 max-w-xl text-[14px] leading-[1.6] text-ink-soft">
                      {r.summary}
                    </p>
                    <div className="mt-5 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.16em] text-ink-mute">
                      <span>{r.author} · {r.authorRole}</span>
                      <span>{r.readingTime} min read</span>
                    </div>
                  </div>
                </motion.a>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
