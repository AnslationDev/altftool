"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PaintRoller, RotateCcw } from "lucide-react";

import {
  DEFAULT_WASTAGE_PERCENT,
  EXTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE,
  SURFACE_FACTORS,
  computeExteriorPaint,
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
  mode: "perimeter",
  perimeter: "120",
  height: "10",
  area: "1200",
  openings: "200",
  coats: "2",
  surface: "smooth-plaster",
  wastage: String(DEFAULT_WASTAGE_PERCENT),
  price: "300",
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [perimeter, setPerimeter] = useState(DEFAULTS.perimeter);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [area, setArea] = useState(DEFAULTS.area);
  const [openings, setOpenings] = useState(DEFAULTS.openings);
  const [coats, setCoats] = useState(DEFAULTS.coats);
  const [surface, setSurface] = useState(DEFAULTS.surface);
  const [wastage, setWastage] = useState(DEFAULTS.wastage);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeExteriorPaint({
        mode,
        perimeterFt: perimeter,
        wallHeightFt: height,
        directAreaSqft: area,
        openingsSqft: openings,
        coats,
        surface,
        wastagePercent: wastage,
        pricePerLitre: price,
      }),
    [mode, perimeter, height, area, openings, coats, surface, wastage, price],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Exterior Wall Paint Quantity",
      `Paintable area: ${sqft(result.netArea)} (gross ${sqft(result.grossArea)} less ${sqft(result.openings)} openings)`,
      `Surface: ${result.surfaceLabel}`,
      `Coats: ${result.coats}`,
      `Effective coverage: ${NUM1.format(result.effectiveSpread)} sq ft per litre per coat`,
      `Paint required: ${litres(result.litresNeeded)}`,
      `Buy: ${result.packs.map((p) => `${p.count} x ${p.size} L`).join(" + ")} = ${result.purchasedLitres} L`,
      `Material cost: ${money(result.materialCost)}`,
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
    setPerimeter(DEFAULTS.perimeter);
    setHeight(DEFAULTS.height);
    setArea(DEFAULTS.area);
    setOpenings(DEFAULTS.openings);
    setCoats(DEFAULTS.coats);
    setSurface(DEFAULTS.surface);
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
          Exterior Wall Paint Quantity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many litres of exterior emulsion your walls need, corrected for how porous or
          textured the surface is, and which tin sizes add up to that quantity with the least paint
          left over.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="How to enter the wall size">
          {[
            ["perimeter", "Perimeter x height"],
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
          {mode === "perimeter" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ext-perimeter">
                  Total wall length / perimeter (ft)
                </label>
                <input
                  id="ext-perimeter"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={perimeter}
                  onChange={(event) => setPerimeter(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ext-height">
                  Wall height (ft)
                </label>
                <input
                  id="ext-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ext-area">
                Gross wall area (sq ft)
              </label>
              <input
                id="ext-area"
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
            <label className={LABEL_CLASS} htmlFor="ext-openings">
              Windows, doors and grilles to deduct (sq ft)
            </label>
            <input
              id="ext-openings"
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
            <label className={LABEL_CLASS} htmlFor="ext-coats">
              Number of finish coats
            </label>
            <input
              id="ext-coats"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ext-surface">
              Surface condition
            </label>
            <select
              id="ext-surface"
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
            <label className={LABEL_CLASS} htmlFor="ext-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="ext-wastage"
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
            <label className={LABEL_CLASS} htmlFor="ext-price">
              Emulsion price (INR per litre)
            </label>
            <input
              id="ext-price"
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
              Paint required
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? litres(result.litresNeeded) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.coats} coats over ${sqft(result.netArea)} of ${result.surfaceLabel.toLowerCase()}`
                : "Fix the input above to see a quantity."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the paint quantity estimate"
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
            ["Gross wall area", ok ? sqft(result.grossArea) : DASH],
            ["Less openings", ok ? sqft(result.openings) : DASH],
            ["Paintable area", ok ? sqft(result.netArea) : DASH],
            [
              "Effective coverage",
              ok ? `${NUM1.format(result.effectiveSpread)} sq ft / L / coat` : DASH,
            ],
            ["Paint before wastage", ok ? litres(result.litresBare) : DASH],
            ["Tins to buy", ok ? `${result.purchasedLitres} L in ${result.totalPacks} tins` : DASH],
            ["Left over after the job", ok ? litres(result.spareLitres) : DASH],
            ["Material cost", ok ? money(result.materialCost) : DASH],
            ["Cost per sq ft of wall", ok ? money(result.costPerSqft) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.surfaceNote} Base spreading rate before the surface correction is{" "}
            {EXTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE} sq ft per litre per coat.
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Two ways to buy it</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Large tins usually cost less per litre, so the fewest-tins option can be cheaper in the
          shop even though it leaves more paint over.
        </p>
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
                  ["Fewest tins to carry", result.compactPacks, result.compactLitres, result.compactCost],
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
        An estimate for planning and budgeting. Actual consumption depends on the specific product,
        the applicator, dilution and how well the surface was primed — always read the coverage
        printed on the pack and buy a little spare from the same batch for touch-ups.
      </p>
    </main>
  );
}
