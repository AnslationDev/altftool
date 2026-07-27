"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { IPU_GRADES, computeSgpa, rollIntoCgpa, sgpaNeededForTarget } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const num3 = (value) => NUM3.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_COURSES = [
  { id: 1, name: "Applied Mathematics-II", credits: "4", points: "9" },
  { id: 2, name: "Data Structures", credits: "4", points: "8" },
  { id: 3, name: "Digital Electronics", credits: "3", points: "10" },
  { id: 4, name: "Computer Organisation", credits: "3", points: "7" },
  { id: 5, name: "Communication Skills", credits: "2", points: "6" },
  { id: 6, name: "Data Structures Lab", credits: "2", points: "8" },
  { id: 7, name: "Workshop Practice", credits: "1", points: "5" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [nextId, setNextId] = useState(DEFAULT_COURSES.length + 1);
  const [priorCgpa, setPriorCgpa] = useState("7.60");
  const [priorCredits, setPriorCredits] = useState("60");
  const [targetCgpa, setTargetCgpa] = useState("8.00");
  const [remainingCredits, setRemainingCredits] = useState("60");
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

  const rolled = useMemo(() => {
    if (!ok) return null;
    return rollIntoCgpa(
      toNumber(priorCgpa),
      toNumber(priorCredits),
      result.sgpa,
      result.totalCredits,
    );
  }, [ok, priorCgpa, priorCredits, result]);

  const target = useMemo(() => {
    if (!rolled || rolled.error) return null;
    return sgpaNeededForTarget(
      rolled.cgpa,
      rolled.totalCredits,
      toNumber(remainingCredits),
      toNumber(targetCgpa),
    );
  }, [rolled, remainingCredits, targetCgpa]);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "GGSIPU semester result",
      `SGPA: ${num(result.sgpa)} / 10 (grade band ${result.equivalentGrade.code})`,
      `Credits registered: ${num(result.totalCredits)} · earned: ${num(result.earnedCredits)}`,
      `Credit points: ${num(result.creditPoints)}`,
    ];
    if (rolled && !rolled.error) {
      lines.push(
        `CGPA after this semester: ${num(rolled.cgpa)} over ${num(rolled.totalCredits)} credits (${rolled.change >= 0 ? "+" : ""}${num(rolled.change)})`,
      );
    }
    if (target && !target.error) {
      lines.push(
        `SGPA needed over the remaining ${num(toNumber(remainingCredits))} credits for a ${num(toNumber(targetCgpa))} CGPA: ${num(target.requiredSgpa)}`,
      );
    }
    return lines.join("\n");
  }, [ok, result, rolled, target, remainingCredits, targetCgpa]);

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
    setCourses((rows) => [...rows, { id: nextId, name: "", credits: "4", points: "8" }]);
    setNextId((value) => value + 1);
  };

  const reset = () => {
    setCourses(DEFAULT_COURSES);
    setNextId(DEFAULT_COURSES.length + 1);
    setPriorCgpa("7.60");
    setPriorCredits("60");
    setTargetCgpa("8.00");
    setRemainingCredits("60");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Guru Gobind Singh Indraprastha University
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">IPU SGPA Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Credit-weighted SGPA on the IPU 10-point scale, rolled into your CGPA — plus how much each
          individual paper is actually worth to the average.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Papers this semester</h2>
        <div className="mt-4 grid gap-4">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`ipu-name-${course.id}`}>
                  Paper {index + 1}
                </label>
                <input
                  id={`ipu-name-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={course.name}
                  placeholder="Paper name (optional)"
                  onChange={(event) => updateCourse(course.id, "name", event.target.value)}
                />
              </div>
              <div className="sm:w-24">
                <label className={LABEL_CLASS} htmlFor={`ipu-credits-${course.id}`}>
                  Credits
                </label>
                <input
                  id={`ipu-credits-${course.id}`}
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
                <label className={LABEL_CLASS} htmlFor={`ipu-grade-${course.id}`}>
                  Grade
                </label>
                <select
                  id={`ipu-grade-${course.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={course.points}
                  onChange={(event) => updateCourse(course.id, "points", event.target.value)}
                >
                  {IPU_GRADES.map((grade) => (
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
                aria-label={`Remove paper ${index + 1}`}
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
          Add paper
        </button>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Grade points: O 10, A+ 9, A 8, B+ 7, B 6, C 5, P 4, F 0. Marks-to-letter boundaries are set
          by your programme&apos;s scheme, so take the letter straight off the result sheet.
        </p>
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
                ? `${num(result.creditPoints)} credit points over ${num(result.totalCredits)} credits · grade band ${result.equivalentGrade.code}`
                : "Fix the paper rows above to see your SGPA."}
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

        {ok && result.backlogs > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.backlogs} paper{result.backlogs > 1 ? "s" : ""} at grade F.{" "}
            {num(result.lostCredits)} credits are not earned until they are cleared.
          </p>
        ) : null}

        {ok && result.biggestLever ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            Biggest lever this semester:{" "}
            <span className="font-semibold">{result.biggestLever.name}</span> — each extra grade point
            on it adds {num3(result.biggestLever.sgpaPerGradeStep)} to the SGPA, and a perfect 10
            there would take you to {num(result.biggestLever.sgpaIfPerfect)}.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Credit points this semester", ok ? num(result.creditPoints) : DASH],
            ["Credits registered", ok ? num(result.totalCredits) : DASH],
            ["Credits earned", ok ? num(result.earnedCredits) : DASH],
            ["Papers counted", ok ? String(result.courseCount) : DASH],
            ["CGPA after this semester", rolled && !rolled.error ? num(rolled.cgpa) : DASH],
            [
              "Change in CGPA",
              rolled && !rolled.error
                ? `${rolled.change >= 0 ? "+" : ""}${num(rolled.change)}`
                : DASH,
            ],
            [
              "Total credits behind that CGPA",
              rolled && !rolled.error ? num(rolled.totalCredits) : DASH,
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
            <table className="w-full min-w-[30rem] text-sm">
              <caption className="sr-only">Each paper&apos;s contribution and leverage</caption>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Paper</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cr</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Grade</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Credit pts</th>
                  <th scope="col" className="py-2 text-right font-semibold">SGPA per step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.rows.map((row, index) => (
                  <tr key={`${row.name}-${index}`}>
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{num(row.credits)}</td>
                    <td className="py-2 pr-3 text-right">{row.code}</td>
                    <td className="py-2 pr-3 text-right">{num(row.creditPoints)}</td>
                    <td className="py-2 text-right font-semibold">{num3(row.sgpaPerGradeStep)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">CGPA so far and where you are heading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ipu-prior-cgpa">
              CGPA before this semester
            </label>
            <input
              id="ipu-prior-cgpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={priorCgpa}
              onChange={(event) => setPriorCgpa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ipu-prior-credits">
              Credits completed before this semester
            </label>
            <input
              id="ipu-prior-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={priorCredits}
              onChange={(event) => setPriorCredits(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ipu-target">
              Target CGPA at graduation
            </label>
            <input
              id="ipu-target"
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
            <label className={LABEL_CLASS} htmlFor="ipu-remaining">
              Credits still to be attempted
            </label>
            <input
              id="ipu-remaining"
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

        {rolled && rolled.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {rolled.error}
          </p>
        ) : null}
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
                Already above the target — the remaining credits cannot pull you below it.
              </span>
            ) : target.achievable ? (
              <span>
                You need an average SGPA of{" "}
                <span className="font-semibold text-[var(--primary)]">{num(target.requiredSgpa)}</span>{" "}
                across the remaining credits to finish at {num(toNumber(targetCgpa))}.
              </span>
            ) : (
              <span className="font-semibold text-[var(--danger)]">
                That target would need {num(target.requiredSgpa)} SGPA, above the 10-point maximum.
                Spread it over more credits or lower the target.
              </span>
            )
          ) : (
            <span className="text-[var(--muted-foreground)]">{DASH}</span>
          )}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Unofficial and for planning only. Your school&apos;s scheme decides the credits and the
        marks-to-grade boundaries, and IPU publishes the authoritative result — treat this as a way
        to check your own arithmetic, not as a grade card.
      </p>
    </main>
  );
}
