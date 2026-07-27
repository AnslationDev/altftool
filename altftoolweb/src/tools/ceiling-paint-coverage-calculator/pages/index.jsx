"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PaintRoller, RotateCcw } from "lucide-react";

import {
  CEILING_TYPES,
  DEFAULT_WASTAGE_PERCENT,
  INTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE,
  computeCeilingPaint,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const litres = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} L` : DASH);
const sqft = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} sq ft` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  length: "12",
  width: "15",
  cove: "0",
  rooms: "1",
  coats: "2",
  type: "smooth-plaster",
  wastage: String(DEFAULT_WASTAGE_PERCENT),
  price: "280",
};

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [cove, setCove] = useState(DEFAULTS.cove);
  const [rooms, setRooms] = useState(DEFAULTS.rooms);
  const [coats, setCoats] = useState(DEFAULTS.coats);
  const [type, setType] = useState(DEFAULTS.type);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCeilingPaint({
        lengthFt: length,
        widthFt: width,
        coveDepthInches: cove,
        rooms,
        coats,
        ceilingType: type,
        wastagePercent: wastage,
        pricePerLitre: price,
      }),
    [length, width, cove, rooms, coats, type, wastage, price],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Ceiling Paint Coverage",
      `Ceiling area: ${sqft(result.totalArea)} across ${result.rooms} ${result.rooms === 1 ? "ceiling" : "ceilings"}`,
      `Ceiling type: ${result.typeLabel}`,
      `Coats: ${result.coats}`,
      `Effective coverage: ${NUM1.format(result.effectiveSpread)} sq ft per litre per coat`,
      `Paint required: ${litres(result.litresNeeded)}`,
      `Least paint: ${result.packs.map((p) => `${p.count} x ${p.size} L`).join(" + ")} = ${result.purchasedLitres} L, ${money(result.materialCost)}`,
      `Fewest tins: ${result.compactPacks.map((p) => `${p.count} x ${p.size} L`).join(" + ")} = ${result.compactLitres} L, ${money(result.compactCost)}`,
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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setCove(DEFAULTS.cove);
    setRooms(DEFAULTS.rooms);
    setCoats(DEFAULTS.coats);
    setType(DEFAULTS.type);
    setWastage(DEFAULTS.wastage);
    setPrice(DEFAULTS.price);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PaintRoller className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ceiling Paint Coverage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the room size and this works out the ceiling area, the litres of emulsion needed at
          your chosen number of coats, and which tin sizes to buy — including the cove or cornice
          band that most estimates forget.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ceil-length">
              Room length (ft)
            </label>
            <input
              id="ceil-length"
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
            <label className={LABEL_CLASS} htmlFor="ceil-width">
              Room width (ft)
            </label>
            <input
              id="ceil-width"
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
            <label className={LABEL_CLASS} htmlFor="ceil-cove">
              Cove / cornice drop (inches)
            </label>
            <input
              id="ceil-cove"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="36"
              step="1"
              value={cove}
              onChange={(event) => setCove(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ceil-rooms">
              Number of identical ceilings
            </label>
            <input
              id="ceil-rooms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={rooms}
              onChange={(event) => setRooms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ceil-coats">
              Number of coats
            </label>
            <input
              id="ceil-coats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={coats}
              onChange={(event) => setCoats(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ceil-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="ceil-wastage"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ceil-type">
              Ceiling surface
            </label>
            <select
              id="ceil-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {CEILING_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ceil-price">
              Paint price (INR per litre)
            </label>
            <input
              id="ceil-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
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
              Ceiling paint required
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? litres(result.litresNeeded) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.coats} coats over ${sqft(result.totalArea)} of ceiling`
                : "Fix the input above to see a quantity."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the ceiling paint estimate"
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
            ["Flat ceiling area per room", ok ? sqft(result.flatArea) : DASH],
            ["Cove / cornice area per room", ok ? sqft(result.coveArea) : DASH],
            ["Total area to paint", ok ? sqft(result.totalArea) : DASH],
            [
              "Effective coverage",
              ok ? `${NUM1.format(result.effectiveSpread)} sq ft / L / coat` : DASH,
            ],
            ["Paint before wastage", ok ? litres(result.litresBare) : DASH],
            ["Least paint option", ok ? `${result.purchasedLitres} L (${result.totalPacks} tins)` : DASH],
            ["Left over after the job", ok ? litres(result.spareLitres) : DASH],
            ["Material cost", ok ? money(result.materialCost) : DASH],
            ["Cost per sq ft of ceiling", ok ? money(result.costPerSqft) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.typeNote} Base spreading rate before the surface correction is{" "}
            {INTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE} sq ft per litre per coat.
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
                    Tins
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Litres
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    At your price
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Least paint bought", result.packs, result.purchasedLitres, result.materialCost],
                  [
                    "Fewest tins to carry",
                    result.compactPacks,
                    result.compactLitres,
                    result.compactCost,
                  ],
                ].map(([label, packs, totalLitres, cost]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{label}</td>
                    <td className="py-2 pr-3">
                      {packs.map((row) => `${row.count} x ${row.size} L`).join(" + ")}
                    </td>
                    <td className="py-2 pr-3 text-right">{totalLitres} L</td>
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
        An estimate for planning. Real consumption depends on the product, the roller nap, dilution
        and how well the ceiling was primed — check the coverage printed on the pack and keep a
        little spare from the same batch for touch-ups.
      </p>
    </main>
  );
}
