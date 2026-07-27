"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fence, RotateCcw } from "lucide-react";
import { DEFAULT_ROW_GAP_CM, DEFAULT_SPARE_PCT, HEDGE_SPECIES, computeHedge } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : "—");
const two = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");
const int = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  speciesId: "privet",
  length: "10",
  unit: "metric",
  spacing: "33",
  rows: 1,
  rowGap: String(DEFAULT_ROW_GAP_CM),
  pricePerPlant: "120",
  sparePct: String(DEFAULT_SPARE_PCT),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SELECT_CLASS = `${INPUT_CLASS} appearance-none`;
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [speciesId, setSpeciesId] = useState(DEFAULTS.speciesId);
  const [length, setLength] = useState(DEFAULTS.length);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [spacing, setSpacing] = useState(DEFAULTS.spacing);
  const [rows, setRows] = useState(DEFAULTS.rows);
  const [rowGap, setRowGap] = useState(DEFAULTS.rowGap);
  const [pricePerPlant, setPricePerPlant] = useState(DEFAULTS.pricePerPlant);
  const [sparePct, setSparePct] = useState(DEFAULTS.sparePct);
  const [copied, setCopied] = useState(false);

  const species = HEDGE_SPECIES.find((item) => item.id === speciesId) ?? HEDGE_SPECIES[0];

  const result = useMemo(
    () =>
      computeHedge({
        length: toNumber(length),
        unit,
        spacing: toNumber(spacing),
        rows,
        rowGap: toNumber(rowGap),
        pricePerPlant: toNumber(pricePerPlant),
        sparePct: toNumber(sparePct),
      }),
    [length, unit, spacing, rows, rowGap, pricePerPlant, sparePct],
  );

  const hasError = Boolean(result.error);
  const isMetric = unit === "metric";
  const lengthUnit = isMetric ? "m" : "ft";
  const smallUnit = isMetric ? "cm" : "in";

  const switchUnit = (next) => {
    if (next === unit) return;
    setUnit(next);
    if (next === "imperial") {
      setLength("30");
      setSpacing("13");
      setRowGap("16");
    } else {
      setLength(DEFAULTS.length);
      setSpacing(DEFAULTS.spacing);
      setRowGap(DEFAULTS.rowGap);
    }
  };

  const applySpecies = (id) => {
    setSpeciesId(id);
    const next = HEDGE_SPECIES.find((item) => item.id === id);
    if (!next) return;
    const midCm = (next.minCm + next.maxCm) / 2;
    setSpacing(String(isMetric ? Math.round(midCm) : Number((midCm / 2.54).toFixed(1))));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Hedge Spacing Calculator",
      `Species: ${species.label}`,
      `Run: ${one(result.length)} ${result.lengthUnit}, ${result.rows === 2 ? "staggered double row" : "single row"}`,
      `Spacing asked for: ${one(result.requestedSpacing)} ${result.smallUnit}`,
      `Spacing actually used: ${one(result.actualSpacing)} ${result.smallUnit} (${result.gaps} gaps)`,
      `Plants: ${int(result.totalPlants)} (${int(result.plantsPerRow)} per row)`,
      `Order with spares: ${int(result.plantsWithSpares)} — ${money(result.cost)}`,
      `Compost for the trench: ${int(result.compostLitres)} litres`,
      `Mulch strip: ${two(result.mulchM3)} m³ over a ${two(result.bedWidth)} ${result.lengthUnit} wide bed`,
    ].join("\n");
  }, [hasError, result, species]);

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
    setSpeciesId(DEFAULTS.speciesId);
    setLength(DEFAULTS.length);
    setUnit(DEFAULTS.unit);
    setSpacing(DEFAULTS.spacing);
    setRows(DEFAULTS.rows);
    setRowGap(DEFAULTS.rowGap);
    setPricePerPlant(DEFAULTS.pricePerPlant);
    setSparePct(DEFAULTS.sparePct);
    setCopied(false);
  };

  const rowData = hasError
    ? [
        ["Plants per row", "—"],
        ["Rows", "—"],
        ["Total plants", "—"],
        ["Spares added", "—"],
        ["Order this many", "—"],
        ["Spacing actually used", "—"],
        ["Plants per metre", "—"],
        ["Plant cost", "—"],
        ["Compost for planting", "—"],
        ["Mulch for the strip", "—"],
      ]
    : [
        ["Plants per row", int(result.plantsPerRow)],
        ["Rows", int(result.rows)],
        ["Total plants", int(result.totalPlants)],
        ["Spares added", `${int(result.spares)} (${one(toNumber(sparePct))}%)`],
        ["Order this many", int(result.plantsWithSpares)],
        ["Spacing actually used", `${one(result.actualSpacing)} ${result.smallUnit} across ${int(result.gaps)} gaps`],
        ["Plants per metre", two(result.plantsPerMetre)],
        ["Plant cost", money(result.cost)],
        ["Compost for planting", `${int(result.compostLitres)} litres`],
        ["Mulch for the strip", `${two(result.mulchM3)} m³ (${int(result.mulchLitres)} L)`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fence className="h-4 w-4" aria-hidden="true" />
          Lawn &amp; landscape
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hedge Spacing Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the run length and the spacing your species wants, and get the exact plant count for a
          single or staggered double row — plus spares, compost and mulch for the strip.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => switchUnit("metric")} className={isMetric ? CHIP_ON : CHIP_BTN} aria-pressed={isMetric}>
            Metres &amp; cm
          </button>
          <button type="button" onClick={() => switchUnit("imperial")} className={!isMetric ? CHIP_ON : CHIP_BTN} aria-pressed={!isMetric}>
            Feet &amp; inches
          </button>
          <button type="button" onClick={() => setRows(1)} className={rows === 1 ? CHIP_ON : CHIP_BTN} aria-pressed={rows === 1}>
            Single row
          </button>
          <button type="button" onClick={() => setRows(2)} className={rows === 2 ? CHIP_ON : CHIP_BTN} aria-pressed={rows === 2}>
            Double staggered row
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hedge-species">
              Hedging species
            </label>
            <select id="hedge-species" className={`mt-2 ${SELECT_CLASS}`} value={speciesId} onChange={(e) => applySpecies(e.target.value)}>
              {HEDGE_SPECIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Nursery spacing {species.minCm}–{species.maxCm} cm · usually kept at {species.keptHeightM} m
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hedge-length">
              Hedge length ({lengthUnit})
            </label>
            <input id="hedge-length" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={length} onChange={(e) => setLength(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hedge-spacing">
              Plant spacing ({smallUnit})
            </label>
            <input id="hedge-spacing" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={spacing} onChange={(e) => setSpacing(e.target.value)} />
          </div>
          {rows === 2 && (
            <div>
              <label className={LABEL_CLASS} htmlFor="hedge-rowgap">
                Gap between rows ({smallUnit})
              </label>
              <input id="hedge-rowgap" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={rowGap} onChange={(e) => setRowGap(e.target.value)} />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="hedge-price">
              Price per plant (₹)
            </label>
            <input id="hedge-price" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={pricePerPlant} onChange={(e) => setPricePerPlant(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hedge-spares">
              Spares to order (%)
            </label>
            <input id="hedge-spares" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="1" value={sparePct} onChange={(e) => setSparePct(e.target.value)} />
          </div>
        </div>

        {isMetric && (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-[var(--foreground)]">Spacing for {species.label}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {[species.minCm, Math.round((species.minCm + species.maxCm) / 2), species.maxCm].map((value, index) => (
                <button
                  key={`${value}-${index}`}
                  type="button"
                  className={toNumber(spacing) === value ? CHIP_ON : CHIP_BTN}
                  onClick={() => setSpacing(String(value))}
                >
                  {value} cm {index === 0 ? "(dense)" : index === 2 ? "(economical)" : "(typical)"}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Plants to order</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : int(result.plantsWithSpares)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plant count."
                : `${int(result.totalPlants)} in the hedge plus ${int(result.spares)} spare, at ${one(result.actualSpacing)} ${result.smallUnit} apart`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy hedge planting estimate" className={GHOST_BTN} disabled={hasError}>
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
          {rowData.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.spacingExceedsLength && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            The spacing you entered is wider than the run itself, so the calculation places one plant
            at each end. Reduce the spacing for a continuous hedge.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Check boundary rules and any local planting restrictions before putting a hedge on a shared
        line, and keep vigorous species well back from drains, walls and neighbours' light.
      </p>
    </main>
  );
}
