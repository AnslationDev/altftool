"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, Check, Copy, RotateCcw } from "lucide-react";

import {
  CUET_DEFAULT_EXAM_DATE,
  CUET_PATTERN,
  CUET_SUBJECT_DEFAULTS,
  DEFAULT_RETENTION_FLOOR,
  DEFAULT_STABILITY_DAYS,
  addDays,
  buildReadinessBoard,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};
const TONE_BAR = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

const makeSubjects = (todayISO) =>
  CUET_SUBJECT_DEFAULTS.map((subject) => ({
    id: subject.id,
    label: subject.label,
    total: String(subject.total),
    done: String(subject.done),
    lastRevised: addDays(todayISO, -subject.lastRevisedOffset),
  }));

export default function ToolHome() {
  const [today, setToday] = useState(() => toLocalISODate(new Date()));
  const [examDate, setExamDate] = useState(CUET_DEFAULT_EXAM_DATE);
  const [subjects, setSubjects] = useState(() => makeSubjects(toLocalISODate(new Date())));
  const [stability, setStability] = useState(String(DEFAULT_STABILITY_DAYS));
  const [floor, setFloor] = useState(String(DEFAULT_RETENTION_FLOOR));
  const [questions, setQuestions] = useState(String(CUET_PATTERN.questionsPerSubject));
  const [copied, setCopied] = useState(false);

  const board = useMemo(
    () =>
      buildReadinessBoard({
        todayISO: today,
        examISO: examDate,
        subjects: subjects.map((subject) => ({
          ...subject,
          total: toNumber(subject.total),
          done: toNumber(subject.done),
        })),
        stabilityDays: toNumber(stability),
        retentionFloor: toNumber(floor),
        questionsPerSubject: toNumber(questions),
      }),
    [today, examDate, subjects, stability, floor, questions],
  );

  const ok = !board.error;

  const updateSubject = (id, key, value) => {
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const markRevisedToday = (id) => {
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, lastRevised: today } : row)));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "CUET Exam Countdown",
      `As on ${today}, CUET on ${examDate}`,
      `${NUM0.format(board.daysLeft)} days to go`,
      `Average readiness: ${NUM.format(board.averageReadinessPercent)}% (${board.band.label})`,
      `Projected total: ${NUM.format(board.totalExpected)} of ${NUM0.format(board.totalMax)} marks`,
      "",
      "Subject readiness:",
    ];
    board.rows.forEach((row) => {
      lines.push(
        `  ${row.label}: ${NUM.format(row.readinessPercent)}% (coverage ${NUM.format(row.coveragePercent)}%, retention ${NUM.format(row.retentionPercent)}%) — ${
          row.revisionOverdue
            ? `revision overdue by ${NUM0.format(Math.abs(row.daysUntilRevisionDue))} days`
            : `next revision due ${row.revisionDueISO}`
        }`,
      );
    });
    return lines.join("\n");
  }, [ok, today, examDate, board]);

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
    const now = toLocalISODate(new Date());
    setToday(now);
    setExamDate(CUET_DEFAULT_EXAM_DATE);
    setSubjects(makeSubjects(now));
    setStability(String(DEFAULT_STABILITY_DAYS));
    setFloor(String(DEFAULT_RETENTION_FLOOR));
    setQuestions(String(CUET_PATTERN.questionsPerSubject));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
          CUET countdown
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">CUET Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days left to CUET with a readiness bar per subject that combines how much of the syllabus
          you have covered with how long ago you last revised it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Exam and model settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cuet-today">
              Today&apos;s date
            </label>
            <input
              id="cuet-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cuet-exam">
              CUET exam date
            </label>
            <input
              id="cuet-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cuet-stability">
              Memory stability (days)
            </label>
            <input
              id="cuet-stability"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={stability}
              onChange={(event) => setStability(event.target.value)}
              aria-describedby="cuet-stability-hint"
            />
            <p id="cuet-stability-hint" className="mt-1 text-xs text-[var(--muted-foreground)]">
              How slowly the material fades. Raise it for well-drilled subjects.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cuet-floor">
              Retention floor (0 to 1)
            </label>
            <input
              id="cuet-floor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.05"
              max="0.95"
              step="0.05"
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              aria-describedby="cuet-floor-hint"
            />
            <p id="cuet-floor-hint" className="mt-1 text-xs text-[var(--muted-foreground)]">
              Revision falls due when retention drops to this level.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cuet-questions">
              Questions on each subject paper
            </label>
            <input
              id="cuet-questions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your subject papers</h2>
        <div className="mt-4 space-y-6">
          {subjects.map((subject) => (
            <div key={subject.id}>
              <p className="text-sm font-semibold">{subject.label}</p>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cuet-total-${subject.id}`}>
                    Units in the syllabus
                  </label>
                  <input
                    id={`cuet-total-${subject.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={subject.total}
                    onChange={(event) => updateSubject(subject.id, "total", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cuet-done-${subject.id}`}>
                    Units studied
                  </label>
                  <input
                    id={`cuet-done-${subject.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={subject.done}
                    onChange={(event) => updateSubject(subject.id, "done", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cuet-rev-${subject.id}`}>
                    Last revised on
                  </label>
                  <input
                    id={`cuet-rev-${subject.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={subject.lastRevised}
                    onChange={(event) => updateSubject(subject.id, "lastRevised", event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => markRevisedToday(subject.id)}
                    className={`${GHOST_BTN} w-full`}
                    aria-label={`Mark ${subject.label} as revised today`}
                  >
                    Revised today
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {board.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {board.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {ok ? `CUET on ${examDate}` : "CUET countdown"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM0.format(board.daysLeft)} days` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM0.format(board.countdown.weeks)} weeks ${NUM0.format(board.countdown.spareDays)} days · ${NUM0.format(board.rows.length)} subject papers`
                : "Fix the inputs above to see the countdown."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy CUET readiness summary"
              className={GHOST_BTN}
              disabled={!ok}
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
            [
              "Average readiness",
              ok ? `${NUM.format(board.averageReadinessPercent)}% — ${board.band.label}` : DASH,
            ],
            [
              "Projected total",
              ok
                ? `${NUM.format(board.totalExpected)} of ${NUM0.format(board.totalMax)} marks (${NUM.format(board.totalExpectedPercent)}%)`
                : DASH,
            ],
            ["Weakest subject", ok ? board.weakest.label : DASH],
            [
              "Revisions overdue",
              ok
                ? board.overdue.length === 0
                  ? "None"
                  : board.overdue.map((row) => row.label).join(", ")
                : DASH,
            ],
            [
              "Guessing breaks even at",
              ok ? `${NUM.format(board.breakEvenReadinessPercent)}% readiness` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Readiness bars</h2>
          <ul className="mt-4 space-y-5">
            {board.rows.map((row) => (
              <li key={row.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold">{row.label}</span>
                  <span className={`font-semibold ${TONE_TEXT[row.band.tone] || ""}`}>
                    {NUM.format(row.readinessPercent)}% · {row.band.label}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${row.label} readiness ${NUM.format(row.readinessPercent)} percent`}
                >
                  <span
                    className={`block h-full ${TONE_BAR[row.band.tone] || "bg-[var(--primary)]"}`}
                    style={{ width: `${Math.max(0, Math.min(100, row.readinessPercent))}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                  Coverage {NUM.format(row.coveragePercent)}% · retention{" "}
                  {NUM.format(row.retentionPercent)}% · last revised{" "}
                  {NUM0.format(row.daysSinceRevision)} days ago · projected{" "}
                  {NUM.format(row.expectedMarks)} of {NUM0.format(row.maxMarks)} marks
                </p>
                {row.revisionOverdue ? (
                  <p className="mt-1.5 text-xs font-semibold text-[var(--danger)]">
                    Revision overdue by {NUM0.format(Math.abs(row.daysUntilRevisionDue))} days — it
                    was due on {row.revisionDueISO}. {row.band.note}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                    Next revision due on {row.revisionDueISO}, in{" "}
                    {NUM0.format(row.daysUntilRevisionDue)} days.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        CUET marks {CUET_PATTERN.correctMark} for a correct answer and {CUET_PATTERN.negativeMark}{" "}
        for a wrong one, so a projected total can be negative when readiness falls below one sixth.
        NTA caps a candidate at {CUET_PATTERN.maxSubjects} subject papers and revises the pattern
        between cycles — confirm the question count, duration and exam date in the information
        bulletin for your year. Readiness here is a study model, not a prediction of your result.
      </p>
    </main>
  );
}
