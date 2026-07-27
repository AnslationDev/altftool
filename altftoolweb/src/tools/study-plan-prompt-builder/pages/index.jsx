"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_DAYS_PER_WEEK,
  MAX_HOURS_PER_DAY,
  MIN_DAYS_PER_WEEK,
  MIN_HOURS_PER_DAY,
  buildStudyPlanPrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  syllabus: [
    "Cell structure and organelles",
    "Photosynthesis",
    "Cellular respiration",
    "DNA replication",
    "Protein synthesis",
    "Mendelian genetics",
    "Evolution and natural selection",
    "Ecology and ecosystems",
  ].join("\n"),
  startDate: "2026-08-01",
  examDate: "2026-08-29",
  daysPerWeek: "6",
  hoursPerDay: "2",
  weakTopics: "Protein synthesis",
};

export default function ToolHome() {
  const [syllabus, setSyllabus] = useState(DEFAULTS.syllabus);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [examDate, setExamDate] = useState(DEFAULTS.examDate);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [weakTopics, setWeakTopics] = useState(DEFAULTS.weakTopics);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildStudyPlanPrompt({
        syllabus,
        startDate,
        examDate,
        daysPerWeek: daysPerWeek.trim() === "" ? Number.NaN : Number(daysPerWeek),
        hoursPerDay: hoursPerDay.trim() === "" ? Number.NaN : Number(hoursPerDay),
        weakTopics,
      }),
    [syllabus, startDate, examDate, daysPerWeek, hoursPerDay, weakTopics],
  );

  const hasError = Boolean(result.error);

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSyllabus(DEFAULTS.syllabus);
    setStartDate(DEFAULTS.startDate);
    setExamDate(DEFAULTS.examDate);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setWeakTopics(DEFAULTS.weakTopics);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Days until the exam", DASH],
        ["Study days available", DASH],
        ["First-pass days", DASH],
        ["Final review block", DASH],
        ["Total study hours", DASH],
      ]
    : [
        ["Days until the exam", NUM.format(result.prepDays)],
        ["Study days available", NUM.format(result.studyDays)],
        ["First-pass days", NUM.format(result.firstPassDays)],
        ["Final review block", `${NUM.format(result.finalReviewDays)} day${result.finalReviewDays === 1 ? "" : "s"}`],
        ["Total study hours", NUM.format(result.totalHours)],
        ["Review intervals used", `${result.usableIntervals.join(", ")} days after first pass`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Study Plan Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your syllabus, pick your exam date and availability. The tool works out your study
          days, spaced review intervals and a final revision block, then writes an AI prompt for a
          day-by-day plan.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="plan-syllabus">
            Syllabus topics — one per line
          </label>
          <textarea
            id="plan-syllabus"
            className={`mt-2 min-h-36 ${TEXTAREA_CLASS}`}
            rows={7}
            value={syllabus}
            onChange={(event) => setSyllabus(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="plan-start">
              First study day
            </label>
            <input
              id="plan-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="plan-exam">
              Exam date
            </label>
            <input
              id="plan-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="plan-days-week">
              Study days per week ({MIN_DAYS_PER_WEEK}–{MAX_DAYS_PER_WEEK})
            </label>
            <input
              id="plan-days-week"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_DAYS_PER_WEEK}
              max={MAX_DAYS_PER_WEEK}
              step="1"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="plan-hours">
              Hours per study day ({MIN_HOURS_PER_DAY}–{MAX_HOURS_PER_DAY})
            </label>
            <input
              id="plan-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HOURS_PER_DAY}
              max={MAX_HOURS_PER_DAY}
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="plan-weak">
              Weaker topics to weight more (optional, comma-separated)
            </label>
            <input
              id="plan-weak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={weakTopics}
              onChange={(event) => setWeakTopics(event.target.value)}
            />
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
              Topics scheduled
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.topicsCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated study plan prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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

        <div className="mt-5">
          <h2 className="text-base font-semibold">Generated prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The plan maths runs locally in your browser. Spaced-repetition intervals follow the standard
        expanding 1-3-7-14-30 day ladder; adjust the AI&apos;s output to fit your own pace and any
        fixed class schedule.
      </p>
    </main>
  );
}
