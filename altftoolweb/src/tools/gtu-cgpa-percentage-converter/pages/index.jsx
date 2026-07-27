"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  GTU_GRADES,
  GTU_REGULATIONS,
  gtuCpiFromSemesters,
  gtuIndexToPercentage,
  gtuPercentageToIndex,
  gtuSpiFromGrades,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const idx = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SUBJECTS = [
  { code: "AA", credits: "4" },
  { code: "BB", credits: "3" },
  { code: "CC", credits: "3" },
];

const DEFAULT_SEMESTERS = [
  { spi: "8.2", credits: "20" },
  { spi: "7.5", credits: "22" },
];

export default function ToolHome() {
  const [regulation, setRegulation] = useState("credit2009");
  const [mode, setMode] = useState("toPercent");
  const [indexInput, setIndexInput] = useState("8.24");
  const [percentInput, setPercentInput] = useState("70");
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [copied, setCopied] = useState(false);

  const forward = useMemo(
    () => gtuIndexToPercentage({ index: indexInput, regulation }),
    [indexInput, regulation],
  );
  const reverse = useMemo(
    () => gtuPercentageToIndex({ percentage: percentInput, regulation }),
    [percentInput, regulation],
  );
  const spi = useMemo(() => gtuSpiFromGrades(subjects), [subjects]);
  const cpi = useMemo(() => gtuCpiFromSemesters(semesters, regulation), [semesters, regulation]);

  const active = mode === "toPercent" ? forward : reverse;
  const ok = !active.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    if (mode === "toPercent") {
      return [
        "GTU performance index to percentage",
        `Regulation: ${forward.regulationLabel}`,
        `Index (SPI / CPI / CGPA): ${idx(forward.index)}`,
        `Equivalent percentage: ${pct(forward.percentage)}`,
        `Calculated as ${forward.formula}`,
      ].join("\n");
    }
    return [
      "GTU percentage to performance index",
      `Regulation: ${reverse.regulationLabel}`,
      `Percentage: ${pct(reverse.percentage)}`,
      `Equivalent index: ${idx(reverse.index)}`,
      `Calculated as ${reverse.formula}`,
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
    setRegulation("credit2009");
    setMode("toPercent");
    setIndexInput("8.24");
    setPercentInput("70");
    setSubjects(DEFAULT_SUBJECTS);
    setSemesters(DEFAULT_SEMESTERS);
    setCopied(false);
  };

  const updateSubject = (position, key, value) =>
    setSubjects((rows) =>
      rows.map((row, index) => (index === position ? { ...row, [key]: value } : row)),
    );
  const addSubject = () => setSubjects((rows) => [...rows, { code: "BB", credits: "3" }]);
  const removeSubject = (position) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((_, index) => index !== position) : rows));

  const updateSemester = (position, key, value) =>
    setSemesters((rows) =>
      rows.map((row, index) => (index === position ? { ...row, [key]: value } : row)),
    );
  const addSemester = () => setSemesters((rows) => [...rows, { spi: "", credits: "20" }]);
  const removeSemester = (position) =>
    setSemesters((rows) => (rows.length > 1 ? rows.filter((_, index) => index !== position) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Gujarat Technological University
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Gujarat Technological CGPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          GTU prints an SPI for each semester and a CPI across them, both on a 10 point scale.
          Under the credit system the marks equivalence is (CPI &minus; 0.5) &times; 10. Build the
          SPI from AA to FF grades, roll it into a CPI, and convert.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-5">
          <label className={LABEL_CLASS} htmlFor="gtu-reg">
            Regulation
          </label>
          <select
            id="gtu-reg"
            className={`mt-2 ${INPUT_CLASS}`}
            value={regulation}
            onChange={(event) => setRegulation(event.target.value)}
          >
            {GTU_REGULATIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div role="group" aria-label="Conversion direction" className="mb-5 grid gap-2 sm:grid-cols-2">
          {[
            ["toPercent", "Index to percentage"],
            ["toIndex", "Percentage to index"],
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
            <label className={LABEL_CLASS} htmlFor="gtu-index">
              SPI, CPI or CGPA (out of 10)
            </label>
            <input
              id="gtu-index"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.01"
              value={indexInput}
              onChange={(event) => setIndexInput(event.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="gtu-percent">
              Percentage of marks
            </label>
            <input
              id="gtu-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              value={percentInput}
              onChange={(event) => setPercentInput(event.target.value)}
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
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {mode === "toPercent" ? "Equivalent percentage" : "Equivalent index"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (mode === "toPercent" ? pct(forward.percentage) : idx(reverse.index)) : "—"}
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(mode === "toPercent"
            ? [
                ["Index entered", ok ? idx(forward.index) : "—"],
                ["Equivalent percentage", ok ? pct(forward.percentage) : "—"],
                ["Under the other convention", ok ? pct(forward.alternatePercentage) : "—"],
                ["Above the DD pass grade", ok ? (forward.passing ? "Yes" : "No") : "—"],
              ]
            : [
                ["Percentage entered", ok ? pct(reverse.percentage) : "—"],
                ["Equivalent index", ok ? idx(reverse.index) : "—"],
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
        <h2 className="text-base font-semibold">SPI from subject grades</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Pick the GTU grade code for each subject and its credits. An FF contributes zero grade
          points but still occupies its credits, which is why one backlog pulls the SPI down hard.
        </p>

        <div className="mt-4 grid gap-3">
          {subjects.map((row, index) => (
            <div key={`gtu-sub-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`gtu-code-${index}`}>
                  Subject {index + 1} grade
                </label>
                <select
                  id={`gtu-code-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.code}
                  onChange={(event) => updateSubject(index, "code", event.target.value)}
                >
                  {GTU_GRADES.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} — {option.point} points
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gtu-sub-cred-${index}`}>
                  Credits
                </label>
                <input
                  id={`gtu-sub-cred-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.credits}
                  onChange={(event) => updateSubject(index, "credits", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSubject(index)}
                disabled={subjects.length < 2}
                aria-label={`Remove subject ${index + 1}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSubject} className={`${GHOST_BTN} mt-3`}>
          Add subject
        </button>

        {spi.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {spi.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Semester Performance Index", idx(spi.spi)],
              ["Total credits", NUM1.format(spi.totalCredits)],
              ["Total grade points", NUM1.format(spi.totalGradePoints)],
              ["Credits carrying a backlog", NUM1.format(spi.backlogCredits)],
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
        <h2 className="text-base font-semibold">CPI from semester SPIs</h2>

        <div className="mt-4 grid gap-3">
          {semesters.map((row, index) => (
            <div key={`gtu-sem-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`gtu-spi-${index}`}>
                  Semester {index + 1} SPI
                </label>
                <input
                  id={`gtu-spi-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="10"
                  step="0.01"
                  value={row.spi}
                  onChange={(event) => updateSemester(index, "spi", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gtu-sem-cred-${index}`}>
                  Credits
                </label>
                <input
                  id={`gtu-sem-cred-${index}`}
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

        {cpi.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {cpi.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Cumulative Performance Index", idx(cpi.cpi)],
              ["Total credits", NUM1.format(cpi.totalCredits)],
              ["Equivalent percentage", pct(cpi.percentage)],
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
        <h2 className="text-base font-semibold">GTU grade codes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
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
              {GTU_GRADES.map((row) => (
                <tr key={row.code} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.code}</td>
                  <td className="py-2 pr-3">{row.point}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational conversion. Check the regulation printed on your own marksheet, and request a
        percentage equivalence certificate from GTU when a recruiter or a foreign university will
        not accept a self-calculated figure.
      </p>
    </main>
  );
}
