"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import {
  DEFAULT_BREAK_MINUTES_PER_HOUR,
  DEFAULT_SECONDS_PER_RETAKE,
  DEFAULT_SETUP_MINUTES,
  DEFAULT_WPM,
  DIFFICULTY_PRESETS,
  estimateSession,
  formatHoursMinutes,
  wordsPerSession,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  wordCount: "5000",
  wpm: String(DEFAULT_WPM),
  errors: "3",
  retakeSeconds: String(DEFAULT_SECONDS_PER_RETAKE),
  breakPerHour: String(DEFAULT_BREAK_MINUTES_PER_HOUR),
  setup: String(DEFAULT_SETUP_MINUTES),
  cap: "240",
  perDay: "1",
};

const toNumber = (value) => (String(value).trim() === "" ? NaN : Number(value));

export default function ToolHome() {
  const [wordCount, setWordCount] = useState(DEFAULTS.wordCount);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [errors, setErrors] = useState(DEFAULTS.errors);
  const [retakeSeconds, setRetakeSeconds] = useState(DEFAULTS.retakeSeconds);
  const [breakPerHour, setBreakPerHour] = useState(DEFAULTS.breakPerHour);
  const [setup, setSetup] = useState(DEFAULTS.setup);
  const [cap, setCap] = useState(DEFAULTS.cap);
  const [perDay, setPerDay] = useState(DEFAULTS.perDay);
  const [copied, setCopied] = useState(false);

  const settings = useMemo(
    () => ({
      wordsPerMinute: toNumber(wpm),
      errorsPerHundredWords: toNumber(errors),
      secondsPerRetake: toNumber(retakeSeconds),
      breakMinutesPerHour: toNumber(breakPerHour),
      setupMinutes: toNumber(setup),
      sessionCapMinutes: toNumber(cap),
    }),
    [wpm, errors, retakeSeconds, breakPerHour, setup, cap],
  );

  const result = useMemo(
    () =>
      estimateSession({
        ...settings,
        wordCount: toNumber(wordCount),
        sessionsPerDay: toNumber(perDay),
      }),
    [settings, wordCount, perDay],
  );

  const capacity = useMemo(() => wordsPerSession(settings), [settings]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Narration session estimate",
      `Script: ${NUM.format(result.words)} words at ${NUM.format(result.wordsPerMinute)} wpm`,
      `Clean read time: ${formatHoursMinutes(result.readMinutes)}`,
      `Retakes: ${NUM.format(result.retakeCount)} (${formatHoursMinutes(result.retakeMinutes)})`,
      `Vocal rest: ${formatHoursMinutes(result.breakMinutes)}`,
      `Setup across sessions: ${formatHoursMinutes(result.setupTotalMinutes)}`,
      `Total booth time: ${formatHoursMinutes(result.boothMinutes)}`,
      `Sessions: ${NUM.format(result.sessions)} · Days: ${NUM.format(result.days)}`,
      `Booth minutes per finished minute: ${NUM2.format(result.minutesPerFinishedMinute)}`,
    ].join("\n");
  }, [result]);

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
    setWordCount(DEFAULTS.wordCount);
    setWpm(DEFAULTS.wpm);
    setErrors(DEFAULTS.errors);
    setRetakeSeconds(DEFAULTS.retakeSeconds);
    setBreakPerHour(DEFAULTS.breakPerHour);
    setSetup(DEFAULTS.setup);
    setCap(DEFAULTS.cap);
    setPerDay(DEFAULTS.perDay);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Audio publishing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Narration Session Time Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A clean read is never the whole session. This adds punch-and-roll retakes, vocal rest and
          per-session setup to show how long you actually need the booth for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Script</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-words">
              Word count
            </label>
            <input
              id="nse-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={wordCount}
              onChange={(event) => setWordCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-wpm">
              Read pace (words per minute)
            </label>
            <input
              id="nse-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="80"
              max="260"
              step="5"
              value={wpm}
              onChange={(event) => setWpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-errors">
              Errors per 100 words
            </label>
            <input
              id="nse-errors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={errors}
              onChange={(event) => setErrors(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-retake">
              Seconds lost per retake
            </label>
            <input
              id="nse-retake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="1"
              value={retakeSeconds}
              onChange={(event) => setRetakeSeconds(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DIFFICULTY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setErrors(String(preset.errorsPerHundredWords))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Session shape</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-break">
              Vocal rest (minutes per hour)
            </label>
            <input
              id="nse-break"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              step="1"
              value={breakPerHour}
              onChange={(event) => setBreakPerHour(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-setup">
              Setup and warm-up per session (minutes)
            </label>
            <input
              id="nse-setup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="5"
              value={setup}
              onChange={(event) => setSetup(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-cap">
              Maximum session length (minutes)
            </label>
            <input
              id="nse-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="720"
              step="15"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-perday">
              Sessions per day
            </label>
            <input
              id="nse-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={perDay}
              onChange={(event) => setPerDay(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Total booth time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : formatHoursMinutes(result.boothMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the inputs to see the schedule."
                : `${NUM.format(result.sessions)} session${result.sessions === 1 ? "" : "s"} across ${NUM.format(result.days)} day${result.days === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Copied to clipboard" : "Copy the session estimate"}
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Clean read time", result.error ? DASH : formatHoursMinutes(result.readMinutes)],
            [
              "Retakes",
              result.error
                ? DASH
                : `${NUM.format(result.retakeCount)} × ${NUM.format(toNumber(retakeSeconds))}s = ${formatHoursMinutes(result.retakeMinutes)}`,
            ],
            ["Time actually voicing", result.error ? DASH : formatHoursMinutes(result.voicingMinutes)],
            ["Vocal rest", result.error ? DASH : formatHoursMinutes(result.breakMinutes)],
            ["Setup across all sessions", result.error ? DASH : formatHoursMinutes(result.setupTotalMinutes)],
            [
              "Booth minutes per finished minute",
              result.error ? DASH : `${NUM2.format(result.minutesPerFinishedMinute)}×`,
            ],
            [
              "Usable reading time per session",
              result.error ? DASH : formatHoursMinutes(result.usablePerSession),
            ],
            [
              "Words that fit in one session",
              capacity.error ? DASH : `${NUM.format(capacity.words)} words`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Reading is ${NUM1.format((result.readMinutes / result.boothMinutes) * 100)} percent of booth time, retakes ${NUM1.format((result.retakeMinutes / result.boothMinutes) * 100)} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${(result.readMinutes / result.boothMinutes) * 100}%` }}
              />
              <span
                className="block h-full bg-[var(--danger)]"
                style={{ width: `${(result.retakeMinutes / result.boothMinutes) * 100}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${(result.breakMinutes / result.boothMinutes) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Reading {NUM1.format((result.readMinutes / result.boothMinutes) * 100)}% · Retakes{" "}
              {NUM1.format((result.retakeMinutes / result.boothMinutes) * 100)}% · Rest{" "}
              {NUM1.format((result.breakMinutes / result.boothMinutes) * 100)}% · Setup{" "}
              {NUM1.format((result.setupTotalMinutes / result.boothMinutes) * 100)}%
            </p>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. A director or engineer in the session, unfamiliar names, character work and
        a tired voice all add time. Take vocal rest seriously — persistent hoarseness or pain is a
        reason to stop and see a clinician, not to push through another session.
      </p>
    </main>
  );
}
