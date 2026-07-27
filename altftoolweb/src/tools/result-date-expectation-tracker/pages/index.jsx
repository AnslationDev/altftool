"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import { expectResultWindow } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  examDate: "2026-06-15",
  gapsText: "34, 41, 38",
};

export default function ToolHome() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [examDate, setExamDate] = useState(DEFAULTS.examDate);
  const [gapsText, setGapsText] = useState(DEFAULTS.gapsText);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const pastGaps = gapsText
      .split(/[,\s]+/)
      .filter((token) => token !== "")
      .map(Number);
    return expectResultWindow({ examDate, pastGaps, today });
  }, [examDate, gapsText, today]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Result window projection",
      `Exam date: ${examDate}`,
      `Past cycles used: ${result.cycles} (gaps ${result.minGap}-${result.maxGap} days, median ${result.medianGap})`,
      `Earliest expected: ${result.earliestDate}`,
      `Most likely (median): ${result.likelyDate}`,
      `Latest expected: ${result.latestDate}`,
      `Status: ${result.status.text}`,
    ].join("\n");
  }, [hasError, result, examDate]);

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
    setExamDate(DEFAULTS.examDate);
    setGapsText(DEFAULTS.gapsText);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Earliest expected", DASH],
        ["Most likely (median)", DASH],
        ["Latest expected", DASH],
        ["Days since exam", DASH],
      ]
    : [
        ["Earliest expected", `${result.earliestDate} (+${result.minGap} days)`],
        ["Most likely (median)", `${result.likelyDate} (+${result.medianGap} days)`],
        ["Latest expected", `${result.latestDate} (+${result.maxGap} days)`],
        ["Average past gap", `${result.meanGap} days over ${result.cycles} cycle${result.cycles === 1 ? "" : "s"}`],
        ["Days since exam", `${result.daysSinceExam} days`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Exam calendars
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Result Date Expectation Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your exam date and how many days past cycles took between exam and result. The
          tracker projects an expected window — earliest, most likely and latest — and tells you
          whether refreshing the result page today is rational or premature.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rde-exam">
              Exam date (this cycle)
            </label>
            <input
              id="rde-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rde-gaps">
              Past exam-to-result gaps (days, comma separated)
            </label>
            <input
              id="rde-gaps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              placeholder="e.g. 34, 41, 38"
              value={gapsText}
              onChange={(event) => setGapsText(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              For each past cycle: result date minus exam date, in days. One value is enough; more
              cycles give a better window.
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
              Most likely result date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.likelyDate}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the projection." : result.status.text}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the result window projection"
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A projection from past cycles, not an announcement — court cases, re-exams and normalisation
        disputes can push any cycle far outside its historical window. The official website remains
        the only authority.
      </p>
    </main>
  );
}
