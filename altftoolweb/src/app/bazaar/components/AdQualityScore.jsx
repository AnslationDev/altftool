/**
 * Ad quality score — "is my ad any good?", answered with a next action.
 *
 * A seller on a classifieds site gets no feedback at all: they post, and then
 * they wait. This component scores a draft (in the post wizard's review step)
 * or a posted ad (on My ads) out of 100, and — the part that actually matters —
 * names the single change that would raise the score most, with the number of
 * points it is worth. A bare score with no path forward is a grade, not advice.
 *
 * Server-safe on purpose: no "use client", no hooks, no clock. It is imported by
 * two client components, so it ships in their bundle, but nothing here needs a
 * browser and nothing here can drift between server HTML and first client
 * render.
 *
 * ── WHAT IS SCORED, AND WHY THESE WEIGHTS ────────────────────────────────────
 *
 * Only things that are *measurable from the draft itself*. There is no view
 * data, no reply data and no model of buyer behaviour behind this, so the score
 * cannot claim to predict sales — it measures completeness, which is the part a
 * seller controls. The copy says exactly that.
 *
 *   Photos          25   The largest single lever on a classifieds site. An ad
 *                        with no photo is scrolled past; the difference between
 *                        one photo and five is the difference between "maybe"
 *                        and "I can see the scratches". 5 points per photo,
 *                        capped at 5 photos (a 6th adds little).
 *   Description     20   Where condition, age and reason-for-selling live. The
 *                        questions a seller answers here are the ones they do
 *                        not have to answer twenty times in chat.
 *   Category detail 20   The category's own declared attributes (year, km,
 *                        brand, bedrooms…). These are what buyers *filter* on,
 *                        so an unfilled attribute does not weaken the ad — it
 *                        removes the ad from the results entirely.
 *   Title           20   Read as a headline in a grid of 24 cards. Too short
 *                        says nothing; past ~60 characters the card truncates.
 *   Price            10   A missing price is a missing filter match, but a
 *                        price is one field and cheap to fix, so it is worth
 *                        less than the four above.
 *   Locality          5   One dropdown. Worth points because buyers sort by
 *                        distance, but not worth more than a photo.
 *                        ────
 *                        100
 *
 * Deliberately NOT scored: anything requiring a judgement this code cannot
 * make (is the photo in focus? is the price fair? is the description honest?).
 * Inventing a "keyword richness" or "photo quality" factor would produce a
 * confident number with nothing behind it.
 *
 * Integers only, everywhere. A score of "72.4" implies a precision that six
 * hand-picked weights do not have.
 */

import { AlertTriangle, ArrowUpRight, Check, Info } from "lucide-react";

import { getCategory } from "../data/categories";

/** Photos beyond this add nothing to the score. */
const PHOTO_TARGET = 5;

/** Categories where ₹0 is the whole point, so "no price" is not a gap. */
const FREE_CATEGORIES = new Set(["free-giveaway"]);

/** Title length that reads as a headline without being truncated on a card. */
const TITLE_GOOD_MIN = 25;
const TITLE_GOOD_MAX = 60;

/** Description length bands, in characters. */
const DESC_THIN = 20;
const DESC_OK = 80;
const DESC_GOOD = 200;

const BANDS = [
  { min: 75, label: "Strong", tone: "text-(--bzr-free)", bar: "bg-(--bzr-free)" },
  { min: 50, label: "Fair", tone: "text-(--bzr-featured)", bar: "bg-(--bzr-featured)" },
  { min: 0, label: "Weak", tone: "text-(--bzr-urgent)", bar: "bg-(--bzr-urgent)" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Count attribute values a seller has actually supplied. */
function countFilledAttributes(attributes, category) {
  const declared = category?.attributes || [];
  if (declared.length === 0) return { filled: 0, total: 0 };
  let filled = 0;
  for (const attr of declared) {
    const value = attributes?.[attr.key];
    // `false` is an unchecked toggle, not an answer. "" and null are empty.
    if (value === "" || value === false || value == null) continue;
    filled += 1;
  }
  return { filled, total: declared.length };
}

/**
 * Score an ad or draft out of 100.
 *
 * Accepts the shape both call sites already have: the wizard's in-progress
 * draft and a posted ad from the store are close enough that one normaliser
 * covers both (`images` array or an explicit `photoCount`).
 *
 * Returns `{ score, band, factors, topAction }` where every factor carries the
 * points it earned, the points available, and the advice that would close the
 * gap. `topAction` is the factor with the most points left on the table —
 * declaration order breaks ties, deliberately ordered by how much each lever
 * moves a real ad.
 */
export function scoreAd(input = {}) {
  const {
    title = "",
    description = "",
    attributes = null,
    categorySlug = "",
    locality = "",
    price = null,
  } = input;

  const photoCount = Number.isFinite(input.photoCount)
    ? Math.max(0, Math.round(input.photoCount))
    : Array.isArray(input.images)
      ? input.images.length
      : 0;

  const category = categorySlug ? getCategory(categorySlug) : null;
  const { filled, total } = countFilledAttributes(attributes, category);

  const titleLength = String(title).trim().length;
  const descriptionLength = String(description).trim().length;
  const numericPrice = Number(price);
  const isFree = FREE_CATEGORIES.has(categorySlug);
  const hasPrice = isFree || (Number.isFinite(numericPrice) && numericPrice > 0);
  const hasLocality = Boolean(String(locality).trim());

  const factors = [];

  /* ---------------- Photos: 25 ---------------- */
  {
    const counted = Math.min(photoCount, PHOTO_TARGET);
    const earned = counted * 5;
    const missing = PHOTO_TARGET - counted;
    factors.push({
      key: "photos",
      label: "Photos",
      earned,
      max: 25,
      detail:
        photoCount === 0
          ? "No photos attached."
          : `${plural(photoCount, "photo")} attached${photoCount > PHOTO_TARGET ? ` — ${PHOTO_TARGET} are counted` : ""}.`,
      advice:
        photoCount === 0
          ? `Add ${PHOTO_TARGET} photos`
          : `Add ${plural(missing, "more photo")}`,
      why:
        photoCount === 0
          ? "An ad with no photo gets scrolled past."
          : "Buyers judge condition from photos before they read a word.",
    });
  }

  /* ---------------- Description: 20 ---------------- */
  {
    let earned;
    let advice;
    if (descriptionLength >= DESC_GOOD) {
      earned = 20;
      advice = null;
    } else if (descriptionLength >= DESC_OK) {
      earned = 14;
      advice = `Write ${DESC_GOOD - descriptionLength} more characters of description`;
    } else if (descriptionLength >= DESC_THIN) {
      earned = 8;
      advice = `Expand the description past ${DESC_GOOD} characters`;
    } else {
      earned = 0;
      advice = "Write a description of at least a couple of sentences";
    }
    factors.push({
      key: "description",
      label: "Description",
      earned,
      max: 20,
      detail: `${plural(descriptionLength, "character")}.`,
      advice,
      why: "Condition, age and why you are selling — the three questions every buyer asks.",
    });
  }

  /* ---------------- Category detail: 20 ---------------- */
  {
    // A category with no declared attributes cannot be penalised for empty
    // ones, so the points are awarded rather than silently lowering the ceiling
    // — otherwise a perfect ad in such a category could never score 100.
    const earned = total === 0 ? 20 : Math.round((filled / total) * 20);
    const missing = total - filled;
    factors.push({
      key: "details",
      label: category ? `${category.name} details` : "Category details",
      earned,
      max: 20,
      detail:
        total === 0
          ? "This category asks for no extra details."
          : `${filled} of ${total} filled in.`,
      advice: missing > 0 ? `Fill in ${plural(missing, "more detail")}` : null,
      why: "These are the filters buyers use — an empty field drops you out of their results.",
    });
  }

  /* ---------------- Title: 20 ---------------- */
  {
    let earned;
    let advice;
    if (titleLength === 0) {
      earned = 0;
      advice = "Write a title";
    } else if (titleLength < 10) {
      earned = 0;
      advice = `Lengthen the title to at least ${TITLE_GOOD_MIN} characters`;
    } else if (titleLength < TITLE_GOOD_MIN) {
      earned = 10;
      advice = `Add ${TITLE_GOOD_MIN - titleLength} more characters to the title`;
    } else if (titleLength <= TITLE_GOOD_MAX) {
      earned = 20;
      advice = null;
    } else {
      earned = 16;
      advice = `Trim the title to ${TITLE_GOOD_MAX} characters`;
    }
    factors.push({
      key: "title",
      label: "Title",
      earned,
      max: 20,
      detail:
        titleLength > TITLE_GOOD_MAX
          ? `${plural(titleLength, "character")} — cards cut off around ${TITLE_GOOD_MAX}.`
          : `${plural(titleLength, "character")}.`,
      advice,
      why: `Brand, model and condition in ${TITLE_GOOD_MIN}–${TITLE_GOOD_MAX} characters reads best in a grid.`,
    });
  }

  /* ---------------- Price: 10 ---------------- */
  factors.push({
    key: "price",
    label: "Price",
    earned: hasPrice ? 10 : 0,
    max: 10,
    detail: isFree
      ? "Free listing — no price needed."
      : hasPrice
        ? "Set."
        : "Not set.",
    advice: hasPrice ? null : "Set a price",
    why: "Ads without a price are excluded from every price filter and every sort.",
  });

  /* ---------------- Locality: 5 ---------------- */
  factors.push({
    key: "locality",
    label: "Locality",
    earned: hasLocality ? 5 : 0,
    max: 5,
    detail: hasLocality ? String(locality).trim() : "Not set.",
    advice: hasLocality ? null : "Pick a locality",
    why: "Buyers filter by neighbourhood more than any other field.",
  });

  const score = factors.reduce((sum, factor) => sum + factor.earned, 0);

  // The next action: most points available, first declared wins a tie.
  let topAction = null;
  for (const factor of factors) {
    const gain = factor.max - factor.earned;
    if (gain <= 0 || !factor.advice) continue;
    if (!topAction || gain > topAction.gain) {
      topAction = { ...factor, gain };
    }
  }

  return { score, band: bandFor(score), factors, topAction };
}

/**
 * The visible score.
 *
 * `compact` is the My ads variant — one row, the score, the band and the next
 * action. The default is the wizard's review-step variant, which shows every
 * factor so a seller can see where the missing points are rather than guessing
 * at the one suggestion.
 */
export default function AdQualityScore({ ad, compact = false, className = "" }) {
  const { score, band, factors, topAction } = scoreAd(ad || {});

  const meter = (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-(--muted)"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${score} out of 100 — ${band.label}`}
      aria-label="Ad quality score"
    >
      <span
        className={`block h-full rounded-full ${band.bar} motion-safe:transition-[width] motion-safe:duration-300`}
        style={{ width: `${score}%` }}
      />
    </div>
  );

  if (compact) {
    return (
      <div className={`rounded-lg border border-(--border) bg-(--muted)/30 px-3 py-2.5 ${className}`}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
            Ad quality
          </span>
          <span className="text-sm font-bold tabular-nums text-(--foreground)">
            {score}
            <span className="text-(--muted-foreground)">/100</span>{" "}
            <span className={band.tone}>{band.label}</span>
          </span>
        </div>
        <div className="mt-1.5">{meter}</div>
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-(--muted-foreground)">
          {topAction ? (
            <>
              {/* ArrowUpRight is a growth glyph ("score goes up"), not a
                  navigation arrow — it does not flip under RTL, matching how
                  charts keep their orientation. */}
              <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-(--foreground)">{topAction.advice}</strong>:
                +{topAction.gain} points
              </span>
            </>
          ) : (
            <>
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--bzr-free)" aria-hidden="true" />
              <span>Everything measurable is filled in.</span>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={`bzr-panel ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-(--foreground)">Ad quality</h3>
          <p className="mt-0.5 text-xs text-(--muted-foreground)">
            How complete this ad is — not a prediction of what it will sell for.
          </p>
        </div>
        <p className="shrink-0 text-end leading-none">
          <span className="text-3xl font-bold tabular-nums text-(--foreground)">{score}</span>
          <span className="text-sm text-(--muted-foreground)">/100</span>
          <span className={`ms-2 text-sm font-bold ${band.tone}`}>{band.label}</span>
        </p>
      </div>

      <div className="mt-3">{meter}</div>

      {/* The point of the whole component. */}
      {topAction ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-(--primary)/40 bg-(--primary)/8 px-3 py-2.5">
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-text)" aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-(--foreground)">
              {topAction.advice}: +{topAction.gain} points
            </p>
            <p className="mt-0.5 text-(--muted-foreground)">{topAction.why}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-(--border) bg-(--muted)/40 px-3 py-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--bzr-free)" aria-hidden="true" />
          <p className="min-w-0 text-sm text-(--foreground)">
            Nothing measurable is missing. The rest — clear photos, an honest description, a fair
            price — is not something a score can check for you.
          </p>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {factors.map((factor) => {
          const complete = factor.earned >= factor.max;
          return (
            <li key={factor.key} className="flex items-start gap-2 text-xs">
              {complete ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--bzr-free)" aria-hidden="true" />
              ) : (
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--muted-foreground)"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-(--foreground)">{factor.label}</span>{" "}
                <span className="text-(--muted-foreground)">{factor.detail}</span>
              </span>
              <span className="shrink-0 tabular-nums text-(--muted-foreground)">
                {factor.earned}/{factor.max}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-(--muted-foreground)">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        <span>
          Scored from six things we can count — photos, title length, description length, category
          details filled, price and locality. It says nothing about whether the price is right or
          the photos are good, because this prototype cannot know either.
        </span>
      </p>
    </div>
  );
}
