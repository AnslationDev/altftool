"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, Plus, RotateCcw, Trash2 } from "lucide-react";

import { MAX_SUBJECTS, REQUIRED_PERCENT, analyseTerm } from "../lib";

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
  { name: "Engineering Maths III", held: "40", attended: "34" },
  { name: "DBMS", held: "38", attended: "30" },
  { name: "Computer Networks", held: "36", attended: "25" },
];

const makeRow = () => ({ name: "", held: "", attended: "" });

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseTerm({
        subjects: rows.map((row) => ({
          name: row.name,
          held: row.held.trim() === "" ? NaN : Number(row.held),
          attended: row.attended.trim() === "" ? NaN : Number(row.attended),
        })),
      }),
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
      `SPPU attendance (${REQUIRED_PERCENT}% line, per subject)`,
      ...result.rows.map(
        (row) =>
          `${row.name}: ${row.attended}/${row.held} = ${NUM.format(row.percent)}% — ${
            row.isSafe
              ? `safe, ${row.safeBunks} bunk${row.safeBunks === 1 ? "" : "s"} left`
              : row.needed === null
                ? "defaulter, target unreachable"
                : `defaulter, attend next ${row.needed} in a row`
          }`,
      ),
      `Aggregate: ${result.aggregate.attended}/${result.aggregate.held} = ${NUM.format(result.aggregate.percent)}%`,
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
    : result.defaulterCount === 0
      ? `Every subject is at or above ${REQUIRED_PERCENT}% — no defaulter risk on current numbers.`
      : `${result.defaulterCount} subject${result.defaulterCount === 1 ? "" : "s"} below ${REQUIRED_PERCENT}% — colleges list defaulters subject-wise, so each one needs fixing on its own.`;

  const stats = hasError
    ? [
        ["Aggregate attendance", DASH],
        ["Lectures attended / held", DASH],
        ["Subjects in the defaulter zone", DASH],
        ["Total safe bunks across subjects", DASH],
      ]
    : [
        ["Aggregate attendance", `${NUM.format(result.aggregate.percent)}%`],
        [
          "Lectures attended / held",
          `${NUM.format(result.aggregate.attended)} / ${NUM.format(result.aggregate.held)}`,
        ],
        [
          "Subjects in the defaulter zone",
          result.defaulterCount === 0 ? "None" : NUM.format(result.defaulterCount),
        ],
        ["Total safe bunks across subjects", NUM.format(result.totalSafeBunks)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          SPPU defaulter check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SPPU Attendance Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          SPPU-affiliated colleges apply a {REQUIRED_PERCENT}% attendance line per subject when
          drawing defaulter lists. Enter lectures held and attended for each subject to see your
          status and exactly how many lectures each subject can still afford to lose.
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
                  <label className={LABEL_CLASS} htmlFor={`sppu-name-${index}`}>
                    Subject name (optional)
                  </label>
                  <input
                    id={`sppu-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Subject ${index + 1}`}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`sppu-held-${index}`}>
                      Lectures held
                    </label>
                    <input
                      id={`sppu-held-${index}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={row.held}
                      onChange={(event) => updateRow(index, { held: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`sppu-attended-${index}`}>
                      Attended
                    </label>
                    <input
                      id={`sppu-attended-${index}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={row.attended}
                      onChange={(event) => updateRow(index, { attended: event.target.value })}
                    />
                  </div>
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
              Lowest subject attendance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.worst.percent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{statusLine}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the SPPU attendance result"
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
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Subject
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Attended / held
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    %
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Status
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Safe bunks left
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Attend in a row to recover
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-right">
                      {row.attended} / {row.held}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {NUM.format(row.percent)}%
                    </td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${
                        row.isSafe ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.isSafe ? "Safe" : "Defaulter zone"}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.isSafe ? row.safeBunks : DASH}</td>
                    <td className="py-2 text-right">
                      {row.isSafe ? "0" : row.needed === null ? DASH : row.needed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The {REQUIRED_PERCENT}% line follows SPPU&apos;s attendance discipline
        for affiliated colleges; individual colleges keep the official registers, decide defaulter
        action and handle medical or other condonation. Confirm your standing with your college.
      </p>
    </main>
  );
}
