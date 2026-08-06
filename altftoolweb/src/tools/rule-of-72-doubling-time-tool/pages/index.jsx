"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hourglass, RotateCcw } from "lucide-react";

import {
  COMPOUNDING_OPTIONS,
  computeDoublingTime,
  formatDuration,
  rateToDoubleIn,
} from "../lib";

const AMOUNT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);
const amount = (value) => (Number.isFinite(value) ? AMOUNT.format(value) : DASH);
const years = (value) => (Number.isFinite(value) ? `${num(value)} yrs` : DASH);

const DEFAULTS = {
  rate: "8",
  frequency: "1",
  principal: "100000",
  inflation: "0",
  target: "10",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const r = toNumber(rate);
    const p = toNumber(principal);
    const inf = toNumber(inflation);
    if ([r, p, inf].some((value) => Number.isNaN(value))) {
      return { error: "Enter a valid number in every field." };
    }
    const continuous = frequency === "continuous";
    return computeDoublingTime({
      ratePercent: r,
      compoundsPerYear: continuous ? 1 : Number(frequency),
      continuous,
      principal: p,
      inflationPercent: inf,
    });
  }, [rate, frequency, principal, inflation]);

  const inverse = useMemo(() => {
    const t = toNumber(target);
    if (Number.isNaN(t)) return { error: "Enter a number of years." };
    return rateToDoubleIn(t);
  }, [target]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Rule of 72 / doubling time",
      `Rate of return: ${num(result.ratePercent)}% per year`,
      `Compounding: ${
        result.continuous
          ? "continuous"
          : COMPOUNDING_OPTIONS.find((o) => o.value === result.compoundsPerYear)?.label ?? "annual"
      }`,
      `Rule of 72 estimate: ${num(result.rule72Years)} years`,
      `Exact doubling time: ${num(result.exactDouble)} years (${formatDuration(result.exactDouble)})`,
      `Shortcut error: ${num(result.errorPercent)}%`,
      `Time to triple: ${num(result.exactTriple)} years`,
      `Time to 10x: ${num(result.exactTenfold)} years`,
      result.principal > 0
        ? `${amount(result.principal)} becomes ${amount(result.doubledValue)}`
        : null,
      Number.isFinite(result.realRate)
        ? Number.isFinite(result.realDouble)
          ? `After ${num(toNumber(inflation))}% inflation, real doubling takes ${num(result.realDouble)} years`
          : `After ${num(toNumber(inflation))}% inflation, the real return is ${num(result.realRate)}% — purchasing power never doubles`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, inflation]);

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
    setRate(DEFAULTS.rate);
    setFrequency(DEFAULTS.frequency);
    setPrincipal(DEFAULTS.principal);
    setInflation(DEFAULTS.inflation);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hourglass className="h-4 w-4" aria-hidden="true" />
          Compound growth
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Rule of 72 and Doubling Time Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Divide 72 by your annual return to estimate the years until money doubles — then compare
          that shortcut with the exact answer, ln(2) / ln(1 + r), for your compounding frequency.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="r72-rate">
              Annual rate of return (%)
            </label>
            <input
              id="r72-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.01"
              max="100"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="r72-frequency">
              Compounding frequency
            </label>
            <select
              id="r72-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {COMPOUNDING_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
              <option value="continuous">Continuous</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="r72-principal">
              Starting amount (any currency)
            </label>
            <input
              id="r72-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="r72-inflation">
              Inflation (% per year, optional)
            </label>
            <input
              id="r72-inflation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={inflation}
              onChange={(event) => setInflation(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["4", "6", "8", "12", "15"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setRate(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset}%
            </button>
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
          <div aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Exact time to double
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? years(result.exactDouble) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? formatDuration(result.exactDouble) : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy doubling time result"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rule of 72 shortcut (72 ÷ rate)", ok ? years(result.rule72Years) : DASH],
            ["Rule of 70 shortcut", ok ? years(result.rule70Years) : DASH],
            ["Rule of 69.3 (continuous compounding)", ok ? years(result.rule693Years) : DASH],
            ["Eckart-McHale adjusted rule", ok ? years(result.emYears) : DASH],
            [
              "How far the Rule of 72 is off",
              ok ? `${num(result.errorPercent)}% (${num(result.errorYears)} yrs)` : DASH,
            ],
            ["Time to triple (Rule of 114 ≈ " + (ok ? years(result.rule114Years) : DASH) + ")", ok ? years(result.exactTriple) : DASH],
            ["Time to quadruple (Rule of 144)", ok ? years(result.exactQuadruple) : DASH],
            ["Time to grow 10x", ok ? years(result.exactTenfold) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every doubling from here</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each row is one more doubling at the same compound rate.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Growth
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Exact years
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rule of 72
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.milestones : [2, 4, 8, 16, 32].map((m) => ({ multiple: m }))).map(
                (row) => (
                  <tr key={row.multiple} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.multiple}x</td>
                    <td className="py-2 pr-3 text-right">{years(row.years)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {years(row.shortcutYears)}
                    </td>
                    <td className="py-2 text-right">{amount(row.value)}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      {ok && Number.isFinite(result.realRate) && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">After inflation</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Real (inflation-adjusted) return</dt>
              <dd className="text-right font-semibold">{num(result.realRate)}%</dd>
            </div>
            {Number.isFinite(result.realDouble) ? (
              [
                ["Years to double purchasing power", years(result.realDouble)],
                ["Rule of 72 on the real return", years(result.realRule72)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))
            ) : (
              <div className="py-2.5">
                <p className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
                  Purchasing power shrinks over time at this inflation rate — it never doubles.
                </p>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Work backwards</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="r72-target">
              I want to double my money in (years)
            </label>
            <input
              id="r72-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="rounded-md bg-[var(--muted)] p-4" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Required annual return
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {inverse.error ? DASH : `${num(inverse.exactRate)}%`}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {inverse.error
                ? inverse.error
                : `Rule of 72 shortcut: ${num(inverse.shortcutRate)}%`}
            </p>
          </div>
        </div>
        {inverse.error && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {inverse.error}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational estimates based on a constant compound rate. Real returns vary year to year, and
        taxes, fees and charges shorten nothing — they lengthen the wait. Speak to a licensed
        adviser before acting on any projection.
      </p>
    </main>
  );
}
