"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CONDONATION_FLOOR_PERCENT,
  MAX_SUBJECTS,
  REQUIRED_PERCENT,
  analyseSemester,
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
  { name: "Mathematics III", held: "40", attended: "36" },
  { name: "Data Structures", held: "36", attended: "30" },
  { name: "Analog Electronics", held: "32", attended: "26" },
];

const makeRow = () => ({ name: "", held: "", attended: "" });

const STATUS_CLASS = {
  eligible: "text-[var(--success)]",
  condonable: "text-[var(--warning)]",
  ineligible: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseSemester({
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
      `VTU attendance (${REQUIRED_PERCENT}% needed per course)`,
      ...result.rows.map(
        (row) =>
          `${row.name}: ${row.attended}/${row.held} = ${NUM.format(row.percent)}% — ${row.status.title}${
            row.status.key === "eligible"
              ? `, can still miss ${row.canMiss}`
              : row.needed === null
                ? ""
                : `, attend next ${row.needed} in a row`
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

  const worstLine = hasError
    ? "Fix the input above to see a result."
    : result.ineligibleCount === 0
      ? "Every course is at or above the 85% line."
      : `${result.ineligibleCount} course${result.ineligibleCount === 1 ? " is" : "s are"} below ${REQUIRED_PERCENT}% — VTU checks each course separately, so the aggregate cannot rescue them.`;

  const stats = hasError
    ? [
        ["Aggregate attendance", DASH],
        ["Classes attended / held", DASH],
        ["Courses below the line", DASH],
      ]
    : [
        ["Aggregate attendance", `${NUM.format(result.aggregate.percent)}%`],
        [
          "Classes attended / held",
          `${NUM.format(result.aggregate.attended)} / ${NUM.format(result.aggregate.held)}`,
        ],
        [
          "Courses below the line",
          result.ineligibleCount === 0 ? "None" : NUM.format(result.ineligibleCount),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          VTU eligibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          VTU Attendance Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          VTU requires at least {REQUIRED_PERCENT}% attendance in each course to sit its
          end-semester exam, with condonation possible down to {CONDONATION_FLOOR_PERCENT}% in
          genuine cases. Enter classes held and attended per course to see where you stand and how
          many classes you can still miss.
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
                  <label className={LABEL_CLASS} htmlFor={`vtua-name-${index}`}>
                    Course name (optional)
                  </label>
                  <input
                    id={`vtua-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Course ${index + 1}`}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`vtua-held-${index}`}>
                      Classes held
                    </label>
                    <input
                      id={`vtua-held-${index}`}
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
                    <label className={LABEL_CLASS} htmlFor={`vtua-attended-${index}`}>
                      Attended
                    </label>
                    <input
                      id={`vtua-attended-${index}`}
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
              Lowest course attendance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.worst.percent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{worstLine}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the VTU attendance result"
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
                    Course
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
                    Can still miss
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Attend in a row for {REQUIRED_PERCENT}%
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
                      className={`py-2 pr-3 text-right font-semibold ${STATUS_CLASS[row.status.key]}`}
                    >
                      {row.status.title}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {row.status.key === "eligible" ? row.canMiss : DASH}
                    </td>
                    <td className="py-2 text-right">
                      {row.status.key === "eligible"
                        ? "0"
                        : row.needed === null
                          ? DASH
                          : row.needed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. VTU checks the {REQUIRED_PERCENT}% requirement in each course, and
        condonation between {CONDONATION_FLOOR_PERCENT}% and {REQUIRED_PERCENT}% needs
        college/university approval on medical or similar genuine grounds. Your institute&apos;s
        attendance register is the official record.
      </p>
    </main>
  );
}
