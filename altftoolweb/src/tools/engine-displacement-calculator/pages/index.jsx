"use client";

import { useMemo, useState } from "react";
import { Check, Cog, Copy, RotateCcw } from "lucide-react";
import {
  LENGTH_UNITS,
  SMALL_CAR_DIESEL_CC,
  SMALL_CAR_MAX_LENGTH_MM,
  SMALL_CAR_PETROL_CC,
  computeDisplacement,
} from "../lib";

const DEFAULTS = {
  bore: "73",
  stroke: "89.5",
  cylinders: "4",
  unit: "mm",
  compression: "10.5",
  vehicle: "car",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const PRESETS = [
  { label: "110 cc scooter", bore: "50", stroke: "55.6", cylinders: "1", unit: "mm", vehicle: "two-wheeler" },
  { label: "350 cc single", bore: "70", stroke: "90", cylinders: "1", unit: "mm", vehicle: "two-wheeler" },
  { label: "1.2 L 3-cyl petrol", bore: "73", stroke: "94.6", cylinders: "3", unit: "mm", vehicle: "car" },
  { label: "5.7 L V8 (in)", bore: "4", stroke: "3.48", cylinders: "8", unit: "in", vehicle: "car" },
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const fmt = (value, decimals = 2) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

export default function ToolHome() {
  const [bore, setBore] = useState(DEFAULTS.bore);
  const [stroke, setStroke] = useState(DEFAULTS.stroke);
  const [cylinders, setCylinders] = useState(DEFAULTS.cylinders);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [compression, setCompression] = useState(DEFAULTS.compression);
  const [vehicle, setVehicle] = useState(DEFAULTS.vehicle);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDisplacement({
        bore: toNumber(bore),
        stroke: toNumber(stroke),
        cylinders: toNumber(cylinders),
        unit,
        compressionRatio: toNumber(compression) || 0,
      }),
    [bore, stroke, cylinders, unit, compression],
  );

  const error = result.error || "";
  const unitShort = LENGTH_UNITS.find((u) => u.id === unit)?.short || "mm";

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Engine displacement",
      `Bore x stroke: ${fmt(toNumber(bore), 2)} x ${fmt(toNumber(stroke), 2)} ${unitShort}`,
      `Cylinders: ${toNumber(cylinders)}`,
      `Per cylinder: ${fmt(result.perCylinderCc, 1)} cc`,
      `Total displacement: ${fmt(result.totalCc, 1)} cc (${fmt(result.litres, 3)} L, ${fmt(result.cubicInches, 1)} cu in)`,
      `Bore/stroke ratio: ${fmt(result.boreStrokeRatio, 3)}`,
      result.clearanceCcPerCylinder
        ? `Clearance volume per cylinder: ${fmt(result.clearanceCcPerCylinder, 2)} cc`
        : "Clearance volume: not calculated",
    ].join("\n");
  }, [error, bore, stroke, cylinders, unitShort, result]);

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
    setBore(DEFAULTS.bore);
    setStroke(DEFAULTS.stroke);
    setCylinders(DEFAULTS.cylinders);
    setUnit(DEFAULTS.unit);
    setCompression(DEFAULTS.compression);
    setVehicle(DEFAULTS.vehicle);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setBore(preset.bore);
    setStroke(preset.stroke);
    setCylinders(preset.cylinders);
    setUnit(preset.unit);
    setVehicle(preset.vehicle);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cog className="h-4 w-4" aria-hidden="true" />
          Engine spec
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Engine Displacement Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter bore, stroke and cylinder count to get swept volume in cc, litres and cubic inches,
          plus the bore-to-stroke character and the clearance volume implied by a compression ratio.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eng-unit">
              Bore and stroke unit
            </label>
            <select
              id="eng-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {LENGTH_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label} ({u.short})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eng-cyl">
              Number of cylinders
            </label>
            <input
              id="eng-cyl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="16"
              step="1"
              value={cylinders}
              onChange={(event) => setCylinders(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eng-bore">
              Bore — cylinder diameter ({unitShort})
            </label>
            <input
              id="eng-bore"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={bore}
              onChange={(event) => setBore(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eng-stroke">
              Stroke — piston travel ({unitShort})
            </label>
            <input
              id="eng-stroke"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={stroke}
              onChange={(event) => setStroke(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eng-cr">
              Compression ratio (0 to skip)
            </label>
            <input
              id="eng-cr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.1"
              value={compression}
              onChange={(event) => setCompression(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eng-vehicle">
              Vehicle type (for the capacity slab)
            </label>
            <select
              id="eng-vehicle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicle}
              onChange={(event) => setVehicle(event.target.value)}
            >
              <option value="two-wheeler">Two-wheeler</option>
              <option value="car">Private car</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total displacement
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : `${fmt(result.totalCc, 1)} cc`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `${fmt(result.litres, 3)} litres · ${fmt(result.cubicInches, 1)} cubic inches`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy engine displacement result"
              className={GHOST_BTN}
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
          {[
            ["Swept volume per cylinder", error ? DASH : `${fmt(result.perCylinderCc, 2)} cc`],
            ["Bore / stroke ratio", error ? DASH : fmt(result.boreStrokeRatio, 3)],
            ["Character", error ? DASH : result.boreStrokeCharacter],
            [
              "Clearance volume per cylinder",
              error || !result.clearanceCcPerCylinder
                ? DASH
                : `${fmt(result.clearanceCcPerCylinder, 2)} cc`,
            ],
            [
              "Total volume above piston at BDC",
              error || !result.totalChamberCc ? DASH : `${fmt(result.totalChamberCc, 1)} cc`,
            ],
            [
              "Insurance capacity slab",
              error ? DASH : vehicle === "car" ? result.carSlab : result.twoWheelerSlab,
            ],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        {!error && vehicle === "car" ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            GST treats a car as a small car only if the engine is within {SMALL_CAR_PETROL_CC} cc
            (petrol, CNG or LPG) or {SMALL_CAR_DIESEL_CC} cc (diesel) and the body is no longer than{" "}
            {SMALL_CAR_MAX_LENGTH_MM} mm. This engine is{" "}
            {result.smallCarPetrol ? "within" : "above"} the petrol limit and{" "}
            {result.smallCarDiesel ? "within" : "above"} the diesel limit.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the number is built</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Each cylinder is a circle of diameter equal to the bore swept through the stroke, so its
          volume is <span className="font-semibold text-[var(--foreground)]">π ÷ 4 × bore² × stroke</span>.
          In millimetres that gives mm³; dividing by 1000 gives cc. Multiply by the cylinder count for
          the figure quoted on the registration certificate. Displacement counts only the swept
          volume — the combustion chamber above the piston at top dead centre is extra, which is why
          the clearance volume is shown separately.
        </p>
      </section>
    </main>
  );
}
