"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, School, Trash2 } from "lucide-react";

import {
  PUC_DIVISIONS,
  PUC_PASS_PERCENT,
  computePucResult,
  marksNeededForTarget,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");
const num = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SUBJECTS = [
  { id: 1, name: "Language I", marks: "88", max: "100", optional: false },
  { id: 2, name: "Language II (English)", marks: "82", max: "100", optional: false },
  { id: 3, name: "Physics", marks: "90", max: "100", optional: true },
  { id: 4, name: "Chemistry", marks: "86", max: "100", optional: true },
  { id: 5, name: "Mathematics", marks: "95", max: "100", optional: true },
  { id: 6, name: "Biology", marks: "89", max: "100", optional: true },
];

export default function ToolHome() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [nextId, setNextId] = useState(7);
  const [target, setTarget] = useState("90");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computePucResult({ subjects }), [subjects]);
  const ok = !result.error;

  const targetCheck = useMemo(() => {
    if (!ok) return { error: "Fix the marksheet above first." };
    return marksNeededForTarget({
      totalObtained: result.totalObtained,
      totalMax: result.totalMax,
      targetPercent: target,
    });
  }, [ok, result.totalObtained, result.totalMax, target]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Karnataka II PUC result",
      `Total: ${num(result.totalObtained)} / ${num(result.totalMax)}`,
      `Percentage: ${pct(result.percentage)}`,
      `Class: ${result.division}`,
      `Subjects below ${PUC_PASS_PERCENT}%: ${result.failedCount}`,
      result.optionalPercentage !== null
        ? `Optional subjects only: ${pct(result.optionalPercentage)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setSubjects(DEFAULT_SUBJECTS);
    setNextId(7);
    setTarget("90");
    setCopied(false);
  };

  const updateSubject = (id, key, value) =>
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addSubject = () => {
    setSubjects((rows) => [
      ...rows,
      { id: nextId, name: `Subject ${rows.length + 1}`, marks: "80", max: "100", optional: true },
    ]);
    setNextId((current) => current + 1);
  };

  const removeSubject = (id) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          KSEAB II PUC
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Karnataka PUC Percentage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six subjects of 100 marks each make a grand total of 600. The percentage is the plain
          aggregate, but the class awarded also depends on clearing {PUC_PASS_PERCENT}% in every
          single subject.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your marksheet</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick &ldquo;optional&rdquo; for the four non-language subjects so the calculator can also
          report the optional-subject percentage many colleges ask for.
        </p>

        <div className="mt-4 grid gap-4">
          {subjects.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-[var(--border)] p-3 sm:p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`puc-name-${row.id}`}>
                    Subject {index + 1} name
                  </label>
                  <input
                    id={`puc-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateSubject(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`puc-marks-${row.id}`}>
                    Marks scored
                  </label>
                  <input
                    id={`puc-marks-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={row.marks}
                    onChange={(event) => updateSubject(row.id, "marks", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`puc-max-${row.id}`}>
                    Maximum marks
                  </label>
                  <input
                    id={`puc-max-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={row.max}
                    onChange={(event) => updateSubject(row.id, "max", event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"
                  htmlFor={`puc-optional-${row.id}`}
                >
                  <input
                    id={`puc-optional-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={row.optional}
                    onChange={(event) => updateSubject(row.id, "optional", event.target.checked)}
                  />
                  Optional subject
                </label>
                <button
                  type="button"
                  onClick={() => removeSubject(row.id)}
                  disabled={subjects.length < 2}
                  aria-label={`Remove subject ${index + 1}`}
                  className={`${GHOST_BTN} disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSubject} className={`${GHOST_BTN} mt-4`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject
        </button>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Aggregate percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? pct(result.percentage) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(result.totalObtained)} out of ${num(result.totalMax)} — ${result.division}`
                : "Fix the marksheet above to see a percentage"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the PUC result summary"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
              aria-label="Reset the marksheet"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total marks obtained", ok ? num(result.totalObtained) : "—"],
            ["Grand total", ok ? num(result.totalMax) : "—"],
            ["Class awarded", ok ? result.division : "—"],
            ["Band on the aggregate alone", ok ? result.bandOnAggregate : "—"],
            [
              "Optional subjects only",
              ok && result.optionalPercentage !== null ? pct(result.optionalPercentage) : "—",
            ],
            ["Average marks per subject", ok ? NUM2.format(result.averagePerSubject) : "—"],
            [
              `Subjects below ${PUC_PASS_PERCENT}%`,
              ok
                ? result.failedCount === 0
                  ? "None"
                  : result.failedSubjects.join(", ")
                : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Subject by subject</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Subject
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Marks
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Percent
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3">
                      {num(row.marks)} / {num(row.max)}
                    </td>
                    <td className="py-2 pr-3">{pct(row.percent)}</td>
                    <td
                      className={`py-2 font-semibold ${
                        row.passed ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.passed ? "Pass" : `Short by ${NUM2.format(row.shortfall)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Reach a target percentage</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="puc-target">
            Target aggregate percentage
          </label>
          <input
            id="puc-target"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.5"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          />
        </div>

        {targetCheck.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {targetCheck.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Total marks that target needs", num(targetCheck.requiredTotal)],
              [
                "Extra marks required",
                targetCheck.alreadyReached ? "Already reached" : num(targetCheck.needed),
              ],
              ["Possible within the grand total", targetCheck.reachable ? "Yes" : "No"],
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
        <h2 className="text-base font-semibold">Class bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Class
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Aggregate
                </th>
              </tr>
            </thead>
            <tbody>
              {PUC_DIVISIONS.map((band) => (
                <tr key={band.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{band.name}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Practical and theory components of science subjects are added into the
        subject total here; if your college applies a separate minimum to the theory portion,
        check that against the official KSEAB regulation for your year.
      </p>
    </main>
  );
}
