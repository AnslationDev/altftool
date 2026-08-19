"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  IPU_DEAN_CONDONATION_POINTS,
  IPU_REQUIRED_PERCENT,
  IPU_VC_RELAXATION_POINTS,
  computeIpuAttendance,
} from "../lib";

const DASH = "—";
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const pct = (value) => (Number.isFinite(value) ? `${PCT.format(value)}%` : DASH);
const num = (value) => (Number.isFinite(value) ? PCT.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULT_SUBJECTS = [
  { id: "s1", name: "Applied Mathematics", held: "40", attended: "28", remaining: "10" },
  { id: "s2", name: "Data Structures", held: "38", attended: "34", remaining: "8" },
  { id: "s3", name: "Digital Electronics", held: "36", attended: "22", remaining: "12" },
];

const toCount = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [requiredPercent, setRequiredPercent] = useState(String(IPU_REQUIRED_PERCENT));
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeIpuAttendance({
        subjects: subjects.map((row) => ({
          name: row.name,
          held: toCount(row.held),
          attended: toCount(row.attended),
          remaining: toCount(row.remaining),
        })),
        requiredPercent: toCount(requiredPercent),
      }),
    [subjects, requiredPercent],
  );

  const hasError = Boolean(result.error);

  const updateSubject = (id, field, value) => {
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addSubject = () => {
    setSubjects((rows) => [
      ...rows,
      { id: `s${nextId}`, name: `Subject ${rows.length + 1}`, held: "30", attended: "24", remaining: "10" },
    ]);
    setNextId((value) => value + 1);
  };

  const removeSubject = (id) => {
    setSubjects((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "IPU Attendance Calculator",
      `Requirement: ${result.requiredPercent}% per subject (condonation floor ${result.condonationFloor}%, relaxation floor ${result.relaxationFloor}%)`,
      `Overall: ${pct(result.overallPercent)} — ${result.totalAttended} of ${result.totalHeld} classes attended`,
      "",
    ];
    result.rows.forEach((row) => {
      lines.push(
        `${row.name}: ${row.percent === null ? "no classes yet" : pct(row.percent)} (${row.attended}/${row.held}) — ${row.status.label}`,
      );
      if (row.remaining > 0) {
        lines.push(
          `  must attend ${row.mustAttendOfRemaining} of the ${row.remaining} classes left; can skip ${row.canSkipOfRemaining}`,
        );
      }
    });
    lines.push("", result.verdict);
    return lines.join("\n");
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
    setSubjects(DEFAULT_SUBJECTS);
    setRequiredPercent(String(IPU_REQUIRED_PERCENT));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          GGSIPU
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">IPU Attendance Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          IPU counts attendance subject by subject, not as one semester average. Enter the classes
          held and attended in each paper to see where you stand against the{" "}
          {IPU_REQUIRED_PERCENT}% bar and exactly how many classes are left to fix it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ipu-target">
              Attendance required per subject (%)
            </label>
            <input
              id="ipu-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={requiredPercent}
              onChange={(event) => setRequiredPercent(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              The University ordinance sets {IPU_REQUIRED_PERCENT}%. Change it only if your
              institute has told you otherwise.
            </p>
          </div>
          <div className="rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--foreground)]">Two discretionary steps below the bar</p>
            <p className="mt-1">
              Dean/Director may condone up to {IPU_DEAN_CONDONATION_POINTS} points, and the
              Vice-Chancellor a further {IPU_VC_RELAXATION_POINTS} points for approved sports, NCC
              or NSS representation. Neither is automatic.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {subjects.map((row, index) => (
          <div key={row.id} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className={LABEL_CLASS} htmlFor={`ipu-name-${row.id}`}>
                  Subject {index + 1}
                </label>
                <input
                  id={`ipu-name-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.name}
                  onChange={(event) => updateSubject(row.id, "name", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSubject(row.id)}
                aria-label={`Remove ${row.name || `subject ${index + 1}`}`}
                disabled={subjects.length <= 1}
                className={`${GHOST_BTN} px-3 disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLASS} htmlFor={`ipu-held-${row.id}`}>
                  Classes held
                </label>
                <input
                  id={`ipu-held-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={row.held}
                  onChange={(event) => updateSubject(row.id, "held", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ipu-att-${row.id}`}>
                  Classes attended
                </label>
                <input
                  id={`ipu-att-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={row.attended}
                  onChange={(event) => updateSubject(row.id, "attended", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ipu-rem-${row.id}`}>
                  Classes still to come
                </label>
                <input
                  id={`ipu-rem-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={row.remaining}
                  onChange={(event) => updateSubject(row.id, "remaining", event.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addSubject} className={GHOST_BTN}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another subject
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Overall attendance so far
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.overallPercent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the result."
                : `${num(result.totalAttended)} of ${num(result.totalHeld)} classes attended across ${num(result.subjectCount)} subjects`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy attendance summary"
              className={GHOST_BTN}
              disabled={hasError}
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
          {[
            ["Subjects at or above the bar", hasError ? DASH : num(result.counts.safe)],
            ["Subjects short of the bar", hasError ? DASH : num(result.shortCount)],
            ["Subjects below every relaxation", hasError ? DASH : num(result.blockedCount)],
            ["Classes missed in total", hasError ? DASH : num(result.totalMissed)],
            ["Classes still scheduled", hasError ? DASH : num(result.totalRemaining)],
            ["Weakest subject", hasError || !result.weakest ? DASH : `${result.weakest.name} (${pct(result.weakest.percent)})`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.verdict}</p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Subject by subject</h2>
          <div className="mt-4 -mx-1 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="px-1 py-2 font-semibold">Subject</th>
                  <th scope="col" className="px-1 py-2 text-right font-semibold">Now</th>
                  <th scope="col" className="px-1 py-2 text-right font-semibold">Must attend</th>
                  <th scope="col" className="px-1 py-2 text-right font-semibold">Can skip</th>
                  <th scope="col" className="px-1 py-2 text-right font-semibold">Best possible</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.name} className="border-t border-[var(--border)] align-top">
                    <th scope="row" className="px-1 py-3 text-left font-semibold">
                      {row.name}
                      <span
                        className={`mt-1 block w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASS[row.status.tone]}`}
                      >
                        {row.status.label}
                      </span>
                    </th>
                    <td className="px-1 py-3 text-right font-semibold">
                      {row.percent === null ? DASH : pct(row.percent)}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {row.attended}/{row.held}
                      </span>
                    </td>
                    <td className="px-1 py-3 text-right">
                      {row.remaining > 0
                        ? row.targetReachable
                          ? `${row.mustAttendOfRemaining} of ${row.remaining}`
                          : "not reachable"
                        : row.consecutiveNeeded === null
                          ? "not possible"
                          : `${row.consecutiveNeeded} in a row`}
                    </td>
                    <td className="px-1 py-3 text-right">
                      {row.remaining > 0
                        ? row.targetReachable
                          ? row.canSkipOfRemaining
                          : 0
                        : row.canMissNow}
                    </td>
                    <td className="px-1 py-3 text-right">
                      {row.bestPossible === null ? DASH : pct(row.bestPossible)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            &ldquo;Must attend&rdquo; counts the classes still to come that you cannot miss.
            Where no future classes are entered, it shows how many consecutive classes would lift
            the subject back to {result.requiredPercent}%.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Condonation and relaxation are discretionary powers of the
        Dean/Director and Vice-Chancellor, and detention lists are drawn from the attendance the
        institute uploads on the cut-off date. Check your institute portal and the current
        examination ordinance before relying on any figure here.
      </p>
    </main>
  );
}
