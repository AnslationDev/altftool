"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Globe, Search } from "lucide-react";
import { getAllCountryCodesUsed } from "../../lib/getFestivals";
import { getCountryName } from "../../data/countryNames";
import { getMonthName } from "../../lib/dateMath";
import ConfettiField from "./ConfettiField";
import CountUp from "./CountUp";

const heroContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const QUICK_TAG_COUNT = 6;

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));

// 2px ink outline + hard offset shadow, the paper-craft signature. The hover
// pair on the button lifts the face away from its own shadow.
const INK_EDGE = "border-2 border-[var(--f-ink)]";
const QUICK_TAG_CLASS_NAME = `shrink-0 whitespace-nowrap rounded-full bg-primary px-[18px] py-2 font-[family-name:var(--font-fredoka)] text-[13px] font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-[3px] hover:-rotate-2 ${INK_EDGE}`;

export default function FestivalHero({ stats, upcoming = [] }) {
  const countryCodes = getAllCountryCodesUsed();

  // The six soonest real festivals, not a hardcoded list — this row used to
  // name Diwali/Ramadan/Christmas regardless of the date, which went stale the
  // moment any of them passed. `upcoming` is resolved on the server and
  // already sorted, so the order is stable between server and client render.
  const quickTags = upcoming.slice(0, QUICK_TAG_COUNT).map(({ festival }) => ({
    label: festival.name,
    slug: festival.slug,
  }));
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [month, setMonth] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (country) params.set("country", country);
    if (month) params.set("month", month);
    // A hard navigation, not router.push(): on this route, App Router's
    // push() is dispatched inside a React transition that can sit pending
    // indefinitely in dev (confirmed — it only flushes once some unrelated
    // interaction fires, e.g. clicking anywhere else), the same intermittent
    // Suspense/streaming hydration race noted in loading.jsx. A full
    // navigation has no transition to get stuck in.
    window.location.href = `/lookouts/festival/calendar${params.toString() ? `?${params.toString()}` : ""}`;
  }

  // React's delegated synthetic `onSubmit` can silently fail to fire on this
  // route (same root cause). A native listener attached directly to the form
  // node bypasses React's event delegation entirely and fires reliably
  // regardless of that race. The ref keeps the latest closure without
  // re-attaching the listener every render.
  const formRef = useRef(null);
  const handleSubmitRef = useRef(handleSubmit);

  // Refreshed in an effect rather than during render — mutating a ref while
  // rendering is unsafe under concurrent rendering (the render may be thrown
  // away or replayed), and React's lint rules reject it outright.
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;
    const listener = (event) => handleSubmitRef.current(event);
    form.addEventListener("submit", listener);
    return () => form.removeEventListener("submit", listener);
  }, []);

  // Value and suffix are separate so CountUp can animate the number while the
  // "+" stays put instead of being parsed out of a string every frame.
  const statTiles = [
    // These are exact counts from the dataset, not floors — a "+" would
    // advertise festivals and countries this route does not have.
    { value: stats.countries, label: "Countries" },
    { value: stats.festivals, label: "Festivals" },
    { value: stats.religions, suffix: "", label: "Religions" },
    { value: stats.categories, suffix: "", label: "Categories" },
  ];

  return (
    <section className="festival-hero relative overflow-hidden bg-[var(--f-bg)]" id="festival-search">
      <ConfettiField />

      <motion.div
        className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center gap-6 px-8 pb-[70px] pt-24 text-center"
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={heroItemVariants}
          className={`inline-flex -rotate-2 items-center gap-2 rounded-[14px] bg-[var(--f-surface)] px-5 py-[9px] font-[family-name:var(--font-fredoka)] text-[13px] font-semibold tracking-[0.04em] text-[var(--f-ink)] shadow-[3px_3px_0_var(--f-ink)] ${INK_EDGE}`}
        >
          {/* The emoji needs its own box: as a bare text node it merges with
              the label into one flex child and `gap` has nothing to sit
              between, closing the space to zero. */}
          <span aria-hidden="true">🎉</span>
          Discover Festivals Worldwide
        </motion.span>

        <motion.h1
          variants={heroItemVariants}
          className="font-[family-name:var(--font-fredoka)] text-[clamp(34px,5.2vw,62px)] font-bold leading-[1.12] text-[var(--f-ink)]"
        >
          Explore Every{" "}
          <span className="relative text-[var(--f-pink)]">
            Festival
            {/* Highlighter swipe behind the word — inset-x-[-4px] so it
                overhangs the glyphs the way a real marker would. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-[-4px] bottom-[2px] -z-10 h-[10px] rounded opacity-40 bg-[var(--f-mustard)]"
            />
          </span>{" "}
          on the Planet
        </motion.h1>

        <motion.p
          variants={heroItemVariants}
          className="max-w-[600px] text-base leading-[1.65] text-[var(--f-muted-fg)]"
        >
          Discover traditions, history, rituals, foods, and celebrations from {stats.countries} countries — all in
          one place.
        </motion.p>

        <motion.form
          ref={formRef}
          variants={heroItemVariants}
          className={`mt-2 flex w-full max-w-[800px] flex-wrap items-center gap-1 rounded-[20px] bg-[var(--f-surface)] p-1.5 shadow-[5px_5px_0_var(--f-ink)] ${INK_EDGE}`}
        >
          <label className="flex min-w-[120px] flex-1 items-center gap-2 px-3.5 py-3 text-[var(--f-muted-fg)]">
            <Search size={16} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search festivals, countries, religions..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full min-w-0 bg-transparent text-[15px] text-[var(--f-ink)] outline-none placeholder:text-[var(--f-muted-fg)]"
            />
          </label>

          <span aria-hidden="true" className="hidden h-[22px] w-0.5 bg-[var(--f-ink)] opacity-15 sm:block" />

          <label className="flex items-center gap-2 px-3.5 py-3 text-[var(--f-muted-fg)]">
            <Globe size={16} aria-hidden="true" />
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              aria-label="Country"
              className="cursor-pointer bg-transparent text-[15px] text-[var(--f-muted-fg)] outline-none"
            >
              <option value="">All Countries</option>
              {countryCodes.map((code) => (
                <option key={code} value={code}>
                  {getCountryName(code)}
                </option>
              ))}
            </select>
          </label>

          <span aria-hidden="true" className="hidden h-[22px] w-0.5 bg-[var(--f-ink)] opacity-15 sm:block" />

          <label className="flex items-center gap-2 px-3.5 py-3 text-[var(--f-muted-fg)]">
            <Calendar size={16} aria-hidden="true" />
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              aria-label="Month"
              className="cursor-pointer bg-transparent text-[15px] text-[var(--f-muted-fg)] outline-none"
            >
              <option value="">Any Month</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className={`cursor-pointer rounded-[14px] bg-[var(--f-pink)] px-6 py-[11px] font-[family-name:var(--font-fredoka)] text-sm font-bold text-white shadow-[3px_3px_0_var(--f-ink)] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--f-ink)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--f-ink)] ${INK_EDGE}`}
          >
            Search
          </button>
        </motion.form>

        {/* One row that scrolls itself. The track holds the six tags twice and
            translates exactly half its width, so the second copy lands where
            the first began and the loop is seamless. aria-hidden on the
            duplicate is decorative text, so only the first set is exposed as
            links to assistive technology and keyboard navigation. */}
        {quickTags.length ? (
          <motion.div
            variants={heroItemVariants}
            className="festival-quick-marquee w-full max-w-[820px] overflow-hidden"
          >
            <div className="festival-quick-marquee-track flex w-max gap-2.5">
              {[0, 1].map((copy) =>
                quickTags.map((tag) =>
                  copy === 0 ? (
                    <Link
                      key={`${copy}-${tag.slug}`}
                      href={`/lookouts/festival/${tag.slug}`}
                      className={QUICK_TAG_CLASS_NAME}
                    >
                      {tag.label}
                    </Link>
                  ) : (
                    <span key={`${copy}-${tag.slug}`} aria-hidden="true" className={QUICK_TAG_CLASS_NAME}>
                      {tag.label}
                    </span>
                  ),
                ),
              )}
            </div>
          </motion.div>
        ) : null}

        <motion.div variants={heroItemVariants} className="mt-2.5 flex flex-wrap justify-center gap-x-[52px] gap-y-6">
          {statTiles.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <CountUp
                value={stat.value}
                suffix={stat.suffix}
                className="font-[family-name:var(--font-fredoka)] text-[30px] font-bold text-primary-text"
              />
              <span className="text-[13px] font-medium text-[var(--f-muted-fg)]">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
