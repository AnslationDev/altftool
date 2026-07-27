"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Truck } from "lucide-react";

import { BUILDUP_LAYERS, MATERIALS, calculateGravel } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const ONE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const MONEY = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DEFAULTS = {
  mode: "single",
  areaMode: "dimensions",
  length: "60",
  width: "12",
  area: "720",
  unit: "ft",
  areaUnit: "sqft",
  material: "crusherRun",
  depth: "4",
  depthUnit: "in",
  compactionPct: "25",
  pricePerTon: "30",
  truckTons: "15",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [areaMode, setAreaMode] = useState(DEFAULTS.areaMode);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [area, setArea] = useState(DEFAULTS.area);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [areaUnit, setAreaUnit] = useState(DEFAULTS.areaUnit);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [depthUnit, setDepthUnit] = useState(DEFAULTS.depthUnit);
  const [subBase, setSubBase] = useState(String(BUILDUP_LAYERS[0].defaultInches));
  const [middle, setMiddle] = useState(String(BUILDUP_LAYERS[1].defaultInches));
  const [surface, setSurface] = useState(String(BUILDUP_LAYERS[2].defaultInches));
  const [compactionPct, setCompactionPct] = useState(DEFAULTS.compactionPct);
  const [pricePerTon, setPricePerTon] = useState(DEFAULTS.pricePerTon);
  const [truckTons, setTruckTons] = useState(DEFAULTS.truckTons);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateGravel({
        mode,
        areaMode,
        length,
        width,
        area,
        unit,
        areaUnit,
        material,
        depth,
        depthUnit,
        layerDepths: { stone3: subBase, stone57: middle, crusherRun: surface },
        compactionPct,
        pricePerTon,
        truckTons,
      }),
    [
      mode,
      areaMode,
      length,
      width,
      area,
      unit,
      areaUnit,
      material,
      depth,
      depthUnit,
      subBase,
      middle,
      surface,
      compactionPct,
      pricePerTon,
      truckTons,
    ],
  );

  const failed = Boolean(result.error);
  const depthLabel = depthUnit === "cm" ? "cm" : "in";

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Gravel Driveway Calculator",
      `Area: ${ONE.format(result.areaSqft)} ft² (${ONE.format(result.areaSqm)} m²)`,
      `Finished depth: ${NUM.format(result.totalDepthInches)} in (${ONE.format(result.totalDepthCm)} cm)`,
      `Compaction allowance: ${result.compactionPct}%`,
      `Compacted volume: ${NUM.format(result.compactedYards)} yd³`,
      `Loose volume to order: ${NUM.format(result.looseYards)} yd³ (${NUM.format(result.looseM3)} m³)`,
      `Weight: ${NUM.format(result.shortTons)} short tons (${NUM.format(result.tonnes)} tonnes)`,
      `Deliveries: ${result.truckLoads} load(s) at ${result.truckTons} tons per truck`,
      `Estimated cost: ${MONEY.format(result.totalCost)}`,
      ...result.rows.map(
        (row) =>
          `  ${row.label} — ${row.materialLabel}: ${NUM.format(row.depthInches)} in, ${NUM.format(row.shortTons)} tons`,
      ),
    ].join("\n");
  }, [failed, result]);

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
    setAreaMode(DEFAULTS.areaMode);
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setArea(DEFAULTS.area);
    setUnit(DEFAULTS.unit);
    setAreaUnit(DEFAULTS.areaUnit);
    setMaterial(DEFAULTS.material);
    setDepth(DEFAULTS.depth);
    setDepthUnit(DEFAULTS.depthUnit);
    setSubBase(String(BUILDUP_LAYERS[0].defaultInches));
    setMiddle(String(BUILDUP_LAYERS[1].defaultInches));
    setSurface(String(BUILDUP_LAYERS[2].defaultInches));
    setCompactionPct(DEFAULTS.compactionPct);
    setPricePerTon(DEFAULTS.pricePerTon);
    setTruckTons(DEFAULTS.truckTons);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Area", DASH],
        ["Finished depth", DASH],
        ["Compacted volume", DASH],
        ["Loose volume to order", DASH],
        ["Weight", DASH],
        ["Truck loads", DASH],
        ["Estimated cost", DASH],
      ]
    : [
        ["Area", `${ONE.format(result.areaSqft)} ft² (${ONE.format(result.areaSqm)} m²)`],
        [
          "Finished depth",
          `${NUM.format(result.totalDepthInches)} in (${ONE.format(result.totalDepthCm)} cm)`,
        ],
        ["Compacted volume", `${NUM.format(result.compactedYards)} yd³`],
        [
          "Loose volume to order",
          `${NUM.format(result.looseYards)} yd³ (${NUM.format(result.looseM3)} m³)`,
        ],
        [
          "Weight",
          `${NUM.format(result.shortTons)} short tons (${NUM.format(result.tonnes)} t)`,
        ],
        ["Truck loads", `${result.truckLoads} at ${result.truckTons} tons each`],
        ["Estimated cost", MONEY.format(result.totalCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Truck className="h-4 w-4" aria-hidden="true" />
          Aggregate
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gravel Driveway Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out cubic yards, tonnes and truck loads for a driveway or parking pad — either a
          single layer or the standard three-course build-up — with the compaction allowance that
          stops you under-ordering.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gv-mode">
              Build type
            </label>
            <select
              id="gv-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="single">Single layer / top-up</option>
              <option value="buildup">New driveway — three courses</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gv-areamode">
              Measure by
            </label>
            <select
              id="gv-areamode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={areaMode}
              onChange={(event) => setAreaMode(event.target.value)}
            >
              <option value="dimensions">Length × width</option>
              <option value="area">Total area</option>
            </select>
          </div>

          {areaMode === "dimensions" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-unit">
                  Dimension unit
                </label>
                <select
                  id="gv-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="ft">Feet</option>
                  <option value="m">Metres</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS} htmlFor="gv-length">
                    Length ({unit})
                  </label>
                  <input
                    id="gv-length"
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.1"
                    step="1"
                    value={length}
                    onChange={(event) => setLength(event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="gv-width">
                    Width ({unit})
                  </label>
                  <input
                    id="gv-width"
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.1"
                    step="1"
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-areaunit">
                  Area unit
                </label>
                <select
                  id="gv-areaunit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={areaUnit}
                  onChange={(event) => setAreaUnit(event.target.value)}
                >
                  <option value="sqft">Square feet</option>
                  <option value="sqm">Square metres</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-area">
                  Area ({areaUnit === "sqm" ? "m²" : "ft²"})
                </label>
                <input
                  id="gv-area"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="10"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="gv-depthunit">
              Depth unit
            </label>
            <select
              id="gv-depthunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={depthUnit}
              onChange={(event) => setDepthUnit(event.target.value)}
            >
              <option value="in">Inches</option>
              <option value="cm">Centimetres</option>
            </select>
          </div>

          {mode === "single" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-depth">
                  Finished depth ({depthLabel})
                </label>
                <input
                  id="gv-depth"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  step="0.5"
                  value={depth}
                  onChange={(event) => setDepth(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="gv-material">
                  Aggregate
                </label>
                <select
                  id="gv-material"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                >
                  {Object.values(MATERIALS).map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label} — {option.tonsPerYard} ton/yd³
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
              {[
                ["gv-sub", `Sub-base ${depthLabel}`, subBase, setSubBase],
                ["gv-mid", `Middle course ${depthLabel}`, middle, setMiddle],
                ["gv-surf", `Surface course ${depthLabel}`, surface, setSurface],
              ].map(([id, label, value, setter]) => (
                <div key={id}>
                  <label className={LABEL_CLASS} htmlFor={id}>
                    {label}
                  </label>
                  <input
                    id={id}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={value}
                    onChange={(event) => setter(event.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="gv-compaction">
              Compaction allowance (%)
            </label>
            <input
              id="gv-compaction"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="1"
              value={compactionPct}
              onChange={(event) => setCompactionPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gv-price">
              Price per short ton
            </label>
            <input
              id="gv-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={pricePerTon}
              onChange={(event) => setPricePerTon(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gv-truck">
              Truck capacity (short tons per load)
            </label>
            <input
              id="gv-truck"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={truckTons}
              onChange={(event) => setTruckTons(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
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
              Gravel to order
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.shortTons)} tons`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a quantity."
                : `${NUM.format(result.looseYards)} yd³ loose · ${NUM.format(result.tonnes)} metric tonnes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy gravel driveway result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Layer by layer</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Layer
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Depth
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Loose yd³
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Tons
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.materialLabel}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.depthInches)} in</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(row.looseYards)}
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM.format(row.shortTons)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.rows.map((row) => (
              <li key={`${row.label}-note`} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                <span>
                  <strong className="font-semibold text-[var(--foreground)]">{row.label}:</strong>{" "}
                  {row.note}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only — bulk density varies with rock type and moisture, so confirm the tons per
        cubic yard with your supplier. Lay a geotextile fabric over soft ground before the sub-base,
        and roll each course before adding the next.
      </p>
    </main>
  );
}
