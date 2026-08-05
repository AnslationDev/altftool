"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import useCountdown from "../../hooks/useCountdown";
import BookmarkButton from "../shared/BookmarkButton";
import { formatDateLabel } from "../../lib/dateMath";
import { getCountryName } from "../../data/countryNames";
import { countryCodeToFlagEmoji } from "../../lib/flagEmoji";

// Category accents are drawn only from shared semantic tokens, so the labels
// retain sufficient contrast in both themes without introducing route-local
// color values.
const CATEGORY_INK = {
  religious: "var(--primary-text)",
  traditional: "var(--danger-text)",
  cultural: "var(--success-text)",
  music: "var(--info-text)",
  national: "var(--info-text)",
  harvest: "var(--warning-text)",
  food: "var(--warning-text)",
  seasonal: "var(--success-text)",
  "new-year": "var(--danger-text)",
  "international-days": "var(--info-text)",
};

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// One flip cell of the live counter. The digit is keyed so a change swaps two
// elements and AnimatePresence can run the old one up and out while the new
// one drops in.
function FlipDigit({ value }) {
  return (
    <span className="relative block h-8 w-6 overflow-hidden rounded-sm border border-primary bg-primary">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 flex items-center justify-center font-mono text-base font-bold text-primary-foreground"
          suppressHydrationWarning
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-primary-foreground opacity-30" />
    </span>
  );
}

function Countdown({ days, name, isPast }) {
  const digits = String(Math.max(0, days)).padStart(3, "0").split("");
  return (
    <div
      className="flex gap-1"
      role={isPast ? "group" : "timer"}
      aria-label={isPast ? `${name} has already been celebrated` : `${days} days until ${name}`}
    >
      {digits.map((digit, i) => (
        // Index-keyed on purpose: the key identifies the *cell*, so the digit
        // inside it is what changes and animates. Keying by digit would make
        // React reuse cells across positions and the flip would jump.
        <FlipDigit key={i} value={digit} />
      ))}
    </div>
  );
}

export default function MonthlyFestivalCard({ festival, dateIso, photo }) {
  const { days, isPast } = useCountdown(dateIso);
  const ink = CATEGORY_INK[festival.category] || "var(--primary-text)";
  const country = getCountryName(festival.countryCodes?.[0]);
  const flag = countryCodeToFlagEmoji(festival.countryCodes?.[0]);
  const dateLabel = formatDateLabel(dateIso);

  return (
    <motion.article
      variants={cardVariants}
      className="group relative flex overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* 40% of the card, with a minimum height so a short text column can't
          squeeze the photo into a letterbox strip. */}
      <div className="relative min-h-[220px] w-2/5 shrink-0 self-stretch overflow-hidden border-r border-border bg-surface-soft">
        {photo?.url ? (
          <Image
            src={photo.url}
            alt={photo.alt || festival.name}
            fill
            sizes="(max-width: 640px) 40vw, 40vw"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Until a photo resolves, the country flag stands in — it keeps the
          // row's height and rhythm instead of collapsing to an empty well.
          <span className="flex h-full w-full items-center justify-center text-4xl" aria-hidden="true">
            {flag}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: ink, borderColor: ink, background: `color-mix(in srgb, ${ink} 12%, transparent)` }}
          >
            {festival.category?.replace(/-/g, " ")}
          </span>
          <span className="relative z-10">
            <BookmarkButton
              slug={festival.slug}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
              size={14}
            />
          </span>
        </div>

        <h3 className="text-xl font-extrabold leading-tight text-foreground sm:text-2xl">
          <Link href={`/lookouts/festival/${festival.slug}`} className="hover:underline">
            {/* Stretched over the whole card so the entire row is the hit
                target; the bookmark button opts back out via its own z-index. */}
            <span className="absolute inset-0 z-0" aria-hidden="true" />
            {festival.name}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground">
          {flag} {country}
          {dateLabel ? ` · ${dateLabel}` : ""}
          {festival.durationDays > 1 ? ` · ${festival.durationDays} days` : ""}
        </p>

        {festival.tagline ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-foreground-soft">{festival.tagline}</p>
        ) : null}

        {festival.traditions?.length ? (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {festival.traditions.slice(0, 3).map((tradition) => (
              <li
                key={tradition}
                className="rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tradition}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 flex items-end gap-3">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {isPast ? "Celebrated" : "Days until the festival"}
            </p>
            <Countdown days={isPast ? 0 : days} name={festival.name} isPast={isPast} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
