"use client";

import { useMemo, useState } from "react";
import { CalendarX2, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DEFAULT_TIGHT_GAP_DAYS, detectClashes } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_EXAMS = [
  { id: "default-ssc-cgl", name: "SSC CGL Tier 1", start: "2026-09-10", end: "2026-09-18" },
  { id: "default-ibps-po", name: "IBPS PO Prelims", start: "2026-09-17", end: "2026-09-19" },
  { id: "default-rrb-ntpc", name: "RRB NTPC CBT 1", start: "2026-09-21", end: "2026-09-21" },
];

const makeExamId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function ToolHome() {
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [tightGap, setTightGap] = useState(String(DEFAULT_TIGHT_GAP_DAYS));
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      detectClashes({
        exams,
        tightGapDays: tightGap.trim() === "" ? DEFAULT_TIGHT_GAP_DAYS : Number(tightGap),
      }),
    [exams, tightGap],
  );
  const hasError = Boolean(result.error);

  const addExam = () => {
    const probe = detectClashes({
      exams: [{ name, start, end: end || undefined }],
      tightGapDays: DEFAULT_TIGHT_GAP_DAYS,
    });
    if (probe.error) {
      setFormError(probe.error);
      return;
    }
    setFormError("");
    setExams((prev) => [...prev, { id: makeExamId(), name: name.trim(), start, end: end || start }]);
    setName("");
    setStart("");
    setEnd("");
  };

  const removeExam = (targetId) => {
    setExams((prev) => prev.filter((exam) => exam.id !== targetId));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Exam clash check",
      `Exams: ${result.examCount}`,
      result.clashCount === 0
        ? "No date clashes."
        : `CLASHES: ${result.clashes
            .map((c) => `${c.first} vs ${c.second} (${c.overlapDays} shared day${c.overlapDays === 1 ? "" : "s"})`)
            .join("; ")}`,
      result.tightCount === 0
        ? "No tight gaps."
        : `Tight gaps: ${result.tightPairs
            .map((t) => `${t.first} -> ${t.second} (${t.freeDays} free day${t.freeDays === 1 ? "" : "s"})`)
            .join("; ")}`,
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
    setExams(DEFAULT_EXAMS);
    setName("");
    setStart("");
    setEnd("");
    setTightGap(String(DEFAULT_TIGHT_GAP_DAYS));
    setFormError("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarX2 className="h-4 w-4" aria-hidden="true" />
          Exam calendars
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Exam Clash Detector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter every exam you have applied for, with its date or date window. The detector flags
          pairs that share a day outright and pairs so close together that travel and revision
          become impossible.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add an exam</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ecd-name">
              Exam name
            </label>
            <input
              id="ecd-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecd-start">
              First (or only) exam day
            </label>
            <input
              id="ecd-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecd-end">
              Last exam day (optional, for shift windows)
            </label>
            <input
              id="ecd-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecd-gap">
              Flag gaps of (days) or fewer
            </label>
            <input
              id="ecd-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              value={tightGap}
              onChange={(event) => setTightGap(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={addExam} className={`${PRIMARY_BTN} w-full`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add exam
            </button>
          </div>
        </div>
        {formError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formError}
          </p>
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
              Date clashes found
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.clashCount > 0
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? DASH : result.clashCount}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to run the check."
                : result.clashCount > 0
                  ? "At least two of your exams share a day — check admit-card shift dates immediately."
                  : `No overlapping dates across ${result.examCount} exams. ${result.tightCount} tight gap${result.tightCount === 1 ? "" : "s"} flagged.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the clash report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the exam list to the sample"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.clashes.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.clashes.map((clash) => (
              <li
                key={`${clash.first}-${clash.second}`}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {clash.first} and {clash.second} overlap on {clash.overlapDays} day
                {clash.overlapDays === 1 ? "" : "s"}.
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && result.tightPairs.length > 0 ? (
          <ul role="status" aria-live="polite" className="mt-4 space-y-2">
            {result.tightPairs.map((pair) => (
              <li
                key={`${pair.first}-${pair.second}`}
                className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                {pair.first} ends only {pair.gapDays} day{pair.gapDays === 1 ? "" : "s"} before{" "}
                {pair.second} — {pair.freeDays} fully free day{pair.freeDays === 1 ? "" : "s"}{" "}
                between them.
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Exam
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    From
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    To
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((exam) => (
                  <tr key={exam.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{exam.name}</td>
                    <td className="py-2 pr-3">{exam.start}</td>
                    <td className="py-2 pr-3">{exam.end}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeExam(exam.id)}
                        aria-label={`Remove ${exam.name}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--danger)] transition hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Multi-day windows should span the full shift window until your exact date is allotted on
        the admit card — a window overlap is a potential clash, not a confirmed one.
      </p>
    </main>
  );
}
