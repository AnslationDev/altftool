"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw, Shuffle } from "lucide-react";

import { RULES, TYPES, buildQuiz, gradeQuiz, poolCounts } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHOICE =
  "min-h-11 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHOICE_ON =
  "min-h-11 flex-1 rounded-md border border-[var(--primary)] bg-[var(--muted)] px-3 py-2 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULT_COUNT = "10";
const DEFAULT_ROUND = "1";

export default function ToolHome() {
  const [countInput, setCountInput] = useState(DEFAULT_COUNT);
  const [roundInput, setRoundInput] = useState(DEFAULT_ROUND);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const pool = useMemo(() => poolCounts(), []);
  const quiz = useMemo(
    () => buildQuiz({ count: countInput, seed: roundInput }),
    [countInput, roundInput]
  );
  const grade = useMemo(
    () => (quiz.error ? { error: quiz.error } : gradeQuiz(quiz.questions, answers)),
    [quiz, answers]
  );

  const failed = Boolean(quiz.error || grade.error);
  const errorText = quiz.error || grade.error || "";

  const choose = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const newRound = () => {
    const current = Number(roundInput);
    const next = Number.isFinite(current) ? Math.trunc(current) + 1 : 1;
    setRoundInput(String(next));
    setAnswers({});
    setChecked(false);
    setCopied(false);
  };

  const reset = () => {
    setCountInput(DEFAULT_COUNT);
    setRoundInput(DEFAULT_ROUND);
    setAnswers({});
    setChecked(false);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (failed || !checked) return "";
    return [
      "Muhavara vs Lokokti Quiz",
      `Round ${quiz.seed}, ${grade.total} questions`,
      `Score: ${grade.correct}/${grade.total} (${grade.percent}%)`,
      grade.band,
      "",
      ...grade.rows.map(
        (row) =>
          `${row.correct ? "correct" : "wrong"} — ${row.hindi} = ${TYPES[row.correctType].label}`
      ),
    ].join("\n");
  }, [failed, checked, quiz, grade]);

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

  const bigNumber = failed
    ? DASH
    : checked
      ? `${grade.correct} / ${grade.total}`
      : `${grade.answered} / ${grade.total}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Hindi vyakaran
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Muhavara vs Lokokti Quiz
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A muhavara is a phrase that needs a sentence built around it. A lokokti is a complete
          sentence you can quote as it stands. Sort {pool.total} real examples and see the reason
          for each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="quiz-count">
              Questions in this round (1–{pool.total})
            </label>
            <input
              id="quiz-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={pool.total}
              step="1"
              value={countInput}
              onChange={(event) => {
                setCountInput(event.target.value);
                setAnswers({});
                setChecked(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="quiz-round">
              Round number
            </label>
            <input
              id="quiz-round"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={roundInput}
              onChange={(event) => {
                setRoundInput(event.target.value);
                setAnswers({});
                setChecked(false);
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={newRound} className={GHOST_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            New round
          </button>
          <button
            type="button"
            onClick={() => setChecked(true)}
            className={PRIMARY_BTN}
            disabled={failed}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Check answers
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Pool: {pool.muhavara} muhavare and {pool.lokokti} lokoktiyan. The same round number always
          produces the same questions in the same order.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {checked ? "Score" : "Answered"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{bigNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the quiz result"
              className={GHOST_BTN}
              disabled={!summary}
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
              aria-label="Reset the quiz to its starting state"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {errorText}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Questions in round", failed ? DASH : String(grade.total)],
            ["Answered", failed ? DASH : String(grade.answered)],
            ["Left blank", failed ? DASH : String(grade.unanswered)],
            ["Correct", failed || !checked ? DASH : String(grade.correct)],
            ["Percentage", failed || !checked ? DASH : `${grade.percent}%`],
            ["Verdict", failed || !checked ? DASH : grade.band],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {failed ? null : (
        <section className="mt-6">
          <h2 className="text-base font-semibold">
            Classify each line as muhavara or lokokti
          </h2>
          <ol className="mt-3 grid gap-3">
            {grade.rows.map((row, index) => (
              <li
                key={row.id}
                className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Question {index + 1}
                </p>
                <p className="mt-1 text-lg font-semibold leading-snug">{row.hindi}</p>
                <p className="mt-1 text-sm italic text-[var(--muted-foreground)]">{row.roman}</p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  {["muhavara", "lokokti"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={row.chosen === type}
                      onClick={() => choose(row.id, type)}
                      className={row.chosen === type ? CHOICE_ON : CHOICE}
                    >
                      {TYPES[type].label}
                    </button>
                  ))}
                </div>

                {checked ? (
                  <div className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                    <p
                      className={
                        row.correct
                          ? "font-semibold text-[var(--success)]"
                          : "font-semibold text-[var(--danger)]"
                      }
                    >
                      {row.correct
                        ? "Correct"
                        : `Answer: ${TYPES[row.correctType].label}`}
                    </p>
                    <p className="mt-1 text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">Meaning: </span>
                      {row.meaning}
                    </p>
                    <p className="mt-1 text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">Why: </span>
                      {row.why}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The four rules</h2>
        <ol className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
          {RULES.map((rule, index) => (
            <li key={rule} className="flex gap-3">
              <span className="font-semibold text-[var(--primary)]">{index + 1}.</span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Some textbooks treat lokokti and kahavat as separate headings. Follow the terminology used
        in your prescribed Hindi vyakaran book when writing exam answers.
      </p>
    </main>
  );
}
