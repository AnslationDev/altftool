"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import { computeVideoEngagement } from "../lib";

const COUNT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const RATE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const count = (value) => (Number.isFinite(value) ? COUNT.format(value) : DASH);
const pct = (value) => (value === null || !Number.isFinite(value) ? DASH : `${RATE.format(value)}%`);
const num = (value) => (Number.isFinite(value) ? RATE.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  views: "100000",
  impressions: "1200000",
  followers: "250000",
  likes: "4500",
  comments: "300",
  shares: "150",
  saves: "50",
  lengthMinutes: "10",
  lengthSeconds: "0",
  avdMinutes: "3",
  avdSeconds: "42",
};

const FIELDS = [
  ["views", "Views", "1000"],
  ["impressions", "Impressions (optional)", "1000"],
  ["followers", "Subscribers / followers (optional)", "100"],
  ["likes", "Likes", "10"],
  ["comments", "Comments", "1"],
  ["shares", "Shares", "1"],
  ["saves", "Saves / bookmarks", "1"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      computeVideoEngagement({
        views: Number(values.views),
        impressions: Number(values.impressions),
        followers: Number(values.followers),
        likes: Number(values.likes),
        comments: Number(values.comments),
        shares: Number(values.shares),
        saves: Number(values.saves),
        videoLengthSeconds: Number(values.lengthMinutes) * 60 + Number(values.lengthSeconds),
        avgViewDurationSeconds: Number(values.avdMinutes) * 60 + Number(values.avdSeconds),
      }),
    [values],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Video Engagement Rate Calculator",
      `Views: ${count(result.views)}`,
      `Total engagements: ${count(result.totalEngagements)}`,
      `Engagement rate by views: ${pct(result.engagementByViews)}`,
      `Engagement rate by impressions: ${pct(result.engagementByImpressions)}`,
      `Engagement rate by followers: ${pct(result.engagementByFollowers)}`,
      `View-through rate: ${pct(result.viewThroughRate)}`,
      `Average percentage viewed: ${pct(result.averagePercentageViewed)}`,
      `Average view duration: ${result.avgViewDurationLabel}`,
      `Estimated total watch time: ${num(result.totalWatchHours)} hours`,
      `Comments per 1,000 views: ${num(result.commentsPerThousandViews)}`,
    ].join("\n");
  }, [result]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const failed = Boolean(result.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Video analytics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Engagement Rate Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the counts from your own analytics export and get engagement rate measured three
          ways, plus view-through rate, average percentage viewed and total watch time.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Counts from your analytics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`vec-${key}`}>
                {label}
              </label>
              <input
                id={`vec-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step={step}
                value={values[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Retention</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold">Video length</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="vec-len-min">
                  Minutes
                </label>
                <input
                  id="vec-len-min"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={values.lengthMinutes}
                  onChange={(event) => setField("lengthMinutes", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="vec-len-sec">
                  Seconds
                </label>
                <input
                  id="vec-len-sec"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={values.lengthSeconds}
                  onChange={(event) => setField("lengthSeconds", event.target.value)}
                />
              </div>
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold">Average view duration</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="vec-avd-min">
                  Minutes
                </label>
                <input
                  id="vec-avd-min"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={values.avdMinutes}
                  onChange={(event) => setField("avdMinutes", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="vec-avd-sec">
                  Seconds
                </label>
                <input
                  id="vec-avd-sec"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={values.avdSeconds}
                  onChange={(event) => setField("avdSeconds", event.target.value)}
                />
              </div>
            </div>
          </fieldset>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Engagement rate by views
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : pct(result.engagementByViews)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${count(result.totalEngagements)} engagements on ${count(result.views)} views · ${result.engagementBand.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy engagement rate results"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total engagements", failed ? DASH : count(result.totalEngagements)],
            ["Engagement rate by impressions", failed ? DASH : pct(result.engagementByImpressions)],
            ["Engagement rate by followers", failed ? DASH : pct(result.engagementByFollowers)],
            ["View-through rate (views / impressions)", failed ? DASH : pct(result.viewThroughRate)],
            ["Like rate", failed ? DASH : pct(result.likeRate)],
            ["Comment rate", failed ? DASH : pct(result.commentRate)],
            ["Share rate", failed ? DASH : pct(result.shareRate)],
            ["Save rate", failed ? DASH : pct(result.saveRate)],
            ["Comments per 1,000 views", failed ? DASH : num(result.commentsPerThousandViews)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {failed ? null : (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.engagementBand.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Retention and watch time</h2>
        <p className="mt-3 text-3xl font-semibold text-[var(--primary)]">
          {failed ? DASH : pct(result.averagePercentageViewed)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {failed || !result.retentionBand
            ? "Enter a video length to see average percentage viewed."
            : result.retentionBand.label}
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Average view duration", failed ? DASH : result.avgViewDurationLabel],
            ["Estimated total watch time", failed ? DASH : `${num(result.totalWatchHours)} hours`],
            ["Total watch time (clock)", failed ? DASH : result.totalWatchLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {failed || !result.retentionBand ? null : (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.retentionBand.note}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates are arithmetic on the numbers you enter. The Low / Typical / Strong labels are creator
        reporting shorthand, not platform-published benchmarks — your own channel history is the
        better comparison.
      </p>
    </main>
  );
}
