"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stethoscope } from "lucide-react";
import {
  NEET_MARKS_PER_CORRECT,
  NEET_OPTIONS_PER_QUESTION,
  NEET_PENALTY_PER_WRONG,
  NEET_SUBJECTS,
  NEET_TOTAL_QUESTIONS,
  buildGuessLadder,
  modelNeetScore,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n1 = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const n2 = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : "—");

const DEFAULTS = {
  totalQuestions: String(NEET_TOTAL_QUESTIONS),
  attempted: "150",
  accuracy: "88",
  guesses: "15",
  options: String(NEET_OPTIONS_PER_QUESTION),
  grace: "0",
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
  const [totalQuestions, setTotalQuestions] = useState(DEFAULTS.totalQuestions);
  const [attempted, setAttempted] = useState(DEFAULTS.attempted);
  const [accuracy, setAccuracy] = useState(DEFAULTS.accuracy);
  const [guesses, setGuesses] = useState(DEFAULTS.guesses);
  const [options, setOptions] = useState(DEFAULTS.options);
  const [grace, setGrace] = useState(DEFAULTS.grace);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(
    () => ({
      totalQuestions: toNumber(totalQuestions),
      attempted: toNumber(attempted),
      accuracyPercent: toNumber(accuracy),
      blindGuesses: toNumber(guesses),
      optionsRemaining: toNumber(options),
      graceMarks: toNumber(grace),
    }),
    [totalQuestions, attempted, accuracy, guesses, options, grace],
  );

  const result = useMemo(() => modelNeetScore(parsed), [parsed]);
  const ladder = useMemo(
    () => (result.error ? [] : buildGuessLadder(parsed, [0, 10, 20, 30, 45])),
    [parsed, result.error],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "NEET UG score projection (+4 correct / -1 wrong)",
      `Paper: ${result.totalQuestions} questions, max ${result.maxMarks} marks`,
      `Answered from knowledge: ${result.attempted} at ${pct(parsed.accuracyPercent)} accuracy`,
      `Blind guesses: ${result.blindGuesses} with ${parsed.optionsRemaining} options left`,
      `Left blank: ${result.unattempted}`,
      `Expected correct / wrong: ${n1(result.totalCorrect)} / ${n1(result.totalWrong)}`,
      `Marks gained: +${n1(result.marksGained)}`,
      `Marks lost to negative marking: ${result.marksLost > 0 ? "-" : ""}${n1(result.marksLost)}`,
      `Expected score: ${n1(result.expectedScore)} / ${result.maxMarks} (${pct(result.percentOfMax)})`,
      `Range on the guessed block: ${n1(result.worstCase)} to ${n1(result.bestCase)}`,
      `Break-even accuracy: ${pct(result.breakEvenAccuracyPercent)}`,
    ].join("\n");
  }, [ok, result, parsed]);

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
    setTotalQuestions(DEFAULTS.totalQuestions);
    setAttempted(DEFAULTS.attempted);
    setAccuracy(DEFAULTS.accuracy);
    setGuesses(DEFAULTS.guesses);
    setOptions(DEFAULTS.options);
    setGrace(DEFAULTS.grace);
    setCopied(false);
  };

  const rows = [
    ["Questions answered", ok ? `${n1(result.answered)} of ${result.totalQuestions}` : "—"],
    ["Left blank (no penalty)", ok ? n1(result.unattempted) : "—"],
    ["Expected correct answers", ok ? n1(result.totalCorrect) : "—"],
    ["Expected wrong answers", ok ? n1(result.totalWrong) : "—"],
    ["Marks gained (+4 each)", ok ? `+${n1(result.marksGained)}` : "—"],
    ["Marks lost (-1 each)", ok ? `${result.marksLost > 0 ? "-" : ""}${n1(result.marksLost)}` : "—"],
    ["Grace marks added", ok ? n1(result.graceMarks) : "—"],
    ["Score from known answers", ok ? n1(result.knowledgeScore) : "—"],
    ["Score contributed by guesses", ok ? signed(result.guessScore) : "—"],
    ["Overall accuracy on answered", ok ? pct(result.overallAccuracyPercent) : "—"],
    ["Percentage of maximum", ok ? pct(result.percentOfMax) : "—"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          NEET UG marking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Negative Marking Calculator NEET</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          NEET UG awards {NEET_MARKS_PER_CORRECT} marks for a correct answer and deducts{" "}
          {NEET_PENALTY_PER_WRONG} mark for a wrong one. Enter how many questions you answer with
          confidence and how many you guess, and see the score that scheme actually produces.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-total">
              Questions in the paper
            </label>
            <input
              id="neet-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              step="1"
              value={totalQuestions}
              onChange={(event) => setTotalQuestions(event.target.value)}
            />
            <p className={HELP_CLASS}>
              {NEET_SUBJECTS.map((subject) => `${subject.label} ${subject.questions}`).join(" · ")}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-attempted">
              Answered from knowledge
            </label>
            <input
              id="neet-attempted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={attempted}
              onChange={(event) => setAttempted(event.target.value)}
            />
            <p className={HELP_CLASS}>Questions you solve or recognise, not guesses.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-accuracy">
              Accuracy on those answers (%)
            </label>
            <input
              id="neet-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
            />
            <p className={HELP_CLASS}>Use your mock-test accuracy, not your target.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-guesses">
              Extra questions guessed
            </label>
            <input
              id="neet-guesses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={guesses}
              onChange={(event) => setGuesses(event.target.value)}
            />
            <p className={HELP_CLASS}>Questions answered without solving them.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-options">
              Options left standing on a guess
            </label>
            <select
              id="neet-options"
              className={`mt-2 ${INPUT_CLASS}`}
              value={options}
              onChange={(event) => setOptions(event.target.value)}
            >
              <option value="4">4 — pure blind guess</option>
              <option value="3">3 — one option eliminated</option>
              <option value="2">2 — two options eliminated</option>
              <option value="1">1 — certain (not a guess)</option>
            </select>
            <p className={HELP_CLASS}>Elimination is what makes guessing pay.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-grace">
              Grace marks for dropped questions
            </label>
            <input
              id="neet-grace"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={grace}
              onChange={(event) => setGrace(event.target.value)}
            />
            <p className={HELP_CLASS}>Marks NTA awards to everyone if a key is revised.</p>
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
              Expected NEET score
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {ok ? `${n1(result.expectedScore)} / ${result.maxMarks}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Between ${n1(result.worstCase)} and ${n1(result.bestCase)} depending on how the ${n1(result.blindGuesses)} guesses land`
                : "Fix the input above to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy NEET score projection"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Is guessing worth it?</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {ok ? (
            <>
              With {n2(parsed.optionsRemaining)} option{parsed.optionsRemaining === 1 ? "" : "s"} left, a guess
              is right {pct(result.guessHitRatePercent)} of the time and is worth{" "}
              <strong className="text-[var(--foreground)]">{signed(result.evPerGuess)} marks</strong> on average.
              {result.guessingIsWorthIt
                ? " That is positive, so guessing adds marks over a full paper."
                : " That is not positive, so leaving the question blank scores better on average."}{" "}
              Break-even accuracy for this scheme is {pct(result.breakEvenAccuracyPercent)} — answer only when
              you beat that.
            </>
          ) : (
            "—"
          )}
        </p>

        {ladder.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <caption className="sr-only">Expected score for different numbers of blind guesses</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Guesses</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Expected</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Gain</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Worst</th>
                  <th scope="col" className="py-2 text-right font-semibold">Best</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((row) => (
                  <tr key={row.blindGuesses} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.blindGuesses}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{n1(row.expectedScore)}</td>
                    <td
                      className={`py-2 pr-3 text-right ${row.gainOverNoGuess >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                    >
                      {signed(row.gainOverNoGuess)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n1(row.worstCase)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{n1(row.bestCase)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Expected values are averages over many papers, not a guaranteed score — one paper can land
        anywhere in the range shown. Confirm the question count and marking scheme in the NTA
        information bulletin for your exam year.
      </p>
    </main>
  );
}
