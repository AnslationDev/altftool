"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Map, RotateCcw } from "lucide-react";

import { AREA_UNITS, asAcresAndGunthas, convertGuntha } from "../lib";

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
const numOrZero = (raw) => (String(raw).trim() === "" ? 0 : Number(String(raw).trim()));

export default function ToolHome() {
  const [mode, setMode] = useState("single");
  const [value, setValue] = useState("20");
  const [unit, setUnit] = useState("guntha");
  const [hectares, setHectares] = useState("1");
  const [ares, setAres] = useState("20");
  const [sqmPart, setSqmPart] = useState("50");
  const [rate, setRate] = useState("1500000");
  const [rateUnit, setRateUnit] = useState("guntha");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertGuntha({
        mode,
        value: num(value),
        unit,
        hectares: numOrZero(hectares),
        ares: numOrZero(ares),
        sqmPart: numOrZero(sqmPart),
        rate: num(rate) || 0,
        rateUnit,
      }),
    [mode, value, unit, hectares, ares, sqmPart, rate, rateUnit],
  );
  const hasError = Boolean(result.error);

  const spoken = useMemo(() => {
    if (hasError) return { error: result.error };
    return asAcresAndGunthas(result.areas.guntha);
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Guntha conversion"];
    AREA_UNITS.forEach((au) => {
      lines.push(`${au.label}: ${N4.format(result.areas[au.id])}`);
    });
    lines.push(
      `Land record entry: ${result.record.hectares} H - ${result.record.ares} R - ${N2.format(result.record.sqm)} sq m`,
    );
    if (!spoken.error) {
      lines.push(`Spoken as: ${spoken.acres} acre ${N2.format(spoken.gunthas)} guntha`);
    }
    if (result.pricing) {
      lines.push(`Total value: ${INR.format(result.pricing.total)}`);
      lines.push(`Rate per guntha: ${INR2.format(result.pricing.perUnit.guntha)}`);
      lines.push(`Rate per acre: ${INR2.format(result.pricing.perUnit.acre)}`);
    }
    return lines.join("\n");
  }, [hasError, result, spoken]);

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
    setMode("single");
    setValue("20");
    setUnit("guntha");
    setHectares("1");
    setAres("20");
    setSqmPart("50");
    setRate("1500000");
    setRateUnit("guntha");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Map className="h-4 w-4" aria-hidden="true" />
          Land record
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Guntha to Sqft Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One guntha is 1,089 sq ft — a 33 ft square — and 40 guntha make an acre. Convert between
          guntha, acre, are, hectare, square feet and square metres, and read a 7/12 extract or RTC
          entry written as hectare, are and square metre.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Start from</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["single", "One unit"],
              ["hrp", "7/12 entry (H-R-P)"],
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

        {mode === "single" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="guntha-value">
                Area
              </label>
              <input
                id="guntha-value"
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
              <label className={LABEL_CLASS} htmlFor="guntha-unit">
                Unit
              </label>
              <select
                id="guntha-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                {AREA_UNITS.map((au) => (
                  <option key={au.id} value={au.id}>
                    {au.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="guntha-h">
                Hectare (H)
              </label>
              <input
                id="guntha-h"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={hectares}
                onChange={(event) => setHectares(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="guntha-r">
                Are (R), 0–99
              </label>
              <input
                id="guntha-r"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="99"
                step="1"
                value={ares}
                onChange={(event) => setAres(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="guntha-p">
                Square metre (P), 0–99
              </label>
              <input
                id="guntha-p"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="99"
                step="1"
                value={sqmPart}
                onChange={(event) => setSqmPart(event.target.value)}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="guntha-rate">
              Rate (₹, leave blank to skip pricing)
            </label>
            <input
              id="guntha-rate"
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
            <label className={LABEL_CLASS} htmlFor="guntha-rateunit">
              Rate is quoted per
            </label>
            <select
              id="guntha-rateunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateUnit}
              onChange={(event) => setRateUnit(event.target.value)}
            >
              {AREA_UNITS.map((au) => (
                <option key={au.id} value={au.id}>
                  {au.short}
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
              {hasError || spoken.error
                ? "Fix the input above to see the conversion."
                : `${N2.format(result.areas.guntha)} guntha — ${N0.format(spoken.acres)} acre ${N2.format(spoken.gunthas)} guntha`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy guntha conversion"
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
          {AREA_UNITS.map((au) => (
            <div key={au.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{au.label}</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : N4.format(result.areas[au.id])}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">As a land record entry (H - R - sq m)</dt>
            <dd className="text-right font-semibold">
              {hasError
                ? DASH
                : `${N0.format(result.record.hectares)} - ${N0.format(result.record.ares)} - ${N2.format(result.record.sqm)}`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Land value</h2>
        {hasError || !result.pricing ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {hasError ? DASH : "Enter a rate above to value this land."}
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
                  {AREA_UNITS.map((au) => (
                    <tr key={au.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">Per {au.short}</td>
                      <td className="py-2 text-right font-semibold">
                        {INR2.format(result.pricing.perUnit[au.id])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Guntha, acre, are and hectare are fixed ratios and convert exactly. Revenue records are
        maintained in metric units, so for any transaction use the hectare-are-square metre figure
        printed on the 7/12 extract or RTC rather than a converted one.
      </p>
    </main>
  );
}
