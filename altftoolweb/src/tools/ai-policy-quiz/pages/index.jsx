"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheck, CircleX, Copy, ListChecks, RotateCcw } from "lucide-react";

import { QUESTIONS, scoreQuiz } from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [answers, setAnswers] = useState(() => QUESTIONS.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const answeredCount = answers.filter((a) => a !== null).length;

  const result = useMemo(() => (submitted ? scoreQuiz(answers) : null), [submitted, answers]);
  const hasError = Boolean(result && result.error);
  const scored = result && !result.error ? result : null;

  const pick = (questionIndex, optionIndex) => {
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
    setSubmitted(false);
    setCopied(false);
  };

  const copyResult = async () => {
    if (!scored) return;
    try {
      await navigator.clipboard.writeText(
        `AI Policy Quiz: ${scored.score}/${scored.total} (${scored.percent}%) — ${scored.band}. ${scored.verdict}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAnswers(QUESTIONS.map(() => null));
    setSubmitted(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          AI Governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Policy Quiz</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Ten workplace scenarios on acceptable AI use — confidential data, verification,
          disclosure, IP, bias and accountability. Answer all ten, then get instant explanations
          and a readiness score against the usual 80% training pass mark.
        </p>
      </header>

      {QUESTIONS.map((q, qi) => {
        const feedback = submitted && scored ? scored.perQuestion[qi] : null;
        return (
          <fieldset
            key={q.id}
            className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <legend className="sr-only">{`Question ${qi + 1}`}</legend>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold leading-6">
                {qi + 1}. {q.question}
              </p>
              {feedback ? (
                feedback.correct ? (
                  <CircleCheck
                    className="h-5 w-5 shrink-0 text-[var(--success)]"
                    aria-label="Correct"
                  />
                ) : (
                  <CircleX className="h-5 w-5 shrink-0 text-[var(--danger)]" aria-label="Incorrect" />
                )
              ) : null}
            </div>
            <div className="mt-3 grid gap-2">
              {q.options.map((option, oi) => {
                const inputId = `${q.id}-${oi}`;
                const chosen = answers[qi] === oi;
                const showCorrect = feedback && oi === q.correct;
                const showWrongPick = feedback && chosen && !feedback.correct;
                return (
                  <label
                    key={inputId}
                    htmlFor={inputId}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                      showCorrect
                        ? "border-[var(--success)] bg-[var(--card)]"
                        : showWrongPick
                          ? "border-[var(--danger)] bg-[var(--card)]"
                          : chosen
                            ? "border-[var(--primary)] bg-[var(--muted)]"
                            : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name={q.id}
                      checked={chosen}
                      onChange={() => pick(qi, oi)}
                      className="h-4 w-4 accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {feedback ? (
              <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {feedback.explanation}
              </p>
            ) : null}
          </fieldset>
        );
      })}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setSubmitted(true)} className={PRIMARY_BTN}>
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Check my answers
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset the quiz"
          className={GHOST_BTN}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        <span className="text-sm text-[var(--muted-foreground)]">
          {answeredCount}/{QUESTIONS.length} answered
        </span>
      </div>

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
              Your score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {scored ? `${scored.score}/${scored.total}` : DASH}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {scored
                ? scored.verdict
                : "Answer every question and press Check my answers to see your result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!scored}
              aria-label="Copy the quiz result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted-foreground)]">Percentage</dt>
            <dd className="mt-0.5 font-semibold">{scored ? `${scored.percent}%` : DASH}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Band</dt>
            <dd className="mt-0.5 font-semibold">{scored ? scored.band : DASH}</dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General training aid, not legal or compliance advice — your organisation's own AI policy
        always governs. Question themes follow common enterprise acceptable-use rules and public
        frameworks such as the NIST AI Risk Management Framework.
      </p>
    </main>
  );
}
