"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, RotateCcw, Shuffle } from "lucide-react";

import { MINUTES_PER_PROMPT, PROMPT_STAGES, compileJournal, getPromptSet } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  stageId: PROMPT_STAGES[0].id,
  count: "3",
  seed: 7,
};

const DASH = "—";

export default function ToolHome() {
  const [stageId, setStageId] = useState(DEFAULTS.stageId);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [answers, setAnswers] = useState({});
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      getPromptSet({
        stageId,
        count: count.trim() === "" ? Number.NaN : Number(count),
        seed,
      }),
    [stageId, count, seed],
  );

  const hasError = Boolean(result.error);
  const stageMax = PROMPT_STAGES.find((s) => s.id === stageId)?.prompts.length ?? 6;

  const answerFor = (index) => answers[`${stageId}-${seed}-${index}`] ?? "";

  const setAnswerFor = (index, value) => {
    setAnswers((prev) => ({ ...prev, [`${stageId}-${seed}-${index}`]: value }));
  };

  const copyResult = async () => {
    if (hasError) return;
    const compiled = compileJournal({
      stageLabel: result.stage.label,
      prompts: result.prompts,
      answers: result.prompts.map((_, index) => answerFor(index)),
    });
    if (compiled.error) return;
    try {
      await navigator.clipboard.writeText(compiled.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStageId(DEFAULTS.stageId);
    setCount(DEFAULTS.count);
    setSeed(DEFAULTS.seed);
    setAnswers({});
    setCopied(false);
  };

  const shuffle = () => setSeed((value) => value + 1);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Stress Reflection Prompts
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your exam stage and get short journalling prompts that help you name the pressure,
          sort what you control, and finish with one concrete next action. Nothing you type leaves
          this page.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="esr-stage">
              Where are you in the exam cycle?
            </label>
            <select
              id="esr-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stageId}
              onChange={(event) => setStageId(event.target.value)}
            >
              {PROMPT_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esr-count">
              Number of prompts (1–{stageMax})
            </label>
            <input
              id="esr-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={stageMax}
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Plan about {MINUTES_PER_PROMPT} minutes of writing per prompt.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <button type="button" onClick={shuffle} className={GHOST_BTN} aria-label="Draw a different set of prompts">
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Different prompts
          </button>
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
              Your reflection session
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.suggestedMinutes} min`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to draw prompts."
                : `${result.prompts.length} prompt${result.prompts.length === 1 ? "" : "s"} for “${result.stage.label}”. Write freely — rough sentences work better than polished ones.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy your prompts and answers as a journal entry"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy journal"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset prompts and clear answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <ol className="mt-5 space-y-4">
            {result.prompts.map((prompt, index) => (
              <li key={prompt}>
                <label className={LABEL_CLASS} htmlFor={`esr-answer-${index}`}>
                  {index + 1}. {prompt}
                </label>
                <textarea
                  id={`esr-answer-${index}`}
                  className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  value={answerFor(index)}
                  onChange={(event) => setAnswerFor(index, event.target.value)}
                  placeholder="Write honestly — this stays on your device."
                />
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Close every session the same way</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {result.closingSteps.map((step) => (
              <li
                key={step}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--muted-foreground)]"
              >
                {step}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A self-reflection aid, not therapy or medical advice. If exam stress is affecting your
        sleep, eating or safety, talk to someone you trust and consider a counsellor or doctor —
        in India, Tele-MANAS (14416) offers free mental-health support.
      </p>
    </main>
  );
}
