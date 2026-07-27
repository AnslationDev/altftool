"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";
import { BAG_PRESETS, DEPTH_PRESETS, computeMulch } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");
const int = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  unit: "imperial",
  shape: "rectangle",
  length: "20",
  width: "10",
  diameter: "8",
  area: "200",
  depth: "3",
  bagSize: "2",
  pricePerBag: "350",
  bulkPrice: "4000",
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
  const [bagSize, setBagSize] = useState(DEFAULTS.bagSize);
  const [pricePerBag, setPricePerBag] = useState(DEFAULTS.pricePerBag);
  const [bulkPrice, setBulkPrice] = useState(DEFAULTS.bulkPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeMulch({
        unit,
        shape,
        length: toNumber(length),
        width: toNumber(width),
        diameter: toNumber(diameter),
        area: toNumber(area),
        depth: toNumber(depth),
        bagSize: toNumber(bagSize),
        pricePerBag: toNumber(pricePerBag),
        bulkPrice: toNumber(bulkPrice),
      }),
    [unit, shape, length, width, diameter, area, depth, bagSize, pricePerBag, bulkPrice],
  );

  const hasError = Boolean(result.error);
  const isImperial = unit === "imperial";
  const lengthUnit = isImperial ? "ft" : "m";
  const areaUnit = isImperial ? "sq ft" : "m²";
  const depthUnit = isImperial ? "in" : "cm";
  const bagUnit = isImperial ? "cu ft" : "litres";
  const bulkUnit = isImperial ? "cu yd" : "m³";

  const switchUnit = (next) => {
    if (next === unit) return;
    setUnit(next);
    if (next === "metric") {
      setLength("6");
      setWidth("3");
      setDiameter("2.5");
      setArea("18");
      setDepth("7.5");
      setBagSize("50");
      setPricePerBag("250");
      setBulkPrice("5000");
    } else {
      setLength(DEFAULTS.length);
      setWidth(DEFAULTS.width);
      setDiameter(DEFAULTS.diameter);
      setArea(DEFAULTS.area);
      setDepth(DEFAULTS.depth);
      setBagSize(DEFAULTS.bagSize);
      setPricePerBag(DEFAULTS.pricePerBag);
      setBulkPrice(DEFAULTS.bulkPrice);
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mulch Quantity Calculator",
      `Bed area: ${num(result.bedArea)} ${result.areaUnit}`,
      `Depth: ${num(toNumber(depth))} ${result.depthUnit}`,
      `Mulch needed: ${num(result.volumeCuFt)} cu ft = ${num(result.volumeCuYd)} cu yd = ${num(result.volumeM3)} m³ = ${int(result.volumeLitres)} litres`,
      `Bags (${num(toNumber(bagSize))} ${bagUnit} each): ${int(result.bags)} — ${money(result.bagCost)}`,
      `Bulk order: ${num(result.bulkOrder)} ${result.bulkUnit} — ${money(result.bulkCost)}`,
      `Approximate weight: ${int(result.weightKg)} kg`,
    ].join("\n");
  }, [hasError, result, depth, bagSize, bagUnit]);

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
    setBagSize(DEFAULTS.bagSize);
    setPricePerBag(DEFAULTS.pricePerBag);
    setBulkPrice(DEFAULTS.bulkPrice);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Bed area", "—"],
        ["Cubic feet", "—"],
        ["Cubic yards", "—"],
        ["Cubic metres", "—"],
        ["Litres", "—"],
        ["Bags to buy", "—"],
        ["Cost in bags", "—"],
        ["Bulk order", "—"],
        ["Cost in bulk", "—"],
        ["Approximate weight", "—"],
      ]
    : [
        ["Bed area", `${num(result.bedArea)} ${result.areaUnit}`],
        ["Cubic feet", `${num(result.volumeCuFt)} cu ft`],
        ["Cubic yards", `${num(result.volumeCuYd)} cu yd`],
        ["Cubic metres", `${num(result.volumeM3)} m³`],
        ["Litres", `${int(result.volumeLitres)} L`],
        ["Bags to buy", int(result.bags)],
        ["Cost in bags", money(result.bagCost)],
        ["Bulk order (rounded up)", `${num(result.bulkOrder)} ${result.bulkUnit}`],
        ["Cost in bulk", money(result.bulkCost)],
        ["Approximate weight", `${int(result.weightKg)} kg`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Lawn &amp; landscape
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Mulch Quantity Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the bed size and the depth you want, and get the mulch volume in cubic feet, cubic
          yards, cubic metres and litres — plus the bag count and whether bulk works out cheaper.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => switchUnit("imperial")} className={isImperial ? CHIP_ON : CHIP_BTN} aria-pressed={isImperial}>
            Feet &amp; inches
          </button>
          <button type="button" onClick={() => switchUnit("metric")} className={!isImperial ? CHIP_ON : CHIP_BTN} aria-pressed={!isImperial}>
            Metres &amp; cm
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["rectangle", "Rectangular bed"],
            ["circle", "Circular bed"],
            ["area", "I know the area"],
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
                <label className={LABEL_CLASS} htmlFor="mulch-length">
                  Bed length ({lengthUnit})
                </label>
                <input id="mulch-length" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="mulch-width">
                  Bed width ({lengthUnit})
                </label>
                <input id="mulch-width" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} />
              </div>
            </>
          )}
          {shape === "circle" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="mulch-diameter">
                Bed diameter ({lengthUnit})
              </label>
              <input id="mulch-diameter" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.1" value={diameter} onChange={(e) => setDiameter(e.target.value)} />
            </div>
          )}
          {shape === "area" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="mulch-area">
                Bed area ({areaUnit})
              </label>
              <input id="mulch-area" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="mulch-depth">
              Mulch depth ({depthUnit})
            </label>
            <input id="mulch-depth" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={depth} onChange={(e) => setDepth(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mulch-bag">
              Bag size ({bagUnit})
            </label>
            <input id="mulch-bag" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={bagSize} onChange={(e) => setBagSize(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mulch-bagprice">
              Price per bag (₹)
            </label>
            <input id="mulch-bagprice" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={pricePerBag} onChange={(e) => setPricePerBag(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mulch-bulkprice">
              Bulk price (₹ per {bulkUnit})
            </label>
            <input id="mulch-bulkprice" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="100" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Recommended depth</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEPTH_PRESETS.map((preset) => {
              const value = isImperial ? preset.inches : preset.cm;
              return (
                <button key={preset.id} type="button" className={toNumber(depth) === value ? CHIP_ON : CHIP_BTN} onClick={() => setDepth(String(value))}>
                  {preset.label} · {value} {depthUnit}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Common bag sizes</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {BAG_PRESETS.filter((preset) => preset.unit === unit).map((preset) => (
              <button key={preset.id} type="button" className={toNumber(bagSize) === preset.size ? CHIP_ON : CHIP_BTN} onClick={() => setBagSize(String(preset.size))}>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Mulch needed</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${num(result.primaryVolume)} ${result.primaryVolumeUnit}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the volume." : `${int(result.bags)} bags, or ${num(result.bulkOrder)} ${result.bulkUnit} delivered loose`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy mulch estimate" className={GHOST_BTN} disabled={hasError}>
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

        {!hasError && result.cheaper && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Buying {result.cheaper === "bulk" ? "loose in bulk" : "in bags"} is cheaper for this bed at the prices entered.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Keep mulch clear of stems and trunks by a few centimetres — piling it against bark traps
        moisture and invites rot. Weight is an approximation for air-dry bark; a wet load can be far
        heavier.
      </p>
    </main>
  );
}
