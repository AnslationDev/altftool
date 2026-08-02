"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  BU_OFFSET,
  buCgpaFromSemesters,
  buCgpaToPercentage,
  buPercentageToCgpa,
  classThresholdTable,
  compareFormulas,
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
  { sgpa: "7.0", credits: "24" },
  { sgpa: "8.0", credits: "24" },
];

const THRESHOLDS = classThresholdTable();

export default function ToolHome() {
  const [mode, setMode] = useState("toPercent");
  const [cgpa, setCgpa] = useState("7.42");
  const [percentage, setPercentage] = useState("65");
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const forward = useMemo(() => buCgpaToPercentage({ cgpa }), [cgpa]);
  const reverse = useMemo(() => buPercentageToCgpa({ percentage }), [percentage]);
  const variants = useMemo(() => compareFormulas(cgpa), [cgpa]);
  const aggregate = useMemo(() => buCgpaFromSemesters(semesters), [semesters]);

  const active = mode === "toPercent" ? forward : reverse;
  const ok = !active.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    if (mode === "toPercent") {
      return [
        "Bangalore University CGPA to percentage",
        `CGPA: ${gp(forward.cgpa)}`,
        `Equivalent percentage: ${pct(forward.percentage)}`,
        `Calculated as ${forward.formula}`,
        `Class: ${forward.degreeClass}`,
      ].join("\n");
    }
    return [
      "Bangalore University percentage to CGPA",
      `Percentage: ${pct(reverse.percentage)}`,
      `Equivalent CGPA: ${gp(reverse.cgpa)}`,
      `Calculated as ${reverse.formula}`,
      `Class: ${reverse.degreeClass}`,
    ].join("\n");
  }, [ok, mode, forward, reverse]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "conversion result" });
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset all inputs, including the semester SGPA table, back to the defaults?")
    ) {
      return;
    }
    setMode("toPercent");
    setCgpa("7.42");
    setPercentage("65");
    setSemesters(DEFAULT_SEMESTERS);
    resetCopyState();
  };

  const updateSemester = (index, key, value) =>
    setSemesters((rows) =>
      rows.map((row, position) => (position === index ? { ...row, [key]: value } : row)),
    );

  const addSemester = () => setSemesters((rows) => [...rows, { sgpa: "", credits: "24" }]);
  const removeSemester = (index) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((_, position) => position !== index) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Bangalore University
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Bangalore University CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Bangalore University reads grade points as marks with a three quarter point
          deduction: percentage = (CGPA &minus; {BU_OFFSET}) &times; 10. Convert either way, and
          compare the three offsets in circulation to see which one your marks card used.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
            <label className={LABEL_CLASS} htmlFor="bu-cgpa">
              CGPA or SGPA (out of 10)
            </label>
            <input
              id="bu-cgpa"
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
            <label className={LABEL_CLASS} htmlFor="bu-percent">
              Percentage of marks
            </label>
            <input
              id="bu-percent"
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
              aria-label={isCopied("result") ? "Copied the conversion result to clipboard" : "Copy the conversion result"}
              className={`${PRIMARY_BTN} disabled:opacity-40`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
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
        <h2 className="text-base font-semibold">The same CGPA under each formula</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          If a percentage is already printed on your marks card, the row it matches tells you
          which rule your college applied.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Formula
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Used by
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.length > 0 ? (
                variants.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.note}</td>
                    <td className="py-2 text-right font-semibold">{pct(row.percentage)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">CGPA from semester SGPAs</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Weighted by the credits of each semester, as the consolidated marks card does it.
        </p>

        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={`bu-sem-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`bu-sgpa-${index}`}>
                  Semester {index + 1} SGPA
                </label>
                <input
                  id={`bu-sgpa-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="10"
                  step="0.01"
                  value={row.sgpa}
                  onChange={(event) => updateSemester(index, "sgpa", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`bu-cred-${index}`}>
                  Credits
                </label>
                <input
                  id={`bu-cred-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateSemester(index, "credits", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSemester(index)}
                disabled={semesters.length < 2}
                aria-label={`Remove semester ${index + 1}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSemester} className={`${GHOST_BTN} mt-3`}>
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
        <h2 className="text-base font-semibold">CGPA each class threshold needs</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Class
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Percentage
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  CGPA
                </th>
              </tr>
            </thead>
            <tbody>
              {THRESHOLDS.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.label}</td>
                  <td className="py-2 pr-3">{row.percentage}%</td>
                  <td className="py-2 text-right">{gp(row.cgpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion. The class awarded and any certified percentage come from the
        Bangalore University registrar (evaluation); use those figures whenever a form says a
        self-calculated equivalence will not be accepted.
      </p>
    </main>
  );
}
