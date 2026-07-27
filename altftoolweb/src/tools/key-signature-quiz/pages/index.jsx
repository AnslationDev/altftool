"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Music, RotateCcw } from "lucide-react";

import {
  FLAT_MNEMONIC,
  MAX_ACCIDENTALS,
  SHARP_MNEMONIC,
  allSignatures,
  buildQuiz,
  gradeQuiz,
  keysForSignature,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  count: "4",
  type: "sharp",
  questionCount: "8",
  mode: "major",
  useSharps: true,
  useFlats: true,
  seed: 20260728,
};

const DASH = "—";

export default function ToolHome() {
  const [count, setCount] = useState(DEFAULTS.count);
  const [type, setType] = useState(DEFAULTS.type);
  const [questionCount, setQuestionCount] = useState(DEFAULTS.questionCount);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [useSharps, setUseSharps] = useState(DEFAULTS.useSharps);
  const [useFlats, setUseFlats] = useState(DEFAULTS.useFlats);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [answers, setAnswers] = useState({});
  const [copied, setCopied] = useState(false);

  const lookup = useMemo(
    () => keysForSignature({ count: count === "" ? NaN : Number(count), type }),
    [count, type],
  );

  const quiz = useMemo(
    () =>
      buildQuiz({
        seed,
        questionCount: questionCount === "" ? NaN : Number(questionCount),
        mode,
        useSharps,
        useFlats,
      }),
    [seed, questionCount, mode, useSharps, useFlats],
  );

  const score = useMemo(
    () => (quiz.error ? { error: quiz.error } : gradeQuiz({ questions: quiz.questions, answers })),
    [quiz, answers],
  );

  const table = useMemo(() => allSignatures(), []);

  const summary = useMemo(() => {
    if (score.error) return "";
    return [
      "Key Signature Quiz",
      `Score: ${score.correct} of ${score.total} correct`,
      `Answered: ${score.answered} of ${score.total}`,
      `Accuracy on answered questions: ${NUM.format(score.percent)}%`,
      lookup.error ? "" : `Reference: ${lookup.count} ${lookup.type} = ${lookup.major} major / ${lookup.minor} minor`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [score, lookup]);

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
    setCount(DEFAULTS.count);
    setType(DEFAULTS.type);
    setQuestionCount(DEFAULTS.questionCount);
    setMode(DEFAULTS.mode);
    setUseSharps(DEFAULTS.useSharps);
    setUseFlats(DEFAULTS.useFlats);
    setSeed(DEFAULTS.seed);
    setAnswers({});
    setCopied(false);
  };

  const newQuiz = () => {
    setSeed((value) => (value + 7919) % 2147483647);
    setAnswers({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music className="h-4 w-4" aria-hidden="true" />
          Music theory
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Key Signature Quiz</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Read a signature of sharps or flats and name the major or minor key. Every answer shows the
          circle-of-fifths rule that gets you there without counting on your fingers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Look up a signature</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ksq-count">
              Number of accidentals (0–{MAX_ACCIDENTALS})
            </label>
            <input
              id="ksq-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_ACCIDENTALS}
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksq-type">
              Accidental type
            </label>
            <select
              id="ksq-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="sharp">Sharps (♯)</option>
              <option value="flat">Flats (♭)</option>
              <option value="none">No accidentals</option>
            </select>
          </div>
        </div>

        {lookup.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {lookup.error}
          </p>
        ) : null}

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Major key
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {lookup.error ? DASH : `${lookup.major} major`}
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Relative minor", lookup.error ? DASH : `${lookup.minor} minor`],
              [
                "Accidentals in order",
                lookup.error || lookup.accidentals.length === 0
                  ? lookup.error
                    ? DASH
                    : "none"
                  : lookup.accidentals.join("  "),
              ],
              ["How to read it", lookup.error ? DASH : lookup.rule],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-semibold sm:max-w-[62%] sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Quiz score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {score.error ? DASH : `${score.correct} / ${score.total}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {score.error
                ? "Fix the quiz settings to start scoring."
                : `${score.answered} answered · ${NUM.format(score.percent)}% accuracy so far`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy quiz score"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ksq-qcount">
              Questions
            </label>
            <input
              id="ksq-qcount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={questionCount}
              onChange={(event) => {
                setQuestionCount(event.target.value);
                setAnswers({});
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksq-mode">
              Ask for
            </label>
            <select
              id="ksq-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setAnswers({});
              }}
            >
              <option value="major">Major keys</option>
              <option value="minor">Minor keys</option>
              <option value="both">Mixed major and minor</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Include signatures</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm" htmlFor="ksq-sharps">
              <input
                id="ksq-sharps"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={useSharps}
                onChange={(event) => {
                  setUseSharps(event.target.checked);
                  setAnswers({});
                }}
              />
              Sharp signatures
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 text-sm" htmlFor="ksq-flats">
              <input
                id="ksq-flats"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={useFlats}
                onChange={(event) => {
                  setUseFlats(event.target.checked);
                  setAnswers({});
                }}
              />
              Flat signatures
            </label>
          </div>
        </fieldset>

        <button type="button" onClick={newQuiz} className={`mt-4 ${PRIMARY_BTN}`}>
          New question set
        </button>

        {quiz.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {quiz.error}
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {quiz.questions.map((question, i) => {
              const given = answers[question.id];
              const result = score.results ? score.results[i] : null;
              return (
                <li
                  key={question.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <p className="text-sm font-semibold">
                    {question.index}. {question.prompt}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const chosen = given === option;
                      const isAnswer = option === question.answer;
                      const tone = !given
                        ? "border-[var(--border)] text-[var(--foreground)]"
                        : isAnswer
                          ? "border-[var(--success)] text-[var(--success)]"
                          : chosen
                            ? "border-[var(--danger)] text-[var(--danger)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)]";
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={chosen}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [question.id]: option }))
                          }
                          className={`min-h-11 rounded-md border px-3 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${tone}`}
                        >
                          {option} {question.askMode}
                        </button>
                      );
                    })}
                  </div>
                  {result && result.answeredFlag ? (
                    <p
                      className={`mt-3 text-xs leading-5 ${result.correct ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                    >
                      {result.correct ? "Correct. " : `Not quite — it is ${question.answer} ${question.askMode}. `}
                      <span className="text-[var(--muted-foreground)]">{question.rule}</span>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">All 15 key signatures</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Sharps: {SHARP_MNEMONIC}. Flats: {FLAT_MNEMONIC}.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Signature</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Major</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Minor</th>
                <th scope="col" className="py-2 font-semibold">Accidentals</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr
                  key={`${row.type}-${row.count}`}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="py-2 pr-3 font-semibold">
                    {row.count === 0 ? "none" : `${row.count} ${row.type === "sharp" ? "♯" : "♭"}`}
                  </td>
                  <td className="py-2 pr-3">{row.major}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.minor}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">
                    {row.accidentals.length ? row.accidentals.join(" ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Covers the fifteen standard signatures of common-practice tonality. Theoretical keys beyond
        seven accidentals (G♯ major, for instance) and modal or non-Western signatures are out of scope.
      </p>
    </main>
  );
}
