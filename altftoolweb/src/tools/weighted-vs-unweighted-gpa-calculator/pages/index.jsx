"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";

import { COURSE_TYPES, GRADE_OPTIONS, computeGpas } from "../lib";

const GPA_FMT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_COURSES = [
  { grade: "A", credits: "1", type: "regular" },
  { grade: "B+", credits: "1", type: "honors" },
  { grade: "A-", credits: "1", type: "ap-ib" },
];

const NEW_COURSE = { grade: "A", credits: "1", type: "regular" };
const DASH = "—";

export default function ToolHome() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeGpas({
        courses: courses.map((course) => ({
          grade: course.grade,
          credits: course.credits.trim() === "" ? Number.NaN : Number(course.credits),
          type: course.type,
        })),
      }),
    [courses],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "High school GPA",
      `Courses: ${result.courseCount}, credits: ${NUM.format(result.totalCredits)}`,
      `Unweighted GPA (4.0 scale): ${GPA_FMT.format(result.unweightedGpa)}`,
      `Weighted GPA (Honors +0.5, AP/IB +1.0): ${GPA_FMT.format(result.weightedGpa)}`,
      `Rigor boost: +${GPA_FMT.format(result.boost)}`,
    ].join("\n");
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
    if (!window.confirm("Reset all courses? This clears your entered courses and cannot be undone.")) {
      return;
    }
    setCourses(DEFAULT_COURSES);
    setCopied(false);
  };

  const updateCourse = (index, field, value) => {
    setCourses((current) =>
      current.map((course, i) => (i === index ? { ...course, [field]: value } : course)),
    );
  };

  const addCourse = () => {
    setCourses((current) => [...current, { ...NEW_COURSE }]);
  };

  const removeCourse = (index) => {
    setCourses((current) => current.filter((_, i) => i !== index));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Grade Conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Weighted vs Unweighted GPA Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter each course&apos;s grade, credits and rigor level to get both GPAs at once —
          unweighted on the standard 4.0 scale, weighted with the common +0.5 Honors and +1.0
          AP/IB bonuses (max 5.0).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {courses.map((course, index) => (
            <fieldset
              key={index}
              className="rounded-lg border border-[var(--border)] p-3 sm:p-4"
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Course {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wg-grade-${index}`}>
                    Grade
                  </label>
                  <select
                    id={`wg-grade-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={course.grade}
                    onChange={(event) => updateCourse(index, "grade", event.target.value)}
                  >
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wg-credits-${index}`}>
                    Credits
                  </label>
                  <input
                    id={`wg-credits-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.25"
                    step="0.25"
                    value={course.credits}
                    onChange={(event) => updateCourse(index, "credits", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wg-type-${index}`}>
                    Course type
                  </label>
                  <select
                    id={`wg-type-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={course.type}
                    onChange={(event) => updateCourse(index, "type", event.target.value)}
                  >
                    {COURSE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                        {type.bonus > 0 ? ` (+${type.bonus})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeCourse(index)}
                  disabled={courses.length <= 1}
                  aria-label={`Remove course ${index + 1}`}
                  className={`${GHOST_BTN} disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </fieldset>
          ))}
        </div>

        <button type="button" onClick={addCourse} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course
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
              Weighted GPA
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : GPA_FMT.format(result.weightedGpa)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Unweighted: ${GPA_FMT.format(result.unweightedGpa)} — course rigor adds ${GPA_FMT.format(result.boost)} points.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the GPA results"
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
              aria-label="Reset all courses to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Unweighted GPA (4.0 scale)", DASH],
                ["Weighted GPA (5.0 max)", DASH],
                ["Rigor boost", DASH],
                ["Total credits", DASH],
              ]
            : [
                ["Unweighted GPA (4.0 scale)", GPA_FMT.format(result.unweightedGpa)],
                ["Weighted GPA (5.0 max)", GPA_FMT.format(result.weightedGpa)],
                ["Rigor boost", `+${GPA_FMT.format(result.boost)}`],
                ["Total credits", NUM.format(result.totalCredits)],
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
        The +0.5 / +1.0 weighting is the most common US convention, but districts differ — some
        weight on a 4.5 scale or weight only semester courses. Failing grades earn no rigor bonus.
        Check your school&apos;s handbook for its exact policy.
      </p>
    </main>
  );
}
