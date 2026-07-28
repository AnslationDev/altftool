"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RefreshCw, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  CORE_RULES,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  buildQuiz,
  gradeQuiz,
  isCorrect,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  categories: CATEGORIES.map((category) => category.id),
  count: "10",
  seed: 1,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? Math.round(value) : NaN;
};

export default function ToolHome() {
  const [categories, setCategories] = useState(DEFAULTS.categories);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [responses, setResponses] = useState({});
  const [copied, setCopied] = useState(false);

  const quiz = useMemo(
    () => buildQuiz({ categories, count: toInt(count), seed }),
    [categories, count, seed],
  );

  const hasError = Boolean(quiz.error);
  const dash = "—";

  const result = useMemo(
    () => (hasError ? { error: quiz.error } : gradeQuiz(quiz.questions, responses)),
    [hasError, quiz, responses],
  );

  const toggleCategory = (id) => {
    setCategories((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setResponses({});
  };

  const answer = (questionId, option) => {
    setResponses((current) => ({ ...current, [questionId]: option }));
  };

  const newDrill = () => {
    setSeed((current) => current + 1);
    setResponses({});
  };

  const summary = useMemo(() => {
    if (hasError || result.error) return "";
    return [
      "English Preposition Drill",
      `Score: ${result.correct} of ${result.total} (${NUM.format(result.scorePct)}%)`,
      `Answered: ${result.answered} · unanswered: ${result.unanswered}`,
      ...result.wrong.map((item) => `Missed: ${item.sentence.replace("___", item.answer)} — ${item.rule}`),
    ].join("\n");
  }, [hasError, result]);

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
    setCategories(DEFAULTS.categories);
    setCount(DEFAULTS.count);
    setSeed(DEFAULTS.seed);
    setResponses({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Language grammar
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">English Preposition Drill</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Practise in, on and at plus the prepositions of movement and the fixed pairs that learners
          most often get wrong. Every answer shows the rule that decided it, so a mistake teaches
          something.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold">What to practise</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((category) => {
              const checked = categories.includes(category.id);
              return (
                <label
                  key={category.id}
                  htmlFor={`prep-cat-${category.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                    checked ? "border-[var(--primary)]" : "border-[var(--border)]"
                  }`}
                >
                  <input
                    id={`prep-cat-${category.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleCategory(category.id)}
                  />
                  {category.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="prep-count">
              Questions ({MIN_QUESTIONS}–{MAX_QUESTIONS})
            </label>
            <input
              id="prep-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_QUESTIONS}
              max={MAX_QUESTIONS}
              step="1"
              value={count}
              onChange={(event) => {
                setCount(event.target.value);
                setResponses({});
              }}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={newDrill} className={`w-full ${GHOST_BTN}`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              New set of questions
            </button>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {quiz.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM.format(result.scorePct)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Choose at least one category above"
                : `${result.correct} right out of ${result.total} · ${result.unanswered} still blank`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the drill score and missed rules"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the drill" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Questions in this set", hasError ? dash : NUM.format(result.total)],
            ["Answered", hasError ? dash : NUM.format(result.answered)],
            ["Correct", hasError ? dash : NUM.format(result.correct)],
            ["Incorrect", hasError ? dash : NUM.format(result.incorrect)],
            ["Left blank", hasError ? dash : NUM.format(result.unanswered)],
            ["Questions available in these categories", hasError ? dash : NUM.format(quiz.poolSize)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 grid gap-3">
          {quiz.questions.map((question, index) => {
            const chosen = responses[question.id];
            const answered = typeof chosen === "string" && chosen !== "";
            const right = answered && isCorrect(question, chosen);
            return (
              <div
                key={question.id}
                className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
              >
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Question {index + 1}
                </p>
                <p className="mt-2 text-base leading-7">
                  {question.sentence.split("___")[0]}
                  <span className="mx-1 inline-block min-w-16 border-b-2 border-[var(--primary)] text-center font-semibold text-[var(--primary)]">
                    {answered ? chosen : " "}
                  </span>
                  {question.sentence.split("___")[1]}
                </p>
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`Options for question ${index + 1}`}>
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answer(question.id, option)}
                      aria-pressed={chosen === option}
                      className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        chosen === option
                          ? "border-[var(--primary)] text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--foreground)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {answered ? (
                  <p
                    className={`mt-3 rounded-md px-3 py-2 text-sm ${
                      right
                        ? "bg-[var(--muted)] text-[var(--success)]"
                        : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                  >
                    {right ? "Correct. " : `Not quite — the answer is “${question.answer}”. `}
                    <span className="text-[var(--foreground)]">{question.rule}</span>
                  </p>
                ) : null}
              </div>
            );
          })}
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">in, on, at — the core rule</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Preposition</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                <th scope="col" className="py-2 font-semibold">Place</th>
              </tr>
            </thead>
            <tbody>
              {CORE_RULES.map((rule) => (
                <tr key={rule.preposition} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-lg font-semibold text-[var(--primary)]">{rule.preposition}</td>
                  <td className="py-2 pr-3">{rule.time}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{rule.place}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Answers follow standard British usage. A few items differ in American English — most
        obviously &ldquo;at the weekend&rdquo; against &ldquo;on the weekend&rdquo; — so check which
        variety your exam expects.
      </p>
    </main>
  );
}
