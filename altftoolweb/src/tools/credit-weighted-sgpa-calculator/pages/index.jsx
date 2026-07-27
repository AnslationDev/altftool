"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";

import { GRADE_SCHEMES, MAX_SUBJECTS, computeSgpa, schemeById } from "../lib";

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
  { name: "Mathematics", grade: "A", point: "8", credits: "4" },
  { name: "Physics", grade: "B+", point: "7", credits: "3" },
  { name: "Programming", grade: "O", point: "10", credits: "3" },
];

const DEFAULT_SCHEME = GRADE_SCHEMES[0].id;

const makeRow = () => ({ name: "", grade: "", point: "", credits: "" });

export default function ToolHome() {
  const [schemeId, setSchemeId] = useState(DEFAULT_SCHEME);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  const scheme = schemeById(schemeId);
  const isPoints = scheme.id === "points";

  const result = useMemo(() => computeSgpa(rows, { schemeId }), [rows, schemeId]);
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
      `SGPA: ${NUM.format(result.sgpa)} / ${result.scaleMax} (${result.schemeLabel})`,
      `Total credits: ${NUM.format(result.totalCredits)}`,
      `Quality points (grade point × credits): ${NUM.format(result.qualityPoints)}`,
      ...result.rows.map(
        (row) => `${row.name}: grade ${row.grade}, ${NUM.format(row.credits)} credits`,
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
    setSchemeId(DEFAULT_SCHEME);
    setRows(DEFAULT_ROWS);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Total credit hours", DASH],
        ["Quality points", DASH],
        ["Percent of scale", DASH],
        ["Failed credits", DASH],
      ]
    : [
        ["Total credit hours", NUM.format(result.totalCredits)],
        ["Quality points", NUM.format(result.qualityPoints)],
        ["Percent of scale", `${NUM.format(result.percentOfScale)}%`],
        [
          "Failed credits",
          result.hasFailure ? NUM.format(result.failedCredits) : "None",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Credit weighted average
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Credit Weighted SGPA Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          SGPA = Σ(grade point × credits) ÷ Σ credits. Pick your grade scheme, enter each
          subject&apos;s grade and credit hours, and see the exact average plus how much each
          subject pulled it up or down.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sgpa-scheme">
              Grade scheme
            </label>
            <select
              id="sgpa-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={schemeId}
              onChange={(event) => setSchemeId(event.target.value)}
            >
              {GRADE_SCHEMES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <fieldset
              key={index}
              className="rounded-lg border border-[var(--border)] p-3"
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Subject {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sgpa-name-${index}`}>
                    Subject name (optional)
                  </label>
                  <input
                    id={`sgpa-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Subject ${index + 1}`}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </div>
                {isPoints ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`sgpa-point-${index}`}>
                      Grade point (0 – {scheme.scaleMax})
                    </label>
                    <input
                      id={`sgpa-point-${index}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max={scheme.scaleMax}
                      step="0.01"
                      value={row.point}
                      onChange={(event) => updateRow(index, { point: event.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`sgpa-grade-${index}`}>
                      Grade
                    </label>
                    <select
                      id={`sgpa-grade-${index}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={row.grade}
                      onChange={(event) => updateRow(index, { grade: event.target.value })}
                    >
                      <option value="">Pick a grade</option>
                      {scheme.grades.map((grade) => (
                        <option key={grade.code} value={grade.code}>
                          {grade.code} — {grade.label} ({NUM.format(grade.point)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sgpa-credits-${index}`}>
                    Credit hours
                  </label>
                  <input
                    id={`sgpa-credits-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
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
                    aria-label={`Remove subject ${index + 1}`}
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
              Semester grade point average
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.sgpa)} / ${result.scaleMax}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : [
                    result.biggestLift ? `${result.biggestLift} lifted the average most` : null,
                    result.biggestDrag ? `${result.biggestDrag} dragged it most` : null,
                  ]
                    .filter(Boolean)
                    .join("; ") || "Every subject sits exactly on the average."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the SGPA result"
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
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Grade
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Credits
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Pull on average
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    SGPA without it
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3">{row.grade}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.credits)}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${
                        row.pull < 0
                          ? "text-[var(--danger)]"
                          : row.pull > 0
                            ? "text-[var(--success)]"
                            : ""
                      }`}
                    >
                      {row.pull > 0 ? "+" : ""}
                      {NUM.format(row.pull)}
                    </td>
                    <td className="py-2 text-right">
                      {row.sgpaWithout === null ? DASH : NUM.format(row.sgpaWithout)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Grade point values follow the UGC choice based credit system letter
        scale (or the US 4-point scale, as selected); your university&apos;s own regulations govern
        the official SGPA on your grade card.
      </p>
    </main>
  );
}
