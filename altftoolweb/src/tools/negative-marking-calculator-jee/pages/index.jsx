"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sigma } from "lucide-react";
import {
  JEE_MARKS_PER_CORRECT,
  JEE_MCQ_TOTAL,
  JEE_NVT_TOTAL,
  JEE_OPTIONS_PER_MCQ,
  JEE_PENALTY_PER_WRONG,
  JEE_SUBJECTS,
  maxProfitableOptions,
  modelJeeScore,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : "—");

const DEFAULTS = {
  mcqTotal: String(JEE_MCQ_TOTAL),
  mcqAttempted: "42",
  mcqAccuracy: "80",
  mcqGuesses: "6",
  mcqOptions: String(JEE_OPTIONS_PER_MCQ),
  nvtTotal: String(JEE_NVT_TOTAL),
  nvtAttempted: "9",
  nvtAccuracy: "70",
  nvtGuesses: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HELP_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mcqTotal, setMcqTotal] = useState(DEFAULTS.mcqTotal);
  const [mcqAttempted, setMcqAttempted] = useState(DEFAULTS.mcqAttempted);
  const [mcqAccuracy, setMcqAccuracy] = useState(DEFAULTS.mcqAccuracy);
  const [mcqGuesses, setMcqGuesses] = useState(DEFAULTS.mcqGuesses);
  const [mcqOptions, setMcqOptions] = useState(DEFAULTS.mcqOptions);
  const [nvtTotal, setNvtTotal] = useState(DEFAULTS.nvtTotal);
  const [nvtAttempted, setNvtAttempted] = useState(DEFAULTS.nvtAttempted);
  const [nvtAccuracy, setNvtAccuracy] = useState(DEFAULTS.nvtAccuracy);
  const [nvtGuesses, setNvtGuesses] = useState(DEFAULTS.nvtGuesses);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      modelJeeScore({
        mcqTotal: toNumber(mcqTotal),
        mcqAttempted: toNumber(mcqAttempted),
        mcqAccuracyPercent: toNumber(mcqAccuracy),
        mcqGuesses: toNumber(mcqGuesses),
        mcqOptionsRemaining: toNumber(mcqOptions),
        nvtTotal: toNumber(nvtTotal),
        nvtAttempted: toNumber(nvtAttempted),
        nvtAccuracyPercent: toNumber(nvtAccuracy),
        nvtGuesses: toNumber(nvtGuesses),
      }),
    [
      mcqTotal,
      mcqAttempted,
      mcqAccuracy,
      mcqGuesses,
      mcqOptions,
      nvtTotal,
      nvtAttempted,
      nvtAccuracy,
      nvtGuesses,
    ],
  );

  const ok = !result.error;
  const profitableOptions = maxProfitableOptions();

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "JEE Main raw score projection (+4 correct / -1 wrong)",
      `Paper: ${result.totalQuestions} questions, max ${result.maxMarks} marks`,
      `Section A (MCQ): ${n(result.mcqCorrect)} correct, ${n(result.mcqWrong)} wrong → ${n(result.mcqScore)} marks`,
      `Section B (numerical): ${n(result.nvtCorrect)} correct, ${n(result.nvtWrong)} wrong → ${n(result.nvtScore)} marks`,
      `Left blank: ${n(result.unattempted)}`,
      `Marks gained: +${n(result.marksGained)}`,
      `Marks lost to negative marking: -${n(result.marksLost)}`,
      `Expected raw score: ${n(result.expectedScore)} / ${result.maxMarks} (${pct(result.percentOfMax)})`,
      `Range across the ${n(result.guessCount)} guesses: ${n(result.worstCase)} to ${n(result.bestCase)}`,
      `Break-even accuracy: ${pct(result.breakEvenAccuracyPercent)}`,
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

  const reset = () => {
    setMcqTotal(DEFAULTS.mcqTotal);
    setMcqAttempted(DEFAULTS.mcqAttempted);
    setMcqAccuracy(DEFAULTS.mcqAccuracy);
    setMcqGuesses(DEFAULTS.mcqGuesses);
    setMcqOptions(DEFAULTS.mcqOptions);
    setNvtTotal(DEFAULTS.nvtTotal);
    setNvtAttempted(DEFAULTS.nvtAttempted);
    setNvtAccuracy(DEFAULTS.nvtAccuracy);
    setNvtGuesses(DEFAULTS.nvtGuesses);
    setCopied(false);
  };

  const breakdown = [
    ["Questions answered", ok ? `${n(result.answered)} of ${result.totalQuestions}` : "—"],
    ["Left blank (no penalty)", ok ? n(result.unattempted) : "—"],
    ["Section A score (MCQ)", ok ? n(result.mcqScore) : "—"],
    ["Section B score (numerical)", ok ? n(result.nvtScore) : "—"],
    ["Expected correct answers", ok ? n(result.totalCorrect) : "—"],
    ["Expected wrong answers", ok ? n(result.totalWrong) : "—"],
    ["Marks gained (+4 each)", ok ? `+${n(result.marksGained)}` : "—"],
    ["Marks lost (-1 each)", ok ? `-${n(result.marksLost)}` : "—"],
    ["Score from solved questions only", ok ? n(result.knownScore) : "—"],
    ["Overall accuracy on answered", ok ? pct(result.overallAccuracyPercent) : "—"],
    ["Percentage of maximum", ok ? pct(result.percentOfMax) : "—"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sigma className="h-4 w-4" aria-hidden="true" />
          JEE Main marking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Negative Marking Calculator JEE</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          JEE Main gives {JEE_MARKS_PER_CORRECT} marks per correct answer and takes{" "}
          {JEE_PENALTY_PER_WRONG} back for a wrong one — in the numerical section too. Model Section A
          and Section B separately and see what your attempt strategy is really worth.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Section A — multiple choice</h2>
        <p className={HELP_CLASS}>
          {JEE_SUBJECTS.map((subject) => `${subject.label} ${subject.mcq}`).join(" · ")} — four options each.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-mcq-total">
              MCQs in the paper
            </label>
            <input
              id="jee-mcq-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="1"
              value={mcqTotal}
              onChange={(event) => setMcqTotal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-mcq-attempted">
              MCQs solved
            </label>
            <input
              id="jee-mcq-attempted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={mcqAttempted}
              onChange={(event) => setMcqAttempted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-mcq-accuracy">
              Accuracy on solved MCQs (%)
            </label>
            <input
              id="jee-mcq-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={mcqAccuracy}
              onChange={(event) => setMcqAccuracy(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-mcq-guesses">
              MCQs guessed
            </label>
            <input
              id="jee-mcq-guesses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={mcqGuesses}
              onChange={(event) => setMcqGuesses(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jee-mcq-options">
              Options left standing on a guess
            </label>
            <select
              id="jee-mcq-options"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mcqOptions}
              onChange={(event) => setMcqOptions(event.target.value)}
            >
              <option value="4">4 — pure blind guess</option>
              <option value="3">3 — one option ruled out</option>
              <option value="2">2 — down to a coin flip</option>
              <option value="1">1 — certain (not a guess)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Section B — numerical value</h2>
        <p className={HELP_CLASS}>
          Answers are typed in, so there is nothing to guess between — a hunch here is a straight -1.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-nvt-total">
              Numerical questions in the paper
            </label>
            <input
              id="jee-nvt-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="1"
              value={nvtTotal}
              onChange={(event) => setNvtTotal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-nvt-attempted">
              Numerical questions solved
            </label>
            <input
              id="jee-nvt-attempted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={nvtAttempted}
              onChange={(event) => setNvtAttempted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-nvt-accuracy">
              Accuracy on those (%)
            </label>
            <input
              id="jee-nvt-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={nvtAccuracy}
              onChange={(event) => setNvtAccuracy(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-nvt-guesses">
              Numerical answers typed on a hunch
            </label>
            <input
              id="jee-nvt-guesses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={nvtGuesses}
              onChange={(event) => setNvtGuesses(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Expected raw score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n(result.expectedScore)} / ${result.maxMarks}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n(result.worstCase)} to ${n(result.bestCase)} depending on how the ${n(result.guessCount)} guesses land`
                : "Fix the input above to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy JEE Main score projection"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a guess is worth</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">One Section A guess</dt>
            <dd
              className={`text-right font-semibold ${ok && result.mcqGuessingIsWorthIt ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
            >
              {ok ? `${signed(result.mcqEvPerGuess)} marks` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">One Section B guess</dt>
            <dd className="text-right font-semibold text-[var(--danger)]">
              {ok ? `${signed(result.nvtEvPerGuess)} marks` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Chance a Section A guess is right</dt>
            <dd className="text-right font-semibold">{ok ? pct(result.mcqGuessHitRatePercent) : "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Break-even accuracy</dt>
            <dd className="text-right font-semibold">{ok ? pct(result.breakEvenAccuracyPercent) : "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Guessing pays while options left are</dt>
            <dd className="text-right font-semibold">
              {Number.isFinite(profitableOptions) ? `${profitableOptions} or fewer` : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Because +4 and -1 are five marks apart, a four-option MCQ guess is worth a small positive
          amount, but a typed numerical answer you have not solved is a guaranteed -1 — there is no
          option set to be lucky within.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is the raw score out of {result.maxMarks || 300}. The NTA score on your JEE Main
        scorecard is a normalised percentile across shifts and cannot be derived from raw marks.
        Verify the pattern in the NTA information bulletin for your exam year.
      </p>
    </main>
  );
}
