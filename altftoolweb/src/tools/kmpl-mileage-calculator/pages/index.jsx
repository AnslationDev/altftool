"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, Plus, RotateCcw, Trash2 } from "lucide-react";

import { computeMileageFromFills } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : "—");
const num1 = (value) => (Number.isFinite(value) ? NUM1.format(value) : "—");
const num2 = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const DEFAULT_FILLS = [
  { id: 1, odometer: "12500", litres: "30" },
  { id: 2, odometer: "12930", litres: "28.5" },
  { id: 3, odometer: "13350", litres: "27" },
];
const DEFAULT_PRICE = "105";

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

export default function ToolHome() {
  const [fills, setFills] = useState(DEFAULT_FILLS);
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_PRICE);
  const [copied, setCopied] = useState(false);

  const updateFill = (id, key, value) =>
    setFills((previous) =>
      previous.map((fill) => (fill.id === id ? { ...fill, [key]: value } : fill)),
    );

  const addFill = () =>
    setFills((previous) => {
      const nextId = previous.reduce((max, fill) => Math.max(max, fill.id), 0) + 1;
      const last = previous[previous.length - 1];
      const lastOdo = toNumber(last?.odometer);
      const nextOdo = Number.isFinite(lastOdo) ? String(Math.round(lastOdo + 400)) : "";
      return [...previous, { id: nextId, odometer: nextOdo, litres: "" }];
    });

  const removeFill = (id) =>
    setFills((previous) => (previous.length > 2 ? previous.filter((f) => f.id !== id) : previous));

  const result = useMemo(
    () =>
      computeMileageFromFills({
        fills: fills.map((fill) => ({
          odometer: toNumber(fill.odometer),
          litres: toNumber(fill.litres),
        })),
        fuelPrice: toNumber(fuelPrice),
      }),
    [fills, fuelPrice],
  );

  const error = result.error ?? null;
  const view = error ? null : result;

  const summary = useMemo(() => {
    if (!view) return "";
    return [
      "KMPL Mileage",
      `Distance measured: ${num1(view.totalDistance)} km`,
      `Fuel used: ${num2(view.totalLitres)} litres`,
      `True mileage: ${num2(view.overallKmpl)} km/l`,
      `Consumption: ${num2(view.litresPer100Km)} l/100 km`,
      `US mpg: ${num2(view.mpgUs)} · UK mpg: ${num2(view.mpgUk)}`,
      `Fuel cost per km: ${money(view.costPerKm)}`,
      `Best tank: ${num2(view.bestKmpl)} km/l · Worst tank: ${num2(view.worstKmpl)} km/l`,
    ].join("\n");
  }, [view]);

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
    setFills(DEFAULT_FILLS);
    setFuelPrice(DEFAULT_PRICE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Tank to tank
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">KMPL Mileage Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Brim the tank and note the odometer. Every time you brim it again, log the odometer and
          the litres dispensed. The first fill only sets the baseline — its litres are not counted.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Fill-up log</h2>
          <button type="button" onClick={addFill} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add fill
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {fills.map((fill, index) => (
            <li key={fill.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`kmpl-odo-${fill.id}`}>
                  {index === 0 ? "Baseline odometer (km)" : `Fill ${index + 1} odometer (km)`}
                </label>
                <input
                  id={`kmpl-odo-${fill.id}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={fill.odometer}
                  onChange={(event) => updateFill(fill.id, "odometer", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`kmpl-litres-${fill.id}`}>
                  {index === 0 ? "Litres (not counted)" : "Litres filled"}
                </label>
                <input
                  id={`kmpl-litres-${fill.id}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={fill.litres}
                  onChange={(event) => updateFill(fill.id, "litres", event.target.value)}
                  disabled={index === 0}
                />
              </div>
              <button
                type="button"
                onClick={() => removeFill(fill.id)}
                disabled={fills.length <= 2}
                aria-label={`Remove fill ${index + 1}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 max-w-xs">
          <label className={LABEL_CLASS} htmlFor="kmpl-price">
            Fuel price (per litre)
          </label>
          <input
            id="kmpl-price"
            className={INPUT_CLASS}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={fuelPrice}
            onChange={(event) => setFuelPrice(event.target.value)}
          />
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
              True mileage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {view ? `${num2(view.overallKmpl)} km/l` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {view
                ? `${num1(view.totalDistance)} km measured on ${num2(view.totalLitres)} litres`
                : "Fix the highlighted entry to see your mileage."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy mileage result"
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
              aria-label="Reset the fill log"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Consumption", view ? `${num2(view.litresPer100Km)} litres / 100 km` : "—"],
            ["US mpg", view ? num2(view.mpgUs) : "—"],
            ["Imperial (UK) mpg", view ? num2(view.mpgUk) : "—"],
            ["Fuel cost per km", view ? money(view.costPerKm) : "—"],
            ["Fuel cost per 100 km", view ? money0(view.costPer100Km) : "—"],
            ["Fuel bought in this log", view ? money0(view.fuelSpent) : "—"],
            ["Best tank", view ? `${num2(view.bestKmpl)} km/l` : "—"],
            ["Worst tank", view ? `${num2(view.worstKmpl)} km/l` : "—"],
            ["Spread between tanks", view ? `${num2(view.spread)} km/l` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Tank by tank</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tank
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Distance
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Litres
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  km/l
                </th>
              </tr>
            </thead>
            <tbody>
              {view ? (
                view.segments.map((segment) => (
                  <tr key={segment.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">Tank {segment.index}</td>
                    <td className="py-2 pr-3 text-right">{num1(segment.distance)} km</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num2(segment.litres)}
                    </td>
                    <td className="py-2 text-right font-semibold">{num2(segment.kmpl)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={4}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Accuracy depends on filling to the same brim level at the same pump each time, and on the
        vehicle standing level. Averaging three or more tanks smooths out fill differences far
        better than a single tank does.
      </p>
    </main>
  );
}
