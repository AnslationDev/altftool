"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";

import {
  COCOPEAT_BLOCK_KG,
  COCOPEAT_BLOCK_LITRES,
  COMPONENTS,
  LENGTH_UNITS,
  MIX_PRESETS,
  POT_SHAPES,
  computePottingMix,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const num0 = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  shapeId: "tapered",
  unitId: "cm",
  topDiameter: "30",
  bottomDiameter: "22",
  length: "60",
  width: "20",
  height: "28",
  headspace: "3",
  pots: "1",
  presetId: "general",
  soil: "2",
  compost: "1",
  cocopeat: "1",
  perlite: "0.5",
  sand: "0",
  scoopLitres: "5",
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
  const [copied, setCopied] = useState(false);

  const set = (key) => (value) => setState((current) => ({ ...current, [key]: value }));

  const choosePreset = (presetId) => {
    const preset = MIX_PRESETS[presetId];
    if (!preset) return;
    setState((current) => ({
      ...current,
      presetId,
      soil: String(preset.parts.soil),
      compost: String(preset.parts.compost),
      cocopeat: String(preset.parts.cocopeat),
      perlite: String(preset.parts.perlite),
      sand: String(preset.parts.sand),
    }));
  };

  const parts = useMemo(
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
      shapeId: state.shapeId,
      unitId: state.unitId,
      topDiameter: toNumber(state.topDiameter),
      bottomDiameter: toNumber(state.bottomDiameter),
      length: toNumber(state.length),
      width: toNumber(state.width),
      height: toNumber(state.height),
      headspace: toNumber(state.headspace),
      pots: toNumber(state.pots),
      scoopLitres: toNumber(state.scoopLitres),
      parts,
    }),
    [state, parts],
  );

  const result = useMemo(() => computePottingMix(input), [input]);
  const hasError = Boolean(result.error);
  const shape = POT_SHAPES[state.shapeId] ?? POT_SHAPES.tapered;
  const unitLabel = LENGTH_UNITS[state.unitId]?.label ?? "";

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Potting Mix Ratio Calculator",
      `${num(input.pots)} × ${shape.label}, holding ${num(result.litresPerPot)} litres of mix each`,
      `Ratio: ${result.ratioText}`,
      `Total mix: ${num(result.totalLitres)} litres (about ${num0(result.totalWeightKg)} kg)`,
      "",
      "Recipe:",
    ];
    for (const component of result.components) {
      const extra =
        component.soldBy === "block"
          ? `${num(component.blocks)} × ${COCOPEAT_BLOCK_KG} kg blocks`
          : component.soldBy === "weight"
            ? `${num(component.kilograms)} kg`
            : `${num(component.litres)} litres`;
      lines.push(
        `  ${component.label} — ${num(component.litres)} L (${num(component.scoops)} scoops, ${extra})`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, input.pots, shape.label]);

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
    setState(DEFAULTS);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Mix depth after headspace", `${num(result.fillHeight)} ${unitLabel}`],
        ["Mix each container holds", `${num(result.litresPerPot)} litres`],
        ["Containers", num(input.pots)],
        ["Total mix needed", `${num(result.totalLitres)} litres`],
        ["Total parts in the ratio", num(result.totalParts)],
        ["Approximate weight", `${num0(result.totalWeightKg)} kg`],
        ["Scoops of mix in total", `${num(result.totalScoops)} × ${num(input.scoopLitres)} L`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Garden planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Potting Mix Ratio Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the pot, pick a ratio, get litres and scoops of each ingredient — with the tapered
          pot measured as the truncated cone it actually is.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The container
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-shape">
              Container shape
            </label>
            <select
              id="pm-shape"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.shapeId}
              onChange={(event) => set("shapeId")(event.target.value)}
            >
              {Object.values(POT_SHAPES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{shape.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-unit">
              Measurement unit
            </label>
            <select
              id="pm-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.unitId}
              onChange={(event) => set("unitId")(event.target.value)}
            >
              {Object.values(LENGTH_UNITS).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {shape.fields.includes("topDiameter") && (
            <Field
              id="pm-top"
              label={`${state.shapeId === "cylinder" ? "Diameter" : "Rim diameter"} (${unitLabel})`}
              value={state.topDiameter}
              onChange={set("topDiameter")}
              min="0"
              step="1"
            />
          )}
          {shape.fields.includes("bottomDiameter") && (
            <Field
              id="pm-bottom"
              label={`Base diameter (${unitLabel})`}
              value={state.bottomDiameter}
              onChange={set("bottomDiameter")}
              min="0"
              step="1"
              hint="Measure the flat base, not the rim — this is what makes the volume smaller than it looks."
            />
          )}
          {shape.fields.includes("length") && (
            <Field
              id="pm-length"
              label={`Length (${unitLabel})`}
              value={state.length}
              onChange={set("length")}
              min="0"
              step="1"
            />
          )}
          {shape.fields.includes("width") && (
            <Field
              id="pm-width"
              label={`Width (${unitLabel})`}
              value={state.width}
              onChange={set("width")}
              min="0"
              step="1"
            />
          )}
          <Field
            id="pm-height"
            label={`Height (${unitLabel})`}
            value={state.height}
            onChange={set("height")}
            min="0"
            step="1"
          />
          <Field
            id="pm-headspace"
            label={`Headspace below the rim (${unitLabel})`}
            value={state.headspace}
            onChange={set("headspace")}
            min="0"
            step="0.5"
            hint="2-3 cm so water pools and soaks in rather than running off."
          />
          <Field
            id="pm-pots"
            label="How many containers"
            value={state.pots}
            onChange={set("pots")}
            min="1"
            max="1000"
            step="1"
          />
          <Field
            id="pm-scoop"
            label="Scoop or mug size (litres)"
            value={state.scoopLitres}
            onChange={set("scoopLitres")}
            min="0.1"
            step="0.5"
            hint="Whatever you mix with — a 5 litre paint tub is a handy scoop."
          />
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The ratio
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pm-preset">
              Mix recipe
            </label>
            <select
              id="pm-preset"
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
              id={`pm-part-${component.id}`}
              label={`${component.label} (parts)`}
              value={state[component.id]}
              onChange={(value) =>
                setState((current) => ({ ...current, presetId: "custom", [component.id]: value }))
              }
              min="0"
              step="0.5"
            />
          ))}
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
              Total mix needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${num(result.totalLitres)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${num(result.litresPerPot)} litres per container · ratio ${result.ratioText}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy potting mix recipe"
              className={GHOST_BTN}
              disabled={hasError}
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
          <h2 className="text-base font-semibold">The recipe</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Ingredient</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Parts</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Litres</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Scoops</th>
                  <th scope="col" className="py-2 text-right font-semibold">Buy</th>
                </tr>
              </thead>
              <tbody>
                {result.components.map((component) => (
                  <tr key={component.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {component.label}
                      <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                        {num0(component.percent)}%
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num(component.parts)}
                    </td>
                    <td className="py-2 pr-3 text-right">{num(component.litres)}</td>
                    <td className="py-2 pr-3 text-right">{num(component.scoops)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {component.soldBy === "block"
                        ? `${num(component.blocks)} blocks`
                        : component.soldBy === "weight"
                          ? `${num(component.kilograms)} kg`
                          : `${num(component.litres)} L`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Cocopeat is sold compressed — a {COCOPEAT_BLOCK_KG} kg block expands to roughly{" "}
            {COCOPEAT_BLOCK_LITRES} litres, so a single block usually covers several pots. Soak and
            fluff it before measuring, or the ratio will be wrong.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Mix everything dry-ish on a sheet before filling, and water thoroughly once potted so the
        coir wets evenly. Weights use typical moist bulk densities and vary with how wet the material
        is when you buy it.
      </p>
    </main>
  );
}
