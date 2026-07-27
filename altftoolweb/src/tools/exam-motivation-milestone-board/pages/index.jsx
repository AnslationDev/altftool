"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Milestone, Plus, RotateCcw, Trash2 } from "lucide-react";

import { MAX_MILESTONES, computeMilestoneBoard } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_MILESTONES = [
  { name: "Syllabus mapped, books ready", done: true },
  { name: "First full pass of notes", done: false },
  { name: "First mock test attempted", done: false },
  { name: "Weak chapters reworked", done: false },
  { name: "Second mock above target score", done: false },
  { name: "Final revision round complete", done: false },
];

const DASH = "—";

const STATUS_COPY = {
  ahead: "Ahead of plan",
  "on-track": "On track",
  behind: "Behind plan",
};

function isoToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isoPlusDays(days) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function ToolHome() {
  const [startDate, setStartDate] = useState(isoPlusDays(-30));
  const [examDate, setExamDate] = useState(isoPlusDays(60));
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [copied, setCopied] = useState(false);

  const todayIso = isoToday();

  const result = useMemo(
    () =>
      computeMilestoneBoard({
        startIso: startDate,
        examIso: examDate,
        todayIso,
        milestones,
      }),
    [startDate, examDate, todayIso, milestones],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Exam milestone board — ${NUM.format(result.daysLeft)} days to exam`,
      `Progress: ${result.doneCount}/${result.milestoneCount} milestones (${result.progressPercent}%) — ${STATUS_COPY[result.status]}`,
      `Plan expects about ${result.expectedDoneCount} done by today (${result.cycleProgressPercent}% of the cycle elapsed)`,
      "",
      ...result.board.map(
        (m) =>
          `${m.done ? "[x]" : "[ ]"} ${m.index}. ${m.name} — target ${m.targetIso}${m.overdue ? " (overdue)" : ""}`,
      ),
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
    setStartDate(isoPlusDays(-30));
    setExamDate(isoPlusDays(60));
    setMilestones(DEFAULT_MILESTONES);
    setCopied(false);
  };

  const updateMilestone = (index, patch) => {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const rows = hasError
    ? [
        ["Milestones completed", DASH],
        ["Plan expects by today", DASH],
        ["Cycle elapsed", DASH],
        ["Days to exam", DASH],
      ]
    : [
        ["Milestones completed", `${result.doneCount} of ${result.milestoneCount}`],
        ["Plan expects by today", NUM.format(result.expectedDoneCount)],
        ["Cycle elapsed", `${result.cycleProgressPercent}% (${NUM.format(result.daysElapsed)} of ${NUM.format(result.totalDays)} days)`],
        ["Days to exam", NUM.format(result.daysLeft)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Milestone className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Motivation Milestone Board
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Break your preparation into a handful of milestones. The board spaces them evenly between
          your start date and exam day, gives each a target date, and tells you honestly whether
          you are ahead, on track or behind.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="emb-start">
              Preparation start date
            </label>
            <input
              id="emb-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emb-exam">
              Exam date
            </label>
            <input
              id="emb-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className={LABEL_CLASS}>Milestones (in order — tick them off as you go)</p>
          <div className="mt-2 space-y-2">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  id={`emb-done-${index}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={milestone.done}
                  onChange={(event) => updateMilestone(index, { done: event.target.checked })}
                  aria-label={`Mark milestone ${index + 1} as done`}
                />
                <label className="sr-only" htmlFor={`emb-name-${index}`}>
                  Milestone {index + 1} name
                </label>
                <input
                  id={`emb-name-${index}`}
                  className={INPUT_CLASS}
                  type="text"
                  value={milestone.name}
                  placeholder={`Milestone ${index + 1}`}
                  onChange={(event) => updateMilestone(index, { name: event.target.value })}
                />
                {milestones.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => setMilestones((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove milestone ${index + 1}`}
                    className={`${GHOST_BTN} shrink-0 px-3`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {milestones.length < MAX_MILESTONES ? (
            <button
              type="button"
              onClick={() => setMilestones((prev) => [...prev, { name: "", done: false }])}
              className={`${GHOST_BTN} mt-2`}
              aria-label="Add another milestone"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add milestone
            </button>
          ) : null}
        </div>
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
              Preparation progress
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.progressPercent}%`}
            </p>
            <p
              className={`mt-1 max-w-md text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.status === "behind"
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? "Fix the input above to build the board." : STATUS_COPY[result.status]}
            </p>
            {!hasError && result.nextMilestone ? (
              <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
                Next up: {result.nextMilestone.name} — target {result.nextMilestone.targetIso}.
              </p>
            ) : null}
            {!hasError && !result.nextMilestone ? (
              <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
                Every milestone is done — hold the level and walk in fresh.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the milestone board"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy board"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the board" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div
            className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="progressbar"
            aria-valuenow={result.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Share of milestones completed"
          >
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all motion-reduce:transition-none"
              style={{ width: `${result.progressPercent}%` }}
            />
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Milestone targets</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {result.board.map((m) => (
              <li
                key={m.index}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <span className={`font-semibold ${m.done ? "line-through opacity-60" : ""}`}>
                  {m.index}. {m.name}
                </span>
                <span
                  className={`text-right ${
                    m.overdue ? "font-semibold text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {m.done ? "done" : m.overdue ? `overdue · was ${m.targetIso}` : `target ${m.targetIso}`}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Target dates assume even pacing between your start date and the exam; real preparation is
        lumpy, so treat "behind" as a signal to re-plan, not a verdict. Milestones stay on this
        page only until you copy them out.
      </p>
    </main>
  );
}
