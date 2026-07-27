"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

import { AKTU_GRADES, computeCgpa, computeSgpa } from "../lib";

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
  { id: 1, name: "Engineering Mathematics", credits: "4", points: "9" },
  { id: 2, name: "Engineering Physics", credits: "3", points: "8" },
  { id: 3, name: "Programming for Problem Solving", credits: "3", points: "10" },
  { id: 4, name: "Basic Electrical Engineering", credits: "2", points: "7" },
  { id: 5, name: "Environment and Ecology", credits: "1", points: "6" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [nextId, setNextId] = useState(DEFAULT_COURSES.length + 1);
  const [priorCgpa, setPriorCgpa] = useState("");
  const [priorCredits, setPriorCredits] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
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

  const ok = !result.error;

  const cumulative = useMemo(() => {
    if (!ok) return null;
    const cgpa = toNumber(priorCgpa);
    const credits = toNumber(priorCredits);
    if (!Number.isFinite(cgpa) || !Number.isFinite(credits) || credits <= 0) return null;
    const rolled = computeCgpa([
      { sgpa: cgpa, credits },
      { sgpa: result.sgpa, credits: result.totalCredits },
    ]);
    return rolled;
  }, [ok, priorCgpa, priorCredits, result]);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "AKTU semester result",
      `SGPA: ${num(result.sgpa)} / 10`,
      `Equivalent percentage: ${num(result.percentage)}%`,
      `Credits registered: ${num(result.totalCredits)}`,
      `Credits earned: ${num(result.earnedCredits)}`,
      `Credit points: ${num(result.creditPoints)}`,
      `Carry-over papers: ${result.backlogs}`,
    ];
    if (cumulative && !cumulative.error) {
      lines.push(`Updated CGPA: ${num(cumulative.cgpa)} (${num(cumulative.percentage)}%)`);
    }
    return lines.join("\n");
  }, [ok, result, cumulative]);

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

  const updateCourse = (id, field, value) => {
    setCourses((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addCourse = () => {
    setCourses((rows) => [...rows, { id: nextId, name: "", credits: "3", points: "8" }]);
    setNextId((value) => value + 1);
  };

  const removeCourse = (id) => {
    setCourses((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  const reset = () => {
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
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          AKTU / UPTU
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AKTU SGPA Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter each subject&apos;s credits and grade to get your credit-weighted SGPA on AKTU&apos;s
          10-point scale, the percentage AKTU treats it as, and the credits you actually earned.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Subjects this semester</h2>
        <div className="mt-4 grid gap-4">
          {courses.map((course, index) => (
            <div key={course.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`aktu-name-${course.id}`}>
                  Subject {index + 1}
                </label>
                <input
                  id={`aktu-name-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={course.name}
                  placeholder="Subject name (optional)"
                  onChange={(event) => updateCourse(course.id, "name", event.target.value)}
                />
              </div>
              <div className="sm:w-24">
                <label className={LABEL_CLASS} htmlFor={`aktu-credits-${course.id}`}>
                  Credits
                </label>
                <input
                  id={`aktu-credits-${course.id}`}
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
                <label className={LABEL_CLASS} htmlFor={`aktu-grade-${course.id}`}>
                  Grade
                </label>
                <select
                  id={`aktu-grade-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={course.points}
                  onChange={(event) => updateCourse(course.id, "points", event.target.value)}
                >
                  {AKTU_GRADES.map((grade) => (
                    <option key={grade.code} value={String(grade.points)}>
                      {grade.code} — {grade.points} pt
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeCourse(course.id)}
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
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Grade bands used by AKTU: A++ 90 and above, A+ 80–89, A 70–79, B+ 60–69, B 50–59, C 45–49,
          D 40–44, F below 40. A grade of F keeps the credits in the denominator but earns none.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Roll it into your CGPA (optional)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aktu-prior-cgpa">
              CGPA so far
            </label>
            <input
              id="aktu-prior-cgpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={priorCgpa}
              placeholder="e.g. 7.84"
              onChange={(event) => setPriorCgpa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aktu-prior-credits">
              Credits completed so far
            </label>
            <input
              id="aktu-prior-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={priorCredits}
              placeholder="e.g. 42"
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
                ? `${num(result.percentage)}% equivalent · grade ${result.equivalentGrade.code} · ${num(result.totalCredits)} credits registered`
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
            {result.backlogs} paper{result.backlogs > 1 ? "s" : ""} at grade F. Those{" "}
            {num(result.lostCredits)} credits are not earned and become carry-over papers.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Equivalent percentage", ok ? `${num(result.percentage)}%` : DASH],
            ["Total credit points", ok ? num(result.creditPoints) : DASH],
            ["Credits registered", ok ? num(result.totalCredits) : DASH],
            ["Credits earned", ok ? num(result.earnedCredits) : DASH],
            ["Subjects counted", ok ? String(result.courseCount) : DASH],
            ["Carry-over papers", ok ? String(result.backlogs) : DASH],
            [
              "Updated CGPA",
              cumulative && !cumulative.error ? num(cumulative.cgpa) : DASH,
            ],
            [
              "Updated CGPA as percentage",
              cumulative && !cumulative.error ? `${num(cumulative.percentage)}%` : DASH,
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
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Grade point</th>
                  <th scope="col" className="py-2 text-right font-semibold">Credit points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.rows.map((row, index) => (
                  <tr key={`${row.name}-${index}`}>
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{num(row.credits)}</td>
                    <td className="py-2 pr-3 text-right">{num(row.points)}</td>
                    <td className="py-2 text-right font-semibold">{num(row.creditPoints)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An unofficial calculator for planning. Your college publishes the authoritative grade sheet,
        and AKTU can revise credit structures or grade bands between regulations — check your scheme
        document if a number here does not match your result card.
      </p>
    </main>
  );
}
