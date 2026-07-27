"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Mic, Pause, Play, RotateCcw, Shuffle } from "lucide-react";

import {
  PART1_QUESTIONS,
  PART3_QUESTIONS,
  PARTS,
  formatClock,
  phaseAt,
  pickCueCard,
  totalSeconds,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [partId, setPartId] = useState("part2");
  const [cardSeed, setCardSeed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);

  const total = useMemo(() => totalSeconds(partId), [partId]);
  const state = useMemo(() => phaseAt({ partId, elapsedSeconds: elapsed }), [partId, elapsed]);
  const hasError = Boolean(state.error);
  const cueCard = useMemo(() => pickCueCard(cardSeed), [cardSeed]);

  useEffect(() => {
    if (!running) return undefined;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (!hasError && state.finished && running) setRunning(false);
  }, [hasError, state, running]);

  const selectPart = (id) => {
    setPartId(id);
    setElapsed(0);
    setRunning(false);
  };

  const reset = () => {
    setPartId("part2");
    setCardSeed(0);
    setElapsed(0);
    setRunning(false);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const part = PARTS.find((p) => p.id === partId);
    return [
      "IELTS Speaking practice session",
      `Part: ${part.label}`,
      partId === "part2" && !cueCard.error ? `Cue card: ${cueCard.card.topic}` : null,
      `Elapsed: ${formatClock(elapsed)} of ${formatClock(total)}`,
      `Current phase: ${state.phase.label}`,
      state.finished ? "Session finished" : `Remaining in phase: ${formatClock(state.remainingInPhase)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, partId, cueCard, elapsed, total, state]);

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

  const rows = hasError
    ? [
        ["Current phase", DASH],
        ["Elapsed", DASH],
        ["Remaining in phase", DASH],
        ["Total remaining", DASH],
      ]
    : [
        ["Current phase", state.phase.label],
        ["Elapsed", formatClock(elapsed)],
        ["Remaining in phase", formatClock(state.remainingInPhase)],
        ["Total remaining", formatClock(state.totalRemaining)],
        ["Session length", formatClock(total)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          English Proficiency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          IELTS Speaking Practice Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Time each part of the IELTS Speaking test to the real format — Part 2 gives you exactly 1
          minute to prepare and stops your long turn at 2 minutes, just like the examiner.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-part">
              Speaking part
            </label>
            <select
              id="sp-part"
              className={`mt-2 ${INPUT_CLASS}`}
              value={partId}
              onChange={(event) => selectPart(event.target.value)}
            >
              {PARTS.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.label}
                </option>
              ))}
            </select>
          </div>

          {partId === "part2" && !cueCard.error ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Cue card
                  </p>
                  <p className="mt-1 text-base font-semibold">{cueCard.card.topic}</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">You should say:</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-[var(--muted-foreground)]">
                    {cueCard.card.prompts.map((prompt) => (
                      <li key={prompt}>{prompt}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setCardSeed((s) => s + 1)}
                  aria-label="Show another cue card"
                  className={GHOST_BTN}
                >
                  <Shuffle className="h-4 w-4" aria-hidden="true" />
                  New card
                </button>
              </div>
            </div>
          ) : null}

          {partId === "part1" ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Sample interview questions
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-[var(--muted-foreground)]">
                {PART1_QUESTIONS.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {partId === "part3" ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Sample discussion questions
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-[var(--muted-foreground)]">
                {PART3_QUESTIONS.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {state.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Timer" : state.finished ? "Finished" : state.phase.label}
            </p>
            <p
              className="mt-1 font-mono text-5xl font-semibold text-[var(--primary)]"
              aria-live="polite"
            >
              {hasError ? DASH : formatClock(state.remainingInPhase)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to start."
                : state.finished
                  ? "Time is up — in the test the examiner would stop you here."
                  : running
                    ? "Speaking time counts down phase by phase."
                    : "Press start when you begin speaking (or preparing)."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              disabled={hasError || state.finished}
              aria-label={running ? "Pause the timer" : "Start the timer"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {running ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the session summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the timer and part"
              className={GHOST_BTN}
            >
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The full IELTS Speaking test runs 11–14 minutes across the three parts. Record yourself
        while the timer runs — running out of things to say at 1:10 on Part 2 is the most common
        problem this practice fixes.
      </p>
    </main>
  );
}
