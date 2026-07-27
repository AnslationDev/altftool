"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DIVISION_BANDS,
  HS_COUNTED_SUBJECTS,
  MADHYAMIK_GRADES,
  WB_EXAMS,
  computeWbResult,
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

const MADHYAMIK_DEFAULTS = [
  { id: 1, name: "First Language", marks: "90", max: "100", compulsory: true },
  { id: 2, name: "Second Language", marks: "85", max: "100", compulsory: true },
  { id: 3, name: "Mathematics", marks: "92", max: "100", compulsory: false },
  { id: 4, name: "Physical Science", marks: "78", max: "100", compulsory: false },
  { id: 5, name: "Life Science", marks: "88", max: "100", compulsory: false },
  { id: 6, name: "History", marks: "70", max: "100", compulsory: false },
  { id: 7, name: "Geography", marks: "82", max: "100", compulsory: false },
];

const HS_DEFAULTS = [
  { id: 1, name: "Bengali", marks: "80", max: "100", compulsory: true },
  { id: 2, name: "English", marks: "75", max: "100", compulsory: true },
  { id: 3, name: "Physics", marks: "92", max: "100", compulsory: false },
  { id: 4, name: "Chemistry", marks: "88", max: "100", compulsory: false },
  { id: 5, name: "Mathematics", marks: "85", max: "100", compulsory: false },
  { id: 6, name: "Biological Science", marks: "60", max: "100", compulsory: false },
];

export default function ToolHome() {
  const [exam, setExam] = useState("madhyamik");
  const [subjects, setSubjects] = useState(MADHYAMIK_DEFAULTS);
  const [nextId, setNextId] = useState(8);
  const [copied, setCopied] = useState(false);

  const examRecord = WB_EXAMS.find((item) => item.value === exam) || WB_EXAMS[0];
  const result = useMemo(() => computeWbResult({ exam, subjects }), [exam, subjects]);
  const ok = !result.error;

  const switchExam = (value) => {
    setExam(value);
    setSubjects(value === "madhyamik" ? MADHYAMIK_DEFAULTS : HS_DEFAULTS);
    setNextId(8);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `${result.examLabel} result`,
      `Total counted: ${num(result.totalObtained)} / ${num(result.totalMax)}`,
      `Percentage: ${pct(result.percentage)}`,
      `Division: ${result.divisionOnAggregate}`,
      result.droppedSubjects.length
        ? `Dropped from the total: ${result.droppedSubjects.join(", ")}`
        : "",
      `Subjects below the pass mark: ${result.failedCount}`,
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

  const reset = () => switchExam("madhyamik");

  const updateSubject = (id, key, value) =>
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addSubject = () => {
    setSubjects((rows) => [
      ...rows,
      { id: nextId, name: `Subject ${rows.length + 1}`, marks: "70", max: "100", compulsory: false },
    ]);
    setNextId((current) => current + 1);
  };

  const removeSubject = (id) =>
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          WBBSE &amp; WBCHSE
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          West Bengal Board Percentage Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Madhyamik counts all seven subjects out of 700. Higher Secondary counts only five out of
          500 — both languages plus the best three electives. Pick the exam and the right rule is
          applied.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div role="group" aria-label="Examination" className="grid gap-2 sm:grid-cols-2">
          {WB_EXAMS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={exam === item.value}
              onClick={() => switchExam(item.value)}
              className={
                exam === item.value
                  ? `${PRIMARY_BTN} w-full`
                  : `${GHOST_BTN} w-full text-[var(--muted-foreground)]`
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{examRecord.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Subject marks</h2>
        {exam === "hs" && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Tick &ldquo;always counts&rdquo; for the two compulsory language papers. The best{" "}
            {HS_COUNTED_SUBJECTS - 2} of the remaining subjects are then added to make the
            500-mark total.
          </p>
        )}

        <div className="mt-4 grid gap-4">
          {subjects.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`wb-name-${row.id}`}>
                    Subject {index + 1} name
                  </label>
                  <input
                    id={`wb-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateSubject(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wb-marks-${row.id}`}>
                    Marks scored
                  </label>
                  <input
                    id={`wb-marks-${row.id}`}
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
                  <label className={LABEL_CLASS} htmlFor={`wb-max-${row.id}`}>
                    Maximum marks
                  </label>
                  <input
                    id={`wb-max-${row.id}`}
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
                {exam === "hs" ? (
                  <label
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"
                    htmlFor={`wb-comp-${row.id}`}
                  >
                    <input
                      id={`wb-comp-${row.id}`}
                      type="checkbox"
                      className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                      checked={row.compulsory}
                      onChange={(event) =>
                        updateSubject(row.id, "compulsory", event.target.checked)
                      }
                    />
                    Always counts (language paper)
                  </label>
                ) : (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Every Madhyamik subject counts.
                  </span>
                )}
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
                ? `${num(result.totalObtained)} out of ${num(result.totalMax)} on ${result.countedSubjects} counted subjects`
                : "Fix the marks above to see a percentage"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the board result summary"
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
            ["Marks counted", ok ? num(result.totalObtained) : "—"],
            ["Total possible", ok ? num(result.totalMax) : "—"],
            ["Division on the aggregate", ok ? result.divisionOnAggregate : "—"],
            [
              "Dropped from the total",
              ok ? (result.droppedSubjects.length ? result.droppedSubjects.join(", ") : "None") : "—",
            ],
            ["Average marks per counted subject", ok ? NUM2.format(result.averagePerSubject) : "—"],
            [
              `Subjects below ${ok ? result.passPercent : examRecord.passPercent}%`,
              ok ? (result.failedCount === 0 ? "None" : result.failedSubjects.join(", ")) : "—",
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
          <h2 className="text-base font-semibold">Subject breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
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
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    {exam === "madhyamik" ? "Grade" : "In total"}
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
                    <td className="py-2 pr-3">
                      {exam === "madhyamik"
                        ? row.grade
                          ? row.grade.code
                          : "—"
                        : row.counted
                          ? "Counted"
                          : "Dropped"}
                    </td>
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

      {exam === "madhyamik" && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Madhyamik grade bands</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Grade
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Marks
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody>
                {MADHYAMIK_GRADES.map((grade) => (
                  <tr key={grade.code} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{grade.code}</td>
                    <td className="py-2 pr-3">
                      {grade.min} &ndash; {grade.max}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{grade.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Division bands on the aggregate</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[260px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Division
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {DIVISION_BANDS.map((band) => (
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
        Informational only. WBCHSE has been moving Higher Secondary to a semester structure, so
        confirm which papers and which semester marks make up your 500-mark total against the
        council notification for your batch.
      </p>
    </main>
  );
}
