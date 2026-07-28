"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  CHALLENGE_PRESETS,
  nanoPace,
  parTable,
  resultToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  goalWords: "50000",
  challengeDays: "30",
  daysElapsed: "10",
  wordsWritten: "15000",
};

export default function ToolHome() {
  const [goalWords, setGoalWords] = useState(DEFAULTS.goalWords);
  const [challengeDays, setChallengeDays] = useState(DEFAULTS.challengeDays);
  const [daysElapsed, setDaysElapsed] = useState(DEFAULTS.daysElapsed);
  const [wordsWritten, setWordsWritten] = useState(DEFAULTS.wordsWritten);
  const [showTable, setShowTable] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      nanoPace({
        goalWords: goalWords === "" ? NaN : Number(goalWords),
        challengeDays: challengeDays === "" ? NaN : Number(challengeDays),
        daysElapsed: daysElapsed === "" ? NaN : Number(daysElapsed),
        wordsWritten: wordsWritten === "" ? NaN : Number(wordsWritten),
      }),
    [goalWords, challengeDays, daysElapsed, wordsWritten],
  );

  const table = useMemo(
    () => (result.error ? [] : parTable(result.goal, result.days)),
    [result],
  );

  const plainText = useMemo(() => resultToText(result), [result]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGoalWords(DEFAULTS.goalWords);
    setChallengeDays(DEFAULTS.challengeDays);
    setDaysElapsed(DEFAULTS.daysElapsed);
    setWordsWritten(DEFAULTS.wordsWritten);
    setShowTable(false);
    setCopied(false);
  };

  const headline = hasError
    ? DASH
    : result.complete
      ? "Finished"
      : `${result.ahead ? "+" : ""}${NUM.format(result.difference)}`;

  const stats = hasError
    ? [
        ["Par to date", DASH],
        ["Your total", DASH],
        ["Par per day", DASH],
        ["Words still to write", DASH],
        ["Needed per remaining day", DASH],
        ["Your average so far", DASH],
        ["Projected final total", DASH],
      ]
    : [
        ["Par to date", `${NUM.format(result.parToDate)} words`],
        ["Your total", `${NUM.format(result.words)} words (${result.percentDone}%)`],
        ["Par per day", `${NUM.format(result.parPerDay)} words`],
        ["Words still to write", NUM.format(result.remainingWords)],
        [
          "Needed per remaining day",
          result.remainingWords === 0
            ? "Nothing — target met"
            : result.neededPerDay === null
              ? "No days left"
              : `${NUM.format(result.neededPerDay)} words × ${result.daysRemaining} day${result.daysRemaining === 1 ? "" : "s"}`,
        ],
        [
          "Your average so far",
          result.daysElapsed === 0 ? "Not started" : `${NUM.format(result.averagePerDay)} words a day`,
        ],
        [
          "Projected final total",
          result.projectedTotal === null
            ? "Not enough data yet"
            : `${NUM.format(result.projectedTotal)} words`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Par line
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">NaNoWriMo Pace Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fifty thousand words in thirty days is 1,667 a day. Enter which day you are on and what
          you have written, and this shows how far you are from par, what you now need each day, and
          where your current average will actually land you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nano-day">
              Day of the challenge
            </label>
            <input
              id="nano-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="92"
              step="1"
              value={daysElapsed}
              onChange={(event) => setDaysElapsed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nano-words">
              Words written so far
            </label>
            <input
              id="nano-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={wordsWritten}
              onChange={(event) => setWordsWritten(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nano-goal">
              Word goal
            </label>
            <input
              id="nano-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1000"
              max="500000"
              step="1000"
              value={goalWords}
              onChange={(event) => setGoalWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nano-days">
              Days in the challenge
            </label>
            <input
              id="nano-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="92"
              step="1"
              value={challengeDays}
              onChange={(event) => setChallengeDays(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CHALLENGE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setGoalWords(String(preset.goal));
                setChallengeDays(String(preset.days));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Against par" : result.ahead ? "Ahead of par" : result.behind ? "Behind par" : "On par"}
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError || !result.behind ? "text-[var(--primary)]" : "text-[var(--danger)]"
              }`}
            >
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see where you stand."
                : result.complete
                  ? `Target reached on day ${result.finishDay} with ${NUM.format(result.surplus)} words to spare.`
                  : `Day ${result.daysElapsed} of ${result.days} · that is ${Math.abs(result.daysAheadOrBehind)} day${Math.abs(result.daysAheadOrBehind) === 1 ? "" : "s"} ${result.behind ? "behind" : "ahead"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the pace summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${result.percentDone}% of the word goal written`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.percentDone}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {NUM.format(result.words)} of {NUM.format(result.goal)} words
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4 space-y-2">
            {result.outOfDays && (
              <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
                The challenge is over and you are {NUM.format(result.remainingWords)} words short.
                {NUM.format(result.words)} words is still {NUM.format(result.words)} words more than
                you had on day zero.
              </p>
            )}
            {!result.complete && !result.outOfDays && result.projectedTotal !== null && !result.finishesInTime && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                At your current average you would reach the goal on day {result.finishDay}, which is
                past the end. Lifting your daily count to {NUM.format(result.neededPerDay)} words
                closes the gap.
              </p>
            )}
            {!result.complete && result.finishesInTime && result.ahead && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                Holding this average finishes the goal on day {result.finishDay}, with{" "}
                {result.daysSpare} day{result.daysSpare === 1 ? "" : "s"} spare.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">The full par line</h2>
          <button
            type="button"
            onClick={() => setShowTable((current) => !current)}
            aria-expanded={showTable}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showTable ? "Hide" : "Show"}
          </button>
        </div>
        {showTable && table.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <caption className="sr-only">Cumulative par word count by day</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Words that day</th>
                  <th scope="col" className="py-2 text-right font-semibold">Running par</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr
                    key={row.day}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      !hasError && row.day === result.daysElapsed ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{row.day}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(row.daily)}
                    </td>
                    <td className="py-2 text-right">{NUM.format(row.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is an independent calculator with no connection to any organisation running the
        challenge. The nonprofit behind the official event announced its closure in 2025; the format
        itself — 50,000 words across 30 days — is still widely used by writing groups, and the
        arithmetic here works for any goal and any number of days.
      </p>
    </main>
  );
}
