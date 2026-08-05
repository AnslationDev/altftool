import { Info, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { formatPrice, getPriceStats } from "../data/listings";
import { getMarket } from "../data/market";

/**
 * "Is this a good price?" — the one question a classifieds detail page is
 * usually failing to answer.
 *
 * Server-safe on purpose: no "use client", no hooks, no Date.now(). The whole
 * comparison is a synchronous read over the frozen corpus, so it lands in the
 * prerendered HTML where a crawler (and a visitor with JS off) can see it.
 *
 * HONESTY CONSTRAINTS, in order of how badly getting them wrong would mislead:
 *
 *  1. These are ASKING prices on Bazaar, not transaction prices. Nobody has
 *     agreed to pay any of them. The copy says so, every time, not in a
 *     footnote you can miss.
 *  2. A small sample is not a market. Under MIN_SAMPLE ads we render an
 *     honest "not enough comparable ads" panel instead of a statistic that
 *     would look authoritative and be noise.
 *  3. City and national numbers are never silently mixed. If the city sample
 *     is too thin we fall back to the national pool AND say we did.
 *  4. The pool is a whole category, unadjusted for condition, age, size or
 *     model. A 2011 hatchback and a 2023 SUV are both "Cars". Stated.
 *
 * Two categories are excluded outright because the comparison is not merely
 * weak there, it is a category error: `jobs` prices are salaries, and
 * `free-giveaway` prices are all ₹0.
 */

/** Categories where a price percentile means nothing. */
const EXCLUDED_CATEGORIES = new Set(["jobs", "free-giveaway"]);

/**
 * Categories whose pool mixes pricing periods — `properties` carries both
 * sale prices and monthly rents, `rentals` carries per-day and per-month.
 * We still show the comparison (the band is the honest shape of the pool)
 * but we say what is in it.
 */
const MIXED_PERIOD_CATEGORIES = new Set(["properties", "rentals"]);

/** Below this, a percentile is an anecdote wearing a lab coat. */
const MIN_SAMPLE = 5;

/** Below this, show the number but tell the reader to distrust it. */
const THIN_SAMPLE = 20;

/** A price this close to the median is "the median" in plain language. */
const NEAR_MEDIAN_PCT = 4;

function clamp(value, low, high) {
  return Math.min(Math.max(value, low), high);
}

/** Honest stand-in when there is nothing worth comparing against. */
function NotEnoughData({ categoryName, cityName }) {
  return (
    <section aria-labelledby="price-insight-heading" className="mt-7">
      <h2 id="price-insight-heading" className="bzr-section-title mb-3">
        How this price compares
      </h2>
      <p className="bzr-note">
        <Info className="mt-0.5 h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
        <span>
          Not enough comparable ads yet. There are too few {categoryName.toLowerCase()} ads in{" "}
          {cityName} — and across Bazaar — to say anything useful about this price, so we are not
          going to invent a benchmark from a handful of listings.
        </span>
      </p>
    </section>
  );
}

export default function PriceInsight({ listing }) {
  if (!listing) return null;
  if (EXCLUDED_CATEGORIES.has(listing.categorySlug)) return null;
  // A ₹0 or missing price has no position in a distribution of prices.
  if (!(listing.price > 0)) return null;

  const cityStats = getPriceStats(listing.categorySlug, listing.citySlug);
  const usingCity = Boolean(cityStats && cityStats.count >= MIN_SAMPLE);
  const stats = usingCity ? cityStats : getPriceStats(listing.categorySlug);

  if (!stats || stats.count < MIN_SAMPLE) {
    return <NotEnoughData categoryName={listing.categoryName} cityName={listing.cityName} />;
  }

  const { p25, p75, median, count } = stats;
  const price = listing.price;
  // Category names are plural ("Cars", "Properties"), so the copy below
  // always reads "<Category> ads <scope>" rather than trying to build a
  // singular noun out of them.
  const scope = usingCity ? `in ${listing.cityName}` : `across ${getMarket().countryName}`;

  /* ---------------- Where the price sits ---------------- */

  const deltaPct = median > 0 ? Math.round(((price - median) / median) * 100) : 0;
  const nearMedian = Math.abs(deltaPct) <= NEAR_MEDIAN_PCT;

  let verdict;
  let VerdictIcon;
  let verdictTone;

  if (price < p25) {
    verdict = "Below most comparable ads";
    VerdictIcon = TrendingDown;
    verdictTone = "text-(--bzr-free)";
  } else if (price > p75) {
    verdict = "Above most comparable ads";
    VerdictIcon = TrendingUp;
    verdictTone = "text-(--bzr-featured)";
  } else if (nearMedian) {
    verdict = "Right around the median";
    VerdictIcon = Minus;
    verdictTone = "text-(--foreground)";
  } else {
    verdict = "Inside the usual range";
    VerdictIcon = Minus;
    verdictTone = "text-(--foreground)";
  }

  let explanation;
  if (price < p25) {
    explanation = `Cheaper than roughly three quarters of ${listing.categoryName} ads ${scope}. That can mean a genuine bargain — or heavier wear, an older model, or a seller in a hurry. Inspect it properly before you assume it is the first one.`;
  } else if (price > p75) {
    explanation = `Dearer than roughly three quarters of ${listing.categoryName} ads ${scope}. Worth asking what justifies it: condition, low usage, accessories, or paperwork that other sellers do not have.`;
  } else if (nearMedian) {
    explanation = `Within ${NEAR_MEDIAN_PCT}% of the median asking price for ${listing.categoryName} ${scope}. An ordinary price, which is neither a reason to rush nor a reason to walk.`;
  } else {
    explanation = `Inside the middle half of ${listing.categoryName} asking prices ${scope} — the band where most ads sit.`;
  }

  const deltaSentence = nearMedian
    ? "Effectively the median asking price."
    : `About ${Math.abs(deltaPct)}% ${deltaPct < 0 ? "below" : "above"} the ${formatPrice(median)} median.`;

  /* ---------------- Bar geometry ----------------
   * The scale is the p25–p75 band plus one IQR of context each side. Using
   * min..max instead would let a single ₹80 lakh outlier squash the band that
   * actually matters into two pixels. A price outside the scale is clamped to
   * the edge and flagged, never silently redrawn as if it were inside. */

  const iqr = Math.max(p75 - p25, 1);
  const domainLo = Math.max(0, p25 - iqr);
  const domainHi = p75 + iqr;
  const span = Math.max(domainHi - domainLo, 1);
  const toPct = (value) => clamp(((value - domainLo) / span) * 100, 0, 100);

  const offScale = price < domainLo ? "low" : price > domainHi ? "high" : null;
  const bandLeft = toPct(p25);
  const bandWidth = Math.max(toPct(p75) - bandLeft, 1);
  const medianPct = toPct(median);
  const pricePct = toPct(clamp(price, domainLo, domainHi));

  const barLabel = [
    `This ad asks ${formatPrice(price)}.`,
    `The middle half of ${listing.categoryName} ads ${scope} asks between ${formatPrice(p25)} and ${formatPrice(p75)},`,
    `with a median of ${formatPrice(median)}, from ${count} ads.`,
    offScale === "low" ? "This ad sits below the left edge of the chart." : null,
    offScale === "high" ? "This ad sits beyond the right edge of the chart." : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section aria-labelledby="price-insight-heading" className="mt-7">
      <h2 id="price-insight-heading" className="bzr-section-title mb-3">
        How this price compares
      </h2>

      <div className="bzr-panel">
        {/* ---------------- Verdict ---------------- */}
        <div className="flex items-start gap-2.5">
          <VerdictIcon className={`mt-0.5 h-5 w-5 shrink-0 ${verdictTone}`} aria-hidden="true" />
          <div className="min-w-0">
            <p className={`text-base font-bold leading-tight ${verdictTone}`}>{verdict}</p>
            <p className="mt-0.5 text-sm font-semibold text-(--foreground)">{deltaSentence}</p>
          </div>
        </div>

        <p className="mt-2.5 text-sm leading-relaxed text-(--muted-foreground)">{explanation}</p>

        {/* ---------------- The bar ----------------
            Pure CSS: a track, an absolutely positioned p25–p75 band, a median
            tick and a marker for this ad. No chart library, and nothing that
            needs JavaScript to draw. role="img" + aria-label because the
            shape is the message and the parts are meaningless alone.

            DELIBERATELY PHYSICAL (`left: %` + -translate-x-1/2): this is a
            numeric price axis — chart content, not interface — and axes keep
            their low→high left→right orientation under RTL, as charts do.
            Half-converting would also break the math: `inset-inline-start`
            percentages mirror but `translateX(-50%)` centering does not. */}
        <div className="mt-5">
          <div className="relative h-12" role="img" aria-label={barLabel}>
            {/* This ad's price, floated above its marker. */}
            <span
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--foreground) px-2 py-0.5 text-[0.68rem] font-bold text-(--background)"
              style={{ left: `${clamp(pricePct, 8, 92)}%` }}
            >
              {offScale === "low" ? "◂ " : ""}
              {formatPrice(price)}
              {offScale === "high" ? " ▸" : ""}
            </span>

            {/* Full scale */}
            <span className="absolute left-0 right-0 top-7 h-1.5 rounded-full bg-(--muted)" />

            {/* Middle half */}
            <span
              className="absolute top-7 h-1.5 rounded-full bg-(--primary)/35"
              style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
            />

            {/* Median tick */}
            <span
              className="absolute top-[1.375rem] h-3.5 w-0.5 -translate-x-1/2 rounded-full bg-(--muted-foreground)"
              style={{ left: `${medianPct}%` }}
            />

            {/* This ad */}
            <span
              className="absolute top-5 h-6 w-1 -translate-x-1/2 rounded-full bg-(--foreground) ring-2 ring-(--background)"
              style={{ left: `${pricePct}%` }}
            />
          </div>

          {/* Band endpoints, aligned to the band itself rather than the track
              so the numbers sit under the marks they describe. */}
          <div className="relative mt-1 h-4 text-[0.68rem] tabular-nums text-(--muted-foreground)">
            <span className="absolute -translate-x-1/2" style={{ left: `${clamp(bandLeft, 6, 94)}%` }}>
              {formatPrice(p25)}
            </span>
            <span
              className="absolute -translate-x-1/2"
              style={{ left: `${clamp(bandLeft + bandWidth, 6, 94)}%` }}
            >
              {formatPrice(p75)}
            </span>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--muted-foreground)">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-1 rounded-full bg-(--foreground)" aria-hidden="true" />
              This ad
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-0.5 rounded-full bg-(--muted-foreground)" aria-hidden="true" />
              Median {formatPrice(median)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-full bg-(--primary)/35" aria-hidden="true" />
              Middle half {formatPrice(p25)}–{formatPrice(p75)}
            </span>
          </p>
        </div>

        {/* ---------------- The caveats ---------------- */}
        <hr className="my-4 border-(--border)" />

        <div className="flex items-start gap-2 text-xs leading-relaxed text-(--muted-foreground)">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
          <div className="min-w-0">
            <p>
              Based on{" "}
              <strong className="font-semibold text-(--foreground)">
                {count.toLocaleString("en-IN")} {listing.categoryName.toLowerCase()} ad
                {count === 1 ? "" : "s"}
              </strong>{" "}
              {usingCity ? `in ${listing.cityName}` : "across all 50 cities"}. These are{" "}
              <strong className="font-semibold text-(--foreground)">asking prices</strong> — what
              sellers put on Bazaar, not what anyone paid. Nothing here is adjusted for condition,
              age, model or size.
            </p>

            {!usingCity ? (
              <p className="mt-1.5">
                {cityStats
                  ? `Only ${cityStats.count} such ad${cityStats.count === 1 ? "" : "s"} in ${listing.cityName} — too few to compare against, so this uses the national pool instead. Local prices can differ.`
                  : `No other ${listing.categoryName.toLowerCase()} ads in ${listing.cityName} to compare against, so this uses the national pool instead. Local prices can differ.`}
              </p>
            ) : null}

            {usingCity && count < THIN_SAMPLE ? (
              <p className="mt-1.5">
                {count} ads is a thin sample — read this as a rough hint, not a market rate.
              </p>
            ) : null}

            {MIXED_PERIOD_CATEGORIES.has(listing.categorySlug) ? (
              <p className="mt-1.5">
                {listing.categoryName} ads mix sale prices with rents, so this band spans both.
                Compare it against ads on the same terms as this one before drawing a conclusion.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
