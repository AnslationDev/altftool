"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, Copy, RotateCcw } from "lucide-react";
import {
  BANKING_EXAM_PATTERNS,
  BANKING_OPTIONS_PER_QUESTION,
  BANKING_PENALTY_FRACTION,
  modelBankingScore,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : "—");

const DEFAULT_PATTERN = BANKING_EXAM_PATTERNS[0].key;
const DEFAULT_GUESSES = "6";
const DEFAULT_OPTIONS = String(BANKING_OPTIONS_PER_QUESTION);
const DEFAULT_CUTOFF = "55";

/** Starting attempt plan for each pattern, keyed by section. */
const SEED_ATTEMPTS = {
  english: { attempted: "22", accuracy: "80" },
  quant: { attempted: "24", accuracy: "85" },
  numerical: { attempted: "24", accuracy: "85" },
  reasoning: { attempted: "28", accuracy: "90" },
};

const seedFor = (pattern) => {
  const seed = {};
  for (const section of pattern.sections) {
    const preset = SEED_ATTEMPTS[section.key] ?? { attempted: "0", accuracy: "80" };
    seed[section.key] = { ...preset };
  }
  return seed;
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
  const [patternKey, setPatternKey] = useState(DEFAULT_PATTERN);
  const [attempts, setAttempts] = useState(() => seedFor(BANKING_EXAM_PATTERNS[0]));
  const [guesses, setGuesses] = useState(DEFAULT_GUESSES);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [cutoff, setCutoff] = useState(DEFAULT_CUTOFF);
  const [copied, setCopied] = useState(false);

  const pattern = BANKING_EXAM_PATTERNS.find((item) => item.key === patternKey) ?? BANKING_EXAM_PATTERNS[0];

  const changePattern = (key) => {
    const next = BANKING_EXAM_PATTERNS.find((item) => item.key === key) ?? BANKING_EXAM_PATTERNS[0];
    setPatternKey(next.key);
    setAttempts(seedFor(next));
    setCopied(false);
  };

  const setField = (sectionKey, field, value) => {
    setAttempts((current) => ({
      ...current,
      [sectionKey]: { ...(current[sectionKey] ?? { attempted: "0", accuracy: "80" }), [field]: value },
    }));
  };

  const result = useMemo(
    () =>
      modelBankingScore({
        sections: pattern.sections.map((section) => ({
          key: section.key,
          label: section.label,
          questions: section.questions,
          marksPerQuestion: section.marksPerQuestion,
          attempted: toNumber(attempts[section.key]?.attempted ?? "0"),
          accuracyPercent: toNumber(attempts[section.key]?.accuracy ?? "0"),
        })),
        penaltyFraction: BANKING_PENALTY_FRACTION,
        blindGuesses: toNumber(guesses),
        optionsRemaining: toNumber(options),
        guessMarksPerQuestion: pattern.sections[0].marksPerQuestion,
        cutoff: toNumber(cutoff),
      }),
    [pattern, attempts, guesses, options, cutoff],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `${pattern.label} net score (one-fourth penalty for wrong answers)`,
      ...result.sections.map(
        (section) =>
          `${section.label}: ${n(section.attempted)}/${section.questions} attempted, ${n(section.correct)} correct, ${n(section.wrong)} wrong → ${n(section.net)} marks`,
      ),
      `Blind guesses: ${n(result.blindGuesses)} → ${signed(result.guessNet)} marks`,
      `Answered ${n(result.answered)} of ${result.totalQuestions}, left blank ${n(result.unattempted)}`,
      `Marks gained: +${n(result.totalGained)}`,
      `Marks lost to the penalty: -${n(result.totalLost)}`,
      `Net score: ${n(result.netScore)} / ${n(result.maxMarks)} (${pct(result.percentOfMax)})`,
      `Range: ${n(result.worstCase)} to ${n(result.bestCase)}`,
      `Break-even accuracy: ${pct(result.breakEvenAccuracyPercent)}`,
      `Cutoff ${n(result.cutoff)}: ${result.clearsCutoff ? "cleared" : `short by ${n(result.cutoffGap)}`}`,
    ].join("\n");
  }, [ok, result, pattern]);

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
    setPatternKey(DEFAULT_PATTERN);
    setAttempts(seedFor(BANKING_EXAM_PATTERNS[0]));
    setGuesses(DEFAULT_GUESSES);
    setOptions(DEFAULT_OPTIONS);
    setCutoff(DEFAULT_CUTOFF);
    setCopied(false);
  };

  const breakdown = [
    ["Questions answered", ok ? `${n(result.answered)} of ${result.totalQuestions}` : "—"],
    ["Left blank (no penalty)", ok ? n(result.unattempted) : "—"],
    ["Expected correct answers", ok ? n(result.totalCorrect) : "—"],
    ["Expected wrong answers", ok ? n(result.totalWrong) : "—"],
    ["Marks gained", ok ? `+${n(result.totalGained)}` : "—"],
    ["Marks lost to the penalty", ok ? `-${n(result.totalLost)}` : "—"],
    ["Score from solved questions", ok ? n(result.sectionNet) : "—"],
    ["Score added by blind guessing", ok ? signed(result.guessNet) : "—"],
    ["Overall accuracy on answered", ok ? pct(result.overallAccuracyPercent) : "—"],
    ["Percentage of maximum", ok ? pct(result.percentOfMax) : "—"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Banknote className="h-4 w-4" aria-hidden="true" />
          IBPS &amp; SBI marking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Negative Marking Calculator Banking</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Bank objective tests deduct one-fourth of a question&apos;s marks for a wrong answer. Enter
          your attempts and accuracy per section and see the net score that survives the penalty.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="bank-pattern">
          Exam pattern
        </label>
        <select
          id="bank-pattern"
          className={`mt-2 ${INPUT_CLASS}`}
          value={patternKey}
          onChange={(event) => changePattern(event.target.value)}
        >
          {BANKING_EXAM_PATTERNS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label} — {item.sections.reduce((sum, s) => sum + s.questions, 0)} questions,{" "}
              {item.durationMinutes} min
            </option>
          ))}
        </select>
        <p className={HELP_CLASS}>
          Sectional timing applies in most prelims papers, so plan attempts section by section.
        </p>

        <div className="mt-5 space-y-5">
          {pattern.sections.map((section) => (
            <div key={section.key}>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {section.label}{" "}
                <span className="font-normal text-[var(--muted-foreground)]">
                  — {section.questions} questions · {section.minutes} min
                </span>
              </p>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bank-att-${section.key}`}>
                    Questions attempted
                  </label>
                  <input
                    id={`bank-att-${section.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={section.questions}
                    step="1"
                    value={attempts[section.key]?.attempted ?? "0"}
                    onChange={(event) => setField(section.key, "attempted", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bank-acc-${section.key}`}>
                    Accuracy (%)
                  </label>
                  <input
                    id={`bank-acc-${section.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={attempts[section.key]?.accuracy ?? "0"}
                    onChange={(event) => setField(section.key, "accuracy", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-guesses">
              Extra questions guessed
            </label>
            <input
              id="bank-guesses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={guesses}
              onChange={(event) => setGuesses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-options">
              Options left standing on a guess
            </label>
            <select
              id="bank-options"
              className={`mt-2 ${INPUT_CLASS}`}
              value={options}
              onChange={(event) => setOptions(event.target.value)}
            >
              <option value="5">5 — pure blind guess</option>
              <option value="4">4 — one option ruled out</option>
              <option value="3">3 — two ruled out</option>
              <option value="2">2 — down to a coin flip</option>
              <option value="1">1 — certain (not a guess)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bank-cutoff">
              Cutoff you are aiming at
            </label>
            <input
              id="bank-cutoff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={cutoff}
              onChange={(event) => setCutoff(event.target.value)}
            />
            <p className={HELP_CLASS}>
              Cutoffs are published only after the result and vary by state and category — use last
              year&apos;s as an estimate.
            </p>
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
              Net score after penalty
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n(result.netScore)} / ${n(result.maxMarks)}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n(result.worstCase)} to ${n(result.bestCase)} depending on the ${n(result.blindGuesses)} guesses`
                : "Fix the input above to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy bank exam net score"
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

        {ok && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              result.clearsCutoff
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.clearsCutoff
              ? `Clears the ${n(result.cutoff)} cutoff by ${n(result.netScore - result.cutoff)} marks.`
              : `Short of the ${n(result.cutoff)} cutoff by ${n(result.cutoffGap)} marks.`}
          </p>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <caption className="sr-only">Section-wise net score</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Section</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Attempted</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Correct</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Lost</th>
                <th scope="col" className="py-2 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.sections : []).map((section) => (
                <tr key={section.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{section.label}</td>
                  <td className="py-2 pr-3 text-right">
                    {n(section.attempted)}/{section.questions}
                  </td>
                  <td className="py-2 pr-3 text-right">{n(section.correct)}</td>
                  <td className="py-2 pr-3 text-right text-[var(--danger)]">-{n(section.lost)}</td>
                  <td className="py-2 text-right font-semibold">{n(section.net)}</td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={5}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        <h2 className="text-base font-semibold">The guessing maths</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {ok ? (
            <>
              A guess with {n(toNumber(options))} option{toNumber(options) === 1 ? "" : "s"} left is right{" "}
              {pct(result.guessHitRatePercent)} of the time and is worth{" "}
              <strong className="text-[var(--foreground)]">{signed(result.evPerGuess)} marks</strong> on average.
              {result.guessingIsNeutral
                ? " That is exactly zero — the classic five-option, quarter-penalty combination makes blind guessing pointless on average while still adding variance to your score."
                : result.guessingIsWorthIt
                  ? " That is positive, so these guesses add marks over a full paper."
                  : " That is negative, so leaving the question blank scores better."}{" "}
              Break-even accuracy is {pct(result.breakEvenAccuracyPercent)}.
            </>
          ) : (
            "—"
          )}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Section sizes and marks change between recruitment cycles, and the
        penalty does not apply to descriptive papers. Confirm the pattern and the penalty clause in
        the official advertisement for your cycle.
      </p>
    </main>
  );
}
