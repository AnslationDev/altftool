"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import {
  DEFAULT_BUFFER_PERCENT,
  DEFAULT_SECONDS_PER_ANSWER,
  MAX_BUFFER_PERCENT,
  MAX_SECONDS_PER_ANSWER,
  MIN_SECONDS_PER_ANSWER,
  STRATEGIES,
  computeTransferPlan,
  formatSeconds,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  examMinutes: "180",
  totalQuestions: "180",
  secondsPerAnswer: String(DEFAULT_SECONDS_PER_ANSWER),
  bufferPercent: String(DEFAULT_BUFFER_PERCENT),
  strategy: "end",
  batches: "4",
};

const DASH = "—";

const toNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

export default function ToolHome() {
  const [examMinutes, setExamMinutes] = useState(DEFAULTS.examMinutes);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULTS.totalQuestions);
  const [secondsPerAnswer, setSecondsPerAnswer] = useState(DEFAULTS.secondsPerAnswer);
  const [bufferPercent, setBufferPercent] = useState(DEFAULTS.bufferPercent);
  const [strategy, setStrategy] = useState(DEFAULTS.strategy);
  const [batches, setBatches] = useState(DEFAULTS.batches);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      computeTransferPlan({
        examMinutes: toNumber(examMinutes),
        totalQuestions: toNumber(totalQuestions),
        secondsPerAnswer: toNumber(secondsPerAnswer),
        bufferPercent: toNumber(bufferPercent),
        strategy,
        batches: toNumber(batches),
      }),
    [examMinutes, totalQuestions, secondsPerAnswer, bufferPercent, strategy, batches],
  );

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "OMR answer-transfer plan",
      `Exam: ${NUM.format(plan.examMinutes)} min, ${NUM.format(plan.totalQuestions)} questions`,
      `Strategy: ${plan.strategy.label}`,
      `Reserve for OMR transfer: ${formatSeconds(plan.transferSeconds)}`,
      `Time left for solving: ${formatSeconds(plan.solvingSeconds)}`,
      `Per question while solving: ${formatSeconds(plan.secondsPerQuestionSolving)}`,
      `Stop solving at the ${NUM.format(plan.startTransferAtMinute)} minute mark`,
      `Batches: ${NUM.format(plan.effectiveBatches)} × ${NUM.format(plan.questionsPerBatch)} questions (${formatSeconds(plan.batchSeconds)} each)`,
    ].join("\n");
  }, [hasError, plan]);

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
    setExamMinutes(DEFAULTS.examMinutes);
    setTotalQuestions(DEFAULTS.totalQuestions);
    setSecondsPerAnswer(DEFAULTS.secondsPerAnswer);
    setBufferPercent(DEFAULTS.bufferPercent);
    setStrategy(DEFAULTS.strategy);
    setBatches(DEFAULTS.batches);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Time left for solving", DASH],
        ["Per question while solving", DASH],
        ["Stop solving at", DASH],
        ["Batch size", DASH],
      ]
    : [
        ["Raw bubbling time", formatSeconds(plan.rawTransferSeconds)],
        ["Safety buffer", formatSeconds(plan.bufferSeconds)],
        ["Time left for solving", formatSeconds(plan.solvingSeconds)],
        ["Per question while solving", formatSeconds(plan.secondsPerQuestionSolving)],
        ["Stop solving at", `${NUM.format(plan.startTransferAtMinute)} min on the clock`],
        [
          "Batches",
          `${NUM.format(plan.effectiveBatches)} × ${NUM.format(plan.questionsPerBatch)} questions (${formatSeconds(plan.batchSeconds)} each)`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          OMR Practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          OMR Rough Work Time Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many minutes of your exam to reserve for transferring answers from the
          question booklet to the OMR sheet — and the exact clock minute to stop solving.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="omr-exam-min">
              Exam duration (minutes)
            </label>
            <input
              id="omr-exam-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={examMinutes}
              onChange={(event) => setExamMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="omr-questions">
              Answers to transfer
            </label>
            <input
              id="omr-questions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={totalQuestions}
              onChange={(event) => setTotalQuestions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="omr-sec-per">
              Seconds per bubble ({MIN_SECONDS_PER_ANSWER}–{MAX_SECONDS_PER_ANSWER})
            </label>
            <input
              id="omr-sec-per"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_SECONDS_PER_ANSWER}
              max={MAX_SECONDS_PER_ANSWER}
              step="0.5"
              value={secondsPerAnswer}
              onChange={(event) => setSecondsPerAnswer(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Most candidates take 3–5 seconds to darken one bubble carefully.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="omr-buffer">
              Safety buffer (0–{MAX_BUFFER_PERCENT}%)
            </label>
            <input
              id="omr-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_BUFFER_PERCENT}
              step="5"
              value={bufferPercent}
              onChange={(event) => setBufferPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="omr-strategy">
              Transfer strategy
            </label>
            <select
              id="omr-strategy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={strategy}
              onChange={(event) => setStrategy(event.target.value)}
            >
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {strategy === "section" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="omr-batches">
                Number of batches
              </label>
              <input
                id="omr-batches"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={batches}
                onChange={(event) => setBatches(event.target.value)}
              />
            </div>
          ) : null}
        </div>
        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            {plan.strategy.note}
          </p>
        ) : null}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Reserve for OMR transfer
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatSeconds(plan.transferSeconds)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `Bubbling ${NUM.format(plan.totalQuestions)} answers plus your safety buffer.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the OMR transfer plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning heuristic, not an official rule — time yourself on a printed practice OMR sheet to
        find your real per-bubble speed, then plug it in here before every mock test.
      </p>
    </main>
  );
}
