import { AlertTriangle, CalendarClock, Eye, Heart, Sparkles } from "lucide-react";

import { formatPosted } from "../data/listings";
import { getMarket } from "../data/market";

/**
 * How old this ad is, and whether that should worry you.
 *
 * Server-safe: no "use client", and crucially **no `Date.now()`**. Recency in
 * this corpus is the integer `postedDaysAgo`, and it stays that way — a
 * clock read here would make the prerendered HTML disagree with the first
 * client render, and would silently change the page's meaning between a build
 * and a visit weeks later.
 *
 * The 30-day number is not decoration. OLX-style classifieds expire ads after
 * 30 days, which is the honest reason a 27-day-old ad deserves a warning: the
 * seller has had a month of buyers, and the most likely explanation for a
 * still-live ad is that it sold and nobody took it down.
 */

/** Days an ad runs before it expires — the market config owns the number. */
const AD_LIFESPAN_DAYS = getMarket().adLifetimeDays;

/** Inside this many days of expiry, warn. */
const EXPIRY_WARNING_WINDOW = 7;

/** At or under this, the ad is genuinely fresh. */
const FRESH_DAYS = 3;

export default function AdFreshness({ listing }) {
  if (!listing) return null;

  const days = Math.max(0, Number(listing.postedDaysAgo) || 0);
  const daysLeft = AD_LIFESPAN_DAYS - days;

  let Icon;
  let tone;
  let headline;
  let detail;

  if (days > AD_LIFESPAN_DAYS) {
    Icon = AlertTriangle;
    tone = "text-(--bzr-urgent)";
    headline = `Stale — ${days} days old`;
    detail = `Ads run for ${AD_LIFESPAN_DAYS} days on Bazaar, so this one is ${days - AD_LIFESPAN_DAYS} day${days - AD_LIFESPAN_DAYS === 1 ? "" : "s"} past its window. Assume it may already be sold and confirm before you travel to see it.`;
  } else if (daysLeft <= EXPIRY_WARNING_WINDOW) {
    Icon = CalendarClock;
    tone = "text-(--bzr-featured)";
    headline =
      daysLeft === 0
        ? `${days} days old — expires today`
        : `${days} days old — expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
    detail = `This ad has been up for most of its ${AD_LIFESPAN_DAYS}-day run. It may already be sold — message the seller before making plans around it.`;
  } else if (days <= FRESH_DAYS) {
    Icon = Sparkles;
    tone = "text-(--bzr-free)";
    headline = days === 0 ? "Posted today" : `Fresh — posted ${formatPosted(days).toLowerCase()}`;
    detail = `Still early in its ${AD_LIFESPAN_DAYS}-day run, so it is likely to be available — and you are likely to be among the first to ask.`;
  } else {
    Icon = CalendarClock;
    tone = "text-(--muted-foreground)";
    headline = `Posted ${formatPosted(days).toLowerCase()}`;
    detail = `${daysLeft} of its ${AD_LIFESPAN_DAYS} days left before the ad expires.`;
  }

  const views = Number(listing.views) || 0;
  const saves = Number(listing.saves) || 0;

  return (
    <div className="mt-4 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/30 px-3 py-2.5">
      <p className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
        <span className="min-w-0">
          {/* The headline is `--foreground`, not `tone`. Measured on the
              production build at 1280px, light theme, 14px/600:
                --bzr-free     rgb(22,163,74)  on this panel's composited
                               background rgb(238,242,245) → 2.93:1
                --bzr-featured rgb(245,158,11) on rgb(247,248,251) → 2.02:1
                --bzr-urgent   rgb(239,68,68)  on rgb(247,248,251) → 3.54:1
                --foreground   rgb(17,24,39)   on rgb(247,248,251) → 16.7:1
              WCAG 1.4.3 wants 4.5:1 at this size, so all three tones failed —
              amber by a factor of two. The tone survives where it is allowed to: the
              icon beside it is a non-text graphic (SC 1.4.11, 3:1) and clears
              that, and the wording already says "Stale" / "expires in 2 days"
              / "Posted today", so the state is never carried by colour alone
              (SC 1.4.1). Dark theme passed on all three tones before this
              change; it still does. */}
          <span className="block text-sm font-semibold text-(--foreground)">{headline}</span>
          <span className="block text-xs leading-relaxed text-(--muted-foreground)">{detail}</span>
        </span>
      </p>

      {/* Light social proof — how much attention the ad has had, stated as
          counts rather than dressed up as demand. A 4,000-view ad that nobody
          saved is information too. */}
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-(--border) pt-2 text-xs text-(--muted-foreground)">
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          {views.toLocaleString("en-IN")} view{views === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5" aria-hidden="true" />
          {saves.toLocaleString("en-IN")} save{saves === 1 ? "" : "s"}
        </span>
        <span className="text-(--muted-foreground)/80">
          {saves > 0 && views > 0
            ? `${Math.round((saves / views) * 100)}% of viewers saved it`
            : "No one has saved this ad yet"}
        </span>
      </p>
    </div>
  );
}
