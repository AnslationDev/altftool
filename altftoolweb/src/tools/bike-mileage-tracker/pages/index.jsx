"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fuel, Plus, RotateCcw, Trash2 } from "lucide-react";

import { computeFuelLog } from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const MAX_FILLS = 20;

const DEFAULT_FILLS = [
  { key: 1, odometer: "12000", litres: "6", price: "104", full: true },
  { key: 2, odometer: "12300", litres: "6", price: "104", full: true },
  { key: 3, odometer: "12500", litres: "3", price: "106", full: false },
  { key: 4, odometer: "12720", litres: "4.5", price: "104", full: true },
];

const DEFAULT_MONTHLY_KM = "600";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fills, setFills] = useState(DEFAULT_FILLS);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULT_MONTHLY_KM);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFuelLog({
        entries: fills.map((fill) => ({
          odometer: toNumber(fill.odometer),
          litres: toNumber(fill.litres),
          pricePerLitre: toNumber(fill.price),
          fullTank: fill.full,
        })),
        monthlyKm: toNumber(monthlyKm) || 0,
      }),
    [fills, monthlyKm],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Bike Mileage Log",
      `Measured over ${NUM.format(result.totalDistance)} km on ${NUM2.format(result.totalLitres)} L`,
      `True average: ${NUM1.format(result.averageKmpl)} km/l`,
      `Running cost: ${INR2.format(result.costPerKm)} per km (${INR.format(result.costPer100Km)} per 100 km)`,
      `Best tank: ${NUM1.format(result.best.kmpl)} km/l · worst tank: ${NUM1.format(result.worst.kmpl)} km/l`,
      `Latest tank: ${NUM1.format(result.latest.kmpl)} km/l`,
      result.monthlyKm > 0
        ? `At ${NUM.format(result.monthlyKm)} km a month: ${INR.format(result.monthlyRunningCost)} monthly, ${INR.format(result.annualRunningCost)} a year`
        : "",
    ].filter(Boolean);
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
    setFills(DEFAULT_FILLS);
    setMonthlyKm(DEFAULT_MONTHLY_KM);
    setCopied(false);
  };

  const setFill = (key, field, value) =>
    setFills((prev) => prev.map((fill) => (fill.key === key ? { ...fill, [field]: value } : fill)));

  const addFill = () =>
    setFills((prev) => {
      if (prev.length >= MAX_FILLS) return prev;
      const nextKey = prev.reduce((max, fill) => Math.max(max, fill.key), 0) + 1;
      const last = prev[prev.length - 1];
      const lastOdo = toNumber(last?.odometer);
      return [
        ...prev,
        {
          key: nextKey,
          odometer: Number.isFinite(lastOdo) ? String(lastOdo + 300) : "0",
          litres: "6",
          price: last?.price ?? "104",
          full: true,
        },
      ];
    });

  const removeFill = (key) =>
    setFills((prev) => (prev.length <= 2 ? prev : prev.filter((fill) => fill.key !== key)));

  const rows = hasError
    ? [
        ["Distance measured", DASH],
        ["Fuel burnt over that distance", DASH],
        ["True average mileage", DASH],
        ["Latest tank", DASH],
        ["Best tank", DASH],
        ["Worst tank", DASH],
        ["Average price paid per litre", DASH],
        ["Cost per kilometre", DASH],
        ["Cost per 100 km", DASH],
        ["Monthly fuel bill", DASH],
        ["Yearly fuel bill", DASH],
      ]
    : [
        ["Distance measured", `${NUM.format(result.totalDistance)} km`],
        ["Fuel burnt over that distance", `${NUM2.format(result.totalLitres)} L`],
        ["True average mileage", `${NUM1.format(result.averageKmpl)} km/l`],
        [
          "Latest tank",
          `${NUM1.format(result.latest.kmpl)} km/l (${result.latestVsAveragePct >= 0 ? "+" : ""}${NUM1.format(result.latestVsAveragePct)}% vs average)`,
        ],
        ["Best tank", `${NUM1.format(result.best.kmpl)} km/l`],
        ["Worst tank", `${NUM1.format(result.worst.kmpl)} km/l`],
        ["Average price paid per litre", INR2.format(result.averagePricePerLitre)],
        ["Cost per kilometre", INR2.format(result.costPerKm)],
        ["Cost per 100 km", INR.format(result.costPer100Km)],
        [
          "Monthly fuel bill",
          result.monthlyKm > 0
            ? `${INR.format(result.monthlyRunningCost)} · ${NUM1.format(result.monthlyLitres)} L`
            : "Add a monthly distance",
        ],
        ["Yearly fuel bill", result.monthlyKm > 0 ? INR.format(result.annualRunningCost) : DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fuel className="h-4 w-4" aria-hidden="true" />
          Fuel log
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bike Mileage Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your fill-ups oldest first. Mileage is measured brim to brim between full tanks, and
          partial top-ups are carried forward — so a mixed log still gives honest numbers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Fill-ups
        </h2>
        <div className="mt-3 space-y-4">
          {fills.map((fill, index) => (
            <div
              key={fill.key}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  Fill {index + 1}
                  {index === 0 && (
                    <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      baseline
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeFill(fill.key)}
                  disabled={fills.length <= 2}
                  aria-label={`Remove fill ${index + 1}`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fuel-odo-${fill.key}`}>
                    Odometer (km)
                  </label>
                  <input
                    id={`fuel-odo-${fill.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={fill.odometer}
                    onChange={(event) => setFill(fill.key, "odometer", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fuel-litres-${fill.key}`}>
                    Litres filled
                  </label>
                  <input
                    id={`fuel-litres-${fill.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.1"
                    step="0.1"
                    value={fill.litres}
                    onChange={(event) => setFill(fill.key, "litres", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fuel-price-${fill.key}`}>
                    Price (₹ per litre)
                  </label>
                  <input
                    id={`fuel-price-${fill.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={fill.price}
                    onChange={(event) => setFill(fill.key, "price", event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 sm:mt-7">
                  <input
                    id={`fuel-full-${fill.key}`}
                    type="checkbox"
                    checked={fill.full}
                    onChange={(event) => setFill(fill.key, "full", event.target.checked)}
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  />
                  <label htmlFor={`fuel-full-${fill.key}`} className="min-h-11 flex-1 py-3 text-sm font-semibold">
                    Filled to the brim
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={addFill}
            disabled={fills.length >= MAX_FILLS}
            aria-label="Add another fill-up"
            className={PRIMARY_BTN}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a fill-up
          </button>
        </div>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="fuel-monthly-km">
            Kilometres you ride in a month
          </label>
          <input
            id="fuel-monthly-km"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="50"
            value={monthlyKm}
            onChange={(event) => setMonthlyKm(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Used only to project the running cost — leave it at zero to skip.
          </p>
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
              True average mileage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(result.averageKmpl)} km/l`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the log above to see your mileage."
                : `${NUM.format(result.totalDistance)} km measured across ${result.segments.length} full tank${result.segments.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy mileage log result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the fuel log" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
                Every closed tank-to-tank stretch
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Stretch
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    km
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Litres
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    km/l
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    ₹/km
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.segments.map((segment) => (
                  <tr key={segment.index} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">
                      {NUM.format(segment.fromOdo)} → {NUM.format(segment.toOdo)}
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(segment.distance)}</td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(segment.litres)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{NUM1.format(segment.kmpl)}</td>
                    <td className="py-2 text-right">{NUM2.format(segment.costPerKm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing here leaves your browser. For the numbers to mean anything, fill at the same pump and
        let the nozzle cut off on its own every time — topping up by hand after the click is the
        single biggest source of noise in a fuel log.
      </p>
    </main>
  );
}
