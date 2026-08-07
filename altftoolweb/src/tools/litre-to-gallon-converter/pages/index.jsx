"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fuel, RotateCcw } from "lucide-react";

import { UNITS, convertVolume, unitById } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : DASH);
const n4 = (v) => (Number.isFinite(v) ? N4.format(v) : DASH);

const DEFAULTS = { value: "50", unit: "l", price: "" };

const HIGHLIGHT = ["l", "usgal", "impgal"];

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      convertVolume({
        value: toNum(form.value),
        fromUnit: form.unit,
        pricePerUnit: form.price.trim() === "" ? 0 : toNum(form.price),
      }),
    [form],
  );

  const ok = !result.error;
  const from = unitById(form.unit);
  const hasPrice = ok && result.pricePerLitre > 0;

  const summary = ok
    ? [
        "Litre to Gallon Converter",
        `${form.value} ${from?.short ?? ""}`,
        `Litres: ${n4(result.byUnit.l)} L`,
        `US gallons: ${n4(result.byUnit.usgal)}`,
        `Imperial gallons: ${n4(result.byUnit.impgal)}`,
        `Millilitres: ${n2(result.byUnit.ml)} mL`,
        hasPrice ? `Price per litre: ${money(result.pricePerLitre)}` : null,
        hasPrice ? `Price per US gallon: ${money(result.prices.usgal)}` : null,
        hasPrice ? `Price per imperial gallon: ${money(result.prices.impgal)}` : null,
        hasPrice ? `Total for this volume: ${money(result.totalCost)}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fuel className="h-4 w-4" aria-hidden="true" />
          Volume
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Litre to Gallon Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The US gallon (3.785411784 L) and the imperial gallon (4.54609 L) are 20% apart. Convert
          between them and litres, and see what a fuel price works out to in each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="vol-value">
              Volume
            </label>
            <input
              id="vol-value"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.value}
              onChange={set("value")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="vol-unit">
              Unit
            </label>
            <select id="vol-unit" className={INPUT} value={form.unit} onChange={set("unit")}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="vol-price">
              Price per {from?.short ?? "unit"} (optional)
            </label>
            <input
              id="vol-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="e.g. 105.50"
              value={form.price}
              onChange={set("price")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "1 litre", value: "1", unit: "l" },
            { label: "35 L tank", value: "35", unit: "l" },
            { label: "1 US gallon", value: "1", unit: "usgal" },
            { label: "1 imperial gallon", value: "1", unit: "impgal" },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP}
              onClick={() =>
                setForm((prev) => ({ ...prev, value: preset.value, unit: preset.unit }))
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In US gallons
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite" aria-atomic="true">
              {ok ? `${n4(result.byUnit.usgal)} US gal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Same volume is ${n4(result.byUnit.impgal)} imperial gallons or ${n2(result.byUnit.l)} litres`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the volume conversion result"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {UNITS.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 py-2.5">
                <dt
                  className={
                    HIGHLIGHT.includes(u.id)
                      ? "font-semibold text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]"
                  }
                >
                  {u.label}
                </dt>
                <dd className="text-right font-semibold">
                  {ok ? `${n4(result.byUnit[u.id])} ${u.short}` : DASH}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Price comparison</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasPrice
            ? `Based on the price you entered per ${from?.short ?? "unit"}.`
            : "Enter a price above to see what the same fuel costs per litre and per gallon."}
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Per litre", hasPrice ? money(result.pricePerLitre) : DASH],
            ["Per US gallon", hasPrice ? money(result.prices.usgal) : DASH],
            ["Per imperial gallon", hasPrice ? money(result.prices.impgal) : DASH],
            ["Total for this volume", hasPrice ? money(result.totalCost) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Quick reference</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Litres
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  US gal
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Imp gal
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 5, 10, 20, 35, 50, 100].map((litres) => {
                const row = convertVolume({ value: litres, fromUnit: "l" });
                return (
                  <tr key={litres} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{litres}</td>
                    <td className="py-2 pr-3 text-right">{n4(row.byUnit.usgal)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {n4(row.byUnit.impgal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Volumes here are exact by definition. Fuel itself expands with heat — pumps in some markets
        correct to 15 °C, others dispense at ambient temperature — so a litre bought at noon holds
        slightly less energy than the same litre bought at dawn.
      </p>
    </main>
  );
}
