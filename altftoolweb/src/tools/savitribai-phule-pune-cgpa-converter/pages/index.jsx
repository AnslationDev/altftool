"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  cgpaFromMarks,
  cgpaFromSemesters,
  cgpaToPercentage,
  classForPercentage,
  compareRules,
  GRADE_SCALE,
  percentageToCgpa,
  RULES,
} from "../lib";

const DEFAULT_COURSES = [
  { id: 1, credits: "4", marks: "85" },
  { id: 2, credits: "3", marks: "72" },
  { id: 3, credits: "3", marks: "58" },
];

const DEFAULT_SEMESTERS = [
  { id: 1, credits: "20", sgpa: "7.5" },
  { id: 2, credits: "22", sgpa: "8.0" },
];

const DEFAULTS = {
  cgpa: "8.50",
  ruleId: "circular322",
  reversePercent: "60",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM.format(v)}%` : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [cgpa, setCgpa] = useState(DEFAULTS.cgpa);
  const [ruleId, setRuleId] = useState(DEFAULTS.ruleId);
  const [reversePercent, setReversePercent] = useState(DEFAULTS.reversePercent);
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => cgpaToPercentage(toNumber(cgpa), ruleId), [cgpa, ruleId]);
  const hasError = Boolean(result.error);

  const awarded = useMemo(
    () => (hasError ? { error: result.error } : classForPercentage(result.percent)),
    [hasError, result],
  );

  const reverse = useMemo(
    () => percentageToCgpa(toNumber(reversePercent), ruleId),
    [reversePercent, ruleId],
  );

  const fromMarks = useMemo(
    () =>
      cgpaFromMarks(
        courses.map((r) => ({ credits: toNumber(r.credits), marks: toNumber(r.marks) })),
      ),
    [courses],
  );

  const fromSemesters = useMemo(
    () =>
      cgpaFromSemesters(
        semesters.map((r) => ({ credits: toNumber(r.credits), sgpa: toNumber(r.sgpa) })),
      ),
    [semesters],
  );

  const comparison = useMemo(() => (hasError ? [] : compareRules(toNumber(cgpa))), [hasError, cgpa]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "SPPU CGPA to percentage",
      `CGPA: ${num(toNumber(cgpa))}`,
      `Rule: ${result.rule.expression}`,
      `Percentage: ${pct(result.percent)}`,
      awarded.error ? "" : `Class: ${awarded.label}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, cgpa, result, awarded]);

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
    setCgpa(DEFAULTS.cgpa);
    setRuleId(DEFAULTS.ruleId);
    setReversePercent(DEFAULTS.reversePercent);
    setCourses(DEFAULT_COURSES);
    setSemesters(DEFAULT_SEMESTERS);
    setCopied(false);
  };

  const updateCourse = (id, field, value) =>
    setCourses((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addCourse = () =>
    setCourses((rows) => [
      ...rows,
      { id: rows.reduce((m, r) => Math.max(m, r.id), 0) + 1, credits: "3", marks: "65" },
    ]);
  const removeCourse = (id) =>
    setCourses((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  const updateSemester = (id, field, value) =>
    setSemesters((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addSemester = () =>
    setSemesters((rows) => [
      ...rows,
      { id: rows.reduce((m, r) => Math.max(m, r.id), 0) + 1, credits: "22", sgpa: "8" },
    ]);
  const removeSemester = (id) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          SPPU converter
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Pune University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          SPPU&rsquo;s credit system converts CGPA to a percentage with a linear rule that differs by
          faculty: engineering deducts 0.75 before multiplying by 10, several other faculties
          multiply directly. If your sheet only shows marks, convert those to grade points below.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cgpa">
              Your CGPA (0 to 10)
            </label>
            <input
              id="cgpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={cgpa}
              onChange={(event) => setCgpa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rule">
              Rule your faculty applies
            </label>
            <select
              id="rule"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ruleId}
              onChange={(event) => setRuleId(event.target.value)}
            >
              {Object.values(RULES).map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{RULES[ruleId]?.note}</p>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.percent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the CGPA above to see a result." : `using ${result.rule.expression}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted percentage to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
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
          {[
            ["CGPA entered", hasError ? DASH : num(toNumber(cgpa))],
            ["Formula applied", hasError ? DASH : result.rule.expression],
            ["Class awarded", awarded.error ? DASH : awarded.label],
            [
              "Cost of the 0.75 deduction",
              ruleId === "circular322" ? "7.5 percentage points" : "not applied under this rule",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Marks to grade points to CGPA</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Enter each course&rsquo;s credits and marks out of 100. Every mark is mapped to its letter
          grade first, then the grade points are averaged by credits.
        </p>
        <div className="mt-4 grid gap-3">
          {courses.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className={LABEL_CLASS} htmlFor={`credits-${row.id}`}>
                  Course {index + 1} credits
                </label>
                <input
                  id={`credits-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateCourse(row.id, "credits", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`marks-${row.id}`}>
                  Course {index + 1} marks / 100
                </label>
                <input
                  id={`marks-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  value={row.marks}
                  onChange={(event) => updateCourse(row.id, "marks", event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeCourse(row.id)}
                  aria-label={`Remove course ${index + 1}`}
                  className={`${GHOST_BTN} w-full sm:w-11`}
                  disabled={courses.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addCourse} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a course
        </button>

        {fromMarks.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {fromMarks.error}
          </p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Course
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Marks
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Grade
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Credits x point
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fromMarks.rows.map((row, index) => (
                    <tr
                      key={`${row.credits}-${row.marks}-${index}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3 font-semibold">{index + 1}</td>
                      <td className="py-2 pr-3">{num(row.marks)}</td>
                      <td className="py-2 pr-3">
                        {row.letter} ({row.point})
                      </td>
                      <td className="py-2 text-right">{num(row.credits * row.point)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Credit-weighted CGPA", num(fromMarks.cgpa)],
                ["Total credits", num(fromMarks.totalCredits)],
                ["Total grade points", num(fromMarks.totalPoints)],
                ["Credits currently failed", num(fromMarks.failedCredits)],
                ["Credit-weighted average marks", num(fromMarks.averageMarks)],
                [
                  "That CGPA as a percentage",
                  (() => {
                    const out = cgpaToPercentage(fromMarks.cgpa, ruleId);
                    return out.error ? DASH : pct(out.percent);
                  })(),
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">CGPA from semester SGPAs</h2>
        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className={LABEL_CLASS} htmlFor={`sem-credits-${row.id}`}>
                  Semester {index + 1} credits
                </label>
                <input
                  id={`sem-credits-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateSemester(row.id, "credits", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`sem-sgpa-${row.id}`}>
                  Semester {index + 1} SGPA
                </label>
                <input
                  id={`sem-sgpa-${row.id}`}
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
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeSemester(row.id)}
                  aria-label={`Remove semester ${index + 1}`}
                  className={`${GHOST_BTN} w-full sm:w-11`}
                  disabled={semesters.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSemester} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a semester
        </button>
        {fromSemesters.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {fromSemesters.error}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            CGPA is{" "}
            <span className="font-semibold text-[var(--foreground)]">{num(fromSemesters.cgpa)}</span>{" "}
            across {num(fromSemesters.totalCredits)} credits.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Percentage back to CGPA</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="reverse">
            Percentage required (0 to 100)
          </label>
          <input
            id="reverse"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.01"
            value={reversePercent}
            onChange={(event) => setReversePercent(event.target.value)}
          />
        </div>
        {reverse.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {reverse.error}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            That needs a CGPA of{" "}
            <span className="font-semibold text-[var(--foreground)]">{num(reverse.cgpa)}</span> under
            this rule.
          </p>
        )}
      </section>

      {comparison.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The same CGPA under each rule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Formula
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.id === ruleId ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{row.expression}</td>
                    <td className="py-2 text-right">{pct(row.percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Grade scale used above</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Marks
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Grade point
                </th>
              </tr>
            </thead>
            <tbody>
              {GRADE_SCALE.map((row) => (
                <tr key={row.letter} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {row.letter}{" "}
                    <span className="font-normal text-[var(--muted-foreground)]">{row.label}</span>
                  </td>
                  <td className="py-2 pr-3">
                    {row.min} - {row.max}
                  </td>
                  <td className="py-2 text-right">{row.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Grade boundaries and conversion rules differ between SPPU faculties and patterns, and are
        revised from time to time. Check the legend and formula printed on your own mark sheet, and
        request an official conversion certificate where an application will not accept a CGPA.
      </p>
    </main>
  );
}
