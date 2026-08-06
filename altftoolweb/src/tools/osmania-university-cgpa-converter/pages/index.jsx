"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  OU_FORMULAS,
  cutoffTable,
  ouCgpaFromSemesters,
  ouCgpaToPercentage,
  ouPercentageToCgpa,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const gp = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SEMESTERS = [
  { id: 1, sgpa: "8.2", credits: "22" },
  { id: 2, sgpa: "7.4", credits: "20" },
];

export default function ToolHome() {
  const [mode, setMode] = useState("toPercent");
  const [formula, setFormula] = useState("cbcs");
  const [cgpa, setCgpa] = useState("8.12");
  const [percentage, setPercentage] = useState("65");
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [nextId, setNextId] = useState(3);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const forward = useMemo(() => ouCgpaToPercentage({ cgpa, formula }), [cgpa, formula]);
  const reverse = useMemo(() => ouPercentageToCgpa({ percentage, formula }), [percentage, formula]);
  const aggregate = useMemo(() => ouCgpaFromSemesters(semesters, formula), [semesters, formula]);
  const cutoffs = useMemo(() => cutoffTable(formula), [formula]);

  const active = mode === "toPercent" ? forward : reverse;
  const ok = !active.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    if (mode === "toPercent") {
      return [
        "Osmania University CGPA to percentage",
        `Convention: ${forward.formulaLabel}`,
        `CGPA: ${gp(forward.cgpa)}`,
        `Equivalent percentage: ${pct(forward.percentage)}`,
        `Calculated as ${forward.formula}`,
        `Class: ${forward.degreeClass}`,
      ].join("\n");
    }
    return [
      "Osmania University percentage to CGPA",
      `Convention: ${reverse.formulaLabel}`,
      `Percentage: ${pct(reverse.percentage)}`,
      `Equivalent CGPA: ${gp(reverse.cgpa)}`,
      `Calculated as ${reverse.formula}`,
    ].join("\n");
  }, [ok, mode, forward, reverse]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "conversion result" });
  };

  const reset = () => {
    setMode("toPercent");
    setFormula("cbcs");
    setCgpa("8.12");
    setPercentage("65");
    setSemesters(DEFAULT_SEMESTERS);
    setNextId(3);
    resetCopyState();
  };

  const updateSemester = (id, key, value) =>
    setSemesters((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addSemester = () => {
    setSemesters((rows) => [...rows, { id: nextId, sgpa: "", credits: "22" }]);
    setNextId((current) => current + 1);
  };

  const removeSemester = (id) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Osmania University
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Osmania University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Osmania&rsquo;s CBCS regulations equate grade points to marks with a half point offset:
          percentage = (CGPA &minus; 0.5) &times; 10. Convert either way, roll semester SGPAs into a
          CGPA, and see the CGPA each common cut-off needs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-5">
          <label className={LABEL_CLASS} htmlFor="ou-formula">
            Conversion convention
          </label>
          <select
            id="ou-formula"
            className={`mt-2 ${INPUT_CLASS}`}
            value={formula}
            onChange={(event) => setFormula(event.target.value)}
          >
            {OU_FORMULAS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Use the CBCS rule unless your own transcript prints a straight ten-times figure. At
            CGPA 8.0 the two differ by five marks.
          </p>
        </div>

        <div role="group" aria-label="Conversion direction" className="mb-5 grid gap-2 sm:grid-cols-2">
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
            <label className={LABEL_CLASS} htmlFor="ou-cgpa">
              CGPA or SGPA (out of 10)
            </label>
            <input
              id="ou-cgpa"
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
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="ou-percent">
              Percentage of marks
            </label>
            <input
              id="ou-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
            />
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {mode === "toPercent" ? "Equivalent percentage" : "Equivalent CGPA"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (mode === "toPercent" ? pct(forward.percentage) : gp(reverse.cgpa)) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `Calculated as ${active.formula}` : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label={
                isCopied("result") ? "Copied the conversion result to clipboard" : "Copy the conversion result"
              }
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(mode === "toPercent"
            ? [
                ["CGPA entered", ok ? gp(forward.cgpa) : "—"],
                ["Equivalent percentage", ok ? pct(forward.percentage) : "—"],
                ["Class (common convention)", ok ? forward.degreeClass : "—"],
                [
                  "Cut-offs cleared",
                  ok
                    ? forward.cutoffsCleared.length
                      ? forward.cutoffsCleared.map((cut) => `${cut}%`).join(", ")
                      : "None of 50% and above"
                    : "—",
                ],
                ["Above the grade point 4 pass line", ok ? (forward.passing ? "Yes" : "No") : "—"],
              ]
            : [
                ["Percentage entered", ok ? pct(reverse.percentage) : "—"],
                ["Equivalent CGPA", ok ? gp(reverse.cgpa) : "—"],
                ["Class (common convention)", ok ? reverse.degreeClass : "—"],
                ["Capped at the 10 point ceiling", ok ? (reverse.clamped ? "Yes" : "No") : "—"],
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
        <h2 className="text-base font-semibold">Roll semester SGPAs into a CGPA</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each semester is weighted by its registered credits, so a project-heavy final semester
          counts for more than a light one.
        </p>

        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`ou-sgpa-${row.id}`}>
                  Semester {index + 1} SGPA
                </label>
                <input
                  id={`ou-sgpa-${row.id}`}
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
                <label className={LABEL_CLASS} htmlFor={`ou-cred-${row.id}`}>
                  Credits
                </label>
                <input
                  id={`ou-cred-${row.id}`}
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
              ["Credit weighted CGPA", gp(aggregate.cgpa)],
              ["Total credits", NUM1.format(aggregate.totalCredits)],
              ["Equivalent percentage", pct(aggregate.percentage)],
              ["Class (common convention)", aggregate.degreeClass],
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
        <h2 className="text-base font-semibold">CGPA needed for each common cut-off</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Required percentage
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  CGPA needed
                </th>
              </tr>
            </thead>
            <tbody>
              {cutoffs.map((row) => (
                <tr key={row.percentage} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.percentage}%</td>
                  <td className="py-2 text-right">{gp(row.cgpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion. Class awards and equivalence certificates are issued by the
        Osmania University examination branch, and the figure printed on your transcript is what an
        employer or admissions office will act on.
      </p>
    </main>
  );
}
