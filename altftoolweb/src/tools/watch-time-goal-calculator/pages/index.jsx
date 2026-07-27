"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";
import { WEEKS_IN_WINDOW, YPP, computeWatchTimePlan, requiredViewDuration } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  targetHours: String(YPP.watchHours),
  currentHours: "950",
  viewsPerVideo: "3000",
  avgViewDurationMinutes: "4.2",
  videoLengthMinutes: "12",
  uploadsPerWeek: "2",
  weeksAvailable: "26",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [targetHours, setTargetHours] = useState(DEFAULTS.targetHours);
  const [currentHours, setCurrentHours] = useState(DEFAULTS.currentHours);
  const [viewsPerVideo, setViewsPerVideo] = useState(DEFAULTS.viewsPerVideo);
  const [avgViewDuration, setAvgViewDuration] = useState(DEFAULTS.avgViewDurationMinutes);
  const [videoLength, setVideoLength] = useState(DEFAULTS.videoLengthMinutes);
  const [uploadsPerWeek, setUploadsPerWeek] = useState(DEFAULTS.uploadsPerWeek);
  const [weeksAvailable, setWeeksAvailable] = useState(DEFAULTS.weeksAvailable);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      computeWatchTimePlan({
        targetHours: toNumber(targetHours),
        currentHours: toNumber(currentHours),
        viewsPerVideo: toNumber(viewsPerVideo),
        avgViewDurationMinutes: toNumber(avgViewDuration),
        videoLengthMinutes: toNumber(videoLength),
        uploadsPerWeek: toNumber(uploadsPerWeek),
      }),
    [targetHours, currentHours, viewsPerVideo, avgViewDuration, videoLength, uploadsPerWeek],
  );

  const required = useMemo(() => {
    if (plan.error) return null;
    return requiredViewDuration({
      remainingHours: plan.remainingHours,
      viewsPerVideo: toNumber(viewsPerVideo),
      uploadsPerWeek: toNumber(uploadsPerWeek),
      weeksAvailable: toNumber(weeksAvailable),
    });
  }, [plan, viewsPerVideo, uploadsPerWeek, weeksAvailable]);

  const hasError = Boolean(plan.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Watch Time Goal",
      `Target: ${NUM.format(plan.targetHours)} watch hours · already have ${NUM.format(plan.currentHours)}`,
      `Remaining: ${NUM.format(Math.round(plan.remainingHours))} hours`,
      `Watch hours per video: ${DEC2.format(plan.hoursPerVideo)}`,
      `Videos still needed: ${NUM.format(plan.videosNeeded)}`,
      `Time at this cadence: ${DEC.format(plan.weeksNeeded)} weeks (${NUM.format(plan.daysNeeded)} days)`,
      `Watch hours per week: ${DEC.format(plan.hoursPerWeek)}`,
      plan.percentViewed ? `Average percentage viewed: ${DEC.format(plan.percentViewed.percent)}%` : null,
      required && !required.error
        ? `To finish in the weeks available you would need ${DEC2.format(required.minutes)} minutes average view duration`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, plan, required]);

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
    setTargetHours(DEFAULTS.targetHours);
    setCurrentHours(DEFAULTS.currentHours);
    setViewsPerVideo(DEFAULTS.viewsPerVideo);
    setAvgViewDuration(DEFAULTS.avgViewDurationMinutes);
    setVideoLength(DEFAULTS.videoLengthMinutes);
    setUploadsPerWeek(DEFAULTS.uploadsPerWeek);
    setWeeksAvailable(DEFAULTS.weeksAvailable);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Creator analytics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Watch Time Goal Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many uploads, and how long, it takes to reach a watch-hour target — including the{" "}
          {NUM.format(YPP.watchHours)} hours the YouTube Partner Programme asks for inside a rolling{" "}
          {YPP.watchHourWindowDays} days.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-target">
              Watch-hour target
            </label>
            <input
              id="wt-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={targetHours}
              onChange={(event) => setTargetHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-current">
              Watch hours so far (last 12 months)
            </label>
            <input
              id="wt-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={currentHours}
              onChange={(event) => setCurrentHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-views">
              Average views per video
            </label>
            <input
              id="wt-views"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={viewsPerVideo}
              onChange={(event) => setViewsPerVideo(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-avd">
              Average view duration (minutes)
            </label>
            <input
              id="wt-avd"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={avgViewDuration}
              onChange={(event) => setAvgViewDuration(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-length">
              Typical video length (minutes)
            </label>
            <input
              id="wt-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={videoLength}
              onChange={(event) => setVideoLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-uploads">
              Uploads per week
            </label>
            <input
              id="wt-uploads"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={uploadsPerWeek}
              onChange={(event) => setUploadsPerWeek(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wt-weeks">
              Weeks you want to finish in
            </label>
            <input
              id="wt-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={weeksAvailable}
              onChange={(event) => setWeeksAvailable(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Videos still needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : NUM.format(plan.videosNeeded)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${DEC.format(plan.weeksNeeded)} weeks at this cadence · ${NUM.format(plan.daysNeeded)} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the watch time plan" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${DEC.format(plan.progressPct)}% of the watch-hour target reached`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, plan.progressPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {DEC.format(plan.progressPct)}% of {NUM.format(plan.targetHours)} hours
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Watch hours remaining", hasError ? dash : NUM.format(Math.round(plan.remainingHours))],
            ["Watch hours per video", hasError ? dash : DEC2.format(plan.hoursPerVideo)],
            ["Watch hours per week", hasError ? dash : DEC.format(plan.hoursPerWeek)],
            [
              "Average percentage viewed",
              hasError || !plan.percentViewed ? dash : `${DEC.format(plan.percentViewed.percent)}%`,
            ],
            [
              "Fits the 12-month rolling window",
              hasError ? dash : plan.withinWindow ? `Yes (limit ${DEC.format(WEEKS_IN_WINDOW)} weeks)` : "No",
            ],
            [
              "Videos in the weeks you set",
              hasError || !required || required.error ? dash : NUM.format(required.videos),
            ],
            [
              "View duration needed to finish in time",
              hasError || !required || required.error ? dash : `${DEC2.format(required.minutes)} min`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.notes.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Only valid public watch time counts toward monetisation, and hours older than {YPP.watchHourWindowDays} days
        drop out of the window. Private, unlisted and deleted videos do not count. Figures here are planning
        estimates — YouTube Studio is the authority on your actual position.
      </p>
    </main>
  );
}
