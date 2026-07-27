"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { checkRoomComfort } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  temp: "30",
  rh: "70",
  useSurface: true,
  surface: "24",
  target: "55",
  volume: "40",
};

const PRESETS = [
  { label: "Muggy monsoon room", temp: "30", rh: "80" },
  { label: "AC bedroom", temp: "24", rh: "50" },
  { label: "Dry winter room", temp: "20", rh: "25" },
  { label: "Hot dry afternoon", temp: "38", rh: "25" },
];

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VERDICT_TEXT = {
  cold: "Too cold for sedentary comfort",
  cool: "A little below the comfort band",
  comfortable: "Inside the comfort band",
  warm: "A little above the comfort band",
  hot: "Too warm for sedentary comfort",
  dry: "Drier than the 30% to 60% band",
  humid: "Above the 60% comfort ceiling",
  "very humid": "Well above the comfort ceiling",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [rh, setRh] = useState(DEFAULTS.rh);
  const [useSurface, setUseSurface] = useState(DEFAULTS.useSurface);
  const [surface, setSurface] = useState(DEFAULTS.surface);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkRoomComfort({
        temperatureC: toNumber(temp),
        relativeHumidity: toNumber(rh),
        surfaceTempC: useSurface ? toNumber(surface) : undefined,
        targetHumidity: toNumber(target),
        roomVolumeM3: toNumber(volume),
      }),
    [temp, rh, useSurface, surface, target, volume],
  );

  const failed = Boolean(result.error);

  const warnings = failed
    ? []
    : [
        result.condensing && {
          id: "condense",
          tone: "danger",
          text: `Condensation is forming: the surface at ${num(result.surfaceTempC)} °C is at or below the ${num(result.dewPointC)} °C dew point.`,
        },
        !result.condensing &&
          result.hasSurface &&
          result.surfaceMarginC < 2 && {
            id: "near",
            tone: "danger",
            text: `Only ${num(result.surfaceMarginC)} °C between that surface and the dew point — it will mist over on a colder night.`,
          },
        result.mouldRisk && {
          id: "mould",
          tone: "danger",
          text: "Humidity is high enough for mould to establish on cool surfaces. Ventilate, and check behind wardrobes and along external walls.",
        },
        result.overAshraeLimit && {
          id: "ashrae",
          tone: "danger",
          text: `Moisture content is ${num(result.humidityRatioKgPerKg)} kg per kg of dry air, above the 0.012 kg/kg ceiling used in ASHRAE 55.`,
        },
        result.dustMiteRisk &&
          !result.mouldRisk && {
            id: "mites",
            tone: "warn",
            text: "Above about 50% RH, house dust mites can maintain their water balance — worth knowing if anyone in the room has allergies.",
          },
        result.tooDry && {
          id: "dry",
          tone: "warn",
          text: "Below 30% RH the air dries out airways, skin and timber furniture, and static becomes noticeable.",
        },
      ].filter(Boolean);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Room humidity check",
      `Air: ${num(result.temperatureC)} °C at ${num(result.relativeHumidity)}% RH`,
      `Dew point: ${num(result.dewPointC)} °C`,
      `Feels like: ${num(result.heatIndexC)} °C`,
      `Absolute humidity: ${num(result.absoluteHumidityGPerM3)} g/m³ · humidity ratio ${num(result.humidityRatioGPerKg)} g/kg`,
      `Comfort: ${VERDICT_TEXT[result.tempVerdict]}, ${VERDICT_TEXT[result.humidityVerdict]}`,
      result.hasSurface
        ? `Coldest surface ${num(result.surfaceTempC)} °C sits at ${num(result.surfaceRelativeHumidity)}% surface RH${result.condensing ? " — condensing" : ""}`
        : "No surface temperature entered",
      `To reach ${num(result.targetHumidity)}% RH: ${result.needsDrying ? "remove" : "add"} ${num(result.waterLitresMagnitude)} litres of water from this room's air`,
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
    setTemp(DEFAULTS.temp);
    setRh(DEFAULTS.rh);
    setUseSurface(DEFAULTS.useSurface);
    setSurface(DEFAULTS.surface);
    setTarget(DEFAULTS.target);
    setVolume(DEFAULTS.volume);
    setCopied(false);
  };

  const rows = [
    ["Dew point", failed ? DASH : `${num(result.dewPointC)} °C`],
    ["Feels like (heat index)", failed ? DASH : `${num(result.heatIndexC)} °C`],
    ["Difference from air temperature", failed ? DASH : `${num(result.heatIndexAbove)} °C`],
    ["Absolute humidity", failed ? DASH : `${num(result.absoluteHumidityGPerM3)} g per m³`],
    ["Humidity ratio", failed ? DASH : `${num(result.humidityRatioGPerKg)} g per kg dry air`],
    ["Saturation vapour pressure", failed ? DASH : `${num(result.saturationPressureHpa)} hPa`],
    ["Actual vapour pressure", failed ? DASH : `${num(result.vapourPressureHpa)} hPa`],
    ["Temperature verdict", failed ? DASH : VERDICT_TEXT[result.tempVerdict]],
    ["Humidity verdict", failed ? DASH : VERDICT_TEXT[result.humidityVerdict]],
    [
      "Coldest surface",
      failed || !result.hasSurface ? DASH : `${num(result.surfaceTempC)} °C`,
    ],
    [
      "Relative humidity at that surface",
      failed || !result.hasSurface ? DASH : `${num(result.surfaceRelativeHumidity)}%`,
    ],
    [
      "Margin above the dew point",
      failed || !result.hasSurface ? DASH : `${num(result.surfaceMarginC)} °C`,
    ],
    [
      "Water to reach the target",
      failed
        ? DASH
        : `${result.needsDrying ? "Remove" : "Add"} ${num(result.waterLitresMagnitude)} litres`,
    ],
    [
      "Or warm the air to",
      failed || !Number.isFinite(result.tempForTargetC) ? DASH : `${num(result.tempForTargetC)} °C`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Thermal comfort
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Room Humidity Comfort Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what your thermo-hygrometer reads and get the dew point, the apparent temperature and a
          straight answer on whether the room is inside the comfort band or heading for condensation.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Readings</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP}
              onClick={() => {
                setTemp(preset.temp);
                setRh(preset.rh);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rh-temp">
              Room temperature (°C)
            </label>
            <input
              id="rh-temp"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="-20"
              max="60"
              step="0.5"
              value={temp}
              onChange={(event) => setTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rh-rh">
              Relative humidity (%)
            </label>
            <input
              id="rh-rh"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={rh}
              onChange={(event) => setRh(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Condensation check</h2>
        <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input
            id="rh-usesurface"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={useSurface}
            onChange={(event) => setUseSurface(event.target.checked)}
          />
          Include a cold surface (window glass, external wall)
        </label>
        {useSurface && (
          <div className="mt-3">
            <label className={LABEL} htmlFor="rh-surface">
              Temperature of that surface (°C)
            </label>
            <input
              id="rh-surface"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="-40"
              max="60"
              step="0.5"
              value={surface}
              onChange={(event) => setSurface(event.target.value)}
            />
          </div>
        )}

        <h2 className="mt-6 text-base font-semibold">Target</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rh-target">
              Humidity you want (%)
            </label>
            <input
              id="rh-target"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rh-volume">
              Room volume (m³)
            </label>
            <input
              id="rh-volume"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Dew point
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num(result.dewPointC)} °C`}
            </p>
            <p
              className={`mt-1 text-sm ${
                failed
                  ? "text-[var(--muted-foreground)]"
                  : result.inComfortZone
                    ? "text-[var(--success)]"
                    : "text-[var(--muted-foreground)]"
              }`}
            >
              {failed
                ? "Fix the highlighted input to see a reading."
                : result.inComfortZone
                  ? "Temperature and humidity are both inside the comfort band"
                  : `${VERDICT_TEXT[result.tempVerdict]} · ${VERDICT_TEXT[result.humidityVerdict]}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the humidity reading"
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

        {warnings.length > 0 && (
          <ul className="mt-4 space-y-2">
            {warnings.map((warning) => (
              <li
                key={warning.id}
                className={`rounded-md px-3 py-2 text-sm ${
                  warning.tone === "danger"
                    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                {warning.text}
              </li>
            ))}
          </ul>
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
        Comfort bands follow ASHRAE 55 for lightly clothed, seated occupants and are informational. Damp
        and mould can affect health; if a room stays damp after ventilation and heating, get the cause
        investigated rather than treating the symptom.
      </p>
    </main>
  );
}
