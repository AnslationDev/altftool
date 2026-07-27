"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Crop, RotateCcw } from "lucide-react";

import { FOCAL_PRESETS, SENSOR_PRESETS, computeCropFactor } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DEG = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DEFAULTS = { sensorId: "aps-c-nikon", focalLength: "35", aperture: "1.8", iso: "400" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [sensorId, setSensorId] = useState(DEFAULTS.sensorId);
  const [focalLength, setFocalLength] = useState(DEFAULTS.focalLength);
  const [aperture, setAperture] = useState(DEFAULTS.aperture);
  const [iso, setIso] = useState(DEFAULTS.iso);
  const [copied, setCopied] = useState(false);

  const sensor = SENSOR_PRESETS.find((item) => item.id === sensorId) || SENSOR_PRESETS[0];

  const result = useMemo(
    () =>
      computeCropFactor({
        sensorWidth: sensor.width,
        sensorHeight: sensor.height,
        focalLength: focalLength.trim() === "" ? NaN : Number(focalLength),
        aperture: aperture.trim() === "" ? NaN : Number(aperture),
        iso: iso.trim() === "" ? NaN : Number(iso),
      }),
    [sensor, focalLength, aperture, iso],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const comparison = useMemo(
    () =>
      SENSOR_PRESETS.map((preset) => ({
        preset,
        row: computeCropFactor({
          sensorWidth: preset.width,
          sensorHeight: preset.height,
          focalLength: focalLength.trim() === "" ? NaN : Number(focalLength),
          aperture: aperture.trim() === "" ? NaN : Number(aperture),
          iso: iso.trim() === "" ? NaN : Number(iso),
        }),
      })).filter((entry) => !entry.row.error),
    [focalLength, aperture, iso],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Crop Factor Calculator",
      `Sensor: ${sensor.label} (diagonal ${NUM.format(result.diagonal)} mm)`,
      `Crop factor: ${NUM.format(result.cropFactor)}x`,
      `Lens: ${result.focalLength} mm f/${result.aperture} at ISO ${result.iso}`,
      `Full-frame equivalent: ${NUM.format(result.equivalentFocalLength)} mm, f/${NUM.format(result.equivalentAperture)}, ISO ${Math.round(result.equivalentIso)}`,
      `Angle of view: ${DEG.format(result.horizontalAov)} deg horizontal, ${DEG.format(result.diagonalAov)} deg diagonal`,
    ].join("\n");
  }, [hasError, result, sensor]);

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
    setSensorId(DEFAULTS.sensorId);
    setFocalLength(DEFAULTS.focalLength);
    setAperture(DEFAULTS.aperture);
    setIso(DEFAULTS.iso);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Crop className="h-4 w-4" aria-hidden="true" />
          Camera equivalence
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Crop Factor Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Crop factor is the 43.27 mm full-frame diagonal divided by your sensor&apos;s diagonal.
          Multiply focal length and f-number by it — and ISO by its square — to see what a full-frame
          camera would need to make the same photograph.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="crop-sensor">
              Sensor
            </label>
            <select
              id="crop-sensor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sensorId}
              onChange={(event) => setSensorId(event.target.value)}
            >
              {SENSOR_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crop-focal">
              Focal length (mm)
            </label>
            <input
              id="crop-focal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={focalLength}
              onChange={(event) => setFocalLength(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {FOCAL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFocalLength(String(preset))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset}mm
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="crop-ap">
                f-number
              </label>
              <input
                id="crop-ap"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.5"
                step="0.1"
                value={aperture}
                onChange={(event) => setAperture(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="crop-iso">
                ISO
              </label>
              <input
                id="crop-iso"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="6"
                step="100"
                value={iso}
                onChange={(event) => setIso(event.target.value)}
              />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Crop factor
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM.format(result.cropFactor)}×`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${result.focalLength} mm f/${result.aperture} behaves like ${NUM.format(result.equivalentFocalLength)} mm f/${NUM.format(result.equivalentAperture)} on full frame`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy crop factor result"
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
          {[
            ["Sensor diagonal", hasError ? dash : `${NUM.format(result.diagonal)} mm`],
            [
              "Equivalent focal length",
              hasError ? dash : `${NUM.format(result.equivalentFocalLength)} mm`,
            ],
            [
              "Equivalent f-number (depth of field)",
              hasError ? dash : `f/${NUM.format(result.equivalentAperture)}`,
            ],
            ["Equivalent ISO (total light)", hasError ? dash : NUM.format(result.equivalentIso)],
            [
              "Lens for a full-frame look",
              hasError
                ? dash
                : `${NUM.format(result.focalForFullFrameLook)} mm on this sensor frames like ${result.focalLength} mm on full frame`,
            ],
            ["Horizontal angle of view", hasError ? dash : `${DEG.format(result.horizontalAov)}°`],
            ["Vertical angle of view", hasError ? dash : `${DEG.format(result.verticalAov)}°`],
            ["Diagonal angle of view", hasError ? dash : `${DEG.format(result.diagonalAov)}°`],
            ["Sensor area vs full frame", hasError ? dash : `1 / ${NUM.format(result.areaRatio)}`],
            [
              "Light-gathering difference",
              hasError ? dash : `${NUM.format(result.lightStopsVsFullFrame)} stops`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The same lens on every format</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Crop</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Equiv. focal</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Equiv. f-number</th>
                <th scope="col" className="py-2 text-right font-semibold">Diagonal AoV</th>
              </tr>
            </thead>
            <tbody>
              {comparison.length === 0 ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2 text-right">{dash}</td>
                </tr>
              ) : (
                comparison.map(({ preset, row }) => (
                  <tr key={preset.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{preset.label}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.cropFactor)}×</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM.format(row.equivalentFocalLength)} mm
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      f/{NUM.format(row.equivalentAperture)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {DEG.format(row.diagonalAov)}°
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A lens does not change when you move it between bodies — its focal length and f-number stay
        the same, and so does the exposure at a given ISO. The equivalent figures describe what a
        full-frame camera would need to produce a matching image. Sensor dimensions vary slightly
        between models, so check your camera&apos;s specification for an exact figure.
      </p>
    </main>
  );
}
