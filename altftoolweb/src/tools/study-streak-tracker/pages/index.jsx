"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import {
  FREEZE_WINDOW_DAYS,
  MAX_FREEZES,
  computeStreaks,
  parseDailyHours,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  hoursText: "2, 2.5, 0, 3, 2, 2, 1, 2.5, 3, 2",
  goalHours: "2",
  freezes: "1",
};

const STATUS_STYLE = {
  met: "bg-[var(--primary)] text-[var(--primary-foreground)]",
  frozen: "bg-[var(--muted)] text-[var(--foreground)] ring-1 ring-[var(--primary)]",
  missed: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const STATUS_LABEL = { met: "goal met", frozen: "freeze used", missed: "missed" };

export default function ToolHome() {
  const [hoursText, setHoursText] = useState(DEFAULTS.hoursText);
  const [goalHours, setGoalHours] = useState(DEFAULTS.goalHours);
  const [freezes, setFreezes] = useState(DEFAULTS.freezes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsed = parseDailyHours(hoursText);
    if (parsed.error) return { error: parsed.error };
    return computeStreaks({
      dailyHours: parsed.hours,
      goalHours: goalHours.trim() === "" ? Number.NaN : goalHours,
      freezesPer7Days: freezes.trim() === "" ? Number.NaN : Number(freezes),
    });
  }, [hoursText, goalHours, freezes]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Study streak",
      `Current streak: ${result.currentStreak} day(s)`,
      `Longest streak: ${result.longestStreak} day(s)`,
      `Days on goal: ${result.daysMet}/${result.daysLogged} (${NUM.format(result.adherencePercent)}%)`,
      `Freezes used: ${result.freezesUsed}`,
      `Total hours: ${NUM.format(result.totalHours)} (avg ${NUM.format(result.averageHours)}/day)`,
    ].join("\n");
  }, [hasError, result]);

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
    setHoursText(DEFAULTS.hoursText);
    setGoalHours(DEFAULTS.goalHours);
    setFreezes(DEFAULTS.freezes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Study habits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Study Streak Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your hours for each day, set a daily goal, and see your current and longest
          streaks. A limited number of streak freezes per rolling {FREEZE_WINDOW_DAYS} days
          lets one off-day protect — but not extend — an active streak.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sst-hours">
              Hours studied per day (oldest first, comma separated)
            </label>
            <input
              id="sst-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="text"
              value={hoursText}
              onChange={(event) => setHoursText(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Example: 2, 2.5, 0, 3 — use 0 for days you did not study.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sst-goal">
              Daily goal (hours)
            </label>
            <input
              id="sst-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="24"
              step="0.5"
              value={goalHours}
              onChange={(event) => setGoalHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sst-freezes">
              Streak freezes per {FREEZE_WINDOW_DAYS} days
            </label>
            <select
              id="sst-freezes"
              className={`mt-2 ${INPUT_CLASS}`}
              value={freezes}
              onChange={(event) => setFreezes(event.target.value)}
            >
              {Array.from({ length: MAX_FREEZES + 1 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {i === 0 ? "0 — strict, any miss breaks the streak" : `${i}`}
                </option>
              ))}
            </select>
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
              Current streak
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.currentStreak} day${result.currentStreak === 1 ? "" : "s"}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your streak."
                : `Longest run: ${result.longestStreak} day${result.longestStreak === 1 ? "" : "s"}. Goal met on ${result.daysMet} of ${result.daysLogged} logged days.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the streak summary"
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

        {!hasError ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Day by day
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.dayStatus.map((status, i) => (
                <span
                  key={i}
                  title={`Day ${i + 1}: ${STATUS_LABEL[status]}`}
                  aria-label={`Day ${i + 1}: ${STATUS_LABEL[status]}`}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold ${STATUS_STYLE[status]}`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Solid = goal met · outlined = freeze used · red = streak broken/missed
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Longest streak", hasError ? DASH : `${result.longestStreak} days`],
            [
              "Goal adherence",
              hasError ? DASH : `${NUM.format(result.adherencePercent)}%`,
            ],
            ["Freezes used", hasError ? DASH : String(result.freezesUsed)],
            ["Total hours logged", hasError ? DASH : NUM.format(result.totalHours)],
            ["Average hours per day", hasError ? DASH : NUM.format(result.averageHours)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A freeze protects an active streak on an off-day without adding to it, and at most
        your chosen number of freezes can be spent in any rolling {FREEZE_WINDOW_DAYS}-day
        window. Streaks measure consistency, not quality — pair the count with honest hour
        logging.
      </p>
    </main>
  );
}
