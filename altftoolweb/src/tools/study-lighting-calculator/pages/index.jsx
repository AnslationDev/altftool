"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LampDesk, RotateCcw } from "lucide-react";

import {
  MAINTENANCE_FACTORS,
  REFLECTANCE_PRESETS,
  TASK_PRESETS,
  calculateStudyLighting,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);

const DEFAULTS = {
  unit: "ft",
  length: "12",
  width: "10",
  ceiling: "10",
  target: "500",
  ambient: "300",
  lumens: "2000",
  watts: "20",
  mf: "clean",
  reflect: "light",
  taskArea: "0.5",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [ceiling, setCeiling] = useState(DEFAULTS.ceiling);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [ambient, setAmbient] = useState(DEFAULTS.ambient);
  const [lumens, setLumens] = useState(DEFAULTS.lumens);
  const [watts, setWatts] = useState(DEFAULTS.watts);
  const [mf, setMf] = useState(DEFAULTS.mf);
  const [reflect, setReflect] = useState(DEFAULTS.reflect);
  const [taskArea, setTaskArea] = useState(DEFAULTS.taskArea);
  const [copied, setCopied] = useState(false);

  const maintenanceFactor =
    MAINTENANCE_FACTORS.find((item) => item.id === mf)?.value ?? MAINTENANCE_FACTORS[0].value;
  const reflectanceFactor =
    REFLECTANCE_PRESETS.find((item) => item.id === reflect)?.factor ?? REFLECTANCE_PRESETS[0].factor;

  const result = useMemo(
    () =>
      calculateStudyLighting({
        roomLength: toNumber(length),
        roomWidth: toNumber(width),
        ceilingHeight: toNumber(ceiling),
        unit,
        targetLux: toNumber(target),
        ambientLux: toNumber(ambient),
        luminaireLumens: toNumber(lumens),
        luminaireWatts: toNumber(watts),
        maintenanceFactor,
        reflectanceFactor,
        taskAreaSqm: toNumber(taskArea),
      }),
    [
      length,
      width,
      ceiling,
      unit,
      target,
      ambient,
      lumens,
      watts,
      maintenanceFactor,
      reflectanceFactor,
      taskArea,
    ],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Study lighting scheme (lumen method)",
      `Room: ${num(result.lengthM)} x ${num(result.widthM)} m, ceiling ${num(result.ceilingM)} m`,
      `Room index K: ${num(result.roomIndex)} · UF ${num(result.utilisationFactor)} · MF ${num(result.maintenanceFactor)}`,
      `Target on the desk: ${int(toNumber(target))} lux`,
      `Lumens needed: ${int(result.requiredLumensFull)}`,
      `Ceiling luminaires: ${result.luminaireCountFull} x ${int(toNumber(lumens))} lm = ${int(result.installedLumensFull)} lm`,
      `Delivered: ${int(result.achievedLuxFull)} lux · ${num(result.totalWattsFull)} W (${num(result.wattsPerSqmFull)} W/sqm)`,
      `Layout: ${result.gridRows} x ${result.gridCols} grid, ${num(result.spacingLengthM)} m x ${num(result.spacingWidthM)} m spacing`,
      `Low-energy option: ${result.luminaireCountAmbient} luminaires (${int(result.achievedAmbientLux)} lux) + a ${int(result.taskLampLumens)} lm desk lamp`,
    ].join("\n");
  }, [failed, result, target, lumens]);

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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setCeiling(DEFAULTS.ceiling);
    setTarget(DEFAULTS.target);
    setAmbient(DEFAULTS.ambient);
    setLumens(DEFAULTS.lumens);
    setWatts(DEFAULTS.watts);
    setMf(DEFAULTS.mf);
    setReflect(DEFAULTS.reflect);
    setTaskArea(DEFAULTS.taskArea);
    setCopied(false);
  };

  const rows = [
    ["Floor area", failed ? DASH : `${num(result.floorAreaSqm)} sqm`],
    ["Mounting height above desk", failed ? DASH : `${num(result.mountingHeightM)} m`],
    ["Room index K", failed ? DASH : num(result.roomIndex)],
    ["Utilisation factor", failed ? DASH : num(result.utilisationFactor)],
    ["Maintenance factor", failed ? DASH : num(result.maintenanceFactor)],
    ["Lumens required at the target", failed ? DASH : `${int(result.requiredLumensFull)} lm`],
    ["Luminaires to install", failed ? DASH : `${result.luminaireCountFull}`],
    ["Installed output", failed ? DASH : `${int(result.installedLumensFull)} lm`],
    ["Illuminance delivered", failed ? DASH : `${int(result.achievedLuxFull)} lux`],
    ["Connected load", failed ? DASH : `${num(result.totalWattsFull)} W`],
    ["Load density", failed ? DASH : `${num(result.wattsPerSqmFull)} W/sqm`],
    ["Ceiling grid", failed ? DASH : `${result.gridRows} rows x ${result.gridCols} columns`],
    [
      "Spacing between fittings",
      failed ? DASH : `${num(result.spacingLengthM)} m along length, ${num(result.spacingWidthM)} m across`,
    ],
    [
      "Offset from the walls",
      failed ? DASH : `${num(result.wallOffsetLengthM)} m and ${num(result.wallOffsetWidthM)} m`,
    ],
    [
      "Max spacing for even light",
      failed ? DASH : `${num(result.maxSpacingM)} m ${result.spacingOk ? "(within limit)" : "(grid too sparse)"}`,
    ],
    ["Ambient-only scheme", failed ? DASH : `${result.luminaireCountAmbient} luminaires, ${int(result.achievedAmbientLux)} lux`],
    ["Shortfall at the desk", failed ? DASH : `${int(result.deficitLux)} lux`],
    ["Desk lamp needed to close it", failed ? DASH : `${int(result.taskLampLumens)} lm`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <LampDesk className="h-4 w-4" aria-hidden="true" />
          Lighting design
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Study Lighting Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Size a study room to a real illuminance target using the lumen method: room index, utilisation
          factor, luminaire count, a spacing grid and the desk lamp you still need on top.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "ft", label: "Feet" },
            { id: "m", label: "Metres" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={unit === option.id}
              className={unit === option.id ? CHIP_ON : CHIP}
              onClick={() => setUnit(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sl-length">
              Room length ({unit})
            </label>
            <input
              id="sl-length"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sl-width">
              Room width ({unit})
            </label>
            <input
              id="sl-width"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sl-ceiling">
              Height of the fittings above the floor ({unit})
            </label>
            <input
              id="sl-ceiling"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={ceiling}
              onChange={(event) => setCeiling(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sl-taskarea">
              Task area on the desk (sqm)
            </label>
            <input
              id="sl-taskarea"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.05"
              step="0.05"
              value={taskArea}
              onChange={(event) => setTaskArea(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Illuminance target</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TASK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={CHIP}
              onClick={() => setTarget(String(preset.lux))}
            >
              {preset.label} · {preset.lux} lx
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sl-target">
              Maintained lux wanted on the desk
            </label>
            <input
              id="sl-target"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sl-ambient">
              Ambient lux from the ceiling alone
            </label>
            <input
              id="sl-ambient"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={ambient}
              onChange={(event) => setAmbient(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Luminaire and surfaces</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sl-lumens">
              Output of one luminaire (lm)
            </label>
            <input
              id="sl-lumens"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={lumens}
              onChange={(event) => setLumens(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sl-watts">
              Wattage of one luminaire (W)
            </label>
            <input
              id="sl-watts"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="1"
              value={watts}
              onChange={(event) => setWatts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sl-mf">
              Cleaning and dust level
            </label>
            <select
              id="sl-mf"
              className={FIELD}
              value={mf}
              onChange={(event) => setMf(event.target.value)}
            >
              {MAINTENANCE_FACTORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (MF {item.value})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="sl-reflect">
              Ceiling and wall finish
            </label>
            <select
              id="sl-reflect"
              className={FIELD}
              value={reflect}
              onChange={(event) => setReflect(event.target.value)}
            >
              {REFLECTANCE_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Ceiling luminaires needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.luminaireCountFull}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a scheme."
                : `${int(result.achievedLuxFull)} lux delivered on the desk plane at ${num(result.totalWattsFull)} W`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the lighting scheme"
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Put the desk lamp on the side away from your writing hand so the pen does not cast a shadow across
        the line, and keep the head about {result.taskLampHeightMm ?? 400} mm above the page. Facing a
        blank wall rather than a window avoids the glare that makes long study sessions tiring.
      </p>
    </main>
  );
}
