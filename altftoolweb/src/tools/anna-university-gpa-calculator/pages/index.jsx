"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Plus, RotateCcw, Trash2 } from "lucide-react";

import { ANNA_GRADES, MAX_COURSES, computeAnnaGpa } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_ROWS = [
  { name: "Engineering Mathematics", grade: "A+", credits: "4" },
  { name: "Data Structures", grade: "A", credits: "3" },
  { name: "Digital Systems", grade: "B+", credits: "3" },
  { name: "DS Laboratory", grade: "O", credits: "2" },
];

const makeRow = () => ({ name: "", grade: "", credits: "" });

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeAnnaGpa({ courses: rows }), [rows]);
  const hasError = Boolean(result.error);

  const updateRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => (prev.length >= MAX_COURSES ? prev : [...prev, makeRow()]));
  };

  const removeRow = (index) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Anna University semester GPA: ${NUM.format(result.gpa)} / 10`,
      `Total credits: ${NUM.format(result.totalCredits)}`,
      `Credit points Σ(Ci×GPi): ${NUM.format(result.creditPoints)}`,
      ...result.rows.map(
        (row) => `${row.name}: ${row.grade} (${row.point} pts) × ${NUM.format(row.credits)} credits`,
      ),
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
    setRows(DEFAULT_ROWS);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Total credits", DASH],
        ["Credit points Σ(Ci×GPi)", DASH],
        ["Courses counted", DASH],
        ["Arrear (U/AB) credits", DASH],
      ]
    : [
        ["Total credits", NUM.format(result.totalCredits)],
        ["Credit points Σ(Ci×GPi)", NUM.format(result.creditPoints)],
        ["Courses counted", NUM.format(result.courses)],
        ["Arrear (U/AB) credits", result.hasArrear ? NUM.format(result.arrearCredits) : "None"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Anna University
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Anna University GPA Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          GPA = Σ(Ci × GPi) ÷ ΣCi, the formula in Anna University&apos;s UG regulations. Pick the
          letter grade and credits for each course registered this semester — U and AB carry 0
          grade points.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {rows.map((row, index) => (
            <fieldset key={index} className="rounded-lg border border-[var(--border)] p-3">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Course {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`anna-name-${index}`}>
                    Course name (optional)
                  </label>
                  <input
                    id={`anna-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Course ${index + 1}`}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`anna-grade-${index}`}>
                    Grade awarded
                  </label>
                  <select
                    id={`anna-grade-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.grade}
                    onChange={(event) => updateRow(index, { grade: event.target.value })}
                  >
                    <option value="">Pick a grade</option>
                    {ANNA_GRADES.map((grade) => (
                      <option key={grade.code} value={grade.code}>
                        {grade.code} — {grade.label} ({grade.point} pts)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`anna-credits-${index}`}>
                    Course credits
                  </label>
                  <input
                    id={`anna-credits-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.5"
                    step="0.5"
                    value={row.credits}
                    onChange={(event) => updateRow(index, { credits: event.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={rows.length <= 1}
                    aria-label={`Remove course ${index + 1}`}
                    className={`${GHOST_BTN} w-full disabled:opacity-50 sm:w-auto`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_COURSES}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-50`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course ({rows.length}/{MAX_COURSES})
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
              Semester GPA
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.gpa)} / 10`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.hasArrear
                  ? "U/AB courses are counted at 0 grade points; the new grade replaces them once cleared."
                  : "All courses cleared — no arrear credits this semester."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Anna University GPA result"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anna University grade scale</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Marks band
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Meaning
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Grade point
                </th>
              </tr>
            </thead>
            <tbody>
              {ANNA_GRADES.map((grade) => (
                <tr key={grade.code} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{grade.code}</td>
                  <td className="py-2 pr-3">{grade.band}</td>
                  <td className="py-2 pr-3">{grade.label}</td>
                  <td className="py-2 text-right font-semibold">{grade.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The grade scale and GPA formula follow Anna University&apos;s UG
        regulations (2017/2021); the GPA on your official grade sheet, computed by the Controller
        of Examinations, is the authoritative figure.
      </p>
    </main>
  );
}
