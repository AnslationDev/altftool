"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, ChevronRight, Clapperboard, Cpu, Flame, ImageOff, Plane, Users } from "lucide-react";

const ICONS = { Clapperboard, Cpu, Plane, BookOpen, Users };

function UniverseImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-(--muted) text-(--muted-foreground)">
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 280px"
      className="object-cover transition-transform duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Explore Top10 by Universe — a real navigation layer over the live
 * products in PRODUCT_REGISTRY, grouped into 5 themed clusters (see
 * UNIVERSE_PRODUCT_KEYS in Top10Client). Each card shows a real product
 * count and a real live category count (fetched from each mapped
 * product's own real categoriesEndpoint — already cached 24h
 * server-side, so this costs nothing extra), and "Explore Now" actually
 * navigates to the cluster's first real product instead of a dead `#`.
 */
export default function ExploreUniverse({ universes = [], onExplore = () => {} }) {
  const [categoryCounts, setCategoryCounts] = useState({});
  const shouldReduceMotion = useReducedMotion();
  // Which universe is genuinely hottest right now, real-data-driven and
  // held stable for a 6-hour window server-side (see
  // /api/top10/universe-highlight) — not recomputed on every page load.
  const [highlightedUniverseId, setHighlightedUniverseId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      universes.map(async (universe) => {
        const counts = await Promise.all(
          (universe.categorySources || []).map(({ endpoint, key }) =>
            fetch(endpoint)
              .then((res) => res.json())
              .then((data) => (data[key] || []).length)
              .catch(() => 0),
          ),
        );
        return [universe.id, counts.reduce((sum, n) => sum + n, 0)];
      }),
    ).then((entries) => {
      if (!cancelled) setCategoryCounts(Object.fromEntries(entries));
    });

    fetch("/api/top10/universe-highlight")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setHighlightedUniverseId(data.highlightedUniverseId || null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- universes is static per page load
  }, []);

  if (universes.length === 0) return null;

  return (
    <section className="section">
      <p className="mb-1 text-xs font-bold tracking-widest text-(--primary-text) font-secondary uppercase">
        Explore. Discover. Get Inspired.
      </p>
      <h2 className="section-title text-left!">Explore Top10 by Universe</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {universes.map((universe, index) => {
          const Icon = ICONS[universe.icon] || Cpu;
          const categoryCount = categoryCounts[universe.id];
          const isHighlighted = universe.id === highlightedUniverseId;

          return (
            <motion.button
              key={universe.id}
              type="button"
              onClick={() => universe.exploreCategoryId && onExplore(universe.exploreCategoryId)}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 36, scale: 0.94 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              whileHover={shouldReduceMotion ? undefined : { y: -6 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : index * 0.05, ease: "easeOut" }}
              className="group relative flex h-64 flex-col overflow-hidden rounded-lg border border-(--border) text-left shadow-sm transition-shadow duration-150 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] sm:h-72"
            >
              <UniverseImage src={universe.image} alt={universe.title} />
              <div className="absolute inset-0 bg-overlay" />

              {/* Held stable for a 6-hour window server-side (see
                  /api/top10/universe-highlight), and absent entirely when no
                  provider answered. It says "Most Trending" rather than "Most
                  Explored" because trending signals are what is actually
                  counted — this site measures no visitor exploration at all. */}
              {isHighlighted && (
                <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-(--primary-hover) px-2.5 py-1 text-xs font-bold text-(--primary-foreground) font-secondary uppercase tracking-wide shadow-sm">
                  <Flame className="h-3 w-3" />
                  Most Trending
                </span>
              )}

              <div className="relative mt-auto flex flex-col gap-2.5 p-4">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 shrink-0 text-on-media" />
                  <p className="font-bold text-on-media font-primary leading-tight">{universe.title}</p>
                </div>

                <p className="text-xs font-medium text-on-media font-secondary">
                  {universe.productCount} {universe.productCount === 1 ? "Product" : "Products"}
                  {/* A failed count resolves to 0, which is a real number the
                      card would happily print as "0 Categories". Show the
                      count only once there is one to show. */}
                  {categoryCount > 0 && ` · ${categoryCount} Categories`}
                </p>

                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-overlay px-3 py-1.5 text-xs font-semibold text-on-media backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-90 motion-reduce:transition-none">
                  Explore Now
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
