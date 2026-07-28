"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Flame, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CONSISTENCY_WINDOW_DAYS,
  MIN_STREAK_KM,
  buildCalendar,
  computeStreak,
  shiftIso,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const STORAGE_KEY = "altft-run-streak-tracker";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const seedEntries = (todayIso) =>
  [0, 1, 2, 3, 5, 6].map((back, index) => ({
    id: index + 1,
    dateIso: shiftIso(todayIso, -back) ?? todayIso,
    km: back === 5 ? "8" : "5",
  }));

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [todayIso] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState(() => seedEntries(new Date().toISOString().slice(0, 10)));
  const [draftDate, setDraftDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [draftKm, setDraftKm] = useState("5");
  const [minKm, setMinKm] = useState(String(Number(MIN_STREAK_KM.toFixed(3))));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setEntries(parsed);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage may be full or blocked */
    }
  }, [entries]);

  const parsedEntries = useMemo(
    () => entries.map((entry) => ({ dateIso: entry.dateIso, km: toNumber(entry.km) })),
    [entries]
  );

  const threshold = useMemo(() => {
    const value = toNumber(minKm);
    return Number.isNaN(value) ? MIN_STREAK_KM : value;
  }, [minKm]);

  const stats = useMemo(
    () => computeStreak({ entries: parsedEntries, todayIso, minKm: threshold }),
    [parsedEntries, todayIso, threshold]
  );

  const calendar = useMemo(
    () =>
      buildCalendar({
        entries: parsedEntries,
        todayIso,
        days: CONSISTENCY_WINDOW_DAYS,
        minKm: threshold,
      }),
    [parsedEntries, todayIso, threshold]
  );

  const hasError = Boolean(stats.error);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => String(b.dateIso).localeCompare(String(a.dateIso))),
    [entries]
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Run Streak Tracker",
      `Current streak: ${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`,
      `Longest streak: ${stats.longestStreak} days`,
      `Qualifying days logged: ${stats.qualifyingDays}`,
      `Total distance: ${NUM1.format(stats.totalKm)} km`,
      `Consistency (last ${CONSISTENCY_WINDOW_DAYS} days): ${NUM0.format(stats.consistencyPct)}%`,
      stats.nextMilestone
        ? `Next milestone: ${stats.nextMilestone} days (${stats.daysToMilestone} to go)`
        : "Past every listed milestone.",
    ].join("\n");
  }, [hasError, stats]);

  const addEntry = () => {
    setEntries((list) => {
      const nextId = list.reduce((max, entry) => Math.max(max, entry.id ?? 0), 0) + 1;
      return [...list, { id: nextId, dateIso: draftDate, km: draftKm }];
    });
  };

  const removeEntry = (id) => setEntries((list) => list.filter((entry) => entry.id !== id));

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
    setEntries(seedEntries(todayIso));
    setDraftDate(todayIso);
    setDraftKm("5");
    setMinKm(String(Number(MIN_STREAK_KM.toFixed(3))));
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Longest streak", DASH],
        ["Ran today", DASH],
        ["Qualifying days logged", DASH],
        ["Total distance", DASH],
        [`Consistency (last ${CONSISTENCY_WINDOW_DAYS} days)`, DASH],
        ["Longest gap between runs", DASH],
        ["Next milestone", DASH],
      ]
    : [
        ["Longest streak", `${NUM0.format(stats.longestStreak)} days`],
        ["Ran today", stats.ranToday ? "Yes" : "Not yet"],
        ["Qualifying days logged", NUM0.format(stats.qualifyingDays)],
        ["Total distance", `${NUM1.format(stats.totalKm)} km`],
        [
          `Consistency (last ${CONSISTENCY_WINDOW_DAYS} days)`,
          `${NUM0.format(stats.consistencyPct)}% · ${stats.last30Days}/${CONSISTENCY_WINDOW_DAYS} days`,
        ],
        ["Longest gap between runs", `${NUM0.format(stats.longestGapDays)} days`],
        [
          "Next milestone",
          stats.nextMilestone
            ? `${stats.nextMilestone} days · ${NUM0.format(stats.daysToMilestone)} to go`
            : "All listed milestones passed",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Consistency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Run Streak Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A streak day means at least one qualifying run inside a calendar day — 1 mile (1.61 km) by
          the US Running Streak Association rule. Log your runs and the tracker keeps the current
          streak, the record streak and your 30-day consistency. Data stays in this browser.
        </p>
      </header>

      {hasError && (
        <p
          role="alert"
          className="mb-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {stats.error}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Current streak
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(stats.currentStreak)} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the logged runs to see your streak."
                : stats.streakAlive
                  ? `Running since ${stats.streakStartIso}`
                  : "No live streak — a qualifying run today starts a new one."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy run streak summary"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset the log to the sample week"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && stats.atRisk && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Streak at risk — nothing logged for today yet. {NUM1.format(threshold)} km keeps it
            alive.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Last {CONSISTENCY_WINDOW_DAYS} days</h2>
        <div className="mt-3 overflow-x-auto">
          <ul className="flex min-w-max gap-1.5 pb-1">
            {calendar.map((cell) => (
              <li key={cell.dateIso}>
                <span
                  title={`${cell.dateIso}: ${NUM1.format(cell.km)} km`}
                  aria-label={`${cell.dateIso}: ${NUM1.format(cell.km)} kilometres`}
                  className={`block h-8 w-8 rounded-md ${
                    cell.qualifies
                      ? "bg-[var(--primary)]"
                      : cell.logged
                        ? "bg-[var(--warning-soft)]"
                        : "bg-[var(--muted)]"
                  }`}
                />
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Filled squares are qualifying days; faded squares are runs shorter than the threshold.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Log a run</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="streak-date">
              Date
            </label>
            <input
              id="streak-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="streak-km">
              Distance (km)
            </label>
            <input
              id="streak-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={draftKm}
              onChange={(event) => setDraftKm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="streak-threshold">
              Qualifying distance per day (km)
            </label>
            <input
              id="streak-threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={minKm}
              onChange={(event) => setMinKm(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              1.609 km is the official one-mile minimum. Lower it if your own streak rule is
              different.
            </p>
          </div>
        </div>
        <button type="button" onClick={addEntry} className={`mt-4 w-full sm:w-auto ${PRIMARY_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add to log
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Logged runs ({entries.length})</h2>
        {sortedEntries.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Nothing logged yet — add your first run above.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
            {sortedEntries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                <span className="font-semibold">{entry.dateIso}</span>
                <span className="text-[var(--muted-foreground)]">{entry.km} km</span>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={`Remove the run on ${entry.dateIso}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Remove</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Streaks reward consistency but remove rest days, which raises injury and illness risk over
        long spans. Keep most streak days easy and short, and stop the streak rather than run
        through pain — informational only, not medical advice.
      </p>
    </main>
  );
}
