"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { ATTENDANCE_MINIMUM_PERCENT, buildProgressSummary } from "../lib";

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SUBJECTS = [
  { name: "Maths", obtained: "82", max: "100" },
  { name: "Science", obtained: "74", max: "100" },
  { name: "English", obtained: "68", max: "100" },
  { name: "Social Science", obtained: "55", max: "100" },
];

const DEFAULTS = {
  studentName: "Aarav",
  termLabel: "Term 1, 2026",
  attendance: "88",
};

export default function ToolHome() {
  const [studentName, setStudentName] = useState(DEFAULTS.studentName);
  const [termLabel, setTermLabel] = useState(DEFAULTS.termLabel);
  const [attendance, setAttendance] = useState(DEFAULTS.attendance);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildProgressSummary({
        studentName,
        termLabel,
        subjects,
        attendancePercent: attendance.trim() === "" ? Number.NaN : attendance,
      }),
    [studentName, termLabel, subjects, attendance],
  );
  const hasError = Boolean(result.error);

  const updateSubject = (index, field, value) => {
    setSubjects((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addSubject = () => {
    setSubjects((prev) => [
      ...prev,
      { name: `Subject ${prev.length + 1}`, obtained: "", max: "100" },
    ]);
  };

  const removeSubject = (index) => {
    setSubjects((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStudentName(DEFAULTS.studentName);
    setTermLabel(DEFAULTS.termLabel);
    setAttendance(DEFAULTS.attendance);
    setSubjects(DEFAULT_SUBJECTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Result analysis
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Parent Progress Summary Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter subject marks and attendance to build a one-page summary with the overall
          grade on CBSE-pattern bands, an attendance check against the 75% rule, and clear
          strengths and focus areas.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pps-name">
              Student name
            </label>
            <input
              id="pps-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pps-term">
              Term / exam label
            </label>
            <input
              id="pps-term"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={termLabel}
              onChange={(event) => setTermLabel(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pps-attendance">
              Attendance (%)
            </label>
            <input
              id="pps-attendance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={attendance}
              onChange={(event) => setAttendance(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Days present divided by working days, times 100. Most boards require at least{" "}
              {ATTENDANCE_MINIMUM_PERCENT}%.
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Subjects
        </h2>
        <div className="mt-3 space-y-4">
          {subjects.map((row, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:border-0 sm:p-0"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`pps-sub-${index}`}>
                  Subject {index + 1}
                </label>
                <input
                  id={`pps-sub-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.name}
                  onChange={(event) => updateSubject(index, "name", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`pps-obt-${index}`}>
                  Marks obtained
                </label>
                <input
                  id={`pps-obt-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={row.obtained}
                  onChange={(event) => updateSubject(index, "obtained", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`pps-max-${index}`}>
                  Maximum marks
                </label>
                <input
                  id={`pps-max-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={row.max}
                  onChange={(event) => updateSubject(index, "max", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSubject(index)}
                disabled={subjects.length <= 1}
                aria-label={`Remove ${row.name || `subject ${index + 1}`}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSubject} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject
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
              Overall grade
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.overallGrade} · ${PCT.format(result.overallPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to build the summary." : result.overallRemark}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the full progress summary text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
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
          {[
            [
              "Total marks",
              hasError ? DASH : `${result.totalObtained}/${result.totalMax}`,
            ],
            [
              "Attendance",
              hasError
                ? DASH
                : `${PCT.format(result.attendance)}% ${result.attendanceOk ? "(meets 75% rule)" : "(below 75% minimum)"}`,
            ],
            [
              "Strengths (75%+)",
              hasError
                ? DASH
                : result.strengths.length > 0
                  ? result.strengths.join(", ")
                  : "None this term",
            ],
            [
              "Focus areas (below 60%)",
              hasError
                ? DASH
                : result.focusAreas.length > 0
                  ? result.focusAreas.join(", ")
                  : "None — all subjects at 60%+",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              One-page summary (copy and share)
            </h2>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.summaryText}
            </pre>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Grade bands follow the 10-point pattern common on Indian report cards; your school's
        exact bands and pass marks may differ. The 75% attendance figure reflects common CBSE
        and UGC eligibility rules — check your institution's own policy.
      </p>
    </main>
  );
}
