"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GalleryHorizontalEnd, RotateCcw } from "lucide-react";

import {
  DEFAULT_SWIPE_RATE,
  IG_MAX_SLIDES,
  IG_MIN_SLIDES,
  planCarousel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 1,
});

const DASH = "—";
const secs = (value) => (Number.isFinite(value) ? `${NUM.format(value)}s` : DASH);
const share = (value) => (Number.isFinite(value) ? PCT.format(value) : DASH);

const DEFAULTS = {
  topic: "3 mistakes that kill carousel reach",
  slideCount: "8",
  swipeRate: String(Math.round(DEFAULT_SWIPE_RATE * 100)),
  wordsPerSlide: "25",
  includeRecap: true,
  includeCta: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [slideCount, setSlideCount] = useState(DEFAULTS.slideCount);
  const [swipeRate, setSwipeRate] = useState(DEFAULTS.swipeRate);
  const [wordsPerSlide, setWordsPerSlide] = useState(DEFAULTS.wordsPerSlide);
  const [includeRecap, setIncludeRecap] = useState(DEFAULTS.includeRecap);
  const [includeCta, setIncludeCta] = useState(DEFAULTS.includeCta);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planCarousel({
        slideCount: Number(slideCount),
        swipeRate: Number(swipeRate) / 100,
        wordsPerSlide: Number(wordsPerSlide),
        includeRecap,
        includeCta,
        topic,
      }),
    [slideCount, swipeRate, wordsPerSlide, includeRecap, includeCta, topic],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    const lines = [
      `Instagram carousel plan${plan.topic ? `: ${plan.topic}` : ""}`,
      `${plan.slideCount} slides | ${share(plan.swipeRate)} swipe-through | ${plan.recommendedRatio}`,
      `Projected completion: ${share(plan.completionRate)} | avg slides seen: ${NUM.format(plan.slidesViewed)}`,
      "",
    ];
    plan.slides.forEach((slide) => {
      lines.push(
        `${slide.position}. ${slide.label} (${slide.words} words, ${NUM.format(slide.seconds)}s) - ${slide.purpose}`,
      );
    });
    return lines.join("\n");
  }, [plan]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTopic(DEFAULTS.topic);
    setSlideCount(DEFAULTS.slideCount);
    setSwipeRate(DEFAULTS.swipeRate);
    setWordsPerSlide(DEFAULTS.wordsPerSlide);
    setIncludeRecap(DEFAULTS.includeRecap);
    setIncludeCta(DEFAULTS.includeCta);
    setCopied(false);
  };

  const hasError = Boolean(plan.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GalleryHorizontalEnd className="h-4 w-4" aria-hidden="true" />
          Carousel planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Instagram Carousel Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out slide roles, word budgets and read time, then see how many people a given
          swipe-through rate leaves on the last slide.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="carousel-topic">
            Carousel topic
          </label>
          <input
            id="carousel-topic"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="carousel-slides">
              Slides ({IG_MIN_SLIDES}-{IG_MAX_SLIDES})
            </label>
            <input
              id="carousel-slides"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={IG_MIN_SLIDES}
              max={IG_MAX_SLIDES}
              step="1"
              value={slideCount}
              onChange={(event) => setSlideCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carousel-swipe">
              Swipe-through rate per slide (%)
            </label>
            <input
              id="carousel-swipe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={swipeRate}
              onChange={(event) => setSwipeRate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="carousel-words">
              Words on a standard point slide
            </label>
            <input
              id="carousel-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="200"
              step="1"
              value={wordsPerSlide}
              onChange={(event) => setWordsPerSlide(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            htmlFor="carousel-recap"
          >
            <input
              id="carousel-recap"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeRecap}
              onChange={(event) => setIncludeRecap(event.target.checked)}
            />
            Include a recap slide
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            htmlFor="carousel-cta"
          >
            <input
              id="carousel-cta"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeCta}
              onChange={(event) => setIncludeCta(event.target.checked)}
            />
            Include a call-to-action slide
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Projected completion (reach the last slide)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : share(plan.completionRate)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `Average viewer sees ${NUM.format(plan.slidesViewed)} of ${plan.slideCount} slides`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy carousel plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset carousel planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Point slides in the middle", hasError ? DASH : String(plan.pointSlides)],
            ["Total words across the carousel", hasError ? DASH : String(plan.totalWords)],
            ["Read time if every slide is seen", hasError ? DASH : secs(plan.rawReadSeconds)],
            ["Expected dwell time per viewer", hasError ? DASH : secs(plan.weightedDwellSeconds)],
            ["Share of slides actually consumed", hasError ? DASH : share(plan.viewedShare)],
            ["Recommended frame", hasError ? DASH : plan.recommendedRatio],
            [
              "Caption",
              hasError
                ? DASH
                : `${plan.captionPreviewChars} chars visible, ${plan.captionMaxChars} max, up to ${plan.maxHashtags} hashtags`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Slide-by-slide plan</h2>
          <ol className="mt-4 space-y-3">
            {plan.slides.map((slide) => (
              <li
                key={slide.position}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[var(--primary)] px-2 text-xs font-bold text-[var(--primary-foreground)]">
                    {slide.position}
                  </span>
                  <span className="text-sm font-semibold">{slide.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {slide.words} words &middot; {NUM.format(slide.seconds)}s read
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">{slide.purpose}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{slide.cue}</p>
                <div
                  className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${share(slide.reachShare)} of viewers projected to reach slide ${slide.position}`}
                >
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${Math.max(0, Math.min(100, slide.reachShare * 100))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {share(slide.reachShare)} of viewers projected to reach this slide
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Retention here is a constant-rate swipe model, not a measurement. Read your own carousel
        insights and feed your real per-slide drop-off back into the swipe-through field.
      </p>
    </main>
  );
}
