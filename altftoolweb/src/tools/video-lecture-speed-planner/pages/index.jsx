"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { SPEED_OPTIONS, planLectureCompletion } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  contentHours: "100",
  dailyMinutes: "120",
  speed: "1.5",
  overheadPct: "10",
};

const MINUTES_PER_HOUR = 60;

export default function ToolHome() {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [contentHours, setContentHours] = useState(DEFAULTS.contentHours);
  const [dailyMinutes, setDailyMinutes] = useState(DEFAULTS.dailyMinutes);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [overheadPct, setOverheadPct] = useState(DEFAULTS.overheadPct);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planLectureCompletion({
        totalContentMinutes: Number(contentHours) * MINUTES_PER_HOUR,
        dailyWatchMinutes: Number(dailyMinutes),
        speed: Number(speed),
        startDate,
        overheadPct: overheadPct.trim() === "" ? 0 : Number(overheadPct),
      }),
    [contentHours, dailyMinutes, speed, startDate, overheadPct],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Video lecture speed plan",
      `Backlog: ${contentHours} hours of content at 1x`,
      `Daily sitting: ${dailyMinutes} minutes at ${speed}x (${overheadPct || 0}% pause overhead)`,
      `Days needed: ${result.daysNeeded}`,
      `Finish date: ${result.finishDate}`,
      `Days saved vs 1x: ${result.daysSavedVs1x} (1x would finish ${result.baselineFinishDate})`,
      `Total sitting time: ${NUM.format(result.totalSittingHours)} hours`,
    ].join("\n");
  }, [hasError, result, contentHours, dailyMinutes, speed, overheadPct]);

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
    setContentHours(DEFAULTS.contentHours);
    setDailyMinutes(DEFAULTS.dailyMinutes);
    setSpeed(DEFAULTS.speed);
    setOverheadPct(DEFAULTS.overheadPct);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Days needed", DASH],
        ["Finish date", DASH],
        ["Content cleared per day", DASH],
        ["Days saved vs 1x", DASH],
      ]
    : [
        ["Days needed", `${result.daysNeeded} days`],
        ["Content cleared per day", `${NUM.format(result.contentPerDay)} min at 1x-equivalent`],
        ["1x baseline", `${result.baselineDays} days (finish ${result.baselineFinishDate})`],
        ["Days saved vs 1x", `${result.daysSavedVs1x} days`],
        ["Total sitting time", `${NUM.format(result.totalSittingHours)} hours`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Coaching decisions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Lecture Speed Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your lecture backlog and daily watch time to see exactly how much sooner 1.25x,
          1.5x or 2x playback finishes the course — including the time you lose to pausing and
          note-taking.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vsp-content">
              Remaining content (hours at 1x)
            </label>
            <input
              id="vsp-content"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={contentHours}
              onChange={(event) => setContentHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vsp-daily">
              Daily watch time (minutes)
            </label>
            <input
              id="vsp-daily"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="15"
              value={dailyMinutes}
              onChange={(event) => setDailyMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vsp-speed">
              Playback speed
            </label>
            <select
              id="vsp-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option} value={String(option)}>
                  {option}x
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vsp-start">
              Start date
            </label>
            <input
              id="vsp-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vsp-overhead">
              Pause / rewind / note-taking overhead (%)
            </label>
            <input
              id="vsp-overhead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="5"
              value={overheadPct}
              onChange={(event) => setOverheadPct(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Share of your sitting time when the video is paused. 10-20% is typical when taking
              notes.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
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
              Finish date at {speed}x
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.finishDate}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `Counting ${startDate} as day 1, you finish in ${result.daysNeeded} days.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the speed plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Every speed compared</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Speed
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Days
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Finish date
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Saved vs 1x
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.comparison.map((row) => (
                  <tr
                    key={row.speed}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      String(row.speed) === speed ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{row.speed}x</td>
                    <td className="py-2 pr-3 text-right">{row.daysNeeded}</td>
                    <td className="py-2 pr-3 text-right">{row.finishDate}</td>
                    <td className="py-2 text-right">
                      {row.daysSavedVs1x > 0 ? `${row.daysSavedVs1x} days` : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Comprehension research suggests most learners retain lecture material well up to about 2x,
        but dense derivations and new topics may deserve 1x. Plan the backlog fast; slow down where
        it matters.
      </p>
    </main>
  );
}
