"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sigma } from "lucide-react";

import { METHODS, explain } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const show = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

/** Field metadata per method — labels and starting values only, no arithmetic. */
const FIELDS = {
  ssc: [
    ["raw", "Your raw marks (X)", "140", "Marks you actually scored in your shift."],
    ["shiftMean", "Mean of your shift (μi)", "88", "Average marks of everyone who sat your shift."],
    ["shiftSd", "Standard deviation of your shift (σi)", "22", "Spread of marks within your shift."],
    ["shiftTopMean", "Top 0.1% average of your shift (M̄i)", "168", "Average of the highest scorers in your shift."],
    ["globalMean", "Mean across all shifts (μg)", "95", "Average marks of every candidate in the exam."],
    ["globalSd", "Standard deviation across all shifts (σg)", "25", "Spread of marks across the whole exam."],
    ["globalTopMean", "Top 0.1% average, all shifts (M̄t)", "175", "Average of the highest scorers overall."],
  ],
  zscore: [
    ["raw", "Your raw marks (X)", "140", "Marks you actually scored in your shift."],
    ["shiftMean", "Mean of your shift (μi)", "88", ""],
    ["shiftSd", "Standard deviation of your shift (σi)", "22", "Must be greater than zero."],
    ["globalMean", "Mean across all shifts (μg)", "95", ""],
    ["globalSd", "Standard deviation across all shifts (σg)", "25", ""],
  ],
  nta: [
    ["candidatesAtOrBelow", "Candidates scoring at or below you", "250000", "Within your session only."],
    ["totalCandidates", "Total candidates in your session", "300000", "Everyone who appeared in that session."],
  ],
  minmax: [
    ["raw", "Your raw marks (X)", "140", ""],
    ["min", "Lowest mark observed", "20", ""],
    ["max", "Highest mark observed", "180", ""],
    ["targetMin", "Target scale minimum", "0", ""],
    ["targetMax", "Target scale maximum", "100", ""],
  ],
};

const buildDefaults = (method) =>
  Object.fromEntries(FIELDS[method].map(([key, , initial]) => [key, initial]));

const RESULT_LABEL = {
  ssc: "Normalized marks",
  zscore: "Normalized marks",
  nta: "NTA percentile score",
  minmax: "Scaled score",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [method, setMethod] = useState("ssc");
  const [values, setValues] = useState(() => ({
    ssc: buildDefaults("ssc"),
    zscore: buildDefaults("zscore"),
    nta: buildDefaults("nta"),
    minmax: buildDefaults("minmax"),
  }));
  const [copied, setCopied] = useState(false);

  const setField = (key, value) =>
    setValues((current) => ({ ...current, [method]: { ...current[method], [key]: value } }));

  const active = METHODS.find((m) => m.key === method) || METHODS[0];

  const result = useMemo(() => {
    const parsed = {};
    for (const [key] of FIELDS[method]) {
      const value = toNumber(values[method][key]);
      if (Number.isNaN(value)) return { error: "Every field needs a number before the formula can run." };
      parsed[key] = value;
    }
    return explain(method, parsed);
  }, [method, values]);

  const ok = !result.error;

  const copy = async () => {
    if (!ok) return;
    const lines = result.steps.map(
      (step, index) => `${index + 1}. ${step.label}: ${step.expression} = ${step.value}`,
    );
    const text = [`${active.name}`, active.formula, ...lines, `Result: ${result.result}`].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setValues({
      ssc: buildDefaults("ssc"),
      zscore: buildDefaults("zscore"),
      nta: buildDefaults("nta"),
      minmax: buildDefaults("minmax"),
    });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sigma className="h-4 w-4" aria-hidden="true" />
          Step by step
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Normalization Formula Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Multi-shift exams cannot compare raw marks, because no two papers are equally hard. Put your
          own numbers into the formula your exam actually uses and see every substitution.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="nf-method">
          Normalization method
        </label>
        <select
          id="nf-method"
          className={`mt-2 ${INPUT_CLASS}`}
          value={method}
          onChange={(event) => setMethod(event.target.value)}
        >
          {METHODS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-3">
          <p className="whitespace-nowrap font-mono text-sm font-semibold">{active.formula}</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">Used by: {active.used}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {FIELDS[method].map(([key, label, , hint]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`nf-${method}-${key}`}>
                {label}
              </label>
              <input
                id={`nf-${method}-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step="any"
                value={values[method][key]}
                onChange={(event) => setField(key, event.target.value)}
              />
              {hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>}
            </div>
          ))}
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {RESULT_LABEL[method]}
            </p>
            <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {ok ? show(result.result) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? method === "nta"
                  ? `Rank ${show(result.projectedRank)} in your session · ${show(result.candidatesAbove)} candidates ahead`
                  : method === "minmax"
                    ? `${show(result.fractionPercent)}% of the way up the observed range`
                    : `${result.adjustment >= 0 ? "+" : "−"}${show(Math.abs(result.adjustment))} against your raw marks`
                : "Fill every field to run the formula"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!ok}
              aria-label="Copy the worked steps"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {method === "zscore" && (
          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Z-score", ok ? show(result.z) : "—"],
              ["T-score", ok ? show(result.tScore) : "—"],
              ["Percentile (normal curve)", ok ? `${show(result.percentile)}%` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-[var(--muted)] px-3 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {label}
                </dt>
                <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <h2 className="mt-6 text-base font-semibold">Worked steps</h2>
        <ol className="mt-3 grid gap-3">
          {ok ? (
            result.steps.map((step, index) => (
              <li key={step.label} className="rounded-md bg-[var(--muted)] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold">{step.label}</p>
                <div className="mt-2 overflow-x-auto">
                  <p className="whitespace-nowrap font-mono text-sm">
                    {step.expression} <span className="text-[var(--muted-foreground)]">=</span>{" "}
                    <span className="font-semibold text-[var(--primary)]">{show(step.value)}</span>
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="rounded-md bg-[var(--muted)] px-3 py-3 text-sm text-[var(--muted-foreground)]">
              —
            </li>
          )}
        </ol>

        {ok && method === "minmax" && result.outsideRange && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Your mark lies outside the lowest-to-highest range you entered, so the result is
            extrapolated beyond the target scale rather than scaled within it.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The four methods</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Method</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Formula</th>
                <th scope="col" className="py-2 font-semibold">Where it is used</th>
              </tr>
            </thead>
            <tbody>
              {METHODS.map((item) => (
                <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.name}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.formula}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{item.used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are the published formulas applied to figures you supply. Shift means, standard
        deviations and top-0.1% averages are released by the conducting body after the exam, so a
        result computed from estimates is an illustration, not your actual score.
      </p>
    </main>
  );
}
