"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import {
  DEFAULT_DURATION_MINUTES,
  DEFAULT_READING_MINUTES,
  DEFAULT_REVIEW_MINUTES,
  computePacingPlan,
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

const DEFAULT_SECTIONS = [
  { id: 1, name: "Section A — objective", marks: "20", questions: "20" },
  { id: 2, name: "Section B — short answers", marks: "30", questions: "6" },
  { id: 3, name: "Section C — long answers", marks: "30", questions: "3" },
];

const DEFAULTS = {
  startTime: "09:00",
  duration: String(DEFAULT_DURATION_MINUTES),
  reading: String(DEFAULT_READING_MINUTES),
  review: String(DEFAULT_REVIEW_MINUTES),
};

export default function ToolHome() {
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [reading, setReading] = useState(DEFAULTS.reading);
  const [review, setReview] = useState(DEFAULTS.review);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [nextId, setNextId] = useState(DEFAULT_SECTIONS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePacingPlan({
        startTime,
        durationMinutes: duration.trim() === "" ? Number.NaN : Number(duration),
        readingMinutes: reading.trim() === "" ? 0 : Number(reading),
        reviewMinutes: review.trim() === "" ? 0 : Number(review),
        sections: sections.map((section) => ({
          name: section.name,
          marks: section.marks.trim() === "" ? Number.NaN : Number(section.marks),
          questions: section.questions.trim() === "" ? Number.NaN : Number(section.questions),
        })),
      }),
    [startTime, duration, reading, review, sections],
  );

  const hasError = Boolean(result.error);

  const updateSection = (id, field, value) => {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, [field]: value } : section)),
    );
  };

  const addSection = () => {
    setSections((current) => [
      ...current,
      { id: nextId, name: `Section ${String.fromCharCode(64 + nextId)}`, marks: "10", questions: "5" },
    ]);
    setNextId((id) => id + 1);
  };

  const removeSection = (id) => {
    setSections((current) => (current.length > 1 ? current.filter((s) => s.id !== id) : current));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Three hour paper pacing plan",
      `Start ${result.startsAt} — finish ${result.endsAt}`,
      `Reading until ${result.readingEndsAt} (${result.readingMinutes} min)`,
      ...result.sections.map(
        (s) => `${s.name}: ${NUM.format(s.minutes)} min — finish by ${s.checkpoint}`,
      ),
      `Review from ${result.reviewStartsAt} (${result.reviewMinutes} min)`,
      `Pace: ${NUM.format(result.minutesPerMark)} min per mark`,
    ];
    return lines.join("\n");
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
    setStartTime(DEFAULTS.startTime);
    setDuration(DEFAULTS.duration);
    setReading(DEFAULTS.reading);
    setReview(DEFAULTS.review);
    setSections(DEFAULT_SECTIONS);
    setNextId(DEFAULT_SECTIONS.length + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Time strategy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Three Hour Paper Pacing Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your paper&apos;s sections and marks. The tool splits the writing time in proportion
          to marks and gives you the exact clock time each section must end.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pace-start">
              Exam start time
            </label>
            <input
              id="pace-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pace-duration">
              Paper duration (minutes)
            </label>
            <input
              id="pace-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pace-reading">
              Reading time (minutes)
            </label>
            <input
              id="pace-reading"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={reading}
              onChange={(event) => setReading(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pace-review">
              Review buffer at the end (minutes)
            </label>
            <input
              id="pace-review"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={review}
              onChange={(event) => setReview(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Sections</h2>
        <div className="mt-3 space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pace-name-${section.id}`}>
                    Section name
                  </label>
                  <input
                    id={`pace-name-${section.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={section.name}
                    onChange={(event) => updateSection(section.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pace-marks-${section.id}`}>
                    Marks
                  </label>
                  <input
                    id={`pace-marks-${section.id}`}
                    className={`mt-2 w-full sm:w-24 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={section.marks}
                    onChange={(event) => updateSection(section.id, "marks", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pace-q-${section.id}`}>
                    Questions
                  </label>
                  <input
                    id={`pace-q-${section.id}`}
                    className={`mt-2 w-full sm:w-24 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={section.questions}
                    onChange={(event) => updateSection(section.id, "questions", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  disabled={sections.length <= 1}
                  aria-label={`Remove ${section.name}`}
                  className={`${GHOST_BTN} disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSection} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add section
        </button>
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
              Your pace
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.minutesPerMark)} min/mark`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your checkpoints."
                : `${result.workingMinutes} writing minutes across ${result.totalMarks} marks and ${result.totalQuestions} questions.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the pacing plan"
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
          {(hasError
            ? [
                ["Reading ends", DASH],
                ["Checkpoints", DASH],
                ["Review starts", DASH],
                ["Paper ends", DASH],
              ]
            : [
                [`Reading time (${result.readingMinutes} min) ends`, result.readingEndsAt],
                ...result.sections.map((s) => [
                  `${s.name} — ${NUM.format(s.minutes)} min (${NUM.format(s.minutesPerQuestion)} min/question)`,
                  `finish by ${s.checkpoint}`,
                ]),
                [`Review buffer (${result.reviewMinutes} min) starts`, result.reviewStartsAt],
                ["Paper ends", result.endsAt],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Time is split in proportion to marks — the &quot;minute per mark&quot; rule scaled to your
        paper. Practise with these checkpoints in mocks so the pacing becomes automatic on exam day.
      </p>
    </main>
  );
}
