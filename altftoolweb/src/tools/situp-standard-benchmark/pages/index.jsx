"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_DURATION_SECONDS,
  MAX_REPS,
  MIN_DURATION_SECONDS,
  STANDARD_DURATION_SECONDS,
  classifySitups,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { age: "30", sex: "male", reps: "38", duration: String(STANDARD_DURATION_SECONDS) };
const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      classifySitups({
        age: toNumber(age),
        sex,
        reps: toNumber(reps),
        durationSeconds: toNumber(duration),
      }),
    [age, sex, reps, duration],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Situp Standard Benchmark",
      `Age ${age} (${result.ageGroup} band), ${sex}`,
      `${NUM.format(result.rawReps)} sit-ups in ${NUM.format(result.durationSeconds)} s`,
      `60-second equivalent: ${NUM.format(result.perMinute)}`,
      `Rating: ${result.band}`,
      result.nextBand
        ? `${NUM.format(result.repsToNextBand)} more to reach ${result.nextBand}`
        : "Top band reached",
    ].join("\n");
  }, [hasError, result, age, sex]);

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
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setReps(DEFAULTS.reps);
    setDuration(DEFAULTS.duration);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Fitness testing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Situp Standard Benchmark</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter how many bent-knee sit-ups you completed and how long the test ran. The count is
          scaled to a 60-second equivalent and scored against the YMCA sit-up norms for your age and
          sex.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="situp-age">
              Age (years)
            </label>
            <input
              id="situp-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="situp-sex">
              Sex (reference table)
            </label>
            <select
              id="situp-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="situp-reps">
              Sit-ups completed
            </label>
            <input
              id="situp-reps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_REPS}
              step="1"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="situp-duration">
              Test length (seconds)
            </label>
            <input
              id="situp-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_DURATION_SECONDS}
              max={MAX_DURATION_SECONDS}
              step="5"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[30, 60, 120].map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => setDuration(String(seconds))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {seconds} s test
            </button>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your rating
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.band}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your band."
                : `${NUM.format(result.perMinute)} sit-ups per minute · ${result.ageGroup} age band`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sit-up benchmark result"
              disabled={hasError}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            [
              "Raw count",
              hasError
                ? DASH
                : `${NUM.format(result.rawReps)} in ${NUM.format(result.durationSeconds)} s`,
            ],
            ["60-second equivalent", hasError ? DASH : NUM.format(result.perMinute)],
            ["Reps per second", hasError ? DASH : NUM2.format(result.repsPerSecond)],
            [
              "Next band",
              hasError ? DASH : result.nextBand ? result.nextBand : "Already in the top band",
            ],
            [
              "Reps to next band",
              hasError ? DASH : result.nextBand ? NUM.format(result.repsToNextBand) : "0",
            ],
            ["Average band starts at", hasError ? DASH : `${NUM.format(result.averageAt)} reps`],
            ["Excellent starts at", hasError ? DASH : `${NUM.format(result.excellentAt)} reps`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.normalised && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            Your test was not 60 seconds, so the count was scaled linearly. A scaled score from a very
            short or very long test is only an approximation — re-test at 60 seconds for a true
            comparison.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Reference bands · {result.ageGroup} · {sex === "male" ? "male" : "female"}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Rating
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Sit-ups in 60 s
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.name}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.current ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 text-right">
                      {row.max === null
                        ? `${NUM.format(row.min)}+`
                        : `${NUM.format(row.min)}${row.max > row.min ? `-${NUM.format(row.max)}` : ""}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational fitness reference only. Skip maximal sit-up testing if you have low back pain, a
        disc problem, are pregnant or recently post-partum, and check with a clinician first if you are
        unsure.
      </p>
    </main>
  );
}
