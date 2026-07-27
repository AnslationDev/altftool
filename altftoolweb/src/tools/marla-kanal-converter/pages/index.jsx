"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid2x2, RotateCcw } from "lucide-react";

import { MARLA_STANDARDS, buildUnits, compareStandards, convertMarla } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const N4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => (String(raw).trim() === "" ? NaN : Number(String(raw).trim()));
const UNIT_OPTIONS = buildUnits("revenue");

export default function ToolHome() {
  const [value, setValue] = useState("5");
  const [unit, setUnit] = useState("marla");
  const [standardId, setStandardId] = useState("revenue");
  const [rate, setRate] = useState("4000000");
  const [rateUnit, setRateUnit] = useState("marla");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertMarla({
        value: num(value),
        unit,
        standardId,
        rate: num(rate) || 0,
        rateUnit,
      }),
    [value, unit, standardId, rate, rateUnit],
  );
  const hasError = Boolean(result.error);

  const comparison = useMemo(() => {
    if (hasError) return { error: result.error };
    return compareStandards(result.areas.marla);
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Marla and kanal conversion", result.standard.label];
    result.units.forEach((u) => {
      lines.push(`${u.label}: ${N4.format(result.areas[u.id])}`);
    });
    lines.push(
      `Spoken as: ${result.spoken.kanal} kanal ${result.spoken.marla} marla ${N2.format(result.spoken.sarsai)} sarsai`,
    );
    if (result.pricing) {
      lines.push(`Total value: ${INR.format(result.pricing.total)}`);
      lines.push(`Rate per marla: ${INR2.format(result.pricing.perUnit.marla)}`);
      lines.push(`Rate per sq ft: ${INR2.format(result.pricing.perUnit.sqft)}`);
    }
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

  const reset = () => {
    setValue("5");
    setUnit("marla");
    setStandardId("revenue");
    setRate("4000000");
    setRateUnit("marla");
    setCopied(false);
  };

  const activeStandard = MARLA_STANDARDS.find((s) => s.id === standardId) ?? MARLA_STANDARDS[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grid2x2 className="h-4 w-4" aria-hidden="true" />
          Plot area
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Marla Kanal Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Twenty marla make a kanal and eight kanal make an acre. Convert a plot across sarsai,
          marla, kanal, killa and murabba as well as square feet, square yards and square metres —
          under either the revenue marla of 272.25 sq ft or the 225 sq ft society marla.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Which marla does your layout use?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {MARLA_STANDARDS.map((standard) => (
              <button
                key={standard.id}
                type="button"
                onClick={() => setStandardId(standard.id)}
                aria-pressed={standardId === standard.id}
                className={standardId === standard.id ? PRIMARY_BTN : GHOST_BTN}
              >
                {standard.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{activeStandard.note}</p>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="marla-value">
              Area
            </label>
            <input
              id="marla-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="marla-unit">
              Unit
            </label>
            <select
              id="marla-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.short}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="marla-rate">
              Rate (₹, leave blank to skip pricing)
            </label>
            <input
              id="marla-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="marla-rateunit">
              Rate is quoted per
            </label>
            <select
              id="marla-rateunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateUnit}
              onChange={(event) => setRateUnit(event.target.value)}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.short}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["1", "3", "5", "7", "10", "20"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setUnit("marla");
                setValue(preset);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} marla
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In square feet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${N2.format(result.areas.sqft)} sq ft`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the conversion."
                : `${N0.format(result.spoken.kanal)} kanal ${N0.format(result.spoken.marla)} marla ${N2.format(result.spoken.sarsai)} sarsai`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy marla and kanal conversion"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError ? UNIT_OPTIONS : result.units).map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{u.label}</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : N4.format(result.areas[u.id])}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Plot value</h2>
        {hasError || !result.pricing ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {hasError ? DASH : "Enter a rate above to price this plot."}
          </p>
        ) : (
          <>
            <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">
              {INR.format(result.pricing.total)}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Same price as</th>
                    <th scope="col" className="py-2 text-right font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {result.units.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">Per {u.short}</td>
                      <td className="py-2 text-right font-semibold">
                        {INR2.format(result.pricing.perUnit[u.id])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which marla was it sold as?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The same marla count means two different plots depending on the convention — worth
          confirming on the site plan before you sign.
        </p>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "As revenue marla (272.25 sq ft)",
              comparison.error ? DASH : `${N2.format(comparison.sqftRevenue)} sq ft`,
            ],
            [
              "As society marla (225 sq ft)",
              comparison.error ? DASH : `${N2.format(comparison.sqftSociety)} sq ft`,
            ],
            [
              "Difference",
              comparison.error ? DASH : `${N2.format(comparison.differenceSqft)} sq ft`,
            ],
          ].map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sarsai, marla, kanal, killa and murabba are fixed fractions of the acre in the revenue
        system, so those conversions are exact. Informational only — the area in the jamabandi or
        sale deed governs any transaction.
      </p>
    </main>
  );
}
