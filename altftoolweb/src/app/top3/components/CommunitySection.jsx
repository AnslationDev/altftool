"use client";

import { motion } from "framer-motion";
import { Container, Reveal, Kicker } from "./ui";
import { readerFavorites, recentlyUpdated, rankings } from "../data/content";
import { toRanking } from "../router";

// ============================================================================
// Community section — Reader Favorites (left) + Recently Updated (right)
// Two different layouts sharing a section.
// ============================================================================

export function CommunitySection() {
  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <Reveal>
          <Kicker>Community & Change Log</Kicker>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="display mt-5 max-w-3xl text-[clamp(36px,5.5vw,72px)] font-light leading-[1.02] tracking-[-0.02em]">
            Readers vote. <em className="italic">We re-test.</em>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Reader Favorites — poll style */}
          <div className="md:col-span-6">
            <Reveal>
              <div className="mb-6 flex items-baseline justify-between">
                <div className="display text-2xl font-light italic">Reader Favorites</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                  {readerFavorites.reduce((a, f) => a + parseInt(f.votes.replace(/,/g, "")), 0).toLocaleString()} votes · Q1 2026
                </div>
              </div>
            </Reveal>
            <div className="space-y-3">
              {readerFavorites.map((f, i) => {
                const votes = parseInt(f.votes.replace(/,/g, ""));
                const maxVotes = parseInt(readerFavorites[0].votes.replace(/,/g, ""));
                const pct = (votes / maxVotes) * 100;
                const target = rankings.find((r) =>
                  r.products.some((p) => p.name === f.winner)
                );
                return (
                  <Reveal key={f.title} delay={i * 0.5}>
                    <motion.a
                      href={target ? toRanking(target.slug) : "#/catalog"}
                      whileHover={{ x: 4 }}
                      className="group relative block overflow-hidden rounded-sm border border-ink/15 bg-paper p-5 transition-colors hover:border-ink/40"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-accent/10"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center justify-between gap-6">
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                            {f.title}
                          </div>
                          <div className="display mt-1 text-xl font-light">
                            {f.winner}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="display text-2xl font-light num-tabular">{f.votes}</div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink-mute">votes</div>
                        </div>
                      </div>
                    </motion.a>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={2}>
              <p className="mt-6 text-[13px] text-ink-soft">
                Reader votes inform what we re-test — they do not change rankings directly.
                Rankings change only after testing confirms them.
              </p>
            </Reveal>
          </div>

          {/* Recently Updated — changelog style */}
          <div className="md:col-span-6">
            <Reveal>
              <div className="mb-6 flex items-baseline justify-between">
                <div className="display text-2xl font-light italic">Recently Updated</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                  Last 28 days
                </div>
              </div>
            </Reveal>
            <div className="relative">
              {/* vertical timeline */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-ink/15" />
              <ul className="space-y-6">
                {recentlyUpdated.map((u, i) => {
                  const r = rankings.find((x) => x.id === u.id);
                  if (!r) return null;
                  return (
                    <Reveal key={u.id} delay={i * 0.5}>
                      <li className="relative pl-8">
                        <div className="absolute left-0 top-[10px] h-[11px] w-[11px] rounded-full border-2 border-paper bg-accent" />
                        <div className="flex items-baseline justify-between gap-4">
                          <a href={toRanking(r.slug)} className="display text-lg font-light leading-tight hover:text-accent">
                            {r.title}
                          </a>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute whitespace-nowrap">
                            {u.delta}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] text-ink-soft">{u.note}</p>
                      </li>
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
