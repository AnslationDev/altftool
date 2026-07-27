"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { KTU_GRADES, MIN_DEGREE_CGPA, computeCgpa, computeSgpa } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** F, FE and I all carry 0 points, so only one 0-point option is offered. */
const GRADE_OPTIONS = KTU_GRADES.filter((grade) => grade.code !== "FE" && grade.code !== "I");

const DEFAULT_COURSES = [
  { id: 1, name: "Linear Algebra and Calculus", credits: "4", points: "10" },
  { id: 2, name: "Engineering Chemistry", credits: "4", points: "8.5" },
  { id: 3, name: "Engineering Graphics", credits: "3", points: "8" },
  { id: 4, name: "Basics of Civil and Mechanical", credits: "3", points: "7.5" },
  { id: 5, name: "Chemistry Laboratory", credits: "2", points: "6.5" },
  { id: 6, name: "Life Skills", credits: "1", points: "5.5" },
];

const DEFAULT_SEMESTERS = [{ id: 1, label: "Semester 1", sgpa: "7.90", credits: "20" }];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [nextCourseId, setNextCourseId] = useState(DEFAULT_COURSES.length + 1);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [nextSemId, setNextSemId] = useState(DEFAULT_SEMESTERS.length + 1);
  const [copied, setCopied] = useState(false);

  const semester = useMemo(
    () =>
      computeSgpa({
        courses: courses.map((course) => ({
          name: course.name,
          credits: toNumber(course.credits),
          points: toNumber(course.points),
        })),
      }),
    [courses],
  );

  const ok = !semester.error;

  const cumulative = useMemo(() => {
    const past = semesters.map((row) => ({
      label: row.label,
      sgpa: toNumber(row.sgpa),
      credits: toNumber(row.credits),
    }));
    const all = ok
      ? [...past, { label: "This semester", sgpa: semester.sgpa, credits: semester.totalCredits }]
      : past;
    return computeCgpa(all);
  }, [semesters, ok, semester]);

  const cgpaOk = !cumulative.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "KTU result summary",
      `SGPA: ${num(semester.sgpa)} / 10 (grade band ${semester.equivalentGrade.code})`,
      `Credits registered: ${num(semester.totalCredits)} · earned: ${num(semester.earnedCredits)}`,
      `Credit points: ${num(semester.creditPoints)}`,
    ];
    if (cgpaOk) {
      lines.push(
        `CGPA across ${cumulative.semesterCount} semesters: ${num(cumulative.cgpa)} over ${num(cumulative.totalCredits)} credits`,
        `Percentage equivalent: ${num(cumulative.percentage)}%`,
      );
    }
    return lines.join("\n");
  }, [ok, semester, cgpaOk, cumulative]);

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

  const updateCourse = (id, field, value) =>
    setCourses((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const updateSemester = (id, field, value) =>
    setSemesters((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const addCourse = () => {
    setCourses((rows) => [...rows, { id: nextCourseId, name: "", credits: "3", points: "8" }]);
    setNextCourseId((value) => value + 1);
  };
  const addSemester = () => {
    setSemesters((rows) => [
      ...rows,
      { id: nextSemId, label: `Semester ${rows.length + 1}`, sgpa: "8.00", credits: "20" },
    ]);
    setNextSemId((value) => value + 1);
  };

  const reset = () => {
    setCourses(DEFAULT_COURSES);
    setNextCourseId(DEFAULT_COURSES.length + 1);
    setSemesters(DEFAULT_SEMESTERS);
    setNextSemId(DEFAULT_SEMESTERS.length + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          APJ Abdul Kalam Technological University
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">KTU SGPA Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          KTU grades step in halves — S 10, A+ 9, A 8.5, B+ 8 and so on. Enter your credits and
          letters to get the credit-weighted SGPA, the running CGPA and the credits you have earned.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Courses this semester</h2>
        <div className="mt-4 grid gap-4">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`ktu-name-${course.id}`}>
                  Course {index + 1}
                </label>
                <input
                  id={`ktu-name-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={course.name}
                  placeholder="Course name (optional)"
                  onChange={(event) => updateCourse(course.id, "name", event.target.value)}
                />
              </div>
              <div className="sm:w-24">
                <label className={LABEL_CLASS} htmlFor={`ktu-credits-${course.id}`}>
                  Credits
                </label>
                <input
                  id={`ktu-credits-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="20"
                  step="0.5"
                  value={course.credits}
                  onChange={(event) => updateCourse(course.id, "credits", event.target.value)}
                />
              </div>
              <div className="sm:w-44">
                <label className={LABEL_CLASS} htmlFor={`ktu-grade-${course.id}`}>
                  Grade
                </label>
                <select
                  id={`ktu-grade-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={course.points}
                  onChange={(event) => updateCourse(course.id, "points", event.target.value)}
                >
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={grade.code} value={String(grade.points)}>
                      {grade.code} — {grade.points} pt
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCourses((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== course.id) : rows))
                }
                aria-label={`Remove course ${index + 1}`}
                disabled={courses.length <= 1}
                className={`${GHOST_BTN} sm:w-11 sm:px-0 disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addCourse} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course
        </button>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          FE (ineligible on attendance) and I (incomplete) carry 0 points exactly like F — pick F for
          any of them. P at 5.5 is the lowest grade that earns the credits.
        </p>
      </section>

      {semester.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {semester.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Semester SGPA
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? num(semester.sgpa) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(semester.creditPoints)} credit points over ${num(semester.totalCredits)} credits · sits in the ${semester.equivalentGrade.code} band`
                : "Fix the course rows above to see your SGPA."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy SGPA and CGPA result"
              className={GHOST_BTN}
              disabled={!ok}
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

        {ok && semester.failedCourses > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {semester.failedCourses} course{semester.failedCourses > 1 ? "s" : ""} at 0 points.{" "}
            {num(semester.lostCredits)} credits stay unearned until you clear the supplementary.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Credit points this semester", ok ? num(semester.creditPoints) : DASH],
            ["Credits registered", ok ? num(semester.totalCredits) : DASH],
            ["Credits earned", ok ? num(semester.earnedCredits) : DASH],
            ["Courses counted", ok ? String(semester.courseCount) : DASH],
            ["CGPA including this semester", cgpaOk ? num(cumulative.cgpa) : DASH],
            ["Credits behind that CGPA", cgpaOk ? num(cumulative.totalCredits) : DASH],
            [
              "Percentage equivalent of the CGPA",
              cgpaOk ? `${num(cumulative.percentage)}%` : DASH,
            ],
            [
              `Above the ${MIN_DEGREE_CGPA.toFixed(1)} CGPA degree minimum`,
              cgpaOk ? (cumulative.meetsDegreeMinimum ? "Yes" : "No") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold">Credits by grade</h3>
            <ul className="mt-3 grid gap-2">
              {semester.distribution.map((entry) => (
                <li key={entry.code} className="flex items-center gap-3 text-sm">
                  <span className="w-10 shrink-0 font-semibold">{entry.code}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${entry.share}%` }}
                    />
                  </span>
                  <span className="w-28 shrink-0 text-right text-[var(--muted-foreground)]">
                    {num(entry.credits)} cr · {num(entry.share)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Earlier semesters</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Add each completed semester with the credits it carried. The semester above is included
          automatically.
        </p>
        <div className="mt-4 grid gap-4">
          {semesters.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`ktu-sem-label-${row.id}`}>
                  Label
                </label>
                <input
                  id={`ktu-sem-label-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.label}
                  onChange={(event) => updateSemester(row.id, "label", event.target.value)}
                />
              </div>
              <div className="sm:w-28">
                <label className={LABEL_CLASS} htmlFor={`ktu-sem-sgpa-${row.id}`}>
                  SGPA
                </label>
                <input
                  id={`ktu-sem-sgpa-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="10"
                  step="0.01"
                  value={row.sgpa}
                  onChange={(event) => updateSemester(row.id, "sgpa", event.target.value)}
                />
              </div>
              <div className="sm:w-28">
                <label className={LABEL_CLASS} htmlFor={`ktu-sem-credits-${row.id}`}>
                  Credits
                </label>
                <input
                  id={`ktu-sem-credits-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="40"
                  step="1"
                  value={row.credits}
                  onChange={(event) => updateSemester(row.id, "credits", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setSemesters((rows) => rows.filter((item) => item.id !== row.id))}
                aria-label={`Remove ${row.label || `semester ${index + 1}`}`}
                className={`${GHOST_BTN} sm:w-11 sm:px-0`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSemester} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add semester
        </button>

        {cumulative.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {cumulative.error}
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Unofficial and for planning only. Grade points here follow the 2019 B.Tech scheme; older
        schemes and PG programmes use different letters, and the percentage row is KTU&apos;s
        form-filling equivalence, not a re-marked score. Check your own regulation before quoting it.
      </p>
    </main>
  );
}
