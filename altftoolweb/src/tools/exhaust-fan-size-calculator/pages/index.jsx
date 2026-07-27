"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fan, RotateCcw } from "lucide-react";

import { ROOM_TYPES, sizeExhaustFan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  length: "2.4",
  width: "1.8",
  height: "2.7",
  unit: "m",
  roomType: "bathroom",
  ductLength: "3",
  elbows: "2",
  toilet: "1",
  shower: "1",
  bathtub: "0",
  jettedTub: "0",
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
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [roomType, setRoomType] = useState(DEFAULTS.roomType);
  const [ductLength, setDuctLength] = useState(DEFAULTS.ductLength);
  const [elbows, setElbows] = useState(DEFAULTS.elbows);
  const [toilet, setToilet] = useState(DEFAULTS.toilet);
  const [shower, setShower] = useState(DEFAULTS.shower);
  const [bathtub, setBathtub] = useState(DEFAULTS.bathtub);
  const [jettedTub, setJettedTub] = useState(DEFAULTS.jettedTub);
  const [copied, setCopied] = useState(false);

  const showFixtures = ROOM_TYPES[roomType]?.usesFixtures ?? false;

  const result = useMemo(
    () =>
      sizeExhaustFan({
        length,
        width,
        height,
        unit,
        roomType,
        ductLength,
        elbows,
        fixtures: { toilet, shower, bathtub, jettedTub },
      }),
    [length, width, height, unit, roomType, ductLength, elbows, toilet, shower, bathtub, jettedTub],
  );

  const failed = Boolean(result.error);

  const fanLabel = failed
    ? DASH
    : result.oversized
      ? "Inline or centrifugal fan"
      : `${INT.format(result.fanMm)} mm (${result.fanInch}")`;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Exhaust Fan Size Calculator",
      `Room: ${result.roomLabel}, ${NUM.format(result.volumeM3)} m³ (${INT.format(result.volumeFt3)} ft³)`,
      `Design rate: ${result.ach} air changes per hour`,
      `Required airflow: ${INT.format(result.requiredCfm)} CFM (${INT.format(result.requiredM3h)} m³/h)`,
      `Governing rule: ${result.governing}`,
      `Duct allowance: x${NUM.format(result.lossFactor)}`,
      `Choose a fan rated at least: ${INT.format(result.ratedCfm)} CFM (${INT.format(result.ratedM3h)} m³/h)`,
      `Fan body size: ${result.oversized ? "inline / centrifugal — beyond domestic axial sizes" : `${result.fanMm} mm (${result.fanInch}")`}`,
      `Duct diameter: ${result.ductMm ? `${result.ductMm} mm (${result.ductInch}")` : "over 300 mm — size by duct design"}`,
      `One full air change takes ${NUM.format(result.airChangeMinutes)} minutes`,
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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setUnit(DEFAULTS.unit);
    setRoomType(DEFAULTS.roomType);
    setDuctLength(DEFAULTS.ductLength);
    setElbows(DEFAULTS.elbows);
    setToilet(DEFAULTS.toilet);
    setShower(DEFAULTS.shower);
    setBathtub(DEFAULTS.bathtub);
    setJettedTub(DEFAULTS.jettedTub);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Room volume", DASH],
        ["Air-change method", DASH],
        ["Fixture / minimum method", DASH],
        ["Required airflow", DASH],
        ["Governing rule", DASH],
        ["Duct resistance allowance", DASH],
        ["Fan body size", DASH],
        ["Duct diameter", DASH],
        ["Time for one air change", DASH],
      ]
    : [
        [
          "Room volume",
          `${NUM.format(result.volumeM3)} m³ (${INT.format(result.volumeFt3)} ft³)`,
        ],
        ["Air-change method", `${INT.format(result.achCfm)} CFM at ${result.ach} ACH`],
        ["Fixture / minimum method", `${INT.format(result.hviCfm)} CFM`],
        [
          "Required airflow",
          `${INT.format(result.requiredCfm)} CFM (${INT.format(result.requiredM3h)} m³/h)`,
        ],
        ["Governing rule", result.governing],
        ["Duct resistance allowance", `×${NUM.format(result.lossFactor)}`],
        ["Fan body size", fanLabel],
        [
          "Duct diameter",
          result.ductMm
            ? `${INT.format(result.ductMm)} mm (${result.ductInch}") — exact need ${NUM.format(result.exactDuctMm)} mm`
            : `over 300 mm — exact need ${NUM.format(result.exactDuctMm)} mm`,
        ],
        ["Time for one air change", `${NUM.format(result.airChangeMinutes)} min`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fan className="h-4 w-4" aria-hidden="true" />
          Ventilation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exhaust Fan Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sizes a bathroom or kitchen extractor from room volume and air changes per hour, checks it
          against the HVI and ASHRAE 62.2 minimums, then adds a duct-resistance allowance and picks
          the fan and duct diameter.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fan-room">
              Room type
            </label>
            <select
              id="fan-room"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roomType}
              onChange={(event) => setRoomType(event.target.value)}
            >
              {Object.values(ROOM_TYPES).map((room) => (
                <option key={room.key} value={room.key}>
                  {room.label} — {room.ach} ACH
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-unit">
              Dimension unit
            </label>
            <select
              id="fan-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="m">Metres</option>
              <option value="ft">Feet</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-length">
              Room length ({unit})
            </label>
            <input
              id="fan-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-width">
              Room width ({unit})
            </label>
            <input
              id="fan-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-height">
              Ceiling height ({unit})
            </label>
            <input
              id="fan-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-duct">
              Duct run length (m)
            </label>
            <input
              id="fan-duct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={ductLength}
              onChange={(event) => setDuctLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fan-elbows">
              Number of 90° bends
            </label>
            <input
              id="fan-elbows"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="12"
              step="1"
              value={elbows}
              onChange={(event) => setElbows(event.target.value)}
            />
          </div>
        </div>

        {showFixtures && (
          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <p className="text-sm font-semibold">Fixtures</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Used only when the room is larger than 100 ft² (9.3 m²), where HVI switches to a
              per-fixture allowance.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {[
                ["fan-toilet", "Toilets (50 CFM each)", toilet, setToilet],
                ["fan-shower", "Showers (50 CFM each)", shower, setShower],
                ["fan-bath", "Bathtubs (50 CFM each)", bathtub, setBathtub],
                ["fan-jet", "Jetted tubs (100 CFM each)", jettedTub, setJettedTub],
              ].map(([id, label, value, setter]) => (
                <div key={id}>
                  <label className={LABEL_CLASS} htmlFor={id}>
                    {label}
                  </label>
                  <input
                    id={id}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="10"
                    step="1"
                    value={value}
                    onChange={(event) => setter(event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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
              Buy a fan rated at least
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${INT.format(result.ratedCfm)} CFM`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a size."
                : `${INT.format(result.ratedM3h)} m³/h — includes the duct allowance`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy exhaust fan sizing result"
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational sizing only — your local building code may set a higher minimum, and a fan is
        only as good as its duct: keep the run short, rigid and sloped to the outside, and never
        terminate it in a roof space. Run a bathroom fan for about 20 minutes after a shower.
      </p>
    </main>
  );
}
