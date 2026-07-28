"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import { BANDS, MAX_REPS, classifyPushups } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { age: "32", sex: "male", reps: "24" };
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
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => classifyPushups({ age: toNumber(age), sex, reps: toNumber(reps) }),
    [age, sex, reps],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pushup Standard Benchmark",
      `Age ${age} (${result.ageGroup} band), ${sex}`,
      `Push-ups: ${NUM.format(result.reps)}`,
      `Rating: ${result.band} (approx. ${result.percentile} percentile)`,
      result.nextBand
        ? `${NUM.format(result.repsToNextBand)} more rep(s) to reach ${result.nextBand}`
        : "Top band reached",
      `Protocol: ${result.protocol}`,
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
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Fitness testing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pushup Standard Benchmark</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the most push-ups you can do without stopping and see which rating band that falls in
          for your age and sex, using the CSEP push-up norms.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pushup-age">
              Age (years)
            </label>
            <input
              id="pushup-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pushup-sex">
              Sex (reference table)
            </label>
            <select
              id="pushup-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male — standard push-up</option>
              <option value="female">Female — modified (knee) push-up</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pushup-reps">
              Max push-ups in one unbroken set
            </label>
            <input
              id="pushup-reps"
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
              Your rating
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.band}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your band."
                : `${NUM.format(result.reps)} push-ups · ${result.ageGroup} age band`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy push-up benchmark result"
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
              "Approximate percentile",
              hasError ? DASH : result.percentile,
            ],
            [
              "Next band",
              hasError ? DASH : result.nextBand ? result.nextBand : "Already in the top band",
            ],
            [
              "Reps to next band",
              hasError ? DASH : result.nextBand ? NUM.format(result.repsToNextBand) : "0",
            ],
            [
              "Excellent starts at",
              hasError ? DASH : `${NUM.format(result.excellentAt)} reps`,
            ],
            ["Test protocol", hasError ? DASH : result.protocol],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.ageAboveTable && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            The published table stops at 69, so the 60-69 band is used as the closest reference.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Reference bands · {result.ageGroup} · {sex === "male" ? "standard" : "modified"} push-ups
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Rating
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Reps
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Percentile
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
                    <td className="py-2 pr-3 text-right">
                      {row.max === null
                        ? `${NUM.format(row.min)}+`
                        : `${NUM.format(row.min)}${row.max > row.min ? `-${NUM.format(row.max)}` : ""}`}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{row.percentile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Bands, best to worst: {BANDS.map((band) => band.name).join(", ")}.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational fitness reference only. Stop the test if you feel chest pain, dizziness or joint
        pain, and speak to a doctor before maximal testing if you have a heart, blood pressure or
        shoulder condition.
      </p>
    </main>
  );
}
