"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  DEFAULT_WASTAGE_PERCENT,
  PUTTY_TYPES,
  SURFACE_FACTORS,
  computePutty,
} from "../lib";

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
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const kilos = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} kg` : DASH);
const sqft = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} sq ft` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  mode: "room",
  length: "12",
  width: "15",
  height: "10",
  ceiling: false,
  area: "660",
  openings: "60",
  coats: "2",
  putty: "white-cement",
  surface: "smooth-plaster",
  wastage: String(DEFAULT_WASTAGE_PERCENT),
  price: "28",
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [ceiling, setCeiling] = useState(DEFAULTS.ceiling);
  const [area, setArea] = useState(DEFAULTS.area);
  const [openings, setOpenings] = useState(DEFAULTS.openings);
  const [coats, setCoats] = useState(DEFAULTS.coats);
  const [putty, setPutty] = useState(DEFAULTS.putty);
  const [surface, setSurface] = useState(DEFAULTS.surface);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePutty({
        mode,
        lengthFt: length,
        widthFt: width,
        heightFt: height,
        includeCeiling: ceiling,
        directAreaSqft: area,
        openingsSqft: openings,
        coats,
        puttyType: putty,
        surface,
        wastagePercent: wastage,
        pricePerKg: price,
      }),
    [mode, length, width, height, ceiling, area, openings, coats, putty, surface, wastage, price],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Wall Putty Quantity",
      `Area to putty: ${sqft(result.netArea)}`,
      `Putty: ${result.typeLabel}`,
      `Surface: ${result.surfaceLabel}`,
      `Coats: ${result.coats}`,
      `Putty required: ${kilos(result.kilosNeeded)}`,
      `Effective coverage: ${NUM1.format(result.coveragePerKgAtThisSpec)} sq ft per kg at this spec`,
      `Least material: ${result.bags.map((b) => `${b.count} x ${b.size} kg`).join(" + ")} = ${result.purchasedKilos} kg, ${money(result.materialCost)}`,
      `Fewest bags: ${result.compactBags.map((b) => `${b.count} x ${b.size} kg`).join(" + ")} = ${result.compactKilos} kg, ${money(result.compactCost)}`,
      `Mixing water: ${NUM1.format(result.waterLitres)} litres`,
    ].join("\n");
  }, [ok, result]);

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
    setMode(DEFAULTS.mode);
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setCeiling(DEFAULTS.ceiling);
    setArea(DEFAULTS.area);
    setOpenings(DEFAULTS.openings);
    setCoats(DEFAULTS.coats);
    setPutty(DEFAULTS.putty);
    setSurface(DEFAULTS.surface);
    setWastage(DEFAULTS.wastage);
    setPrice(DEFAULTS.price);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Wall Putty Quantity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many kilos and bags of wall putty a room needs, how much gauging water to
          keep ready, and what it costs — starting from the coverage printed on the bag.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="How to describe the surface">
          {[
            ["room", "Room dimensions"],
            ["area", "I know the area"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "room" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="putty-length">
                  Room length (ft)
                </label>
                <input
                  id="putty-length"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="putty-width">
                  Room width (ft)
                </label>
                <input
                  id="putty-width"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="putty-height">
                  Wall height (ft)
                </label>
                <input
                  id="putty-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <label
                  className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]"
                  htmlFor="putty-ceiling"
                >
                  <input
                    id="putty-ceiling"
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={ceiling}
                    onChange={(event) => setCeiling(event.target.checked)}
                  />
                  Putty the ceiling too
                </label>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="putty-area">
                Gross surface area (sq ft)
              </label>
              <input
                id="putty-area"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                value={area}
                onChange={(event) => setArea(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="putty-openings">
              Doors and windows to deduct (sq ft)
            </label>
            <input
              id="putty-openings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={openings}
              onChange={(event) => setOpenings(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="putty-coats">
              Number of putty coats
            </label>
            <input
              id="putty-coats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={coats}
              onChange={(event) => setCoats(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="putty-type">
              Putty type
            </label>
            <select
              id="putty-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={putty}
              onChange={(event) => setPutty(event.target.value)}
            >
              {PUTTY_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="putty-surface">
              Surface condition
            </label>
            <select
              id="putty-surface"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surface}
              onChange={(event) => setSurface(event.target.value)}
            >
              {SURFACE_FACTORS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="putty-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="putty-wastage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={wastage}
              onChange={(event) => setWastage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="putty-price">
              Putty price (INR per kg)
            </label>
            <input
              id="putty-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
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
              Putty required
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kilos(result.kilosNeeded) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.coats} coats over ${sqft(result.netArea)}`
                : "Fix the input above to see a quantity."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the wall putty estimate"
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
            ["Wall area", ok && mode === "room" ? sqft(result.wallArea) : DASH],
            ["Ceiling area", ok && mode === "room" ? sqft(result.ceilingArea) : DASH],
            ["Less openings", ok ? sqft(result.openings) : DASH],
            ["Area to putty", ok ? sqft(result.netArea) : DASH],
            [
              "Coverage at this spec",
              ok ? `${NUM1.format(result.coveragePerKgAtThisSpec)} sq ft per kg` : DASH,
            ],
            ["Putty before wastage", ok ? kilos(result.kilosBare) : DASH],
            ["Least material option", ok ? `${result.purchasedKilos} kg in ${result.totalBags} bags` : DASH],
            ["Gauging water to keep ready", ok ? `${NUM1.format(result.waterLitres)} litres` : DASH],
            ["Material cost", ok ? money(result.materialCost) : DASH],
            ["Cost per sq ft", ok ? money2(result.costPerSqft) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.typeNote} {result.surfaceNote}
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Two ways to buy it</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Option
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Bags
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Kilos
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    At your price
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Least material bought", result.bags, result.purchasedKilos, result.materialCost],
                  [
                    "Fewest bags to carry",
                    result.compactBags,
                    result.compactKilos,
                    result.compactCost,
                  ],
                ].map(([label, bags, total, cost]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{label}</td>
                    <td className="py-2 pr-3">
                      {bags.map((row) => `${row.count} x ${row.size} kg`).join(" + ")}
                    </td>
                    <td className="py-2 pr-3 text-right">{total} kg</td>
                    <td className="py-2 text-right">{money(cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate for planning. Coverage varies between brands and with how skilled the applicator
        is — read the figure printed on your bag and treat deep undulations as a plastering job
        rather than something to fill with putty.
      </p>
    </main>
  );
}
