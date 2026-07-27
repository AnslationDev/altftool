"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PaintRoller, RotateCcw } from "lucide-react";

import { CONDITIONS, MATERIALS, calculateSealer } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const ONE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const MONEY = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DEFAULTS = {
  mode: "dimensions",
  length: "60",
  width: "12",
  area: "720",
  unit: "ft",
  areaUnit: "sqft",
  extraArea: "0",
  material: "asphalt",
  condition: "average",
  coats: "2",
  wastePct: "5",
  crackFeet: "0",
  pricePerPail: "35",
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
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [area, setArea] = useState(DEFAULTS.area);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [areaUnit, setAreaUnit] = useState(DEFAULTS.areaUnit);
  const [extraArea, setExtraArea] = useState(DEFAULTS.extraArea);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [condition, setCondition] = useState(DEFAULTS.condition);
  const [coats, setCoats] = useState(DEFAULTS.coats);
  const [wastePct, setWastePct] = useState(DEFAULTS.wastePct);
  const [crackFeet, setCrackFeet] = useState(DEFAULTS.crackFeet);
  const [pricePerPail, setPricePerPail] = useState(DEFAULTS.pricePerPail);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateSealer({
        mode,
        length,
        width,
        area,
        unit,
        areaUnit,
        extraArea,
        material,
        condition,
        coats,
        wastePct,
        crackFeet,
        pricePerPail,
      }),
    [
      mode,
      length,
      width,
      area,
      unit,
      areaUnit,
      extraArea,
      material,
      condition,
      coats,
      wastePct,
      crackFeet,
      pricePerPail,
    ],
  );

  const failed = Boolean(result.error);
  const extraUnitLabel =
    mode === "dimensions" ? (unit === "m" ? "m²" : "ft²") : areaUnit === "sqm" ? "m²" : "ft²";

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Driveway Sealer Calculator",
      `Surface: ${result.materialLabel}`,
      `Condition: ${result.conditionLabel}`,
      `Area: ${ONE.format(result.totalSqft)} ft² (${ONE.format(result.totalSqm)} m²)`,
      `With waste allowance: ${ONE.format(result.effectiveSqft)} ft²`,
      `Coverage: ${ONE.format(result.firstCoatCoverage)} ft²/gal first coat, ${ONE.format(result.laterCoatCoverage)} ft²/gal after`,
      `Coats: ${result.coats}`,
      `Sealer needed: ${NUM.format(result.totalGallons)} gallons (${ONE.format(result.litres)} L)`,
      `Buy: ${result.pails} × 5-gallon pails — ${NUM.format(result.leftoverGallons)} gallons spare`,
      `Estimated cost: ${MONEY.format(result.totalCost)}`,
      result.crackTubes > 0
        ? `Crack filler: ${NUM.format(result.crackGallons)} gallons (${result.crackJugs} jug(s)) or ${result.crackTubes} caulk tube(s)`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setArea(DEFAULTS.area);
    setUnit(DEFAULTS.unit);
    setAreaUnit(DEFAULTS.areaUnit);
    setExtraArea(DEFAULTS.extraArea);
    setMaterial(DEFAULTS.material);
    setCondition(DEFAULTS.condition);
    setCoats(DEFAULTS.coats);
    setWastePct(DEFAULTS.wastePct);
    setCrackFeet(DEFAULTS.crackFeet);
    setPricePerPail(DEFAULTS.pricePerPail);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Area to seal", DASH],
        ["Area including waste allowance", DASH],
        ["First-coat coverage", DASH],
        ["Later-coat coverage", DASH],
        ["Total sealer", DASH],
        ["Left over in the last pail", DASH],
        ["Crack filler", DASH],
        ["Estimated cost", DASH],
      ]
    : [
        [
          "Area to seal",
          `${ONE.format(result.totalSqft)} ft² (${ONE.format(result.totalSqm)} m²)`,
        ],
        ["Area including waste allowance", `${ONE.format(result.effectiveSqft)} ft²`],
        [
          "First-coat coverage",
          `${ONE.format(result.firstCoatCoverage)} ft²/gal (${NUM.format(result.coverageSqmPerLitre)} m²/L)`,
        ],
        ["Later-coat coverage", `${ONE.format(result.laterCoatCoverage)} ft²/gal`],
        [
          "Total sealer",
          `${NUM.format(result.totalGallons)} gal (${ONE.format(result.litres)} L)`,
        ],
        ["Left over in the last pail", `${NUM.format(result.leftoverGallons)} gal`],
        [
          "Crack filler",
          result.crackTubes > 0
            ? `${result.crackJugs} jug(s) or ${result.crackTubes} tube(s)`
            : "none entered",
        ],
        ["Estimated cost", MONEY.format(result.totalCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PaintRoller className="h-4 w-4" aria-hidden="true" />
          Driveway
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Driveway Sealer Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out gallons, litres and 5-gallon pails from your driveway area, how porous the
          surface is and how many coats you plan — allowing for the fact that a second coat always
          goes further than the first.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ds-mode">
              Measure by
            </label>
            <select
              id="ds-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="dimensions">Length × width</option>
              <option value="area">Total area</option>
            </select>
          </div>

          {mode === "dimensions" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ds-unit">
                  Dimension unit
                </label>
                <select
                  id="ds-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="ft">Feet</option>
                  <option value="m">Metres</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ds-length">
                  Driveway length ({unit})
                </label>
                <input
                  id="ds-length"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="0.5"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ds-width">
                  Driveway width ({unit})
                </label>
                <input
                  id="ds-width"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="0.5"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ds-areaunit">
                  Area unit
                </label>
                <select
                  id="ds-areaunit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={areaUnit}
                  onChange={(event) => setAreaUnit(event.target.value)}
                >
                  <option value="sqft">Square feet</option>
                  <option value="sqm">Square metres</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ds-area">
                  Driveway area ({extraUnitLabel})
                </label>
                <input
                  id="ds-area"
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
            <label className={LABEL_CLASS} htmlFor="ds-extra">
              Extra apron or pad ({extraUnitLabel})
            </label>
            <input
              id="ds-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={extraArea}
              onChange={(event) => setExtraArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-material">
              Surface and sealer type
            </label>
            <select
              id="ds-material"
              className={`mt-2 ${INPUT_CLASS}`}
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
            >
              {Object.values(MATERIALS).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-condition">
              Surface condition
            </label>
            <select
              id="ds-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              {Object.values(CONDITIONS).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-coats">
              Number of coats
            </label>
            <input
              id="ds-coats"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-waste">
              Waste / overlap allowance (%)
            </label>
            <input
              id="ds-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={wastePct}
              onChange={(event) => setWastePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-cracks">
              Cracks to fill (linear feet)
            </label>
            <input
              id="ds-cracks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={crackFeet}
              onChange={(event) => setCrackFeet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-price">
              Price per 5-gallon pail
            </label>
            <input
              id="ds-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={pricePerPail}
              onChange={(event) => setPricePerPail(event.target.value)}
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
              Sealer to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${INT.format(result.pails)} pails`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a quantity."
                : `${NUM.format(result.totalGallons)} gallons (${ONE.format(result.litres)} L) across ${result.coats} coat${result.coats > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy driveway sealer result"
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
          <h2 className="text-base font-semibold">Coat by coat</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Coat
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Coverage
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Gallons
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Litres
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.perCoat.map((row) => (
                  <tr key={row.coat} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.coat}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {ONE.format(row.coverage)} ft²/gal
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.gallons)}</td>
                    <td className="py-2 text-right">{ONE.format(row.litres)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only — always check the spread rate printed on the pail, since products vary.
        Fill cracks and let them cure before sealing, do not seal below about 10 °C or with rain
        forecast within 24 hours, and keep vehicles off for 24-48 hours.
      </p>
    </main>
  );
}
