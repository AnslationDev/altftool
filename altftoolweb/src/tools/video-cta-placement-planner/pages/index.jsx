"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Megaphone, RotateCcw } from "lucide-react";

import {
  durationFromParts,
  END_SCREEN_MAX_SECONDS,
  END_SCREEN_MIN_SECONDS,
  LIMITS,
  MAX_CARDS,
  planCtas,
  STYLES,
  timecode,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  minutes: "10",
  seconds: "0",
  ctaCount: "3",
  hook: "30",
  style: "balanced",
  endScreen: "20",
  useEndScreen: true,
};

const DASH = "—";

export default function ToolHome() {
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [ctaCount, setCtaCount] = useState(DEFAULTS.ctaCount);
  const [hook, setHook] = useState(DEFAULTS.hook);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [endScreen, setEndScreen] = useState(DEFAULTS.endScreen);
  const [useEndScreen, setUseEndScreen] = useState(DEFAULTS.useEndScreen);
  const [copied, setCopied] = useState(false);

  const durationSeconds = durationFromParts(minutes, seconds);

  const result = useMemo(
    () =>
      planCtas({
        durationSeconds,
        ctaCount: Number(ctaCount),
        hookSeconds: Number(hook),
        style,
        endScreenSeconds: Number(endScreen),
        useEndScreen,
      }),
    [durationSeconds, ctaCount, hook, style, endScreen, useEndScreen],
  );

  const hasError = Boolean(result.error);
  const activeStyle = STYLES.find((item) => item.id === style);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `CTA plan for a ${timecode(result.durationSeconds)} video`,
      `Hook kept clear for the first ${result.hookSeconds}s`,
      "",
      ...result.placements.map((item) => `${item.timecode}  ${item.label} — ${item.note}`),
      "",
      ...result.warnings.map((warning) => `! ${warning}`),
    ]
      .filter((line) => line !== undefined)
      .join("\n");
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
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setCtaCount(DEFAULTS.ctaCount);
    setHook(DEFAULTS.hook);
    setStyle(DEFAULTS.style);
    setEndScreen(DEFAULTS.endScreen);
    setUseEndScreen(DEFAULTS.useEndScreen);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Video marketing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Video CTA Placement Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns a video length into timestamped call-to-action slots: the hook stays clear of any
          ask, mid-roll asks are spaced across the body, and the end screen sits in the last 5-20
          seconds where YouTube actually allows it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="cta-minutes">
                Length (minutes)
              </label>
              <input
                id="cta-minutes"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="720"
                step="1"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cta-seconds">
                Length (seconds)
              </label>
              <input
                id="cta-seconds"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                step="1"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cta-count">
              Calls to action in total
            </label>
            <input
              id="cta-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.ctaCount.min}
              max={LIMITS.ctaCount.max}
              step="1"
              value={ctaCount}
              onChange={(event) => setCtaCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cta-hook">
              Hook to keep clear (seconds)
            </label>
            <input
              id="cta-hook"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.hookSeconds.min}
              max={LIMITS.hookSeconds.max}
              step="5"
              value={hook}
              onChange={(event) => setHook(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cta-style">
              Placement style
            </label>
            <select
              id="cta-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cta-endscreen">
              End screen length (seconds)
            </label>
            <input
              id="cta-endscreen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={END_SCREEN_MIN_SECONDS}
              max={END_SCREEN_MAX_SECONDS}
              step="1"
              value={endScreen}
              onChange={(event) => setEndScreen(event.target.value)}
              disabled={!useEndScreen}
            />
          </div>
          <div className="flex items-end">
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="cta-use-endscreen">
              <input
                id="cta-use-endscreen"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={useEndScreen}
                onChange={(event) => setUseEndScreen(event.target.checked)}
              />
              Reserve the last slot for an end screen
            </label>
          </div>
        </div>
        {activeStyle && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeStyle.blurb}</p>
        )}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              First call to action at
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : result.placements[0].timecode}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings to build a plan."
                : `${result.placements.length} asks across ${timecode(result.durationSeconds)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the CTA plan" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div className="relative h-10 w-full overflow-hidden rounded-md bg-[var(--muted)]">
              <span
                className="absolute inset-y-0 left-0 bg-[var(--border)]"
                style={{ width: `${(result.hookSeconds / result.durationSeconds) * 100}%` }}
                aria-hidden="true"
              />
              {result.placements.map((item) => (
                <span
                  key={item.seconds}
                  className="absolute inset-y-0 w-1 bg-[var(--primary)]"
                  style={{ left: `${(item.seconds / result.durationSeconds) * 100}%` }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Shaded block on the left is the protected hook. Each bar is one ask.
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Video length", hasError ? DASH : timecode(result.durationSeconds)],
            ["Hook kept clear", hasError ? DASH : `${result.hookSeconds} s`],
            ["Body available for asks", hasError ? DASH : timecode(result.bodySeconds)],
            ["End screen starts", hasError || !result.endScreenUsed ? DASH : timecode(result.endScreenStart)],
            ["Cards needed", hasError ? DASH : `${result.cardCount} of ${MAX_CARDS} allowed`],
            ["Asks per minute", hasError ? DASH : result.ctaPerMinute.toFixed(2)],
            [
              "Closest two asks",
              hasError || result.tightestGapSeconds === null ? DASH : `${Math.round(result.tightestGapSeconds)} s apart`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Check these</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2 text-[var(--danger)]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Placement sheet</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Ask</th>
                  <th scope="col" className="py-2 font-semibold">How to deliver it</th>
                </tr>
              </thead>
              <tbody>
                {result.placements.map((item) => (
                  <tr key={item.seconds} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3 font-mono font-semibold tabular-nums">{item.timecode}</td>
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timings follow YouTube's published limits: end screens run in the final 5-20 seconds of a
        video at least 25 seconds long, and a video can carry at most {MAX_CARDS} cards. Where you
        place the mid-roll asks is a judgement call — check your own retention graph and move them.
      </p>
    </main>
  );
}
