"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, School, Trash2 } from "lucide-react";

import {
  CALICUT_GRADE_BANDS,
  CALICUT_LETTER_POINTS,
  calicutGpaFromGrades,
  calicutGpaToPercentage,
  calicutPercentageToGpa,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const gp = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_COURSES = [
  { id: 1, grade: "A+", credits: "4" },
  { id: 2, grade: "A", credits: "4" },
  { id: 3, grade: "B+", credits: "3" },
];

export default function ToolHome() {
  const [mode, setMode] = useState("toPercent");
  const [gpaInput, setGpaInput] = useState("7.6");
  const [percentInput, setPercentInput] = useState("76");
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const forward = useMemo(() => calicutGpaToPercentage({ cgpa: gpaInput }), [gpaInput]);
  const reverse = useMemo(() => calicutPercentageToGpa({ percentage: percentInput }), [percentInput]);
  const fromGrades = useMemo(() => calicutGpaFromGrades(courses), [courses]);

  const active = mode === "toPercent" ? forward : reverse;
  const ok = !active.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    if (mode === "toPercent") {
      return [
        "Calicut University CBCSS conversion",
        `CGPA / SGPA: ${gp(forward.gpa)}`,
        `Equivalent percentage: ${pct(forward.percentage)}`,
        `Overall grade: ${forward.grade} (${forward.gradeLabel})`,
        `Formula: percentage = ${forward.formula}`,
      ].join("\n");
    }
    return [
      "Calicut University CBCSS conversion",
      `Percentage: ${pct(reverse.percentage)}`,
      `Equivalent CGPA: ${gp(reverse.gpa)}`,
      `Overall grade: ${reverse.grade} (${reverse.gradeLabel})`,
      `Formula: CGPA = ${reverse.formula}`,
    ].join("\n");
  }, [ok, mode, forward, reverse]);

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
    setMode("toPercent");
    setGpaInput("7.6");
    setPercentInput("76");
    setCourses(DEFAULT_COURSES);
    setNextId(4);
    setCopied(false);
  };

  const updateCourse = (id, key, value) =>
    setCourses((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addCourse = () => {
    setCourses((rows) => [...rows, { id: nextId, grade: "B+", credits: "3" }]);
    setNextId((current) => current + 1);
  };

  const removeCourse = (id) =>
    setCourses((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          University of Calicut
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Calicut University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The CBCSS grade point scale is built so that each grade point is a tenth of the
          mid-point of its marks band. Equivalent marks are therefore the average multiplied by
          ten &mdash; no offset is subtracted.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div role="group" aria-label="Conversion direction" className="mb-5 grid gap-2 sm:grid-cols-2">
          {[
            ["toPercent", "CGPA to percentage"],
            ["toCgpa", "Percentage to CGPA"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={
                mode === value
                  ? `${PRIMARY_BTN} w-full`
                  : `${GHOST_BTN} w-full text-[var(--muted-foreground)]`
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "toPercent" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="cu-gpa">
              CGPA or SGPA (out of 10)
            </label>
            <input
              id="cu-gpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={gpaInput}
              onChange={(event) => setGpaInput(event.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="cu-percent">
              Percentage of marks
            </label>
            <input
              id="cu-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              value={percentInput}
              onChange={(event) => setPercentInput(event.target.value)}
            />
          </div>
        )}
      </section>

      {active.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {active.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {mode === "toPercent" ? "Equivalent percentage" : "Equivalent CGPA"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (mode === "toPercent" ? pct(forward.percentage) : gp(reverse.gpa)) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `Calculated as ${active.formula}` : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the conversion result"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(mode === "toPercent"
            ? [
                ["Grade point average", ok ? gp(forward.gpa) : "—"],
                ["Equivalent percentage", ok ? pct(forward.percentage) : "—"],
                ["Overall letter grade", ok ? `${forward.grade} — ${forward.gradeLabel}` : "—"],
                ["At or above the pass point of 4", ok ? (forward.passing ? "Yes" : "No") : "—"],
              ]
            : [
                ["Percentage entered", ok ? pct(reverse.percentage) : "—"],
                ["Equivalent grade point average", ok ? gp(reverse.gpa) : "—"],
                ["Overall letter grade", ok ? `${reverse.grade} — ${reverse.gradeLabel}` : "—"],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Grade point average from course grades</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Enter the letter grade and credit of each course. Grade points are weighted by credit,
          so a four credit core course counts more than a two credit open course.
        </p>

        <div className="mt-4 grid gap-3">
          {courses.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`cu-grade-${row.id}`}>
                  Course {index + 1} grade
                </label>
                <select
                  id={`cu-grade-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.grade}
                  onChange={(event) => updateCourse(row.id, "grade", event.target.value)}
                >
                  {CALICUT_LETTER_POINTS.map((option) => (
                    <option key={option.grade} value={option.grade}>
                      {option.grade} — {option.point} points
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`cu-credit-${row.id}`}>
                  Credits
                </label>
                <input
                  id={`cu-credit-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateCourse(row.id, "credits", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeCourse(row.id)}
                disabled={courses.length < 2}
                aria-label={`Remove course ${index + 1}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addCourse} className={`${GHOST_BTN} mt-3`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course
        </button>

        {fromGrades.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {fromGrades.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Credit weighted GPA", gp(fromGrades.gpa)],
              ["Equivalent percentage", pct(fromGrades.percentage)],
              ["Total credits", NUM0.format(fromGrades.totalCredits)],
              ["Total grade points", NUM0.format(fromGrades.totalGradePoints)],
              ["Overall grade", `${fromGrades.grade} — ${fromGrades.gradeLabel}`],
              ["Credits in failed courses", NUM0.format(fromGrades.failedCredits)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">CBCSS grade bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Marks
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Point
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {CALICUT_GRADE_BANDS.map((row) => (
                <tr key={row.grade} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {row.minMarks} &ndash; {row.maxMarks === 100 ? "100" : `below ${row.maxMarks}`}
                  </td>
                  <td className="py-2 pr-3 font-semibold">{row.grade}</td>
                  <td className="py-2 pr-3">{row.point}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          The pass band floor is 35 marks on most programmes; several science and professional
          programmes set it at 40. Check your syllabus regulation.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion for form filling. Where a recruiter or a foreign university
        insists on a certified equivalence, request it from the Calicut University examination
        branch rather than submitting a self-calculated figure.
      </p>
    </main>
  );
}
