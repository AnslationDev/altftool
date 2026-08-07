"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, Plus, RotateCcw, Trash2 } from "lucide-react";

import { MAX_FREEZES, addLog, languagesIn, removeLog, summarise } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DAY_MS = 86400000;
const todayIso = () => new Date().toISOString().slice(0, 10);
const shift = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
// Bounds the "Treat this date as today" picker to a few years out so an
// easily-reachable far-future date can't be entered through the UI.
const MAX_TODAY_ISO = shift(todayIso(), 365 * 5);

/** Ten days of sample sessions so the page shows a real streak at first paint. */
const seedLogs = (anchor) => {
  const pattern = [
    [9, "Spanish", 25],
    [8, "Spanish", 20],
    [7, "Spanish", 10],
    [6, "Spanish", 30],
    [6, "Hindi", 15],
    [5, "Spanish", 20],
    [4, "Spanish", 25],
    [2, "Spanish", 20],
    [1, "Spanish", 35],
    [0, "Spanish", 10],
  ];
  return pattern.map(([back, language, minutes]) => ({ date: shift(anchor, -back), language, minutes }));
};

const EMPTY_DRAFT = { language: "Spanish", minutes: "20" };

export default function ToolHome() {
  const [today, setToday] = useState(todayIso);
  const [logs, setLogs] = useState(() => seedLogs(todayIso()));
  const [goal, setGoal] = useState("20");
  const [freezes, setFreezes] = useState("0");
  const [filter, setFilter] = useState("All");
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [draftDate, setDraftDate] = useState(todayIso);
  const [addError, setAddError] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(
    () =>
      summarise({
        logs,
        goalMinutes: Number(goal),
        today,
        language: filter,
        freezes: Number(freezes),
      }),
    [logs, goal, today, filter, freezes],
  );

  const hasError = Boolean(stats.error);
  const languages = languagesIn(logs);
  const peakMinutes = hasError ? 0 : Math.max(1, ...stats.recent.map((day) => day.minutes));

  const submit = (event) => {
    event.preventDefault();
    const result = addLog(logs, { date: draftDate, language: draft.language, minutes: Number(draft.minutes) }, today);
    if (result.error) {
      setAddError(result.error);
      return;
    }
    setLogs(result.logs);
    setAddError("");
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Language study streak",
      `As of ${today}, goal ${stats.goal} minutes a day${filter === "All" ? "" : ` (${filter} only)`}`,
      `Current streak: ${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}${stats.atRisk ? " (today not logged yet)" : ""}`,
      `Longest streak: ${stats.longestStreak} days`,
      `Days that met the goal: ${stats.daysMetGoal} of ${stats.spanDays || 0} (${NUM.format(stats.adherence)}%)`,
      `Total logged: ${stats.totalMinutes} minutes (${NUM.format(stats.totalHours || 0)} hours)`,
      `Last 7 days: ${stats.last7Minutes} minutes`,
      stats.nextMilestone ? `Next milestone: ${stats.nextMilestone} days, ${stats.daysToMilestone} to go` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [stats, hasError, today, filter]);

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
    if (!window.confirm("Reset the tracker? This deletes every logged session and setting saved in this browser.")) {
      return;
    }
    const anchor = todayIso();
    setToday(anchor);
    setLogs(seedLogs(anchor));
    setGoal("20");
    setFreezes("0");
    setFilter("All");
    setDraft(EMPTY_DRAFT);
    setDraftDate(anchor);
    setAddError("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Study habit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Daily Language Streak Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log the minutes you study each language and see your current streak, longest streak and
          goal adherence. A day counts once the minutes logged reach your daily goal; today is never
          counted as a miss until it is over.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="streak-goal">
              Daily goal (minutes)
            </label>
            <input
              id="streak-goal"
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="streak-today">
              Treat this date as today
            </label>
            <input
              id="streak-today"
              type="date"
              max={MAX_TODAY_ISO}
              className={`mt-2 ${INPUT_CLASS}`}
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="streak-filter">
              Count which language
            </label>
            <select
              id="streak-filter"
              className={`mt-2 ${INPUT_CLASS}`}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All languages together</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language} only
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="streak-freezes">
              Rest days a streak may survive
            </label>
            <select
              id="streak-freezes"
              className={`mt-2 ${INPUT_CLASS}`}
              value={freezes}
              onChange={(event) => setFreezes(event.target.value)}
            >
              {Array.from({ length: MAX_FREEZES + 1 }, (_, index) => index).map((value) => (
                <option key={value} value={String(value)}>
                  {value === 0 ? "None — a miss breaks the streak" : `${value} rest day${value === 1 ? "" : "s"}`}
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
          {stats.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Current streak
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(stats.currentStreak)} day${stats.currentStreak === 1 ? "" : "s"}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : stats.todayMet
                  ? `Today is done — ${stats.todayMinutes} minutes logged`
                  : `${stats.minutesToGoalToday} more minutes today to keep it alive`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the streak summary" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Longest streak", hasError ? DASH : `${NUM.format(stats.longestStreak)} days`],
            [
              "Days that met the goal",
              hasError ? DASH : `${NUM.format(stats.daysMetGoal)} of ${NUM.format(stats.spanDays || 0)} (${NUM.format(stats.adherence)}%)`,
            ],
            ["Total time logged", hasError ? DASH : `${NUM.format(stats.totalMinutes)} min (${NUM.format(stats.totalHours || 0)} h)`],
            ["Last 7 days", hasError ? DASH : `${NUM.format(stats.last7Minutes)} minutes`],
            ["Last 30 days", hasError ? DASH : `${NUM.format(stats.last30Minutes)} minutes`],
            ["Average on a day you study", hasError ? DASH : `${NUM.format(stats.averageWhenStudied)} minutes`],
            [
              "Next milestone",
              hasError || !stats.nextMilestone ? DASH : `${stats.nextMilestone} days — ${stats.daysToMilestone} to go`,
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
          <h2 className="text-base font-semibold">Last 14 days</h2>
          <div className="mt-4 overflow-x-auto">
            <ul className="flex min-w-[320px] items-end gap-1.5">
              {stats.recent.map((day) => (
                <li key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span
                    className={`w-full rounded-sm ${day.met ? "bg-[var(--primary)]" : "bg-[var(--muted)]"}`}
                    style={{ height: `${Math.max(4, Math.round((day.minutes / peakMinutes) * 72))}px` }}
                    role="img"
                    aria-label={`${day.date}: ${day.minutes} minutes, goal ${day.met ? "met" : "not met"}`}
                  />
                  <span className="text-[10px] text-[var(--muted-foreground)]">{day.weekday.slice(0, 1)}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Filled bars met the {stats.goal}-minute goal. Bar height is minutes studied.
          </p>
        </section>
      )}

      <form onSubmit={submit} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Log a session</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="log-date">
              Date
            </label>
            <input
              id="log-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="log-language">
              Language
            </label>
            <input
              id="log-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.language}
              onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value }))}
              placeholder="Spanish, Tamil, Japanese"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="log-minutes">
              Minutes studied
            </label>
            <input
              id="log-minutes"
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.minutes}
              onChange={(event) => setDraft((current) => ({ ...current, minutes: event.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className={`${PRIMARY_BTN} w-full`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add session
            </button>
          </div>
        </div>

        {addError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {addError}
          </p>
        )}
      </form>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Logged sessions</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Language</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Minutes</th>
                <th scope="col" className="py-2 text-right font-semibold">Remove</th>
              </tr>
            </thead>
            <tbody>
              {[...logs]
                .sort((a, b) => b.date.localeCompare(a.date) || a.language.localeCompare(b.language))
                .map((item) => (
                  <tr key={`${item.date}-${item.language}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">{item.date}</td>
                    <td className="py-2 pr-3">{item.language}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(item.minutes)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setLogs((current) => removeLog(current, item.date, item.language))}
                        aria-label={`Remove ${item.language} on ${item.date}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No sessions yet. Add one above to start the streak.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sessions live in this browser tab only — nothing is uploaded and nothing survives a refresh,
        so copy the summary if you want to keep it. Streak counts reward consistency, not
        comprehension; a short honest session beats a padded number.
      </p>
    </main>
  );
}
