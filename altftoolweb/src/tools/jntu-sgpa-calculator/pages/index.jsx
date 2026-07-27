"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, TrendingUp } from "lucide-react";

import {
  JNTU_REGULATIONS,
  PASS_MARK_PERCENT,
  computeSgpa,
  gradeForMarks,
  gradeScale,
  rollIntoCgpa,
} from "../lib";

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
  { id: 1, name: "Mathematics-II", credits: "3", points: "10", marks: "92" },
  { id: 2, name: "Applied Physics", credits: "3", points: "9", marks: "84" },
  { id: 3, name: "Data Structures", credits: "4", points: "8", marks: "76" },
  { id: 4, name: "Engineering Drawing", credits: "2", points: "7", marks: "64" },
  { id: 5, name: "Physics Laboratory", credits: "1.5", points: "5", marks: "46" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [regulation, setRegulation] = useState("R16+");
  const [mode, setMode] = useState("grade");
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [nextId, setNextId] = useState(DEFAULT_COURSES.length + 1);
  const [priorCgpa, setPriorCgpa] = useState("");
  const [priorCredits, setPriorCredits] = useState("");
  const [copied, setCopied] = useState(false);

  const scale = useMemo(() => gradeScale(regulation), [regulation]);

  const result = useMemo(() => {
    const prepared = courses.map((course) => {
      if (mode === "marks") {
        const grade = gradeForMarks(toNumber(course.marks), regulation);
        return {
          name: course.name,
          credits: toNumber(course.credits),
          points: grade ? grade.points : NaN,
        };
      }
      return {
        name: course.name,
        credits: toNumber(course.credits),
        points: toNumber(course.points),
      };
    });
    return computeSgpa({ courses: prepared, regulation });
  }, [courses, mode, regulation]);

  const ok = !result.error;

  const rolled = useMemo(() => {
    if (!ok) return null;
    const cgpa = toNumber(priorCgpa);
    const credits = toNumber(priorCredits);
    if (!Number.isFinite(cgpa) || !Number.isFinite(credits) || credits <= 0) return null;
    return rollIntoCgpa(cgpa, credits, result.sgpa, result.totalCredits);
  }, [ok, priorCgpa, priorCredits, result]);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      `JNTU semester result (${JNTU_REGULATIONS[regulation].name})`,
      `SGPA: ${num(result.sgpa)} / 10`,
      `Equivalent percentage: ${num(result.percentage)}%`,
      `Credits registered: ${num(result.totalCredits)} · earned: ${num(result.earnedCredits)}`,
      `Credit points: ${num(result.creditPoints)}`,
      `Class on this average: ${result.classAwarded}`,
    ];
    if (rolled && !rolled.error) {
      lines.push(`Updated CGPA: ${num(rolled.cgpa)} (${num(rolled.percentage)}%)`);
    }
    return lines.join("\n");
  }, [ok, result, regulation, rolled]);

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

  const addCourse = () => {
    setCourses((rows) => [...rows, { id: nextId, name: "", credits: "3", points: "8", marks: "70" }]);
    setNextId((value) => value + 1);
  };

  const reset = () => {
    setRegulation("R16+");
    setMode("grade");
    setCourses(DEFAULT_COURSES);
    setNextId(DEFAULT_COURSES.length + 1);
    setPriorCgpa("");
    setPriorCredits("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          JNTUH · JNTUK · JNTUA
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">JNTU SGPA Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter grades or raw marks for each subject to get your credit-weighted SGPA, the percentage
          JNTU equates it to, and the class that average falls in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jntu-regulation">
              Regulation
            </label>
            <select
              id="jntu-regulation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regulation}
              onChange={(event) => setRegulation(event.target.value)}
            >
              {Object.entries(JNTU_REGULATIONS).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Only the printed letters differ; the grade points are identical.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jntu-mode">
              What do you have?
            </label>
            <select
              id="jntu-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="grade">Letter grades from the memo</option>
              <option value="marks">Marks out of 100</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Subjects this semester</h2>
        <div className="mt-4 grid gap-4">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`jntu-name-${course.id}`}>
                  Subject {index + 1}
                </label>
                <input
                  id={`jntu-name-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={course.name}
                  placeholder="Subject name (optional)"
                  onChange={(event) => updateCourse(course.id, "name", event.target.value)}
                />
              </div>
              <div className="sm:w-24">
                <label className={LABEL_CLASS} htmlFor={`jntu-credits-${course.id}`}>
                  Credits
                </label>
                <input
                  id={`jntu-credits-${course.id}`}
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
              {mode === "marks" ? (
                <div className="sm:w-32">
                  <label className={LABEL_CLASS} htmlFor={`jntu-marks-${course.id}`}>
                    Marks /100
                  </label>
                  <input
                    id={`jntu-marks-${course.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="1"
                    value={course.marks}
                    onChange={(event) => updateCourse(course.id, "marks", event.target.value)}
                  />
                </div>
              ) : (
                <div className="sm:w-40">
                  <label className={LABEL_CLASS} htmlFor={`jntu-grade-${course.id}`}>
                    Grade
                  </label>
                  <select
                    id={`jntu-grade-${course.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={course.points}
                    onChange={(event) => updateCourse(course.id, "points", event.target.value)}
                  >
                    {scale.map((grade) => (
                      <option key={grade.code} value={String(grade.points)}>
                        {grade.code} — {grade.points} pt
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  setCourses((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== course.id) : rows))
                }
                aria-label={`Remove subject ${index + 1}`}
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
          Add subject
        </button>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-sm">
            <caption className="sr-only">JNTU grade scale for the selected regulation</caption>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Marks</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Grade</th>
                <th scope="col" className="py-2 text-right font-semibold">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {scale.map((grade) => (
                <tr key={grade.code}>
                  <td className="py-2 pr-3">{grade.band}</td>
                  <td className="py-2 pr-3">{grade.code}</td>
                  <td className="py-2 text-right font-semibold">{grade.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          A subject is passed at {PASS_MARK_PERCENT}% of the total marks, subject to the separate
          end-semester minimum your regulation sets.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add it to your CGPA (optional)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jntu-prior-cgpa">
              CGPA so far
            </label>
            <input
              id="jntu-prior-cgpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={priorCgpa}
              placeholder="e.g. 7.80"
              onChange={(event) => setPriorCgpa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jntu-prior-credits">
              Credits completed so far
            </label>
            <input
              id="jntu-prior-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={priorCredits}
              placeholder="e.g. 84"
              onChange={(event) => setPriorCredits(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Semester SGPA
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? num(result.sgpa) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(result.percentage)}% equivalent · ${num(result.creditPoints)} credit points over ${num(result.totalCredits)} credits`
                : "Fix the subject rows above to see your SGPA."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy SGPA result"
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

        {ok && result.backlogs > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.backlogs} subject{result.backlogs > 1 ? "s" : ""} scored 0 points.{" "}
            {num(result.lostCredits)} credits stay unearned until the supplementary is cleared.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Equivalent percentage", ok ? `${num(result.percentage)}%` : DASH],
            ["Total credit points", ok ? num(result.creditPoints) : DASH],
            ["Credits registered", ok ? num(result.totalCredits) : DASH],
            ["Credits earned", ok ? num(result.earnedCredits) : DASH],
            ["Class on this average", ok ? result.classAwarded : DASH],
            ["Subjects counted", ok ? String(result.courseCount) : DASH],
            ["Updated CGPA", rolled && !rolled.error ? num(rolled.cgpa) : DASH],
            [
              "Updated CGPA as percentage",
              rolled && !rolled.error ? `${num(rolled.percentage)}%` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <caption className="sr-only">Credit points contributed by each subject</caption>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Subject</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Credits</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Grade</th>
                  <th scope="col" className="py-2 text-right font-semibold">Credit points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.rows.map((row, index) => (
                  <tr key={`${row.name}-${index}`}>
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{num(row.credits)}</td>
                    <td className="py-2 pr-3 text-right">{row.code}</td>
                    <td className="py-2 text-right font-semibold">{num(row.creditPoints)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Unofficial and for planning only. The class shown is based on CGPA alone; JNTU also considers
        supplementary attempts and the duration taken, so check your regulation before quoting it.
      </p>
    </main>
  );
}
