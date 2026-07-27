"use client";

import { useMemo, useState } from "react";
import { Atom, Check, Copy, RotateCcw } from "lucide-react";

import { CONFUSION_TYPES, EXAM_LEVELS, SUBJECTS, buildJeeDoubtPrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  subjectId: "physics",
  levelId: "jee-main",
  confusionId: "concept",
  topic: "Rotational mechanics",
  doubt:
    "A solid sphere rolls without slipping down an incline. Why is friction static here, and why does it do no work?",
  attempt: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const result = useMemo(
    () =>
      buildJeeDoubtPrompt({
        subjectId: form.subjectId,
        topic: form.topic,
        doubt: form.doubt,
        attempt: form.attempt,
        levelId: form.levelId,
        confusionId: form.confusionId,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Atom className="h-4 w-4" aria-hidden="true" />
          Exam prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">JEE Doubt Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Frame a physics, chemistry or maths doubt so AI teaches it step by step — with a
          subject-specific solving framework, your exact confusion named, and JEE Main&apos;s
          2.4-minutes-per-question and +4/−1 marking arithmetic alongside.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-subject">
              Subject
            </label>
            <select
              id="jd-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subjectId}
              onChange={set("subjectId")}
            >
              {SUBJECTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-level">
              Level
            </label>
            <select id="jd-level" className={`mt-2 ${INPUT_CLASS}`} value={form.levelId} onChange={set("levelId")}>
              {EXAM_LEVELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-topic">
              Topic (optional)
            </label>
            <input
              id="jd-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={100}
              value={form.topic}
              onChange={set("topic")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jd-confusion">
              What exactly is confusing?
            </label>
            <select
              id="jd-confusion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.confusionId}
              onChange={set("confusionId")}
            >
              {CONFUSION_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jd-doubt">
              The question / doubt
            </label>
            <textarea
              id="jd-doubt"
              className={TEXTAREA_CLASS}
              rows={4}
              maxLength={2100}
              value={form.doubt}
              onChange={set("doubt")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jd-attempt">
              Your attempt so far (needed for answer-mismatch doubts)
            </label>
            <textarea
              id="jd-attempt"
              className={TEXTAREA_CLASS}
              rows={3}
              maxLength={2100}
              placeholder="What you tried, and the answer you got"
              value={form.attempt}
              onChange={set("attempt")}
            />
          </div>
        </div>
      </section>

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
              Time one question earns
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.stats.minutesPerQuestion)} min`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the prompt."
                : "JEE Main: 75 questions in 180 minutes, +4 correct / −1 wrong."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the JEE doubt prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Generated prompt
        </p>
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
          {hasError ? DASH : result.prompt}
        </pre>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Should you guess? (+4 / −1 MCQ arithmetic)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Options eliminated
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Remaining
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Expected marks per guess
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.stats.guessTable).map((row) => (
                <tr key={row.eliminated} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.eliminated}</td>
                  <td className="py-2 pr-3">{row.remaining}</td>
                  <td className="py-2 text-right font-semibold">
                    {row.expectedMarks > 0 ? "+" : ""}
                    {NUM.format(row.expectedMarks)}
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Under +4/−1 with four options, even a blind guess has a positive expected value (+0.25),
          and every eliminated option raises it. Expected value is a long-run average — variance
          still hurts on any single question.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Exam figures follow the NTA JEE Main pattern: 75 questions, 300 marks, 3 hours, +4/−1
        marking on both MCQ and numerical questions. AI explanations can contain errors — check
        every step against NCERT or your standard text, especially numerical constants.
      </p>
    </main>
  );
}
