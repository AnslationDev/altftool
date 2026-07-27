"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CIE_MAX,
  GRADE_BANDS,
  MAX_SUBJECTS,
  SEE_MAX,
  computeVtuSgpa,
} from "../lib";

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
  { name: "Mathematics III", cie: "42", see: "73", credits: "4" },
  { name: "Data Structures", cie: "45", see: "85", credits: "3" },
  { name: "Analog Electronics", cie: "38", see: "62", credits: "3" },
];

const makeRow = () => ({ name: "", cie: "", see: "", credits: "" });

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeVtuSgpa({ subjects: rows }), [rows]);
  const hasError = Boolean(result.error);

  const updateRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => (prev.length >= MAX_SUBJECTS ? prev : [...prev, makeRow()]));
  };

  const removeRow = (index) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `VTU SGPA: ${NUM.format(result.sgpa)} / 10`,
      `Total credits: ${NUM.format(result.totalCredits)}`,
      ...result.rows.map(
        (row) =>
          `${row.name}: CIE ${NUM.format(row.cie)} + SEE ${NUM.format(row.see)}/100 (→${row.scaledSee}) = ${NUM.format(row.total)}/100, grade ${row.grade} (${row.point} pts) × ${NUM.format(row.credits)} credits`,
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
        ["Credit points Σ(Ci×Gi)", DASH],
        ["Courses failed (F)", DASH],
      ]
    : [
        ["Total credits", NUM.format(result.totalCredits)],
        ["Credit points Σ(Ci×Gi)", NUM.format(result.creditPoints)],
        ["Courses failed (F)", result.hasFailure ? NUM.format(result.failedCourses) : "None"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          VTU 2021/2022 scheme
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">VTU SGPA Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter CIE (out of {CIE_MAX}) and SEE (out of {SEE_MAX}, scaled to 50) for each course. The
          tool applies VTU&apos;s pass rules — 40% in CIE, 35% in SEE, 40% overall — grades the
          total on the 10-point scale and computes SGPA = Σ(Ci × Gi) ÷ ΣCi.
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
                  <label className={LABEL_CLASS} htmlFor={`vtu-name-${index}`}>
                    Course name (optional)
                  </label>
                  <input
                    id={`vtu-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Course ${index + 1}`}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`vtu-credits-${index}`}>
                    Credits
                  </label>
                  <input
                    id={`vtu-credits-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.5"
                    step="0.5"
                    value={row.credits}
                    onChange={(event) => updateRow(index, { credits: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`vtu-cie-${index}`}>
                    CIE / internal marks (out of {CIE_MAX})
                  </label>
                  <input
                    id={`vtu-cie-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={CIE_MAX}
                    step="1"
                    value={row.cie}
                    onChange={(event) => updateRow(index, { cie: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`vtu-see-${index}`}>
                    SEE / external marks (out of {SEE_MAX})
                  </label>
                  <input
                    id={`vtu-see-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={SEE_MAX}
                    step="1"
                    value={row.see}
                    onChange={(event) => updateRow(index, { see: event.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={rows.length <= 1}
                aria-label={`Remove course ${index + 1}`}
                className={`mt-3 ${GHOST_BTN} disabled:opacity-50`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_SUBJECTS}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-50`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course ({rows.length}/{MAX_SUBJECTS})
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
              Semester grade point average
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.sgpa)} / 10`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.hasFailure
                  ? "Failed courses carry grade F (0 points) and their credits stay in the denominator."
                  : "All courses clear VTU's CIE, SEE and total passing minima."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the VTU SGPA result"
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

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Course
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    CIE
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    SEE → /50
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Total /100
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Grade
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.cie)}</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM.format(row.see)} → {row.scaledSee}
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.total)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {row.grade} ({row.point})
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.passed ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.passed ? "Pass" : `Fail — ${row.failReasons.join("; ")}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">VTU grade bands (total out of 100)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Total marks
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
              {GRADE_BANDS.map((band, i) => (
                <tr key={band.code} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{band.code}</td>
                  <td className="py-2 pr-3">
                    {band.point === 0
                      ? "Below 40 or pass rules not met"
                      : i === 0
                        ? `${band.min} – 100`
                        : `${band.min} – ${GRADE_BANDS[i - 1].min - 1}`}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-right font-semibold">{band.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Marks split, pass minima and grade bands follow the VTU 2021/2022 B.E.
        scheme; earlier schemes and some programmes differ, and the grade card issued by VTU is the
        authoritative record.
      </p>
    </main>
  );
}
