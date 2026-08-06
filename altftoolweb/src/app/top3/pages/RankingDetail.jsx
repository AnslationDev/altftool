"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Container, Reveal, Kicker, Button } from "../components/ui";
import { testPipeline } from "../data/content";
import {
  getRankingBySlug,
  getRelatedRankings,
  getCategoryByName,
  formatLongDate,
  rankLabel,
  specMatrix,
} from "../data/queries";
import { toCatalog, toCategory, toRanking, scrollToId } from "../router";
import { NotFound } from "./NotFound";

export function RankingDetail({ slug }) {
  const ranking = getRankingBySlug(slug);
  const progressRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: progressRef });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  if (!ranking) {
    return <NotFound label={`ranking “${slug}”`} />;
  }

  const category = getCategoryByName(ranking.category);
  const related = getRelatedRankings(ranking, 3);
  const matrix = specMatrix(ranking);
  const [winner] = ranking.products;
  const averageScore =
    ranking.products.reduce((total, p) => total + p.score, 0) / ranking.products.length;

  return (
    <article ref={progressRef}>
      {/* Reading progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-16 z-40 h-[2px] origin-left bg-accent"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Editorial masthead                                                */}
      {/* ---------------------------------------------------------------- */}
      <header className="relative pt-28 pb-14 md:pt-36 md:pb-20 paper-grain">
        <Container>
          <nav className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
            <a href={toCatalog()} className="transition hover:text-ink">Catalog</a>
            <span>/</span>
            <a
              href={category ? toCategory(category.slug) : toCatalog()}
              className="transition hover:text-ink"
            >
              {ranking.category}
            </a>
            <span>/</span>
            <span className="text-ink">{ranking.title.replace("The 3 Best ", "")}</span>
          </nav>

          <div className="mt-10 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-8">
              <motion.h1
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                className="display text-[clamp(38px,6.4vw,86px)] font-light leading-[0.98] tracking-[-0.03em]"
              >
                {ranking.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.12, ease: [0.2, 0.7, 0.2, 1] }}
                className="mt-7 max-w-2xl text-[17px] leading-[1.65] text-ink-soft"
              >
                {ranking.summary}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.28 }}
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink/15 pt-5 text-[12px] text-ink-mute"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-paper">
                    {ranking.author.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <span className="text-ink">{ranking.author}</span> · {ranking.authorRole}
                </span>
                <span className="h-3 w-px bg-ink/20" />
                <span>Updated {formatLongDate(ranking.updatedAt)}</span>
                <span className="h-3 w-px bg-ink/20" />
                <span>{ranking.readingTime} min read</span>
                <span className="h-3 w-px bg-ink/20" />
                <span className="num-tabular">{ranking.tested} products tested</span>
              </motion.div>
            </div>

            {/* At a glance */}
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
              className="md:col-span-4"
            >
              <div className="rounded-sm border border-ink/15 bg-paper-soft/60 p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
                  At a glance
                </div>
                <ol className="mt-5 space-y-4">
                  {ranking.products.map((p) => (
                    <li key={p.id} className="flex items-start gap-3">
                      <span className="display text-2xl font-light italic text-accent leading-none">
                        {p.rank}
                      </span>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => scrollToId(`product-${p.id}`)}
                          className="display block max-w-full truncate text-left text-lg font-light leading-tight hover:text-accent"
                        >
                          {p.name}
                        </button>
                        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink-mute">
                          {rankLabel(p.rank)} · {p.price}
                        </div>
                      </div>
                      <span className="ml-auto display text-lg font-light num-tabular">
                        {p.score.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/15 pt-4">
                  <div>
                    <div className="display text-xl font-light num-tabular">
                      {averageScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-ink-mute">
                      Average score
                    </div>
                  </div>
                  <div>
                    <div className="display text-xl font-light num-tabular">
                      {ranking.popularity}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-ink-mute">
                      Popularity index
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </Container>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Winner hero image                                                 */}
      {/* ---------------------------------------------------------------- */}
      <Container>
        <motion.figure
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative aspect-[21/9] w-full overflow-hidden rounded-sm bg-paper-soft"
        >
          {winner.image ? (
            <img
              src={winner.image}
              alt={winner.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                winner.gradient || "from-ink to-ink-soft"
              }`}
            >
              <span className="display text-[16vw] font-light italic leading-none text-paper/25">
                {winner.maker}
              </span>
            </div>
          )}
          <figcaption className="absolute bottom-0 left-0 flex items-center gap-3 bg-paper px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em]">
            <span className="text-accent">Our pick</span>
            <span className="h-3 w-px bg-ink/20" />
            <span>{winner.name}</span>
          </figcaption>
        </motion.figure>
      </Container>

      {/* ---------------------------------------------------------------- */}
      {/* The short answer                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <Container>
          <Reveal>
            <Kicker>The short answer</Kicker>
          </Reveal>
          <div className="mt-10 grid gap-px bg-ink/15 md:grid-cols-3">
            {ranking.products.map((p, i) => (
              <Reveal key={p.id} delay={i}>
                <button
                  type="button"
                  onClick={() => scrollToId(`product-${p.id}`)}
                  className="group flex h-full w-full flex-col bg-paper p-7 text-left transition-colors hover:bg-paper-soft"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      {rankLabel(p.rank)}
                    </span>
                    <span className="display text-3xl font-light italic text-ink/25">
                      {p.rank}
                    </span>
                  </div>
                  <h3 className="display mt-4 text-2xl font-light leading-tight group-hover:text-accent">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-[13px] text-ink-mute">{p.maker} · {p.price}</p>
                  <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">{p.tagline}</p>
                  <span className="mt-auto pt-6 text-[12px] font-medium text-ink transition-transform duration-300 group-hover:translate-x-1">
                    Jump to review →
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Full reviews                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-ink/15 py-20 md:py-28">
        <Container>
          <Reveal>
            <Kicker>The reviews in full</Kicker>
          </Reveal>

          <div className="mt-14 space-y-24 md:space-y-32">
            {ranking.products.map((p, i) => (
              <div key={p.id} id={`product-${p.id}`} className="scroll-mt-24">
                <div
                  className={`grid gap-10 md:grid-cols-12 md:gap-12 ${
                    i % 2 === 1 ? "md:[&>figure]:order-2" : ""
                  }`}
                >
                  {/* Image */}
                  <Reveal className="md:col-span-5">
                    <figure className="relative aspect-[4/5] overflow-hidden rounded-sm bg-paper-soft img-shine">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                            p.gradient || "from-ink to-ink-soft"
                          }`}
                        >
                          <span className="display px-6 text-center text-4xl font-light italic leading-tight text-paper/70">
                            {p.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-paper">
                        <span className="display text-3xl font-light italic text-accent">
                          {p.rank}
                        </span>
                      </div>
                    </figure>
                  </Reveal>

                  {/* Copy */}
                  <Reveal delay={1} className="md:col-span-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                          {rankLabel(p.rank)} · {p.maker}
                        </div>
                        <h3 className="display mt-2 text-[clamp(28px,4vw,52px)] font-light leading-[1.02] tracking-[-0.02em]">
                          {p.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="display text-4xl font-light num-tabular">
                          {p.score.toFixed(1)}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                          out of 10
                        </div>
                      </div>
                    </div>

                    <p className="display mt-6 text-[clamp(18px,2vw,24px)] font-light italic leading-[1.45] text-ink-soft">
                      “{p.verdict}”
                    </p>

                    <p className="mt-5 text-[15px] leading-[1.7] text-ink-soft">
                      {p.tagline} Our reviewers logged repeat sessions with the {p.name} across
                      the full test protocol before scoring, and re-checked the result against
                      the {ranking.tested} other candidates in this category.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-6 border-y border-ink/15 py-4">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                          Price
                        </div>
                        <div className="display text-xl font-light num-tabular">{p.price}</div>
                      </div>
                      <div className="h-8 w-px bg-ink/15" />
                      <div className="min-w-[120px] flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                          Score
                        </div>
                        <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(p.score / 10) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
                            className="h-full bg-ink"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-8 sm:grid-cols-2">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-moss">
                          What we liked
                        </div>
                        <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
                          {p.pros.map((x) => (
                            <li key={x} className="flex gap-2">
                              <span className="text-moss">+</span>
                              {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                          Worth knowing
                        </div>
                        <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
                          {p.cons.map((x) => (
                            <li key={x} className="flex gap-2">
                              <span className="text-ink-mute">−</span>
                              {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-ink/15 sm:grid-cols-4">
                      {p.specs.map((s) => (
                        <div key={s.label} className="bg-paper p-4">
                          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                            {s.label}
                          </dt>
                          <dd className="mt-1 text-[13px] leading-snug text-ink">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Comparison table                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-ink py-20 text-paper md:py-28">
        <Container>
          <Reveal>
            <Kicker className="text-paper/60">
              <span className="inline-block h-px w-6 bg-paper/60" />
              Side by side
            </Kicker>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="display mt-5 max-w-2xl text-[clamp(28px,4vw,52px)] font-light leading-[1.05] tracking-[-0.02em]">
              Every measurement, in one table.
            </h2>
          </Reveal>

          <Reveal delay={2}>
            <div className="mt-12 overflow-x-auto" data-lenis-prevent>
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-paper/25">
                    <th className="w-40 py-4 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-paper/50">
                      Specification
                    </th>
                    {ranking.products.map((p) => (
                      <th key={p.id} className="py-4 pr-4 align-bottom">
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-soft">
                          № {p.rank}
                        </div>
                        <div className="display mt-1 text-lg font-light">{p.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-paper/10">
                    <td className="py-4 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">
                      Score
                    </td>
                    {ranking.products.map((p) => (
                      <td key={p.id} className="py-4 pr-4">
                        <span className="display text-2xl font-light num-tabular">
                          {p.score.toFixed(1)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-paper/10">
                    <td className="py-4 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">
                      Price
                    </td>
                    {ranking.products.map((p) => (
                      <td key={p.id} className="py-4 pr-4 text-[14px] num-tabular">
                        {p.price}
                      </td>
                    ))}
                  </tr>
                  {matrix.map((row) => (
                    <tr key={row.label} className="border-b border-paper/10">
                      <td className="py-4 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">
                        {row.label}
                      </td>
                      {row.values.map((value, idx) => (
                        <td key={idx} className="py-4 pr-4 text-[14px] text-paper/85">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-4 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">
                      Verdict
                    </td>
                    {ranking.products.map((p) => (
                      <td key={p.id} className="py-4 pr-4 text-[13px] italic text-paper/70">
                        {p.tagline}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How this ranking was tested                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal>
                <Kicker>How this ranking was made</Kicker>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="display mt-5 text-[clamp(28px,3.4vw,44px)] font-light leading-[1.05] tracking-[-0.02em]">
                  {ranking.tested} candidates. Three survivors.
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-5 text-[15px] leading-[1.7] text-ink-soft">
                  {ranking.author} ran this category through the standard Top3 protocol.
                  Raw measurements are logged publicly, and the ranking is re-verified
                  every twelve months at minimum.
                </p>
              </Reveal>
              <Reveal delay={3}>
                <Button href="#methodology" variant="outline" className="mt-7">
                  Read the full methodology
                </Button>
              </Reveal>
            </div>

            <div className="md:col-span-8">
              <ol className="grid gap-px bg-ink/15 sm:grid-cols-2">
                {testPipeline.map((step, i) => (
                  <Reveal key={step.step} delay={i * 0.4}>
                    <li className="h-full bg-paper p-6">
                      <div className="flex items-baseline gap-3">
                        <span className="display text-2xl font-light italic text-accent num-tabular">
                          {step.step}
                        </span>
                        <span className="display text-lg font-light">{step.name}</span>
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.6] text-ink-soft">
                        {step.detail}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Related                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-ink/15 py-20 md:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <Kicker>Keep reading</Kicker>
            </Reveal>
            <Reveal delay={1}>
              <a
                href={category ? toCategory(category.slug) : toCatalog()}
                className="link-underline text-[13px] text-ink-soft hover:text-ink"
              >
                All {ranking.category} rankings →
              </a>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.id} delay={i}>
                <a
                  href={toRanking(r.slug)}
                  className="group block h-full overflow-hidden rounded-sm border border-ink/15 transition-colors hover:border-ink/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-paper-soft">
                    {r.products[0].image ? (
                      <img
                        src={r.products[0].image}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`h-full w-full bg-gradient-to-br ${
                          r.coverGradient || "from-ink to-ink-soft"
                        }`}
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                      {r.category}
                    </div>
                    <h3 className="display mt-2 text-xl font-light leading-tight group-hover:text-accent">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-[12px] text-ink-mute">
                      Winner · {r.products[0].name}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </article>
  );
}
