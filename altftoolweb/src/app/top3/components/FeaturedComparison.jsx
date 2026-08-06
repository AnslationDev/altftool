"use client";

import { Container, Reveal, Kicker, RankDigit, Button } from "./ui";
import { rankings, featuredComparisonId } from "../data/content";
import { toRanking } from "../router";

export function FeaturedComparison() {
  const r = rankings.find((x) => x.id === featuredComparisonId);
  const [first, second, third] = r.products;

  return (
    <section className="relative bg-ink py-24 text-paper md:py-32">
      <Container>
        <div className="flex items-end justify-between gap-8 border-b border-paper/15 pb-10">
          <div className="max-w-2xl">
            <Reveal>
              <Kicker className="text-paper/60">
                <span className="inline-block h-px w-6 bg-paper/60" />
                Featured Comparison · Deep Dive
              </Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,5.5vw,72px)] font-light leading-[1.02] tracking-[-0.02em]">
                {r.title}.
                <br />
                <span className="italic text-paper/60">Side by side.</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-paper/75">
                {r.summary}
              </p>
            </Reveal>
          </div>
          <Reveal delay={2} className="hidden md:block text-right">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
              Methodology
            </div>
            <div className="display mt-1 text-xl font-light italic">120 hours</div>
            <div className="mt-1 font-mono text-[11px] text-paper/60 num-tabular">
              {r.tested} models · {r.readingTime} min read
            </div>
          </Reveal>
        </div>

        {/* Three-column comparison */}
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-0">
          {[first, second, third].map((p, i) => {
            const isWinner = i === 0;
            return (
              <Reveal key={p.id} delay={i}>
                <div
                  className={`relative h-full border border-paper/15 ${
                    isWinner ? "md:-mt-8 md:mb-8 bg-paper/[0.03] border-paper/30" : ""
                  } p-6 md:p-8`}
                >
                  {isWinner && (
                    <div className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
                      Our pick
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <RankDigit rank={p.rank} className="text-paper/30" />
                    <div className="text-right">
                      <div className="display text-4xl font-light num-tabular">{p.score.toFixed(1)}</div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-paper/50">Score</div>
                    </div>
                  </div>

                  <div className="mt-8 aspect-[4/3] w-full overflow-hidden rounded-sm bg-paper/5">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-paper/30">
                        <span className="display text-6xl italic">{p.maker[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-paper/50">
                      {p.maker}
                    </div>
                    <div className="display mt-1 text-2xl font-light">{p.name}</div>
                    <p className="mt-2 text-[13px] text-paper/70">{p.tagline}</p>
                  </div>

                  <div className="mt-6 flex items-baseline justify-between border-t border-paper/10 pt-4">
                    <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-paper/50">Price</div>
                    <div className="display text-xl font-light num-tabular">{p.price}</div>
                  </div>

                  <p className="mt-6 text-[13px] leading-[1.6] text-paper/80 italic">
                    "{p.verdict}"
                  </p>

                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-300/80">Pros</div>
                      <ul className="mt-2 space-y-1 text-[12px] text-paper/85">
                        {p.pros.map((x) => <li key={x} className="flex gap-2"><span className="text-emerald-300/80">+</span>{x}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-paper/50">Caveats</div>
                      <ul className="mt-2 space-y-1 text-[12px] text-paper/70">
                        {p.cons.map((x) => <li key={x} className="flex gap-2"><span>−</span>{x}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-paper/10 pt-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-paper/50 mb-3">Specifications</div>
                    <dl className="space-y-1.5 text-[12px]">
                      {p.specs.map((s) => (
                        <div key={s.label} className="flex justify-between gap-4">
                          <dt className="text-paper/60">{s.label}</dt>
                          <dd className="text-paper/90 num-tabular text-right">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <a
                    href={toRanking(r.slug)}
                    className="mt-8 inline-flex items-center gap-2 text-[12px] font-medium text-paper transition hover:text-accent-soft"
                  >
                    Read full review →
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-12 flex items-center justify-between border-t border-paper/15 pt-6 text-[11px] font-mono uppercase tracking-[0.18em] text-paper/50">
            <span>By {r.author} · {r.authorRole}</span>
            <span>Last verified {new Date(r.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-8 flex justify-center">
            <Button variant="dark" href={toRanking(r.slug)}>Read the full ranking</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
