"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, X } from "lucide-react";

import { QUESTIONS, scoreQuiz } from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BLANK_ANSWERS = QUESTIONS.map(() => null);

export default function ToolHome() {
  const [answers, setAnswers] = useState(BLANK_ANSWERS);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreQuiz(answers), [answers]);
  const hasError = Boolean(result.error);
  const showScore = submitted && !hasError;

  const choose = (questionIndex, optionIndex) => {
    setAnswers((current) => {
      const next = current.slice();
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const summary = useMemo(() => {
    if (!showScore) return "";
    return [
      "Financial literacy quiz result",
      `Score: ${result.correct} of ${result.total} (${result.percent}%) — ${result.band}`,
      `Unanswered: ${result.unanswered}`,
      "",
      "By topic:",
      ...result.topics.map((row) => `- ${row.topic}: ${row.correct}/${row.total} (${row.percent}%)`),
      "",
      result.advice,
    ].join("\n");
  }, [showScore, result]);

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
    setAnswers(BLANK_ANSWERS);
    setSubmitted(false);
    setCopied(false);
  };

  const optionClass = (questionIndex, optionIndex) => {
    const chosen = answers[questionIndex] === optionIndex;
    const base =
      "flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
    if (!submitted) {
      return `${base} ${
        chosen
          ? "border-[var(--primary)] bg-[var(--primary)]/10 font-semibold"
          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
      }`;
    }
    const isAnswer = QUESTIONS[questionIndex].answer === optionIndex;
    if (isAnswer) {
      return `${base} border-[var(--success)] bg-[var(--success)]/10 font-semibold`;
    }
    if (chosen) {
      return `${base} border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] font-semibold`;
    }
    return `${base} border-[var(--border)] bg-[var(--background)] opacity-70`;
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          {QUESTIONS.length} questions, four topics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Financial Literacy Quiz for Beginners
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Interest, inflation, insurance and tax — the four things every money decision rests on.
          Answer what you can, then submit for a score by topic and a worked explanation for every
          question.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {showScore ? "Your score" : "Progress"}
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${
                showScore ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
              }`}
            >
              {showScore ? `${result.percent}%` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {showScore
                ? `${result.correct} of ${result.total} correct — ${result.band}`
                : `${result.answeredCount} of ${result.total} answered`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!submitted ? (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className={PRIMARY_BTN}
                aria-label="Submit the quiz and see the score"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                See my score
              </button>
            ) : (
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the quiz score"
                className={GHOST_BTN}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
            )}
            <button type="button" onClick={reset} aria-label="Clear answers and start again" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start again
            </button>
          </div>
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {result.topics.map((row) => (
            <div key={row.topic} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{row.topic}</dt>
              <dd className="text-right font-semibold">
                {showScore ? `${row.correct} / ${row.total} (${row.percent}%)` : "—"}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Left blank</dt>
            <dd className="text-right font-semibold">{showScore ? result.unanswered : "—"}</dd>
          </div>
        </dl>

        {showScore && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2.5 text-sm text-[var(--muted-foreground)]">
            {result.advice}
            {result.weakestTopic
              ? ` Your weakest topic here is ${result.weakestTopic.toLowerCase()}.`
              : ""}
          </p>
        )}
      </section>

      <ol className="mt-6 space-y-4">
        {result.review.map((row, questionIndex) => (
          <li key={row.id} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <fieldset>
              <legend className="mb-3 w-full">
                <span className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Question {questionIndex + 1} · {row.topic}
                </span>
                <span className="mt-1 block text-base font-semibold">{row.question}</span>
              </legend>
              <div className="grid gap-2">
                {row.options.map((option, optionIndex) => {
                  const inputId = `flq-${row.id}-${optionIndex}`;
                  return (
                    <label key={inputId} className={optionClass(questionIndex, optionIndex)} htmlFor={inputId}>
                      <input
                        id={inputId}
                        type="radio"
                        name={`flq-${row.id}`}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none"
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => choose(questionIndex, optionIndex)}
                        disabled={submitted}
                      />
                      <span className="flex-1">{option}</span>
                      {submitted && QUESTIONS[questionIndex].answer === optionIndex ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                      ) : null}
                      {submitted &&
                      row.chosen === optionIndex &&
                      QUESTIONS[questionIndex].answer !== optionIndex ? (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {submitted && (
              <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
                <span
                  className={`font-semibold ${
                    row.isCorrect ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }`}
                >
                  {row.isCorrect ? "Correct. " : row.answered ? "Not quite. " : "Left blank. "}
                </span>
                {row.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only, not investment, insurance or tax advice. Statutory limits, rates and
        insurance rules change with each Budget and each IRDAI circular, so confirm any figure
        against the current rules before acting on it.
      </p>
    </main>
  );
}
