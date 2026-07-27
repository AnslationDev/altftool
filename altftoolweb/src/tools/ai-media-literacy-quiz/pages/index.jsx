"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanEye } from "lucide-react";
import { PASS_MARK, QUESTIONS, gradeQuiz, selectQuestions } from "../lib";

const QUESTION_COUNT = QUESTIONS.length;
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [seed, setSeed] = useState(1);
  const [count, setCount] = useState(String(QUESTION_COUNT));
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const questions = useMemo(() => {
    const wanted = Number(count);
    return selectQuestions(seed, Number.isFinite(wanted) ? wanted : QUESTION_COUNT);
  }, [seed, count]);

  const grade = useMemo(() => gradeQuiz(questions, answers), [questions, answers]);
  const hasError = Boolean(grade.error);
  const dash = "—";
  const revealed = submitted && !hasError;

  const chooseAnswer = (questionId, optionIndex) => {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  };

  const restart = (nextSeed) => {
    setSeed(nextSeed);
    setAnswers({});
    setSubmitted(false);
    setCopied(false);
  };

  const summary = revealed
    ? [
        "AI Media Literacy Quiz",
        `Score: ${grade.correctCount}/${grade.total} (${grade.scorePct}%) — ${grade.band}`,
        `Pass mark: ${PASS_MARK}%`,
        ...grade.byTopic.map((topic) => `${topic.label}: ${topic.correct}/${topic.total}`),
      ].join("\n")
    : "";

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanEye className="h-4 w-4" aria-hidden="true" />
          Media literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Media Literacy Quiz</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {QUESTION_COUNT} scenario questions on synthetic media: what content credentials prove,
          where AI detectors fail, and the verification steps that still work. Every answer comes
          with the reasoning, so a wrong pick teaches something.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="quiz-count">
              Questions in this round
            </label>
            <select
              id="quiz-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={count}
              onChange={(event) => {
                setCount(event.target.value);
                setAnswers({});
                setSubmitted(false);
              }}
            >
              {[5, 8, QUESTION_COUNT].map((option) => (
                <option key={option} value={String(option)}>
                  {option} questions
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="quiz-seed">
              Question set
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="quiz-seed"
                className={INPUT_CLASS}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={seed}
                onChange={(event) => restart(Number(event.target.value) || 1)}
              />
              <button type="button" className={GHOST_BTN} onClick={() => restart(seed + 1)}>
                Shuffle
              </button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          The same set number always gives the same questions in the same order, so you can retake an
          identical round or hand one to a class.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        {questions.map((question, index) => {
          const chosen = answers[question.id];
          const isCorrect = revealed && chosen === question.correct;
          return (
            <fieldset
              key={question.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Question {index + 1} of {questions.length}
              </legend>
              <p className="mt-1 text-base font-semibold leading-6">{question.prompt}</p>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const selected = chosen === optionIndex;
                  const markCorrect = revealed && optionIndex === question.correct;
                  const markWrong = revealed && selected && optionIndex !== question.correct;
                  const tone = markCorrect
                    ? "border-[var(--success)] text-[var(--success)]"
                    : markWrong
                      ? "border-[var(--danger)] text-[var(--danger)]"
                      : selected
                        ? "border-[var(--primary)]"
                        : "border-[var(--border)]";
                  return (
                    <label
                      key={option}
                      htmlFor={`${question.id}-${optionIndex}`}
                      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] ${tone}`}
                    >
                      <input
                        id={`${question.id}-${optionIndex}`}
                        type="radio"
                        name={question.id}
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                        checked={selected}
                        onChange={() => chooseAnswer(question.id, optionIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              {revealed && (
                <p
                  className={`mt-3 rounded-md px-3 py-2 text-sm leading-6 ${
                    isCorrect
                      ? "bg-[var(--muted)] text-[var(--foreground)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                >
                  <span className="font-semibold">{isCorrect ? "Correct. " : "Not quite. "}</span>
                  {question.explanation}
                </p>
              )}
            </fieldset>
          );
        })}
      </section>

      {submitted && hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {grade.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {revealed ? `${grade.scorePct}%` : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {revealed
                ? `${grade.correctCount} of ${grade.total} — ${grade.band}`
                : "Answer the questions, then check."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={PRIMARY_BTN} onClick={() => setSubmitted(true)}>
              Check answers
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy quiz score"
              className={GHOST_BTN}
              disabled={!revealed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy score"}
            </button>
            <button
              type="button"
              onClick={() => restart(seed)}
              aria-label="Reset the quiz"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Answered", revealed ? `${grade.answeredCount} of ${grade.total}` : dash],
            ["Correct", revealed ? String(grade.correctCount) : dash],
            ["Pass mark", `${PASS_MARK}%`],
            ["Result", revealed ? (grade.passed ? "Pass" : "Below pass mark") : dash],
            [
              "Weakest topic",
              revealed && grade.weakestTopic
                ? `${grade.weakestTopic.label} (${grade.weakestTopic.correct}/${grade.weakestTopic.total})`
                : dash,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {revealed && (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{grade.bandNote}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Topic</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Correct</th>
                    <th scope="col" className="py-2 text-right font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {grade.byTopic.map((topic) => (
                    <tr key={topic.topic} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{topic.label}</td>
                      <td className="py-2 pr-3 text-right">
                        {topic.correct}/{topic.total}
                      </td>
                      <td className="py-2 text-right font-semibold">{topic.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational practice only. Detection techniques and platform behaviour change quickly —
        verify current guidance with the relevant newsroom, school or security team before relying
        on any single check.
      </p>
    </main>
  );
}
