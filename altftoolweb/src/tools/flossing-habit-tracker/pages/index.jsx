"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BLEEDING_SCALE,
  BRUSH_REACHES_SURFACES,
  INTERDENTAL_TOOLS,
  MEDIAN_AUTOMATICITY_DAYS,
  TOTAL_TOOTH_SURFACES,
  analyseFlossingLog,
  calendarStrip,
  shiftIso,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const seedEntries = (today) =>
  [0, 1, 2, 3, 5, 6, 7].map((offset) => ({
    date: shiftIso(today, -offset),
    done: true,
    bleeding: offset >= 5 ? 1 : 0,
    tool: "floss",
    note: "",
  }));

export default function ToolHome() {
  const [today, setToday] = useState(todayIso);
  const [entries, setEntries] = useState(() => seedEntries(todayIso()));
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => analyseFlossingLog({ today, entries }), [today, entries]);
  const ok = !analysis.error;
  const strip = useMemo(() => (ok ? calendarStrip(analysis, 28) : []), [ok, analysis]);

  const updateEntry = (date, key, value) => {
    setEntries((previous) => previous.map((entry) => (entry.date === date ? { ...entry, [key]: value } : entry)));
  };

  const removeEntry = (date) => {
    setEntries((previous) => previous.filter((entry) => entry.date !== date));
  };

  const addEntry = () => {
    setEntries((previous) => {
      const used = new Set(previous.map((entry) => entry.date));
      for (let offset = 0; offset < 60; offset += 1) {
        const candidate = shiftIso(today, -offset);
        if (candidate && !used.has(candidate)) {
          return [...previous, { date: candidate, done: true, bleeding: 0, tool: "floss", note: "" }];
        }
      }
      return previous;
    });
  };

  const sorted = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)), [entries]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Interdental cleaning log up to ${analysis.today}`,
      `Current streak: ${analysis.currentStreak} days`,
      `Longest streak: ${analysis.longestStreak} days`,
      `Last 7 days: ${analysis.last7.hits}/7 (${analysis.last7.percent}%)`,
      `Last 30 days: ${analysis.last30.hits}/30 (${analysis.last30.percent}%)`,
      analysis.recentBleedingMean !== null
        ? `Average bleeding score over the last ${Math.min(7, analysis.sessionsLogged)} sessions: ${NUM2.format(analysis.recentBleedingMean)}/3`
        : "No bleeding scores logged yet",
      analysis.nextMilestone ? `Next milestone: ${analysis.nextMilestone} days (${analysis.daysToMilestone} to go)` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, analysis]);

  const copySummary = async () => {
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
    const fresh = todayIso();
    setToday(fresh);
    setEntries(seedEntries(fresh));
    setCopied(false);
  };

  const statusClass = (status) => {
    if (status === "done") return "bg-[var(--primary)] text-[var(--primary-foreground)]";
    if (status === "missed") return "bg-[var(--danger-soft)] text-[var(--danger)]";
    return "bg-[var(--muted)] text-[var(--muted-foreground)]";
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Dental care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Flossing Habit Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A toothbrush reaches {BRUSH_REACHES_SURFACES} of the {TOTAL_TOOTH_SURFACES} surfaces of
          each tooth — the two that touch the neighbouring teeth need floss or an interdental brush.
          Log it daily, watch the streak, and see whether the bleeding is settling.
        </p>
      </header>

      {analysis.error && (
        <p role="alert" className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {analysis.error}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Current streak
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${analysis.currentStreak} days` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? analysis.nextMilestone
                  ? `${analysis.daysToMilestone} more to reach ${analysis.nextMilestone} days`
                  : "Past every milestone on the list."
                : "Fix the error above to see the streak."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              disabled={!ok}
              aria-label="Copy the flossing summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Longest streak", ok ? `${analysis.longestStreak} days` : DASH],
            ["Last 7 days", ok ? `${analysis.last7.hits} of 7 (${analysis.last7.percent}%)` : DASH],
            ["Last 30 days", ok ? `${analysis.last30.hits} of 30 (${analysis.last30.percent}%)` : DASH],
            ["Sessions logged", ok ? analysis.sessionsLogged : DASH],
            ["Days since first entry", ok ? analysis.daysTracked : DASH],
            ["Days missed", ok ? analysis.missedDays : DASH],
            [
              "Bleeding, last 7 sessions",
              ok && analysis.recentBleedingMean !== null ? `${NUM2.format(analysis.recentBleedingMean)} / 3 average` : DASH,
            ],
            [
              "Change vs the 7 before",
              ok && analysis.bleedingChange !== null
                ? `${analysis.bleedingChange > 0 ? "+" : ""}${NUM2.format(analysis.bleedingChange)}`
                : DASH,
            ],
            [
              `Toward the ${MEDIAN_AUTOMATICITY_DAYS}-day automaticity median`,
              ok ? `${analysis.automaticityPercent}%` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Streak is ${analysis.automaticityPercent} percent of the ${MEDIAN_AUTOMATICITY_DAYS}-day median`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${analysis.automaticityPercent}%` }} />
            </div>
          </div>
        )}
      </section>

      {ok && analysis.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {analysis.warnings.map((warning) => (
            <li
              key={warning}
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {ok && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Last 28 days</h2>
          <div className="mt-3 overflow-x-auto">
            <div className="flex min-w-[280px] flex-wrap gap-1.5">
              {strip.map((day) => (
                <span
                  key={day.date}
                  title={`${day.date}: ${day.status}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold ${statusClass(day.status)}`}
                >
                  {day.date.slice(8)}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Filled = cleaned · Red = logged but skipped · Grey = not logged
          </p>
        </section>
      )}

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your log</h2>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="fl-today">
                Treat this as today
              </label>
              <input
                id="fl-today"
                type="date"
                className={`mt-2 ${INPUT_CLASS}`}
                value={today}
                onChange={(event) => setToday(event.target.value)}
              />
            </div>
            <button type="button" onClick={addEntry} className={GHOST_BTN} aria-label="Add a log entry">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add day
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {sorted.map((entry) => (
            <div key={entry.date} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`fl-date-${entry.date}`}>
                  Date
                </label>
                <input
                  id={`fl-date-${entry.date}`}
                  type="date"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={entry.date}
                  onChange={(event) => updateEntry(entry.date, "date", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`fl-bleed-${entry.date}`}>
                  Gum bleeding
                </label>
                <select
                  id={`fl-bleed-${entry.date}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={String(entry.bleeding)}
                  onChange={(event) => updateEntry(entry.date, "bleeding", Number(event.target.value))}
                >
                  {BLEEDING_SCALE.map((row) => (
                    <option key={row.value} value={String(row.value)}>
                      {row.value} — {row.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`fl-tool-${entry.date}`}>
                  Tool used
                </label>
                <select
                  id={`fl-tool-${entry.date}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={entry.tool || "floss"}
                  onChange={(event) => updateEntry(entry.date, "tool", event.target.value)}
                >
                  {INTERDENTAL_TOOLS.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <label
                  htmlFor={`fl-done-${entry.date}`}
                  className="flex min-h-11 flex-1 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
                >
                  <input
                    id={`fl-done-${entry.date}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={Boolean(entry.done)}
                    onChange={(event) => updateEntry(entry.date, "done", event.target.checked)}
                  />
                  Cleaned that day
                </label>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.date)}
                  aria-label={`Remove the entry for ${entry.date}`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`fl-note-${entry.date}`}>
                  Note
                </label>
                <input
                  id={`fl-note-${entry.date}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={entry.note || ""}
                  placeholder="Sore between the lower front teeth"
                  onChange={(event) => updateEntry(entry.date, "note", event.target.value)}
                />
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">No entries yet. Add a day to start the log.</p>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which tool for which gap</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <tbody>
              {INTERDENTAL_TOOLS.map((tool) => (
                <tr key={tool.id} className="border-b border-[var(--border)] align-top last:border-0">
                  <th scope="row" className="w-44 py-2 pr-3 text-left font-semibold">
                    {tool.label}
                  </th>
                  <td className="py-2 text-[var(--muted-foreground)]">{tool.suits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General oral-hygiene information, not personal dental advice. Bleeding gums can indicate
        gum disease and occasionally other conditions — if bleeding is heavy, painful, or has not
        settled after about two weeks of daily cleaning, see a dentist or hygienist.
      </p>
    </main>
  );
}
