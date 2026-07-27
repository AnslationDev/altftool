"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  cgpaFromSemesters,
  cgpaToPercentage,
  divisionForCgpa,
  percentageToCgpa,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MODES = [
  { id: "toPercent", label: "CGPA to %" },
  { id: "toCgpa", label: "% to CGPA" },
  { id: "semesters", label: "SGPA to CGPA" },
];

const DEFAULTS = {
  mode: "toPercent",
  cgpa: "8.2",
  percent: "72.5",
  firstAttempt: true,
  semRows: [
    { id: 1, credits: "24", sgpa: "8" },
    { id: 2, credits: "26", sgpa: "7.5" },
  ],
};

const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [cgpa, setCgpa] = useState(DEFAULTS.cgpa);
  const [percent, setPercent] = useState(DEFAULTS.percent);
  const [firstAttempt, setFirstAttempt] = useState(DEFAULTS.firstAttempt);
  const [semRows, setSemRows] = useState(DEFAULTS.semRows);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "toPercent") {
      const conv = cgpaToPercentage(cgpa.trim());
      if (conv.error) return { error: conv.error };
      const division = divisionForCgpa(Number(cgpa), firstAttempt);
      return {
        headline: `${NUM2.format(conv.percent)}%`,
        rows: [
          ["CGPA entered", NUM2.format(Number(cgpa))],
          ["Formula", "(CGPA − 0.75) × 10"],
          ["Equivalent percentage", `${NUM2.format(conv.percent)}%`],
          ["Division", division.error ? DASH : division.label],
        ],
        note: conv.clamped
          ? "The raw formula result fell below 0% and was clamped."
          : division.note || "",
        copyText: `AKTU CGPA ${cgpa} = ${NUM2.format(conv.percent)}% using (CGPA − 0.75) × 10${division.error ? "" : ` — ${division.label}`}`,
      };
    }
    if (mode === "toCgpa") {
      const conv = percentageToCgpa(percent.trim());
      if (conv.error) return { error: conv.error };
      const division = divisionForCgpa(conv.cgpa, firstAttempt);
      return {
        headline: NUM2.format(conv.cgpa),
        rows: [
          ["Percentage entered", `${NUM2.format(Number(percent))}%`],
          ["Formula", "CGPA = % ÷ 10 + 0.75"],
          ["Equivalent CGPA", NUM2.format(conv.cgpa)],
          ["Division", division.error ? DASH : division.label],
        ],
        note: division.note || "",
        copyText: `${percent}% = AKTU CGPA ${NUM2.format(conv.cgpa)} using CGPA = % ÷ 10 + 0.75${division.error ? "" : ` — ${division.label}`}`,
      };
    }
    const agg = cgpaFromSemesters(
      semRows.map((row) => ({ credits: Number(row.credits), sgpa: Number(row.sgpa) })),
    );
    if (agg.error) return { error: agg.error };
    const division = divisionForCgpa(agg.cgpa, firstAttempt);
    return {
      headline: NUM2.format(agg.cgpa),
      rows: [
        ["Semesters counted", String(semRows.length)],
        ["Total credits", NUM2.format(agg.totalCredits)],
        ["Credit-weighted CGPA", NUM2.format(agg.cgpa)],
        ["Equivalent percentage", `${NUM2.format(agg.percent)}%`],
        ["Division", division.error ? DASH : division.label],
      ],
      note: division.note || "",
      copyText: `AKTU CGPA from SGPAs: ${NUM2.format(agg.cgpa)} over ${NUM2.format(agg.totalCredits)} credits = ${NUM2.format(agg.percent)}%`,
    };
  }, [mode, cgpa, percent, semRows, firstAttempt]);

  const hasError = Boolean(result.error);

  const setSemField = (id, field, value) => {
    setCopied(false);
    setSemRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addSemester = () => {
    setCopied(false);
    setSemRows((prev) => [
      ...prev,
      { id: prev.reduce((m, r) => Math.max(m, r.id), 0) + 1, credits: "24", sgpa: "7.5" },
    ]);
  };

  const removeSemester = (id) => {
    setCopied(false);
    setSemRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setCgpa(DEFAULTS.cgpa);
    setPercent(DEFAULTS.percent);
    setFirstAttempt(DEFAULTS.firstAttempt);
    setSemRows(DEFAULTS.semRows);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          CGPA Converters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AKTU CGPA Percentage Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          AKTU&apos;s own conversion rule is percentage = (CGPA − 0.75) × 10. Convert either way,
          or combine semester SGPAs credit-weighted into the CGPA your placement form needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="aktu-mode">
            What do you want to convert?
          </label>
          <select
            id="aktu-mode"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            value={mode}
            onChange={(event) => {
              setCopied(false);
              setMode(event.target.value);
            }}
          >
            {MODES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "toPercent" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="aktu-cgpa">
                Your CGPA (0 to 10)
              </label>
              <input
                id="aktu-cgpa"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="10"
                step="0.01"
                value={cgpa}
                onChange={(event) => {
                  setCopied(false);
                  setCgpa(event.target.value);
                }}
              />
            </div>
          ) : null}
          {mode === "toCgpa" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="aktu-percent">
                Your percentage (0 to 100)
              </label>
              <input
                id="aktu-percent"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={percent}
                onChange={(event) => {
                  setCopied(false);
                  setPercent(event.target.value);
                }}
              />
            </div>
          ) : null}
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm"
            htmlFor="aktu-first-attempt"
          >
            <input
              id="aktu-first-attempt"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={firstAttempt}
              onChange={(event) => {
                setCopied(false);
                setFirstAttempt(event.target.checked);
              }}
            />
            All papers cleared in the first attempt (needed for Honours)
          </label>
        </div>

        {mode === "semesters" ? (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Semester SGPAs</h2>
              <button
                type="button"
                onClick={addSemester}
                aria-label="Add a semester row"
                className={GHOST_BTN}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add semester
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {semRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`aktu-credits-${row.id}`}>
                      Semester {index + 1} credits
                    </label>
                    <input
                      id={`aktu-credits-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="1"
                      value={row.credits}
                      onChange={(event) => setSemField(row.id, "credits", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`aktu-sgpa-${row.id}`}>
                      SGPA
                    </label>
                    <input
                      id={`aktu-sgpa-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="10"
                      step="0.01"
                      value={row.sgpa}
                      onChange={(event) => setSemField(row.id, "sgpa", event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSemester(row.id)}
                    disabled={semRows.length <= 1}
                    aria-label={`Remove semester ${index + 1}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
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
              {mode === "toCgpa" ? "Equivalent CGPA" : mode === "semesters" ? "Credit-weighted CGPA" : "Equivalent percentage"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.headline}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.note || "Computed with AKTU's (CGPA − 0.75) × 10 equivalence."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the AKTU conversion result"
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
          {(hasError
            ? [
                ["Input", DASH],
                ["Formula", DASH],
                ["Result", DASH],
                ["Division", DASH],
              ]
            : result.rows
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">AKTU division bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  CGPA
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Percentage
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Division
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["7.5 and above", "67.5% and above", "First Division with Honours*"],
                ["6.5 and above", "57.5% and above", "First Division"],
                ["5.0 to below 6.5", "42.5% to below 57.5%", "Second Division"],
              ].map(([a, b, c]) => (
                <tr key={c} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{a}</td>
                  <td className="py-2 pr-3">{b}</td>
                  <td className="py-2 text-right font-semibold">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          *Honours additionally requires all papers cleared in the first attempt. Bands are as
          commonly stated in AKTU ordinances — confirm against your programme&apos;s ordinance.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion using AKTU&apos;s published (CGPA − 0.75) × 10 equivalence. Some
        recruiters and universities demand their own formula (for example UGC&apos;s CGPA × 9.5) —
        state the rule used whenever you write a converted percentage on a form.
      </p>
    </main>
  );
}
