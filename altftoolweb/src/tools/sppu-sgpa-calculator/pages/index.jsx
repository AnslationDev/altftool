"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, School, Trash2 } from "lucide-react";

import { SPPU_GRADES, computeCgpa, computeSgpa, sgpaNeededForTarget } from "../lib";

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

const DEFAULT_COURSES = [
  { id: 1, name: "Engineering Mathematics III", credits: "4", points: "9" },
  { id: 2, name: "Data Structures and Algorithms", credits: "3", points: "8" },
  { id: 3, name: "Digital Electronics", credits: "3", points: "7" },
  { id: 4, name: "DSA Laboratory", credits: "2", points: "10" },
  { id: 5, name: "Humanities and Social Sciences", credits: "2", points: "6" },
];

const DEFAULT_SEMESTERS = [
  { id: 1, label: "Semester 1", sgpa: "7.80", credits: "22" },
  { id: 2, label: "Semester 2", sgpa: "8.10", credits: "22" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [nextCourseId, setNextCourseId] = useState(DEFAULT_COURSES.length + 1);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [nextSemId, setNextSemId] = useState(DEFAULT_SEMESTERS.length + 1);
  const [targetCgpa, setTargetCgpa] = useState("8.5");
  const [remainingCredits, setRemainingCredits] = useState("88");
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

  const semesterOk = !semester.error;

  const cumulative = useMemo(() => {
    const past = semesters.map((row) => ({
      label: row.label,
      sgpa: toNumber(row.sgpa),
      credits: toNumber(row.credits),
    }));
    const all = semesterOk
      ? [...past, { label: "This semester", sgpa: semester.sgpa, credits: semester.totalCredits }]
      : past;
    return computeCgpa(all);
  }, [semesters, semesterOk, semester]);

  const cumulativeOk = !cumulative.error;

  const target = useMemo(() => {
    if (!cumulativeOk) return null;
    return sgpaNeededForTarget(
      cumulative.cgpa,
      cumulative.totalCredits,
      toNumber(remainingCredits),
      toNumber(targetCgpa),
    );
  }, [cumulativeOk, cumulative, remainingCredits, targetCgpa]);

  const summary = useMemo(() => {
    if (!semesterOk) return "";
    const lines = [
      "SPPU result summary",
      `Semester SGPA: ${num(semester.sgpa)} / 10 (grade ${semester.equivalentGrade.code})`,
      `Credits registered: ${num(semester.totalCredits)} · earned: ${num(semester.earnedCredits)}`,
      `Credit points: ${num(semester.creditPoints)}`,
    ];
    if (cumulativeOk) {
      lines.push(
        `CGPA across ${cumulative.semesterCount} semesters: ${num(cumulative.cgpa)} over ${num(cumulative.totalCredits)} credits`,
      );
    }
    if (target && !target.error) {
      lines.push(
        `To reach ${num(toNumber(targetCgpa))} CGPA you need ${num(target.requiredSgpa)} SGPA over the remaining ${num(toNumber(remainingCredits))} credits`,
      );
    }
    return lines.join("\n");
  }, [semesterOk, semester, cumulativeOk, cumulative, target, targetCgpa, remainingCredits]);

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
      { id: nextSemId, label: `Semester ${rows.length + 1}`, sgpa: "8.00", credits: "22" },
    ]);
    setNextSemId((value) => value + 1);
  };

  const reset = () => {
    setCourses(DEFAULT_COURSES);
    setNextCourseId(DEFAULT_COURSES.length + 1);
    setSemesters(DEFAULT_SEMESTERS);
    setNextSemId(DEFAULT_SEMESTERS.length + 1);
    setTargetCgpa("8.5");
    setRemainingCredits("88");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          Savitribai Phule Pune University
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SPPU SGPA Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Score this semester from your credits and letter grades, then stack every past semester on
          top to get the credit-weighted CGPA SPPU actually prints — not a plain average of SGPAs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">This semester&apos;s courses</h2>
        <div className="mt-4 grid gap-4">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`sppu-name-${course.id}`}>
                  Course {index + 1}
                </label>
                <input
                  id={`sppu-name-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={course.name}
                  placeholder="Course name (optional)"
                  onChange={(event) => updateCourse(course.id, "name", event.target.value)}
                />
              </div>
              <div className="sm:w-24">
                <label className={LABEL_CLASS} htmlFor={`sppu-credits-${course.id}`}>
                  Credits
                </label>
                <input
                  id={`sppu-credits-${course.id}`}
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
              <div className="sm:w-40">
                <label className={LABEL_CLASS} htmlFor={`sppu-grade-${course.id}`}>
                  Grade
                </label>
                <select
                  id={`sppu-grade-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={course.points}
                  onChange={(event) => updateCourse(course.id, "points", event.target.value)}
                >
                  {SPPU_GRADES.filter((grade) => grade.code !== "AB").map((grade) => (
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
          Grade points: O 10, A+ 9, A 8, B+ 7, B 6, C 5, P 4, F and AB 0. An F keeps its credits in
          the denominator but earns none of them.
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
              {semesterOk ? num(semester.sgpa) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {semesterOk
                ? `Grade ${semester.equivalentGrade.code} · ${num(semester.creditPoints)} credit points over ${num(semester.totalCredits)} credits`
                : "Fix the course rows above to see your SGPA."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy SGPA and CGPA result"
              className={GHOST_BTN}
              disabled={!semesterOk}
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

        {semesterOk && semester.backlogs > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {semester.backlogs} course{semester.backlogs > 1 ? "s" : ""} at 0 points.{" "}
            {num(semester.lostCredits)} credits are not earned until those are cleared.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Credit points this semester", semesterOk ? num(semester.creditPoints) : DASH],
            ["Credits registered", semesterOk ? num(semester.totalCredits) : DASH],
            ["Credits earned", semesterOk ? num(semester.earnedCredits) : DASH],
            ["Courses counted", semesterOk ? String(semester.courseCount) : DASH],
            ["CGPA including this semester", cumulativeOk ? num(cumulative.cgpa) : DASH],
            ["Credits behind that CGPA", cumulativeOk ? num(cumulative.totalCredits) : DASH],
            [
              "Plain average of the SGPAs",
              cumulativeOk ? `${num(cumulative.plainAverage)} (off by ${num(Math.abs(cumulative.weightingGap))})` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Past semesters</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Add each completed semester with the credits it carried. The current semester above is
          added automatically.
        </p>
        <div className="mt-4 grid gap-4">
          {semesters.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`sppu-sem-label-${row.id}`}>
                  Label
                </label>
                <input
                  id={`sppu-sem-label-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.label}
                  onChange={(event) => updateSemester(row.id, "label", event.target.value)}
                />
              </div>
              <div className="sm:w-28">
                <label className={LABEL_CLASS} htmlFor={`sppu-sem-sgpa-${row.id}`}>
                  SGPA
                </label>
                <input
                  id={`sppu-sem-sgpa-${row.id}`}
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
                <label className={LABEL_CLASS} htmlFor={`sppu-sem-credits-${row.id}`}>
                  Credits
                </label>
                <input
                  id={`sppu-sem-credits-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="60"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What do I need for a target CGPA?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sppu-target">
              Target CGPA
            </label>
            <input
              id="sppu-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.1"
              value={targetCgpa}
              onChange={(event) => setTargetCgpa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sppu-remaining">
              Credits still to be attempted
            </label>
            <input
              id="sppu-remaining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="300"
              step="1"
              value={remainingCredits}
              onChange={(event) => setRemainingCredits(event.target.value)}
            />
          </div>
        </div>

        {target && target.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {target.error}
          </p>
        ) : null}

        <p className="mt-4 text-sm">
          {target && !target.error ? (
            target.alreadyThere ? (
              <span className="font-semibold text-[var(--success)]">
                Already there — even a low SGPA in the remaining credits keeps you above the target.
              </span>
            ) : target.achievable ? (
              <span>
                You need an average SGPA of{" "}
                <span className="font-semibold text-[var(--primary)]">{num(target.requiredSgpa)}</span>{" "}
                across the remaining credits.
              </span>
            ) : (
              <span className="font-semibold text-[var(--danger)]">
                That target needs {num(target.requiredSgpa)} SGPA, which is above the 10-point
                maximum. Spread the target over more credits or lower it.
              </span>
            )
          ) : (
            <span className="text-[var(--muted-foreground)]">{DASH}</span>
          )}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Unofficial and for planning only. SPPU converts CGPA to a percentage using a conversion table
        printed in its credit-system rules rather than a single multiplier, and that table varies by
        pattern and faculty — read the equivalence off your own ordinance instead of estimating it.
      </p>
    </main>
  );
}
