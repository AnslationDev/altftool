"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LandPlot, RotateCcw } from "lucide-react";

import { LENGTH_UNITS, PLOT_UNITS, convertGaj, otherSide } from "../lib";

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
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => (String(raw).trim() === "" ? NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [mode, setMode] = useState("area");
  const [value, setValue] = useState("100");
  const [unit, setUnit] = useState("gaj");
  const [length, setLength] = useState("25");
  const [width, setWidth] = useState("45");
  const [lengthUnit, setLengthUnit] = useState("ft");
  const [rate, setRate] = useState("50000");
  const [rateUnit, setRateUnit] = useState("gaj");
  const [knownSide, setKnownSide] = useState("30");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertGaj({
        mode,
        value: num(value),
        unit,
        length: num(length),
        width: num(width),
        lengthUnit,
        rate: num(rate) || 0,
        rateUnit,
      }),
    [mode, value, unit, length, width, lengthUnit, rate, rateUnit],
  );
  const hasError = Boolean(result.error);

  const side = useMemo(() => {
    if (hasError) return { error: result.error };
    return otherSide({ sqft: result.sqft, sideFt: num(knownSide) });
  }, [hasError, result, knownSide]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Gaj to square feet conversion"];
    PLOT_UNITS.forEach((pu) => {
      lines.push(`${pu.label}: ${N4.format(result.areas[pu.id])}`);
    });
    if (result.pricing) {
      lines.push(`Total value: ${INR.format(result.pricing.total)}`);
      lines.push(`Rate per gaj: ${INR2.format(result.pricing.perUnit.gaj)}`);
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
    setMode("area");
    setValue("100");
    setUnit("gaj");
    setLength("25");
    setWidth("45");
    setLengthUnit("ft");
    setRate("50000");
    setRateUnit("gaj");
    setKnownSide("30");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LandPlot className="h-4 w-4" aria-hidden="true" />
          Plot area
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gaj to Sqft Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Gaj is a square yard, so one gaj is exactly 9 square feet. Convert a plot between gaj,
          square feet, square metres, biswa, marla, kanal and acres, price it at a rate per gaj, and
          see how big it is in the bigha your state uses.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Start from</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["area", "An area"],
              ["dimensions", "Length × width"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={mode === id}
                className={mode === id ? `${PRIMARY_BTN} flex-1 sm:flex-none` : `${GHOST_BTN} flex-1 sm:flex-none`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {mode === "area" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="gaj-value">
                Area
              </label>
              <input
                id="gaj-value"
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
              <label className={LABEL_CLASS} htmlFor="gaj-unit">
                Unit
              </label>
              <select
                id="gaj-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                {PLOT_UNITS.map((pu) => (
                  <option key={pu.id} value={pu.id}>
                    {pu.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="gaj-length">
                Length
              </label>
              <input
                id="gaj-length"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={length}
                onChange={(event) => setLength(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="gaj-width">
                Width
              </label>
              <input
                id="gaj-width"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="gaj-lengthunit">
                Measured in
              </label>
              <select
                id="gaj-lengthunit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={lengthUnit}
                onChange={(event) => setLengthUnit(event.target.value)}
              >
                {LENGTH_UNITS.map((lu) => (
                  <option key={lu.id} value={lu.id}>
                    {lu.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gaj-rate">
              Rate (₹, leave blank to skip pricing)
            </label>
            <input
              id="gaj-rate"
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
            <label className={LABEL_CLASS} htmlFor="gaj-rateunit">
              Rate is quoted per
            </label>
            <select
              id="gaj-rateunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateUnit}
              onChange={(event) => setRateUnit(event.target.value)}
            >
              {PLOT_UNITS.map((pu) => (
                <option key={pu.id} value={pu.id}>
                  {pu.short}
                </option>
              ))}
            </select>
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
              In square feet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${N2.format(result.areas.sqft)} sq ft`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the conversion."
                : `${N2.format(result.areas.gaj)} gaj · ${N2.format(result.areas.sqm)} sq m`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy gaj conversion"
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
          {PLOT_UNITS.map((pu) => (
            <div key={pu.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{pu.label}</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : N4.format(result.areas[pu.id])}
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
                  {PLOT_UNITS.map((pu) => (
                    <tr key={pu.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">Per {pu.short}</td>
                      <td className="py-2 text-right font-semibold">
                        {INR2.format(result.pricing.perUnit[pu.id])}
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
        <h2 className="text-base font-semibold">Bigha, by state</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Bigha is not a standardised unit. These are the compositions commonly used in each place —
          always confirm against the khasra or khatauni entry for the land itself.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Local bigha</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Sq ft each</th>
                <th scope="col" className="py-2 text-right font-semibold">This plot</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.bighas).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {N2.format(row.sqftPerBigha)}
                  </td>
                  <td className="py-2 text-right font-semibold">{N4.format(row.bighas)}</td>
                </tr>
              ))}
              {hasError && (
                <tr>
                  <td className="py-2 pr-3" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Plot shape check</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gaj-side">
              One side (feet)
            </label>
            <input
              id="gaj-side"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={knownSide}
              onChange={(event) => setKnownSide(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Other side must be
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {side.error ? DASH : `${N2.format(side.otherSideFt)} ft`}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              For a rectangular plot of this area.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Gaj, marla, kanal and acre conversions here are exact ratios. Informational only — for a
        registry or a loan, use the area recorded in the sale deed and the local revenue record.
      </p>
    </main>
  );
}
