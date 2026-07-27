"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BEST_OF_COUNT,
  DEFAULT_MAX_MARKS,
  INDICATIVE_GRADE_BANDS,
  MAX_SUBJECTS,
  PASS_PERCENT,
  computeCbsePercentage,
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
  { name: "English", marks: "92" },
  { name: "Hindi", marks: "88" },
  { name: "Mathematics", marks: "95" },
  { name: "Science", marks: "78" },
  { name: "Social Science", marks: "85" },
  { name: "Information Technology (skill)", marks: "90" },
];

const makeRow = () => ({ name: "", marks: "" });

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => computeCbsePercentage({ subjects: rows.map((row) => ({ ...row, max: DEFAULT_MAX_MARKS })) }),
    [rows],
  );
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
      `CBSE Class 10 percentage (best ${result.bestCount} of ${result.rows.length}): ${NUM.format(result.bestOfFivePercent)}%`,
      `Overall (all subjects): ${NUM.format(result.overallPercent)}% (${NUM.format(result.totalMarks)}/${NUM.format(result.totalMax)})`,
      ...result.rows.map(
        (row) =>
          `${row.name}: ${NUM.format(row.marks)}/${NUM.format(row.max)}${row.inBestFive ? " (in best five)" : ""}${row.passed ? "" : " — below 33%"}`,
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

  const statusLine = hasError
    ? "Fix the input above to see a result."
    : !result.allPassed
      ? `Below the ${PASS_PERCENT}% pass mark in: ${result.failedSubjects.join(", ")}.`
      : result.usedBestOf
        ? `Average of the best ${BEST_OF_COUNT} subjects — the convention used on CBSE marksheets with an extra subject.`
        : "Average of all subjects entered.";

  const stats = hasError
    ? [
        ["Overall percentage (all subjects)", DASH],
        ["Total marks", DASH],
        ["Subjects below 33%", DASH],
      ]
    : [
        ["Overall percentage (all subjects)", `${NUM.format(result.overallPercent)}%`],
        ["Total marks", `${NUM.format(result.totalMarks)} / ${NUM.format(result.totalMax)}`],
        [
          `Subjects below ${PASS_PERCENT}%`,
          result.allPassed ? "None" : result.failedSubjects.join(", "),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
          Board result
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          CBSE Class 10 Percentage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter marks out of {DEFAULT_MAX_MARKS} for each subject. The tool computes the standard
          best-of-{BEST_OF_COUNT} percentage, the overall average, and checks every subject against
          the {PASS_PERCENT}% pass mark.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {rows.map((row, index) => (
            <fieldset key={index} className="rounded-lg border border-[var(--border)] p-3">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Subject {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cbse-name-${index}`}>
                    Subject name (optional)
                  </label>
                  <input
                    id={`cbse-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Subject ${index + 1}`}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cbse-marks-${index}`}>
                    Marks (out of {DEFAULT_MAX_MARKS})
                  </label>
                  <input
                    id={`cbse-marks-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={DEFAULT_MAX_MARKS}
                    step="1"
                    value={row.marks}
                    onChange={(event) => updateRow(index, { marks: event.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={rows.length <= 1}
                aria-label={`Remove subject ${index + 1}`}
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
          Add subject ({rows.length}/{MAX_SUBJECTS})
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
              Best-of-{BEST_OF_COUNT} percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.bestOfFivePercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{statusLine}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the CBSE percentage result"
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
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Subject
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Marks
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    In best {BEST_OF_COUNT}
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Pass ({PASS_PERCENT}%)
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Indicative band
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM.format(row.marks)} / {NUM.format(row.max)}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.inBestFive ? "Yes" : "No"}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${
                        row.passed ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.passed ? "Pass" : "Fail"}
                    </td>
                    <td className="py-2 text-right">{row.indicativeGrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Indicative grade bands</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          CBSE assigns A1–E positionally (by rank among passed candidates), so these mark bands are
          orientation only — your marksheet grade can differ.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Marks
                </th>
              </tr>
            </thead>
            <tbody>
              {INDICATIVE_GRADE_BANDS.map((band, i) => (
                <tr key={band.grade} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{band.grade}</td>
                  <td className="py-2 text-right">
                    {i === 0
                      ? `${band.min} – 100`
                      : `${band.min} – ${INDICATIVE_GRADE_BANDS[i - 1].min - 1}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. CBSE prints subject marks and positional grades, not a percentage; the
        best-of-five average is the convention schools, colleges and CBSE&apos;s own screening use.
        The pass standard of {PASS_PERCENT}% per subject comes from the Examination Bye-laws.
      </p>
    </main>
  );
}
