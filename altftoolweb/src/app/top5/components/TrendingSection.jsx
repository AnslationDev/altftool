"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useAnimationFrame,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal, EASE } from "./motion";

// Continuous auto-scrolling carousel with full manual control layered on
// top: the row drifts endlessly (list is doubled, position wraps, so cards
// are never cut off "dead" — the loop is seamless), slows down while the
// pointer is over it so cards stay clickable, and the reader can drag/swipe
// or page with the arrows at any time. Progress bar + counter track the
// leading card live.
const GAP_PX = 24; // matches gap-6
const DRIFT_SPEED = 55; // px per second while idle
const HOVER_SPEED = 14; // px per second while the pointer is over the row

// How many cards fit the measured container width — a partial "peek" of
// the next card below desktop so the row reads as scrollable on purpose.
function getVisibleCards(width) {
  if (width < 480) return 1.15;
  if (width < 680) return 1.6;
  if (width < 900) return 2.3;
  if (width < 1180) return 3.15;
  return 4;
}

// `items` = the ten most-viewed rankings (slim fields), pre-sorted on the
// server so the full dataset never ships to the client.
export default function TrendingSection({ items = [] }) {
  const rankings = items;
  const loop = useMemo(() => [...rankings, ...rankings], [rankings]);
  const reduceMotion = useReducedMotion();

  const viewportRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(300);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState(null);
  const [leadCard, setLeadCard] = useState(0);

  const x = useMotionValue(0);
  const step = cardWidth + GAP_PX;
  const totalWidth = rankings.length * step; // width of ONE copy of the list

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;

    const measure = () => {
      const width = node.getBoundingClientRect().width;
      const cards = getVisibleCards(width);
      const next = (width - GAP_PX * (cards - 1)) / cards;
      if (next > 0) setCardWidth(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Endless drift. Slows (rather than stopping) on hover so the row visibly
  // keeps moving, and yields fully while dragging or arrow-paging.
  useAnimationFrame((_, delta) => {
    if (reduceMotion || dragging || animating || !totalWidth) return;
    const speed = hovering ? HOVER_SPEED : DRIFT_SPEED;
    let next = x.get() - (speed * delta) / 1000;
    if (next <= -totalWidth) next += totalWidth;
    if (next > 0) next -= totalWidth;
    x.set(next);
  });

  // Keep the "leading card" counter in sync with the live position.
  useMotionValueEvent(x, "change", (value) => {
    if (!totalWidth) return;
    const wrapped = ((-value % totalWidth) + totalWidth) % totalWidth;
    const lead = Math.round(wrapped / step) % rankings.length;
    setLeadCard(lead);
  });

  const wrapIntoRange = () => {
    let value = x.get();
    while (value <= -totalWidth) value += totalWidth;
    while (value > 0) value -= totalWidth;
    x.set(value);
  };

  // Arrow paging: glide exactly one card in either direction, then hand
  // control back to the drift.
  const page = (direction) => {
    if (!totalWidth || animating) return;
    const current = x.get();
    const target = Math.round((current - direction * step) / step) * step;
    setAnimating(true);
    animate(x, target, {
      duration: 0.65,
      ease: EASE,
      onComplete: () => {
        wrapIntoRange();
        setAnimating(false);
      },
    });
  };

  const progress = useTransform(x, (value) => {
    if (!totalWidth) return 0;
    const wrapped = ((-value % totalWidth) + totalWidth) % totalWidth;
    return wrapped / totalWidth;
  });

  return (
    <section id="trending" className="w-full py-14 sm:py-20 md:py-24 bg-white scroll-mt-20 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="PREVIEW HIGHLIGHTS"
            heading="Explore the authored catalogue."
            description="A stable selection ordered from the illustrative activity fields in this preview dataset."
          />
        </Reveal>

        {/* Controls row: live progress on the left, pager arrows right. */}
        <Reveal delay={0.1} className="mt-8 sm:mt-10 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-[3px] w-28 sm:w-44 overflow-hidden rounded-full bg-black/[0.08]">
              <motion.div
                style={{ scaleX: progress, transformOrigin: "left" }}
                className="h-full w-full rounded-full bg-[#10b981]"
              />
            </div>
            <p className="shrink-0 text-xs font-semibold tracking-widest text-[#9ca3af]">
              {String(leadCard + 1).padStart(2, "0")} /{" "}
              {String(rankings.length).padStart(2, "0")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <motion.button
              type="button"
              aria-label="Previous rankings"
              onClick={() => page(-1)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black/10 text-[#0b1120] transition-colors hover:bg-[#0b1120] hover:text-white hover:border-[#0b1120]"
            >
              <ArrowLeft size={16} />
            </motion.button>
            <motion.button
              type="button"
              aria-label="Next rankings"
              onClick={() => page(1)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black/10 text-[#0b1120] transition-colors hover:bg-[#0b1120] hover:text-white hover:border-[#0b1120]"
            >
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </Reveal>

        <div
          ref={viewportRef}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => {
            setHovering(false);
            setHoveredSlug(null);
          }}
          className="relative mt-6 sm:mt-8 overflow-hidden"
        >
          <motion.div
            className="flex cursor-grab active:cursor-grabbing pb-4"
            style={{ gap: GAP_PX, x }}
            drag="x"
            dragElastic={0.05}
            dragMomentum={false}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => {
              wrapIntoRange();
              setDragging(false);
            }}
          >
            {loop.map((item, cardIndex) => {
              const rank = (cardIndex % rankings.length) + 1;
              const dimmed = hoveredSlug !== null && hoveredSlug !== `${item.slug}-${cardIndex}`;
              return (
                <motion.div
                  key={`${item.slug}-${cardIndex}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: Math.min((cardIndex % rankings.length) * 0.07, 0.35), ease: EASE }}
                  onMouseEnter={() => setHoveredSlug(`${item.slug}-${cardIndex}`)}
                  style={{ width: `${cardWidth}px` }}
                  className="shrink-0"
                >
                  <motion.div
                    animate={{
                      opacity: dimmed ? 0.55 : 1,
                      y: hoveredSlug === `${item.slug}-${cardIndex}` ? -8 : 0,
                      filter: dimmed ? "saturate(0.5)" : "saturate(1)",
                    }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <Link
                      href={`/top5/item/${item.slug}`}
                      className="group block"
                      draggable={false}
                      onClick={(event) => {
                        // A drag that ends on a card shouldn't navigate.
                        if (dragging) event.preventDefault();
                      }}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_10px_30px_-18px_rgba(11,17,32,0.18)] transition-shadow duration-500 group-hover:shadow-[0_35px_70px_-25px_rgba(11,17,32,0.4)]">
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6, ease: EASE }}
                          className="h-full w-full"
                        >
                          <ManagedImage
                            src={item.cardImage}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        </motion.div>

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                        {/* Rank chip — always on, so the row reads as a ranking. */}
                        <span className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-xs font-bold text-[#0b1120] shadow-md shadow-black/10">
                          {String(rank).padStart(2, "0")}
                        </span>

                        {/* Hover CTA slides up from the bottom edge. */}
                        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex translate-y-3 items-center justify-between gap-3 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                          <span className="text-xs font-semibold tracking-widest text-white">
                            READ THE RANKING
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0b1120]">
                            <ArrowUpRight size={14} />
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 sm:mt-4 text-xs font-semibold tracking-widest text-[#10b981]">
                        {item.category.toUpperCase()} &middot; {item.views} VIEWS
                      </p>
                      <h3 className="mt-1 text-lg sm:text-xl font-bold text-[#0b1120] group-hover:text-[#5ea8ff] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#9ca3af]">{item.updatedLabel}</p>
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <Reveal delay={0.15} className="mt-8 sm:mt-10 flex justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/top5/categories"
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#0b1120] hover:bg-[#f3f4f6] transition-colors inline-flex items-center gap-2"
            >
              See all trending
              <motion.span
                animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
                transition={reduceMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              >
                &rarr;
              </motion.span>
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
