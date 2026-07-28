"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Keyboard, RotateCcw } from "lucide-react";
import {
  DEFAULT_PROMPT_WORDS,
  DURATION_PRESETS,
  buildPrompt,
  compareTyped,
  computeTypingScore,
  formatClock,
} from "../lib";

const numberFormat = new Intl.NumberFormat("en-US");
const decimalFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const DASH = "—";

function randomSeed() {
  return Math.floor(Math.random() * 2147483647);
}

export default function TypingSpeedGame() {
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [wordCount, setWordCount] = useState(DEFAULT_PROMPT_WORDS);
  const [seed, setSeed] = useState(20260728);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef(null);

  const prompt = useMemo(() => buildPrompt(wordCount, seed), [wordCount, seed]);
  const promptText = prompt.error ? "" : prompt.text;

  const comparison = useMemo(
    () => compareTyped(promptText, typed),
    [promptText, typed],
  );

  const running = startedAt !== null && !finished;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      const next = (Date.now() - startedAt) / 1000;
      if (next >= durationSeconds) {
        setElapsed(durationSeconds);
        setFinished(true);
      } else {
        setElapsed(next);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running, startedAt, durationSeconds]);

  const score = useMemo(() => {
    if (startedAt === null) return null;
    return computeTypingScore({
      typedChars: comparison.typedChars,
      correctChars: comparison.correctChars,
      incorrectChars: comparison.incorrectChars,
      elapsedSeconds: elapsed,
    });
  }, [startedAt, comparison, elapsed]);

  const errorMessage = prompt.error || (score && score.error) || "";
  const figures = score && !score.error ? score : null;

  const handleTyping = useCallback(
    (event) => {
      if (finished) return;
      const value = event.target.value;
      let begunAt = startedAt;
      if (begunAt === null && value.length > 0) {
        begunAt = Date.now();
        setStartedAt(begunAt);
        setElapsed(0);
      }
      setTyped(value);
      // Reaching the end of the prompt stops the clock immediately.
      if (promptText.length > 0 && value.length >= promptText.length && begunAt !== null) {
        setElapsed(Math.min(durationSeconds, (Date.now() - begunAt) / 1000));
        setFinished(true);
      }
    },
    [finished, startedAt, promptText, durationSeconds],
  );

  const reset = useCallback((nextSeed) => {
    setTyped("");
    setStartedAt(null);
    setElapsed(0);
    setFinished(false);
    setCopied(false);
    if (typeof nextSeed === "number") setSeed(nextSeed);
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const summary = useMemo(() => {
    if (!figures) return "";
    return [
      `Typing speed test — ${formatClock(elapsed)} elapsed`,
      `Net WPM: ${decimalFormat.format(figures.netWpm)} (${figures.band})`,
      `Gross WPM: ${decimalFormat.format(figures.grossWpm)}`,
      `CPM: ${numberFormat.format(figures.cpm)}`,
      `Accuracy: ${decimalFormat.format(figures.accuracy)}%`,
      `Characters typed: ${numberFormat.format(comparison.typedChars)} (${numberFormat.format(comparison.incorrectChars)} wrong)`,
    ].join("\n");
  }, [figures, elapsed, comparison]);

  const copyResult = useCallback(async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [summary]);

  const remaining = Math.max(0, durationSeconds - elapsed);
  const progressPercent = promptText.length
    ? Math.min(100, (comparison.typedChars / promptText.length) * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <Keyboard aria-hidden="true" className="mt-1 h-6 w-6 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Typing Speed Game</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Start typing the prompt below. The clock starts on your first keystroke and stops at
            the end of the prompt or when the timer runs out.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tsg-duration"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Test length
          </label>
          <select
            id="tsg-duration"
            value={durationSeconds}
            onChange={(event) => {
              setDurationSeconds(Number(event.target.value));
              reset();
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {DURATION_PRESETS.map((value) => (
              <option key={value} value={value}>
                {value} seconds
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tsg-words"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Prompt length (words)
          </label>
          <input
            id="tsg-words"
            type="number"
            min={5}
            max={400}
            step={5}
            value={wordCount}
            onChange={(event) => {
              setWordCount(Number(event.target.value));
              reset();
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          />
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-[var(--muted-foreground)]">
          Time left{" "}
          <span className="font-mono text-base font-semibold text-[var(--foreground)]">
            {formatClock(remaining)}
          </span>
        </span>
        <span className="text-[var(--muted-foreground)]">
          {numberFormat.format(comparison.typedChars)} / {numberFormat.format(promptText.length)}{" "}
          characters
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {prompt.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {prompt.error}
        </p>
      ) : (
        <button
          type="button"
          onClick={focusInput}
          aria-label="Focus the typing box"
          className="mt-4 w-full cursor-text rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left font-mono text-base leading-8 break-words"
        >
          {promptText.split("").map((char, index) => {
            const status = comparison.statuses[index];
            const isCursor = index === comparison.typedChars && !finished;
            const tone =
              status === "correct"
                ? "text-[var(--success)]"
                : status === "incorrect"
                  ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                  : "text-[var(--muted-foreground)]";
            return (
              <span
                key={`${index}-${char}`}
                className={`${tone} ${isCursor ? "underline decoration-[var(--primary)] decoration-2 underline-offset-4" : ""}`}
              >
                {char}
              </span>
            );
          })}
        </button>
      )}

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="tsg-input" className="text-sm font-medium text-[var(--foreground)]">
          Type here
        </label>
        <textarea
          id="tsg-input"
          ref={inputRef}
          rows={3}
          value={typed}
          disabled={finished || Boolean(prompt.error)}
          onChange={handleTyping}
          spellCheck={false}
          autoComplete="off"
          placeholder="Start typing to begin the timer…"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-base text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            reset(randomSeed());
            focusInput();
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          New prompt
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          Restart same prompt
        </button>
        <button
          type="button"
          onClick={copyResult}
          disabled={!figures}
          aria-label="Copy typing test result to clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-[var(--success)]" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy result"}
        </button>
      </div>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Net words per minute</p>
        <p className="mt-1 text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          {figures ? decimalFormat.format(figures.netWpm) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {figures ? figures.band : "Start typing to see your speed"}
        </p>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {errorMessage}
          </p>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Gross WPM</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {figures ? decimalFormat.format(figures.grossWpm) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters per minute</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {figures ? numberFormat.format(figures.cpm) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Accuracy</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {figures ? `${decimalFormat.format(figures.accuracy)}%` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Time typed</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {figures ? formatClock(elapsed) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters typed</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {numberFormat.format(comparison.typedChars)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Uncorrected errors</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {numberFormat.format(comparison.incorrectChars)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          One word = 5 keystrokes including spaces. Net WPM deducts one word per minute for every
          uncorrected mistake left in the text.
        </p>
      </section>
    </div>
  );
}
