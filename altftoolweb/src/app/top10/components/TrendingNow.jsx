"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  ImageOff,
  Loader2,
} from "lucide-react";
import { safeExternalUrl } from "@/lib/top10/safeExternalUrl";

// Continuous hover-to-scroll speed, in px per tick — a fixed-interval nudge
// rather than one-shot "scroll by a page" so the row glides while the arrow
// stays hovered and stops the instant the cursor leaves it.
const SCROLL_SPEED_PX = 8;
const SCROLL_INTERVAL_MS = 16;

// For a tab left open a long time, re-pull trending data on its own —
// randomized 2-3 hours (not a fixed timer) so it doesn't read as a
// suspiciously exact clock tick. Picked once per mount, not re-rolled on
// every tick. The server side (getTrendingCards) already caches for 1
// hour, so this refetch always has a chance to see genuinely new data.
const MIN_REFRESH_MS = 2 * 60 * 60 * 1000;
const MAX_REFRESH_MS = 3 * 60 * 60 * 1000;
function randomRefreshDelay() {
  return MIN_REFRESH_MS + Math.random() * (MAX_REFRESH_MS - MIN_REFRESH_MS);
}

function TrendingImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const safeSrc = safeExternalUrl(src);

  if (!safeSrc || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-(--muted) text-(--muted-foreground)">
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 768px) 60vw, 220px"
      className="object-cover "
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Real data from /api/top10/trending — one current top item per product,
 * aggregated server-side. `trending: true` cards (a genuine real-time
 * signal: OpenLibrary's own trending endpoint, live crypto prices, or a
 * real person from Wikipedia's own
 * "most read today" feed) get the fire badge; everything else is
 * honestly labeled "Top Pick" instead — real either way, nothing
 * invented, no fake vote counts.
 */
export default function TrendingNow() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const scrollRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const startAutoScroll = (direction) => {
    if (shouldReduceMotion) return;
    stopAutoScroll();
    scrollTimerRef.current = setInterval(() => {
      scrollRef.current?.scrollBy({
        left: direction * SCROLL_SPEED_PX,
        behavior: "auto",
      });
    }, SCROLL_INTERVAL_MS);
  };

  const stopAutoScroll = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  };

  const scrollOnce = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction * scrollRef.current.clientWidth * 0.75,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  useEffect(() => stopAutoScroll, []);

  useEffect(() => {
    let cancelled = false;
    let refreshTimer = null;

    function loadTrending({ isRefresh = false } = {}) {
      fetch("/api/top10/trending")
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          setItems(data.trending || []);
          setStatus("ok");
        })
        .catch(() => {
          // A background refresh failing shouldn't blank out an already-working strip.
          if (!cancelled && !isRefresh) setStatus("error");
        })
        .finally(() => {
          if (cancelled) return;
          refreshTimer = setTimeout(() => loadTrending({ isRefresh: true }), randomRefreshDelay());
        });
    }

    loadTrending();

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, []);

  // Nothing to show is not the same as something to say: once the fetch has
  // settled with no rows — empty result or a failed request — drop the whole
  // section rather than leaving a "Trending Right Now" heading over blank
  // space. Only the in-flight state earns the heading plus its spinner.
  if (status !== "loading" && items.length === 0) return null;

  return (
    <section className="section">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title text-left! mb-0! flex items-center gap-2">
          <Flame className="h-6 w-6 text-(--primary-text)" />
          Trending Right Now
        </h2>
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center gap-2 py-10" role="status" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin text-(--primary)" />
          <p className="text-sm text-(--muted-foreground) font-secondary">
            Loading ...
          </p>
        </div>
      )}

      {status === "ok" && items.length > 0 && (
        <div className="group/row relative">
          <button
            type="button"
            aria-label="Scroll left"
            onMouseEnter={() => startAutoScroll(-1)}
            onMouseLeave={stopAutoScroll}
            onBlur={stopAutoScroll}
            onClick={() => scrollOnce(-1)}
            className="absolute top-1/2 left-0 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-(--border) bg-(--card)/90 text-(--foreground) opacity-0 shadow-sm transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 hover:text-(--primary-text) cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            onMouseEnter={() => startAutoScroll(1)}
            onMouseLeave={stopAutoScroll}
            onBlur={stopAutoScroll}
            onClick={() => scrollOnce(1)}
            className="absolute top-1/2 right-0 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-(--border) bg-(--card)/90 text-(--foreground) opacity-0 shadow-sm transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 hover:text-(--primary-text) cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth motion-reduce:scroll-auto -my-4 py-4"
          >
            {items.map((item, index) => {
              const safeUrl = safeExternalUrl(item.url);
              const MotionCard = safeUrl ? motion.a : motion.article;
              return (
              <MotionCard
                key={item.key}
                href={safeUrl || undefined}
                target={safeUrl ? "_blank" : undefined}
                rel={safeUrl ? "noopener noreferrer" : undefined}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.03 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                viewport={{ once: true }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35, delay: shouldReduceMotion ? 0 : index * 0.05 }}
                className="group relative w-44 shrink-0 overflow-hidden rounded-lg border border-(--border) bg-(--card) shadow-sm transition-shadow duration-150 hover:border-(--primary)/50 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] sm:w-52"
              >
                <div className="relative h-32 w-full overflow-hidden sm:h-36">
                  <TrendingImage src={item.image} alt={item.title} />
                  {/* Darkens on hover so the reveal-on-hover subtitle below stays readable over any image. */}
                  <div className="absolute inset-0 bg-overlay opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none" />

                  <span
                    className={`absolute top-2 left-2 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold font-primary shadow-sm ${
                      item.trending
                        ? "bg-(--primary-hover) text-(--primary-foreground) animate-pulse motion-reduce:animate-none"
                        : "bg-(--card)/90 text-(--foreground)"
                    }`}
                  >
                    {item.trending && <Flame className="h-3 w-3" />}
                    {item.trending ? "Trending" : "Top Pick"}
                  </span>

                  <span className="absolute top-2 right-2 flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-(--primary-hover) text-(--primary-foreground) opacity-0 shadow-sm transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:translate-y-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>

                  {item.subtitle && (
                    <p className="absolute inset-x-0 bottom-0 line-clamp-2 translate-y-2 p-2.5 text-xs leading-snug text-on-media opacity-0 transition-all duration-150 font-secondary group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:translate-y-2">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-base font-bold text-(--card-foreground) font-secondary leading-snug transition-colors duration-150 group-hover:text-(--primary-text) motion-reduce:transition-none">
                    {item.title}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-(--muted-foreground) font-secondary">
                    {item.label}
                  </p>
                </div>
              </MotionCard>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
