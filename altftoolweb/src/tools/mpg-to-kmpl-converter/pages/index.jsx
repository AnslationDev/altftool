"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import { UNITS, buildReferenceTable, convertFuelEconomy } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num2 = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");
const num3 = (value) => (Number.isFinite(value) ? NUM3.format(value) : "—");

const DEFAULTS = { value: "30", unit: "mpgUs", fuelPrice: "105" };

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
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

const REFERENCE = buildReferenceTable();

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertFuelEconomy({
        value: toNumber(value),
        unit,
        fuelPrice: toNumber(fuelPrice),
      }),
    [value, unit, fuelPrice],
  );

  const error = result.error ?? null;
  const view = error ? null : result;

  const rows = useMemo(
    () => [
      ["km per litre", view ? `${num3(view.kmpl)} km/l` : "—"],
      ["Miles per US gallon", view ? `${num2(view.mpgUs)} US mpg` : "—"],
      ["Miles per imperial gallon", view ? `${num2(view.mpgUk)} UK mpg` : "—"],
      ["Miles per litre", view ? `${num3(view.milesPerLitre)} mi/l` : "—"],
      ["Litres per 100 km", view ? `${num3(view.l100km)} l/100km` : "—"],
      ["US gallons per 100 miles", view ? num3(view.gallonsUsPer100Miles) : "—"],
      ["Fuel cost per km", view ? money(view.costPerKm) : "—"],
      ["Fuel cost per 100 km", view ? money(view.costPer100Km) : "—"],
    ],
    [view],
  );

  const summary = useMemo(() => {
    if (!view) return "";
    const from = UNITS.find((entry) => entry.id === unit);
    return [
      `Fuel economy: ${value} ${from ? from.short : ""}`.trim(),
      `${num3(view.kmpl)} km/l`,
      `${num2(view.mpgUs)} US mpg`,
      `${num2(view.mpgUk)} UK mpg`,
      `${num3(view.l100km)} litres per 100 km`,
      `Fuel cost per 100 km: ${money(view.costPer100Km)}`,
    ].join("\n");
  }, [view, unit, value]);

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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setFuelPrice(DEFAULTS.fuelPrice);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Fuel economy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">MPG to KMPL Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type a figure in any unit — US mpg, imperial mpg, km/l, miles per litre or litres per
          100 km — and read the equivalent in all the others, plus what it costs per kilometre.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="econ-value">
              Fuel economy figure
            </label>
            <input
              id="econ-value"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="econ-unit">
              Unit of that figure
            </label>
            <select
              id="econ-unit"
              className={INPUT_CLASS}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="econ-price">
              Fuel price per litre (for cost figures)
            </label>
            <input
              id="econ-price"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </div>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Equivalent in km per litre
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {view ? `${num2(view.kmpl)} km/l` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {view
                ? `${num2(view.l100km)} litres to cover 100 km`
                : "Fix the highlighted input to see the conversion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted fuel economy"
              className={GHOST_BTN}
              disabled={!view}
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
              aria-label="Reset the converter"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Quick reference</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  US mpg
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  km/l
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  UK mpg
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  l/100km
                </th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE.map((row) => (
                <tr key={row.mpgUs} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.mpgUs}</td>
                  <td className="py-2 pr-3 text-right">{num2(row.kmpl)}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {num2(row.mpgUk)}
                  </td>
                  <td className="py-2 text-right">{num2(row.l100km)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversions use exact definitions: 1 mile = 1.609344 km, 1 US gallon = 3.785411784 litres,
        1 imperial gallon = 4.54609 litres. US and UK mpg are not interchangeable — a UK gallon is
        about 20% larger, so the same car scores a higher number in UK mpg.
      </p>
    </main>
  );
}
