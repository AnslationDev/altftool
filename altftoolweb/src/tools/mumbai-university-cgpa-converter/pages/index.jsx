"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  aggregatePercentageFromMarks,
  CBCGS_REPEAL_DATE,
  cgpaFromCourses,
  cgpaToPercentage,
  classForPercentage,
  compareRules,
  GRADE_POINTS,
  percentageToCgpa,
  RULES,
} from "../lib";

const DEFAULT_MARK_ROWS = [
  { id: 1, obtained: "480", max: "600" },
  { id: 2, obtained: "510", max: "600" },
];

const DEFAULT_COURSES = [
  { id: 1, credits: "4", point: "9" },
  { id: 2, credits: "3", point: "8" },
  { id: 3, credits: "3", point: "10" },
];

const DEFAULTS = {
  cgpa: "8.00",
  ruleId: "cbcgs",
  reversePercent: "67.8",
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
  const [markRows, setMarkRows] = useState(DEFAULT_MARK_ROWS);
  const [courses, setCourses] = useState(DEFAULT_COURSES);
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
      aggregatePercentageFromMarks(
        markRows.map((r) => ({ obtained: toNumber(r.obtained), max: toNumber(r.max) })),
      ),
    [markRows],
  );

  const fromCourses = useMemo(
    () =>
      cgpaFromCourses(
        courses.map((r) => ({ credits: toNumber(r.credits), point: toNumber(r.point) })),
      ),
    [courses],
  );

  const comparison = useMemo(() => (hasError ? [] : compareRules(toNumber(cgpa))), [hasError, cgpa]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mumbai University CGPA conversion",
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
    setMarkRows(DEFAULT_MARK_ROWS);
    setCourses(DEFAULT_COURSES);
    setCopied(false);
  };

  const updateMarkRow = (id, field, value) =>
    setMarkRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addMarkRow = () =>
    setMarkRows((rows) => [
      ...rows,
      { id: rows.reduce((m, r) => Math.max(m, r.id), 0) + 1, obtained: "450", max: "600" },
    ]);
  const removeMarkRow = (id) =>
    setMarkRows((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  const updateCourse = (id, field, value) =>
    setCourses((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addCourse = () =>
    setCourses((rows) => [
      ...rows,
      { id: rows.reduce((m, r) => Math.max(m, r.id), 0) + 1, credits: "3", point: "8" },
    ]);
  const removeCourse = (id) =>
    setCourses((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Mumbai University
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Mumbai University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Mumbai University&rsquo;s CBCGS conversion is an affine map, 7.1 times the CGPA plus 11,
          not a plain multiply — the slope and intercept exist because grade point 10 begins at 80
          marks. Reproduce an older grade card here, or compute the percentage straight from marks.
        </p>
      </header>

      <div className="mb-6 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
        The 7.1 &times; CGPA + 11 formula was repealed with effect from {CBCGS_REPEAL_DATE}. For new
        conversions the university works from the raw marks scored across all semesters and issues a
        conversion certificate on request — use the marks section below for that route.
      </div>

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
              Conversion rule
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
          <div aria-live="polite" aria-atomic="true">
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
            ["Class on this percentage", awarded.error ? DASH : awarded.label],
            [
              "Range this formula can produce",
              ruleId === "cbcgs"
                ? "11% at CGPA 0 to 82% at CGPA 10"
                : ruleId === "ugc"
                  ? "0% to 95%"
                  : "0% to 100%",
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
        <h2 className="text-base font-semibold">Percentage from raw semester marks</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The post-repeal route: total marks obtained across all semesters divided by total marks
          out of, times 100.
        </p>
        <div className="mt-4 grid gap-3">
          {markRows.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className={LABEL_CLASS} htmlFor={`obtained-${row.id}`}>
                  Semester {index + 1} marks obtained
                </label>
                <input
                  id={`obtained-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={row.obtained}
                  onChange={(event) => updateMarkRow(row.id, "obtained", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`max-${row.id}`}>
                  Semester {index + 1} marks out of
                </label>
                <input
                  id={`max-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={row.max}
                  onChange={(event) => updateMarkRow(row.id, "max", event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeMarkRow(row.id)}
                  aria-label={`Remove semester ${index + 1} marks`}
                  className={`${GHOST_BTN} w-full sm:w-11`}
                  disabled={markRows.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addMarkRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a semester
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
            {fromMarks.counted < markRows.length ? (
              <p aria-live="polite" className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
                {markRows.length - fromMarks.counted} semester(s) with missing or invalid values were
                excluded from this total.
              </p>
            ) : null}
            <dl aria-live="polite" aria-atomic="true" className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Aggregate percentage", pct(fromMarks.percent)],
                ["Total marks obtained", num(fromMarks.totalObtained)],
                ["Total marks out of", num(fromMarks.totalMax)],
                [
                  "Class on that percentage",
                  (() => {
                    const c = classForPercentage(fromMarks.percent);
                    return c.error ? DASH : c.label;
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
        <h2 className="text-base font-semibold">CGPA from course credits and grade points</h2>
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
                <label className={LABEL_CLASS} htmlFor={`point-${row.id}`}>
                  Course {index + 1} grade
                </label>
                <select
                  id={`point-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.point}
                  onChange={(event) => updateCourse(row.id, "point", event.target.value)}
                >
                  {GRADE_POINTS.map((g) => (
                    <option key={g.letter} value={String(g.point)}>
                      {g.letter} — {g.point} ({g.marks})
                    </option>
                  ))}
                </select>
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

        {fromCourses.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {fromCourses.error}
          </p>
        ) : (
          <>
            {fromCourses.counted < courses.length ? (
              <p aria-live="polite" className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
                {courses.length - fromCourses.counted} course(s) with missing or invalid values were
                excluded from this total.
              </p>
            ) : null}
            <p aria-live="polite" aria-atomic="true" className="mt-4 text-sm text-[var(--muted-foreground)]">
              CGPA is{" "}
              <span className="font-semibold text-[var(--foreground)]">{num(fromCourses.cgpa)}</span>{" "}
              from {num(fromCourses.totalCredits)} credits, converting to{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {(() => {
                  const out = cgpaToPercentage(fromCourses.cgpa, ruleId);
                  return out.error ? DASH : pct(out.percent);
                })()}
              </span>
              .
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Percentage back to CGPA</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="reverse">
            Percentage (0 to 100)
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
          <p aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-[var(--muted-foreground)]">
            That corresponds to a CGPA of{" "}
            <span className="font-semibold text-[var(--foreground)]">{num(reverse.cgpa)}</span>.
          </p>
        )}
      </section>

      {comparison.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How much the formula choice moves the number</h2>
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversion practice at Mumbai University has changed, and grade schemes differ between
        faculties and admission years. Use the figure or formula printed on your own mark sheet, and
        request an official conversion certificate from the university when an application will not
        accept a CGPA.
      </p>
    </main>
  );
}
