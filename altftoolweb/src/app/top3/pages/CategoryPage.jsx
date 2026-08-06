"use client";

import { motion } from "framer-motion";
import { Container, Reveal, Kicker } from "../components/ui";
import {
  getCategoryBySlug,
  getRankingsByCategory,
  getAllCategories,
  getCategoryCount,
  formatShortDate,
} from "../data/queries";
import { toCatalog, toCategory, toRanking } from "../router";
import { NotFound } from "./NotFound";

export function CategoryPage({ slug }) {
  const category = getCategoryBySlug(slug);

  if (!category) return <NotFound label={`category “${slug}”`} />;

  const items = getRankingsByCategory(category.name);
  const others = getAllCategories().filter((c) => c.id !== category.id);
  const tested = items.reduce((total, r) => total + r.tested, 0);

  return (
    <div>
      {/* Header */}
      <header className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${category.tone} opacity-[0.07]`}
        />
        <Container className="relative">
          <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
            <a href={toCatalog()} className="transition hover:text-ink">Catalog</a>
            <span>/</span>
            <span className="text-ink">{category.name}</span>
          </nav>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-10">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                className="display text-6xl font-light italic text-accent"
              >
                {category.symbol}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                className="display mt-5 text-[clamp(40px,7vw,96px)] font-light leading-[0.98] tracking-[-0.03em]"
              >
                {category.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.18 }}
                className="mt-5 max-w-lg text-[17px] leading-[1.6] text-ink-soft"
              >
                {category.tagline}
              </motion.p>
            </div>

            <motion.dl
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.26 }}
              className="grid grid-cols-3 gap-8 border-t border-ink/15 pt-5"
            >
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                  Rankings
                </dt>
                <dd className="display text-3xl font-light num-tabular">{items.length}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                  Products tested
                </dt>
                <dd className="display text-3xl font-light num-tabular">{tested}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                  Picks published
                </dt>
                <dd className="display text-3xl font-light num-tabular">{items.length * 3}</dd>
              </div>
            </motion.dl>
          </div>
        </Container>
      </header>

      {/* Rankings in this category */}
      <section className="border-t border-ink/15 py-16 md:py-24">
        <Container>
          <Reveal>
            <Kicker>Rankings in {category.name}</Kicker>
          </Reveal>

          <div className="mt-12 space-y-8">
            {items.map((r, i) => (
              <Reveal key={r.id} delay={i}>
                <a
                  href={toRanking(r.slug)}
                  className="group grid gap-6 rounded-sm border border-ink/15 p-5 transition-colors hover:border-ink/40 md:grid-cols-12 md:gap-10 md:p-7"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-paper-soft md:col-span-4 md:aspect-[4/3]">
                    {r.products[0].image ? (
                      <img
                        src={r.products[0].image}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                          r.coverGradient || "from-ink to-ink-soft"
                        }`}
                      >
                        <span className="display text-5xl font-light italic text-paper/40">3</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8">
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                      <span>Updated {formatShortDate(r.updatedAt)}</span>
                      <span className="h-3 w-px bg-ink/20" />
                      <span>{r.tested} tested</span>
                      <span className="h-3 w-px bg-ink/20" />
                      <span>{r.readingTime} min</span>
                    </div>

                    <h2 className="display mt-3 text-[clamp(22px,2.6vw,36px)] font-light leading-[1.08] tracking-[-0.01em] group-hover:text-accent">
                      {r.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[14px] leading-[1.65] text-ink-soft">
                      {r.summary}
                    </p>

                    <ol className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                      {r.products.map((p) => (
                        <li key={p.id} className="flex items-baseline gap-2">
                          <span className="display text-lg font-light italic text-accent">
                            {p.rank}
                          </span>
                          <span className="text-[13px] text-ink">{p.name}</span>
                          <span className="font-mono text-[11px] text-ink-mute num-tabular">
                            {p.score.toFixed(1)}
                          </span>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-5 flex items-center justify-between text-[12px] text-ink-mute">
                      <span>By {r.author}</span>
                      <span className="font-medium text-ink transition-transform duration-300 group-hover:translate-x-1">
                        Read the ranking →
                      </span>
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Other categories */}
      <section className="border-t border-ink/15 bg-paper-soft py-16 md:py-20">
        <Container>
          <Reveal>
            <Kicker>Browse other categories</Kicker>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {others.map((c) => (
              <a
                key={c.id}
                href={toCategory(c.slug)}
                className="group inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-[13px] transition hover:border-ink hover:bg-ink hover:text-paper"
              >
                <span className="text-accent group-hover:text-accent-soft">{c.symbol}</span>
                {c.name}
                <span className="font-mono text-[10px] opacity-60 num-tabular">
                  {getCategoryCount(c.name)}
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
