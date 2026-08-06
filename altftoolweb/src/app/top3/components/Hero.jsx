"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Kicker } from "./ui";
import { Container } from "./ui";
import { categories, rankings, press } from "../data/content";
import { toCatalog, toRanking } from "../router";

function useTypewriter(delay = 500) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const line1Length = 14;
    const line2Length = 14;
    const totalLength = line1Length + line2Length;

    const run = () => {
      if (!isDeleting) {
        // Typing phase
        if (currentIndex < totalLength) {
          let nextDelay = 45 + Math.random() * 50;

          // Extra pauses for spaces
          if (currentIndex === 3 || currentIndex === 9 || currentIndex === 16) {
            nextDelay += 100;
          }
          // Pause at the end of Line 1
          if (currentIndex === line1Length - 1) {
            nextDelay = 650;
          }
          // Pause before final period
          if (currentIndex === totalLength - 2) {
            nextDelay = 180;
          }

          timer = setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
          }, nextDelay);
        } else {
          // Reached the end! Pause for 5 seconds (5000ms), then start deleting/reversing
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, 5000);
        }
      } else {
        // Deleting/reversing phase
        if (currentIndex > 0) {
          // Deleting is faster and very smooth
          const nextDelay = 15 + Math.random() * 20;

          timer = setTimeout(() => {
            setCurrentIndex((prev) => prev - 1);
          }, nextDelay);
        } else {
          // Fully deleted! Pause for 1 second, then start typing again
          timer = setTimeout(() => {
            setIsDeleting(false);
          }, 1000);
        }
      }
    };

    if (currentIndex === 0 && !isDeleting) {
      timer = setTimeout(run, delay);
    } else {
      run();
    }

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, delay]);

  return { currentIndex };
}

function TypewriterHeadline() {
  const { currentIndex } = useTypewriter(600);

  const line1Part1 = "The ".split("");
  const line1Part2 = "three".split("");
  const line1Part3 = " best".split("");
  const line2 = "of everything.".split("");

  return (
    <h1 className="display mt-6 text-[clamp(48px,8.5vw,128px)] font-light leading-[0.95] tracking-[-0.03em]">
      <span className="block relative">
        {line1Part1.map((c, i) => {
          const idx = i;
          const isVisible = idx < currentIndex;
          return (
            <span key={idx} className="relative">
              <span className={`transition-opacity duration-150 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
                {c}
              </span>
            </span>
          );
        })}

        <em className="italic font-normal text-accent relative">
          {line1Part2.map((c, i) => {
            const idx = 4 + i;
            const isVisible = idx < currentIndex;
            return (
              <span key={idx} className="relative">
                <span className={`transition-opacity duration-150 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
                  {c}
                </span>
              </span>
            );
          })}
        </em>

        {line1Part3.map((c, i) => {
          const idx = 9 + i;
          const isVisible = idx < currentIndex;
          return (
            <span key={idx} className="relative">
              <span className={`transition-opacity duration-150 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
                {c}
              </span>
            </span>
          );
        })}
      </span>

      <span className="block mt-2 relative">
        {line2.map((c, i) => {
          const idx = 14 + i;
          const isVisible = idx < currentIndex;
          return (
            <span key={idx} className="relative">
              <span className={`transition-opacity duration-150 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
                {c}
              </span>
            </span>
          );
        })}
      </span>
    </h1>
  );
}

export function Hero() {
  const featured = rankings.slice(0, 3);

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 paper-grain">
      {/* Faint top-left issue tag */}
      <Container wide className="relative">
        <div className="flex items-start justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-ink-mute">
          <div className="flex items-center gap-6">
            <span>Issue №{String(287).padStart(3, "0")}</span>
            <span className="hidden sm:inline">March 2026</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span>Est. 2019</span>
            <span>Editor-in-chief · E. Park</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <Kicker>A curated index, updated weekly</Kicker>
            </motion.div>

            <TypewriterHeadline />

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-8 max-w-xl text-[17px] leading-[1.6] text-ink-soft"
            >
              Top3 is an editorial guide to the three most worth your time, money, or
              attention across {categories.length} categories — tested, ranked, and
              re-verified by a team that would rather be wrong than vague.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button href={toCatalog()}>Explore this week's rankings</Button>
              <Button href="#methodology" variant="outline">How we choose the three</Button>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mt-16 grid grid-cols-3 gap-6 border-t border-ink/15 pt-6 max-w-lg"
            >
              {[
                { n: "4,812", l: "Products tested" },
                { n: "287", l: "Rankings published" },
                { n: "38.4k", l: "Hours logged" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="display text-2xl font-light num-tabular">{s.n}</div>
                  <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.16em] text-ink-mute">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — stacked #1 cards */}
          <div className="relative md:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              className="relative aspect-[4/5] w-full"
            >
              {featured.map((r, i) => {
                const rotate = [-4, 2, -1][i];
                const y = i * 18;
                const x = i * -12;
                return (
                  <motion.a
                    key={r.id}
                    href={toRanking(r.slug)}
                    whileHover={{ y: y - 8, rotate: 0, transition: { duration: 0.35 } }}
                    initial={{ opacity: 0, y: 40, rotate }}
                    animate={{ opacity: 1, y, rotate }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
                    style={{ left: x, top: y, zIndex: 3 - i }}
                    className="absolute inset-x-0 top-0 block aspect-[4/5] overflow-hidden rounded-sm border border-ink/15 bg-paper shadow-[0_20px_60px_-30px_rgba(17,16,16,0.35)]"
                  >
                    <div className="relative h-full w-full">
                      {r.products[0].image && (
                        <img
                          src={r.products[0].image}
                          alt={r.products[0].name}
                          className="h-full w-full object-cover grayscale-[10%]"
                          loading="lazy"
                        />
                      )}
                      {!r.products[0].image && (
                        <div className={`h-full w-full bg-gradient-to-br ${r.coverGradient || "from-ink to-ink-soft"}`} />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 text-paper">
                        <div className="flex items-baseline gap-2">
                          <span className="display text-[72px] font-light leading-none italic text-accent-soft">1</span>
                          <div>
                            <div className="text-[11px] font-mono uppercase tracking-[0.18em] opacity-70">
                              {r.category}
                            </div>
                            <div className="mt-1 display text-xl leading-tight">
                              {r.title.replace("The 3 Best ", "")}
                            </div>
                            <div className="mt-1 text-sm opacity-90">{r.products[0].name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 left-4 rounded-full bg-paper/95 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
                        № {i + 1}
                      </div>
                    </div>
                  </motion.a>
                );
              })}

              {/* Decorative stamp */}
              <motion.div
                initial={{ opacity: 0, rotate: -15, scale: 0.9 }}
                animate={{ opacity: 1, rotate: -12, scale: 1 }}
                transition={{ duration: 1, delay: 1.1 }}
                className="absolute -bottom-6 -right-4 hidden sm:flex h-28 w-28 flex-col items-center justify-center rounded-full border border-accent/60 bg-paper text-center text-[10px] font-mono uppercase leading-tight tracking-[0.18em] text-accent"
              >
                <span>Verified</span>
                <span className="display text-2xl italic font-normal normal-case tracking-normal">Top 3</span>
                <span>Editorial</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Press marquee */}
      <div className="mt-24 md:mt-32 border-y border-ink/15 bg-paper-soft/50 py-5 overflow-hidden">
        <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
          {[...press, ...press, ...press].map((p, i) => (
            <span key={i} className="display text-lg italic text-ink-mute">
              {p} <span className="text-ink/30">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
