"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Network, RotateCcw } from "lucide-react";

import { DEFAULT_ANSWERS, QUESTIONS, decidePattern } from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => decidePattern(answers), [answers]);
  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Messaging pattern recommendation",
      "",
      `Recommended: ${result.winner.name} — ${PCT.format(result.winner.fit)}% fit (${result.confidence})`,
      `Typical technologies: ${result.winner.examples}`,
      "",
      "Ranking:",
      ...result.ranked.map(
        (pattern) =>
          `  ${pattern.name}: ${PCT.format(pattern.fit)}%${pattern.ruledOut ? ` — ruled out: ${pattern.ruledOut}` : ""}`,
      ),
      "",
      "Answers:",
      ...QUESTIONS.map((question) => {
        const option = question.options.find((item) => item.id === answers[question.id]);
        return `  ${question.label} ${option ? option.label : "(unanswered)"}`;
      }),
    ];
    if (result.combineHint) lines.push("", result.combineHint);
    return lines.join("\n");
  }, [hasError, result, answers]);

  const setAnswer = (questionId, optionId) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  };

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
    setAnswers(DEFAULT_ANSWERS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Network className="h-4 w-4" aria-hidden="true" />
          Messaging
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">PubSub vs Queue Decision Helper</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Nine questions about consumers, replay, ordering, retention and failure handling, scored across
          work queues, pub/sub topics, partitioned logs and event buses — with the reasoning shown, not hidden.
        </p>
      </header>

      <section className="space-y-4">
        {QUESTIONS.map((question) => (
          <fieldset key={question.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <legend className={LABEL_CLASS}>{question.label}</legend>
            {question.help && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{question.help}</p>}
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => {
                const inputId = `${question.id}-${option.id}`;
                const active = answers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    htmlFor={inputId}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 font-semibold"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={active}
                      onChange={() => setAnswer(question.id, option.id)}
                      className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended pattern
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? dash : result.winner.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Answer every question to see a recommendation."
                : `${PCT.format(result.winner.fit)}% fit — ${result.confidence}${result.runnerUp ? `, ${PCT.format(result.margin)} points ahead of ${result.runnerUp.name.toLowerCase()}` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the messaging pattern recommendation"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Shape", hasError ? dash : result.winner.shape],
            ["Typical technologies", hasError ? dash : result.winner.examples],
            ["Runner-up", hasError ? dash : result.runnerUp ? result.runnerUp.name : "None"],
            ["Confidence", hasError ? dash : result.confidence],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:max-w-[70%] sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.combineHint && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
            {result.combineHint}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Full ranking and why</h2>
          <div className="mt-4 space-y-4">
            {result.ranked.map((pattern) => (
              <article
                key={pattern.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{pattern.name}</h3>
                  <span className="text-sm font-semibold text-[var(--primary)]">{PCT.format(pattern.fit)}% fit</span>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${pattern.name} scores ${PCT.format(pattern.fit)} percent fit`}
                >
                  <span
                    className={`block h-full ${pattern.ruledOut ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                    style={{ width: `${pattern.fit}%` }}
                  />
                </div>
                {pattern.ruledOut ? (
                  <p className="mt-2 text-xs font-semibold text-[var(--danger)]">Ruled out: {pattern.ruledOut}</p>
                ) : (
                  <>
                    {pattern.support.length > 0 && (
                      <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                        <span className="font-semibold text-[var(--success)]">For:</span> {pattern.support.join("; ")}
                      </p>
                    )}
                    {pattern.against.length > 0 && (
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        <span className="font-semibold text-[var(--danger)]">Against:</span> {pattern.against.join("; ")}
                      </p>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Scores come from a fixed rubric, so the same answers always give the same result. Treat a margin
        under five points as a tie and decide on operational cost, existing infrastructure and team
        familiarity instead.
      </p>
    </main>
  );
}
