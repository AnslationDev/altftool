"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Timer } from "lucide-react";
import {
  AGE_DECLINE_START,
  PERFORMANCE_BANDS,
  REFERENCE_HOLD_SECONDS,
  computePlankBenchmark,
  formatSeconds,
  targetSecondsForAge,
} from "../lib";

const DEFAULT_SECONDS = "60";
const DEFAULT_AGE = "35";
const DEFAULT_SEX = "unspecified";

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const AGE_PREVIEW = [25, 40, 50, 60, 70];

export default function ToolHome() {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);
  const [age, setAge] = useState(DEFAULT_AGE);
  const [sex, setSex] = useState(DEFAULT_SEX);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [copied, setCopied] = useState(false);

  // The stopwatch writes straight into the seconds field, so the result panel
  // updates live while the plank is being held.
  useEffect(() => {
    if (!running || startedAt === null) return undefined;
    const id = setInterval(() => {
      setSeconds(String(Math.floor((Date.now() - startedAt) / 1000)));
    }, 250);
    return () => clearInterval(id);
  }, [running, startedAt]);

  const startTimer = () => {
    const already = Math.max(0, Number(seconds) || 0);
    setStartedAt(Date.now() - already * 1000);
    setRunning(true);
  };

  const stopTimer = () => setRunning(false);

  const clearTimer = () => {
    setRunning(false);
    setStartedAt(null);
    setSeconds("0");
  };

  const result = useMemo(
    () => computePlankBenchmark({ seconds: Number(seconds), age: Number(age), sex }),
    [seconds, age, sex],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Plank hold benchmark",
      `Hold: ${result.heldLabel} (${result.heldSeconds} s)`,
      `Age-adjusted target: ${result.targetLabel} (${result.targetSeconds} s) for age ${result.age}`,
      `That is ${Math.round(result.percentOfTarget)}% of target — ${result.band}`,
      result.secondsToNextBand !== null
        ? `${result.secondsToNextBand} more seconds would reach ${result.nextBand}.`
        : "Already in the top band.",
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
    setSeconds(DEFAULT_SECONDS);
    setAge(DEFAULT_AGE);
    setSex(DEFAULT_SEX);
    setRunning(false);
    setStartedAt(null);
    setCopied(false);
  };

  const barPct = hasError ? 0 : Math.min(100, result.percentOfTarget);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Core endurance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Plank Hold Benchmark Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Hold a front plank on your forearms with a straight line from ears to heels, time it with
          the stopwatch below, and see how the hold compares with an age-adjusted target built from a{" "}
          {REFERENCE_HOLD_SECONDS}-second reference for healthy adults under {AGE_DECLINE_START}.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Stopwatch</h2>
        <p
          className="mt-3 text-center text-6xl font-semibold tabular-nums text-[var(--primary)]"
          aria-live="polite"
        >
          {formatSeconds(Number(seconds) || 0)}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {running ? (
            <button type="button" onClick={stopTimer} className={PRIMARY_BTN} aria-label="Stop the plank timer">
              <Pause className="h-4 w-4" aria-hidden="true" />
              Stop
            </button>
          ) : (
            <button type="button" onClick={startTimer} className={PRIMARY_BTN} aria-label="Start the plank timer">
              <Play className="h-4 w-4" aria-hidden="true" />
              Start
            </button>
          )}
          <button type="button" onClick={clearTimer} className={GHOST_BTN} aria-label="Clear the plank timer">
            Clear timer
          </button>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="plank-seconds">
              Hold time (seconds)
            </label>
            <input
              id="plank-seconds"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={seconds}
              onChange={(event) => {
                setRunning(false);
                setSeconds(event.target.value);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Typing here stops the stopwatch, so you can enter a time you recorded elsewhere.
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="plank-age">
              Age (years)
            </label>
            <input
              id="plank-age"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="13"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="plank-sex">
              Sex (recorded on the result only)
            </label>
            <select id="plank-sex" className={FIELD} value={sex} onChange={(event) => setSex(event.target.value)}>
              <option value="unspecified">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The target is not adjusted for sex — trunk endurance times are similar between men and
              women, unlike maximal strength lifts.
            </p>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Percent of your target
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.percentOfTarget)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Enter a hold time and age to see a comparison."
                : `${result.heldLabel} held against a ${result.targetLabel} target · ${result.band}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy plank benchmark result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset everything" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Hold time", hasError ? DASH : `${result.heldLabel} (${result.heldSeconds} s)`],
            ["Age-adjusted target", hasError ? DASH : `${result.targetLabel} (${result.targetSeconds} s)`],
            [
              "Difference",
              hasError ? DASH : `${result.differenceSeconds > 0 ? "+" : ""}${result.differenceSeconds} s`,
            ],
            ["Band", hasError ? DASH : result.band],
            [
              "To reach the next band",
              hasError
                ? DASH
                : result.secondsToNextBand === null
                  ? "Already in the top band"
                  : `${result.secondsToNextBand} more seconds → ${result.nextBand}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.bandNote && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.bandNote}
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Bands, as a share of your target</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Share of target</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">What to do next</th>
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {Math.round(band.min * 100)}%
                    {band.max === Infinity ? " and above" : ` – ${Math.round(band.max * 100)}%`}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Targets by age</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Age</th>
                <th scope="col" className="py-2 font-semibold">Target hold</th>
              </tr>
            </thead>
            <tbody>
              {AGE_PREVIEW.map((preview) => (
                <tr key={preview} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{preview}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">
                    {formatSeconds(targetSecondsForAge(preview))} ({targetSecondsForAge(preview)} s)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The reference is {REFERENCE_HOLD_SECONDS} seconds up to age {AGE_DECLINE_START - 1}, then
          reduced by 1% for every year beyond that, matching the roughly 1% per year decline in
          muscular endurance after 40.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational and for training use only, not a medical assessment. Form matters more than
        time: stop the moment your hips drop or your lower back arches, since a sagging plank loads
        the spine instead of training the core. Stop and seek advice if you feel back pain, numbness
        or pins and needles, and check with a clinician before testing if you are pregnant, recently
        post-operative or have a known back problem.
      </p>
    </main>
  );
}
