"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shovel } from "lucide-react";
import { BULK_BAG_M3, DEPTH_PRESETS, MIX_PRESETS, computeSoilVolume } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num3 = (value) => (Number.isFinite(value) ? NUM3.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");
const int = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  unit: "metric",
  shape: "rectangle",
  length: "2.4",
  width: "1.2",
  diameter: "1.5",
  area: "3",
  depth: "30",
  topsoil: "6",
  compost: "3",
  grit: "1",
  bagLitres: "40",
  pricePerBag: "180",
  bulkBagVolume: String(BULK_BAG_M3),
  pricePerBulkBag: "3500",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
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
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [shape, setShape] = useState(DEFAULTS.shape);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [diameter, setDiameter] = useState(DEFAULTS.diameter);
  const [area, setArea] = useState(DEFAULTS.area);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [topsoil, setTopsoil] = useState(DEFAULTS.topsoil);
  const [compost, setCompost] = useState(DEFAULTS.compost);
  const [grit, setGrit] = useState(DEFAULTS.grit);
  const [bagLitres, setBagLitres] = useState(DEFAULTS.bagLitres);
  const [pricePerBag, setPricePerBag] = useState(DEFAULTS.pricePerBag);
  const [bulkBagVolume, setBulkBagVolume] = useState(DEFAULTS.bulkBagVolume);
  const [pricePerBulkBag, setPricePerBulkBag] = useState(DEFAULTS.pricePerBulkBag);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSoilVolume({
        unit,
        shape,
        length: toNumber(length),
        width: toNumber(width),
        diameter: toNumber(diameter),
        area: toNumber(area),
        depth: toNumber(depth),
        parts: { topsoil: toNumber(topsoil), compost: toNumber(compost), grit: toNumber(grit) },
        bagLitres: toNumber(bagLitres),
        pricePerBag: toNumber(pricePerBag),
        bulkBagVolumeM3: toNumber(bulkBagVolume),
        pricePerBulkBag: toNumber(pricePerBulkBag),
      }),
    [unit, shape, length, width, diameter, area, depth, topsoil, compost, grit, bagLitres, pricePerBag, bulkBagVolume, pricePerBulkBag],
  );

  const hasError = Boolean(result.error);
  const isMetric = unit === "metric";
  const lengthUnit = isMetric ? "m" : "ft";
  const areaUnit = isMetric ? "m²" : "sq ft";
  const depthUnit = isMetric ? "cm" : "in";

  const switchUnit = (next) => {
    if (next === unit) return;
    setUnit(next);
    if (next === "imperial") {
      setLength("8");
      setWidth("4");
      setDiameter("5");
      setArea("32");
      setDepth("12");
    } else {
      setLength(DEFAULTS.length);
      setWidth(DEFAULTS.width);
      setDiameter(DEFAULTS.diameter);
      setArea(DEFAULTS.area);
      setDepth(DEFAULTS.depth);
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const mix = result.components
      .filter((item) => item.volumeM3 > 0)
      .map((item) => `  ${item.label}: ${num3(item.volumeM3)} m³ (${int(item.volumeLitres)} L, ${int(item.weightKg)} kg)`)
      .join("\n");
    return [
      "Garden Soil Volume Calculator",
      `Area: ${num(result.footprint)} ${result.areaUnit} at ${num(toNumber(depth))} ${result.depthUnit} deep`,
      `Soil needed: ${num3(result.volumeM3)} m³ = ${int(result.volumeLitres)} litres = ${num(result.volumeCuFt)} cu ft = ${num(result.volumeCuYd)} cu yd`,
      `Weight: ${int(result.weightKg)} kg (${num(result.weightTonnes)} tonnes) at ${int(result.effectiveDensity)} kg/m³`,
      "Mix breakdown:",
      mix,
      `Bags of ${num(toNumber(bagLitres))} L: ${int(result.bags)} — ${money(result.bagCost)}`,
      `Bulk bags of ${num(toNumber(bulkBagVolume))} m³: ${int(result.bulkBags)} — ${money(result.bulkBagCost)}`,
    ].join("\n");
  }, [hasError, result, depth, bagLitres, bulkBagVolume]);

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
    setUnit(DEFAULTS.unit);
    setShape(DEFAULTS.shape);
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setDiameter(DEFAULTS.diameter);
    setArea(DEFAULTS.area);
    setDepth(DEFAULTS.depth);
    setTopsoil(DEFAULTS.topsoil);
    setCompost(DEFAULTS.compost);
    setGrit(DEFAULTS.grit);
    setBagLitres(DEFAULTS.bagLitres);
    setPricePerBag(DEFAULTS.pricePerBag);
    setBulkBagVolume(DEFAULTS.bulkBagVolume);
    setPricePerBulkBag(DEFAULTS.pricePerBulkBag);
    setCopied(false);
  };

  const applyMix = (preset) => {
    setTopsoil(String(preset.parts.topsoil));
    setCompost(String(preset.parts.compost));
    setGrit(String(preset.parts.grit));
  };

  const rows = hasError
    ? [
        ["Area covered", "—"],
        ["Cubic metres", "—"],
        ["Litres", "—"],
        ["Cubic feet", "—"],
        ["Cubic yards", "—"],
        ["Weight", "—"],
        ["Blended density", "—"],
        ["Bags to buy", "—"],
        ["Cost in bags", "—"],
        ["Bulk bags", "—"],
        ["Cost in bulk bags", "—"],
      ]
    : [
        ["Area covered", `${num(result.footprint)} ${result.areaUnit}`],
        ["Cubic metres", `${num3(result.volumeM3)} m³`],
        ["Litres", `${int(result.volumeLitres)} L`],
        ["Cubic feet", `${num(result.volumeCuFt)} cu ft`],
        ["Cubic yards", `${num(result.volumeCuYd)} cu yd`],
        ["Weight", `${int(result.weightKg)} kg (${num(result.weightTonnes)} t)`],
        ["Blended density", `${int(result.effectiveDensity)} kg/m³`],
        ["Bags to buy", int(result.bags)],
        ["Cost in bags", money(result.bagCost)],
        ["Bulk bags", int(result.bulkBags)],
        ["Cost in bulk bags", money(result.bulkBagCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Shovel className="h-4 w-4" aria-hidden="true" />
          Lawn &amp; landscape
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Garden Soil Volume Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the topsoil volume to fill a raised bed, level a lawn or top-dress a border — with
          the weight, the bag count and the split across topsoil, compost and grit.
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
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["rectangle", "Rectangle"],
            ["circle", "Circle"],
            ["area", "Known area"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setShape(id)} className={shape === id ? CHIP_ON : CHIP_BTN} aria-pressed={shape === id}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {shape === "rectangle" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="soil-length">
                  Length ({lengthUnit})
                </label>
                <input id="soil-length" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="soil-width">
                  Width ({lengthUnit})
                </label>
                <input id="soil-width" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} />
              </div>
            </>
          )}
          {shape === "circle" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="soil-diameter">
                Diameter ({lengthUnit})
              </label>
              <input id="soil-diameter" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.1" value={diameter} onChange={(e) => setDiameter(e.target.value)} />
            </div>
          )}
          {shape === "area" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="soil-area">
                Area ({areaUnit})
              </label>
              <input id="soil-area" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="soil-depth">
              Soil depth ({depthUnit})
            </label>
            <input id="soil-depth" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={depth} onChange={(e) => setDepth(e.target.value)} />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="soil-topsoil">
              Topsoil parts
            </label>
            <input id="soil-topsoil" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={topsoil} onChange={(e) => setTopsoil(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soil-compost">
              Compost parts
            </label>
            <input id="soil-compost" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={compost} onChange={(e) => setCompost(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soil-grit">
              Sand / grit parts
            </label>
            <input id="soil-grit" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={grit} onChange={(e) => setGrit(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soil-bag">
              Bag size (litres)
            </label>
            <input id="soil-bag" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="5" value={bagLitres} onChange={(e) => setBagLitres(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soil-bagprice">
              Price per bag (₹)
            </label>
            <input id="soil-bagprice" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={pricePerBag} onChange={(e) => setPricePerBag(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soil-bulkvol">
              Bulk bag volume (m³)
            </label>
            <input id="soil-bulkvol" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={bulkBagVolume} onChange={(e) => setBulkBagVolume(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soil-bulkprice">
              Price per bulk bag (₹)
            </label>
            <input id="soil-bulkprice" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="100" value={pricePerBulkBag} onChange={(e) => setPricePerBulkBag(e.target.value)} />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Job depth guide</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEPTH_PRESETS.map((preset) => {
              const value = isMetric ? preset.cm : preset.inches;
              return (
                <button key={preset.id} type="button" className={toNumber(depth) === value ? CHIP_ON : CHIP_BTN} onClick={() => setDepth(String(value))}>
                  {preset.label} · {value} {depthUnit}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Mix recipes (parts by volume)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MIX_PRESETS.map((preset) => (
              <button key={preset.id} type="button" className={CHIP_BTN} onClick={() => applyMix(preset)}>
                {preset.label}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Soil needed</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${num3(result.primaryVolume)} ${result.primaryVolumeUnit}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the volume." : `${int(result.volumeLitres)} litres · about ${int(result.weightKg)} kg`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy soil volume estimate" className={GHOST_BTN} disabled={hasError}>
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

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Mix breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Component</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Share</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Volume (m³)</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Litres</th>
                  <th scope="col" className="py-2 text-right font-semibold">Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {result.components.map((item) => (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 text-right">{num(item.share * 100)}%</td>
                    <td className="py-2 pr-3 text-right">{num3(item.volumeM3)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{int(item.volumeLitres)}</td>
                    <td className="py-2 text-right">{int(item.weightKg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Loose soil settles — expect a fresh raised bed to drop 10–15% in the first season, so fill to
        the brim or plan a top-up. Weights are estimates for typical delivered material and rise
        sharply when the soil is wet.
      </p>
    </main>
  );
}
