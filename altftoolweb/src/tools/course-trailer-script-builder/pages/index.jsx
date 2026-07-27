"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, RotateCcw } from "lucide-react";

import {
  HOOK_WINDOW_SECONDS,
  MAX_DURATION_SECONDS,
  MAX_WPM,
  MIN_DURATION_SECONDS,
  MIN_WPM,
  PACE_PRESETS,
  buildTrailerScript,
} from "../lib";

const DEFAULTS = {
  courseTitle: "Ship Your First Web App",
  audience: "self-taught developers",
  outcome: "Deploy a working app to real users",
  topicsInput: "Plan the build, Wire the database, Deploy and monitor",
  credibility: "Twelve years shipping production apps, 4,000 students taught.",
  ctaAction: "Enrol now — first lesson is free.",
  durationSeconds: "60",
  wordsPerMinute: "140",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [courseTitle, setCourseTitle] = useState(DEFAULTS.courseTitle);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [outcome, setOutcome] = useState(DEFAULTS.outcome);
  const [topicsInput, setTopicsInput] = useState(DEFAULTS.topicsInput);
  const [credibility, setCredibility] = useState(DEFAULTS.credibility);
  const [ctaAction, setCtaAction] = useState(DEFAULTS.ctaAction);
  const [durationSeconds, setDurationSeconds] = useState(DEFAULTS.durationSeconds);
  const [wordsPerMinute, setWordsPerMinute] = useState(DEFAULTS.wordsPerMinute);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildTrailerScript({
        courseTitle,
        audience,
        outcome,
        topicsInput,
        credibility,
        ctaAction,
        durationSeconds,
        wordsPerMinute,
      }),
    [courseTitle, audience, outcome, topicsInput, credibility, ctaAction, durationSeconds, wordsPerMinute],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.scriptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCourseTitle(DEFAULTS.courseTitle);
    setAudience(DEFAULTS.audience);
    setOutcome(DEFAULTS.outcome);
    setTopicsInput(DEFAULTS.topicsInput);
    setCredibility(DEFAULTS.credibility);
    setCtaAction(DEFAULTS.ctaAction);
    setDurationSeconds(DEFAULTS.durationSeconds);
    setWordsPerMinute(DEFAULTS.wordsPerMinute);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Course production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Course Trailer Script Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your course details into a seven-beat trailer script with a second-by-second running
          order and a word budget for each beat at your narration pace.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cts-title">
              Course title
            </label>
            <input
              id="cts-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={courseTitle}
              onChange={(event) => setCourseTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cts-audience">
              Who it is for
            </label>
            <input
              id="cts-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cts-outcome">
              Outcome they walk away with
            </label>
            <input
              id="cts-outcome"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cts-topics">
              Modules or skills (comma separated)
            </label>
            <textarea
              id="cts-topics"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={topicsInput}
              onChange={(event) => setTopicsInput(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cts-credibility">
              Credibility line
            </label>
            <input
              id="cts-credibility"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={credibility}
              onChange={(event) => setCredibility(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cts-cta">
              Call to action
            </label>
            <input
              id="cts-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={ctaAction}
              onChange={(event) => setCtaAction(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cts-duration">
              Trailer length (seconds)
            </label>
            <input
              id="cts-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_DURATION_SECONDS}
              max={MAX_DURATION_SECONDS}
              step="5"
              value={durationSeconds}
              onChange={(event) => setDurationSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cts-wpm">
              Narration pace (words per minute)
            </label>
            <input
              id="cts-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WPM}
              max={MAX_WPM}
              step="5"
              value={wordsPerMinute}
              onChange={(event) => setWordsPerMinute(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PACE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setWordsPerMinute(String(preset.wpm))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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
              Total narration budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.totalWords} words`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the timed script."
                : `${result.totalClock} of running time at ${result.wpm} words per minute`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated trailer script"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy script"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Running time", hasError ? DASH : result.totalClock],
            ["Narration pace", hasError ? DASH : `${result.wpm} wpm`],
            ["Beats in the script", hasError ? DASH : String(result.beats.length)],
            ["Modules listed", hasError ? DASH : String(result.topicCount)],
            [
              `Hook length (target ${HOOK_WINDOW_SECONDS}s or less)`,
              hasError
                ? DASH
                : `${result.hookSeconds}s — ${result.hookFitsViewWindow ? "fits the 3-second view window" : "trim it or open mid-sentence"}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Beat sheet</h2>
          <ol className="mt-4 space-y-4">
            {result.beats.map((beat) => (
              <li key={beat.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{beat.title}</h3>
                  <p className="text-xs font-semibold text-[var(--primary)]">
                    {beat.startClock}–{beat.endClock} · {beat.seconds}s · ~{beat.wordBudget} words
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{beat.purpose}</p>
                <p className="mt-2 text-sm leading-6">{beat.draft}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The draft lines are scaffolding, not finished copy — rewrite each one in your own voice and
        read it aloud against a stopwatch before you record.
      </p>
    </main>
  );
}
