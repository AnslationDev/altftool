"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, ExternalLink, Flame, WifiOff, ChevronDown } from "lucide-react";

const INITIAL_VISIBLE_COUNT = 3;

/**
 * Real, currently-live promotions/offers/events discovered from a mall's own
 * official website — never fake/hardcoded data. Shown inline within a
 * selected mall's card in NearbyMallResults, reusing the existing
 * Loader2 spinner and card/typography conventions rather than a new design.
 *
 * @param {{
 *   status: "loading" | "ok" | "no_website" | "no_promotions" | "error",
 *   events: Array<{ title, description, image, startDate, endDate, ctaLink, sourceUrl }>,
 *   message: string | null,
 * }} props
 */
export default function MallPromotions({ status, events, message }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const isLoading = status === "loading";

  // Reset back to the first 3 whenever a new mall's results start coming in.
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [isLoading]);

  if (status === "loading" && events.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <Loader2 className="w-4 h-4 text-(--primary) animate-spin" />
        <span className="text-xs text-(--muted-foreground) font-secondary">
          Looking for current offers &amp; events...
        </span>
      </div>
    );
  }

  if (status === "error" && events.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-(--muted-foreground) font-secondary">
        <WifiOff className="w-4 h-4 shrink-0" />
        {message || "Couldn't load promotions right now."}
      </div>
    );
  }

  if ((status === "no_website" || status === "no_promotions") && events.length === 0) {
    return (
      <p className="py-4 text-xs text-(--muted-foreground) font-secondary">
        {status === "no_website" ? "No official website found for this mall." : "No active promotions found."}
      </p>
    );
  }

  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  return (
    <div className="flex flex-col divide-y divide-(--border)">
      {visibleEvents.map((event, i) => (
        <a
          key={`${event.title}-${i}`}
          href={event.ctaLink || event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80 transition"
        >
          {event.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL scraped from the mall's own site
            <img
              src={event.image}
              alt={event.title}
              loading="lazy"
              className="w-14 h-14 rounded-lg object-cover shrink-0 bg-(--muted)"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-(--primary)/10 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-(--primary)" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-(--foreground) font-primary truncate">
              <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              {event.title}
            </p>
            {(event.startDate || event.endDate) && (
              <p className="flex items-center gap-1 text-xs text-(--muted-foreground) font-secondary mt-0.5">
                <Calendar className="w-3 h-3" />
                {event.startDate}
                {event.endDate ? ` – ${event.endDate}` : ""}
              </p>
            )}
            {event.description && (
              <p className="text-xs text-(--muted-foreground) font-secondary mt-0.5 line-clamp-1">
                {event.description}
              </p>
            )}
          </div>

          <ExternalLink className="w-3.5 h-3.5 text-(--muted-foreground) shrink-0" />
        </a>
      ))}

      {status === "loading" && (
        <div className="flex items-center gap-2 py-2 text-xs text-(--muted-foreground) font-secondary">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Still looking for more...
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT);
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-(--primary) font-secondary hover:opacity-80 transition cursor-pointer"
        >
          Show more
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
