"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Weight } from "lucide-react";
import {
  FIBRE_SATURATION_PERCENT,
  LENGTH_UNITS,
  REFERENCE_MOISTURE_PERCENT,
  SPECIES,
  computeTimberWeight,
  getSpecies,
} from "../lib";

const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const n1 = (value) => N1.format(Number.isFinite(value) ? value : 0);
const n2 = (value) => N2.format(Number.isFinite(value) ? value : 0);
const n4 = (value) => N4.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const MOISTURE_PRESETS = [
  ["Kiln dried", 8],
  ["Seasoned (12%)", 12],
  ["Air dry (18%)", 18],
  ["Fibre saturation", 30],
  ["Green / freshly felled", 60],
];

const DEFAULTS = {
  speciesId: "teak",
  customDensity: "650",
  thickness: "25",
  thicknessUnit: "mm",
  width: "200",
  widthUnit: "mm",
  length: "2",
  lengthUnit: "m",
  pieces: "10",
  moisturePercent: String(REFERENCE_MOISTURE_PERCENT),
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

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

function UnitSelect({ id, value, onChange, label }) {
  return (
    <select id={id} className={INPUT_CLASS} value={value} onChange={onChange} aria-label={label}>
      {Object.entries(LENGTH_UNITS).map(([key, entry]) => (
        <option key={key} value={key}>
          {entry.label}
        </option>
      ))}
    </select>
  );
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const species = getSpecies(form.speciesId);

  const result = useMemo(
    () =>
      computeTimberWeight({
        speciesId: form.speciesId,
        customDensity: toNumber(form.customDensity),
        thickness: toNumber(form.thickness),
        thicknessUnit: form.thicknessUnit,
        width: toNumber(form.width),
        widthUnit: form.widthUnit,
        length: toNumber(form.length),
        lengthUnit: form.lengthUnit,
        pieces: toNumber(form.pieces),
        moisturePercent: toNumber(form.moisturePercent),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Timber Weight",
      `Species: ${result.speciesLabel}`,
      `Density used: ${n1(result.density)} kg/m³ at ${form.moisturePercent}% moisture`,
      `Volume: ${n4(result.totalVolume)} m³ (${n2(result.totalVolumeCubicFeet)} cu ft)`,
      `Weight per piece: ${n2(result.weightPerPiece)} kg`,
      `Total weight for ${result.pieces} pieces: ${n1(result.totalWeight)} kg (${n1(result.totalWeightPounds)} lb)`,
    ].join("\n");
  }, [hasError, result, form.moisturePercent]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Density at this moisture", DASH],
        ["Published density at 12%", DASH],
        ["Change from the seasoned figure", DASH],
        ["Volume per piece", DASH],
        ["Total volume", DASH],
        ["Volume in cubic feet", DASH],
        ["Weight per piece", DASH],
        ["Weight per metre run", DASH],
        ["Total weight in pounds", DASH],
      ]
    : [
        ["Density at this moisture", `${n1(result.density)} kg/m³`],
        ["Published density at 12%", `${n1(result.density12)} kg/m³`],
        [
          "Change from the seasoned figure",
          result.engineered ? "Not applicable" : `${n1(result.densityChangePercent)}%`,
        ],
        ["Volume per piece", `${n4(result.volumePerPiece)} m³`],
        ["Total volume", `${n4(result.totalVolume)} m³`],
        ["Volume in cubic feet", `${n2(result.totalVolumeCubicFeet)} cu ft`],
        ["Weight per piece", `${n2(result.weightPerPiece)} kg`],
        ["Weight per metre run", `${n2(result.weightPerMetreRun)} kg/m`],
        ["Total weight in pounds", `${n1(result.totalWeightPounds)} lb`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Weight className="h-4 w-4" aria-hidden="true" />
          Carpentry
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Timber Weight Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weight is volume times density, and wood density moves with moisture. This uses the USDA
          Wood Handbook shrinkage model to adjust each species from its seasoned figure to the
          moisture content you are actually handling.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tw-species">
              Species or board type
            </label>
            <select
              id="tw-species"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.speciesId}
              onChange={setField("speciesId")}
            >
              {SPECIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.custom ? "" : ` — ${item.density12} kg/m³`}
                </option>
              ))}
            </select>
          </div>

          {species.custom && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="tw-custom-density">
                Custom density at 12% moisture (kg/m³)
              </label>
              <input
                id="tw-custom-density"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="1500"
                step="10"
                value={form.customDensity}
                onChange={setField("customDensity")}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="tw-thickness">
              Thickness
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                id="tw-thickness"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={form.thickness}
                onChange={setField("thickness")}
              />
              <UnitSelect
                id="tw-thickness-unit"
                label="Thickness unit"
                value={form.thicknessUnit}
                onChange={setField("thicknessUnit")}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-width">
              Width
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                id="tw-width"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={form.width}
                onChange={setField("width")}
              />
              <UnitSelect
                id="tw-width-unit"
                label="Width unit"
                value={form.widthUnit}
                onChange={setField("widthUnit")}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-length">
              Length
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                id="tw-length"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={form.length}
                onChange={setField("length")}
              />
              <UnitSelect
                id="tw-length-unit"
                label="Length unit"
                value={form.lengthUnit}
                onChange={setField("lengthUnit")}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-pieces">
              Number of pieces
            </label>
            <input
              id="tw-pieces"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.pieces}
              onChange={setField("pieces")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tw-moisture">
              Moisture content (% of oven-dry weight)
            </label>
            <input
              id="tw-moisture"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="1"
              value={form.moisturePercent}
              onChange={setField("moisturePercent")}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {MOISTURE_PRESETS.map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  className={CHIP_BTN}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, moisturePercent: String(value) }));
                    setCopied(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${n1(result.totalWeight)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${result.pieces} pieces of ${result.speciesLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy timber weight result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.engineered && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Engineered boards are pressed to a target density, so the moisture model is not applied
            here — the manufacturer&apos;s stated density is used as supplied.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Densities are typical mid-range values and individual trees vary by roughly 10% either way,
        so treat the answer as a planning figure. Above {FIBRE_SATURATION_PERCENT}% moisture the wood
        no longer swells, and extra water simply adds mass. For lifting, rigging or structural load
        decisions, use the actual weighed figure.
      </p>
    </main>
  );
}
