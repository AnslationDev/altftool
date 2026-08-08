"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import {
  buildCalendar,
  DEFAULT_FORMATS,
  LIMITS,
  parseTopics,
  toTsv,
  WEEKDAYS,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  startDate: "2026-08-03",
  weeks: "6",
  perWeek: "2",
  days: [2, 5],
  formats: DEFAULT_FORMATS.join(", "),
  topics: `Series trailer: what you will learn
Set up your workspace in 10 minutes
The five settings everyone gets wrong
Walkthrough: your first finished project
Common mistakes and how to fix them
Q&A from the comments`,
};

const DASH = "—";

export default function ToolHome() {
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [weeks, setWeeks] = useState(DEFAULTS.weeks);
  const [perWeek, setPerWeek] = useState(DEFAULTS.perWeek);
  const [days, setDays] = useState(DEFAULTS.days);
  const [formats, setFormats] = useState(DEFAULTS.formats);
  const [topics, setTopics] = useState(DEFAULTS.topics);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const result = useMemo(
    () =>
      buildCalendar({
        startDate,
        weeks: Number(weeks),
        perWeek: Number(perWeek),
        publishDays: days,
        topics: parseTopics(topics),
        formats: formats.split(",").map((item) => item.trim()),
      }),
    [startDate, weeks, perWeek, days, topics, formats],
  );

  const hasError = Boolean(result.error);

  // Mirrors lib.js's chosenDays derivation: sorted publish days, rounded perWeek, first N kept.
  const perWeekRounded = Math.round(Number(perWeek));
  const activeDays =
    Number.isFinite(perWeekRounded) && perWeekRounded > 0
      ? [...days].sort((a, b) => a - b).slice(0, perWeekRounded)
      : days;

  const toggleDay = (index) => {
    setDays((current) =>
      current.includes(index) ? current.filter((day) => day !== index) : [...current, index].sort((a, b) => a - b),
    );
  };

  const copyResult = async () => {
    const tsv = toTsv(result);
    if (!tsv) return;
    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  /** Rounds a typed field value to the nearest integer on blur, matching lib.js's Math.round(). */
  const roundOnBlur = (setter) => () => {
    setter((current) => {
      const rounded = Math.round(Number(current));
      return Number.isFinite(rounded) ? String(rounded) : current;
    });
  };

  const reset = () => {
    setStartDate(DEFAULTS.startDate);
    setWeeks(DEFAULTS.weeks);
    setPerWeek(DEFAULTS.perWeek);
    setDays(DEFAULTS.days);
    setFormats(DEFAULTS.formats);
    setTopics(DEFAULTS.topics);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Video marketing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Video Series Content Calendar</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns a start date, a cadence and a topic list into dated episode slots with a rotating
          format, so a series is fully scheduled before you shoot the first video.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-start">
              Start date (first possible publish day)
            </label>
            <input
              id="cal-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="cal-weeks">
                Weeks
              </label>
              <input
                id="cal-weeks"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={LIMITS.weeks.min}
                max={LIMITS.weeks.max}
                step="1"
                value={weeks}
                onChange={(event) => setWeeks(event.target.value)}
                onBlur={roundOnBlur(setWeeks)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cal-perweek">
                Per week
              </label>
              <input
                id="cal-perweek"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={LIMITS.perWeek.min}
                max={LIMITS.perWeek.max}
                step="1"
                value={perWeek}
                onChange={(event) => setPerWeek(event.target.value)}
                onBlur={roundOnBlur(setPerWeek)}
              />
            </div>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Publish days</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const isSelected = days.includes(day.index);
              const isActive = isSelected && activeDays.includes(day.index);
              const isUnused = isSelected && !isActive;
              return (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => toggleDay(day.index)}
                  aria-pressed={isSelected}
                  title={isUnused ? "Selected, but not used — beyond the per-week count" : undefined}
                  className={`min-h-11 min-w-[3.5rem] rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)]"
                      : isUnused
                        ? "border-dashed border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] opacity-60"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {day.short}
                  {isUnused && <span className="sr-only"> (selected, not used this week)</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            The first {perWeekRounded} selected day{perWeekRounded === 1 ? "" : "s"} of each week are used
            {days.length > activeDays.length ? " — dashed days are selected but not used." : "."}
          </p>
        </fieldset>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="cal-formats">
            Formats to rotate (comma separated)
          </label>
          <input
            id="cal-formats"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={formats}
            onChange={(event) => setFormats(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="cal-topics">
            Topics, one per line
          </label>
          <textarea
            id="cal-topics"
            className={`mt-2 ${AREA_CLASS}`}
            rows={8}
            value={topics}
            onChange={(event) => setTopics(event.target.value)}
          />
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Episodes scheduled
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.totalEpisodes}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the settings to build the calendar." : result.cadence}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the calendar as spreadsheet rows"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy for sheets"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["First episode", hasError ? DASH : result.episodes[0].pretty],
            ["Last episode", hasError ? DASH : result.endPretty],
            [
              "Series runs for",
              hasError
                ? DASH
                : `${result.spanDays} day${result.spanDays === 1 ? "" : "s"} (${result.weeksUsed}-week plan)`,
            ],
            ["Publish days", hasError ? DASH : result.publishDays.join(", ")],
            [
              "Topics written",
              hasError ? DASH : `${result.topicsUsed} of ${result.totalEpisodes}`,
            ],
            [
              "Slots still blank",
              hasError ? DASH : result.topicsMissing === 0 ? "None" : String(result.topicsMissing),
            ],
            [
              "Extra topics not scheduled",
              hasError ? DASH : result.topicsSpare > 0 ? String(result.topicsSpare) : "None",
            ],
            [
              "Format mix",
              hasError
                ? DASH
                : Object.entries(result.formatCounts)
                    .map(([format, count]) => `${format} ×${count}`)
                    .join(", "),
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
          <h2 className="text-base font-semibold">Publishing schedule</h2>
          <div className="mt-3 max-h-[28rem] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Ep</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Topic</th>
                  <th scope="col" className="py-2 font-semibold">Format</th>
                </tr>
              </thead>
              <tbody>
                {result.episodes.map((episode) => (
                  <tr key={episode.number} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3 font-semibold tabular-nums">{episode.number}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{episode.pretty}</td>
                    <td
                      className={`py-2 pr-3 ${episode.topicPlanned ? "" : "text-[var(--muted-foreground)] italic"}`}
                    >
                      {episode.topic}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{episode.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dates are calculated in UTC so the schedule does not shift when you travel. Pick a cadence
        you can sustain for the whole run — a consistent weekly slot beats a burst of daily uploads
        followed by a gap.
      </p>
    </main>
  );
}
