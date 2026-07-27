"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_EDIT_RATIO,
  DEFAULT_TARGET_MINUTES,
  DEFAULT_WPM,
  LENGTH_BANDS,
  formatHoursMinutes,
  planCourse,
  planToText,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAND_TONE = {
  ideal: "text-[var(--success)]",
  good: "text-[var(--foreground)]",
  watch: "text-[var(--muted-foreground)]",
  split: "text-[var(--danger)]",
};

const DEFAULT_LESSONS = [
  { id: "l1", module: "1. Getting started", title: "Welcome and what you will build", minutes: "3" },
  { id: "l2", module: "1. Getting started", title: "Installing the tools", minutes: "7" },
  { id: "l3", module: "2. Core concepts", title: "The mental model", minutes: "9" },
  { id: "l4", module: "2. Core concepts", title: "Worked example, start to finish", minutes: "14" },
  { id: "l5", module: "3. Practice", title: "Exercise walkthrough", minutes: "6" },
  { id: "l6", module: "3. Practice", title: "Common mistakes and fixes", minutes: "5" },
];

const DEFAULTS = {
  courseName: "",
  target: String(DEFAULT_TARGET_MINUTES),
  wpm: String(DEFAULT_WPM),
  editRatio: String(DEFAULT_EDIT_RATIO),
};

const toNumber = (value) => (String(value).trim() === "" ? NaN : Number(value));

export default function ToolHome() {
  const [courseName, setCourseName] = useState(DEFAULTS.courseName);
  const [lessons, setLessons] = useState(DEFAULT_LESSONS);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [editRatio, setEditRatio] = useState(DEFAULTS.editRatio);
  const [nextId, setNextId] = useState(DEFAULT_LESSONS.length + 1);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planCourse({
        lessons: lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          module: lesson.module,
          minutes: toNumber(lesson.minutes),
        })),
        targetMinutes: toNumber(target),
        wordsPerMinute: toNumber(wpm),
        editHoursPerMinute: toNumber(editRatio),
      }),
    [lessons, target, wpm, editRatio],
  );

  const updateLesson = (id, field, value) => {
    setLessons((prev) =>
      prev.map((lesson) => (lesson.id === id ? { ...lesson, [field]: value } : lesson)),
    );
  };

  const addLesson = () => {
    const id = `l${nextId}`;
    setNextId((value) => value + 1);
    setLessons((prev) => [
      ...prev,
      {
        id,
        module: prev.length > 0 ? prev[prev.length - 1].module : "1. Module one",
        title: `Lesson ${prev.length + 1}`,
        minutes: String(DEFAULT_TARGET_MINUTES),
      },
    ]);
  };

  const removeLesson = (id) => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
  };

  const copyResult = async () => {
    if (plan.error) return;
    try {
      await navigator.clipboard.writeText(planToText(plan, courseName));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCourseName(DEFAULTS.courseName);
    setLessons(DEFAULT_LESSONS);
    setTarget(DEFAULTS.target);
    setWpm(DEFAULTS.wpm);
    setEditRatio(DEFAULTS.editRatio);
    setNextId(DEFAULT_LESSONS.length + 1);
    setCopied(false);
  };

  const rowById = useMemo(() => {
    const map = new Map();
    if (!plan.error) for (const row of plan.rows) map.set(row.id, row);
    return map;
  }, [plan]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Course production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Course Lesson Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out every lesson with its planned length and see the total runtime, the balance across
          modules, the script word count and which lessons are long enough to lose the viewer.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Course settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vct-name">
              Course name (optional)
            </label>
            <input
              id="vct-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={courseName}
              onChange={(event) => setCourseName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vct-target">
              Target lesson length (minutes)
            </label>
            <input
              id="vct-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="120"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vct-wpm">
              Speaking pace (words per minute)
            </label>
            <input
              id="vct-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="80"
              max="220"
              step="5"
              value={wpm}
              onChange={(event) => setWpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vct-edit">
              Editing hours per finished minute
            </label>
            <input
              id="vct-edit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={editRatio}
              onChange={(event) => setEditRatio(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Lessons</h2>
          <button type="button" onClick={addLesson} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add lesson
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {lessons.map((lesson, index) => {
            const row = rowById.get(lesson.id);
            return (
              <li
                key={lesson.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`vct-module-${lesson.id}`}>
                      Module
                    </label>
                    <input
                      id={`vct-module-${lesson.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      maxLength={60}
                      value={lesson.module}
                      onChange={(event) => updateLesson(lesson.id, "module", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`vct-title-${lesson.id}`}>
                      Lesson {index + 1} title
                    </label>
                    <input
                      id={`vct-title-${lesson.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      maxLength={90}
                      value={lesson.title}
                      onChange={(event) => updateLesson(lesson.id, "title", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`vct-minutes-${lesson.id}`}>
                      Length (minutes)
                    </label>
                    <input
                      id={`vct-minutes-${lesson.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0.5"
                      max="600"
                      step="0.5"
                      value={lesson.minutes}
                      onChange={(event) => updateLesson(lesson.id, "minutes", event.target.value)}
                    />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                      {row ? (
                        <>
                          <span className={`font-semibold ${BAND_TONE[row.band.id]}`}>
                            {row.band.label}
                          </span>{" "}
                          · {NUM.format(row.scriptWords)} script words
                          {row.splitInto > 1 ? ` · split into ${row.splitInto}` : ""}
                        </>
                      ) : (
                        DASH
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLesson(lesson.id)}
                      aria-label={`Remove lesson ${index + 1}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total course runtime
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : formatHoursMinutes(plan.totalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the lessons above to see the plan."
                : `${plan.lessonCount} lessons across ${plan.modules.length} module${plan.modules.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the course plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the course plan" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Average lesson", plan.error ? DASH : `${NUM1.format(plan.averageLesson)} min`],
            ["Median lesson", plan.error ? DASH : `${NUM1.format(plan.medianLesson)} min`],
            [
              "Longest lesson",
              plan.error ? DASH : `${plan.longest.title} (${NUM1.format(plan.longest.minutes)} min)`,
            ],
            [
              `Lessons over the ${plan.error ? DASH : NUM1.format(plan.targetMinutes)} minute target`,
              plan.error ? DASH : NUM.format(plan.overTargetCount),
            ],
            [
              "Estimated watched time",
              plan.error
                ? DASH
                : `${formatHoursMinutes(plan.watchedMinutes)} (${NUM.format(plan.retentionPercent)}% of runtime)`,
            ],
            ["Script length", plan.error ? DASH : `${NUM.format(plan.scriptWords)} words`],
            ["Editing estimate", plan.error ? DASH : `${NUM1.format(plan.editHours)} hours`],
            [
              "Extra lessons if you split the long ones",
              plan.error ? DASH : NUM.format(plan.extraLessonsIfSplit),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Balance across modules</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Module</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Lessons</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Runtime</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {plan.modules.map((module) => (
                  <tr key={module.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{module.name}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(module.lessons)}</td>
                    <td className="py-2 pr-3 text-right">{formatHoursMinutes(module.minutes)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(module.share)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the length bands mean</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {LENGTH_BANDS.map((band) => (
            <li key={band.id} className="flex flex-col gap-0.5">
              <span className={`font-semibold ${BAND_TONE[band.id]}`}>
                {band.label} —{" "}
                {band.maxMinutes === Infinity ? "over 12 minutes" : `up to ${band.maxMinutes} minutes`}
              </span>
              <span className="text-[var(--muted-foreground)]">{band.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Bands follow the engagement findings reported by Guo, Kim and Rubin at ACM Learning at
          Scale in 2014, where median engagement dropped sharply beyond six minutes.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. The watched-time figure is a stepwise approximation of published engagement
        bands, not a prediction for your audience — a motivated professional cohort will sit through
        far longer lessons than a general one.
      </p>
    </main>
  );
}
