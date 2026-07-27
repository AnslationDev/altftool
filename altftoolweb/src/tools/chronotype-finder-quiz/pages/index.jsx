"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";

import { MAX_SCORE, MIN_SCORE, QUESTIONS, formatDuration, scoreChronotype } from "../lib";

const DASH = "—";

/** Default answers: the middle option of each item, which scores as an intermediate type. */
const DEFAULT_ANSWERS = QUESTIONS.map((q) => Math.floor(q.options.length / 2));
const DEFAULT_REQUIRED_WAKE = "07:00";

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-medium text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [requiredWake, setRequiredWake] = useState(DEFAULT_REQUIRED_WAKE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreChronotype({ answers, requiredWake }),
    [answers, requiredWake],
  );
  const hasError = Boolean(result.error);

  const setAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => prev.map((v, i) => (i === questionIndex ? optionIndex : v)));
    setCopied(false);
  };

  const reset = () => {
    setAnswers(DEFAULT_ANSWERS);
    setRequiredWake(DEFAULT_REQUIRED_WAKE);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Chronotype result (rMEQ)",
      `Score: ${result.score} of ${MAX_SCORE} — ${result.type.label}`,
      `Natural wake time: ${result.naturalWake.time}`,
      `Natural sleep onset: ${result.naturalSleepy.time}`,
      `Sleep window: ${formatDuration(result.sleepWindowMin)} (mid-sleep ${result.midSleep.time})`,
      `Peak alertness: ${result.peakWindow}`,
      `Last caffeine: ${result.caffeineCutoff.time}`,
      `Dim screens and lights by: ${result.screensDimBy.time}`,
    ];
    if (result.socialJetlagMin !== null && result.socialJetlagMin > 0) {
      lines.push(
        `Social jet lag: forced up ${formatDuration(result.socialJetlagMin)} before your natural wake time, about ${result.daysToAdjust} day(s) to shift`,
      );
    }
    lines.push(result.type.lightAdvice);
    return lines.join("\n");
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Sleep timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Chronotype Finder Quiz</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The reduced Morningness–Eveningness Questionnaire (rMEQ): five items taken from the
          Horne &amp; Östberg MEQ, scored {MIN_SCORE}–{MAX_SCORE}. Your answers also set the sleep
          window, caffeine cutoff and light timing shown below.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The five questions</h2>
        {QUESTIONS.map((q, qi) => (
          <fieldset key={q.id} className="mt-5 first:mt-4">
            <legend className="text-sm font-semibold">
              {qi + 1}. {q.text}
            </legend>
            <div className="mt-2 grid gap-1">
              {q.options.map((opt, oi) => (
                <label
                  key={`${q.id}-${oi}`}
                  htmlFor={`${q.id}-${oi}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
                >
                  <input
                    id={`${q.id}-${oi}`}
                    type="radio"
                    name={q.id}
                    className="h-5 w-5 border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={answers[qi] === oi}
                    onChange={() => setAnswer(qi, oi)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Optional: the wake time you are forced into</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="required-wake">
              Work or school wake time
            </label>
            <input
              id="required-wake"
              type="time"
              className={`${FIELD} mt-1`}
              value={requiredWake}
              onChange={(e) => {
                setRequiredWake(e.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave blank to skip the social jet lag figure.
            </p>
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
              Your chronotype
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.type.label}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Answer all five questions to see your result."
                : `rMEQ score ${result.score} of ${MAX_SCORE}. ${result.type.summary}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy your chronotype result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset the quiz to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Natural sleep window
            </dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : `${result.naturalSleepy.time} → ${result.naturalWake.time} (${formatDuration(result.sleepWindowMin)})`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Mid-sleep point
            </dt>
            <dd className="text-sm font-semibold">{hasError ? DASH : result.midSleep.time}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Peak alertness
            </dt>
            <dd className="text-sm font-semibold">{hasError ? DASH : result.peakWindow}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Last caffeine
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : result.caffeineCutoff.time}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Dim screens and lights by
            </dt>
            <dd className="text-sm font-semibold">{hasError ? DASH : result.screensDimBy.time}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Social jet lag
            </dt>
            <dd className="text-sm font-semibold">
              {hasError || result.socialJetlagMin === null
                ? DASH
                : result.socialJetlagMin > 0
                  ? `Up ${formatDuration(result.socialJetlagMin)} early — about ${result.daysToAdjust} day${result.daysToAdjust === 1 ? "" : "s"} to shift`
                  : "None — your schedule already fits your clock"}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.type.lightAdvice}
          </p>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          The rMEQ is a self-report questionnaire, not a clinical assessment. Persistent difficulty
          sleeping or staying awake is worth raising with a doctor.
        </p>
      </section>
    </main>
  );
}
