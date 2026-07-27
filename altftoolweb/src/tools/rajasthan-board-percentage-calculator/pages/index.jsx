"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  RBSE_CLASSES,
  RBSE_DIVISIONS,
  RBSE_PASS_PERCENT,
  computeRbseResult,
  marksForNextDivision,
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

const CLASS10_DEFAULTS = [
  { id: 1, name: "Hindi", marks: "78", max: "100" },
  { id: 2, name: "English", marks: "72", max: "100" },
  { id: 3, name: "Mathematics", marks: "88", max: "100" },
  { id: 4, name: "Science", marks: "84", max: "100" },
  { id: 5, name: "Social Science", marks: "80", max: "100" },
  { id: 6, name: "Sanskrit", marks: "90", max: "100" },
];

const CLASS12_DEFAULTS = [
  { id: 1, name: "Hindi (compulsory)", marks: "78", max: "100" },
  { id: 2, name: "Physics", marks: "82", max: "100" },
  { id: 3, name: "Chemistry", marks: "65", max: "100" },
  { id: 4, name: "Mathematics", marks: "70", max: "100" },
  { id: 5, name: "English literature", marks: "88", max: "100" },
];

export default function ToolHome() {
  const [level, setLevel] = useState("class12");
  const [subjects, setSubjects] = useState(CLASS12_DEFAULTS);
  const [nextId, setNextId] = useState(7);
  const [copied, setCopied] = useState(false);

  const levelRecord = RBSE_CLASSES.find((item) => item.value === level) || RBSE_CLASSES[1];
  const result = useMemo(() => computeRbseResult({ level, subjects }), [level, subjects]);
  const ok = !result.error;

  const nextBand = useMemo(() => {
    if (!ok) return { error: "Fix the marksheet above first." };
    return marksForNextDivision({
      totalObtained: result.totalObtained,
      totalMax: result.totalMax,
    });
  }, [ok, result.totalObtained, result.totalMax]);

  const switchLevel = (value) => {
    setLevel(value);
    setSubjects(value === "class10" ? CLASS10_DEFAULTS : CLASS12_DEFAULTS);
    setNextId(7);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `RBSE ${result.levelLabel} result`,
      `Total: ${num(result.totalObtained)} / ${num(result.totalMax)}`,
      `Percentage: ${pct(result.percentage)}`,
      `Division: ${result.division}`,
      `Subjects below ${RBSE_PASS_PERCENT}%: ${result.failedCount}`,
    ].join("\n");
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

  const reset = () => switchLevel("class12");

  const updateSubject = (id, key, value) =>
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addSubject = () => {
    setSubjects((rows) => [
      ...rows,
      { id: nextId, name: `Subject ${rows.length + 1}`, marks: "70", max: "100" },
    ]);
    setNextId((current) => current + 1);
  };

  const removeSubject = (id) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          RBSE Ajmer
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Rajasthan Board Percentage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          RBSE uses a plain aggregate — every subject counts, nothing is dropped. The division is
          then read off the aggregate, while the {RBSE_PASS_PERCENT}% minimum applies subject by
          subject.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div role="group" aria-label="Class" className="grid gap-2 sm:grid-cols-2">
          {RBSE_CLASSES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={level === item.value}
              onClick={() => switchLevel(item.value)}
              className={
                level === item.value
                  ? `${PRIMARY_BTN} w-full`
                  : `${GHOST_BTN} w-full text-[var(--muted-foreground)]`
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{levelRecord.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Subject marks</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          For subjects marked as theory plus practical, enter the combined subject total and its
          combined maximum.
        </p>

        <div className="mt-4 grid gap-4">
          {subjects.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`rbse-name-${row.id}`}>
                    Subject {index + 1} name
                  </label>
                  <input
                    id={`rbse-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateSubject(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rbse-marks-${row.id}`}>
                    Marks scored
                  </label>
                  <input
                    id={`rbse-marks-${row.id}`}
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
                  <label className={LABEL_CLASS} htmlFor={`rbse-max-${row.id}`}>
                    Maximum marks
                  </label>
                  <input
                    id={`rbse-max-${row.id}`}
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

              <div className="mt-3 flex justify-end">
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
              aria-label="Copy the RBSE result summary"
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
              aria-label="Reset every input"
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
            ["Usual grand total for this class", num(levelRecord.grandTotal)],
            ["Band on the aggregate", ok ? result.bandOnAggregate : "—"],
            ["Average marks per subject", ok ? NUM2.format(result.averagePerSubject) : "—"],
            [
              `Subjects below ${RBSE_PASS_PERCENT}%`,
              ok ? (result.failedCount === 0 ? "None" : result.failedSubjects.join(", ")) : "—",
            ],
            [
              "Marks short of the aggregate minimum",
              ok ? (result.aggregatePassed ? "None" : num(result.marksToPassAggregate)) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Next division</h2>
        {nextBand.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {nextBand.error}
          </p>
        ) : nextBand.atTop ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            The aggregate is already in First division, the highest band RBSE awards.
          </p>
        ) : (
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Next band", `${nextBand.nextDivision} at ${nextBand.nextDivisionAt}%`],
              ["Total marks it needs", num(nextBand.requiredTotal)],
              ["Extra marks required", num(nextBand.needed)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
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
        <h2 className="text-base font-semibold">RBSE division bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[260px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Division
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Aggregate
                </th>
              </tr>
            </thead>
            <tbody>
              {RBSE_DIVISIONS.map((band) => (
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
        Informational only. Where a subject carries a practical component, some circulars require
        the theory portion to clear the minimum on its own as well; confirm the requirement for
        your subject in the official RBSE notification before drawing conclusions.
      </p>
    </main>
  );
}
