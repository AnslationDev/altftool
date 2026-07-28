"use client";

import { useMemo, useState } from "react";
import { Armchair, Check, Copy, RotateCcw } from "lucide-react";

import {
  BAND_BELOW,
  CHAIR_HEIGHT_CM,
  CHAIR_HEIGHT_IN,
  MAX_STANDS,
  MIN_TABLE_AGE,
  TEST_SECONDS,
  classifyChairStand,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const SIGNED = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  age: "72",
  sex: "male",
  stands: "14",
  duration: String(TEST_SECONDS),
  previous: "",
};
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
  const [stands, setStands] = useState(DEFAULTS.stands);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [previous, setPrevious] = useState(DEFAULTS.previous);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const prevRaw = String(previous).trim();
    return classifyChairStand({
      age: toNumber(age),
      sex,
      stands: toNumber(stands),
      durationSeconds: toNumber(duration),
      previousStands: prevRaw === "" ? null : toNumber(prevRaw),
    });
  }, [age, sex, stands, duration, previous]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Sit to Stand Test Tracker",
      `Age ${age}, ${sex} · ${result.ageGroup} reference band`,
      `${NUM.format(result.rawStands)} stands in ${NUM.format(result.durationSeconds)} s`,
      `30-second score: ${NUM.format(result.score)}`,
      `Normal range for age: ${result.rangeLow}-${result.rangeHigh}`,
      `Result: ${result.band}`,
    ];
    if (result.change) {
      lines.push(`Change vs previous test: ${SIGNED.format(result.change.delta)} stands`);
    }
    return lines.join("\n");
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
    setStands(DEFAULTS.stands);
    setDuration(DEFAULTS.duration);
    setPrevious(DEFAULTS.previous);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Armchair className="h-4 w-4" aria-hidden="true" />
          Functional fitness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sit to Stand Test Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count how many times you can stand fully from a chair in 30 seconds with your arms folded,
          then compare it with the Senior Fitness Test normal range for your age and sex.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sts-age">
              Age (years)
            </label>
            <input
              id="sts-age"
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
            <label className={LABEL_CLASS} htmlFor="sts-sex">
              Sex (reference range)
            </label>
            <select
              id="sts-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sts-stands">
              Full stands completed
            </label>
            <input
              id="sts-stands"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_STANDS}
              step="1"
              value={stands}
              onChange={(event) => setStands(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sts-duration">
              Test length (seconds)
            </label>
            <input
              id="sts-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="120"
              step="5"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sts-previous">
              Previous 30-second score (optional)
            </label>
            <input
              id="sts-previous"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_STANDS}
              step="1"
              placeholder="Leave blank to skip"
              value={previous}
              onChange={(event) => setPrevious(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              30-second score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.score)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your score."
                : `${result.band} · normal range ${result.rangeLow}-${result.rangeHigh} for ${result.ageGroup}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy chair stand test result"
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
                : `${NUM.format(result.rawStands)} in ${NUM.format(result.durationSeconds)} s`,
            ],
            [
              "Normal range for age and sex",
              hasError ? DASH : `${result.rangeLow}-${result.rangeHigh} stands`,
            ],
            ["Result", hasError ? DASH : result.band],
            [
              "Seconds per stand",
              hasError ? DASH : result.secondsPerStand ? `${NUM1.format(result.secondsPerStand)} s` : DASH,
            ],
            [
              "Stands to reach the normal range",
              hasError ? DASH : result.standsToNormal > 0 ? NUM.format(result.standsToNormal) : "0",
            ],
            [
              "Stands to beat the range",
              hasError ? DASH : result.standsToAbove > 0 ? NUM.format(result.standsToAbove) : "0",
            ],
            [
              "Change vs previous test",
              hasError
                ? DASH
                : result.change
                  ? `${SIGNED.format(result.change.delta)} stands`
                  : "No previous score entered",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.band === BAND_BELOW && (
          <p
            role="status"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
          >
            A score under the normal range is the CDC STEADI marker for below-average lower-body
            strength and a higher risk of falling. It is a prompt to talk to a clinician or
            physiotherapist about strength work, not a diagnosis.
          </p>
        )}

        {!hasError && result.change && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              result.change.improved
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.change.improved
              ? `Up ${NUM.format(Math.abs(result.change.delta))} stands on your previous score of ${NUM.format(result.change.previous)}.`
              : `Previous score ${NUM.format(result.change.previous)} · change ${SIGNED.format(result.change.delta)}. Repeat the test on a rested day before drawing conclusions.`}
          </p>
        )}

        {!hasError && result.normalised && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            Your test was not 30 seconds, so the count was scaled to a 30-second equivalent. Re-test at
            30 seconds for a true comparison with the published range.
          </p>
        )}

        {!hasError && result.belowTableAge && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The Senior Fitness Test norms begin at age {MIN_TABLE_AGE}. The {result.ageGroup} range is
            shown as the closest published reference — a healthy adult under {MIN_TABLE_AGE} would
            normally score above it.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How to run the test</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          <li>
            Use a straight-backed chair about {CHAIR_HEIGHT_CM} cm ({CHAIR_HEIGHT_IN} in) high, placed
            against a wall so it cannot slide.
          </li>
          <li>Sit in the middle of the seat, feet flat on the floor, arms crossed over the chest.</li>
          <li>On &quot;go&quot;, stand fully upright then sit fully back down, as many times as you can.</li>
          <li>
            Stop at {TEST_SECONDS} seconds. If you are more than halfway up when time runs out, count it
            as a full stand.
          </li>
          <li>Have someone stand by if your balance is uncertain, and stop if you feel dizzy.</li>
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational fitness reference only, not a medical assessment. If you have had a fall, feel
        unsteady, or have knee, hip or heart problems, do this test with supervision and discuss the
        result with your doctor or physiotherapist.
      </p>
    </main>
  );
}
