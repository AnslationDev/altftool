"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import { DEFAULT_FORMAT_WEIGHTS, POST_FORMATS, planCommunityPosts } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DATE_LABEL = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const prettyDate = (iso) => DATE_LABEL.format(new Date(`${iso}T00:00:00Z`));

const DEFAULTS = {
  startDate: "2026-08-03",
  horizonDays: "28",
  uploadIntervalDays: "7",
  postsPerWeek: "3",
  weights: { ...DEFAULT_FORMAT_WEIGHTS },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [horizonDays, setHorizonDays] = useState(DEFAULTS.horizonDays);
  const [uploadIntervalDays, setUploadIntervalDays] = useState(DEFAULTS.uploadIntervalDays);
  const [postsPerWeek, setPostsPerWeek] = useState(DEFAULTS.postsPerWeek);
  const [weights, setWeights] = useState(DEFAULTS.weights);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planCommunityPosts({
        startDate,
        horizonDays: Number(horizonDays),
        uploadIntervalDays: Number(uploadIntervalDays),
        postsPerWeek: Number(postsPerWeek),
        formatWeights: weights,
      }),
    [startDate, horizonDays, uploadIntervalDays, postsPerWeek, weights],
  );

  const failed = Boolean(plan.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Community post plan",
      `Window: ${plan.startDate} to ${plan.endDate} (${plan.horizonDays} days)`,
      `Uploads: ${plan.totalUploads} · Community posts: ${plan.totalPosts}`,
      `Touchpoints per week: ${num(plan.touchpointsPerWeek)}`,
      `Longest silent gap: ${num(plan.longestSilentGapDays)} days`,
      `Weekly effort: ${num(plan.effortMinutesPerWeek)} minutes`,
      "",
      ...plan.posts.map(
        (post) => `${post.date} (${post.weekday}) · ${post.formatLabel} · ${post.role} — ${post.idea}`,
      ),
    ].join("\n");
  }, [plan, failed]);

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
    setStartDate(DEFAULTS.startDate);
    setHorizonDays(DEFAULTS.horizonDays);
    setUploadIntervalDays(DEFAULTS.uploadIntervalDays);
    setPostsPerWeek(DEFAULTS.postsPerWeek);
    setWeights({ ...DEFAULTS.weights });
    setCopied(false);
  };

  const setWeight = (id, value) => {
    setWeights((current) => ({ ...current, [id]: Number(value) }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Creator cadence
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Community Post Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Spread polls, images and text posts evenly through the gaps between uploads, with a mix
          you control and a weekly time cost you can actually commit to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cpp-start">
              Start date (first upload day)
            </label>
            <input
              id="cpp-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpp-horizon">
              Plan length (days)
            </label>
            <input
              id="cpp-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="7"
              max="365"
              step="1"
              value={horizonDays}
              onChange={(event) => setHorizonDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpp-interval">
              Days between uploads
            </label>
            <input
              id="cpp-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={uploadIntervalDays}
              onChange={(event) => setUploadIntervalDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cpp-cadence">
              Community posts per week
            </label>
            <input
              id="cpp-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="21"
              step="0.5"
              value={postsPerWeek}
              onChange={(event) => setPostsPerWeek(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Content mix (relative share)
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {POST_FORMATS.map((format) => (
              <div key={format.id}>
                <label className="block text-sm text-[var(--muted-foreground)]" htmlFor={`cpp-w-${format.id}`}>
                  {format.label} · {format.effortMinutes} min each
                </label>
                <input
                  id={`cpp-w-${format.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="10"
                  step="1"
                  value={weights[format.id]}
                  onChange={(event) => setWeight(format.id, event.target.value)}
                />
              </div>
            ))}
          </div>
        </fieldset>
      </section>

      {failed && (
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
              Community posts to schedule
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : plan.totalPosts}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to build a schedule."
                : `${prettyDate(plan.startDate)} to ${prettyDate(plan.endDate)} · ${plan.totalUploads} uploads`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the community post plan"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Uploads in the window", failed ? DASH : plan.totalUploads],
            ["Touchpoints per week (uploads + posts)", failed ? DASH : num(plan.touchpointsPerWeek)],
            ["Average days between posts", failed ? DASH : `${num(plan.averageDaysBetweenPosts)} days`],
            ["Longest silent gap", failed ? DASH : `${num(plan.longestSilentGapDays)} days`],
            ["Writing time per week", failed ? DASH : `${num(plan.effortMinutesPerWeek)} min`],
            ["Writing time for the whole plan", failed ? DASH : `${num(plan.effortMinutes)} min`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Format mix</h2>
            <ul className="mt-3 space-y-3">
              {plan.mix.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {item.count} posts · {num(item.share)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${Math.max(0, Math.min(100, item.share))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Schedule</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Role</th>
                    <th scope="col" className="py-2 font-semibold">Prompt</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.posts.map((post) => (
                    <tr key={post.index} className="border-b border-[var(--border)] last:border-0 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap font-semibold">
                        {prettyDate(post.date)}
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          {post.weekday}
                        </span>
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">{post.formatLabel}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">{post.role}</td>
                      <td className="py-2">{post.idea}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Upload days</h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {plan.uploads.map((upload) => (
                <li
                  key={upload.index}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--muted-foreground)]"
                >
                  {prettyDate(upload.date)} · {upload.weekday}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The schedule spreads posts evenly across the window and labels anything within two days of
        an upload as a warm-up. Prompts are starting points — rewrite them in your own voice before
        posting.
      </p>
    </main>
  );
}
