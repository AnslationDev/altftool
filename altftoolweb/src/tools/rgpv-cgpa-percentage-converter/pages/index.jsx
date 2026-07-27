"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  RGPV_GRADE_SCALE,
  RGPV_OFFSET,
  rgpvCgpaFromSemesters,
  rgpvCgpaToPercentage,
  rgpvPercentageToCgpa,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const gpa = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SEMESTERS = [
  { id: 1, sgpa: "7.6", credits: "24" },
  { id: 2, sgpa: "8.1", credits: "24" },
];

export default function ToolHome() {
  const [mode, setMode] = useState("toPercent");
  const [cgpa, setCgpa] = useState("7.84");
  const [percentage, setPercentage] = useState("70");
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [nextId, setNextId] = useState(3);
  const [copied, setCopied] = useState(false);

  const forward = useMemo(() => rgpvCgpaToPercentage({ cgpa }), [cgpa]);
  const reverse = useMemo(() => rgpvPercentageToCgpa({ percentage }), [percentage]);
  const aggregate = useMemo(() => rgpvCgpaFromSemesters(semesters), [semesters]);

  const active = mode === "toPercent" ? forward : reverse;
  const ok = !active.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    if (mode === "toPercent") {
      return [
        "RGPV CGPA to percentage",
        `CGPA: ${gpa(forward.cgpa)}`,
        `Formula: percentage = ${forward.formula}`,
        `Equivalent percentage: ${pct(forward.percentage)}`,
        `Marks out of 1000: ${NUM0.format(forward.marksOutOf1000)}`,
        `Division: ${forward.division}`,
      ].join("\n");
    }
    return [
      "RGPV percentage to CGPA",
      `Percentage: ${pct(reverse.percentage)}`,
      `Formula: CGPA = ${reverse.formula}`,
      `Equivalent CGPA: ${gpa(reverse.cgpa)}`,
      `Division: ${reverse.division}`,
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
    setCgpa("7.84");
    setPercentage("70");
    setSemesters(DEFAULT_SEMESTERS);
    setNextId(3);
    setCopied(false);
  };

  const updateSemester = (id, key, value) =>
    setSemesters((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addSemester = () => {
    setSemesters((rows) => [...rows, { id: nextId, sgpa: "", credits: "24" }]);
    setNextId((current) => current + 1);
  };

  const removeSemester = (id) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          RGPV Bhopal
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          RGPV CGPA Percentage Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          RGPV equates grade points to marks with a single linear rule: percentage ={" "}
          (CGPA &minus; {RGPV_OFFSET}) &times; 10. Convert either way, aggregate semester SGPAs into
          a CGPA, and check the grade point scale.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div
          role="group"
          aria-label="Conversion direction"
          className="mb-5 grid gap-2 sm:grid-cols-2"
        >
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
            <label className={LABEL_CLASS} htmlFor="rgpv-cgpa">
              CGPA or SGPA (out of 10)
            </label>
            <input
              id="rgpv-cgpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={cgpa}
              onChange={(event) => setCgpa(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              The same formula applies to a single semester SGPA.
            </p>
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="rgpv-percent">
              Percentage of marks
            </label>
            <input
              id="rgpv-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Inverted rule: CGPA = (percentage &divide; 10) + {RGPV_OFFSET}.
            </p>
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
              {ok ? (mode === "toPercent" ? pct(forward.percentage) : gpa(reverse.cgpa)) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `Formula used: ${active.formula}` : "Fix the input above to see a result"}
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(mode === "toPercent"
            ? [
                ["CGPA entered", ok ? gpa(forward.cgpa) : "—"],
                ["Equivalent percentage", ok ? pct(forward.percentage) : "—"],
                ["Equivalent marks out of 1000", ok ? NUM0.format(forward.marksOutOf1000) : "—"],
                ["Division (common convention)", ok ? forward.division : "—"],
                ["Nearest letter grade", ok ? forward.nearestGrade : "—"],
                [
                  "Above the grade point 4 pass line",
                  ok ? (forward.passing ? "Yes" : "No") : "—",
                ],
              ]
            : [
                ["Percentage entered", ok ? pct(reverse.percentage) : "—"],
                ["Equivalent CGPA", ok ? gpa(reverse.cgpa) : "—"],
                ["Division (common convention)", ok ? reverse.division : "—"],
                [
                  "Capped at the 10 point ceiling",
                  ok ? (reverse.clamped ? "Yes" : "No") : "—",
                ],
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
        <h2 className="text-base font-semibold">Build the CGPA from semester SGPAs</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each semester is weighted by its credits, so a light semester moves the cumulative
          average less than a heavy one.
        </p>

        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`rgpv-sgpa-${row.id}`}>
                  Semester {index + 1} SGPA
                </label>
                <input
                  id={`rgpv-sgpa-${row.id}`}
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
              <div>
                <label className={LABEL_CLASS} htmlFor={`rgpv-credits-${row.id}`}>
                  Credits
                </label>
                <input
                  id={`rgpv-credits-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateSemester(row.id, "credits", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSemester(row.id)}
                disabled={semesters.length < 2}
                aria-label={`Remove semester ${index + 1}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSemester} className={`${GHOST_BTN} mt-3`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add semester
        </button>

        {aggregate.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {aggregate.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Credit weighted CGPA", gpa(aggregate.cgpa)],
              ["Total credits", NUM0.format(aggregate.totalCredits)],
              ["Equivalent percentage", pct(aggregate.percentage)],
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
        <h2 className="text-base font-semibold">RGPV grade point scale</h2>
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
              {RGPV_GRADE_SCALE.map((row) => (
                <tr key={row.grade} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {row.minMarks}&ndash;{row.maxMarks}
                  </td>
                  <td className="py-2 pr-3 font-semibold">{row.grade}</td>
                  <td className="py-2 pr-3">{row.point}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion. Band edges have varied between RGPV scheme years, and the
        division printed on your transcript is what an employer or admissions office will accept.
        Ask the examination section for an official equivalence certificate when one is required.
      </p>
    </main>
  );
}
