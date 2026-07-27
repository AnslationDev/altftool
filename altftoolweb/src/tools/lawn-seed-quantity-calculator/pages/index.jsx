"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import { AREA_UNITS, GRASS_TYPES, PURPOSES, computeLawnSeed } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";

const DEFAULTS = {
  area: "100",
  areaUnit: "m2",
  grass: "ryegrass",
  purpose: "new",
  purityPct: "98",
  germinationPct: "85",
  wastagePct: "10",
  bagKg: "5",
  pricePerKg: "900",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [areaUnit, setAreaUnit] = useState(DEFAULTS.areaUnit);
  const [grass, setGrass] = useState(DEFAULTS.grass);
  const [purpose, setPurpose] = useState(DEFAULTS.purpose);
  const [purityPct, setPurityPct] = useState(DEFAULTS.purityPct);
  const [germinationPct, setGerminationPct] = useState(DEFAULTS.germinationPct);
  const [wastagePct, setWastagePct] = useState(DEFAULTS.wastagePct);
  const [bagKg, setBagKg] = useState(DEFAULTS.bagKg);
  const [pricePerKg, setPricePerKg] = useState(DEFAULTS.pricePerKg);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeLawnSeed({
        area,
        areaUnit,
        grass,
        purpose,
        purityPct,
        germinationPct,
        wastagePct,
        bagKg,
        pricePerKg,
      }),
    [area, areaUnit, grass, purpose, purityPct, germinationPct, wastagePct, bagKg, pricePerKg],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Lawn Seed Quantity Calculator",
      `Lawn area: ${NUM1.format(result.areaM2)} m² (${INT.format(result.areaSqft)} sq ft)`,
      `Grass: ${result.speciesLabel} — ${result.purposeLabel}`,
      `Sowing rate used: ${NUM2.format(result.adjustedRate)} g/m²`,
      `Pure live seed: ${NUM1.format(result.plsPct)}%`,
      `Seed needed: ${NUM2.format(result.seedKg)} kg (incl. ${NUM1.format(result.wastagePct)}% wastage)`,
      `Bags to buy: ${result.bagsNeeded} × ${NUM2.format(result.bagKg)} kg`,
      `Estimated cost: ${INR.format(result.totalCost)}`,
    ].join("\n");
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
    setArea(DEFAULTS.area);
    setAreaUnit(DEFAULTS.areaUnit);
    setGrass(DEFAULTS.grass);
    setPurpose(DEFAULTS.purpose);
    setPurityPct(DEFAULTS.purityPct);
    setGerminationPct(DEFAULTS.germinationPct);
    setWastagePct(DEFAULTS.wastagePct);
    setBagKg(DEFAULTS.bagKg);
    setPricePerKg(DEFAULTS.pricePerKg);
    setCopied(false);
  };

  const rows = [
    ["Lawn area", hasError ? DASH : `${NUM1.format(result.areaM2)} m² · ${INT.format(result.areaSqft)} sq ft`],
    [
      "Published rate for this grass",
      hasError ? DASH : `${NUM2.format(result.baseRate)} g/m² (${result.baseRateLbPer1000} lb per 1000 sq ft)`,
    ],
    ["Purpose multiplier", hasError ? DASH : `× ${result.purposeFactor}`],
    ["Pure live seed (purity × germination)", hasError ? DASH : `${NUM1.format(result.plsPct)}%`],
    ["Seed-quality correction", hasError ? DASH : `× ${NUM2.format(result.plsFactor)}`],
    ["Rate actually applied", hasError ? DASH : `${NUM2.format(result.adjustedRate)} g/m²`],
    ["Seed before wastage", hasError ? DASH : `${INT.format(result.seedGramsBeforeWastage)} g`],
    ["Wastage allowance", hasError ? DASH : `${NUM1.format(result.wastagePct)}%`],
    ["Bags to buy", hasError ? DASH : `${result.bagsNeeded} × ${NUM2.format(result.bagKg)} kg`],
    ["Estimated seed cost", hasError ? DASH : INR.format(result.totalCost)],
    ["Seeds landing per m²", hasError ? DASH : `${INT.format(result.seedsPerM2)} (${NUM1.format(result.seedsPerCm2)} per cm²)`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Lawn &amp; landscape
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Lawn Seed Quantity Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts the published sowing rate for your grass species into kilograms for your lawn,
          corrected for the purity and germination printed on the seed label.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="seed-area">
              Lawn area
            </label>
            <input
              id="seed-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="seed-unit">
              Area unit
            </label>
            <select
              id="seed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={areaUnit}
              onChange={(event) => setAreaUnit(event.target.value)}
            >
              {AREA_UNITS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="seed-grass">
              Grass species
            </label>
            <select
              id="seed-grass"
              className={`mt-2 ${INPUT_CLASS}`}
              value={grass}
              onChange={(event) => setGrass(event.target.value)}
            >
              {GRASS_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="seed-purpose">
              What you are sowing for
            </label>
            <select
              id="seed-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            >
              {PURPOSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="seed-purity">
              Purity on the label (%)
            </label>
            <input
              id="seed-purity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={purityPct}
              onChange={(event) => setPurityPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="seed-germ">
              Germination on the label (%)
            </label>
            <input
              id="seed-germ"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={germinationPct}
              onChange={(event) => setGerminationPct(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="seed-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="seed-wastage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={wastagePct}
              onChange={(event) => setWastagePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="seed-bag">
              Bag size sold (kg)
            </label>
            <input
              id="seed-bag"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={bagKg}
              onChange={(event) => setBagKg(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="seed-price">
              Seed price per kg (INR)
            </label>
            <input
              id="seed-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={pricePerKg}
              onChange={(event) => setPricePerKg(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Grass seed needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM2.format(result.seedKg)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a quantity."
                : `${NUM2.format(result.adjustedRate)} g/m² over ${NUM1.format(result.areaM2)} m², wastage included`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy lawn seed quantity result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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
      </section>

      {!hasError && result.notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.notes.map((note) => (
            <li
              key={note}
              className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates are mid-range extension-service figures converted from pounds per 1000 square feet.
        Seed mixes, coated seed and shaded or sloping ground can change the right rate — check the
        bag, which carries its own recommendation for the blend inside.
      </p>
    </main>
  );
}
