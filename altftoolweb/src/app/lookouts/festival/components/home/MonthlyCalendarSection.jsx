"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAllFestivals } from "../../lib/getFestivals";
import { getIsoMonth, getMonthName, resolveDateInYear } from "../../lib/dateMath";
import MonthlyFestivalCard from "./MonthlyFestivalCard";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// The cards arrive one after another rather than as a block. delayChildren
// lets the container's own fade land first so the stagger reads as arrivals
// into a settled list instead of a competing animation.
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

export default function MonthlyCalendarSection({ calendarYear, initialMonth }) {
  // The server resolves this anchor once and passes plain numbers into the
  // client component. Re-reading `new Date()` independently during SSR and
  // hydration can select different months around a timezone boundary.
  const year = calendarYear;
  const [activeMonth, setActiveMonth] = useState(initialMonth);
  const [photos, setPhotos] = useState({});

  // Festivals whose date *in this year* lands in the selected month.
  //
  // Filtering on the resolved date, not on `festival.month`, is what keeps the
  // tabs honest: `month` is the month a festival typically falls in, and lunar
  // festivals drift out of it — Krishna Janmashtami is filed under 8 but
  // actually falls on 4 Sep 2026, so it belongs under September. Whatever a
  // month genuinely contains is what it shows, one festival or ten.
  const festivals = useMemo(
    () =>
      getAllFestivals()
        .map((festival) => ({ festival, dateIso: resolveDateInYear(festival, year) }))
        .filter(({ dateIso }) => getIsoMonth(dateIso) === activeMonth)
        .sort((a, b) => a.dateIso.localeCompare(b.dateIso)),
    [activeMonth, year],
  );

  // Photos are fetched per month and cached by slug across month switches, so
  // flipping back to a month already seen paints instantly and costs nothing.
  // `wikipediaTitle` lets the route fall back to the festival's Wikipedia
  // image when no photo-provider key is configured.
  useEffect(() => {
    let cancelled = false;
    const missing = festivals.filter(({ festival }) => !(festival.slug in photos));
    if (!missing.length) return undefined;

    Promise.all(
      missing.map(async ({ festival }) => {
        try {
          const res = await fetch(
            `/api/lookouts/festival/photos?query=${encodeURIComponent(festival.unsplashQuery || festival.name)}` +
              `&wikipediaTitle=${encodeURIComponent(festival.wikipediaTitle || "")}`,
          );
          const data = await res.json();
          return [festival.slug, data?.photos?.[0] || null];
        } catch {
          return [festival.slug, null];
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setPhotos((current) => ({ ...current, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
    // `photos` is deliberately not a dependency: it is written by this effect,
    // and depending on it would re-run the effect on its own result. The slug
    // check above is what keeps already-fetched festivals from refetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festivals]);

  return (
    <section className="festival-section festival-section--tint" id="calendar">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Festival Calendar</p>
            <h2>Monthly Festival Calendar</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            Full calendar
          </Link>
        </div>

        <nav
          aria-label="Filter festivals by month"
          className="mb-8 flex flex-wrap gap-2 rounded-lg border border-border-strong bg-surface p-2 shadow-sm"
        >
          {MONTHS.map((month) => {
            const isActive = month === activeMonth;
            return (
              <button
                key={month}
                type="button"
                onClick={() => setActiveMonth(month)}
                aria-pressed={isActive}
                className={`relative rounded-md px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {/* One shared layoutId means the ink pill slides between tabs
                    rather than cross-fading in place. */}
                {isActive ? (
                  <motion.span
                    layoutId="festival-month-pill"
                    className="absolute inset-0 rounded-md bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <span className="relative">{getMonthName(month).slice(0, 3)}</span>
              </button>
            );
          })}
        </nav>

        {/* Keyed on the month so React remounts the list and the stagger
            replays from the top on every switch. Deliberately not wrapped in
            AnimatePresence with mode="wait": that holds the incoming month
            back until the outgoing one's exit finishes, and anything that
            stalls the animation loop leaves the previous month's cards on
            screen for good. A remount has no exit to wait on. */}
        <motion.div
          key={activeMonth}
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {festivals.length ? (
            festivals.map(({ festival, dateIso }) => (
              <MonthlyFestivalCard
                key={festival.slug}
                festival={festival}
                dateIso={dateIso}
                photo={photos[festival.slug]}
              />
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-border-strong p-8 text-center text-sm text-muted-foreground">
              No festivals listed for {getMonthName(activeMonth)} {year}.
            </p>
          )}
        </motion.div>

        {festivals.length ? (
          <p className="mt-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
            {festivals.length} {festivals.length === 1 ? "festival" : "festivals"} in {getMonthName(activeMonth)}{" "}
            {year}
          </p>
        ) : null}
      </div>
    </section>
  );
}
