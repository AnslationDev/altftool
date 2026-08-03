"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ImageOff, Star, ChevronDown, ExternalLink } from "lucide-react";
import { safeExternalUrl } from "@/lib/top10/safeExternalUrl";

// Heuristic only — decides whether the "Read more" toggle is worth
// showing under the 5-line clamp; the clamp itself is pure CSS.
const DESCRIPTION_LONG_THRESHOLD = 280;

/**
 * One row of the vertical "top ranked" list — poster, rank, rating, and
 * up to 5 lines of the item's own description shown inline. Borderless,
 * flowing list rows (a bottom divider, not a boxed card) — no
 * click-through to a separate detail page; a "Read more" toggle is the
 * only interaction needed for longer text.
 */
export default function RankedItem({ rank, title, subtitle, image, rating, description, url }) {
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const descriptionId = useId();
  const safeImage = safeExternalUrl(image);
  const safeUrl = safeExternalUrl(url);

  const trimmedDescription = (description || "").trim();
  const isLong = trimmedDescription.length > DESCRIPTION_LONG_THRESHOLD;

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, x: -40 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : Math.min(rank, 10) * 0.06, ease: "easeOut" }}
      className="group flex flex-col gap-4 border-b border-(--border) px-3 py-6 -mx-3 transition-colors duration-150 last:border-b-0 hover:bg-(--muted)/40 motion-reduce:transition-none sm:flex-row"
    >
      <div className="flex w-full shrink-0 items-start gap-3 sm:w-auto">
        {/* Desktop-only rank badge, beside the image — unchanged from before. */}
        <span className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary-hover) text-xs font-extrabold text-(--primary-foreground) font-secondary shadow-sm transition-transform duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:flex">
          {rank}
        </span>

        {/* Mobile: full-width image so it reads properly above the description; desktop keeps the fixed small poster size. Gradient (two-tone, color-mix) shadow on hover — same recipe as CTAButton's primary variant, not a flat single-color shadow. */}
        <div className="relative h-56 w-full overflow-hidden rounded-lg bg-(--muted) transition-shadow duration-150 group-hover:shadow-md motion-reduce:transition-none sm:h-44 sm:w-32">
          {/* Mobile-only rank badge, overlaid on the image corner since there's no side-by-side room. */}
          <span className="absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-(--primary-hover) text-xs font-extrabold text-(--primary-foreground) font-secondary shadow-sm sm:hidden">
            {rank}
          </span>

          {!safeImage || failed ? (
            <div className="flex h-full w-full items-center justify-center text-(--muted-foreground)">
              <ImageOff className="h-6 w-6" />
            </div>
          ) : (
            <Image
              src={safeImage}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover transition-transform duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              onError={() => setFailed(true)}
            />
          )}

          {/* Gradient reveal on hover — same "darken from the bottom" treatment as the Trending cards. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-(--primary)/40 via-transparent to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h3 className="font-primary text-base font-extrabold text-(--foreground) transition-colors duration-150 group-hover:text-(--primary-text) motion-reduce:transition-none sm:text-lg">
            {title}
          </h3>
          {rating != null && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-(--muted) px-2.5 py-1 text-xs font-bold text-(--foreground) font-secondary transition-transform duration-150 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              aria-label={`Rating ${Number(rating).toFixed(1)}`}
            >
              <Star className="h-3.5 w-3.5 fill-warning-text text-warning-text" aria-hidden="true" />
              <span aria-hidden="true">{Number(rating).toFixed(1)}</span>
            </span>
          )}
        </div>

        {subtitle && <p className="mt-0.5 text-xs text-(--muted-foreground) font-secondary">{subtitle}</p>}

        {trimmedDescription ? (
          <p
            id={descriptionId}
            className={`mt-2.5 text-sm leading-relaxed text-(--muted-foreground) font-secondary ${
              expanded ? "" : "line-clamp-5"
            }`}
          >
            {trimmedDescription}
          </p>
        ) : (
          <p className="mt-2.5 text-sm italic text-(--muted-foreground) font-secondary">No description available.</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-(--primary-text) font-secondary hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              aria-expanded={expanded}
              aria-controls={descriptionId}
            >
              {expanded ? "Show less" : "Read more"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}

          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-semibold text-(--foreground) font-secondary transition-colors hover:border-(--primary)/40 hover:text-(--primary-text) focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              aria-label={`Open ${title} in a new tab`}
            >
              Try it
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
