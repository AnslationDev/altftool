"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  COCOPEAT_BLOCK_KG,
  COCOPEAT_BLOCK_LITRES,
  COMPONENTS,
  LENGTH_UNITS,
  MIX_PRESETS,
  computeRaisedBedFill,
  costForComponents,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const num0 = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  beds: "1",
  length: "8",
  width: "4",
  height: "1",
  headspace: "0.17",
  fillerDepth: "0",
  unitId: "ft",
  settlementPercent: "15",
  presetId: "balanced",
  soil: "40",
  compost: "30",
  cocopeat: "20",
  perlite: "10",
  sand: "0",
  rateSoil: "0",
  rateCompost: "0",
  rateCocopeat: "0",
  ratePerlite: "0",
  rateSand: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const RATE_UNIT = {
  soil: "₹ per kg",
  compost: "₹ per kg",
  cocopeat: "₹ per 5 kg block",
  perlite: "₹ per litre",
  sand: "₹ per kg",
};

function Field({ id, label, value, onChange, min, max, step, hint }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const set = (key) => (value) => setState((current) => ({ ...current, [key]: value }));

  const choosePreset = (presetId) => {
    const preset = MIX_PRESETS[presetId];
    if (!preset) return;
    if (presetId === "custom") {
      // "Custom mix" just unlocks the currently active percentages for direct
      // editing — it must not silently discard whatever recipe was already
      // dialled in by overwriting it with a hardcoded starting point.
      setState((current) => ({ ...current, presetId }));
      return;
    }
    setState((current) => ({
      ...current,
      presetId,
      soil: String(preset.mix.soil),
      compost: String(preset.mix.compost),
      cocopeat: String(preset.mix.cocopeat),
      perlite: String(preset.mix.perlite),
      sand: String(preset.mix.sand),
    }));
  };

  // Changing the measurement unit must rescale the already-entered dimensions
  // so they keep meaning the same real-world size — otherwise the same
  // numbers get silently reinterpreted in the new unit (e.g. "8 ft" becomes
  // "8 cm") and the result collapses without any error being shown.
  const convertMeasurement = (rawValue, fromUnitId, toUnitId) => {
    const fromUnit = LENGTH_UNITS[fromUnitId];
    const toUnit = LENGTH_UNITS[toUnitId];
    const value = toNumber(rawValue);
    if (!fromUnit || !toUnit || !Number.isFinite(value)) return rawValue;
    const metres = value * fromUnit.toMetres;
    const converted = metres / toUnit.toMetres;
    return String(Math.round(converted * 1e6) / 1e6);
  };

  const changeUnit = (newUnitId) => {
    if (!LENGTH_UNITS[newUnitId]) return;
    setState((current) => ({
      ...current,
      unitId: newUnitId,
      length: convertMeasurement(current.length, current.unitId, newUnitId),
      width: convertMeasurement(current.width, current.unitId, newUnitId),
      height: convertMeasurement(current.height, current.unitId, newUnitId),
      headspace: convertMeasurement(current.headspace, current.unitId, newUnitId),
      fillerDepth: convertMeasurement(current.fillerDepth, current.unitId, newUnitId),
    }));
  };

  const mix = useMemo(
    () => ({
      soil: toNumber(state.soil),
      compost: toNumber(state.compost),
      cocopeat: toNumber(state.cocopeat),
      perlite: toNumber(state.perlite),
      sand: toNumber(state.sand),
    }),
    [state.soil, state.compost, state.cocopeat, state.perlite, state.sand],
  );

  const input = useMemo(
    () => ({
      beds: toNumber(state.beds),
      length: toNumber(state.length),
      width: toNumber(state.width),
      height: toNumber(state.height),
      headspace: toNumber(state.headspace),
      fillerDepth: toNumber(state.fillerDepth),
      unitId: state.unitId,
      settlementPercent: toNumber(state.settlementPercent),
      mix,
    }),
    [state, mix],
  );

  const result = useMemo(() => computeRaisedBedFill(input), [input]);
  const hasError = Boolean(result.error);

  const costing = useMemo(() => {
    if (hasError) return { lines: [], total: 0 };
    return costForComponents(result.components, {
      soil: toNumber(state.rateSoil),
      compost: toNumber(state.rateCompost),
      cocopeat: toNumber(state.rateCocopeat),
      perlite: toNumber(state.ratePerlite),
      sand: toNumber(state.rateSand),
    });
  }, [
    hasError,
    result.components,
    state.rateSoil,
    state.rateCompost,
    state.rateCocopeat,
    state.ratePerlite,
    state.rateSand,
  ]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Raised Bed Soil Calculator",
      `${num(input.beds)} bed(s) of ${num(input.length)} × ${num(input.width)} × ${num(input.height)} ${LENGTH_UNITS[input.unitId].label}`,
      `Mix needed: ${num0(result.totalOrderLitres)} litres (${num(result.totalOrderCubicFeet)} cu ft, ${num(result.totalOrderM3)} m³)`,
      `Approximate weight: ${num0(result.totalWeightKg)} kg`,
      "",
      "Shopping list:",
    ];
    for (const component of result.components) {
      const extra =
        component.soldBy === "block"
          ? `${num0(Math.ceil(component.blocks))} × ${COCOPEAT_BLOCK_KG} kg blocks`
          : component.soldBy === "weight"
            ? `${num0(component.kilograms)} kg`
            : `${num0(component.litres)} litres`;
      lines.push(`  ${component.label} (${num(component.percent)}%) — ${num0(component.litres)} L, ${extra}`);
    }
    if (costing.total > 0) lines.push(`Estimated cost: ${money(costing.total)}`);
    return lines.join("\n");
  }, [hasError, result, input, costing.total]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "Raised bed soil shopping list" });
  };

  const reset = () => {
    setState(DEFAULTS);
  };

  const unitLabel = LENGTH_UNITS[state.unitId]?.label ?? "";

  const breakdown = hasError
    ? []
    : [
        ["Bed footprint", `${num(result.bedAreaM2)} m² each`],
        ["Actual fill depth", `${num(result.fillDepthM * 100)} cm`],
        ["Mix per bed, before settling", `${num0(result.fillVolumeM3PerBed * 1000)} litres`],
        ["Extra for settling (total across all beds)", `${num0(result.settlementExtraLitres)} litres`],
        ["Total mix to order (all beds)", `${num0(result.totalOrderLitres)} litres`],
        ["Same volume in cubic feet", `${num(result.totalOrderCubicFeet)} cu ft`],
        ["Same volume in cubic metres", `${num(result.totalOrderM3)} m³`],
        ["Approximate delivered weight (all beds)", `${num0(result.totalWeightKg)} kg`],
        [
          "Bottom filler you can use instead (total across all beds)",
          `${num0(result.fillerVolumeLitresTotal)} litres`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Garden planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Raised Bed Soil Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          How much soil, compost, cocopeat and perlite a bed actually swallows — after headspace,
          bottom filler and the settling every fresh mix does in its first season.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The beds
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-unit">
              Measurement unit
            </label>
            <select
              id="rb-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.unitId}
              onChange={(event) => changeUnit(event.target.value)}
            >
              {Object.values(LENGTH_UNITS).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            id="rb-beds"
            label="How many beds"
            value={state.beds}
            onChange={set("beds")}
            min="1"
            max="200"
            step="1"
          />
          <Field
            id="rb-length"
            label={`Length (${unitLabel})`}
            value={state.length}
            onChange={set("length")}
            min="0"
            step="0.5"
          />
          <Field
            id="rb-width"
            label={`Width (${unitLabel})`}
            value={state.width}
            onChange={set("width")}
            min="0"
            step="0.5"
          />
          <Field
            id="rb-height"
            label={`Bed height (${unitLabel})`}
            value={state.height}
            onChange={set("height")}
            min="0"
            step="0.25"
          />
          <Field
            id="rb-headspace"
            label={`Headspace at the rim (${unitLabel})`}
            value={state.headspace}
            onChange={set("headspace")}
            min="0"
            step="0.05"
            hint="Leave 4-5 cm so watering does not wash mix over the side."
          />
          <Field
            id="rb-filler"
            label={`Bottom filler depth (${unitLabel})`}
            value={state.fillerDepth}
            onChange={set("fillerDepth")}
            min="0"
            step="0.25"
            hint="Logs, twigs and dry leaves in a deep bed. Leave at 0 if you are filling entirely with mix."
          />
          <Field
            id="rb-settle"
            label="Settling allowance (%)"
            value={state.settlementPercent}
            onChange={set("settlementPercent")}
            min="0"
            max="100"
            step="1"
            hint="Fresh compost and coir lose 10-20% of volume in the first season."
          />
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The mix
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rb-preset">
              Mix recipe
            </label>
            <select
              id="rb-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.presetId}
              onChange={(event) => choosePreset(event.target.value)}
            >
              {Object.values(MIX_PRESETS).map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {MIX_PRESETS[state.presetId]?.note}
            </p>
          </div>
          {Object.values(COMPONENTS).map((component) => (
            <Field
              key={component.id}
              id={`rb-mix-${component.id}`}
              label={`${component.label} (%)`}
              value={state[component.id]}
              onChange={(value) =>
                setState((current) => ({ ...current, presetId: "custom", [component.id]: value }))
              }
              min="0"
              max="100"
              step="1"
            />
          ))}
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Local rates (optional)
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            id="rb-rate-soil"
            label={`Garden soil (${RATE_UNIT.soil})`}
            value={state.rateSoil}
            onChange={set("rateSoil")}
            min="0"
            step="1"
          />
          <Field
            id="rb-rate-compost"
            label={`Compost (${RATE_UNIT.compost})`}
            value={state.rateCompost}
            onChange={set("rateCompost")}
            min="0"
            step="1"
          />
          <Field
            id="rb-rate-cocopeat"
            label={`Cocopeat (${RATE_UNIT.cocopeat})`}
            value={state.rateCocopeat}
            onChange={set("rateCocopeat")}
            min="0"
            step="10"
          />
          <Field
            id="rb-rate-perlite"
            label={`Perlite (${RATE_UNIT.perlite})`}
            value={state.ratePerlite}
            onChange={set("ratePerlite")}
            min="0"
            step="1"
          />
          <Field
            id="rb-rate-sand"
            label={`Coarse sand (${RATE_UNIT.sand})`}
            value={state.rateSand}
            onChange={set("rateSand")}
            min="0"
            step="1"
          />
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
              Total mix to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${num0(result.totalOrderLitres)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${num(result.totalOrderCubicFeet)} cu ft · about ${num0(result.totalWeightKg)} kg delivered`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">—</dd>
            </div>
          ) : (
            breakdown.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))
          )}
        </dl>
      </section>

      {!hasError && result.components.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shopping list</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Component</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Litres</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Buy</th>
                  <th scope="col" className="py-2 text-right font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {costing.lines.map((component) => (
                  <tr key={component.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {component.label}
                      <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                        {num(component.percent)}%
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{num0(component.litres)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {component.soldBy === "block"
                        ? `${num0(Math.ceil(component.blocks))} × ${COCOPEAT_BLOCK_KG} kg blocks`
                        : component.soldBy === "weight"
                          ? `${num0(component.kilograms)} kg`
                          : `${num0(component.litres)} L`}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {component.cost > 0 ? money(component.cost) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {costing.total > 0 && (
            <p className="mt-3 text-sm font-semibold">
              Estimated total at your rates: {money(costing.total)}
            </p>
          )}
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Cocopeat is sold compressed: one {COCOPEAT_BLOCK_KG} kg block expands to about{" "}
            {COCOPEAT_BLOCK_LITRES} litres once soaked, so buy by block count rather than by weight.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Weights use typical moist bulk densities and will vary with how wet the material is when it
        is delivered. Order a little over rather than under — topping up a half-filled bed later
        never blends as evenly as mixing it all at once.
      </p>
    </main>
  );
}
