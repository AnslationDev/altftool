"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import { planReading } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  totalPages: "300",
  pagesDone: "60",
  startDate: "2026-08-01",
  targetDate: "2026-08-30",
  daysOffPerWeek: "1",
  bufferPercent: "10",
  minutesPerPage: "3",
};

export default function ToolHome() {
  const [totalPages, setTotalPages] = useState(DEFAULTS.totalPages);
  const [pagesDone, setPagesDone] = useState(DEFAULTS.pagesDone);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [targetDate, setTargetDate] = useState(DEFAULTS.targetDate);
  const [daysOffPerWeek, setDaysOffPerWeek] = useState(DEFAULTS.daysOffPerWeek);
  const [bufferPercent, setBufferPercent] = useState(DEFAULTS.bufferPercent);
  const [minutesPerPage, setMinutesPerPage] = useState(DEFAULTS.minutesPerPage);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planReading({
        totalPages: totalPages.trim() === "" ? Number.NaN : Number(totalPages),
        pagesDone: pagesDone.trim() === "" ? 0 : Number(pagesDone),
        startDate,
        targetDate,
        daysOffPerWeek: daysOffPerWeek.trim() === "" ? Number.NaN : Number(daysOffPerWeek),
        bufferPercent: bufferPercent.trim() === "" ? 0 : Number(bufferPercent),
        minutesPerPage: minutesPerPage.trim() === "" ? Number.NaN : Number(minutesPerPage),
      }),
    [totalPages, pagesDone, startDate, targetDate, daysOffPerWeek, bufferPercent, minutesPerPage],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    if (result.finished) return "NCERT reading plan: all pages already read — move to revision.";
    return [
      "NCERT reading plan",
      `Pages left: ${NUM.format(result.pagesLeft)}`,
      `Window: ${startDate} to ${targetDate} (${NUM.format(result.calendarDays)} days)`,
      `Study days after ${daysOffPerWeek} day(s) off/week: ${NUM.format(result.studyDays)}`,
      `Revision buffer days: ${NUM.format(result.bufferDays)}`,
      `Reading days: ${NUM.format(result.effectiveDays)}`,
      `Required pace: ${NUM.format(result.pagesPerDay)} pages/day (~${NUM.format(result.minutesPerDay)} min/day)`,
    ].join("\n");
  }, [hasError, result, startDate, targetDate, daysOffPerWeek]);

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
    setTotalPages(DEFAULTS.totalPages);
    setPagesDone(DEFAULTS.pagesDone);
    setStartDate(DEFAULTS.startDate);
    setTargetDate(DEFAULTS.targetDate);
    setDaysOffPerWeek(DEFAULTS.daysOffPerWeek);
    setBufferPercent(DEFAULTS.bufferPercent);
    setMinutesPerPage(DEFAULTS.minutesPerPage);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Pages left to read", DASH],
        ["Calendar days in window", DASH],
        ["Study days after days off", DASH],
        ["Revision buffer days", DASH],
        ["Actual reading days", DASH],
        ["Estimated minutes per day", DASH],
      ]
    : [
        ["Pages left to read", NUM.format(result.pagesLeft)],
        ["Calendar days in window", NUM.format(result.calendarDays)],
        ["Study days after days off", NUM.format(result.studyDays)],
        ["Revision buffer days", NUM.format(result.bufferDays)],
        ["Actual reading days", NUM.format(result.effectiveDays)],
        ["Estimated minutes per day", result.finished ? DASH : `~${NUM.format(result.minutesPerDay)} min`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          NCERT tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">NCERT Reading Speed Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your page count and deadline, allow for weekly days off and a revision buffer, and
          get the daily page quota that actually finishes the book on time.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nrp-total">
              Total pages
            </label>
            <input
              id="nrp-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={totalPages}
              onChange={(event) => setTotalPages(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nrp-done">
              Pages already read
            </label>
            <input
              id="nrp-done"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={pagesDone}
              onChange={(event) => setPagesDone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nrp-start">
              Start date
            </label>
            <input
              id="nrp-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nrp-target">
              Target finish date
            </label>
            <input
              id="nrp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nrp-off">
              Days off per week
            </label>
            <input
              id="nrp-off"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6"
              step="1"
              value={daysOffPerWeek}
              onChange={(event) => setDaysOffPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nrp-buffer">
              Revision buffer (% of study days)
            </label>
            <input
              id="nrp-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="5"
              value={bufferPercent}
              onChange={(event) => setBufferPercent(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nrp-mins">
              Minutes one page takes you
            </label>
            <input
              id="nrp-mins"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="60"
              step="0.5"
              value={minutesPerPage}
              onChange={(event) => setMinutesPerPage(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              A dense NCERT page read carefully with underlining is commonly planned at about 3
              minutes; skimming is faster, note-making slower.
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
              Required pace
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.finished ? "Done" : `${NUM.format(result.pagesPerDay)} pages/day`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : result.finished
                  ? "Every page is already read — the whole window is yours for revision."
                  : `Across ${NUM.format(result.effectiveDays)} reading days, keeping ${NUM.format(result.bufferDays)} days free for revision.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the reading plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Study days = calendar days x (7 − days off) / 7, rounded down; the revision buffer is then
        carved out of study days, and the daily quota is pages left divided by the remaining reading
        days, rounded up.
      </p>
    </main>
  );
}
